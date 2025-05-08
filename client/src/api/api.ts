
export interface APIResponse<T> {
    status: string;
    message: string;
    data?: T;
    error?: APIError;
    timestamp: string;
}

// Error response type
export interface APIError {
    code: string;
    description: string;
    details?: Record<string, any>;
}
