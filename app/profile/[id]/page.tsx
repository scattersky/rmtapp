"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy, updateDoc, addDoc, serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

import { Audio } from "react-loader-spinner";
import MusicListCard from "@/components/MusicListCard";
import AuthorCard from "@/components/AuthorCard";

export type Tone = {
  id: string;
  title?: string;
  shortDescription?: string;
  genres?: string[];
  instruments?: string[];
  image?: string;
  music_url?: string;
  createdBy?: string;
  createdAt?: any;
  hasUserReviewed?: boolean;
  average_rating?: number;
};

export default function UserProfilePage() {
  const { id } = useParams(); // 👈 userId from URL
  const { user, loading: authLoading } = useAuth();
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [tones, setTones] = useState<Tone[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [userReviewsMap, setUserReviewsMap] = useState<Record<string, boolean>>({});

  // 🔥 FETCH USER INFO
  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      const ref = doc(db, "users", id as string);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setUserData({ id: snap.id, ...snap.data() });
      }
    };

    fetchUser();
  }, [id]);

  // 🔥 FETCH USER TONES
  useEffect(() => {
    if (!id) return;

    const fetchTones = async () => {
      const q = query(
        collection(db, "tones"),
        where("createdBy", "==", id),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const data: Tone[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Tone, "id">),
      }));

      setTones(data);
      setLoading(false);
    };

    fetchTones();
  }, [id]);

  // CHECK IF USER HAS REVIEWED TONE
  useEffect(() => {
    if (!user) return;

    const fetchReviews = async () => {
      const snapshot = await getDocs(collection(db, "reviews"));

      const map: Record<string, boolean> = {};

      snapshot.forEach((doc) => {
        const data = doc.data();

        // if current user reviewed this tone
        if (data.userId === user.uid && data.toneId) {
          map[data.toneId] = true;
        }
      });

      setUserReviewsMap(map);
    };

    fetchReviews();
  }, [user]);

  // ❤️ FAVORITES
  const handleAddToFavorites = async (postID: string) => {
    if (!user) return;

    let updatedFavorites: string[];

    if (!userFavorites.includes(postID)) {
      updatedFavorites = [...userFavorites, postID];
    } else {
      updatedFavorites = userFavorites.filter((id) => id !== postID);
    }

    setUserFavorites(updatedFavorites);

    await updateDoc(doc(db, "users", user.uid), {
      favorites: updatedFavorites,
    });
  };

  const [openItemId, setOpenItemId] = useState(null);
  const toggleItem = (id: any) => {
    setOpenItemId((prev) => (prev === id ? null : id));
  };

  // ⭐ REVIEW
  const handleToneReviewSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (!user || !userData) return;

    const formData = new FormData(event.currentTarget);
    const toneId = formData.get("reviewToneID") as string;

    await addDoc(collection(db, "reviews"), {
      toneId,
      userId: user.uid,
      userName: userData.username || "Anonymous",
      userImage: userData.image || "/avatar.png",
      rating: reviewRating,
      text: reviewText,
      createdAt: serverTimestamp(),
    });

    setUserReviewsMap((prev) => ({
      ...prev,
      [toneId]: true,
    }));

    setReviewText("");
    setReviewRating(0);
  };


  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#141414]">
        <Audio height={100} width={100} color="#42b27c" />
      </div>
    );
  }

  if (!userData) {
    return <p className="text-white">User not found</p>;
  }

  return (
    <div className="bg-[#141414] min-h-screen text-white">

      {/* HEADER */}
      <div className="h-25 flex items-center border-b-[3px] border-white">
        <div className="mx-auto w-full max-w-341.5 p-4">
          <h1 className="text-3xl font-bold uppercase">
            @{userData.username}
          </h1>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="max-w-[1366px] mx-auto px-4 pb-6 pt-12 flex gap-6">

        {/* LEFT SIDE - AUTHOR CARD */}
        <div className="w-full md:w-[20%]">
          <AuthorCard author={userData} />
        </div>

        {/* RIGHT SIDE - USER TONES FEED */}
        <div className="w-full md:w-[80%]">

          {tones.length === 0 ? (
            <p className="text-gray-400">No tones uploaded yet.</p>
          ) : (
            tones.map((tone) => {
              const isFav = userFavorites.includes(tone.id);
              return (
              <MusicListCard
                key={tone.id}
                post={{
                  ...tone,
                  author_name: userData.username,
                  author_image_url: userData.image,
                }}
                isFav={isFav}
                onToggleFavorite={handleAddToFavorites}
                onToggleReview={toggleItem}
                openItemId={openItemId}
                reviewStatus={false}
                currentUserData={userData}
                handleToneReviewSubmit={handleToneReviewSubmit}
                onReviewTextChange={(e) => setReviewText(e.target.value)}
                onReviewRatingChange={setReviewRating}
                hasUserReviewed={!!userReviewsMap[tone.id]}
              />
            )})
          )}

        </div>
      </div>
    </div>
  );
}