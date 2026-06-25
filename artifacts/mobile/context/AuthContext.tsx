import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type UserRole = "user" | "gym_owner";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  setRole: (role: UserRole) => void;
  pendingRole: UserRole | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  setRole: () => {},
  pendingRole: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const stored = await AsyncStorage.getItem("se7enfit_user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, _password: string, role: UserRole) {
    const u: User = {
      id: Date.now().toString(),
      email,
      name: email.split("@")[0],
      role,
    };
    await AsyncStorage.setItem("se7enfit_user", JSON.stringify(u));
    setUser(u);
  }

  async function register(email: string, _password: string, name: string, role: UserRole) {
    const u: User = {
      id: Date.now().toString(),
      email,
      name,
      role,
    };
    await AsyncStorage.setItem("se7enfit_user", JSON.stringify(u));
    setUser(u);
  }

  async function logout() {
    await AsyncStorage.removeItem("se7enfit_user");
    setUser(null);
    setPendingRole(null);
  }

  function setRole(role: UserRole) {
    setPendingRole(role);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, setRole, pendingRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
