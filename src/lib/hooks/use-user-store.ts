
"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/lib/types';
import seedUsersData from '@/lib/data/seed-users.json';

const USERS_STORAGE_KEY = "devtrack_users_v_zustand";

interface UserStoreState {
  users: User[];
  isInitialized: boolean;
  addUser: (newUserData: Omit<User, "id" | "createdAt"> & { password?: string }) => User;
  updateUser: (userId: string, dataToUpdate: Partial<Omit<User, "id" | "createdAt" | "email">>) => User | undefined;
  getUsers: () => User[];
  getUserById: (id: string) => User | undefined;
  _setIsInitialized: (initialized: boolean) => void;
}

const getInitialUsers = (): User[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const storedUsersRaw = localStorage.getItem(USERS_STORAGE_KEY);
    if (storedUsersRaw) {
      const storedPersistedState = JSON.parse(storedUsersRaw);
      if (storedPersistedState && typeof storedPersistedState === 'object' && Array.isArray(storedPersistedState.state?.users)) {
        if (storedPersistedState.state.users.length > 0) {
          return storedPersistedState.state.users.sort((a: User, b: User) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
      }
    }
  } catch (error) {
    console.error("Error al leer usuarios de localStorage en getInitialUsers:", error);
    localStorage.removeItem(USERS_STORAGE_KEY);
  }
  
  const initialSeedUsers = seedUsersData.map(user => ({...user, createdAt: user.createdAt || new Date().toISOString()}));
  return initialSeedUsers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};


export const useUserStore = create<UserStoreState>()(
  persist(
    (set, get) => ({
      users: getInitialUsers(),
      isInitialized: false, // Inicialmente no inicializado
      addUser: (newUserData) => {
        const newUser: User = {
          name: newUserData.name,
          email: newUserData.email,
          password: newUserData.password, // Guardar contraseña
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
      },
      _setIsInitialized: (initialized: boolean) => {
        set({ isInitialized: initialized });
      },
    }),
    {
      name: USERS_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: (persistedState, error) => {
        if (error) {
          console.error("UserStore: Error durante la rehidratación desde localStorage", error);
        }
        setTimeout(() => {
          useUserStore.getState()._setIsInitialized(true);
        }, 0);
      },
    }
  )
);
