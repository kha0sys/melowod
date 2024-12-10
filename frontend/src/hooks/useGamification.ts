import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

interface GamificationState {
  points: number;
  level: number;
  experience: number;
  achievements: Achievement[];
  addPoints: (points: number) => void;
  unlockAchievement: (achievementId: string) => void;
}

const POINTS_PER_LEVEL = 100;
const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_wod',
    title: 'Primer WOD',
    description: 'Completaste tu primer WOD',
    icon: '🎯',
  },
  {
    id: 'consistency_week',
    title: 'Consistencia Semanal',
    description: 'Completaste WODs 5 días seguidos',
    icon: '📅',
  },
  {
    id: 'top_10',
    title: 'Top 10',
    description: 'Alcanzaste el top 10 en un WOD',
    icon: '🏆',
  },
  {
    id: 'rx_master',
    title: 'Maestro RX',
    description: 'Completaste 10 WODs en nivel RX',
    icon: '💪',
  },
];

export const useGamification = create<GamificationState>()(
  persist(
    (set) => ({
      points: 0,
      level: 1,
      experience: 0,
      achievements: ACHIEVEMENTS,

      addPoints: (points: number) =>
        set((state) => {
          const newExperience = state.experience + points;
          const newLevel = Math.floor(newExperience / POINTS_PER_LEVEL) + 1;
          
          return {
            points: state.points + points,
            level: newLevel,
            experience: newExperience,
          };
        }),

      unlockAchievement: (achievementId: string) =>
        set((state) => ({
          achievements: state.achievements.map((achievement) =>
            achievement.id === achievementId && !achievement.unlockedAt
              ? { ...achievement, unlockedAt: new Date() }
              : achievement
          ),
          points: state.points + 50, // Bonus points for achievement
        })),
    }),
    {
      name: 'gamification-storage',
    }
  )
);
