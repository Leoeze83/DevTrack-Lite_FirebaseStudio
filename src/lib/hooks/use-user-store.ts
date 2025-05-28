
"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/lib/types';

const USERS_STORAGE_KEY = "devtrack_users_v_zustand"; // Nueva clave para evitar conflictos

interface UserStoreState {
  users: User[];
  isInitialized: boolean;
  addUser: (newUserData: Omit<User, "id" | "createdAt" | "avatarUrl"> & { password?: string }) => User;
  _setIsInitialized: (initialized: boolean) => void;
}

export const useUserStore = create<UserStoreState>()(
  persist(
    (set, get) => ({
      users: [],
      isInitialized: false, // Se establecerá a true después de la hidratación
      addUser: (newUserData) => {
        const newUser: User = {
          name: newUserData.name,
          email: newUserData.email,
          password: newUserData.password, // Guardar contraseña
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          // avatarUrl puede ser añadido aquí si se pasa en newUserData
        };
        set((state) => ({
          // Añade el nuevo usuario y ordena por fecha de creación descendente
          users: [newUser, ...state.users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        }));
        return newUser;
      },
      _setIsInitialized: (initialized: boolean) => {
        set({ isInitialized: initialized });
      }
    }),
    {
      name: USERS_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // onRehydrateStorage es llamado después de que el estado ha sido rehidratado
      // y fusionado con el estado inicial.
      onRehydrateStorage: () => {
        // No es necesario hacer nada aquí si _setIsInitialized se llama desde fuera
        // o si usamos onFinishHydration.
      }
    }
  )
);

// Sincronizar el estado de carga inicial, similar a useAuthStore
// Esto se asegura de que isInitialized se establezca en false una vez que la persistencia se haya rehidratado
if (typeof window !== 'undefined') {
  setTimeout(() => { // Aplazar para asegurar que el store esté completamente inicializado
    if (useUserStore.persist && typeof useUserStore.persist.onFinishHydration === 'function') {
      const unsub = useUserStore.persist.onFinishHydration(() => {
        useUserStore.getState()._setIsInitialized(true);
        unsub(); // Solo necesitamos esto una vez
      });
    } else {
      console.warn(
        "Zustand persist API (onFinishHydration) para useUserStore no está disponible. " +
        "Estableciendo isInitialized a true como fallback."
      );
      // Como fallback, si la API de persistencia no está disponible,
      // actualizamos isInitialized directamente.
      useUserStore.getState()._setIsInitialized(true);
    }
  }, 0);
}
