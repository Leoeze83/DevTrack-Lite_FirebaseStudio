
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
  updateUser: (
    userId: string, 
    dataToUpdate: Partial<Omit<User, "id" | "createdAt" | "email">>, // 'password' aquí sería la nueva contraseña
    currentPasswordForVerification?: string
  ) => User | undefined | { error: string };
  getUsers: () => User[];
  getUserById: (id: string) => User | undefined;
  _setIsInitialized: (initialized: boolean) => void; // Para uso interno por persistencia
}

const getInitialUsers = (): User[] => {
  if (typeof window === 'undefined') {
    console.log("UserStore: Entorno de servidor, devolviendo array vacío para usuarios iniciales.");
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
    console.error("UserStore: Error al leer usuarios de localStorage en getInitialUsers:", error);
    localStorage.removeItem(USERS_STORAGE_KEY); // Limpiar si está corrupto
  }
  
  // Si localStorage está vacío o corrupto, cargar desde seed
  const initialSeedUsers = seedUsersData.map(user => ({...user, createdAt: user.createdAt || new Date().toISOString()}));
  return initialSeedUsers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};


export const useUserStore = create<UserStoreState>()(
  persist(
    (set, get) => ({
      users: getInitialUsers(),
      isInitialized: false, 
      
      addUser: (newUserData) => {
        const newUser: User = {
          name: newUserData.name,
          email: newUserData.email,
          password: newUserData.password, 
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          avatarUrl: newUserData.avatarUrl || `https://placehold.co/100x100.png?text=${newUserData.name.charAt(0).toUpperCase()}&data-ai-hint=avatar+placeholder`
        };
        set((state) => ({
          users: [newUser, ...state.users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        }));
        return newUser;
      },

      updateUser: (userId, dataToUpdate, currentPasswordForVerification) => {
        let updatedUser: User | undefined = undefined;
        let errorResult: { error: string } | undefined = undefined;

        set((state) => {
          const userIndex = state.users.findIndex(user => user.id === userId);
          if (userIndex === -1) {
            console.warn(`UserStore: Usuario con ID ${userId} no encontrado para actualizar.`);
            return state; // No modificar el estado si el usuario no se encuentra
          }

          const userToUpdate = state.users[userIndex];
          const updates = { ...dataToUpdate };

          // Lógica para cambio de contraseña
          if (updates.password) { // 'password' en updates es la NUEVA contraseña
            if (!currentPasswordForVerification) {
              errorResult = { error: "Se requiere la contraseña actual para cambiarla." };
              return state; // No actualiza si falta la contraseña actual
            }
            if (userToUpdate.password !== currentPasswordForVerification) {
              errorResult = { error: "La contraseña actual es incorrecta." };
              return state; // No actualiza si la contraseña actual no coincide
            }
            // Si la verificación es exitosa, la nueva contraseña en 'updates.password' se aplicará.
          } else {
            // Si no se está actualizando la contraseña, nos aseguramos de no borrarla accidentalmente.
            // 'updates' ya no contendrá 'password' o será undefined si no se está cambiando.
            // Sin embargo, si 'password' está explícitamente en dataToUpdate pero es undefined/null,
            // podría interpretarse como "borrar contraseña", lo cual no queremos aquí.
            // El tipo de dataToUpdate es Partial, así que si password no está, no se toca.
          }
          
          if (errorResult) return state; // Detener si hubo un error de contraseña

          updatedUser = { 
            ...userToUpdate, 
            ...updates, // Aplicar todos los cambios (nombre, avatar, nueva contraseña si pasó la verificación)
            updatedAt: new Date().toISOString() 
          };
          
          const newUsers = [...state.users];
          newUsers[userIndex] = updatedUser;
          
          return { users: newUsers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) };
        });

        if (errorResult) return errorResult;
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
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error("UserStore: Error durante la rehidratación desde localStorage", error);
          }
          // Aplazar la configuración de isInitialized para asegurar que el store esté completamente listo
          setTimeout(() => {
            if (useUserStore.getState()._setIsInitialized) {
               useUserStore.getState()._setIsInitialized(true);
            }
          }, 0);
        };
      },
    }
  )
);

// Sincronizar el estado de carga inicial a nivel de módulo
// Esto se asegura de que isInitialized se establezca en true una vez que la persistencia se haya rehidratado
if (typeof window !== 'undefined') {
  // Usamos setTimeout para asegurar que la suscripción ocurra después de que el store esté completamente inicializado
  setTimeout(() => {
    if (useUserStore.persist && typeof useUserStore.persist.onFinishHydration === 'function') {
      const unsub = useUserStore.persist.onFinishHydration((state) => {
        if (state && typeof state._setIsInitialized === 'function') {
          state._setIsInitialized(true);
        } else {
          // Fallback si state no tiene _setIsInitialized, aunque no debería pasar con el diseño actual.
          // Es más seguro llamar a getState() para acceder al store después de la hidratación.
          useUserStore.getState()._setIsInitialized(true);
        }
        unsub(); // Solo necesitamos esto una vez
      });
    } else {
      // Fallback si onFinishHydration no está disponible inmediatamente (puede pasar en algunos escenarios de SSR/CSR)
      // o si persist no está listo
      console.warn("UserStore: onFinishHydration no disponible inmediatamente. Usando fallback para isInitialized.");
      useUserStore.getState()._setIsInitialized(true);
    }
  }, 0);
}

    