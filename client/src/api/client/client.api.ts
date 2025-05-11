import API, { handleApiError } from "@/lib/axios";
import type { APIResponse } from "../api";
import type {
    ClientDetailResponse,
    ClientListResponse,
    ClientResponse,
    CreateClientRequest,
    UpdateClientRequest,
} from "./client.dao";

export const clientApi = {
    create: async (
        data: CreateClientRequest
    ): Promise<APIResponse<ClientDetailResponse>> => {
        try {
            const response = await API.post<APIResponse<ClientDetailResponse>>(
                "/clients",
                data
            );
            return response.data;
        } catch (error) {
            throw handleApiError<ClientDetailResponse>(error);
        }
    },

    getAll: async (): Promise<APIResponse<ClientListResponse>> => {
        try {
            const response = await API.get<APIResponse<ClientListResponse>>(
                "/clients"
            );
            return response.data;
        } catch (error) {
            throw handleApiError<ClientListResponse>(error);
        }
    },

    getById: async (id: string): Promise<APIResponse<ClientResponse>> => {
        try {
            const response = await API.get<APIResponse<ClientResponse>>(
                `/clients/${id}`
            );
            return response.data;
        } catch (error) {
            throw handleApiError<ClientResponse>(error);
        }
    },

    update: async (
        id: string,
        data: UpdateClientRequest
    ): Promise<APIResponse<ClientResponse>> => {
        try {
            const response = await API.put<APIResponse<ClientResponse>>(
                `/clients/${id}`,
                data
            );
            return response.data;
        } catch (error) {
            throw handleApiError<ClientResponse>(error);
        }
    },

    delete: async (id: string): Promise<APIResponse<null>> => {
        try {
            const response = await API.delete<APIResponse<null>>(
                `/clients/${id}`
            );
            return response.data;
        } catch (error) {
            throw handleApiError<null>(error);
        }
    },

    regenerateSecret: async (id: string): Promise<APIResponse<ClientDetailResponse>> => {
        try {
            const response = await API.post<APIResponse<ClientDetailResponse>>(
                `/clients/${id}/regenerate-secret`
            );
            return response.data;
        } catch (error) {
            throw handleApiError<ClientDetailResponse>(error);
        }
    },
    
    regenerateSecretByClientID: async (clientId: string): Promise<APIResponse<ClientDetailResponse>> => {
        try {
            const response = await API.post<APIResponse<ClientDetailResponse>>(
                `/clients/regenerate-secret/${clientId}`
            );
            return response.data;
        } catch (error) {
            throw handleApiError<ClientDetailResponse>(error);
        }
    },
};