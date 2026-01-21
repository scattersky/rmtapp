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
import { MdFavorite, MdModeComment, MdStarRate } from 'react-icons/md';
import { SlideDown } from 'react-slidedown';
import { IoSend } from 'react-icons/io5';
import Header from '@/components/Header';




function Profile() {
  const router = useRouter();
  const params = router.query;
  const userPlaceHolder = 'https://ratemytone.com/wp-content/uploads/2024/06/Portrait_Placeholder.png';
  const [userData, setUserData] = useState([]);
  const [userError, setUserError] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [reviewData, setReviewData] = useState([]);
  const [reviewError, setReviewError] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(true);

  const [openItemId, setOpenItemId] = useState(null);
  const toggleItem = (id) => {
    setOpenItemId((prev) => (prev === id ? null : id));
  };

  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const onReviewTextChange = (event) => {
    setReviewText(event.target.value);
  };
  const onReviewRatingChange = (event) => {
    setReviewRating(event.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          'https://ratemytone.com/wp-json/wp/v2/music_list?author=' + params.id
        );
        setData(response.data); // Axios data is in response.data
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };
    fetchData();

    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          'https://ratemytone.com/wp-json/wp/v2/users/' + params.id
        );
        setUserData(response.data); // Axios data is in response.data
        setUserLoading(false);
      } catch (err) {
        setUserError(err);
        setUserLoading(false);
      }
    };
    fetchUserData();


  }, []);

  if (loading || userLoading)

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
  if (error || userError)
    return (
      <div>
        <p>Error: {error.message}</p>
        <p>Error: {userError.message}</p>
      </div>
    );

  return (
    <div id='page'>
      <Header/>
      <div className='flex flex-1 flex-col items-center bg-[#141414] w-full h-full min-w-[100vw] min-h-[100vh]'>
        {/*Page Title*/}
        <div className='flex flex-row justify-evenly items-center w-full p-[20px] border-b-[3px] border-white mb-3'>

          <div className='max-w-[1300px] w-full px-6'>
            <h1 className='text-white text-[30px] font-bold leading-4 tracking-wider uppercase py-5'>
              Profile
            </h1>
          </div>
        </div>
        {/*Page Content*/}
        <div className='flex min-h-[100vh] flex-row max-w-[1300px] w-full py-6 px-6 justify-between gap-6'>
          <div className='w-[20%]'>
            <div className='flex flex-col items-center gap-8 p-[20px] rounded-3xl'>
              <img
                src={userData.author_image_url}
                className='w-[125px] h-[125px] rounded-full object-cover object-center'
              />
              <div className='flex flex-col items-center justify-center text-white text-[15px] font-bold'>
                {params.name}
                <Link
                  href={{
                    pathname: '/profile',
                    query: { id: params.author, name: params.author_name },
                  }}
                  className='cursor-pointer'
                >
                  <div className='flex flex-row gap-2 items-center cursor-pointer font-normal text-[#53A870] text-[15px]'>
                    @{params.name}
                  </div>
                </Link>
              </div>
              <div className='text-center'>
                <strong className='text-white uppercase text-[12px] tracking-[2px] block'>
                  Member Since:
                </strong>
                <span className='text-white text-[12px]'>
                  {moment(userData.registered_date).format('MMMM Do YYYY')}
                </span>
              </div>
              <div className='text-center'>
                <strong className='text-white uppercase text-[12px] tracking-[2px] block'>
                  Tone Posts:
                </strong>
                <span className='text-white text-[12px]'>
                  {userData.user_post_count}
                </span>
              </div>
              <div className='text-center'>
                <strong className='text-white uppercase text-[12px] tracking-[2px] block'>
                  Favorite Genres:
                </strong>
                {userData.user_fav_genres.map((genre) => (
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
                  {userData.user_bio}
                </span>
              </div>
            </div>
          </div>
          <div className='w-[80%]'>
            {data.map((post) => (
              <div
                key={post.id}
                className='music_list_item p-[20px] flex flex-col gap-5 rounded-3xl mb-[40px] shadowwhite border-[1px] border-[rgba(255,255,255,0.3)]'
              >
                {/*Music List Card Upper*/}
                <div className='w-full flex flex-row gap-4'>
                  <img
                    src={post.featured_media_src_url}
                    className='w-full max-w-[250px] rounded-xl'
                  />
                  <div className='flex flex-col gap-2 w-full justify-between'>
                    <div className='flex flex-row gap-2 w-full justify-end flex-wrap'>
                      {post.genres.map((genre) => (
                        <div
                          key={genre.id}
                          className='text-white bg-[#8E8E8E] text-[16px] px-3 py-1 rounded-full'
                        >
                          {genre}
                        </div>
                      ))}
                      {post.instruments.map((instrument) => (
                        <div
                          key={instrument.id}
                          className='text-white bg-[#53A870] text-[16px] px-3 py-1 rounded-full'
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
                        className='cursor-pointer'
                      >
                        <div className='flex flex-row gap-2 items-center cursor-pointer text-[#53A870] text-[18px]'>
                          <img
                            src={post.author_image_url}
                            className='h-[35px] w-[35px] rounded-full ml-1'
                          />
                          @{post.author_name}
                        </div>
                      </Link>
                      <h3 className='text-white text-[26px] ml-1 mb-1'>
                        {post.title.rendered}
                      </h3>
                      <div className='min-w-[100%] w-[100%] rounded-full overflow-hidden'>
                        <AudioPlayer
                          src={post.acf.music_url}
                          className=''
                          backgroundColor='#272727'
                          width='100%'
                          sliderColor='#53A870'
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/*Music List Card Middle*/}
                <div className='w-full flex flex-1'>
                  <p className='text-white'>{post.plain_text_excerpt}</p>
                </div>

                {/*Music List Card Lower*/}
                <div className='w-full flex flex-row gap-4 justify-between'>
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
                    <div className='py-2 px-[60px] text-white bg-none border-white border-[2px] rounded-full inline-block cursor-pointer'>
                      Tone Notes
                    </div>
                  </Link>
                  <div className='flex flex-row gap-6 items-center'>
                    <div className='flex flex-row gap-1 items-center justify-center text-[20px] text-white cursor-pointer'>
                      <MdFavorite /> 3
                    </div>
                    <div
                      className='flex flex-row gap-1 items-center justify-center text-[20px] text-white cursor-pointer'
                      onClick={() => toggleItem(post.id)}
                    >
                      <MdModeComment /> 12
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

                {/*Music Card Leave Review*/}
                <SlideDown className={'my-dropdown-slidedown'}>
                  {openItemId === post.id && (
                    <div className='w-full flex flex-row gap-4 justify-between items-center px-3 py-2 bg-[#3a3a3a] rounded-full'>
                      <div className='w-[5%]'>
                        <img
                          src={userPlaceHolder}
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
                        >
                          <span className='text-white text-[16px]'>
                            Submit Review
                          </span>
                          <IoSend />
                        </button>
                      </div>
                    </div>
                  )}
                </SlideDown>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
