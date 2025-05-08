import API from "@/lib/axios";
import type { APIError, APIResponse } from "../api";
import type { RegisterRequest, RegisterResponse } from "./auth.dao";
import type { AxiosError } from "axios";

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
            const axiosError = error as AxiosError<APIResponse<null>>;
            throw axiosError.response?.data
            // throw error;
        }
    },
};
