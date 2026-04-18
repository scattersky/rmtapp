"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";
import {
    User,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

type AuthContextType = {
    user: User | null;
    loading: boolean;
    register: (data: RegisterData) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
};
type RegisterData = {
    firstName: string;
    lastName: string;
    username: string;
    age: string;
    city: string;
    state: string;
    country: string;
    bio: string;
    youtube: string;
    instagram: string;
    soundcloud: string;
    spotify: string;
    email: string;
    password: string;
};
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    // REGISTER
    const register = async (data: RegisterData) => {
        const { email, password, firstName, lastName, ...rest } = data;

        const cred = await createUserWithEmailAndPassword(auth, email, password);

        if (!cred.user) return;

        const uid = cred.user.uid;

        // Optional: Set display name
        await updateProfile(cred.user, {
            displayName: `${firstName} ${lastName}`,
        });

        // 🔥 Save ALL extra fields in Firestore
        await setDoc(doc(db, "users", uid), {
            uid,
            email,
            firstName,
            lastName,
            ...rest,
            createdAt: new Date(),
        });
    };

    // LOGIN
    const login = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    // LOGOUT
    const logout = async () => {
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, loading, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}