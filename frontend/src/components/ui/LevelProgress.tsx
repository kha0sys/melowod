import { useGamification } from '@/hooks/useGamification';
import { cn } from '@/lib/utils';

export function LevelProgress() {
  const { level, experience } = useGamification();
  const POINTS_PER_LEVEL = 100;
  const currentLevelExp = experience % POINTS_PER_LEVEL;
  const progress = (currentLevelExp / POINTS_PER_LEVEL) * 100;

  // Calculamos las clases de ancho basadas en el progreso
  const progressClasses = {
    0: 'w-0',
    10: 'w-[10%]',
    20: 'w-[20%]',
    30: 'w-[30%]',
    40: 'w-[40%]',
    50: 'w-1/2',
    60: 'w-[60%]',
    70: 'w-[70%]',
    80: 'w-[80%]',
    90: 'w-[90%]',
    100: 'w-full',
  };

  // Encontramos el valor más cercano para el progreso
  const nearestProgress = Object.keys(progressClasses)
    .map(Number)
    .reduce((prev, curr) => {
      return Math.abs(curr - progress) < Math.abs(prev - progress) ? curr : prev;
    });

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">Nivel {level}</span>
        <span className="text-sm font-medium">{currentLevelExp}/{POINTS_PER_LEVEL} XP</span>
      </div>
      <div className="w-full bg-secondary rounded-full h-2.5">
        <div
          className={cn(
            "bg-primary h-2.5 rounded-full transition-all duration-500",
            progressClasses[nearestProgress as keyof typeof progressClasses]
          )}
        />
      </div>
    </div>
  );
}
