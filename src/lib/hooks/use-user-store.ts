
"use client";

import type { User } from "@/lib/types";
import { useState, useEffect, useCallback } from "react";

const USERS_STORAGE_KEY = "devtrack_users";

function getInitialUsers(): User[] {
  if (typeof window === "undefined") return [];
  try {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (storedUsers) {
      const parsedUsers = JSON.parse(storedUsers);
      if (Array.isArray(parsedUsers) && parsedUsers.every(u => typeof u === 'object' && u !== null && 'id' in u && 'name' in u && 'email' in u)) {
        return parsedUsers;
      }
    }
  } catch (error) {
    console.error("Error al parsear usuarios desde localStorage:", error);
    // Si hay error, es mejor empezar con un array vacío que romper la app.
  }
  return [];
}

export function useUserStore() {
  const [users, setUsers] = useState<User[]>(() => getInitialUsers());
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Seteamos isInitialized a true después de que el estado inicial (posiblemente de localStorage) se ha cargado.
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
  }, [users, isInitialized]);

  const addUser = useCallback((newUserData: Omit<User, "id" | "createdAt" | "avatarUrl"> & { password?: string }) => {
    const newUser: User = {
      name: newUserData.name,
      email: newUserData.email,
      password: newUserData.password, // Guardar contraseña
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setUsers((prevUsers) => [newUser, ...prevUsers].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    return newUser;
  }, []);

  const getUsers = useCallback(() => users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [users]);
  
  const getUserById = useCallback((id: string): User | undefined => {
    return users.find(user => user.id === id);
  }, [users]);

  const getUserByEmail = useCallback((email: string): User | undefined => {
    return users.find(user => user.email.toLowerCase() === email.toLowerCase());
  }, [users]);


  return {
    users,
    addUser,
    getUsers,
    getUserById,
    getUserByEmail,
    isInitialized,
  };
}
