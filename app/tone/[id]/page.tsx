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
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

import Header from "@/components/Header";

import { Audio } from "react-loader-spinner";
import { AudioPlayer } from "react-audio-play";
import StarRatings from 'react-star-ratings';
import { SlideDown } from "react-slidedown";
import { IoSend } from "react-icons/io5";
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";
import { Tone } from "@/types/tone";
import AuthorCard from "@/components/AuthorCard";
import {Collapse} from "react-collapse";

export default function SingleTonePage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();

  const [tone, setTone] = useState<Tone | null>(null);
  const [author, setAuthor] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(true);

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);

  const [favorites, setFavorites] = useState<string[]>([]);

  // 🔥 FETCH TONE + AUTHOR
  useEffect(() => {
    if (!id) return;

    const fetchTone = async () => {
      const ref = doc(db, "tones", id as string);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = {
          id: snap.id,
          ...(snap.data() as Omit<Tone, "id">),
        };
        setTone(data);

        // fetch author
        if (data.createdBy) {
          const userRef = doc(db, "users", data.createdBy);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setAuthor(userSnap.data());
          }
        }
      }

      setLoading(false);
    };

    fetchTone();
  }, [id]);

  // 🔥 FETCH REVIEWS
  useEffect(() => {
    if (!id) return;

    const fetchReviews = async () => {
      const q = query(
        collection(db, "reviews"),
        where("toneId", "==", id)
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setReviews(data);
      setReviewLoading(false);
    };

    fetchReviews();
  }, [id]);

  // 🔥 FETCH CURRENT USER
  useEffect(() => {
    if (!user) return;

    const fetchUser = async () => {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setUserData(data);
        setFavorites(data.favorites || []);
      }
    };

    fetchUser();
  }, [user]);

  // ❤️ FAVORITES
  const toggleFavorite = async () => {
    if (!user || !tone) return;

    let updated: string[];

    if (favorites.includes(tone.id)) {
      updated = favorites.filter((id) => id !== tone.id);
    } else {
      updated = [...favorites, tone.id];
    }

    setFavorites(updated);

    await updateDoc(doc(db, "users", user.uid), {
      favorites: updated,
    });
  };

  // ⭐ SUBMIT REVIEW
  const handleSubmitReview = async () => {
    if (!user || !tone) return;

    await addDoc(collection(db, "reviews"), {
      toneId: tone.id,
      userId: user.uid,
      userName: user.displayName || "Anonymous",
      text: reviewText,
      rating: reviewRating,
      createdAt: serverTimestamp(),
    });

    // refresh reviews
    const snapshot = await getDocs(
      query(collection(db, "reviews"), where("toneId", "==", tone.id))
    );

    setReviews(snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })));

    setReviewText("");
    setReviewRating(0);
    setIsReviewOpen(false);
  };

  // ⏳ LOADING
  if (loading || authLoading || reviewLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#141414]">
        <Audio height={100} width={100} color="#53A870" />
      </div>
    );
  }

  if (!tone) {
    return <p className="text-white">Tone not found</p>;
  }

  // ✅ SAFE ARRAYS
  const genres = tone.genres ?? [];
  const instruments = tone.instruments ?? [];

  return (

    <div className="bg-[#141414] min-h-screen text-white">
      <div className='h-25 flex justify-between items-center  bg-[#141414] border-b-[3px] border-white'>
        <div className='mx-auto w-full max-w-341.5 p-4'>
          <h1 className='text-white text-3xl font-bold uppercase'>
            {tone.title}
          </h1>
        </div>
      </div>
      <div className="max-w-[1366px] mx-auto px-6 pb-6 pt-12 flex gap-8 ">

          <div className="w-full md:w-[20%]">
            <AuthorCard
              author={{
                id: tone.createdBy,
                username: author?.username,
                image: author?.image,
                bio: author?.bio,
                favorites: author?.favorites,
                favoriteGenres: author?.favoriteGenres,
                instagram: author?.instagram,
                spotify: author?.spotify,
                soundcloud: author?.soundcloud,
                youtube: author?.youtube,
              }}
            />

        </div>
        <div className="w-full md:w-[80%]">
          {/* MAIN CARD */}
          <div className="p-5 mb-6 flex flex-col md:flex-row gap-6 rounded-3xl border border-white/20 bg-[#1a1a1a]">

            {/* IMAGE */}
            <img
              src={tone.image || "/placeholder.jpg"}
              className="w-full md:w-[40%] rounded-xl"
            />


            {/* DETAILS */}
            <div className="flex flex-col justify-between w-full">
              <div className="flex gap-2 justify-end flex-wrap">
                {tone.genres?.map((genre) => (
                  <div key={genre} className="bg-[#8E8E8E] px-3 py-1 rounded-full">
                    {genre}
                  </div>
                ))}

                {tone.instruments?.map((inst) => (
                  <div key={inst} className="bg-[#53A870] px-3 py-1 rounded-full">
                    {inst}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between gap-2 mt-2 mb-4">
              {/* AUTHOR */}
              {author && (
                <Link href={`/profile/${tone.createdBy}`}>
                  <div className="flex items-center gap-2 text-[#53A870] cursor-pointer">
                    <img
                      src={author.image || "/avatar.png"}
                      className="w-10 h-10 rounded-full"
                    />
                    @{author.username}
                  </div>
                </Link>
              )}

                <div className="flex items-center justify-end gap-2 mt-2">
                {/* FAVORITE */}
                <div onClick={toggleFavorite} className="cursor-pointer mt-2">
                  {favorites.includes(tone.id) ? (
                    <MdFavorite color="red" size={24} />
                  ) : (
                    <MdFavoriteBorder size={24} />
                  )}
                </div>

                <StarRatings
                  // rating={post.average_rating || 0}
                  rating={3}
                  starEmptyColor="#686868"
                  starRatedColor="white"
                  numberOfStars={5}
                  name='rating'
                  starDimension="25px"
                  starSpacing="2px"
                />
                </div>
              </div>


              {/* AUDIO */}
              <div className='rounded-lg overflow-hidden'>
                <AudioPlayer
                  src={tone.music_url || ""}
                  backgroundColor="#272727"
                  width="100%"
                  sliderColor="#53A870"
                />
              </div>
              {/* GENRES */}
              <div className="mt-3">
                <strong>Genres:</strong> {genres.join(", ")}
              </div>

              {/* INSTRUMENTS */}
              <div>
                <strong>Instruments:</strong> {instruments.join(", ")}
              </div>

              {/* DESCRIPTION */}
              <p className="mt-4">{tone.description}</p>
            </div>
          </div>
          {/* REVIEWS */}
          <div className="p-5 rounded-3xl border border-white/20 bg-[#1a1a1a]">

            <div className="flex justify-between items-center">
              <h2 className="text-xl">Reviews</h2>

              <button
                className="bg-[#53A870] px-4 py-2 rounded-full cursor-pointer"
                onClick={() => setIsReviewOpen(!isReviewOpen)}
              >
                Rate My Tone
              </button>
            </div>

            {/* REVIEW FORM */}
            <Collapse isOpened={isReviewOpen}>
              <div className="flex gap-4 bg-[#3a3a3a] p-3 rounded-full items-center mt-12">
                <img
                  src={author?.image}
                  className="h-[40px] w-[40px] rounded-full"
                  alt="user"
                />

                <input
                  type="text"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Leave a review..."
                  className="flex-1 bg-[#707070] px-3 py-2 rounded-full outline-none"
                />

                <StarRatings
                  rating={0}
                  starEmptyColor="#686868"
                  starRatedColor="white"
                  changeRating={setReviewRating}
                  numberOfStars={5}
                  name='rating'
                  starDimension="25px"
                  starSpacing="2px"
                  starHoverColor="white"
                />

                <button
                  onClick={handleSubmitReview}
                  className="bg-[#53A870] px-4 py-2 rounded-full flex items-center gap-2 cursor-pointer"
                >
                  Submit <IoSend />
                </button>
              </div>

            </Collapse>

            {/* REVIEW LIST */}
            {reviews.map((review) => (
              <div key={review.id} className="mt-4 border-t pt-3">
                <StarRatings
                  rating={review.rating}

                  starEmptyColor="#686868"
                  starRatedColor="white"
                  numberOfStars={5}
                  name='rating'
                  starDimension="25px"
                  starSpacing="2px"
                />

                <p>{review.text}</p>
                <span className="text-sm text-gray-400">
                  {review.userName}
                </span>
              </div>
            ))}
          </div>
        </div>


        </div>
      </div>

  );
}