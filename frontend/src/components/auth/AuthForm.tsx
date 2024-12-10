'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SignUpRequest } from '@/types/auth';
import { authService } from '@/services/auth/auth.service';
import { useToast } from '@/components/ui/use-toast';

const AuthForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const schema = z.object({
    firstName: z.string().min(1, 'Nombre es requerido'),
    lastName: z.string().min(1, 'Apellido es requerido'),
    city: z.string().min(1, 'Ciudad es requerida'),
    country: z.string().min(1, 'País es requerido'),
    gender: z.string().min(1, 'Género es requerido'),
    category: z.string().min(1, 'Categoría es requerida'),
    email: z.string().email('Correo electrónico no válido').min(1, 'Correo electrónico es requerido'),
    password: z.string().min(8, 'Contraseña debe tener al menos 8 caracteres'),
  });

  const { register, handleSubmit, formState: { errors } } = useForm<SignUpRequest>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: SignUpRequest) => {
    setIsLoading(true);
    try {
      if (isSignUp) {
        await authService.signUp(data);
        router.push('/verify-email');
      } else {
        await authService.signIn({ email: data.email, password: data.password });
        router.push('/dashboard');
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-navy text-cream">
      <CardHeader className="space-y-4">
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.png"
            alt="MeloWOD Logo"
            width={200}
            height={60}
            priority
          />
        </div>
        <CardTitle className="text-2xl font-bold text-center text-cream">
          {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
        </CardTitle>
        <CardDescription className="text-cream/80 text-center">
          {isSignUp
            ? 'Ingresa tus datos para crear una cuenta'
            : 'Ingresa tus credenciales para acceder'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {isSignUp && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-cream">
                    Nombre
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    {...register('firstName')}
                    className="bg-navy-light text-cream border-cream/20"
                  />
                  {errors.firstName && <p className="text-red-400 text-sm">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-cream">
                    Apellido
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    {...register('lastName')}
                    className="bg-navy-light text-cream border-cream/20"
                  />
                  {errors.lastName && <p className="text-red-400 text-sm">{errors.lastName.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-cream">
                    Ciudad
                  </Label>
                  <Input
                    id="city"
                    type="text"
                    {...register('city')}
                    className="bg-navy-light text-cream border-cream/20"
                  />
                  {errors.city && <p className="text-red-400 text-sm">{errors.city.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-cream">
                    País
                  </Label>
                  <Input
                    id="country"
                    type="text"
                    {...register('country')}
                    className="bg-navy-light text-cream border-cream/20"
                  />
                  {errors.country && <p className="text-red-400 text-sm">{errors.country.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-cream">
                    Género
                  </Label>
                  <Select {...register('gender')}>
                    <SelectTrigger className="bg-navy-light text-cream border-cream/20">
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent className="bg-navy-light text-cream">
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Femenino</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && <p className="text-red-400 text-sm">{errors.gender.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-cream">
                    Categoría
                  </Label>
                  <Select {...register('category')}>
                    <SelectTrigger className="bg-navy-light text-cream border-cream/20">
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent className="bg-navy-light text-cream">
                      <SelectItem value="rx">RX</SelectItem>
                      <SelectItem value="scaled">Scaled</SelectItem>
                      <SelectItem value="beginner">Principiante</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-red-400 text-sm">{errors.category.message}</p>}
                </div>
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-cream">
              Correo electrónico
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              className="bg-navy-light text-cream border-cream/20"
            />
            {errors.email && <p className="text-red-400 text-sm">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-cream">
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              className="bg-navy-light text-cream border-cream/20"
            />
            {errors.password && <p className="text-red-400 text-sm">{errors.password.message}</p>}
          </div>
          <Button
            type="submit"
            className="w-full bg-coral hover:bg-coral/90 text-cream"
            disabled={isLoading}
          >
            {isLoading ? 'Cargando...' : isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full text-cream hover:text-cream/80"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AuthForm;
