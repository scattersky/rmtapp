"use client";

import React, { useEffect, useState } from "react";
import {useParams, useRouter} from "next/navigation";
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


import { Audio } from "react-loader-spinner";

import AuthorCard from "@/components/AuthorCard";
import {Tooltip} from "react-tooltip";
import EditProfilePage from "@/components/EditProfilePage";
import FavoriteTones from "@/components/FavoriteTones";
import ReviewsDashboard from "@/components/ReviewsDashboard";
import ChangePassword from "@/components/ChangePassword";
import ChangeEmail from "@/components/AccountSettings";
import AccountSettings from "@/components/AccountSettings";


export type Tone = {
  id: string;
  title?: string;
  description?: string;
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

const postsMoreThan20 = 'https://ratemytone.com/wp-content/uploads/2026/02/b_20posts.webp';
const badgeReviewsGiven =
  'https://ratemytone.com/wp-content/uploads/2026/02/b_reviews_given.webp';
const badgeReviewsReceived =
  'https://ratemytone.com/wp-content/uploads/2026/02/b_reviews_received.webp';
const badgeToneFavsRecieved =
  'https://ratemytone.com/wp-content/uploads/2026/02/b_favs_recieved.webp';


export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const [panelTitle, setPanelTitle] = useState("Edit Profile");
  const [panelEditProfileVisible, setPanelEditProfileVisible] = useState(true);
  const [panelFavoritesVisible, setPanelFavoritesVisible] = useState(false);
  const [panelReviewsVisible, setPanelReviewsVisible] = useState(false);
  const [panelSettingsVisible, setPanelSettingsVisible] = useState(false);

  const showPanelEditProfile = () => {
    setPanelTitle("Edit Profile");
    setPanelEditProfileVisible(true);
    setPanelFavoritesVisible(false);
    setPanelReviewsVisible(false);
    setPanelSettingsVisible(false);
  }
  const showPanelFavorites = () => {
    setPanelTitle("My Favorites");
    setPanelFavoritesVisible(true);
    setPanelEditProfileVisible(false);
    setPanelReviewsVisible(false);
    setPanelSettingsVisible(false);
  }
  const showPanelReviews = () => {
    setPanelTitle("Reviews");
    setPanelReviewsVisible(true);
    setPanelFavoritesVisible(false);
    setPanelEditProfileVisible(false);
    setPanelSettingsVisible(false);
  }
  const showPanelSettings = () => {
    setPanelTitle("Settings");
    setPanelSettingsVisible(true);
    setPanelFavoritesVisible(false);
    setPanelReviewsVisible(false);
    setPanelEditProfileVisible(false);
  }

  const fetchUser = async () => {
    if (!user) return;

    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      setUserData(snap.data());
      setLoading(false);
    }
  };
  //  FETCH CURRENT USER
  useEffect(() => {
    fetchUser();
  }, [user]);

