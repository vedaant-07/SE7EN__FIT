import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../config/constants";

const TOKEN_KEY = "se7enfit_token";

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: object;
  requireAuth?: boolean;
};

let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, requireAuth = true } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (requireAuth) {
    const token = await getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (res.status === 401) {
      await clearToken();
      onUnauthorized?.();
      throw new Error("Session expired. Please log in again.");
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error("Server returned an invalid response. Please try again.");
    }

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || data?.error || `Request failed (${res.status})`);
    }

    return data as T;
  } catch (err: unknown) {
    clearTimeout(timeout);
    if (err instanceof Error) {
      if (err.name === "AbortError") {
        throw new Error("Request timed out. Please check your connection.");
      }
      if (err.message.includes("Network request failed") || err.message.includes("fetch")) {
        throw new Error("Server unreachable. Please check your internet connection.");
      }
      throw err;
    }
    throw new Error("An unexpected error occurred.");
  }
}

export const api = {
  get: <T>(endpoint: string, requireAuth = true) =>
    request<T>(endpoint, { method: "GET", requireAuth }),
  post: <T>(endpoint: string, body?: object, requireAuth = true) =>
    request<T>(endpoint, { method: "POST", body, requireAuth }),
  put: <T>(endpoint: string, body?: object) =>
    request<T>(endpoint, { method: "PUT", body }),
  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: "DELETE" }),
};
