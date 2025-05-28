
"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/lib/types';

const USERS_STORAGE_KEY = "devtrack_users_v_zustand";

interface UserStoreState {
  users: User[];
  isInitialized: boolean;
  addUser: (newUserData: Omit<User, "id" | "createdAt"> & { password?: string }) => User;
  getUsers: () => User[];
  getUserById: (id: string) => User | undefined;
}

export const useUserStore = create<UserStoreState>()(
  persist(
    (set, get) => ({
      users: [],
      isInitialized: false, // Estado inicial
      addUser: (newUserData) => {
        const newUser: User = {
          name: newUserData.name,
          email: newUserData.email,
          password: newUserData.password, // Guardar contraseña
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          avatarUrl: `https://placehold.co/100x100.png?text=${newUserData.name.charAt(0)}` // Avatar placeholder básico
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
      onRehydrateStorage: (_state, error) => { // El primer argumento es el estado rehidratado, no lo necesitamos aquí.
        if (error) {
          console.error("UserStore: ocurrió un error durante la rehidratación", error);
        }
        // Aplazar la configuración de isInitialized a true hasta después del tick actual de JS,
        // asegurando que useUserStore esté completamente asignado.
        setTimeout(() => {
          useUserStore.setState({ isInitialized: true });
        }, 0);
      },
    }
  )
);

    