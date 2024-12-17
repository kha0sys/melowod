'use client';

import { useState } from 'react';
import { Image } from '@/components/ui/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer, Play, Pause, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrackingCardProps {
  title: string;
  description: string;
  imageUrl: string;
  points: number;
  onComplete?: () => void;
  className?: string;
}

export function TrackingCard({
  title,
  description,
  imageUrl,
  points,
  onComplete,
  className
}: TrackingCardProps) {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

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

  const handleComplete = () => {
    onComplete?.();
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
        <Image
          src={imageUrl}
          alt={`Imagen del WOD: ${title}`}
          fill
          className="object-cover"
          fallback={title}
        />
      </div>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Timer className="h-5 w-5" />
              <span className="text-2xl font-mono">{formatTime(time)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={toggleTimer}
                aria-label={isRunning ? 'Pausar' : 'Iniciar'}
              >
                {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={resetTimer}
                aria-label="Reiniciar"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">+{points} puntos</span>
            <Button onClick={handleComplete}>Completar</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
