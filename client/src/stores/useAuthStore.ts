import type { DecodedUser } from "@/utils/jwt";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthState {
    user: DecodedUser | undefined;
    accessToken: string | null;
    isAuthenticated: boolean;
    setAuth: (user: DecodedUser, accessToken: string) => void;
    setAccessToken: (accessToken: string) => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: undefined,
            accessToken: null,
            isAuthenticated: false,
            setAuth: (user, accessToken) =>
                set({ user, accessToken, isAuthenticated: true }),
            setAccessToken: (accessToken) => set({ accessToken }),
            clearAuth: () =>
                set({
                    user: undefined,
                    accessToken: null,
                    isAuthenticated: false,
                }),
        }),
        {
            name: "auth-storage", // Local storage key
            storage: createJSONStorage(() => localStorage), // Use local storage
            version: 1,
        },
    ),
);
