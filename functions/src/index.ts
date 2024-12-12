import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

// Tipos
interface WodResult {
  userId: string;
  wodId: string;
  score: number;
  level: 'rx' | 'scaled' | 'beginner';
  mediaUrls?: string[];
  notes?: string;
}

interface UserStats {
  totalWods: number;
  completedWods: number;
  points: number;
  rxCount: number;
  scaledCount: number;
  beginnerCount: number;
  lastUpdated: admin.firestore.Timestamp;
}

// Función para calcular puntos
function calculatePoints(result: WodResult): number {
  let points = 10; // Puntos base

  switch (result.level) {
    case 'rx':
      points *= 1.5;
      break;
    case 'scaled':
      points *= 1.2;
      break;
    case 'beginner':
      points *= 1.0;
      break;
  }

  return Math.round(points);
}

// Trigger cuando se crea un nuevo resultado de WOD
export const onWodResultCreated = functions.firestore
  .document('wodResults/{resultId}')
  .onCreate(async (snap, context) => {
    const result = snap.data() as WodResult;
    const userStatsRef = db.collection('userStats').doc(result.userId);
    const points = calculatePoints(result);

    try {
      await db.runTransaction(async (transaction) => {
        const statsDoc = await transaction.get(userStatsRef);
        const currentStats = statsDoc.exists ? statsDoc.data() as UserStats : {
          totalWods: 0,
          completedWods: 0,
          points: 0,
          rxCount: 0,
          scaledCount: 0,
          beginnerCount: 0,
          lastUpdated: admin.firestore.Timestamp.now(),
        };

        // Actualizar contadores
        currentStats.totalWods += 1;
        currentStats.completedWods += 1;
        currentStats.points += points;

        // Actualizar contadores por nivel
        switch (result.level) {
          case 'rx':
            currentStats.rxCount += 1;
            break;
          case 'scaled':
            currentStats.scaledCount += 1;
            break;
          case 'beginner':
            currentStats.beginnerCount += 1;
            break;
        }

        currentStats.lastUpdated = admin.firestore.Timestamp.now();

        transaction.set(userStatsRef, currentStats, { merge: true });
      });
    } catch (error) {
      console.error('Error updating user stats:', error);
      throw error;
    }
  });

// Función programada para calcular rankings diarios
export const calculateDailyRankings = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      // Obtener todos los resultados de ayer
      const resultsSnapshot = await db.collection('wodResults')
        .where('createdAt', '>=', yesterday)
        .where('createdAt', '<', today)
        .get();

      // Agrupar resultados por WOD y nivel
      const rankings: { [key: string]: { [level: string]: any[] } } = {};

      resultsSnapshot.forEach((doc) => {
        const result = doc.data() as WodResult;
        if (!rankings[result.wodId]) {
          rankings[result.wodId] = {
            rx: [],
            scaled: [],
            beginner: [],
          };
        }
        rankings[result.wodId][result.level].push({
          ...result,
          points: calculatePoints(result),
        });
      });

      // Guardar rankings
      const rankingsRef = db.collection('rankings').doc(yesterday.toISOString().split('T')[0]);
      await rankingsRef.set(rankings);

      return null;
    } catch (error) {
      console.error('Error calculating daily rankings:', error);
      throw error;
    }
  });

// Función para limpiar archivos antiguos de Storage
export const cleanupOldFiles = functions.pubsub
  .schedule('0 0 * * 0') // Cada domingo a medianoche
  .timeZone('America/New_York')
  .onRun(async (context) => {
    const bucket = admin.storage().bucket();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      const [files] = await bucket.getFiles();
      const deletionPromises = files
        .filter((file) => {
          const metadata = file.metadata as any;
          return metadata.timeCreated && new Date(metadata.timeCreated) < thirtyDaysAgo;
        })
        .map((file) => file.delete());

      await Promise.all(deletionPromises);
      return null;
    } catch (error) {
      console.error('Error cleaning up old files:', error);
      throw error;
    }
  });
