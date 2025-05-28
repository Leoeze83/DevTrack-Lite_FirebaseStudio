
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
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._setIsAuthLoading(false); // Cuando el estado se rehidrata, la carga ha terminado
        }
      }
    }
  )
);

// Sincronizar el estado de carga inicial
// Esto se asegura de que isAuthLoading se establezca en false una vez que la persistencia se haya rehidratado
const unsub = useAuthStore.persist.onFinishHydration((state) => {
  state._setIsAuthLoading(false);
  unsub(); // Solo necesitamos esto una vez
});
