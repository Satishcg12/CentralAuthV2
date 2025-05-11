export interface CreateClientRequest {
    name: string;
    description: string;
    website?: string;
    redirect_uri: string;
    is_public: boolean;
}

export interface UpdateClientRequest {
    name: string;
    description: string;
    website?: string;
    redirect_uri: string;
    is_public: boolean;
}

export interface ClientResponse {
    id: number;
    client_id: string;
    name: string;
    description: string;
    website: string;
    redirect_uri: string;
    is_public: boolean;
    created_at: string;
    updated_at: string;
}

export interface ClientDetailResponse extends ClientResponse {
    client_secret: string;
}

export interface ClientListResponse {
    clients: ClientResponse[];
    total: number;
}