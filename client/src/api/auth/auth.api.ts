import API, { handleApiError } from "@/lib/axios";
import type { APIResponse } from "../api";
import type {
    LoginRequest,
    LoginResponse,
    LogoutRequest,
    LogoutResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
    RegisterRequest,
    RegisterResponse,
} from "./auth.dao";

export const authApi = {
    register: async (
        data: RegisterRequest,
    ): Promise<APIResponse<RegisterResponse>> => {
        try {
            // Perform the registration request
            const response = await API.post<APIResponse<RegisterResponse>>(
                "/auth/register",
                data,
            );
            return response.data;
        } catch (error) {
            throw handleApiError<RegisterResponse>(error);
        }
    },
    login: async (
        data: LoginRequest,
    ): Promise<APIResponse<LoginResponse>> => {
        try {
            // Perform the login request
            const response = await API.post<APIResponse<LoginResponse>>(
                "/auth/login",
                data,
            );
            return response.data;
        } catch (error) {
            throw handleApiError<LoginResponse>(error);
        }
    },

    logout: async (
        data: LogoutRequest,
    ): Promise<APIResponse<LogoutResponse>> => {
        try {
            // Perform the logout request
            const response = await API.post<APIResponse<LogoutResponse>>(
                "/auth/logout",
                data,
            );
            return response.data;
        } catch (error) {
            throw handleApiError<LogoutResponse>(error);
        }
    },
    
    refreshToken: async (
        data: RefreshTokenRequest,
    ): Promise<APIResponse<RefreshTokenResponse>> => {
        try {
            // Perform the token refresh request
            const response = await API.post<APIResponse<RefreshTokenResponse>>(
                "/auth/refresh",
                data,
            );
            return response.data;
        } catch (error) {
            throw handleApiError<RefreshTokenResponse>(error);
        }
    },
};
