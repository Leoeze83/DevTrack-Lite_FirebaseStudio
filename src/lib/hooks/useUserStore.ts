
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
}

export const useUserStore = create<UserStoreState>()(
  persist(
    (set, get) => ({
      users: [],
      isInitialized: false,
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
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error("UserStore: ocurrió un error durante la rehidratación", error);
          }
          // Aplazar la configuración de isInitialized
          setTimeout(() => {
            useUserStore.setState({ isInitialized: true });
          }, 0);
        };
      },
    }
  )
);
