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
            const { access_token } = data.data;

            // Decode the JWT token to get user information
            const decodedUser = decodeJwt(access_token);

            if (!decodedUser) {
                throw new Error("Invalid token");
            }
            // Fix: Use the store directly, not .call property
            const setAuth = useAuthStore.getState().setAuth;
            setAuth(decodedUser, access_token);
        },
        onError: (error) => {
            console.error("Login error:", error);
        },
    });
