'use client';

import { useState } from 'react';
import { useGamification } from '@/hooks/useGamification';
import confetti from 'canvas-confetti';
import { useFirestoreDoc } from '@/hooks/useFirestore';
import { formatDate } from '@/lib/utils';
import { Wod } from '@/types/wod';
import { TrackingCard } from '@/components/tracking/TrackingCard';

export default function WodPage() {
  const [selectedLevel, setSelectedLevel] = useState<'rx' | 'advanced' | 'intermediate' | 'beginner'>('rx');
  const [result, setResult] = useState('');
  const { addPoints, unlockAchievement } = useGamification();

  // Usar el hook de caché para obtener el WOD del día
  const today = formatDate(new Date());
  const { data: wodData, loading: wodLoading } = useFirestoreDoc<Wod>(`wods/${today}`, {
    expiresIn: 5 * 60 * 1000, // 5 minutos de caché
  });

  const levels = {
    rx: {
      title: 'RX',
      description: wodData?.rx || 'Cargando...',
      points: 100,
      imageUrl: '/images/rx.jpg'
    },
    advanced: {
      title: 'Avanzado',
      description: wodData?.advanced || 'Cargando...',
      points: 80,
      imageUrl: '/images/advanced.jpg'
    },
    intermediate: {
      title: 'Intermedio',
      description: wodData?.intermediate || 'Cargando...',
      points: 60,
      imageUrl: '/images/intermediate.jpg'
    },
    beginner: {
      title: 'Principiante',
      description: wodData?.beginner || 'Cargando...',
      points: 40,
      imageUrl: '/images/beginner.jpg'
    },
  };

  const handleComplete = () => {
    // Añadir puntos basados en el nivel
    const basePoints = levels[selectedLevel].points;
    addPoints(basePoints, `Completar WOD en nivel ${selectedLevel}`);

    // Desbloquear logros
    if (selectedLevel === 'rx') {
      unlockAchievement('rx_master');
    }
    unlockAchievement('first_wod');

    // Mostrar celebración
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">WOD del Día</h1>
      
      {/* Niveles de dificultad */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8" role="radiogroup" aria-label="Nivel de dificultad">
        {Object.entries(levels).map(([key, value]) => {
          const isSelected = selectedLevel === key;
          return (
            <label
              key={key}
              className={`p-4 rounded-lg border ${
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background hover:bg-secondary'
              } cursor-pointer`}
            >
              <input
                type="radio"
                name="difficulty"
                value={key}
                checked={isSelected}
                onChange={() => setSelectedLevel(key as keyof typeof levels)}
                className="sr-only"
              />
              <h3 className="font-bold mb-2">{value.title}</h3>
              <div className="text-sm opacity-75">+{value.points} puntos</div>
            </label>
          );
        })}
      </div>

      {/* Tarjeta de seguimiento */}
      <TrackingCard
        title={levels[selectedLevel].title}
        description={levels[selectedLevel].description}
        imageUrl={levels[selectedLevel].imageUrl}
        points={levels[selectedLevel].points}
        onComplete={handleComplete}
        className="mb-8"
      />

      {/* Registro de resultado */}
      <div className="bg-background border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Notas Adicionales</h2>
        <textarea
          value={result}
          onChange={(e) => setResult(e.target.value)}
          placeholder="Notas adicionales sobre tu WOD..."
          className="w-full p-2 border rounded-md mb-4 bg-background"
          rows={4}
          aria-label="Notas del WOD"
        />
      </div>
    </div>
  );
}
