'use client';

import { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw, Save } from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';
import { useReward } from 'react-rewards';
import { useFirestoreDoc } from '@/hooks/useFirestore';
import { formatDate } from '@/lib/utils';
import { Wod } from '@/types/wod';

export default function WodPage() {
  const [selectedLevel, setSelectedLevel] = useState<'rx' | 'advanced' | 'intermediate' | 'beginner'>('rx');
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState('');
  const { addPoints, unlockAchievement } = useGamification();
  const { reward: confettiReward } = useReward('wodReward', 'confetti', {
    elementCount: 100,
    spread: 90,
  });

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
    },
    advanced: {
      title: 'Avanzado',
      description: wodData?.advanced || 'Cargando...',
      points: 80,
    },
    intermediate: {
      title: 'Intermedio',
      description: wodData?.intermediate || 'Cargando...',
      points: 60,
    },
    beginner: {
      title: 'Principiante',
      description: wodData?.beginner || 'Cargando...',
      points: 40,
    },
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isRunning) {
      intervalId = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning]);

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setTime(0);
    setIsRunning(false);
  };

  const saveResult = () => {
    // Añadir puntos basados en el nivel
    const basePoints = levels[selectedLevel as keyof typeof levels].points;
    addPoints(basePoints);

    // Desbloquear logros
    if (selectedLevel === 'rx') {
      unlockAchievement('rx_master');
    }
    unlockAchievement('first_wod');

    // Mostrar celebración
    confettiReward();

    // TODO: Implementar guardado de resultado
    console.log('Guardando resultado:', {
      level: selectedLevel,
      time: formatTime(time),
      notes: result,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">WOD del Día</h1>
      
      {/* Niveles de dificultad */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {Object.entries(levels).map(([key, value]) => (
          <button
            key={key}
            onClick={() => setSelectedLevel(key)}
            className={`p-4 rounded-lg border ${
              selectedLevel === key
                ? 'bg-primary text-primary-foreground'
                : 'bg-background hover:bg-secondary'
            }`}
          >
            <h3 className="font-bold mb-2">{value.title}</h3>
            <div className="text-sm opacity-75">+{value.points} puntos</div>
          </button>
        ))}
      </div>

      {/* Descripción del WOD */}
      <div className="bg-secondary p-6 rounded-lg mb-8">
        <h2 className="text-xl font-bold mb-4">Descripción</h2>
        <pre className="whitespace-pre-wrap font-mono">
          {levels[selectedLevel as keyof typeof levels].description}
        </pre>
      </div>

      {/* Cronómetro */}
      <div className="bg-background border rounded-lg p-6 mb-8">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <Timer className="h-6 w-6" />
          <span className="text-4xl font-mono">{formatTime(time)}</span>
        </div>
        <div className="flex justify-center space-x-4">
          <button
            onClick={toggleTimer}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isRunning ? 'Pausar' : 'Iniciar'}</span>
          </button>
          <button
            onClick={resetTimer}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-md border hover:bg-secondary"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reiniciar</span>
          </button>
        </div>
      </div>

      {/* Registro de resultado */}
      <div className="bg-background border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Registrar Resultado</h2>
        <textarea
          value={result}
          onChange={(e) => setResult(e.target.value)}
          placeholder="Notas adicionales sobre tu WOD..."
          className="w-full p-2 border rounded-md mb-4 bg-background"
          rows={4}
        />
        <div className="flex items-center justify-between">
          <button
            onClick={saveResult}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Save className="h-4 w-4" />
            <span>Guardar Resultado</span>
          </button>
          <span id="wodReward" />
        </div>
      </div>
    </div>
  );
}
