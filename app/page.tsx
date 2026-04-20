"use client";

import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import MusicListCard from "@/components/MusicListCard";

import { Audio } from "react-loader-spinner";
import ScrollToTop from "react-scroll-to-top";
import { FaArrowUp } from "react-icons/fa6";
import { MdAdd, MdArrowDownward, MdArrowUpward } from "react-icons/md";
import { SlideDown } from "react-slidedown";

import {Collapse} from 'react-collapse';
import {useRouter} from "next/navigation";

export type Tone = {
  id: string;
  title?: string;
  shortDescription?: string;
  genres?: string[];
  instruments?: string[];
  image?: string;
  createdBy?: string;
  createdAt?: any;

  author_name?: string;
  author_image_url?: string;

  music_url?: string;
  review_count?: number;
  average_rating?: number;
};



export default function ToneFeed() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [currentUserLoading, setCurrentUserLoading] = useState(true);

  const [data, setData] = useState<Tone[]>([]);
  const [filteredData, setFilteredData] = useState<Tone[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ FIXED HERE
  const [userFavorites, setUserFavorites] = useState<string[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewStatus, setReviewStatus] = useState(false);


  const [genreOperator, setGenreOperator] = useState<"AND" | "OR">("OR");
  const [instrumentOperator, setInstrumentOperator] = useState<"AND" | "OR">("OR");

  const [isInstrumentsOpen, setIsInstrumentsOpen] = useState(false);
  const [isGenresOpen, setIsGenresOpen] = useState(false);

  const [userReviewsMap, setUserReviewsMap] = useState<Record<string, boolean>>({});



  // 🔥 FETCH TONES
  useEffect(() => {
    const fetchTones = async () => {
      const q = query(collection(db, "tones"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const tones: Tone[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Tone, "id">),
      }));

      // 🧠 GET UNIQUE USER IDS
      const userIds = [
        ...new Set(
          tones
            .map((t) => t.createdBy)
            .filter((id): id is string => typeof id === "string")
        ),
      ];
      // 🔥 FETCH USERS
      const userDocs = await Promise.all(
        userIds.map((uid) => getDoc(doc(db, "users", uid)))
      );

      const userMap: Record<string, any> = {};

      userDocs.forEach((snap) => {
        if (snap.exists()) {
          userMap[snap.id] = snap.data();
        }
      });

      // 🔗 MERGE USER DATA INTO TONES
      const tonesWithAuthors = tones.map((tone) => {
        if (!tone.createdBy) {
          return {
            ...tone,
            author_name: "Unknown",
            author_image_url: "/avatar.png",
          };
        }

        const userData = userMap[tone.createdBy];

        return {
          ...tone,
          author_name: userData?.username || "Unknown",
          author_image_url: userData?.image || "/avatar.png",
        };
      });

      setData(tonesWithAuthors);
      setFilteredData(tonesWithAuthors);
      setLoading(false);
    };

    fetchTones();
  }, []);

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

  // 🔥 FETCH USER
  useEffect(() => {
    if (!user) return;

    const fetchUser = async () => {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const userData = snap.data();
        setCurrentUserData(userData);
        setUserFavorites(userData.favorites || []);
      }

      setCurrentUserLoading(false);
    };

    fetchUser();
  }, [user]);

  // FILTER TONES
  useEffect(() => {
    const term = searchTerm.toLowerCase();

    const results = data
      .filter((item) => {
        // 🔍 TEXT SEARCH
        const matchesText =
          !term ||
          item.title?.toLowerCase().includes(term) ||
          item.shortDescription?.toLowerCase().includes(term);

        // 🎯 GENRES LOGIC
        const genres = item.genres ?? [];
        let matchesGenres = true;
        if (selectedGenres.length > 0) {
          if (genreOperator === "OR") {
            matchesGenres = genres.some((g) =>
              selectedGenres.includes(g)
            );
          } else {
            matchesGenres = selectedGenres.every((g) =>
              item.genres?.includes(g)
            );
          }
        }

        // 🎸 INSTRUMENTS LOGIC
        const instruments = item.instruments ?? [];
        let matchesInstruments = true;
        if (selectedInstruments.length > 0) {
          if (instrumentOperator === "OR") {
            matchesInstruments = instruments.some((i) =>
              selectedInstruments.includes(i)
            );
          } else {
            matchesInstruments = selectedInstruments.every((i) =>
              item.instruments?.includes(i)
            );
          }
        }

        return matchesText && matchesGenres && matchesInstruments;
      })
      .sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date();
        const dateB = b.createdAt?.toDate?.() || new Date();

        return sortOrder === "newest"
          ? dateB.getTime() - dateA.getTime()
          : dateA.getTime() - dateB.getTime();
      });

    setFilteredData(results);
  }, [
    searchTerm,
    selectedGenres,
    selectedInstruments,
    genreOperator,
    instrumentOperator,
    sortOrder,
    data,
  ]);

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

  // ⭐ REVIEW
  const handleToneReviewSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (!user || !currentUserData) return;

    const formData = new FormData(event.currentTarget);
    const toneId = formData.get("reviewToneID") as string;

    await addDoc(collection(db, "reviews"), {
      toneId,
      userId: user.uid,
      userName: currentUserData.username || "Anonymous",
      userImage: currentUserData.image || "/avatar.png",
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

  const [openItemId, setOpenItemId] = useState(null);
  const toggleItem = (id: any) => {
    setOpenItemId((prev) => (prev === id ? null : id));
  };



  if (loading || currentUserLoading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#141414]">
        <Audio height={100} width={100} color="#42b27c" />
      </div>
    );
  }

  return (
    <div className="bg-[#141414] min-h-screen text-white">
      <div className='h-25 flex justify-between items-center  bg-[#141414] border-b-[3px] border-white'>
        <div className='mx-auto w-full max-w-341.5 p-4'>
          <h1 className='text-white text-3xl font-bold uppercase'>
            Tone Feed
          </h1>
        </div>
      </div>

      <div className="max-w-[1366px] mx-auto px-6 pb-6 pt-12 flex gap-16">
        {/* SIDEBAR */}
        <div className="w-[20%]">

          {/*TONE FEED FILTER COMPONENT*/}
          <div className="flex flex-col gap-6">

            {/* 🔍 SEARCH */}
            <div>
              <h3 className="text-sm uppercase tracking-widest mb-2">Search</h3>
              <input
                type="text"
                placeholder="Search tones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 rounded-md text-white border border-gray-400"
              />
            </div>

            {/* 🎵 GENRES */}
            <div>
              <div className="flex justify-between items-center">
                <h3 className="text-sm uppercase tracking-widest">Genres</h3>
                <button onClick={() => setIsGenresOpen(!isGenresOpen)}>
                  <MdAdd />
                </button>
              </div>
              <Collapse isOpened={isGenresOpen}>
                <div className="mt-2">
                  {[
                    "Rock","Pop","Hip Hop","Jazz","Electronic","Metal","Country"
                  ].map((genre) => (
                    <label key={genre} className="block text-sm">
                      <input
                        type="checkbox"
                        value={genre}
                        checked={selectedGenres.includes(genre)}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedGenres((prev) =>
                            prev.includes(val)
                              ? prev.filter((x) => x !== val)
                              : [...prev, val]
                          );
                        }}
                      />
                      <span className="ml-2">{genre}</span>
                    </label>
                  ))}
                </div>
                {/* OPERATOR TOGGLE */}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setGenreOperator("OR")}
                    className={`px-2 py-1 text-xs rounded ${
                      genreOperator === "OR" ? "bg-[#42b27c]" : "border"
                    }`}
                  >
                    OR
                  </button>
                  <button
                    onClick={() => setGenreOperator("AND")}
                    className={`px-2 py-1 text-xs rounded ${
                      genreOperator === "AND" ? "bg-[#42b27c]" : "border"
                    }`}
                  >
                    AND
                  </button>
                </div>
              </Collapse>

            </div>

            {/* 🎸 INSTRUMENTS */}
            <div>
              <div className="flex justify-between items-center">
                <h3 className="text-sm uppercase tracking-widest">Instruments</h3>
                <button onClick={() => setIsInstrumentsOpen(!isInstrumentsOpen)}>
                  <MdAdd />
                </button>
              </div>

              <Collapse isOpened={isInstrumentsOpen}>
                <div className="mt-2">
                  {[
                    "Guitar","Piano","Drums","Bass","Synth","Vocals"
                  ].map((inst) => (
                    <label key={inst} className="block text-sm">
                      <input
                        type="checkbox"
                        value={inst}
                        checked={selectedInstruments.includes(inst)}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedInstruments((prev) =>
                            prev.includes(val)
                              ? prev.filter((x) => x !== val)
                              : [...prev, val]
                          );
                        }}
                      />
                      <span className="ml-2">{inst}</span>
                    </label>
                  ))}
                </div>
                {/* OPERATOR TOGGLE */}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setInstrumentOperator("OR")}
                    className={`px-2 py-1 text-xs rounded ${
                      instrumentOperator === "OR" ? "bg-[#42b27c]" : "border"
                    }`}
                  >
                    OR
                  </button>
                  <button
                    onClick={() => setInstrumentOperator("AND")}
                    className={`px-2 py-1 text-xs rounded ${
                      instrumentOperator === "AND" ? "bg-[#42b27c]" : "border"
                    }`}
                  >
                    AND
                  </button>
                </div>
              </Collapse>
            </div>
          </div>

        </div>

        {/* FEED */}
        <div className="w-[80%]">
          {filteredData.map((post) => {
            const isFav = userFavorites.includes(post.id);

            return (
              <MusicListCard
                key={post.id}
                post={post}
                isFav={isFav}
                onToggleFavorite={handleAddToFavorites}
                onToggleReview={toggleItem}
                openItemId={openItemId}
                reviewStatus={reviewStatus}
                currentUserData={currentUserData}
                handleToneReviewSubmit={handleToneReviewSubmit}
                onReviewTextChange={(e) => setReviewText(e.target.value)}
                onReviewRatingChange={setReviewRating}
                hasUserReviewed={!!userReviewsMap[post.id]}

              />
            );
          })}
        </div>
      </div>

      <ScrollToTop smooth className="bg-[#42b27c]" component={<FaArrowUp />} />
    </div>
  );
}