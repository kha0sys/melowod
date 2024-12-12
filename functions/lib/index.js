"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupOldFiles = exports.calculateDailyRankings = exports.onWodResultCreated = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
const db = admin.firestore();
// Función para calcular puntos
function calculatePoints(result) {
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
exports.onWodResultCreated = functions.firestore
    .document('wodResults/{resultId}')
    .onCreate(async (snap, context) => {
    const result = snap.data();
    const userStatsRef = db.collection('userStats').doc(result.userId);
    const points = calculatePoints(result);
    try {
        await db.runTransaction(async (transaction) => {
            const statsDoc = await transaction.get(userStatsRef);
            const currentStats = statsDoc.exists ? statsDoc.data() : {
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
    }
    catch (error) {
        console.error('Error updating user stats:', error);
        throw error;
    }
});
// Función programada para calcular rankings diarios
exports.calculateDailyRankings = functions.pubsub
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
        const rankings = {};
        resultsSnapshot.forEach((doc) => {
            const result = doc.data();
            if (!rankings[result.wodId]) {
                rankings[result.wodId] = {
                    rx: [],
                    scaled: [],
                    beginner: [],
                };
            }
            rankings[result.wodId][result.level].push(Object.assign(Object.assign({}, result), { points: calculatePoints(result) }));
        });
        // Guardar rankings
        const rankingsRef = db.collection('rankings').doc(yesterday.toISOString().split('T')[0]);
        await rankingsRef.set(rankings);
        return null;
    }
    catch (error) {
        console.error('Error calculating daily rankings:', error);
        throw error;
    }
});
// Función para limpiar archivos antiguos de Storage
exports.cleanupOldFiles = functions.pubsub
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
            const metadata = file.metadata;
            return metadata.timeCreated && new Date(metadata.timeCreated) < thirtyDaysAgo;
        })
            .map((file) => file.delete());
        await Promise.all(deletionPromises);
        return null;
    }
    catch (error) {
        console.error('Error cleaning up old files:', error);
        throw error;
    }
});
//# sourceMappingURL=index.js.map