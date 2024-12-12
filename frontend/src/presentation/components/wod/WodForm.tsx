import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Wod, Movement } from '@/domain/entities/Wod';
import { wodSchema } from '@/lib/validations/wod';
import { useWod } from '@/presentation/hooks/useWod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

type WodFormData = Omit<Wod, 'id' | 'createdAt' | 'updatedAt'>;

interface WodFormProps {
  onSuccess?: (wod: Wod) => void;
  onError?: (error: Error) => void;
}

export function WodForm({ onSuccess, onError }: WodFormProps) {
  const { createWod, loading, error } = useWod();
  const [movements, setMovements] = useState<Movement[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<WodFormData>({
    resolver: zodResolver(wodSchema)
  });

  const onSubmit = async (data: WodFormData) => {
    try {
      const wodData = {
        ...data,
        movements
      };
      await createWod(wodData);
      reset();
      setMovements([]);
      if (onSuccess) onSuccess(wodData as Wod);
    } catch (err) {
      if (onError) onError(err as Error);
    }
  };

  const addMovement = () => {
    setMovements([
      ...movements,
      { name: '', reps: 0 }
    ]);
  };

  const updateMovement = (index: number, field: keyof Movement, value: any) => {
    const updatedMovements = [...movements];
    updatedMovements[index] = {
      ...updatedMovements[index],
      [field]: value
    };
    setMovements(updatedMovements);
  };

  const removeMovement = (index: number) => {
    setMovements(movements.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error instanceof Error ? error.message : 'Error al crear el WOD'}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Input
            {...register('title')}
            placeholder="Título del WOD"
            className={errors.title ? 'border-red-500' : ''}
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Textarea
            {...register('description')}
            placeholder="Descripción"
            className={errors.description ? 'border-red-500' : ''}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Select
            onValueChange={(value) => register('type').onChange({ target: { value } })}
          >
            <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
              <SelectValue placeholder="Tipo de WOD" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="amrap">AMRAP</SelectItem>
              <SelectItem value="fortime">For Time</SelectItem>
              <SelectItem value="emom">EMOM</SelectItem>
              <SelectItem value="tabata">Tabata</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && (
            <p className="text-sm text-red-500">{errors.type.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Select
            onValueChange={(value) => register('difficulty').onChange({ target: { value } })}
          >
            <SelectTrigger className={errors.difficulty ? 'border-red-500' : ''}>
              <SelectValue placeholder="Dificultad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rx">RX</SelectItem>
              <SelectItem value="scaled">Scaled</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
            </SelectContent>
          </Select>
          {errors.difficulty && (
            <p className="text-sm text-red-500">{errors.difficulty.message}</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Movimientos</h3>
            <Button
              type="button"
              variant="outline"
              onClick={addMovement}
            >
              Agregar Movimiento
            </Button>
          </div>

          {movements.map((movement, index) => (
            <div key={index} className="flex gap-4 items-start">
              <Input
                value={movement.name}
                onChange={(e) => updateMovement(index, 'name', e.target.value)}
                placeholder="Nombre del movimiento"
              />
              <Input
                type="number"
                value={movement.reps}
                onChange={(e) => updateMovement(index, 'reps', parseInt(e.target.value))}
                placeholder="Repeticiones"
              />
              <Input
                type="number"
                value={movement.weight}
                onChange={(e) => updateMovement(index, 'weight', parseInt(e.target.value))}
                placeholder="Peso (opcional)"
              />
              <Button
                type="button"
                variant="destructive"
                onClick={() => removeMovement(index)}
              >
                Eliminar
              </Button>
            </div>
          ))}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Creando...' : 'Crear WOD'}
        </Button>
      </div>
    </form>
  );
}