const goToToneFeed = () => {
  router.push("/");
}

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login"); // redirect after logout
    } catch (err) {
      console.error(err);
    }
  };


  // ⏳ LOADING
  if (loading || authLoading) {
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
            Dashboard<span className='font-normal text-lg block mb-0'>{panelTitle}</span>
          </h1>
        </div>
      </div>
      <div className="max-w-[1366px] mx-auto px-4 pb-6 pt-12 flex gap-6 ">

        <div className="w-full md:w-[20%]">
          <div className="flex flex-col items-center w-full gap-8 px-5 pt-5 pb-12 rounded-3xl border border-white/20 bg-[#1a1a1a]">

            {/* PROFILE IMAGE */}
            <img
              src={userData?.image || "/avatar.png"}
              className="w-[120px] h-[120px] rounded-full object-cover"
            />

            {/* NAME */}
            <div className="text-center">
              <h3 className="text-white text-lg font-bold">
                {userData?.username || "Unknown"}
              </h3>

              {userData?.uid && (
                <>
                  <Link href={`/profile/${userData?.uid}`}>
              <span className="text-[#42b27c] cursor-pointer">
                @{userData?.username}
              </span>
                  </Link>
                  <div className='flex items-center justify-center gap-2 mt-4'>
                    <div>
                      <img
                        data-tooltip-id='badge20posts'
                        data-tooltip-content='20+ Tones Posted'
                        src={postsMoreThan20}
                        className='w-[30px]'
                      />
                      <Tooltip id='badge20posts' />
                    </div>
                    <div>
                      <img
                        data-tooltip-id='badge10reviews'
                        data-tooltip-content='10+ Reviews Received'
                        src={badgeReviewsReceived}
                        className='w-[30px]'
                      />
                      <Tooltip id='badge10reviews' />
                    </div>
                    <div>
                      <img
                        data-tooltip-id='badge10reviewsgiven'
                        data-tooltip-content='10+ Reviews Given'
                        src={badgeReviewsGiven}
                        className='w-[30px]'
                      />
                      <Tooltip id='badge10reviewsgiven' />
                    </div>
                    <div>
                      <img
                        data-tooltip-id='badge30ToneFavs'
                        data-tooltip-content='30+ Tones Favorited'
                        src={badgeToneFavsRecieved}
                        className='w-[30px]'
                      />
                      <Tooltip id='badge30ToneFavs' />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/*DASHBOARD BTNS*/}
            <div className="flex flex-col gap-4 w-full mt-6">
              <button
                className={`w-full py-1 border-[1.5px]  rounded-md cursor-pointer hover:bg-[#42b27c] hover:border-[#42b27c] transition duration-400 ${
                  panelEditProfileVisible ? "bg-[#42b27c] border-[#42b27c]" : "border-gray-300"
                }`}
                onClick={showPanelEditProfile}
              >
                Edit Profile
              </button>
              <button
                className={`w-full py-1 border-[1.5px]  rounded-md cursor-pointer hover:bg-[#42b27c] hover:border-[#42b27c] transition duration-400 ${
                  panelFavoritesVisible ? "bg-[#42b27c] border-[#42b27c]" : "border-gray-300"
                }`}
                onClick={showPanelFavorites}
              >
                My Favorites
              </button>
              <button
                className={`w-full py-1 border-[1.5px]  rounded-md cursor-pointer hover:bg-[#42b27c] hover:border-[#42b27c] transition duration-400 ${
                  panelReviewsVisible ? "bg-[#42b27c] border-[#42b27c]" : "border-gray-300"
                }`}
                onClick={showPanelReviews}
              >
                Reviews
              </button>
              <button
                className="w-full py-1 border-[1.5px]  border-gray-300 rounded-md cursor-pointer hover:bg-[#42b27c] hover:border-[#42b27c] transition duration-400"
                onClick={goToToneFeed}
              >
                Tone Feed
              </button>
              <button
                className={`w-full py-1 border-[1.5px]  rounded-md cursor-pointer hover:bg-[#42b27c] hover:border-[#42b27c] transition duration-400 ${
                  panelSettingsVisible ? "bg-[#42b27c] border-[#42b27c]" : "border-gray-300"
                }`}
                onClick={showPanelSettings}
              >
                Settings
              </button>
              <button
                className="w-full py-1 border-[1.5px]  border-gray-300 rounded-md cursor-pointer hover:bg-[#910106] hover:border-[#910106] transition duration-400"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>

        </div>
        <div className="w-full md:w-[80%]">
          {/* MAIN CARD */}

          {panelEditProfileVisible &&
              <div className="px-8 py-10 mb-6 flex flex-col gap-6 rounded-3xl border border-white/20 bg-[#1a1a1a] w-full">
                  <EditProfilePage
                      userData={userData}
                      refreshUser={fetchUser}
                  />
              </div>
          }

          {panelFavoritesVisible &&
              <FavoriteTones/>
          }

          {panelReviewsVisible &&
             <ReviewsDashboard />
          }
          {panelSettingsVisible &&
            <AccountSettings/>
          }
        </div>


      </div>
    </div>

  );
}