import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { API_CONFIG } from "../config/api";

type UserProfile = {
    id: string;
    email: string;
    name: string;
    role: "CITIZEN" | "ADMIN" | "DEPT_OFFICER";
    points: number;
};

type AuthContextType = {
    isSignedIn: boolean;
    user: UserProfile | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    refreshProfile: () => Promise<void>;
    getToken: () => Promise<string | null>;
    signOut: () => Promise<void>;
};

const AUTH_TOKEN_KEY = "zensolve_access_token";

const AuthContext = createContext<AuthContextType>({
    isSignedIn: false,
    user: null,
    loading: true,
    signIn: async () => { },
    register: async () => { },
    refreshProfile: async () => { },
    getToken: async () => null,
    signOut: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const bootstrap = async () => {
            const storedToken = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
            setToken(storedToken);
            if (storedToken) {
                await fetchProfile(storedToken);
            }
            setLoading(false);
        };
        bootstrap();
    }, []);

    const fetchProfile = async (accessToken: string) => {
        try {
            const response = await fetch(API_CONFIG.ENDPOINTS.PROFILE, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch profile");
            }

            const profile = await response.json();
            setUser(profile.data || profile); // Handle both { success: true, data: { ... } } and direct profile objects Let's just use profile.data
        } catch (error) {
            console.error("Profile fetch failed:", error);
            await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
            setToken(null);
            setUser(null);
        }
    };

    const signIn = async (email: string, password: string) => {
        const response = await fetch(API_CONFIG.ENDPOINTS.LOGIN, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || "Login failed");
        }

        const accessToken = result?.token;
        if (!accessToken) {
            throw new Error("Missing access token in login response");
        }

        await SecureStore.setItemAsync(AUTH_TOKEN_KEY, accessToken);
        setToken(accessToken);
        await fetchProfile(accessToken);
    };

    const register = async (name: string, email: string, password: string) => {
        const response = await fetch(API_CONFIG.ENDPOINTS.REGISTER, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || "Registration failed");
        }
    };

    const refreshProfile = async () => {
        if (!token) return;
        await fetchProfile(token);
    };

    const getToken = async () => token;

    const signOut = async () => {
        if (token) {
            await fetch(API_CONFIG.ENDPOINTS.LOGOUT, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            }).catch(() => null);
        }

        await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            isSignedIn: !!token,
            user,
            loading,
            signIn,
            register,
            refreshProfile,
            getToken,
            signOut,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
