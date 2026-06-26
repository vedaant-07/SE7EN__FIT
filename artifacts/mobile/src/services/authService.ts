import { api, clearToken, setToken } from "./apiClient";
import type { AuthResponse, User } from "../types";

export async function register(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/api/auth/register", { ...data, role: "user" }, false);
  await setToken(res.token);
  return res;
}

export async function login(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/api/auth/login", { ...data, role: "user" }, false);
  await setToken(res.token);
  return res;
}

export async function googleLogin(idToken: string): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/api/auth/google", { idToken, role: "user" }, false);
  await setToken(res.token);
  return res;
}

export async function getMe(): Promise<User> {
  const res = await api.get<{ user: User }>("/api/auth/me");
  return res.user;
}

export async function logout(): Promise<void> {
  try {
    await api.post("/api/auth/logout");
  } catch {
    // ignore
  }
  await clearToken();
}
