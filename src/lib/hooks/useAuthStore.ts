
"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, CurrentUser } from '@/lib/types';
import { useUserStore } from './use-user-store'; // Para acceder a la lista de usuarios

interface AuthState {
  currentUser: CurrentUser | null;
  isAuthLoading: boolean; // Para manejar el estado de carga inicial de autenticación
  login: (email: string, password?: string) => Promise<boolean>; // Password ahora es requerido
  logout: () => void;
  _setIsAuthLoading: (loading: boolean) => void; // Acción interna para tests o inicialización
}

const AUTH_STORAGE_KEY = 'devtrack_current_user';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthLoading: true, // Comienza como true hasta que se cargue desde localStorage
      
      login: async (email: string, password?: string) => {
        // Pequeña demora para simular una llamada de red
        await new Promise(resolve => setTimeout(resolve, 300));

        const { users } = useUserStore.getState(); // Obtener la lista de usuarios del useUserStore
        const userFound = users.find(
          (user) => user.email.toLowerCase() === email.toLowerCase()
        );

        if (userFound) {
          // Validar contraseña si se proporciona
          if (password && userFound.password === password) {
            const { password: _, ...userToStore } = userFound; // Excluir contraseña del currentUser
            set({ currentUser: userToStore, isAuthLoading: false });
            return true;
          } else if (!password && !userFound.password) {
            // Caso de login sin contraseña (si el usuario fue creado sin ella - para retrocompatibilidad o tests)
            const { password: _, ...userToStore } = userFound;
            set({ currentUser: userToStore, isAuthLoading: false });
            return true;
          }
        }
        set({ isAuthLoading: false }); // Asegurarse de que isAuthLoading se actualice incluso en fallo
        return false;
      },

      logout: () => {
        set({ currentUser: null, isAuthLoading: false });
      },
      _setIsAuthLoading: (loading: boolean) => {
        set({ isAuthLoading: loading });
      }
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // onRehydrateStorage se llama después de que el estado ha sido rehidratado.
      // Usaremos onFinishHydration para mayor claridad, que es el evento específico para esto.
      // Si onFinishHydration da problemas consistentemente, podríamos volver a onRehydrateStorage
      // y llamar a getState()._setIsAuthLoading(false) desde ahí, pero onFinishHydration es más idiomático.
    }
  )
);

// Sincronizar el estado de carga inicial
// Esto se asegura de que isAuthLoading se establezca en false una vez que la persistencia se haya rehidratado
// Se aplaza la ejecución para dar tiempo a que el store se inicialice completamente en el cliente.
if (typeof window !== 'undefined') {
  setTimeout(() => {
    if (useAuthStore.persist && typeof useAuthStore.persist.onFinishHydration === 'function') {
      const unsub = useAuthStore.persist.onFinishHydration(() => {
        useAuthStore.getState()._setIsAuthLoading(false);
        unsub(); // Solo necesitamos esto una vez
      });
    } else {
      console.warn(
        "Zustand persist API (onFinishHydration) no está disponible. " +
        "Estableciendo isAuthLoading a false como fallback. " +
        "Esto podría indicar un problema con la inicialización del middleware persist."
      );
      // Como fallback, si la API de persistencia no está disponible,
      // actualizamos isAuthLoading directamente. Esto es para evitar que la UI se quede bloqueada.
      useAuthStore.getState()._setIsAuthLoading(false);
    }
  }, 0);
}
