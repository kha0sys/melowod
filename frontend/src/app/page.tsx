'use client';

import AuthForm from '@/components/auth/AuthForm';
import { Image } from '@/components/ui/image';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-cream">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-background">
          <div className="space-y-6 text-center">
            <div className="flex justify-center mb-8">
              <Image
                src="/logo.png"
                alt="MeloWOD - Tu compañero de entrenamiento"
                width={200}
                height={200}
                className="rounded-lg shadow-lg"
              />
            </div>
            <p className="text-xl text-navy/80 mb-8 max-w-2xl mx-auto">
              Únete a la comunidad de CrossTraining más emocionante. 
              Registra tus WODs, compite globalmente y alcanza nuevos límites.
            </p>
          </div>
        
          <div className="max-w-md mx-auto mb-16">
            <AuthForm />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white/50 backdrop-blur-sm p-8 rounded-lg shadow-lg border-2 border-coral/20 hover:border-coral/50 transition-all">
              <div className="w-16 h-16 bg-coral rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-navy text-center mb-2">WODs Diarios</h3>
              <p className="text-navy/70 text-center">
                Accede a entrenamientos diseñados para desafiarte y mejorar tu nivel de fitness
              </p>
            </div>

            <div className="bg-white/50 backdrop-blur-sm p-8 rounded-lg shadow-lg border-2 border-navy/20 hover:border-navy/50 transition-all cursor-pointer group" onClick={() => router.push('/progress')}>
              <div className="w-16 h-16 bg-navy rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Image
                  src="/icons/tracking.svg"
                  alt="Seguimiento personalizado de tus entrenamientos"
                  width={64}
                  height={64}
                  className="mb-4"
                />
              </div>
              <h3 className="text-xl font-semibold text-navy text-center mb-2">Seguimiento</h3>
              <p className="text-navy/70 text-center">
                Registra tus resultados y observa tu progreso a lo largo del tiempo
              </p>
            </div>

            <div className="bg-white/50 backdrop-blur-sm p-8 rounded-lg shadow-lg border-2 border-navy/20 hover:border-navy/50 transition-all">
              <div className="w-16 h-16 bg-navy rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-navy text-center mb-2">Competencia Global</h3>
              <p className="text-navy/70 text-center">
                Compite con atletas de todo el mundo y descubre tu ranking
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
