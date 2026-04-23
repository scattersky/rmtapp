"use client";

import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import StarRatings from "react-star-ratings";
import moment from "moment";

export default function ReviewsDashboard() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);

  const [mode, setMode] = useState<"received" | "given">("received");

  const [receivedReviews, setReceivedReviews] = useState<any[]>([]);
  const [givenReviews, setGivenReviews] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});

  // 🔥 AUTH + USER DATA
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return;

      setUser(u);

      const userSnap = await getDocs(
        query(collection(db, "users"), where("__name__", "==", u.uid))
      );

      if (!userSnap.empty) {
        setUserData(userSnap.docs[0].data());
      }
    });

    return () => unsub();
  }, []);

  // 🔥 FETCH DATA
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);

      // 1️⃣ GET USER TONES
      const tonesSnap = await getDocs(
        query(collection(db, "tones"), where("createdBy", "==", user.uid))
      );

      const toneIds = tonesSnap.docs.map((doc) => doc.id);

      // 2️⃣ GET RECEIVED REVIEWS (chunked)
      let received: any[] = [];

      const chunkSize = 10;
      for (let i = 0; i < toneIds.length; i += chunkSize) {
        const chunk = toneIds.slice(i, i + chunkSize);

        if (chunk.length === 0) continue;

        const q = query(
          collection(db, "reviews"),
          where("toneId", "in", chunk)
        );

        const snap = await getDocs(q);

        received.push(
          ...snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      }

      setReceivedReviews(received);

      // 3️⃣ GET GIVEN REVIEWS
      const givenSnap = await getDocs(
        query(collection(db, "reviews"), where("userId", "==", user.uid))
      );

      setGivenReviews(
        givenSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );

      setLoading(false);
    };

    fetchData();
  }, [user]);

  // 🔥 REPLY HANDLER (with protection)
  const handleReplySubmit = async (review: any) => {
    if (!user || !userData) return;

    // ✅ prevent multiple replies (backend guard)
    if (review.replyText) return;

    const replyText = replyTextMap[review.id];
    if (!replyText) return;

    await updateDoc(doc(db, "reviews", review.id), {
      replyText: replyText,
      replyCreatedAt: new Date(),
      replyUserId: user.uid,
      replyUserName: userData.username || "Anonymous",
      replyUserImage: userData.image || "/avatar.png",
    });

    // update UI
    setReceivedReviews((prev) =>
      prev.map((r) =>
        r.id === review.id
          ? {
            ...r,
            replyText,
            replyUserName: userData.username,
            replyUserImage: userData.image,
          }
          : r
      )
    );

    setReplyTextMap((prev) => ({ ...prev, [review.id]: "" }));
  };

  const reviews = mode === "received" ? receivedReviews : givenReviews;

  if (loading) {
    return (
      <p className="text-white text-center py-10">Loading reviews...</p>
    );
  }

  return (
    <div className="text-white">

      {/* HEADER */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setMode("received")}
          className={`px-4 py-2 rounded-md ${
            mode === "received" ? "bg-[#53A870]" : "bg-gray-600"
          }`}
        >
          Reviews Received
        </button>

        <button
          onClick={() => setMode("given")}
          className={`px-4 py-2 rounded-md ${
            mode === "given" ? "bg-[#53A870]" : "bg-gray-600"
          }`}
        >
          Reviews Given
        </button>
      </div>

      {/* LIST */}
      <div className="flex flex-col gap-4">
        {reviews.length === 0 && (
          <p className="text-gray-400">No reviews found.</p>
        )}

        {reviews.map((review) => (
          <div
            key={review.id}
            className="p-5 rounded-2xl border border-white/20 bg-[#1a1a1a]"
          >
            {/* REVIEW HEADER */}
            <div className="flex items-start gap-3 mb-2">
              <img
                src={review.userImage}
                className="w-10 h-10 rounded-full mt-2"
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
                {/* REVIEW TEXT */}
                <p className="text-gray-300">{review.text}</p>
                <p className="text-xs mb-2  tracking-widest text-gray-400">
                  {review.userName}
                  {" "} - {" "}
                  {review.createdAt
                    ? moment(review.createdAt.toDate()).format("MMM D, YYYY")
                    : ""}
                </p>
              </div>


            </div>



            {/* 🔥 REPLY SECTION (only received) */}
            {mode === "received" && (
              <div className="mt-4">

                {/* EXISTING REPLY */}
                {review.replyText ? (
                  <div className="bg-[#2a2a2a] p-3 rounded-md flex gap-3">
                    <img
                      src={review.replyUserImage}
                      className="w-6 h-6 rounded-full"
                    />
                    <div>
                      <p className="text-xs mb-2  tracking-widest text-gray-400">
                        {review.replyUserName}  (You)
                        {" "} - {" "}
                        {review.replyCreatedAt
                          ? moment(review.replyCreatedAt.toDate()).format("MMM D, YYYY")
                          : ""}
                      </p>
                      <p>{review.replyText}</p>

                    </div>
                  </div>
                ) : (
                  <>
                    {/* INPUT */}
                    <textarea
                      placeholder="Write a reply..."
                      className="w-full mt-2 p-2 bg-[#333] rounded-md text-white"
                      value={replyTextMap[review.id] || ""}
                      onChange={(e) =>
                        setReplyTextMap((prev) => ({
                          ...prev,
                          [review.id]: e.target.value,
                        }))
                      }
                    />

                    {/* BUTTON */}
                    <button
                      onClick={() => handleReplySubmit(review)}
                      className="mt-2 px-4 py-2 bg-[#53A870] rounded-md"
                    >
                      Reply
                    </button>
                  </>
                )}
              </div>
            )}

            {/*  SHOW REPLY ON "GIVEN" SIDE TOO */}
            {mode === "given" && review.replyText && (
              <div className="mt-4 bg-[#2a2a2a] p-3 rounded-md flex gap-3">
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
  );
}