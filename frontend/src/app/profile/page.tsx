'use client';

import { useState } from 'react';
import { Trophy, Award, Calendar, TrendingUp } from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';
import { LevelProgress } from '@/components/ui/LevelProgress';
import { AchievementCard } from '@/components/ui/AchievementCard';
import { useReward } from 'react-rewards';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date | null;
}

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
      <Tabs defaultValue="stats">
        <TabsList className="border-b w-full justify-start">
          <TabsTrigger value="stats" className="border-b-2 border-transparent data-[state=active]:border-primary">
            Estadísticas
          </TabsTrigger>
          <TabsTrigger value="achievements" className="border-b-2 border-transparent data-[state=active]:border-primary">
            Logros
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-8">
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Historial de WODs</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full" role="table">
                <thead>
                  <tr className="bg-secondary" role="row">
                    <th scope="col" className="px-6 py-3 text-left text-sm font-semibold">
                      Fecha
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-sm font-semibold">
                      WOD
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-sm font-semibold">
                      Resultado
                    </th>
                  </tr>
                </thead>
                <tbody role="rowgroup">
                  {recentWods.map((wod, index) => (
                    <tr 
                      key={wod.date || index} 
                      className="border-b hover:bg-gray-50 transition-colors"
                      role="row"
                    >
                      <td className="px-6 py-4 text-sm">
                        {wod.date}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium">{wod.name}</span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {wod.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="achievements">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                title={achievement.title}
                description={achievement.description}
                icon={achievement.icon}
                unlockedAt={achievement.unlockedAt || undefined}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
