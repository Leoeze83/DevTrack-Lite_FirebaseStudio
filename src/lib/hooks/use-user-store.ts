
"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/lib/types';
import seedUsersData from '@/lib/data/seed-users.json'; // Importar usuarios predeterminados

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
      const storedUsers = JSON.parse(storedUsersRaw);
      // Comprobación simple para ver si el estado persistido tiene la estructura esperada
      if (storedUsers && typeof storedUsers === 'object' && Array.isArray(storedUsers.state?.users)) {
        if (storedUsers.state.users.length > 0) {
          return storedUsers.state.users.sort((a: User, b: User) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
      }
    }
  } catch (error) {
    console.error("Error al leer usuarios de localStorage:", error);
    // Si hay un error, o no hay usuarios, o la estructura no es la esperada, eliminamos la clave para empezar de cero
    localStorage.removeItem(USERS_STORAGE_KEY);
  }
  // Si no hay usuarios en localStorage o hubo un error, usar los seed users
  // Es importante clonar los seedUsers para evitar mutaciones directas del JSON importado
  const initialSeedUsers = seedUsersData.map(user => ({...user}));
  return initialSeedUsers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};


export const useUserStore = create<UserStoreState>()(
  persist(
    (set, get) => ({
      users: getInitialUsers(), // Llama a getInitialUsers aquí
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
      },
      _setIsInitialized: (initialized: boolean) => {
        set({ isInitialized: initialized });
      },
    }),
    {
      name: USERS_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // onRehydrateStorage ya no se usa aquí para isInitialized
    }
  )
);

// Sincronizar el estado de carga inicial después de la hidratación
// Esto asegura que isInitialized se establezca en true una vez que la persistencia se haya rehidratado
if (typeof window !== 'undefined') {
  const handleFinishHydration = (state: UserStoreState | undefined) => {
    // Solo actualiza si el estado existe y no está ya inicializado
    // Esto ayuda a prevenir bucles si HMR o algo similar vuelve a ejecutar este código.
    if (state && !state.isInitialized) {
      // Llama a la acción _setIsInitialized del store para actualizar el estado
      useUserStore.getState()._setIsInitialized(true);
    } else if (!state) { // Si el estado es undefined después de la hidratación (podría ocurrir si hubo error)
      useUserStore.getState()._setIsInitialized(true); // Marcar como inicializado de todas formas
    }
  };

  // Suscribirse a onFinishHydration
  // Y asegurar que la persistencia se ha cargado antes de intentar suscribirse
  if (useUserStore.persist && typeof useUserStore.persist.onFinishHydration === 'function') {
     const unsub = useUserStore.persist.onFinishHydration((state) => {
        handleFinishHydration(state);
        unsub(); // Desuscribirse después de la primera ejecución
     });
  } else {
    // Fallback si onFinishHydration no está disponible inmediatamente (puede pasar en algunos escenarios de carga)
    // Esperamos un breve momento y luego marcamos como inicializado.
    setTimeout(() => {
        handleFinishHydration(useUserStore.getState());
    }, 100);
  }
}
