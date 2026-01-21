import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { IoMdArrowRoundBack } from 'react-icons/io';
import axios from "axios";
import {Audio} from "react-loader-spinner";
import { RiFolderMusicLine } from 'react-icons/ri';
import { LiaGuitarSolid } from 'react-icons/lia';
import { TbInfoSquareRounded } from 'react-icons/tb';
import { AudioPlayer } from 'react-audio-play';
import { RiFlowChart } from 'react-icons/ri';
import moment from 'moment';
import ReactStars from "react-rating-stars-component/dist/react-stars";
import { MdStarRate } from 'react-icons/md';
import Header from '@/components/Header';
import { SlideDown } from 'react-slidedown';
import 'react-slidedown/lib/slidedown.css';
import {IoSend} from "react-icons/io5";




function SingleTone() {
  const router = useRouter();
  const params = router.query;

  const [authorData, setAuthorData] = useState([]);
  const [authorError, setAuthorError] = useState(null);
  const [authorLoading, setAuthorLoading] = useState(true);

  const [currentUserData, setCurrentUserData] = useState([]);
  const [currentUserError, setCurrentUserError] = useState(null);
  const [currentUserLoading, setCurrentUserLoading] = useState(true);

  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [reviewData, setReviewData] = useState([]);
  const [reviewError, setReviewError] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(true);

  const [isOpen, setIsOpen] = useState(false);

  const [triggerFetchReviews, setTriggerFetchReviews] = useState(0);


  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const onReviewTextChange = (event) => {
    setReviewText(event.target.value);
  };
  const onReviewRatingChange = (newRating) => {
    setReviewRating(newRating);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          'https://ratemytone.com/wp-json/wp/v2/music_list/' + params.id
        );
        setData(response.data); // Axios data is in response.data
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    const fetchAuthorData = async () => {
      try {
        const response = await axios.get(
          'https://ratemytone.com/wp-json/wp/v2/users/' + params.author
        );
        setAuthorData(response.data); // Axios data is in response.data
        setAuthorLoading(false);
      } catch (err) {
        setAuthorError(err);
        setAuthorLoading(false);
      }
    };

    const fetchCurrentUserData = async () => {
      try {
        const currentUser = localStorage.getItem('user_id');
        const response = await axios.get(
          'https://ratemytone.com/wp-json/wp/v2/users/' + currentUser
        );
        setCurrentUserData(response.data); // Axios data is in response.data
        setCurrentUserLoading(false);
      } catch (err) {
        setCurrentUserError(err);
        setCurrentUserLoading(false);
      }
    };
    
    const fetchReviewData = async () => {
      try {
        const response = await axios.get(
          'https://ratemytone.com/wp-json/my/v1/my_cpt?related_id=' + params.id
        );
        setReviewData(response.data); // Axios data is in response.data
        setReviewLoading(false);
      } catch (err) {
        setReviewError(err);
        setReviewLoading(false);
      }
    };
    fetchCurrentUserData();
    fetchAuthorData();
    fetchData();
    fetchReviewData();
  }, [triggerFetchReviews]);

  const handleToneReviewSubmit = async () => {
    const token = localStorage.getItem('rmt_token');

    if (!token) {
      console.error('No JWT token found. User not authenticated.');
      return;
    }

    try {
      const response = await axios.post(
        'https://ratemytone.com/wp-json/wp/v2/tone-review',
        // Data payload
        {
          title: params.title,
          content: reviewText,
          status: 'publish',
          acf: {
            tone_review_tone_id: params.id,
            tone_review_stars: reviewRating,
            tone_review_text: reviewText,
            tone_review_reviewed_by: currentUserData.id,
            tone_review_reviewed_by_name: currentUserData.name,
            tone_review_tone_author_id: params.author
          },
        },
        // Configuration object for headers
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // Attach the JWT
          },
        }
      );
      const triggerReviewRefresh = () => {
        setTriggerFetchReviews((prev) => prev + 1);
      }
      triggerReviewRefresh();
      console.log('Post created successfully:', response.data);
      return response.data;


    } catch (error) {
      console.error('Error creating post:', error.response.data.message);
      throw new Error(error.response.data.message);
    }

  };

  if (loading || authorLoading || reviewLoading || currentUserLoading)
    return (
      <div id='page'>
        <Header />
        <div className='flex flex-1 items-center justify-center bg-[#141414] w-full h-full min-w-[100vw] min-h-[100vh]'>
          <Audio
            height={100}
            width={100}
            radius={9}
            color='#53A870'
            ariaLabel='audio-loading'
            wrapperStyle={{}}
            wrapperClass=''
          />
        </div>
      </div>
    );
  if (error || authorError || reviewError || currentUserError)
    return (
      <div>
        <p>Error: {error.message}</p>
        <p>Error: {authorError.message}</p>
        <p>Error: {reviewError.message}</p>
        <p>Error: {currentUserError.message}</p>
      </div>
    );

  return (
    <div id='page'>
      <Header />
      <div className='flex flex-1 flex-col items-center bg-[#141414] w-full h-full min-w-[100vw] min-h-[100vh]'>
        {/*Page Title*/}
        <div className='flex flex-row justify-evenly items-center w-full p-[20px] border-b-[3px] border-white mb-3'>
          <div className='max-w-[1300px] w-full px-6'>
            <h1 className='text-white text-[30px] font-bold leading-4 tracking-wider uppercase py-5'>
              {params.title}
            </h1>
          </div>
        </div>
        {/*Page Content*/}
        <div className='flex min-h-[100vh] flex-row max-w-[1300px] w-full py-6 px-6 justify-between gap-6'>
          <div className='w-[20%]'>
            <div className='flex flex-col items-center gap-8 p-[20px] rounded-3xl'>
              <img
                src={authorData.author_image_url}
                className='w-[125px] h-[125px] rounded-full object-cover object-center'
              />
              <div className='flex flex-col items-center justify-center text-white text-[15px] font-bold'>
                {params.author_name}
                <Link
                  href={{
                    pathname: '/profile',
                    query: { id: params.author, name: params.author_name },
                  }}
                  className='cursor-pointer'
                >
                  <div className='flex flex-row gap-2 items-center cursor-pointer font-normal text-[#53A870] text-[15px]'>
                    @{params.author_name}
                  </div>
                </Link>
              </div>
              <div className='text-center'>
                <strong className='text-white uppercase text-[12px] tracking-[2px] block'>
                  Member Since:
                </strong>
                <span className='text-white text-[12px]'>
                  {moment(authorData.registered_date).format('MMMM Do YYYY')}
                </span>
              </div>
              <div className='text-center'>
                <strong className='text-white uppercase text-[12px] tracking-[2px] block'>
                  Tone Posts:
                </strong>
                <span className='text-white text-[12px]'>
                  {authorData.user_post_count}
                </span>
              </div>
              <div className='text-center'>
                <strong className='text-white uppercase text-[12px] tracking-[2px] block'>
                  Favorite Genres:
                </strong>
                {authorData.user_fav_genres.map((genre) => (
                  <span key={genre} className='text-white text-[12px] block'>
                    {genre}
                  </span>
                ))}
              </div>
              <div className='text-center'>
                <strong className='text-white uppercase text-[12px] tracking-[2px] block'>
                  User Bio:
                </strong>
                <span className='text-white text-[12px]'>
                  {authorData.user_bio}
                </span>
              </div>
            </div>
          </div>
          <div className='w-[80%]'>
            <div className='flex flex-col items-center w-[100%] gap-4'>
              <div className='rounded-3xl mb-[10px] shadowwhite w-[100%] p-[20px] gap-6 flex flex-row justify-center border-[1px] border-[rgba(255,255,255,0.3)]'>
                <div className='w-[50%] flex pt-[0px] pb-[0px]'>
                  <img
                    src={data.featured_media_src_url}
                    className='w-[100%] rounded-xl max-h-[45vh] object-cover object-center flex-1'
                  />
                </div>
                <div className='w-[50%] flex flex-col justify-evenly gap-2 p-[0px]'>
                  <div className='flex flex-col gap-1 items-end justify-center'>
                    <ReactStars
                      edit={false}
                      count={5}
                      value={data.average_rating}
                      size={25}
                      activeColor='#ffd700'
                    />
                  </div>
                  <div className='flex flex-col'>
                    <div className='flex flex-row items-end gap-1 mb-1'>
                      <RiFolderMusicLine className='text-[30px] text-[#53A870]' />
                      <span className='text-[15px] text-[#53A870] tracking-[3px] ml-1'>
                        GENRES
                      </span>
                    </div>
                    <div className='flex flex-row gap-1'>
                      {data.genres.map((genre) => (
                        <div key={genre.id} className='text-white text-[15px]'>
                          {genre}
                          <span>,</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className='flex flex-col mt-3'>
                    <div className='flex flex-row items-end gap-1 mb-1'>
                      <LiaGuitarSolid className='text-[30px] text-[#53A870]' />
                      <span className='text-[15px] text-[#53A870] tracking-[3px]'>
                        INSTRUMENTS
                      </span>
                    </div>
                    <div className='flex flex-row gap-1'>
                      {data.instruments.map((instrument) => (
                        <div
                          key={instrument.id}
                          className='text-white text-[15px]'
                        >
                          {instrument}
                          <span>,</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className='min-w-[100%] w-[100%] rounded-full overflow-hidden mt-5'>
                    <AudioPlayer
                      src={data.acf.music_url}
                      className=''
                      backgroundColor='#272727'
                      width='100%'
                      sliderColor='#53A870'
                    />
                  </div>
                </div>
              </div>
              <div className='rounded-3xl mb-[20px] shadowwhite w-[100%] p-[20px] flex flex-col gap-2 justify-center border-[1px] border-[rgba(255,255,255,0.3)]'>
                <div className='flex flex-row items-center gap-1 '>
                  <RiFlowChart className='text-[30px] text-[#53A870]' />
                  <span className='text-[15px] text-[#53A870] tracking-[3px] ml-1'>
                    SIGNAL FLOW
                  </span>
                </div>
                <p className='text-white text-[16px]'>
                  {data.acf.equipment_used}
                </p>
                <div className='flex flex-row items-center gap-1 mt-4'>
                  <TbInfoSquareRounded className='text-[30px] text-[#53A870]' />
                  <span className='text-[15px] text-[#53A870] tracking-[3px] ml-1'>
                    DESCRIPTION
                  </span>
                </div>
                <p className='text-white text-[16px]'>
                  {data.plain_text_description}
                </p>
              </div>
              <div className='rounded-3xl mb-[40px] shadowwhite w-[100%] p-[20px] flex flex-col gap-2 justify-center border-[1px] border-[rgba(255,255,255,0.3)]'>
                <div className='flex items-center justify-between'>
                  <div className='flex flex-row items-end gap-1 '>
                    <MdStarRate className='text-[30px] text-[#53A870]' />

                    <span className='text-[15px] tracking-[3px] text-[#53A870]'>
                      REVIEWS
                    </span>
                  </div>
                  <div className='flex'>
                    <button
                      className='bg-[#53A870] rounded-full py-1 px-5 text-white text-[15px]'
                      onClick={() => setIsOpen(!isOpen)}
                    >
                      Rate My Tone
                    </button>
                  </div>
                </div>
                {/*Music Card Leave Review*/}
                <SlideDown className={'my-dropdown-slidedown'}>
                  {isOpen ? (
                    <div className='w-full flex flex-row gap-4 justify-between items-center px-3 py-2 bg-[#3a3a3a] rounded-full my-3'>
                      <div className='w-[5%]'>
                        <img
                          src={currentUserData.author_image_url}
                          className='h-[40px] w-[40px] min-w-[40px] rounded-full object-center object-cover'
                        />
                      </div>

                      <div className='w-[50%]'>
                        <input
                          type='text'
                          className='w-full rounded-full text-white placeholder-white focus:border-[#53A870] focus:border-[3px] bg-[#707070]'
                          onChange={onReviewTextChange} // 4. The onChange handler updates the state
                          placeholder='Leave a review...'
                        />
                      </div>
                      <div className='w-[15%]'>
                        <ReactStars
                          count={5}
                          size={25}
                          activeColor='#ffd700'
                          onChange={onReviewRatingChange}
                        />
                      </div>
                      <div className='w-[20%]'>
                        <button
                          type='submit'
                          className='text-white h-[40px] w-full bg-[#53A870] text-center flex justify-center gap-2 items-center rounded-full'
                          onClick={handleToneReviewSubmit}
                        >
                          <span className='text-white text-[16px]'>
                            Submit Review
                          </span>
                          <IoSend />
                        </button>
                      </div>
                    </div>
                  ) : null}
                </SlideDown>

                {reviewData.map((review) => (
                  <div key={review.id} className='text-white text-[16px] mt-2'>
                    <ReactStars
                      edit={false}
                      count={5}
                      value={review.star_rating}
                      size={16}
                      activeColor='#ffd700'
                    />
                    <p className='text-white text-[16px] mb-1'>
                      {review.review_text}
                    </p>
                    <span className='text-white text-[10px] uppercase tracking-[1px]'>
                      Reviewed By: {review.review_author_name}
                    </span>
                    <span className='text-white text-[16px] ml-1 mr-1 opacity-60'>
                      {' '}
                      |{' '}
                    </span>
                    <span className='text-white text-[10px] uppercase tracking-[1px]'>
                      {moment(review.post_date).format('MMMM Do YYYY')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SingleTone;
