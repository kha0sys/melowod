'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Dumbbell, Trophy, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Image } from '@/components/ui/image';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (buttonRef.current) {
      buttonRef.current.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }
  }, [isOpen]);

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
    <nav className="bg-navy text-cream shadow-lg" aria-label="Navegación principal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link 
              href="/" 
              className="flex items-center space-x-2"
              aria-label="Ir a la página principal"
            >
              <Image
                src="/logo.png"
                alt="Logo de MeloWOD"
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="font-bold text-xl">MeloWOD</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:block">
            <ul className="flex items-baseline space-x-4" role="list">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`
                        flex items-center px-3 py-2 rounded-md text-sm font-medium
                        ${isActive(item.href)
                          ? 'bg-navy-light text-white'
                          : 'text-cream hover:bg-navy-light hover:text-white'}
                      `}
                      aria-current={isActive(item.href) ? 'page' : undefined}
                    >
                      <Icon className="h-5 w-5 mr-2" aria-hidden="true" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              ref={buttonRef}
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-cream hover:text-white hover:bg-navy-light focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              <span className="sr-only">
                {isOpen ? 'Cerrar menú principal' : 'Abrir menú principal'}
              </span>
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
      <div
        className={`${isOpen ? 'block' : 'hidden'} md:hidden`}
        id="mobile-menu"
      >
        <ul className="px-2 pt-2 pb-3 space-y-1 sm:px-3" role="list">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center px-3 py-2 rounded-md text-base font-medium w-full
                    ${isActive(item.href)
                      ? 'bg-navy-light text-white'
                      : 'text-cream hover:bg-navy-light hover:text-white'}
                  `}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="h-5 w-5 mr-2" aria-hidden="true" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
