"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {IoIosSkipBackward} from "react-icons/io";

export default function LoginPage() {
  const { login, resetPassword } = useAuth();
  const router = useRouter();

  const [isForgot, setIsForgot] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err: any) {
      alert(err.message);
    }
    setLoading(false);
  };

  const handleReset = async () => {
    if (!email) {
      alert("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      alert("Password reset email sent!");
      setIsForgot(false); // go back to login
    } catch (err: any) {
      alert(err.message);
    }
    setLoading(false);
  };

  const goBack = () => {
    router.back();
  }

  return (
    <>
      <div className='h-25 flex justify-between items-center  bg-[#141414] border-b-[3px] border-white'>
        <div className='mx-auto w-full max-w-341.5 p-4'>
          <h1 className='text-white text-3xl font-bold uppercase'>
          Rate My Tone
          </h1>

        </div>
      </div>
      <div className="max-w-md w-full mx-auto flex flex-col justify-center items-center h-[80vh] gap-4">
        <div className="p-5 mb-6 flex flex-col min-w-[400px] gap-6 rounded-3xl border border-white/20 bg-[#1a1a1a]">

          {/* TITLE */}
          <h1 className="text-white text-4xl font-bold">
            {isForgot ? "Reset Password" : "Login"}
          </h1>

          {/* EMAIL */}
          <input
            className="border p-2 w-full bg-white"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* PASSWORD (ONLY LOGIN MODE) */}
          {!isForgot && (
            <input
              className="border p-2 w-full bg-white"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}

          {/* BUTTON */}
          <button
            className="bg-[#53A870] text-white p-2 w-full"
            onClick={isForgot ? handleReset : handleLogin}
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isForgot
                ? "Send Reset Email"
                : "Login"}
          </button>

          {/* TOGGLE */}
          {!isForgot ? (
            <button
              className="text-sm text-[#53A870] text-left"
              onClick={() => setIsForgot(true)}
            >
              Forgot Password?
            </button>
          ) : (
            <button
              className="text-sm text-[#53A870] text-left"
              onClick={() => setIsForgot(false)}
            >
              Back to Login
            </button>
          )}
        </div>
      </div>
    </>

  );
}