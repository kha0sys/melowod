'use client';

import { useState } from 'react';
import { Trophy, Award, Calendar, TrendingUp } from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';
import { LevelProgress } from '@/components/ui/LevelProgress';
import { AchievementCard } from '@/components/ui/AchievementCard';
import { useReward } from 'react-rewards';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('stats');
  const { points, level, achievements } = useGamification();
  const { reward: confettiReward } = useReward('confettiReward', 'confetti');

  const userStats = {
    totalWods: 156,
    avgTime: '12:45',
    bestRank: 3,
    consistency: '85%',
  };

  const recentWods = [
    {
      date: '2024-01-09',
      name: 'Fran',
      time: '3:45',
      rank: 15,
    },
    // Añadir más WODs aquí
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Perfil Header */}
      <div className="flex flex-col md:flex-row items-center mb-8 space-y-4 md:space-y-0 md:space-x-8">
        <div className="w-32 h-32 bg-secondary rounded-full flex items-center justify-center">
          <span className="text-4xl">👤</span>
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Juan Pérez</h1>
          <p className="text-gray-500">CrossFit Bogotá</p>
          <div className="mt-4">
            <LevelProgress />
          </div>
        </div>
        <div className="text-center">
          <span id="confettiReward" />
          <div className="text-3xl font-bold text-primary">{points}</div>
          <div className="text-sm text-gray-500">Puntos Totales</div>
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-background border rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-primary" />
            <span className="font-medium">Total WODs</span>
          </div>
          <p className="text-2xl font-bold mt-2">{userStats.totalWods}</p>
        </div>
        <div className="bg-background border rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="font-medium">Tiempo Promedio</span>
          </div>
          <p className="text-2xl font-bold mt-2">{userStats.avgTime}</p>
        </div>
        <div className="bg-background border rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-primary" />
            <span className="font-medium">Mejor Ranking</span>
          </div>
          <p className="text-2xl font-bold mt-2">#{userStats.bestRank}</p>
        </div>
        <div className="bg-background border rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="font-medium">Consistencia</span>
          </div>
          <p className="text-2xl font-bold mt-2">{userStats.consistency}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b mb-8">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('stats')}
            className={`pb-4 font-medium ${
              activeTab === 'stats'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500'
            }`}
          >
            Estadísticas
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`pb-4 font-medium ${
              activeTab === 'achievements'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500'
            }`}
          >
            Logros
          </button>
        </div>
      </div>

      {/* Contenido de las Tabs */}
      {activeTab === 'stats' ? (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold mb-4">WODs Recientes</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-secondary">
                    <th className="p-4 text-left">Fecha</th>
                    <th className="p-4 text-left">WOD</th>
                    <th className="p-4 text-left">Tiempo</th>
                    <th className="p-4 text-left">Ranking</th>
                  </tr>
                </thead>
                <tbody>
                  {recentWods.map((wod, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-4">{wod.date}</td>
                      <td className="p-4">{wod.name}</td>
                      <td className="p-4 font-mono">{wod.time}</td>
                      <td className="p-4">#{wod.rank}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              title={achievement.title}
              description={achievement.description}
              icon={achievement.icon}
              unlockedAt={achievement.unlockedAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
