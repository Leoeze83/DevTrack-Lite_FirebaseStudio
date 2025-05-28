
"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, CurrentUser } from '@/lib/types';
import { useUserStore } from './use-user-store';

interface AuthState {
  currentUser: CurrentUser | null;
  isAuthLoading: boolean;
  login: (identifier: string, password?: string) => Promise<boolean>;
  logout: () => void;
  updateCurrentUserData: (data: Partial<Omit<CurrentUser, "id" | "email" | "createdAt">>) => void;
  _setIsAuthLoading: (loading: boolean) => void;
}

const AUTH_STORAGE_KEY = 'devtrack_current_user';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthLoading: true,
      
      login: async (identifier: string, password?: string) => {
        await new Promise(resolve => setTimeout(resolve, 300)); // Simular delay de red
        const { users } = useUserStore.getState();
        
        let userFound: User | undefined = undefined;
        const identifierLower = identifier.toLowerCase();

        if (identifierLower.includes('@')) {
          // Asumir que es un email completo
          userFound = users.find(
            (user) => user.email.toLowerCase() === identifierLower
          );
        } else {
          // Asumir que es la parte del nombre de usuario del email
          userFound = users.find(
            (user) => {
              const emailUsernamePart = user.email.substring(0, user.email.indexOf('@')).toLowerCase();
              return emailUsernamePart === identifierLower;
            }
          );
        }

        if (userFound) {
          // Validar contraseña
          if (password && userFound.password === password) {
            const { password: _p, ...userToStore } = userFound;
            set({ currentUser: userToStore, isAuthLoading: false });
            return true;
          } else if (!password && !userFound.password) { // Permitir login si no se provee contraseña y el usuario no tiene una
            const { password: _p, ...userToStore } = userFound;
            set({ currentUser: userToStore, isAuthLoading: false });
            return true;
          }
        }
        // Si no se encontró usuario o la contraseña no coincide (y era requerida)
        set({ isAuthLoading: false }); // Asegurarse de que isAuthLoading se ponga en false
        return false;
      },

      logout: () => {
        set({ currentUser: null, isAuthLoading: false });
      },
      updateCurrentUserData: (dataToUpdate) => {
        set((state) => {
          if (state.currentUser) {
            const updatedUser = { ...state.currentUser, ...dataToUpdate };
            return { currentUser: updatedUser };
          }
          return {};
        });
      },
      _setIsAuthLoading: (loading: boolean) => {
        set({ isAuthLoading: loading });
      }
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error("AuthStore: ocurrió un error durante la rehidratación", error);
          }
          // Aplazar la ejecución para asegurar que el store principal esté completamente definido
          setTimeout(() => {
            if (useAuthStore.persist && typeof useAuthStore.persist.onFinishHydration === 'function') {
                // Ya no necesitamos suscribirnos a onFinishHydration aquí si onRehydrateStorage ya se encarga.
                // Simplemente establecemos isAuthLoading a false.
                useAuthStore.getState()._setIsAuthLoading(false);
            } else {
                // Fallback si la API persist no está lista (poco probable si onRehydrateStorage se disparó)
                console.warn("AuthStore: No se pudo acceder a la API de persist para onFinishHydration, estableciendo isAuthLoading a false directamente.");
                useAuthStore.getState()._setIsAuthLoading(false);
            }
          }, 0);
        };
      },
    }
  )
);

// Asegurar que isAuthLoading se establezca en false después de la hidratación inicial
// si onRehydrateStorage no se ejecutó por alguna razón o fue muy rápido.
// Este es un fallback adicional.
if (typeof window !== 'undefined') {
    setTimeout(() => {
        const state = useAuthStore.getState();
        if (state.isAuthLoading) { // Solo si aún está cargando
            console.warn("AuthStore: Fallback - Estableciendo isAuthLoading a false después del timeout inicial.");
            state._setIsAuthLoading(false);
        }
    }, 500); // Un pequeño delay para dar tiempo a la rehidratación normal
}
