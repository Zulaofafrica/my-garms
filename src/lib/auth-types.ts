// Auth types

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'customer' | 'designer';
    createdAt: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
}

export const AUTH_STORAGE_KEY = "mygarms_auth";

// Generate unique user ID
export const generateUserId = (): string => {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
