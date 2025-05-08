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