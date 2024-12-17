import { Inter } from 'next/font/google';
import { Metadata } from 'next';
import { Providers } from '../src/lib/providers';
import Navbar from '@/components/layout/Navbar';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MeloWOD - Tu plataforma de entrenamiento personalizado',
  description: 'Únete a la comunidad de CrossTraining más emocionante. Registra tus WODs, compite globalmente y alcanza nuevos límites.',
  keywords: ['crosstraining', 'wod', 'entrenamiento', 'fitness', 'comunidad'],
  authors: [{ name: 'MeloWOD Team' }],
  themeColor: '#000080', // navy color
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
            <Toaster />
          </div>
        </Providers>
      </body>
    </html>
  );
}
