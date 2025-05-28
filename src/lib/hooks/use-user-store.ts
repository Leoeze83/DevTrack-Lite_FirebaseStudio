
"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/lib/types';

const USERS_STORAGE_KEY = "devtrack_users_v_zustand";

interface UserStoreState {
  users: User[];
  isInitialized: boolean;
  addUser: (newUserData: Omit<User, "id" | "createdAt" | "avatarUrl"> & { password?: string }) => User;
  getUsers: () => User[];
  getUserById: (id: string) => User | undefined;
}

export const useUserStore = create<UserStoreState>()(
  persist(
    (set, get) => ({
      users: [],
      isInitialized: false, // Comienza como false
      addUser: (newUserData) => {
        const newUser: User = {
          name: newUserData.name,
          email: newUserData.email,
          password: newUserData.password,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          // avatarUrl puede ser añadido aquí si se pasa en newUserData
        };
        set((state) => ({
          users: [newUser, ...state.users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        }));
        return newUser;
      },
      getUsers: () => {
        return get().users;
      },
      getUserById: (id: string) => {
        return get().users.find(user => user.id === id);
      }
    }),
    {
      name: USERS_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // onRehydrateStorage se llama después de que el estado ha sido rehidratado.
      // La función que devolvemos aquí se ejecutará después de la rehidratación.
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error("UserStore: ocurrió un error durante la rehidratación", error);
          }
          // Establecer isInitialized a true después de que la rehidratación haya ocurrido
          // Esto asegura que cualquier componente que dependa de isInitialized se actualice.
          // Usamos setState directamente del store aquí.
          useUserStore.setState({ isInitialized: true });
        };
      },
    }
  )
);

// Para el caso inicial donde localStorage podría estar vacío,
// la primera vez onRehydrateStorage se llamará con el estado inicial (isInitialized: false).
// Luego, setState({ isInitialized: true }) actualizará el estado.
// Los componentes que leen isInitialized reaccionarán a este cambio.
