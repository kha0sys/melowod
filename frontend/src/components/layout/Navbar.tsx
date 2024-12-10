'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Dumbbell, Trophy, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  // Si el usuario no está autenticado o estamos en la página principal, no mostramos la navegación
  if (!user || pathname === '/') {
    return null;
  }

  const navigation = [
    { name: 'WOD', href: '/wod', icon: Dumbbell },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Perfil', href: '/profile', icon: User },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-navy text-cream shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex-shrink-0">
              <span className="text-2xl font-bold">MeloWOD</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      isActive(item.href)
                        ? 'bg-coral text-cream'
                        : 'text-cream/80 hover:bg-navy-light hover:text-cream'
                    } flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium`}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-cream hover:text-white hover:bg-navy-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    isActive(item.href)
                      ? 'bg-coral text-cream'
                      : 'text-cream/80 hover:bg-navy-light hover:text-cream'
                  } px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
