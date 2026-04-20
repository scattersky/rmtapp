"use client";

import React, {useState} from "react";
import Link from "next/link";
import { MdFavorite, MdFavoriteBorder, MdModeComment } from "react-icons/md";
import { AudioPlayer } from "react-audio-play";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { SlideDown } from "react-slidedown";
import { IoSend } from "react-icons/io5";
import { MagicCard } from "@/components/ui/magic-card"
import {CometCard} from "@/components/ui/comet-card";
import {Collapse} from 'react-collapse';
import StarRatings from "react-star-ratings";
import {Tooltip} from "react-tooltip";
import {useAuth} from "@/context/AuthContext";

// ✅ TYPES
type TonePost = {
  id: string;
  title?: string;
  shortDescription?: string;
  image?: string;
  featured_media_src_url?: string;
  genres?: string[];
  instruments?: string[];
  author?: string;
  music_url?: string;
  review_count?: number;
  average_rating?: number;
  createdBy?: string;
  author_name?: string;

  author_image_url?: string;
  hasUserReviewed?: boolean;
};

type MusicListCardProps = {
  post: TonePost;
  isFav: boolean;
  onToggleFavorite: (id: string) => void;
  onToggleReview: (id: string) => void;
  openItemId: string | null;
  reviewStatus: boolean;
  hasUserReviewed: boolean;

  currentUserData: {
    image?: string;
  } | null;
  handleToneReviewSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onReviewTextChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onReviewRatingChange: (rating: number) => void;
};

export default function MusicListCard({
                                        post,
                                        isFav,
                                        onToggleFavorite,
                                        onToggleReview,
                                        openItemId,
                                        reviewStatus,
                                        currentUserData,
                                        hasUserReviewed,
                                        handleToneReviewSubmit,
                                        onReviewTextChange,

                                        onReviewRatingChange,
                                      }: MusicListCardProps) {
  const { user, userData } = useAuth();
  const [reviewRating, setReviewRating] = useState(0);
  const handleRatingChange = (newRating: number) => {
    setReviewRating(newRating);
  };
  const isOwner = user && post && user.uid === post.createdBy;
  return (
    <div className="relative border rounded-3xl mb-[40px] ">
      <GlowingEffect
        blur={0}
        borderWidth={3}
        spread={80}
        glow={true}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
      />
    <div className=" flex flex-col gap-5  px-[20px] pt-[20px] pb-[5px] rounded-3xl border  border-white/10 bg-[#1a1a1a]">

      {/* UPPER */}
      <div className="flex flex-col md:flex-row gap-4">
        <img
          src={post.image || "/placeholder.jpg"}
          className="w-full md:max-w-[250px] rounded-lg"
          alt="Tone"
        />

        <div className="flex flex-col gap-2 w-full justify-between">
          {/* TAGS */}
          <div className="flex gap-2 justify-end flex-wrap">
            {post.genres?.map((genre) => (
              <div key={genre} className="bg-gray-500 px-3 py-1 rounded-full">
                {genre}
              </div>
            ))}

            {post.instruments?.map((inst) => (
              <div key={inst} className="bg-[#42b27c] px-3 py-1 rounded-full">
                {inst}
              </div>
            ))}
          </div>

          {/* AUTHOR */}
          <Link
            href={`/profile/${post.createdBy}`}
          >
            <div className="flex gap-2 items-center text-[#42b27c] cursor-pointer">
              <img
                src={post.author_image_url || "/avatar.png"}
                className="h-[35px] w-[35px] rounded-full"
                alt="author"
              />
              @{post.author_name || "unknown"}
            </div>
          </Link>

          <h3 className="text-[22px] font-bold ml-1">{post.title}</h3>

          {post.music_url && (
            <div className='rounded-lg overflow-hidden'>
            <AudioPlayer
              src={post.music_url}
              backgroundColor="#272727"
              width="100%"
              sliderColor="#42b27c"
            />
            </div>
          )}
        </div>
      </div>

      {/* DESCRIPTION */}
      <p className='pl-2'>{post.shortDescription || "No description available."}</p>

      {/* ACTIONS */}
      <div className="flex justify-between flex-col md:flex-row gap-4">
        <Link
          href={`/tone/${post.id}`}
        >
          <div className="px-[60px] py-2 border-[1.5px] border-gray-300 rounded-full cursor-pointer hover:bg-[#42b27c] hover:border-[#42b27c]">
            Tone Notes
          </div>
        </Link>

        <div className="flex gap-6 items-center">
          {/* FAVORITE */}
          <div
            onClick={() => onToggleFavorite(post.id)}
            className="cursor-pointer mt-5"
            data-tooltip-id='favtonetooltip'
            data-tooltip-content='Add Tone To Favorites'
          >
            {isFav ? (
              <MdFavorite size={24} color="red" />
            ) : (
              <MdFavoriteBorder size={24} />
            )}
            <Tooltip id='favtonetooltip' />
          </div>

          {/* COMMENTS */}
          <div
            onClick={() => onToggleReview(post.id)}
            className="cursor-pointer flex gap-1 mt-5"
            data-tooltip-id='ratetonetooltip'
            data-tooltip-content='Rate This Tone'
          >
            <MdModeComment size={24} />
            {post.review_count || 0}
            <Tooltip id='ratetonetooltip' />
          </div>

          {/* RATING */}
          <div className="mt-[13px]">
          <StarRatings
            rating={post.average_rating || 0}

            starEmptyColor="#686868"
            starRatedColor="white"
            numberOfStars={5}
            name='rating'
            starDimension="25px"
            starSpacing="0px"
          />
          </div>
        </div>
      </div>

      {/* REVIEW */}
      <Collapse isOpened={openItemId === post.id}>
        {isOwner ? (
          <div className="bg-[#3a3a3a] p-4 rounded-full text-center text-white mb-4">
            Sorry, you cannot rate your own tone.
          </div>
        ) : hasUserReviewed ? (
          <div className="bg-[#3a3a3a] p-4 rounded-full text-center text-white mb-4">
            You’ve already rated this tone.
          </div>
        ) : (
          <form onSubmit={handleToneReviewSubmit} className="mb-4">
            <input type="hidden" name="reviewToneID" value={post.id} />

            <div className="flex gap-4 bg-[#3a3a3a] p-3 rounded-full items-center">
              <img
                src={currentUserData?.image}
                className="h-[40px] w-[40px] rounded-full"
                alt="user"
              />

              <input
                type="text"
                onChange={onReviewTextChange}
                maxLength={220}
                placeholder="Leave a review..."
                className="flex-1 bg-[#707070] px-3 py-2 rounded-full outline-none"
              />

              <StarRatings
                rating={reviewRating}
                starEmptyColor="#686868"
                starRatedColor="white"
                changeRating={handleRatingChange}
                numberOfStars={5}
                name='rating'
                starDimension="25px"
                starSpacing="0px"
                starHoverColor="white"
              />

              <button
                type="submit"
                className="bg-[#42b27c] px-4 py-2 rounded-full flex items-center gap-2"
              >
                Submit <IoSend />
              </button>
            </div>
          </form>
        )}


      </Collapse>


    </div>
    </div>

  );
}