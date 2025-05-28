
"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, CurrentUser } from '@/lib/types';
import { useUserStore } from './use-user-store'; // Para acceder a la lista de usuarios

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
        // set({ isAuthLoading: true }); // Opcional: spinner específico para login
        try {
          await new Promise(resolve => setTimeout(resolve, 300)); // Simular delay de red
          
          const { users, isInitialized: usersInitialized } = useUserStore.getState();
          
          if (!usersInitialized) {
            console.warn("AuthStore: El store de usuarios aún no está inicializado. El login podría fallar o usar datos obsoletos.");
            // Considerar devolver false o un error si usersInitialized es crucial aquí.
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
            } else if (!password && !userFound.password) { // Permite login si no se provee contraseña Y el usuario no tiene
              const { password: _p, ...userToStore } = userFound;
              set({ currentUser: userToStore, isAuthLoading: false });
              return true;
            }
          }
          
          set({ isAuthLoading: false }); 
          return false;
        } catch (error) {
          console.error("Error en la función de login:", error);
          set({ isAuthLoading: false });
          // Podrías querer devolver false o lanzar un error más específico.
          return false; 
        }
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
      onRehydrateStorage: (persistedState, error) => {
        if (error) {
          console.error("AuthStore: Error durante la rehidratación desde localStorage", error);
        }
        // 'set' está disponible aquí a través del closure de 'persist'
        // pero la forma canónica es acceder a las acciones del store si ya está definido
        // o usar el 'set' que se pasa a la función de creación del store.
        // Para este callback específico, es más seguro usar el 'set' del store que se está configurando.
        // Sin embargo, la documentación de Zustand sugiere que este callback no recibe 'set'.
        // Por lo tanto, la llamada a useAuthStore.getState()._setIsAuthLoading(false)
        // después de un setTimeout(0) sigue siendo el enfoque más común.
        // Pero si set({ isAuthLoading: false }) funcionara directamente aquí sería ideal.
        // Vamos a mantener el enfoque robusto con setTimeout y getState().
        setTimeout(() => {
          useAuthStore.getState()._setIsAuthLoading(false);
        }, 0);
      },
    }
  )
);
