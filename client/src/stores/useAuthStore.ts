import type { DecodedUser } from "@/utils/jwt";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthState {
    user: DecodedUser | undefined;
    accessToken: string | null;
    tokenExpireAt: number | null;
    isAuthenticated: boolean;
    setAuth: (user: DecodedUser, accessToken: string, expireAt: number) => void;
    setAccessToken: (accessToken: string, expireAt: number) => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: undefined,
            accessToken: null,
            tokenExpireAt: null,
            isAuthenticated: false,
            setAuth: (user, accessToken, expireAt) =>
                set({ user, accessToken, tokenExpireAt: expireAt, isAuthenticated: true }),
            setAccessToken: (accessToken, expireAt) => set({ accessToken, tokenExpireAt: expireAt }),
            clearAuth: () =>
                set({
                    user: undefined,
                    accessToken: null,
                    tokenExpireAt: null,
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
