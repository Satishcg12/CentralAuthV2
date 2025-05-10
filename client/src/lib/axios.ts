import type { APIResponse } from "@/api/api";
import { authApi } from "@/api/auth/auth.api";
import { API_BASE_URL, API_TIMEOUT } from "@/utils/config";
import { useAuthStore } from "@/stores/useAuthStore";
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const API = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // This is crucial for sending/receiving cookies
    timeout: API_TIMEOUT,
    headers: {
        "Content-Type": "application/json",
    },
});

// Track if we're currently refreshing the token
let isRefreshing = false;
// Store requests that should be retried after token refresh
let refreshSubscribers: ((token: string) => void)[] = [];

// Function to add request to queue
const addRefreshSubscriber = (callback: (token: string) => void) => {
    refreshSubscribers.push(callback);
};

// Function to process the queue with new token
const onRefreshed = (token: string) => {
    refreshSubscribers.forEach((callback) => callback(token));
    refreshSubscribers = [];
};

// Request interceptor to add token to requests
API.interceptors.request.use(
    (config) => {
        const authStore = useAuthStore.getState();
        const accessToken = authStore.accessToken;
        const tokenExpireAt = authStore.tokenExpireAt;

        // Add token to request if it exists
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
            
            // Check if token is near expiration (within 5 minutes)
            const isTokenExpiringSoon = tokenExpireAt && 
                tokenExpireAt - Math.floor(Date.now() / 1000) < 300;
                
            // Proactively refresh token if it's expiring soon and we're not already refreshing
            if (isTokenExpiringSoon && !isRefreshing && 
                !config.url?.includes('/auth/refresh') && 
                !config.url?.includes('/auth/login')) {
                
                // Set flag to prevent multiple refresh attempts
                isRefreshing = true;
                
                // Refresh the token in the background
                authApi.refreshToken({})
                    .then(response => {
                        if (response.data) {
                            const { access_token, expire_at } = response.data;
                            authStore.setAccessToken(access_token, expire_at);
                            onRefreshed(access_token);
                        }
                    })
                    .catch(error => {
                        console.error('Background token refresh failed:', error);
                        // Only clear auth if we get an actual auth error
                        if (axios.isAxiosError(error) && error.response?.status === 401) {
                            authStore.clearAuth();
                        }
                    })
                    .finally(() => {
                        isRefreshing = false;
                    });
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// Response interceptor to handle token refresh
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        // Skip token refresh for login-related endpoints when credentials are invalid
        const isLoginAttempt = originalRequest.url?.includes('/auth/login');
        const isRegisterAttempt = originalRequest.url?.includes('/auth/register');
        
        // If the error is 401 and we haven't already tried to refresh the token
        // Skip token refresh for login/register attempts
        if (error.response?.status === 401 && !originalRequest._retry 
            && !isLoginAttempt && !isRegisterAttempt) {
            // Check if we're not already refreshing
            if (!isRefreshing) {
                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    // Use the existing authApi function instead of direct API call
                    // Empty object since refresh token is in cookies
                    const response = await authApi.refreshToken({});

                    // Extract new access token and expiration time
                    if (!response.data) {
                        throw new Error('No response data received');
                    }

                    const { access_token, expire_at } = response.data;

                    if (!access_token) {
                        throw new Error('No access token received');
                    }

                    // Update token in store
                    const authStore = useAuthStore.getState();
                    authStore.setAccessToken(access_token, expire_at);

                    // Update the header for the original request
                    originalRequest.headers.Authorization = `Bearer ${access_token}`;

                    // Process any queued requests
                    onRefreshed(access_token);
                    isRefreshing = false;

                    // Retry the original request
                    return API(originalRequest);
                } catch (refreshError) {
                    // If refresh fails, logout
                    isRefreshing = false;
                    useAuthStore.getState().clearAuth();
                    return Promise.reject(refreshError);
                }
            } else {
                // If we're already refreshing, queue this request
                return new Promise((resolve) => {
                    addRefreshSubscriber((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        resolve(API(originalRequest));
                    });
                });
            }
        }

        return Promise.reject(error);
    },
);

export const handleApiError = <T>(error: unknown): never => {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<APIResponse<T>>;
      // Return the API error response if available
      if (axiosError.response?.data) {
        throw axiosError.response.data;
      }
      // Network or request error
      if (axiosError.request) {
        throw {
          message: "Network error. Please check your connection.",
          data: null,
          status: "internal_error",
          timestamp: new Date().toISOString()
        } as APIResponse<null>;
      }
    }
    
    // Fallback for non-Axios errors
    throw {
      success: false,
      message: error instanceof Error ? error.message : "An unknown error occurred",
      data: null,
      status: "error",
      timestamp: new Date().toISOString()
    } as APIResponse<null>;
  };
  

export default API;
