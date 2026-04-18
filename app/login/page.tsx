"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            await login(email, password);
            router.push("/");
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
      <>
        <div className="max-w-md w-full mx-auto flex flex-col justify-center items-center h-200 gap-4">
          <h1 className='text-white text-4xl font-bold'>Login</h1>
          <input
            className="border p-2 w-full bg-white"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="border p-2 w-full bg-white"
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="bg-[#53A870] text-white p-2 w-full" onClick={handleLogin}>
            Login
          </button>
        </div>
      </>

    );
}