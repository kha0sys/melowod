import * as z from 'zod';

const movementSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  reps: z.number().min(1, 'Las repeticiones deben ser mayores a 0'),
  weight: z.number().optional(),
  distance: z.number().optional(),
  unit: z.enum(['kg', 'lb', 'm', 'cal']).optional(),
  notes: z.string().optional()
});

export const wodSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  type: z.enum(['amrap', 'fortime', 'emom', 'tabata', 'custom']),
  difficulty: z.enum(['rx', 'scaled', 'beginner']),
  movements: z.array(movementSchema).min(1, 'Debe haber al menos un movimiento'),
  scoring: z.object({
    type: z.enum(['time', 'reps', 'weight', 'rounds']),
    value: z.number()
  }),
  timeLimit: z.number().optional(),
  rounds: z.number().optional()
});
