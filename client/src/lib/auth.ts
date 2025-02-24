import { create } from "zustand";
import { User } from "@shared/schema";
import { apiRequest } from "./queryClient";

interface AuthState {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  login: async (username: string, password: string) => {
    const res = await apiRequest("POST", "/api/auth/login", { username, password });
    const user = await res.json();
    set({ user });
  },
  logout: async () => {
    await apiRequest("POST", "/api/auth/logout");
    set({ user: null });
  },
}));
