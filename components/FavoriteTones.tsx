"use client";

import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

import { Audio } from "react-loader-spinner";
import MusicListCard from "@/components/MusicListCard";

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
  average_rating?: number;

};

export default function FavoriteTones() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [tones, setTones] = useState<Tone[]>([]);
  const [loading, setLoading] = useState(true);

  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [userReviewsMap, setUserReviewsMap] = useState<Record<string, boolean>>(
    {}
  );

  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [authorMap, setAuthorMap] = useState<Record<string, any>>({});

  const toggleItem = (id: string) => {
    setOpenItemId((prev) => (prev === id ? null : id));
  };

  // 🔥 AUTH + USER DATA
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return;

      setUser(u);

      const ref = doc(db, "users", u.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setUserData(data);
        setFavorites(data.favorites || []);
      }
    });

    return () => unsub();
  }, []);

  // 🔥 FETCH FAVORITE TONES (chunked)
  useEffect(() => {
    if (favorites.length === 0) {
      setTones([]);
      setLoading(false);
      return;
    }

    const fetchTones = async () => {
      try {
        const chunkSize = 10;
        const chunks = [];

        for (let i = 0; i < favorites.length; i += chunkSize) {
          chunks.push(favorites.slice(i, i + chunkSize));
        }

        let allTones: Tone[] = [];

        for (const chunk of chunks) {
          const q = query(
            collection(db, "tones"),
            where("__name__", "in", chunk)
          );

          const snapshot = await getDocs(q);

          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Tone, "id">),
          }));

          allTones = [...allTones, ...data];
        }

        // optional sort
        allTones.sort(
          (a, b) =>
            (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        );

        setTones(allTones);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTones();
  }, [favorites]);

  useEffect(() => {
    if (tones.length === 0) return;

    const fetchAuthors = async () => {
      const newMap: Record<string, any> = { ...authorMap };

      const uniqueUserIds = [
        ...new Set(
          tones
            .map((t) => t.createdBy)
            .filter((uid): uid is string => typeof uid === "string")
        ),
      ];

      const missingIds = uniqueUserIds.filter((id) => !newMap[id]);

      if (missingIds.length === 0) return;

      const promises = missingIds.map(async (uid) => {
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) {
          newMap[uid] = snap.data();
        }
      });

      await Promise.all(promises);

      setAuthorMap(newMap);
    };

    fetchAuthors();
  }, [tones]);

  // 🔥 FETCH USER REVIEWS
  useEffect(() => {
    if (!user) return;

    const fetchReviews = async () => {
      const snapshot = await getDocs(collection(db, "reviews"));

      const map: Record<string, boolean> = {};

      snapshot.forEach((doc) => {
        const data = doc.data();

        if (data.userId === user.uid && data.toneId) {
          map[data.toneId] = true;
        }
      });

      setUserReviewsMap(map);
    };

    fetchReviews();
  }, [user]);

  // ❤️ FAVORITES TOGGLE
  const handleAddToFavorites = async (postID: string) => {
    if (!user) return;

    let updatedFavorites: string[];

    if (!favorites.includes(postID)) {
      updatedFavorites = [...favorites, postID];
    } else {
      updatedFavorites = favorites.filter((id) => id !== postID);
    }

    setFavorites(updatedFavorites);

    await updateDoc(doc(db, "users", user.uid), {
      favorites: updatedFavorites,
    });
  };

  // ⭐ SUBMIT REVIEW
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Audio height={80} width={80} color="#42b27c" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">

      {tones.length === 0 ? (
        <p className="text-gray-400">No favorite tones yet.</p>
      ) : (
        tones.map((tone) => {
          const isFav = favorites.includes(tone.id);
          const author = tone.createdBy ? authorMap[tone.createdBy] : null;

          return (
            <MusicListCard
              key={tone.id}
              post={{
                ...tone,
                author_name: author?.username || "Unknown",
                author_image_url: author?.image || "/avatar.png",
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
          );
        })
      )}
    </div>
  );
}