import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import { Audio } from 'react-loader-spinner';

import Header from '@/components/Header';
import { MultiSelect } from 'primereact/multiselect';
import { InputTextarea } from 'primereact/inputtextarea';
import CountrySelector from '@/components/CountrySelect';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {AudioPlayer} from "react-audio-play";
import { MdFavorite, MdModeComment } from 'react-icons/md';
import {Tooltip} from "react-tooltip";
import ReactStars from "react-rating-stars-component";
import {SlideDown} from "react-slidedown";
import {IoSend} from "react-icons/io5";
import moment from 'moment';

function Dashboard() {
  const notify = () =>
    toast.success('Success!', {
      position: 'top-center',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'dark',
    });
  const router = useRouter();
  const params = router.query;

  //const currentUserID = localStorage.getItem('user_id');
  const [currentUser, setCurrentUser] = useState('');


  useEffect(() => {
    const currentUserID = localStorage.getItem('user_id');
    if (currentUserID) {
      setCurrentUser(currentUserID);
    }
  }, []);

  const [currentUserData, setCurrentUserData] = useState([]);
  const [currentUserError, setCurrentUserError] = useState(null);
  const [currentUserLoading, setCurrentUserLoading] = useState(true);

  const [settingsVisible, setSettingsVisible] = useState(true);
  const handleSettingsVisibility = () => {
    setSettingsVisible(true);
    setFavoritesVisible(false);
    setReviewsVisible(false);
  };
  const [favoritesVisible, setFavoritesVisible] = useState(false);
  const handleFavoritesVisibility = () => {
    setSettingsVisible(false);
    setFavoritesVisible(true);
    setReviewsVisible(false);
  };
  const [reviewsVisible, setReviewsVisible] = useState(false);
  const handleReviewsVisibility = () => {
    setSettingsVisible(false);
    setFavoritesVisible(false);
    setReviewsVisible(true);
  };

  const [favTones, setFavTones] = useState([]);
  const [reviewsGiven, setReviewsGiven] = useState([]);
  const [reviewsReceived, setReviewsReceived] = useState([]);
  const [reviewsReceivedVisibility, setReviewsReceivedVisibility] =
    useState(true);
  const [reviewsGivenVisibility, setReviewsGivenVisibility] =
    useState(false);
  const [reviewsReceivedActive, setReviewsReceivedActive] = useState(true);
  const [reviewsGivenActive, setReviewsGivenActive] = useState(false);
  const handleReviewsReceivedVisibility = () => {
    setReviewsReceivedVisibility(true);
    setReviewsGivenVisibility(false);
    setReviewsReceivedActive(true);
    setReviewsGivenActive(false);
  }
  const handleReviewsGivenVisibility = () => {
    setReviewsReceivedVisibility(false);
    setReviewsGivenVisibility(true);
    setReviewsReceivedActive(false);
    setReviewsGivenActive(true);
  };



  // Profile Settings
  const [userUsername, setUserUsername] = useState(
    currentUserData.user_username
  );
  const [inputUserCity, setInputUserCity] = useState(currentUserData.user_city);
  const [inputUserState, setInputUserState] = useState(
    currentUserData.user_state
  );
  const [inputUserCountry, setInputUserCountry] = useState(
    currentUserData.user_country
  );
  const [inputUserBio, setInputUserBio] = useState(currentUserData.user_bio);
  const [inputUserAge, setInputUserAge] = useState(currentUserData.user_age);
  const [selectedGenres, setSelectedGenres] = useState(
    currentUserData.user_fav_genres
  );
  const [inputUserYoutube, setInputUserYoutube] = useState(
    currentUserData.user_youtube
  );
  const [inputUserInsta, setInputUserInsta] = useState(
    currentUserData.user_insta
  );
  const [inputUserSoundcloud, setInputUserSoundcloud] = useState(
    currentUserData.user_soundcloud
  );
  const [inputUserSpotify, setInputUserSpotify] = useState(
    currentUserData.user_spotify
  );

  const fetchFavTones = async () => {
    try {
      const response = await axios.get(
        'https://ratemytone.com/wp-json/wp/v2/music_list'
      );
      setFavTones(response.data); // Axios data is in response.data
    } catch (err) {
      console.log(err);
    }
  };
  const fetchReviewsGiven= async () => {
    try {
      const response = await axios.get(
        'https://ratemytone.com/wp-json/wp/v2/tone-review?reviewed_by=' +
          currentUser
      );
      setReviewsGiven(response.data); // Axios data is in response.data
    } catch (err) {
      console.log(err);
    }
  };
  const fetchReviewsReceived = async () => {
    try {
      const response = await axios.get(
        'https://ratemytone.com/wp-json/wp/v2/tone-review?tone_author_id=' +
          currentUser
      );
      setReviewsReceived(response.data); // Axios data is in response.data
    } catch (err) {
      console.log(err);
    }
  };

  const fetchCurrentUserData = async () => {
    try {
      const currentUserID = localStorage.getItem('user_id');
      const response = await axios.get(
        'https://ratemytone.com/wp-json/wp/v2/users/' + currentUser
      );
      setCurrentUserData(response.data); // Axios data is in response.data
      setSelectedGenres(currentUserData.user_fav_genres);
      setCurrentUserLoading(false);
      setInputUserYoutube(currentUserData.user_youtube);
    } catch (err) {
      setCurrentUserError(err);
      setCurrentUserLoading(false);
    }
  };
  useEffect(() => {
    fetchCurrentUserData();
    fetchFavTones();
    fetchReviewsGiven();
    fetchReviewsReceived();
  }, []);

  const genreList = [
    { label: 'Acoustic', value: 'Acoustic' },
    { label: 'Bluegrass', value: 'Bluegrass' },
    { label: 'Blues', value: 'Blues' },
    { label: 'Country', value: 'Country' },
    { label: 'Electronic', value: 'Electronic' },
    { label: 'Experimental', value: 'Experimental' },
    { label: 'Funk', value: 'Funk' },
    { label: 'Hip Hop', value: 'Hip Hop' },
    { label: 'Jazz', value: 'Jazz' },
    { label: 'Latin', value: 'Latin' },
    { label: 'Metal', value: 'Metal' },
    { label: 'Other', value: 'Other' },
    { label: 'Pop', value: 'Pop' },
    { label: 'Psychedelic', value: 'Psychedelic' },
    { label: 'R&B / Soul', value: 'R&B / Soul' },
    { label: 'Reggae', value: 'Reggae' },
    { label: 'Rock', value: 'Rock' },
    { label: 'World', value: 'World' },
  ];

  const handleUserYoutubeChange = (event) => {
    setInputUserYoutube(event.target.value);
  };
  const handleUpdateUserSocial = (event) => {
    event.preventDefault();

    axios
      .post(
        'https://ratemytone.com/rmt_api_dashboard_social.php',
        {
          userYoutube: inputUserYoutube,
          userInsta: inputUserInsta,
          userSoundcloud: inputUserSoundcloud,
          userSpotify: inputUserSpotify,
          userID: currentUserID,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      .then(function (response) {
        console.log(response.data);
      })
      .catch(function (error) {
        console.error('Error submitting form:', error);
      });
    notify();
  };

  if (currentUserLoading)
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
  if (currentUserError)
    return (
      <div>
        <p>Error: {currentUserError.message}</p>
      </div>
    );

  return (
    <div id='page'>
      <Header />
      <ToastContainer />
      <div className='flex flex-1 flex-col items-center bg-[#141414] w-full h-full min-w-[100vw] min-h-[100vh]'>
        {/*Page Title*/}
        <div className='flex flex-row justify-evenly items-center w-full p-[20px] border-b-[3px] border-white mb-3'>
          <div className='max-w-[1300px] w-full px-2'>
            <h1 className='text-white text-[30px] font-bold leading-4 tracking-wider uppercase py-5'>
              Dashboard
            </h1>
          </div>
        </div>
        {/*Page Content*/}
        <div className='flex min-h-[100vh] flex-row max-w-[1300px] w-full py-6 px-6 justify-between gap-6'>
          <div className='w-[20%]'>
            <div className='flex flex-col items-center gap-8 p-[20px] rounded-3xl'>
              <img
                src={currentUserData.author_image_url}
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
                    @{currentUserData.user_username}
                  </div>
                </Link>
              </div>
              <div className='text-center'>
                <strong className='text-white uppercase text-[12px] tracking-[2px] block'>
                  Member Since:
                </strong>
                <span className='text-white text-[12px]'>
                  {moment(currentUserData.registered_date).format(
                    'MMMM Do YYYY'
                  )}
                </span>
              </div>
              <div className='text-center'>
                <strong className='text-white uppercase text-[12px] tracking-[2px] block'>
                  Tone Posts:
                </strong>
                <span className='text-white text-[12px]'>
                  {currentUserData.user_post_count}
                </span>
              </div>
              <div className='w-[100%]'>
                <button
                  onClick={handleSettingsVisibility}
                  className='block px-5 mb-4 py-2 w-[100%] text-center text-white text-[14px] cursor-pointer rounded-full bg-[#53A870] font-normal'
                >
                  Profile Settings
                </button>
                <button
                  onClick={handleFavoritesVisibility}
                  className='block px-5 py-2 mb-4 w-[100%] text-center text-white text-[14px] cursor-pointer rounded-full bg-[#53A870] font-normal'
                >
                  My Favorites
                </button>
                <button
                  onClick={handleReviewsVisibility}
                  className='block px-5 py-2 mb-4 w-[100%] text-center text-white text-[14px] cursor-pointer rounded-full bg-[#53A870] font-normal'
                >
                  Tone Ratings
                </button>
                <Link
                  href={{
                    pathname: '/',
                  }}
                  className='cursor-pointer'
                >
                  <span className='block px-5 py-2 mb-4 w-[100%] text-center text-white text-[14px] cursor-pointer rounded-full bg-[#53A870] font-normal'>
                    Tone Feed
                  </span>
                </Link>
              </div>
            </div>
          </div>
          <div className='w-[80%] p-6'>
            {settingsVisible && (
              <div className='music_list_item p-[20px] flex flex-col gap-5'>
                <h2 className='text-white text-[22px]'>Profile Settings</h2>
                <div className='music_list_item px-[20px] pt-[20px] pb-[30px] flex flex-col gap-5 rounded-3xl mb-[10px] shadowwhite border-[1px] border-[rgba(255,255,255,0.3)]'>
                  <div className=''>
                    <h3 className='text-white text-[18px]'>Basic Info</h3>
                    <hr className='border-[#494949] mt-2' />
                    <form className='mt-4 flex flex-col gap-5'>
                      <div className='flex gap-[20px]'>
                        <div className='w-full'>
                          <label
                            className='text-white p-1 mb-1 block'
                            htmlFor='username'
                          >
                            Username
                          </label>
                          <input
                            type='text'
                            placeholder={currentUserData.user_username}
                            value={currentUserData.user_username}
                            onChange={(e) => setUserUsername(e.target.value)}
                            className='rounded-xl w-full'
                          />
                        </div>
                        <div className='w-full'>
                          <label
                            className='text-white p-1 mb-1 block'
                            htmlFor='age'
                          >
                            Age
                          </label>
                          <input
                            type='number'
                            placeholder={currentUserData.user_age}
                            value={currentUserData.user_age}
                            onChange={(e) => setInputUserAge(e.target.value)}
                            className='rounded-xl w-full'
                          />
                        </div>
                      </div>
                      <div className='flex gap-[20px]'>
                        <div className='w-full'>
                          <label
                            className='text-white p-1 mb-1 block'
                            htmlFor='username'
                          >
                            City
                          </label>
                          <input
                            type='text'
                            placeholder={currentUserData.user_city}
                            value={currentUserData.user_city}
                            onChange={(e) => setInputUserCity(e.target.value)}
                            className='rounded-xl w-full'
                          />
                        </div>
                        <div className='w-full'>
                          <label
                            className='text-white p-1 mb-1 block'
                            htmlFor='displayName'
                          >
                            State/Province
                          </label>
                          <input
                            type='text'
                            placeholder={currentUserData.user_state}
                            value={currentUserData.user_state}
                            onChange={(e) => setInputUserState(e.target.value)}
                            className='rounded-xl w-full'
                          />
                        </div>
                        <div className='w-full'>
                          <label
                            className='text-white p-1 mb-1 block'
                            htmlFor='age'
                          >
                            Country
                          </label>
                          <CountrySelector
                            value={currentUserData.user_country}
                            placeholder={currentUserData.user_country}
                          />
                          {/*<input*/}
                          {/*  type='number'*/}
                          {/*  placeholder={currentUserData.user_country}*/}
                          {/*  value={currentUserData.user_country}*/}
                          {/*  onChange={(e) =>*/}
                          {/*    setInputUserCountry(e.target.value)*/}
                          {/*  }*/}
                          {/*  className='rounded-xl w-full'*/}
                          {/*/>*/}
                        </div>
                      </div>
                      <div className='flex justify-end gap-[20px]'>
                        <button className='px-4 py-[5px] mt-2 text-white bg-[#53A870] rounded-full font-normal'>
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
                <div className='music_list_item px-[20px]  pt-[20px] pb-[30px] flex flex-col gap-5 rounded-3xl mb-[20px] shadowwhite border-[1px] border-[rgba(255,255,255,0.3)]'>
                  <div className=''>
                    <h3 className='text-white text-[18px]'>About Me</h3>
                    <hr className='border-[#494949] mt-2' />
                    <form className='mt-4 flex flex-col gap-5'>
                      <div className='flex gap-[20px]'>
                        <div className='w-full'>
                          <label
                            className='text-white p-1 mb-1 block'
                            htmlFor='genres'
                          >
                            Favorite Genres
                          </label>
                          <MultiSelect
                            value={selectedGenres}
                            onChange={(e) => setSelectedGenres(e.value)}
                            options={genreList}
                            optionLabel='label'
                            display='chip'
                            // placeholder='Select up to 3 genres...'
                            placeholder='Please select up to 3 genres...'
                            maxSelectedLabels={3}
                            className='w-full md:w-20rem'
                          />
                        </div>
                      </div>
                      <div className='flex gap-[20px]'>
                        <div className='w-full'>
                          <label
                            className='text-white p-1 mb-1 block'
                            htmlFor='username'
                          >
                            Bio
                          </label>
                          <input
                            type='text'
                            placeholder={currentUserData.user_bio}
                            value={currentUserData.user_bio}
                            onChange={(e) => setInputUserBio(e.target.value)}
                            className='rounded-xl w-full'
                          />
                        </div>
                      </div>
                      <div className='flex justify-end gap-[20px]'>
                        <button className='px-4 py-[5px] mt-2 text-white bg-[#53A870] rounded-full font-normal'>
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
                <div className='music_list_item px-[20px] pt-[20px] pb-[30px] flex flex-col gap-5 rounded-3xl mb-[10px] shadowwhite border-[1px] border-[rgba(255,255,255,0.3)]'>
                  <div className=''>
                    <h3 className='text-white text-[18px]'>Social</h3>
                    <hr className='border-[#494949] mt-2' />
                    <form className='mt-4 flex flex-col gap-5'>
                      <div className='flex gap-[20px]'>
                        <div className='w-full'>
                          <label
                            className='text-white p-1 mb-1 block'
                            htmlFor='username'
                          >
                            YouTube
                          </label>
                          <input
                            type='text'
                            placeholder={inputUserYoutube}
                            // value={inputUserYoutube}
                            onChange={handleUserYoutubeChange}
                            className='rounded-xl w-full'
                          />
                        </div>
                        <div className='w-full'>
                          <label
                            className='text-white p-1 mb-1 block'
                            htmlFor='age'
                          >
                            Instagram
                          </label>
                          <input
                            type='text'
                            placeholder={currentUserData.user_instagram}
                            value={currentUserData.user_instagram}
                            onChange={(e) => setInputUserInsta(e.target.value)}
                            className='rounded-xl w-full'
                          />
                        </div>
                      </div>
                      <div className='flex gap-[20px]'>
                        <div className='w-full'>
                          <label
                            className='text-white p-1 mb-1 block'
                            htmlFor='username'
                          >
                            SoundCloud
                          </label>
                          <input
                            type='text'
                            placeholder={currentUserData.user_soudcloud}
                            value={currentUserData.user_soundcloud}
                            onChange={(e) =>
                              setInputUserSoundcloud(e.target.value)
                            }
                            className='rounded-xl w-full'
                          />
                        </div>
                        <div className='w-full'>
                          <label
                            className='text-white p-1 mb-1 block'
                            htmlFor='age'
                          >
                            Spotify
                          </label>
                          <input
                            type='text'
                            placeholder={currentUserData.user_spotify}
                            value={currentUserData.user_spotify}
                            onChange={(e) =>
                              setInputUserSpotify(e.target.value)
                            }
                            className='rounded-xl w-full'
                          />
                        </div>
                      </div>
                      <div className='flex justify-end gap-[20px]'>
                        <button
                          className='px-4 py-[5px] mt-2 text-white bg-[#53A870] rounded-full font-normal'
                          onClick={handleUpdateUserSocial}
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
            {favoritesVisible && (
              <div className='music_list_item p-[20px] flex flex-col gap-5'>
                <h2 className='text-white text-[22px]'>Favorites</h2>
                {favTones.map((post) => (
                  <div
                    key={post.id}
                    className='music_list_item p-[20px] flex flex-col gap-5 rounded-3xl mb-[40px] shadowwhite border-[1px] border-[rgba(255,255,255,0.3)]'
                  >
                    {/*Music List Card Upper*/}
                    <div className='w-full flex flex-col md:flex-row gap-4'>
                      <img
                        src={post.featured_media_src_url}
                        className='w-full md:max-w-[250px] rounded-xl'
                        alt='Tone Image'
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
                              query: {
                                id: post.author,
                                name: post.author_name,
                              },
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
                    <div className='w-full flex flex-col-reverse md:flex-row gap-4 justify-between'>
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
                        <div className='py-2 px-[60px] text-white text-center bg-none border-white border-[2px] rounded-full inline-block cursor-pointer'>
                          Tone Notes
                        </div>
                      </Link>
                      <div className='flex flex-row gap-6 items-center md:justify-start'>
                        <div className='flex flex-row gap-1 items-center justify-center text-[20px] text-white cursor-pointer'>
                          <MdFavorite
                            data-tooltip-id='fav-tooltip'
                            data-tooltip-content='Favorite'
                          />
                          3
                          <Tooltip id='fav-tooltip' />
                        </div>
                        <div className='flex flex-row gap-1 items-center justify-center text-[20px] text-white cursor-pointer'>
                          <MdModeComment
                            data-tooltip-id='rate-tooltip'
                            data-tooltip-content='Rate My Tone'
                          />
                          12
                          <Tooltip id='rate-tooltip' />
                        </div>
                        <ReactStars
                          edit={false}
                          count={5}
                          value={post.average_rating}
                          size={25}
                          activeColor='#ffd700'
                          className='ml-auto'
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {reviewsVisible && (
              <div className='music_list_item p-[20px] flex flex-col gap-5'>
                <h2 className='text-white text-[30px]'>Reviews</h2>
                <div className='flex justify-center items-center gap-[20px]'>
                  <button
                    onClick={handleReviewsReceivedVisibility}
                    className='block w-[100%]'
                  >
                    {reviewsReceivedActive ? (
                      <div className='block px-5 mb-4 py-2 w-[100%] text-center text-white text-[14px] cursor-pointer rounded-full bg-[#53A870] font-normal'>
                        Reviews Received
                      </div>
                    ) : (
                      <div className='block px-5 mb-4 py-2 w-[100%] text-center text-[#53A870] text-[14px] cursor-pointer rounded-full bg-none border-[2px] border-[#53A870] font-normal'>
                        Reviews Received
                      </div>
                    )}
                  </button>
                  <button
                    onClick={handleReviewsGivenVisibility}
                    className='block w-[100%]'
                  >
                    {reviewsGivenActive ? (
                      <div className='block px-5 mb-4 py-2 w-[100%] text-center text-white text-[14px] cursor-pointer rounded-full bg-[#53A870] font-normal'>
                        Reviews Given
                      </div>
                    ) : (
                      <div className='block px-5 mb-4 py-2 w-[100%] text-center text-[#53A870] text-[14px] cursor-pointer rounded-full bg-none border-[2px] border-[#53A870] font-normal'>
                        Reviews Given
                      </div>
                    )}
                  </button>
                </div>

                {/*Reviews Received*/}
                {reviewsReceivedVisibility && (
                  <div>
                    {reviewsReceived.map((review) => (
                      <div
                        key={review.id}
                        className='p-[20px] flex flex-col gap-2 rounded-3xl mb-[40px] shadowwhite border-[1px] border-[rgba(255,255,255,0.3)]'
                      >
                        <div className='flex justify-between items-center'>
                          <span className='text-white text-[10px] uppercase tracking-[1px]'>
                            {moment(review.post_date).format('MMMM Do YYYY')}
                          </span>
                          <ReactStars
                            edit={false}
                            count={5}
                            value={review.acf.tone_review_stars}
                            size={25}
                            activeColor='#ffd700'
                          />
                        </div>
                        <div className='flex justify-between items-start'>
                          <h4 className='text-white text-[24px]'>
                            {review.title.rendered}
                          </h4>
                          <Link
                            href={{
                              pathname: '/singletone',
                              query: {
                                id: review.id,
                                title: review.title.rendered,
                              },
                            }}
                          >
                            <div className='py-1 px-[45px] text-[13px] mt-3 text-white text-center bg-none border-white border-[2px] rounded-full inline-block cursor-pointer'>
                              View Tone
                            </div>
                          </Link>
                        </div>

                        <p className='text-white'>
                          {review.acf.tone_review_text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/*Reviews Given*/}
                {reviewsGivenVisibility && (
                  <div>
                    {reviewsGiven.map((review) => (
                      <div
                        key={review.id}
                        className='p-[20px] flex flex-col gap-2 rounded-3xl mb-[40px] shadowwhite border-[1px] border-[rgba(255,255,255,0.3)]'
                      >
                        <div className='flex justify-between items-center'>
                          <span className='text-white text-[10px] uppercase tracking-[1px]'>
                            {moment(review.post_date).format('MMMM Do YYYY')}
                          </span>
                          <ReactStars
                            edit={false}
                            count={5}
                            value={review.acf.tone_review_stars}
                            size={25}
                            activeColor='#ffd700'
                          />
                        </div>
                        <div className='flex justify-between items-start'>
                          <h4 className='text-white text-[24px]'>
                            {review.title.rendered}
                          </h4>
                          <Link
                            href={{
                              pathname: '/singletone',
                              query: {
                                id: review.id,
                                title: review.title.rendered,
                              },
                            }}
                          >
                            <div className='py-1 px-[45px] text-[13px] mt-3 text-white text-center bg-none border-white border-[2px] rounded-full inline-block cursor-pointer'>
                              View Tone
                            </div>
                          </Link>
                        </div>

                        <p className='text-white'>
                          {review.acf.tone_review_text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
