
"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, CurrentUser } from '@/lib/types';
import { useUserStore } from './use-user-store'; 

interface AuthState {
  currentUser: CurrentUser | null;
  isAuthLoading: boolean; 
  login: (email: string, password?: string) => Promise<boolean>; 
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
      
      login: async (email: string, password?: string) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const { users } = useUserStore.getState(); 
        const userFound = users.find(
          (user) => user.email.toLowerCase() === email.toLowerCase()
        );

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
        set({ isAuthLoading: false }); 
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
           setTimeout(() => {
            useAuthStore.getState()._setIsAuthLoading(false);
          }, 0);
        };
      },
    }
  )
);
