
"use client";

import type { User } from "@/lib/types";
import { useState, useEffect, useCallback } from "react";

const USERS_STORAGE_KEY = "devtrack_users";

function getInitialUsers(): User[] {
  if (typeof window === "undefined") return [];
  const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
  return storedUsers ? JSON.parse(storedUsers) : [];
}

export function useUserStore() {
  const [users, setUsers] = useState<User[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setUsers(getInitialUsers());
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
  }, [users, isInitialized]);

  const addUser = useCallback((newUserData: Omit<User, "id" | "createdAt">) => {
    const newUser: User = {
      ...newUserData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setUsers((prevUsers) => [newUser, ...prevUsers]);
    return newUser;
  }, []);

  const getUsers = useCallback(() => users, [users]);
  
  const getUserById = useCallback((id: string): User | undefined => {
    return users.find(user => user.id === id);
  }, [users]);

  // Funciones para updateUser y deleteUser se pueden añadir aquí en el futuro.
  // const updateUser = useCallback((id: string, updatedData: Partial<Omit<User, "id" | "createdAt">>) => {
  //   setUsers(prev => prev.map(u => u.id === id ? {...u, ...updatedData, updatedAt: new Date().toISOString()} : u));
  // }, []);

  // const deleteUser = useCallback((id: string) => {
  //   setUsers(prev => prev.filter(u => u.id !== id));
  // }, []);

  return {
    users,
    addUser,
    getUsers,
    getUserById,
    // updateUser,
    // deleteUser,
    isInitialized,
  };
}
