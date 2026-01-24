
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi, User } from "@/lib/api-client";
import { useRouter } from "next/navigation";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (data: { email: string; password: string }) => Promise<User>;
    signup: (data: any) => Promise<User>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const refreshUser = async () => {
        try {
            const data = await authApi.me();
            setUser(data.user);
        } catch {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    const login = async (data: { email: string; password: string }) => {
        const res = await authApi.login(data);
        setUser(res.user);
        router.refresh(); // Sync server components if any
        return res.user;
    };

    const signup = async (data: any) => {
        const res = await authApi.signup(data);
        setUser(res.user);
        router.refresh();
        return res.user;
    };

    const logout = async () => {
        await authApi.logout();
        setUser(null);
        router.push("/");
        router.refresh();
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, signup, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
