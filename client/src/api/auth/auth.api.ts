import API, { handleApiError } from "@/lib/axios";
import type { AxiosError } from "axios";
import type { APIResponse } from "../api";
import type {
    LoginRequest,
    LoginResponse,
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
            // throw error;
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
            // throw error;
        }
    },
};
