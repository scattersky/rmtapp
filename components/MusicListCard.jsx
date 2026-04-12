'use client';
import React from 'react';
import Link from 'next/link';
import { MdFavorite, MdFavoriteBorder, MdModeComment } from 'react-icons/md';
import { AudioPlayer } from 'react-audio-play';
import ReactStars from 'react-rating-stars-component';
import { Tooltip } from 'react-tooltip';
import { SlideDown } from 'react-slidedown';
import { IoSend } from 'react-icons/io5';

export default function MusicListCard({
  post,
  isFav,
  onToggleFavorite,
  onToggleReview,
  openItemId,
  reviewStatus,
  currentUserData,
  handleToneReviewSubmit,
  onReviewTextChange,
  onReviewRatingChange,
}) {
  return (
    <div className='music_list_item p-[20px] flex flex-col gap-5 rounded-3xl mb-[40px] shadowwhite border-[1px] border-[rgba(255,255,255,0.3)]'>
      {/* Upper */}
      <div className='w-full flex flex-col md:flex-row gap-4'>
        <img
          src={post.featured_media_src_url}
          className='w-full md:max-w-[250px] rounded-xl'
          alt='Tone Image'
        />

        <div className='flex flex-col gap-2 w-full justify-between'>
          <div className='flex flex-row gap-2 w-full justify-end flex-wrap'>
            {post.genres.map((genre, i) => (
              <div
                key={i}
                className='text-white bg-[#8E8E8E] px-3 py-1 rounded-full'
              >
                {genre}
              </div>
            ))}
            {post.instruments.map((instrument, i) => (
              <div
                key={i}
                className='text-white bg-[#53A870] px-3 py-1 rounded-full'
              >
                {instrument}
              </div>
            ))}
          </div>

          <div className='flex flex-col gap-1 w-full'>
            <Link
              href={{
                pathname: '/profile',
                query: { id: post.author, name: post.author_name },
              }}
            >
              <div className='flex gap-2 items-center text-[#53A870]'>
                <img
                  src={post.author_image_url}
                  className='h-[35px] w-[35px] rounded-full'
                />
                @{post.author_name}
              </div>
            </Link>

            <h3 className='text-white text-[26px]'>{post.title.rendered}</h3>

            <AudioPlayer
              src={post.acf.music_url}
              backgroundColor='#272727'
              width='100%'
              sliderColor='#53A870'
            />
          </div>
        </div>
      </div>

      {/* Middle */}
      <p className='text-white'>{post.plain_text_excerpt}</p>

      {/* Lower */}
      <div className='flex justify-between flex-col md:flex-row gap-4'>
        <Link
          href={{
            pathname: '/singletone',
            query: {
              id: post.id,
              title: post.title.rendered,
              author: post.author,
              author_name: post.author_name,
            },
          }}
        >
          <div className='px-[60px] py-2 border-white border rounded-full text-white cursor-pointer hover:bg-[#53A870] hover:border-[#53A870]'>
            Tone Notes
          </div>
        </Link>

        <div className='flex gap-6 items-center'>
          {/* Favorite */}
          <div
            onClick={() => onToggleFavorite(post.id)}
            className='cursor-pointer'
          >
            {isFav ? (
              <MdFavorite size={24} color='red' />
            ) : (
              <MdFavoriteBorder size={24} color='white' />
            )}
          </div>

          {/* Comments */}
          <div
            onClick={() => onToggleReview(post.id)}
            className='cursor-pointer flex gap-1 text-white'
          >
            <MdModeComment color='white' size={24} />
            {post.review_count}
          </div>

          <ReactStars
            edit={false}
            count={5}
            value={post.average_rating}
            size={25}
            activeColor='#ffd700'
          />
        </div>
      </div>

      {/* Review Dropdown */}
      <SlideDown>
        {openItemId === post.id && (
          <form onSubmit={handleToneReviewSubmit}>
            <input type='hidden' name='reviewToneID' value={post.id} />
            <input
              type='hidden'
              name='reviewToneTitle'
              value={post.title.rendered}
            />
            <input type='hidden' name='reviewToneAuthor' value={post.author} />

            <div className='flex gap-4 bg-[#3a3a3a] p-3 rounded-full'>
              <img
                src={currentUserData.author_image_url}
                className='h-[40px] w-[40px] rounded-full'
              />

              <input
                type='text'
                onChange={onReviewTextChange}
                placeholder='Leave a review...'
                className='flex-1 rounded-full bg-[#707070] text-white px-3'
              />

              <ReactStars count={5} size={25} onChange={onReviewRatingChange} />

              <button className='bg-[#53A870] px-4 rounded-full flex items-center gap-2 text-white'>
                Submit <IoSend />
              </button>
            </div>
          </form>
        )}
      </SlideDown>
    </div>
  );
}
