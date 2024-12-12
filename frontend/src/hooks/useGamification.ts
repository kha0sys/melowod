import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, updateDoc, increment, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { ErrorHandler } from '@/lib/utils/error-handler';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirements: {
    type: 'wod_count' | 'streak' | 'pr' | 'ranking' | 'custom';
    value: number;
    metadata?: Record<string, any>;
  };
  unlockedAt?: Date;
}

interface Streak {
  current: number;
  longest: number;
  lastWorkoutDate: Date | null;
}

interface Level {
  current: number;
  experience: number;
  nextLevelExperience: number;
  title: string;
}

interface GamificationStats {
  totalWods: number;
  totalPRs: number;
  bestRanking: number;
  completionRate: number;
  averageIntensity: number;
  favoriteWorkoutTypes: Record<string, number>;
  weeklyProgress: {
    wods: number;
    points: number;
    startDate: Date;
  };
}

interface GamificationState {
  userId: string | null;
  points: number;
  level: Level;
  experience: number;
  achievements: Achievement[];
  streak: Streak;
  stats: GamificationStats;
  initialized: boolean;
  loading: boolean;
  error: Error | null;
  
  // Actions
  initialize: (userId: string) => Promise<void>;
  addPoints: (points: number, reason: string) => Promise<void>;
  unlockAchievement: (achievementId: string) => Promise<void>;
  updateStreak: (workoutDate: Date) => Promise<void>;
  recordWorkout: (workout: any) => Promise<void>;
  checkAchievements: () => Promise<Achievement[]>;
}

const POINTS_PER_LEVEL = 100;
const STREAK_BONUS_MULTIPLIER = 0.1; // 10% bonus per day in streak
const MAX_STREAK_BONUS = 2; // Maximum 2x multiplier

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_wod',
    title: 'Primer WOD',
    description: 'Completaste tu primer WOD',
    icon: '🎯',
    points: 50,
    rarity: 'common',
    requirements: {
      type: 'wod_count',
      value: 1
    }
  },
  {
    id: 'consistency_week',
    title: 'Consistencia Semanal',
    description: 'Completaste WODs 5 días seguidos',
    icon: '📅',
    points: 100,
    rarity: 'rare',
    requirements: {
      type: 'streak',
      value: 5
    }
  },
  {
    id: 'consistency_month',
    title: 'Máquina del Mes',
    description: 'Completaste WODs 20 días en un mes',
    icon: '🎖️',
    points: 250,
    rarity: 'epic',
    requirements: {
      type: 'wod_count',
      value: 20,
      metadata: {
        timeframe: 'month'
      }
    }
  },
  {
    id: 'pr_master',
    title: 'Maestro de PRs',
    description: 'Estableciste 10 récords personales',
    icon: '💪',
    points: 200,
    rarity: 'rare',
    requirements: {
      type: 'pr',
      value: 10
    }
  },
  {
    id: 'elite_athlete',
    title: 'Atleta Elite',
    description: 'Alcanzaste el top 3 en un WOD',
    icon: '🏆',
    points: 500,
    rarity: 'legendary',
    requirements: {
      type: 'ranking',
      value: 3
    }
  }
];

const LEVEL_TITLES = [
  'Novato',
  'Principiante',
  'Intermedio',
  'Avanzado',
  'Elite',
  'Maestro',
  'Leyenda'
];

