import { useMutation } from "@tanstack/react-query";
import { authApi } from "./auth.api";
import { useAuthStore } from "@/stores/useAuthStore";
import { decodeJwt } from "@/utils/jwt";

export const useRegister = () =>
    useMutation({
        mutationFn: authApi.register,
    });

export const useLogin = () =>
    useMutation({
        mutationFn: authApi.login,
        onSuccess: (data) => {
            // Extract token from response
            if (!data.data) {
                throw new Error("No response data received");
            }
            const { access_token, expire_at } = data.data;

            // Decode the JWT token to get user information
            const decodedUser = decodeJwt(access_token);

            if (!decodedUser) {
                throw new Error("Invalid token");
            }
            // Fix: Use the store directly, not .call property
            const setAuth = useAuthStore.getState().setAuth;
            setAuth(decodedUser, access_token, expire_at);
        },
        onError: (error) => {
            console.error("Login error:", error);
        },
    });

export const useLogout = () =>
    useMutation({
        mutationFn: authApi.logout,
        onSuccess: () => {
            // Clear the authentication state
            const clearAuth = useAuthStore.getState().clearAuth;
            clearAuth();
        },
        onError: (error) => {
            console.error("Logout error:", error);
        },
    });

export const useRefreshToken = () =>
    useMutation({
        mutationFn: authApi.refreshToken,
        onSuccess: (data) => {
            // Extract token from response
            if (!data.data) {
                throw new Error("No response data received");
            }
            const { access_token, expire_at } = data.data;

            // Decode the JWT token to get user information
            const decodedUser = decodeJwt(access_token);

            if (!decodedUser) {
                throw new Error("Invalid token");
            }
            
            // Update authentication state with new token and user info
            const setAuth = useAuthStore.getState().setAuth;
            setAuth(decodedUser, access_token, expire_at);
            
            return access_token;
        },
        onError: (error) => {
            console.error("Token refresh error:", error);
            // Clear auth on refresh failure
            const clearAuth = useAuthStore.getState().clearAuth;
            clearAuth();
        },
    });
