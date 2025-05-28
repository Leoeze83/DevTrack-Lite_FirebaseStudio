"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/hooks/useAuthStore';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { currentUser, isAuthLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Solo ejecutar la lógica de redirección si la autenticación no está cargando
    if (!isAuthLoading) {
      if (!currentUser && pathname !== '/login') {
        router.replace('/login');
      } else if (currentUser && pathname === '/login') {
        // Si el usuario está logueado y intenta acceder a /login, redirigir al dashboard
        router.replace('/');
      }
    }
  }, [currentUser, isAuthLoading, pathname, router]);

  // Muestra un loader mientras la autenticación está cargando,
  // o si una redirección es inminente para evitar un flash de contenido incorrecto.
  if (isAuthLoading || (!currentUser && pathname !== '/login') || (currentUser && pathname === '/login')) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="sr-only">Cargando...</span>
      </div>
    );
  }

  // Si no hay carga de autenticación y las condiciones de redirección no se cumplen,
  // renderiza los hijos (la página actual, que podría ser /login o una página protegida).
  return <>{children}</>;
}
