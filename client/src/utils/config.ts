// Application Configuration
export const APP_ENV = import.meta.env.MODE || "development";

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL ||
    "http://localhost:8080/api/v1";
export const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 10000;

// Application Settings
export const APP_NAME = import.meta.env.VITE_APP_NAME || "CentralAuth";
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || "1.0.0";
export const APP_DESCRIPTION = import.meta.env.VITE_APP_DESCRIPTION ||
    "Central Authentication Service";
export const APP_AUTHOR = import.meta.env.VITE_APP_AUTHOR || "Satish Chaudhary";
export const APP_LOGO = import.meta.env.VITE_APP_LOGO || "/logo2.png";

// Feature Flags
export const ENABLE_MULTI_FACTOR_AUTH =
    import.meta.env.VITE_ENABLE_MULTI_FACTOR_AUTH === "true";
export const ENABLE_QR_LOGIN = import.meta.env.VITE_ENABLE_QR_LOGIN === "true";
