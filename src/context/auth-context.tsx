"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { syncUserWithNeon, getUserProfile } from "@/lib/actions";

interface UserProfile {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber?: string | null;
    address?: string | null;
    district?: string | null;
}

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                // Split display name if available
                let firstName = null;
                let lastName = null;
                if (firebaseUser.displayName) {
                    const parts = firebaseUser.displayName.split(" ");
                    firstName = parts[0];
                    lastName = parts.slice(1).join(" ");
                }

                // Sync user with Neon
                const result = await syncUserWithNeon({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    firstName,
                    lastName,
                });

                if (result.success && result.user) {
                    setProfile(result.user as UserProfile);
                } else {
                    // Fallback to fetching if sync failed or just set what we have
                    const existingProfile = await getUserProfile(firebaseUser.uid);
                    setProfile(existingProfile as UserProfile);
                }
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, profile, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
