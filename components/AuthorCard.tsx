"use client";

import React from "react";
import Link from "next/link";
import { Tooltip } from 'react-tooltip';
import { PiSpotifyLogoFill } from "react-icons/pi";
import { PiYoutubeLogoFill } from "react-icons/pi";
import { PiSoundcloudLogoFill } from "react-icons/pi";
import { AiFillInstagram } from "react-icons/ai";


interface Author {
  id?: string;
  username?: string;
  image?: string;
  bio?: string;
  createdAt?: any;
  favorites?: string[];
  favoriteGenres?: string[];
  instagram?: string;
  soundcloud?: string;
  spotify?: string;
  youtube?: string;
}

interface AuthorCardProps {
  author: Author | null;
  toneCount?: number;
}

export default function AuthorCard({
                                     author,
                                     toneCount,
                                   }: AuthorCardProps) {
  if (!author) return null;

  // SOCIAL MEDIA LINK HELPER
  const socialLinks = [
    {
      name: "instagram",
      url: author.instagram,
      icon: <AiFillInstagram />,
    },
    {
      name: "soundcloud",
      url: author.soundcloud,
      icon: <PiSoundcloudLogoFill />,
    },
    {
      name: "spotify",
      url: author.spotify,
      icon: <PiSpotifyLogoFill />,
    },
    {
      name: "youtube",
      url: author.youtube,
      icon: <PiYoutubeLogoFill />,
    },
  ];

  // AUTHOR BADGE IMAGES
  const postsMoreThan20 = 'https://ratemytone.com/wp-content/uploads/2026/02/b_20posts.webp';
  const badgeReviewsGiven =
    'https://ratemytone.com/wp-content/uploads/2026/02/b_reviews_given.webp';
  const badgeReviewsReceived =
    'https://ratemytone.com/wp-content/uploads/2026/02/b_reviews_received.webp';
  const badgeToneFavsRecieved =
    'https://ratemytone.com/wp-content/uploads/2026/02/b_favs_recieved.webp';

  return (
    <div className="flex flex-col items-center w-full gap-8 px-5 pt-5 pb-12 rounded-3xl border border-white/20 bg-[#1a1a1a]">

      {/* PROFILE IMAGE */}
      <img
        src={author.image || "/avatar.png"}
        className="w-[120px] h-[120px] rounded-full object-cover"
      />

      {/* NAME */}
      <div className="text-center">
        <h3 className="text-white text-lg font-bold">
          {author.username || "Unknown"}
        </h3>

        {author.id && (
          <>
            <Link href={`/profile/${author.id}`}>
              <span className="text-[#42b27c] cursor-pointer">
                @{author.username}
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

      {/* STATS */}
      <div className="w-full text-center space-y-8">

        {toneCount !== undefined && (
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400">
              Tones
            </p>
            <p className="text-white">{toneCount}</p>
          </div>
        )}

        {author.favoriteGenres && author.favoriteGenres.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400">
              Favorite Genres
            </p>

            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {author.favoriteGenres.map((genre) => (
                <span
                  key={genre}
                  className="bg-[#42b27c] text-white text-xs px-3 py-1 rounded-full"
                >
          {genre}
        </span>
              ))}
            </div>
          </div>
        )}

        {author.bio && (
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400">
              Bio
            </p>
            <p className="text-gray-300 text-sm">{author.bio}</p>
          </div>
        )}

        {/* SOCIAL*/}
        {socialLinks.some((s) => s.url) && (
          <div className="w-full text-center">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
              Connect
            </p>

            <div className="flex justify-center gap-4">
              {socialLinks.map((social) => {
                if (!social.url) return null; // ✅ THIS is the conditional filter

                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-[#42b27c] transition"
                  >
                    {social.icon}
                  </a>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}