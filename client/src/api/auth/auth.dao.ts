export interface RegisterRequest {
    first_name: string;
    last_name: string;
    phone_number?: string;
    username: string;
    email: string;
    password: string;
    confirm_password: string;
}

export interface RegisterResponse {
    userId: number;
}

export interface LoginRequest {
    email: string;
    password: string;
}
export interface LoginResponse {
    access_token: string;
    refresh_token: string;
    user_id: number;
    expire_at: number;
}
export interface RefreshTokenRequest {
    refresh_token?: string;
}
export interface RefreshTokenResponse {
    access_token: string;
    refresh_token: string;
    user_id: number;
    expire_at: number;
}
export interface LogoutRequest {
    refresh_token?: string;
}
export interface LogoutResponse {
    success: boolean;
}
