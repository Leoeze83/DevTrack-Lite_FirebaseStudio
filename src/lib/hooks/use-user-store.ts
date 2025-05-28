
"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/lib/types';

const USERS_STORAGE_KEY = "devtrack_users_v_zustand";

interface UserStoreState {
  users: User[];
  isInitialized: boolean;
  addUser: (newUserData: Omit<User, "id" | "createdAt"> & { password?: string }) => User;
  updateUser: (userId: string, dataToUpdate: Partial<Omit<User, "id" | "createdAt" | "email">>) => User | undefined;
  getUsers: () => User[];
  getUserById: (id: string) => User | undefined;
  _setIsInitialized: (initialized: boolean) => void; // Acción interna
}

export const useUserStore = create<UserStoreState>()(
  persist(
    (set, get) => ({
      users: [],
      isInitialized: false, // Se inicializa como falso
      addUser: (newUserData) => {
        const newUser: User = {
          name: newUserData.name,
          email: newUserData.email,
          password: newUserData.password,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          avatarUrl: `https://placehold.co/100x100.png?text=${newUserData.name.charAt(0).toUpperCase()}&data-ai-hint=avatar+placeholder`
        };
        set((state) => ({
          users: [newUser, ...state.users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        }));
        return newUser;
      },
      updateUser: (userId, dataToUpdate) => {
        let updatedUser: User | undefined = undefined;
        set((state) => {
          const newUsers = state.users.map(user => {
            if (user.id === userId) {
              updatedUser = { ...user, ...dataToUpdate, updatedAt: new Date().toISOString() };
              return updatedUser;
            }
            return user;
          });
          return { users: newUsers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) };
        });
        return updatedUser;
      },
      getUsers: () => get().users,
      getUserById: (id: string) => get().users.find(user => user.id === id),
      _setIsInitialized: (initialized: boolean) => { // Implementación de la acción interna
        set({ isInitialized: initialized });
      },
    }),
    {
      name: USERS_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // Ya no se usa onRehydrateStorage aquí
    }
  )
);

// Sincronizar el estado de carga inicial después de la hidratación
// Esto asegura que isInitialized se establezca en false una vez que la persistencia se haya rehidratado
if (typeof window !== 'undefined') {
  const handleFinishHydration = (state: UserStoreState | undefined) => {
    // Solo actualiza si el estado existe y no está ya inicializado
    // Esto ayuda a prevenir bucles si HMR o algo similar vuelve a ejecutar este código.
    if (state && !state.isInitialized) {
      // Llama a la acción _setIsInitialized del store para actualizar el estado
      useUserStore.getState()._setIsInitialized(true);
    }
  };

  // Suscribirse a onFinishHydration
  useUserStore.persist.onFinishHydration(handleFinishHydration);
}
