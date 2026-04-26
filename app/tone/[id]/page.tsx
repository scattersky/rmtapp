"use client";

import React, { useEffect, useState } from "react";
import {useParams, useRouter} from "next/navigation";
import Link from "next/link";
import { IoIosSkipBackward } from "react-icons/io";

import { TbArrowBadgeRightFilled } from "react-icons/tb";

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
import { deleteDoc } from "firebase/firestore";

import AuthorCard from "@/components/AuthorCard";
import {Collapse} from "react-collapse";
import {FaArrowUp} from "react-icons/fa6";
import ScrollToTop from "react-scroll-to-top";
import moment from "moment/moment";
import EditToneModal from "@/components/EditToneModal";

export type Tone = {
  id: string;
  title?: string;
  shortDescription?: string;
  longDescription?: string;
  genres?: string[];
  instruments?: string[];
  signalFlow?: string[];
  image?: string;
  createdBy?: string;
  createdAt?: any;
  author_name?: string;
  author_image_url?: string;

  music_url?: string;
  review_count?: number;
  average_rating?: number;
};

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
  const [userReviewsMap, setUserReviewsMap] = useState<Record<string, boolean>>({});
  const [hasUserReviewed, setHasUserReviewed] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [signalFlowModulesMap, setSignalFlowModulesMap] = useState<
    Record<string, { affiliateLink?: string }>
  >({});

  const router = useRouter();

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
          setHasUserReviewed(true);
        }
      });

      setUserReviewsMap(map);

    };

    fetchReviews();
  }, [user]);

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
    if (!user || !tone || !userData) return;

    await addDoc(collection(db, "reviews"), {
      toneId: tone.id,
      userId: user.uid,
      userName: userData.username || "Anonymous",
      userImage: userData.image || "/avatar.png", // ✅ THIS IS THE KEY
      text: reviewText,
      rating: reviewRating,
      createdAt: serverTimestamp(),
    });

    // refresh reviews
    const snapshot = await getDocs(
      query(collection(db, "reviews"), where("toneId", "==", tone.id))
    );

    setReviews(
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    );

    setReviewText("");
    setReviewRating(0);
    setIsReviewOpen(false);
    setHasUserReviewed(true);
  };


  const goBack = () => {
    router.back();
  }

  // HANDLE DELETE TONE
  const handleDeleteTone = async () => {
    if (!tone) return;

    try {
      // 🔥 delete reviews tied to tone
      const reviewsQuery = query(
        collection(db, "reviews"),
        where("toneId", "==", tone.id)
      );

      const reviewSnap = await getDocs(reviewsQuery);

      const deletePromises = reviewSnap.docs.map((docSnap) =>
        deleteDoc(doc(db, "reviews", docSnap.id))
      );

      await Promise.all(deletePromises);

      // 🔥 delete tone itself
      await deleteDoc(doc(db, "tones", tone.id));

      // 🔥 optional: delete files from server (if you build API later)

      alert("Tone deleted");

      // 👉 redirect after delete
      router.push("/");

    } catch (err: any) {
      alert(err.message);
    }
  };

  useEffect(() => {
    const fetchModules = async () => {
      const snap = await getDocs(collection(db, "signalFlowModules"));

      const map: Record<string, { affiliateLink?: string }> = {};

      snap.docs.forEach((doc) => {
        const data = doc.data();

        // normalize ID (already lowercase + hyphens in your DB)
        map[doc.id] = {
          affiliateLink: data.affiliateLink || null,
        };

        // ALSO map by display name if you store it
        if (data.name) {
          map[data.name] = {
            affiliateLink: data.affiliateLink || null,
          };
        }
      });

      setSignalFlowModulesMap(map);
    };

    fetchModules();
  }, []);

  const normalizeKey = (value: string) =>
    value.toLowerCase().replace(/\s+/g, "-");

  // ⏳ LOADING
  if (loading || authLoading || reviewLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#141414]">
        <Audio height={100} width={100} color="#42b27c" />
      </div>
    );
  }

  if (!tone) {
    return <p className="text-white">Tone not found</p>;
  }

  // ✅ SAFE ARRAYS
  const genres = tone.genres ?? [];
  const signalFlow = tone.signalFlow ?? [];
  const instruments = tone.instruments ?? [];
  const isOwner = user && tone && user.uid === tone.createdBy;
  return (

    <div className="bg-[#141414] min-h-screen text-white">
      <div className='h-25 flex justify-between items-center  bg-[#141414] border-b-[3px] border-white'>
        <div className='mx-auto w-full max-w-341.5 p-4'>
          <div className="flex items-center justify-between">
            <h1 className='text-white text-3xl font-bold uppercase'>
              {tone.title}
            </h1>

            {isOwner && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="bg-[#42b27c] text-white border-2 font-medium  px-4 py-1.5 rounded-md text-sm cursor-pointer"
                >
                  Edit Tone
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className=":text-white bg-red-600 border-2 font-medium px-4 py-1.5 rounded-md text-sm cursor-pointer"
                >
                  Delete Tone
                </button>
              </div>
            )}
          </div>

          <button
            className='text-[#42b27c] text-sm mt-1 cursor-pointer flex items-center gap-2'
            onClick={goBack}
          >
            <IoIosSkipBackward size={20}/>
            <span className="font-medium ">Go Back</span>
          </button>
        </div>
      </div>
      <div className="max-w-[1366px] mx-auto px-4 pb-6 pt-12 flex gap-6">

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
            <div className="flex flex-col justify-start gap-2 w-full">
              {/*<div className="flex gap-2 justify-end flex-wrap">*/}
              {/*  {tone.genres?.map((genre) => (*/}
              {/*    <div key={genre} className="bg-[#8E8E8E] px-3 py-1 rounded-full">*/}
              {/*      {genre}*/}
              {/*    </div>*/}
              {/*  ))}*/}

              {/*  {tone.instruments?.map((inst) => (*/}
              {/*    <div key={inst} className="bg-[#42b27c] px-3 py-1 rounded-full">*/}
              {/*      {inst}*/}
              {/*    </div>*/}
              {/*  ))}*/}
              {/*</div>*/}

              <div className="flex items-center justify-between gap-2  mb-4">
              {/* AUTHOR */}
              {author && (
                <Link href={`/profile/${tone.createdBy}`}>
                  <div className="flex items-center gap-2 text-[#42b27c] cursor-pointer">
                    <img
                      src={author.image || "/avatar.png"}
                      className="w-10 h-10 rounded-full"
                    />
                    @{author.username}
                  </div>
                </Link>
              )}

                <div className="flex items-center justify-end gap-2">
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
                  rating={tone.average_rating || 0}
                  starEmptyColor="#686868"
                  starRatedColor="white"
                  numberOfStars={5}
                  name='rating'
                  starDimension="22px"
                  starSpacing="0px"
                />
                </div>
              </div>


              {/* AUDIO */}
              <div className='rounded-lg overflow-hidden mb-2'>
                <AudioPlayer
                  src={tone.music_url || ""}
                  backgroundColor="#272727"
                  width="100%"
                  sliderColor="#42b27c"
                />
              </div>

              <div>
                {/* GENRES */}
                <div className='mb-4'>
                  <p className="text-xs uppercase tracking-widest text-gray-400">
                    Genres
                  </p>
                  <div className="mt-2 flex flex-row gap-2">
                    {tone.genres?.map((genre) => (
                      <div key={genre} className="bg-[#8E8E8E] px-3 py-1 rounded-full">
                        {genre}
                      </div>
                    ))}
                  </div>
                </div>

                {/* INSTRUMENTS */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400">
                    Instruments
                  </p>
                  <div className="mt-2 flex flex-row gap-2">
                    {tone.instruments?.map((inst) => (
                      <div key={inst} className="bg-[#42b27c] px-3 py-1 rounded-full">
                        {inst}
                      </div>
                    ))}
                  </div>
                </div>
              </div>


              {/* SHORT DESCRIPTION */}
              <div className="mt-4">
                <p className="text-xs uppercase tracking-widest text-gray-400">
                  Overview
                </p>
                <p className="mt-1 text-md text-gray-300">{tone.shortDescription}</p>
              </div>

            </div>
          </div>

          {/* TONE DESCRIPTION */}
          <div className="p-5 mb-6 flex flex-col gap-6 rounded-3xl border border-white/20 bg-[#1a1a1a]">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400">
                Signal Flow
              </p>
              <div className="flex flex-wrap items-center gap-1 mt-3">
                {/*{signalFlow.map((item, index) => (*/}
                {/*  <React.Fragment key={index}>*/}
                {/*    <div className="py-1.5 px-4 border border-white rounded-md text-sm cursor-pointer hover:bg-[#42b27c] hover:border-[#42b27c]">*/}
                {/*      {item}*/}
                {/*    </div>*/}

                {/*    /!* Add separator except for last item *!/*/}
                {/*    {index < signalFlow.length - 1 && <span><TbArrowBadgeRightFilled className='text-[#42b27c] text-2xl' /></span>}*/}
                {/*  </React.Fragment>*/}
                {/*))}*/}
                {signalFlow.map((item, index) => {
                  const key = normalizeKey(item);

                  const signalModule =
                    signalFlowModulesMap[key] ||
                    signalFlowModulesMap[item] ||
                    signalFlowModulesMap[item.toLowerCase()];

                  const content = (
                    <div className="py-1.5 px-4 border border-white rounded-md text-sm cursor-pointer hover:bg-[#42b27c] hover:border-[#42b27c]">
                      {item}
                    </div>
                  );

                  return (
                    <React.Fragment key={index}>
                      {signalModule?.affiliateLink ? (
                        <a
                          href={signalModule.affiliateLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {content}
                        </a>
                      ) : (
                        content
                      )}

                      {index < signalFlow.length - 1 && (
                        <span>
          <TbArrowBadgeRightFilled className="text-[#42b27c] text-2xl" />
        </span>
                      )}
                    </React.Fragment>
                  );
                })}

              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400">
                Description
              </p>
              <p className="mt-1 text-md text-gray-200">{tone.longDescription}</p>
            </div>

          </div>

          {/* REVIEWS */}
          <div className="p-5 rounded-3xl border border-white/20 bg-[#1a1a1a]">

            <div className="flex justify-between items-center">
              <h2 className="text-xl">Reviews</h2>

              <button
                className="bg-[#42b27c] px-4 py-2 rounded-full cursor-pointer"
                onClick={() => setIsReviewOpen(!isReviewOpen)}
              >
                Rate My Tone
              </button>
            </div>

            {/* REVIEW FORM */}
            <Collapse isOpened={isReviewOpen}>
              {isOwner ? (
                <div className="bg-[#3a3a3a] p-4 rounded-full text-center text-white mb-4 mt-4">
                  Sorry, you cannot rate your own tone.
                </div>
              ) : hasUserReviewed ? (
                <div className="bg-[#3a3a3a] p-4 rounded-full text-center text-white mb-4 mt-4">
                  You’ve already rated this tone.
                </div>
              ) : (
                <div className="flex gap-4 bg-[#3a3a3a] p-3 rounded-full items-center mt-12">
                  <img
                    src={userData?.image}
                    className="h-[40px] w-[40px] rounded-full"
                    alt="user"
                  />

                  <input
                    type="text"
                    value={reviewText}
                    maxLength={220}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Leave a review..."
                    className="flex-1 bg-[#707070] px-3 py-2 rounded-full outline-none"
                  />

                  <StarRatings
                    rating={reviewRating}
                    starEmptyColor="#686868"
                    starRatedColor="white"
                    changeRating={setReviewRating}
                    numberOfStars={5}
                    name='rating'
                    starDimension="22px"
                    starSpacing="2px"
                    starHoverColor="white"
                  />

                  <button
                    onClick={handleSubmitReview}
                    className="bg-[#42b27c] px-4 py-2 rounded-full flex items-center gap-2 cursor-pointer"
                  >
                    Submit <IoSend />
                  </button>
                </div>
              )}



            </Collapse>

            {/* REVIEW LIST */}
            {reviews.map((review) => (
              <div key={review.id} className="">
              <div className="mt-4 border-t pt-3 flex gap-3 items-start">

                {/* USER IMAGE */}
                <img
                  src={review.userImage || "/avatar.png"}
                  className="w-10 h-10 rounded-full object-cover"
                  alt="review user"
                />

                <div className="flex flex-col gap-2">
                  <StarRatings
                    rating={review.rating}
                    starEmptyColor="#686868"
                    starRatedColor="white"
                    numberOfStars={5}
                    name="rating"
                    starDimension="20px"
                    starSpacing="2px"
                  />

                  <p>{review.text}</p>

                  <span className="text-sm text-gray-400">
                    {review.userName}
                  </span>
                </div>

              </div>
                {review.replyText && (
                    <div className="bg-[#2a2a2a] p-3 rounded-md flex gap-3 mt-4 ml-10">
                      <img
                        src={review.replyUserImage}
                        className="w-6 h-6 rounded-full"
                      />
                      <div>
                        <p className="text-xs mb-2  tracking-widest text-gray-400">
                          {review.replyUserName}
                          {" "} - {" "}
                          {review.replyCreatedAt
                            ? moment(review.replyCreatedAt.toDate()).format("MMM D, YYYY")
                            : ""}
                        </p>
                        <p>{review.replyText}</p>

                      </div>
                    </div>
                  )}
                  </div>
            ))}
          </div>
        </div>

        {isEditOpen && tone && (
          <EditToneModal
            tone={tone}
            onClose={() => setIsEditOpen(false)}
            onUpdated={async () => {
              const snap = await getDoc(doc(db, "tones", tone.id));
              if (snap.exists()) {
                setTone({ id: snap.id, ...snap.data() });
              }
            }}
          />
        )}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[#1a1a1a] p-6 rounded-xl w-[400px] border border-white/10">
              <h2 className="text-xl font-bold mb-4 text-white">
                Delete Tone
              </h2>

              <p className="text-gray-400 mb-6">
                Are you sure you want to delete this tone? This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-400 rounded-md"
                >
                  No
                </button>

                <button
                  onClick={handleDeleteTone}
                  className="px-4 py-2 bg-red-600 rounded-md text-white"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}


        </div>
      <ScrollToTop smooth color="#42b27c" style={{backgroundColor: "#42b27c"}} className="bg-[#42b27c]" component={<FaArrowUp className='mx-auto text-2xl' />} />
      </div>

  );
}