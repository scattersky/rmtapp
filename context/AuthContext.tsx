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

import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

/* ---------------- TYPES ---------------- */

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

type AuthContextType = {
    user: User | null;
    userData: any | null;
    loading: boolean;

    register: (data: RegisterData) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
};

/* ---------------- CONTEXT ---------------- */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ---------------- PROVIDER ---------------- */

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (u) => {
            setUser(u);
            setLoading(true);

            if (!u) {
                setUserData(null);
                setLoading(false);
                return;
            }

            try {
                const snap = await getDoc(doc(db, "users", u.uid));

                if (snap.exists()) {
                    setUserData({
                        id: snap.id,
                        ...snap.data(),
                    });
                } else {
                    setUserData(null);
                }
            } catch (err) {
                console.error("Error fetching user data:", err);
                setUserData(null);
            }

            setLoading(false);
        });

        return () => unsub();
    }, []);

    /* ---------------- AUTH METHODS ---------------- */

    const register = async (data: RegisterData) => {
        const { email, password, firstName, lastName, ...rest } = data;

        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const uid = cred.user.uid;

        await updateProfile(cred.user, {
            displayName: `${firstName} ${lastName}`,
        });

        await setDoc(doc(db, "users", uid), {
            uid,
            email,
            firstName,
            lastName,
            ...rest,
            createdAt: new Date(),
        });
    };

    const login = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const logout = async () => {
        await signOut(auth);
    };

    /* ---------------- PROVIDER VALUE ---------------- */

    return (
      <AuthContext.Provider
        value={{
            user,
            userData,
            loading,
            register,
            login,
            logout,
        }}
      >
          {children}
      </AuthContext.Provider>
    );
}

/* ---------------- HOOK ---------------- */

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }

    return context;
}