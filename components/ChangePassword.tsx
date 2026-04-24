"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { updatePassword } from "firebase/auth";

export default function ChangePassword() {
  const { user } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChangePassword = async () => {
    setError("");
    setMessage("");

    if (!user) return;

    // ✅ validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await updatePassword(user, password);

      setMessage("Password updated successfully");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      // 🔥 important Firebase error
      if (err.code === "auth/requires-recent-login") {
        setError("For security, please log out and log back in before changing your password.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 flex flex-col gap-6 rounded-3xl border border-white/20 bg-[#1a1a1a] text-white">

      <h2 className="text-2xl font-bold">Change Password</h2>

      <div className="flex flex-col gap-3">

        <input
          type="password"
          placeholder="New Password"
          className="bg-[#424242] p-3 rounded-md"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm New Password"
          className="bg-[#424242] p-3 rounded-md"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          onClick={handleChangePassword}
          disabled={loading}
          className="bg-[#53A870] px-4 py-2 rounded-md"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        {message && (
          <p className="text--[#42b27c] text-sm">{message}</p>
        )}

      </div>
    </div>
  );
}