export const useGamification = create<GamificationState>()(
  persist(
    (set, get) => ({
      userId: null,
      points: 0,
      level: {
        current: 1,
        experience: 0,
        nextLevelExperience: POINTS_PER_LEVEL,
        title: LEVEL_TITLES[0]
      },
      experience: 0,
      achievements: [],
      streak: {
        current: 0,
        longest: 0,
        lastWorkoutDate: null
      },
      stats: {
        totalWods: 0,
        totalPRs: 0,
        bestRanking: Infinity,
        completionRate: 0,
        averageIntensity: 0,
        favoriteWorkoutTypes: {},
        weeklyProgress: {
          wods: 0,
          points: 0,
          startDate: new Date()
        }
      },
      initialized: false,
      loading: false,
      error: null,

      initialize: async (userId: string) => {
        try {
          set({ loading: true, error: null });

          // Load user's gamification data from Firestore
          const docRef = doc(db, 'users', userId, 'gamification', 'stats');
          const docSnap = await docRef.get();

          if (docSnap.exists()) {
            const data = docSnap.data();
            set({
              userId,
              ...data,
              initialized: true
            });
          } else {
            // Initialize new user
            await docRef.set({
              points: 0,
              level: {
                current: 1,
                experience: 0,
                nextLevelExperience: POINTS_PER_LEVEL,
                title: LEVEL_TITLES[0]
              },
              achievements: [],
              streak: {
                current: 0,
                longest: 0,
                lastWorkoutDate: null
              },
              stats: {
                totalWods: 0,
                totalPRs: 0,
                bestRanking: Infinity,
                completionRate: 0,
                averageIntensity: 0,
                favoriteWorkoutTypes: {},
                weeklyProgress: {
                  wods: 0,
                  points: 0,
                  startDate: serverTimestamp()
                }
              }
            });
            set({
              userId,
              initialized: true
            });
          }
        } catch (error) {
          set({ error: ErrorHandler.handle(error) });
        } finally {
          set({ loading: false });
        }
      },

      addPoints: async (points: number, reason: string) => {
        const state = get();
        if (!state.userId) return;

        try {
          // Apply streak bonus
          const streakBonus = Math.min(
            1 + (state.streak.current * STREAK_BONUS_MULTIPLIER),
            MAX_STREAK_BONUS
          );
          const totalPoints = Math.round(points * streakBonus);

          const newExperience = state.experience + totalPoints;
          const newLevel = Math.floor(newExperience / POINTS_PER_LEVEL) + 1;
          const nextLevelExperience = newLevel * POINTS_PER_LEVEL;

          // Update local state
          set(state => ({
            points: state.points + totalPoints,
            experience: newExperience,
            level: {
              current: newLevel,
              experience: newExperience,
              nextLevelExperience,
              title: LEVEL_TITLES[Math.min(newLevel - 1, LEVEL_TITLES.length - 1)]
            }
          }));

          // Update Firestore
          const docRef = doc(db, 'users', state.userId, 'gamification', 'stats');
          await updateDoc(docRef, {
            points: increment(totalPoints),
            experience: increment(totalPoints),
            level: {
              current: newLevel,
              experience: newExperience,
              nextLevelExperience,
              title: LEVEL_TITLES[Math.min(newLevel - 1, LEVEL_TITLES.length - 1)]
            },
            'stats.weeklyProgress.points': increment(totalPoints),
            pointsHistory: arrayUnion({
              amount: totalPoints,
              reason,
              timestamp: serverTimestamp(),
              streakBonus
            })
          });

          // Check for new achievements
          await get().checkAchievements();
        } catch (error) {
          set({ error: ErrorHandler.handle(error) });
        }
      },

      unlockAchievement: async (achievementId: string) => {
        const state = get();
        if (!state.userId) return;

        const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
        if (!achievement || state.achievements.some(a => a.id === achievementId)) {
          return;
        }

        try {
          const unlockedAchievement = {
            ...achievement,
            unlockedAt: new Date()
          };

          // Update local state
          set(state => ({
            achievements: [...state.achievements, unlockedAchievement]
          }));

          // Update Firestore
          const docRef = doc(db, 'users', state.userId, 'gamification', 'stats');
          await updateDoc(docRef, {
            achievements: arrayUnion(unlockedAchievement)
          });

          // Award achievement points
          await get().addPoints(achievement.points, `Achievement: ${achievement.title}`);
        } catch (error) {
          set({ error: ErrorHandler.handle(error) });
        }
      },

      updateStreak: async (workoutDate: Date) => {
        const state = get();
        if (!state.userId) return;

        try {
          const lastWorkout = state.streak.lastWorkoutDate;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          workoutDate.setHours(0, 0, 0, 0);

          let newStreak = state.streak.current;
          
          if (!lastWorkout || workoutDate.getTime() === today.getTime()) {
            newStreak++;
          } else if (
            (workoutDate.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24) > 1
          ) {
            newStreak = 1;
          }

          const newLongest = Math.max(newStreak, state.streak.longest);

          // Update local state
          set(state => ({
            streak: {
              current: newStreak,
              longest: newLongest,
              lastWorkoutDate: workoutDate
            }
          }));

          // Update Firestore
          const docRef = doc(db, 'users', state.userId, 'gamification', 'stats');
          await updateDoc(docRef, {
            streak: {
              current: newStreak,
              longest: newLongest,
              lastWorkoutDate: workoutDate
            }
          });

          // Check streak-based achievements
          await get().checkAchievements();
        } catch (error) {
          set({ error: ErrorHandler.handle(error) });
        }
      },

      recordWorkout: async (workout: any) => {
        const state = get();
        if (!state.userId) return;

        try {
          // Update stats
          const newStats = {
            ...state.stats,
            totalWods: state.stats.totalWods + 1,
            favoriteWorkoutTypes: {
              ...state.stats.favoriteWorkoutTypes,
              [workout.type]: (state.stats.favoriteWorkoutTypes[workout.type] || 0) + 1
            },
            weeklyProgress: {
              ...state.stats.weeklyProgress,
              wods: state.stats.weeklyProgress.wods + 1
            }
          };

          // Update local state
          set({ stats: newStats });

          // Update Firestore
          const docRef = doc(db, 'users', state.userId, 'gamification', 'stats');
          await updateDoc(docRef, {
            'stats.totalWods': increment(1),
            [`stats.favoriteWorkoutTypes.${workout.type}`]: increment(1),
            'stats.weeklyProgress.wods': increment(1)
          });

          // Update streak
          await get().updateStreak(new Date());

          // Award points based on workout completion
          await get().addPoints(50, 'Workout Completion');

          // Check for new achievements
          await get().checkAchievements();
        } catch (error) {
          set({ error: ErrorHandler.handle(error) });
        }
      },

      checkAchievements: async () => {
        const state = get();
        if (!state.userId) return [];

        const unlockedAchievements: Achievement[] = [];

        try {
          for (const achievement of ACHIEVEMENTS) {
            if (state.achievements.some(a => a.id === achievement.id)) {
              continue;
            }

            let requirementMet = false;

            switch (achievement.requirements.type) {
              case 'wod_count':
                requirementMet = state.stats.totalWods >= achievement.requirements.value;
                break;
              case 'streak':
                requirementMet = state.streak.current >= achievement.requirements.value;
                break;
              case 'pr':
                requirementMet = state.stats.totalPRs >= achievement.requirements.value;
                break;
              case 'ranking':
                requirementMet = state.stats.bestRanking <= achievement.requirements.value;
                break;
            }

            if (requirementMet) {
              await get().unlockAchievement(achievement.id);
              unlockedAchievements.push(achievement);
            }
          }

          return unlockedAchievements;
        } catch (error) {
          set({ error: ErrorHandler.handle(error) });
          return [];
        }
      }
    }),
    {
      name: 'gamification-storage',
      partialize: (state) => ({
        points: state.points,
        level: state.level,
        achievements: state.achievements,
        streak: state.streak,
        stats: state.stats
      })
    }
  )
);
