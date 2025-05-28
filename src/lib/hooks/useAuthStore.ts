
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
      isAuthLoading: true, // Inicialmente cargando
      
      login: async (identifier: string, password?: string) => {
        // Podríamos establecer isAuthLoading a true aquí si queremos un spinner específico para el login
        // set({ isAuthLoading: true }); 
        await new Promise(resolve => setTimeout(resolve, 300)); // Simular delay de red
        
        const { users, isInitialized: usersInitialized } = useUserStore.getState();
        
        if (!usersInitialized) {
          console.warn("AuthStore: El store de usuarios aún no está inicializado. El login podría fallar o usar datos obsoletos.");
          // Opcionalmente, podríamos esperar/reintentar o devolver un error específico aquí.
          // Por ahora, procedemos, pero es un punto a tener en cuenta si surgen problemas.
        }
        
        let userFound: User | undefined = undefined;
        const identifierLower = identifier.toLowerCase();

        if (identifierLower.includes('@')) {
          userFound = users.find(
            (user) => user.email.toLowerCase() === identifierLower
          );
        } else {
          userFound = users.find(
            (user) => {
              const emailUsernamePart = user.email.substring(0, user.email.indexOf('@')).toLowerCase();
              return emailUsernamePart === identifierLower;
            }
          );
        }

        if (userFound) {
          if (password && userFound.password === password) {
            const { password: _p, ...userToStore } = userFound;
            set({ currentUser: userToStore, isAuthLoading: false });
            return true;
          } else if (!password && !userFound.password) {
            const { password: _p, ...userToStore } = userFound;
            set({ currentUser: userToStore, isAuthLoading: false });
            return true;
          }
        }
        
        set({ isAuthLoading: false }); // Asegurar que se ponga en false en caso de fallo
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
      onRehydrateStorage: (stateFromStorage, error) => {
        if (error) {
          console.error("AuthStore: Error durante la rehidratación desde localStorage", error);
        }
        // La rehidratación ha terminado (o fallado).
        // Ahora podemos establecer isAuthLoading a false.
        // Usamos setTimeout para asegurar que esto ocurra después del ciclo de render actual
        // y que el store 'useAuthStore' esté completamente definido.
        setTimeout(() => {
          useAuthStore.getState()._setIsAuthLoading(false);
        }, 0);
      },
    }
  )
);

// Fallback adicional para asegurar que isAuthLoading se establezca en false
// si onRehydrateStorage no se ejecutó por alguna razón o fue muy rápido.
if (typeof window !== 'undefined') {
    setTimeout(() => {
        const state = useAuthStore.getState();
        if (state.isAuthLoading) { // Solo si aún está cargando
            console.warn("AuthStore: Fallback de seguridad - Estableciendo isAuthLoading a false después del timeout inicial.");
            state._setIsAuthLoading(false);
        }
    }, 500); // Un pequeño delay para dar tiempo a la rehidratación normal
}
