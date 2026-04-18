"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading]);

    if (loading) return <p>Loading...</p>;

    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold">
                Welcome {user?.displayName || user?.email}
            </h1>

            <button
                className="mt-4 bg-red-500 text-white px-4 py-2"
                onClick={logout}
            >
                Logout
            </button>
        </div>
    );
}