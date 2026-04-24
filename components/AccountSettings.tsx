"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser
} from "firebase/auth";
import { db } from "@/lib/firebase";
import {
  doc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore";

export default function AccountSettings() {
  const { user } = useAuth();

  // 🔥 EMAIL
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");

  // 🔥 PASSWORD
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 🔥 REAUTH
  const [reauthPassword, setReauthPassword] = useState("");
  const [showReauth, setShowReauth] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "email" | "password" | null
  >(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showDelete, setShowDelete] = useState(false);

  // =========================
  // REAUTH FUNCTION
  // =========================
  const handleReauth = async () => {
    if (!user || !user.email) return;

    try {
      setLoading(true);

      const credential = EmailAuthProvider.credential(
        user.email,
        reauthPassword
      );

      await reauthenticateWithCredential(user, credential);

      setShowReauth(false);
      setReauthPassword("");

      if (pendingAction === "email") await handleEmailUpdate(true);
      if (pendingAction === "password") await handlePasswordUpdate(true);
    } catch (err: any) {
      setError("Re-authentication failed. Check your password.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // EMAIL UPDATE
  // =========================
  const handleEmailUpdate = async (skipCheck = false) => {
    setError("");
    setMessage("");

    if (!user) return;

    if (!skipCheck) {
      if (!email.includes("@")) {
        setError("Invalid email");
        return;
      }

      if (email !== confirmEmail) {
        setError("Emails do not match");
        return;
      }
    }

    try {
      setLoading(true);

      await updateEmail(user, email);

      await updateDoc(doc(db, "users", user.uid), {
        email,
      });

      setMessage("Email updated successfully");

      setEmail("");
      setConfirmEmail("");
    } catch (err: any) {
      if (err.code === "auth/requires-recent-login") {
        setPendingAction("email");
        setShowReauth(true);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // PASSWORD UPDATE
  // =========================
  const handlePasswordUpdate = async (skipCheck = false) => {
    setError("");
    setMessage("");

    if (!user) return;

    if (!skipCheck) {
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }

    try {
      setLoading(true);

      await updatePassword(user, password);

      setMessage("Password updated successfully");

      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      if (err.code === "auth/requires-recent-login") {
        setPendingAction("password");
        setShowReauth(true);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // DELETE USER ACCOUNT
  // =========================
  const handleDeleteAccount = async () => {
    setError("");
    setMessage("");

    if (!user) return;

    if (deleteConfirmText !== "DELETE") {
      setError("You must type DELETE to confirm.");
      return;
    }

    try {
      setLoading(true);

      const uid = user.uid;

      // =========================
      // 1. DELETE USER DOC
      // =========================
      await deleteDoc(doc(db, "users", uid));

      // =========================
      // 2. DELETE USER TONES
      // =========================
      const tonesSnap = await getDocs(
        query(collection(db, "tones"), where("createdBy", "==", uid))
      );

      const batch1 = writeBatch(db);
      tonesSnap.forEach((d) => batch1.delete(d.ref));
      await batch1.commit();

      // =========================
      // 3. DELETE REVIEWS (written by user)
      // =========================
      const reviewsSnap = await getDocs(
        query(collection(db, "reviews"), where("userId", "==", uid))
      );

      const batch2 = writeBatch(db);
      reviewsSnap.forEach((d) => batch2.delete(d.ref));
      await batch2.commit();

      // =========================
      // 4. DELETE AUTH USER
      // =========================
      await deleteUser(user);

      setMessage("Account deleted successfully.");
    } catch (err: any) {
      if (err.code === "auth/requires-recent-login") {
        setError("Please re-authenticate before deleting your account.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };


  // =========================
  //  UI
  // =========================
  return (
    <>
    <div className="px-8 py-10 mb-6 flex flex-col gap-8 rounded-3xl border border-white/20 bg-[#1a1a1a] text-white">

      <h2 className="text-2xl font-bold">Account Settings</h2>

      {/* CURRENT INFO */}
      <div className="text-sm text-gray-400">
        Current Email: <span className="text-white">{user?.email}</span>
      </div>

      {/* ================= EMAIL ================= */}
      <div className="flex flex-col gap-3 max-w-[50%]">
        <h3 className="font-bold text-lg">Change Email</h3>

        <input
          type="email"
          placeholder="New Email"
          className="bg-[#424242] p-3 rounded-md"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="email"
          placeholder="Confirm New Email"
          className="bg-[#424242] p-3 rounded-md"
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
        />

        <button
          onClick={() => handleEmailUpdate()}
          className="bg-[#42B27B] px-4 py-2 rounded-md max-w-[170px]"
        >
          Update Email
        </button>
      </div>

      {/* ================= PASSWORD ================= */}
      <div className="flex flex-col gap-3 border-t border-white/10 pt-6 max-w-[50%]">
        <h3 className="font-bold text-lg">Change Password</h3>

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
          onClick={() => handlePasswordUpdate()}
          className="bg-[#42B27B] px-4 py-2 rounded-md max-w-[170px]"
        >
          Update Password
        </button>
      </div>



      {/* STATUS */}
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {message && <p className="text-[#42B27B] text-sm">{message}</p>}

      {/* ================= REAUTH MODAL ================= */}
      {showReauth && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-[#1a1a1a] p-6 rounded-xl w-[400px] flex flex-col gap-4 border border-white/20">

            <h3 className="text-lg font-bold">
              Confirm Your Password
            </h3>

            <p className="text-sm text-gray-400">
              For security, please re-enter your current password.
            </p>

            <input
              type="password"
              placeholder="Current Password"
              className="bg-[#424242] p-3 rounded-md"
              value={reauthPassword}
              onChange={(e) => setReauthPassword(e.target.value)}
            />

            <button
              onClick={handleReauth}
              className="bg-[#42B27B] px-4 py-2 rounded-md"
            >
              Confirm
            </button>

            <button
              onClick={() => setShowReauth(false)}
              className="text-sm text-gray-400"
            >
              Cancel
            </button>

          </div>
        </div>
      )}

    </div>
      <div className="px-8 py-10 mb-6 flex flex-col gap-8 rounded-3xl border border-white/20 bg-[#1a1a1a] text-white">
        <h2 className="text-2xl font-bold">Danger Zone</h2>

        {/* ================= DELETE ACCOUNT ================= */}
        <div className=" flex flex-col gap-3">


          <button
            onClick={() => setShowDelete(true)}
            className="bg-red-600 px-4 py-2 rounded-md w-fit cursor-pointer"
          >
            Delete Account
          </button>

        </div>
        {/* ================= CONFIRM DELETE ACCOUNT MODAL ================= */}
        {showDelete && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
            <div className="bg-[#1a1a1a] p-6 rounded-xl w-[420px] flex flex-col gap-4 border border-white/20">

              <h3 className="text-lg font-bold text-red-400">
                Delete Account
              </h3>

              <p className="text-sm text-gray-400">
                This action is permanent. Type <span className="text-white font-bold">DELETE</span> to confirm.
              </p>

              <input
                className="bg-[#424242] p-3 rounded-md"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE"
              />

              <button
                onClick={handleDeleteAccount}
                className="bg-red-600 px-4 py-2 rounded-md"
              >
                Permanently Delete Account
              </button>

              <button
                onClick={() => setShowDelete(false)}
                className="text-sm text-gray-400"
              >
                Cancel
              </button>

            </div>
          </div>
        )}
      </div>
    </>
  );
}