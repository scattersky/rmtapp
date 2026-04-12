'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import { Audio } from 'react-loader-spinner';
import { ThreeDots } from 'react-loader-spinner';
import Header from '@/components/Header';
import { MultiSelect } from 'primereact/multiselect';
import { InputTextarea } from 'primereact/inputtextarea';
import CountrySelector from '@/components/CountrySelect';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {AudioPlayer} from "react-audio-play";
import { MdFavorite, MdFavoriteBorder, MdModeComment } from 'react-icons/md';
import {Tooltip} from "react-tooltip";
import ReactStars from "react-rating-stars-component";
import { FaYoutube } from 'react-icons/fa6';
import { FaSquareInstagram } from 'react-icons/fa6';
import { FaSoundcloud } from 'react-icons/fa6';
import { FaSpotify } from 'react-icons/fa6';
import { FaCircleInfo } from 'react-icons/fa6';


import moment from 'moment';

import Cookies from 'js-cookie';
import { useAuth } from '@/context/AuthContext';
import RequireAuth from '@/components/RequireAuth';
import { Button } from '@mui/material';
import { replaceProfanities } from 'no-profanity';

function Dashboard() {
  const { user_id } = useAuth();



  const socialFormUpdatedToast = () =>
    toast.success('Social Media Updated!', {
      position: 'bottom-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'colored',
    });


  const aboutFormUpdatedToast = () =>
    toast.success('Basic Info Updated!', {
      position: 'bottom-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'colored',
    });
  const replyFormUpdatedToast = () =>
    toast.success('Reply Posted!', {
      position: 'bottom-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'colored',
    });

  const router = useRouter();
  const params = router.query;



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
  const [reviewsGivenVisibility, setReviewsGivenVisibility] = useState(false);
  const [reviewsReceivedActive, setReviewsReceivedActive] = useState(true);
  const [reviewsGivenActive, setReviewsGivenActive] = useState(false);
  const handleReviewsReceivedVisibility = () => {
    setReviewsReceivedVisibility(true);
    setReviewsGivenVisibility(false);
    setReviewsReceivedActive(true);
    setReviewsGivenActive(false);
  };
  const handleReviewsGivenVisibility = () => {
    setReviewsReceivedVisibility(false);
    setReviewsGivenVisibility(true);
    setReviewsReceivedActive(false);
    setReviewsGivenActive(true);
  };
  const [reviewReplyVisibility, setReviewReplyVisibility] = useState(false);
  const [activeReplyReviewId, setActiveReplyReviewId] = useState(null);

  // EDIT PROFILE: Social Media
  const [basicInfoFormLoading, setBasicInfoFormLoading] = useState(false);
  const [basicInfoForm, setBasicInfoForm] = useState({
    username: '',
    age: '',
    city: '',
    state: '',
    country: '',
    user_id: user_id,
  });
  const handleBasicInfoFormChange = (e) => {
    setBasicInfoForm({
      ...basicInfoForm,
      [e.target.name]: e.target.value,
    });
  };
  const handleUpdateBasicInfo = async (e) => {
    e.preventDefault();
    setBasicInfoFormLoading(true);
    try {

      const config = {
        headers: { 'Content-Type': 'application/json' },
      };
      await axios.post(
        'https://ratemytone.com/rmt_api_dashboard_update_basic_info.php',
        basicInfoForm,
        config
      );
      toast.success('Basic Info Updated!', {
        position: 'bottom-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
      });
    } catch (err) {
      toast.error('Something went wrong.', {
        position: 'bottom-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
      });
    }
    setBasicInfoFormLoading(false);

  };


  // EDIT PROFILE: Social Media
  const [socialFormLoading, setSocialFormLoading] = useState(false);
  const [socialForm, setSocialForm] = useState({
    youtube: '',
    instagram: '',
    soundcloud: '',
    spotify: '',
    user_id: user_id,
  });
  const handleSocialFormChange = (e) => {
    setSocialForm({
      ...socialForm,
      [e.target.name]: e.target.value,
    });
  };
  const handleUpdateSocial = async (e) => {
    e.preventDefault();
    setSocialFormLoading(true);
    try {
      await axios.post(
        'https://ratemytone.com/rmt_api_dashboard_update_social.php',
        socialForm
      );
    } catch (err) {
      alert('Something went wrong.');
    }
    setSocialFormLoading(false);
    socialFormUpdatedToast();
  };

  const [replyFormLoading, setReplyFormLoading] = useState(false);
  const [replyForm, setReplyForm] = useState({
    review_id: null,
    reply: '',
    user_id: user_id,
  });
  const handleReplyFormChange = (e) => {
    setReplyForm({
      ...replyForm,
      [e.target.name]: e.target.value,
    });
  };
  const handleUpdateReply= async (e) => {
    e.preventDefault();
    setReplyFormLoading(true);
    try {
      await axios.post(
        'https://ratemytone.com/rmt_api_tone_review_reply.php',
        replyForm
      );
    } catch (err) {
      alert('Something went wrong.');
    }
    setReplyFormLoading(false);
    setActiveReplyReviewId(false);
    await fetchReviewsReceived();
    replyFormUpdatedToast();
  };

  // EDIT PROFILE: About
  const [aboutFormLoading, setAboutFormLoading] = useState(false);
  const [aboutForm, setAboutForm] = useState({
    user_fav_genres: [],
    user_bio: '',
    user_id: user_id,
  });
  const handleAboutFormChange = (e) => {
    setAboutForm({
      ...aboutForm,
      [e.target.name]: e.target.value,
    });
  };
  const handleUpdateAbout = async (e) => {
    e.preventDefault();
    setAboutFormLoading(true);
    try {
      await axios.post(
        'https://ratemytone.com/rmt_api_dashboard_update_about.php',
        aboutForm
      );

    } catch (err) {
      alert('Something went wrong.');
    }
    setAboutFormLoading(false);
    aboutFormUpdatedToast();
  };




  const [selectedGenres, setSelectedGenres] = useState([]);

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

  const [userFavorites, setUserFavorites] = useState([]);
  const [userFavoriteIDs, setUserFavoriteIDs] = useState([]);

  const getUserFavorites = async () => {
    if (!user_id) return;

    const response = await axios.get(
      'https://ratemytone.com/wp-json/wp/v2/users/' + user_id
    );

    let favIDs = response.data.user_favorites || {};

    // Convert object values to array
    favIDs = Object.values(favIDs); // [1, 7747]

    setUserFavoriteIDs(favIDs);

    if (favIDs.length === 0) {
      setUserFavorites([]);
      return;
    }

    const userFavoritesString = favIDs.join(',');

    const response2 = await axios.get(
      'https://ratemytone.com/wp-json/wp/v2/music_list?include=' +
        userFavoritesString
    );

    setUserFavorites(response2.data);
  };
  useEffect(() => {
    getUserFavorites();
  }, [user_id]);

  const fetchReviewsGiven = async () => {
    if (!user_id) return;
    try {

      const response = await axios.get(
        'https://ratemytone.com/wp-json/wp/v2/tone-review?reviewed_by=' +
          user_id
      );
      setReviewsGiven(response.data); // Axios data is in response.data
    } catch (err) {
      console.log(err);
    }
  };
  const fetchReviewsReceived = async () => {
    if (!user_id) return;
    try {

      const response = await axios.get(
        'https://ratemytone.com/wp-json/wp/v2/tone-review?tone_author_id=' +
          user_id
      );
      setReviewsReceived(response.data); // Axios data is in response.data
    } catch (err) {
      console.log(err);
    }
  };

  const fetchCurrentUserData = async () => {
    if (!user_id){
      setCurrentUserLoading(false);
      return;
    }
    try {

      const response = await axios.get(
        'https://ratemytone.com/wp-json/wp/v2/users/' + user_id
      );
      setCurrentUserData(response.data); // Axios data is in response.data
      setAboutForm((prev) => ({
        ...prev,
        user_fav_genres: response.data.user_fav_genres || [],
        user_id: user_id
      }));
      setCurrentUserLoading(false);
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

  }, [user_id]);

  const [genreList, setGenreList] = useState([]);
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await axios.get(
          'https://ratemytone.com/wp-json/wp/v2/music_list_genre'
        );

        // 🔥 Transform API response
        const formatted = res.data.map((term) => ({
          label: term.name, // what shows in UI
          value: term.id, // what gets stored
        }));

        setGenreList(formatted);
      } catch (err) {
        console.error('Error fetching genres:', err);
      }
    };

    fetchGenres();
  }, []);

  const handleAddToFavorites = async (postID) => {
    if (!userFavorites.includes(postID)) {
      const updatedFavorites = [...userFavorites, postID];
      setUserFavorites(updatedFavorites);
      console.log(updatedFavorites);
      try {
        await axios.post(
          `https://ratemytone.com/wp-json/custom/v1/favorites/${user_id}`,
          {
            favorites: updatedFavorites,
          }
        );
        toast.success('Tone Added To Favorites!', {
          position: 'bottom-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'colored',
        });
      } catch (error) {
        console.error('Error Updating Favorites:', error.response.data.message);
      }
    } else {
      const updatedFavorites = userFavorites.filter((id) => id !== postID);
      setUserFavorites(updatedFavorites);
      console.log(updatedFavorites);
      try {
        await axios.post(
          `https://ratemytone.com/wp-json/custom/v1/favorites/${user_id}`,
          {
            favorites: updatedFavorites,
          }
        );
        toast.error('Tone Removed From Favorites.', {
          position: 'bottom-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'colored',
        });
      } catch (error) {
        console.error('Error Updating Favorites:', error.response.data.message);
      }
    }
  };

  if (currentUserLoading)
    return (
      <div id='page'>
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
    <RequireAuth>
      <Header />
      <div id='page'>
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
                  <h2 className='text-white text-[30px]'>Profile Settings</h2>
                  <div className='music_list_item px-[20px] pt-[20px] pb-[30px] flex flex-col gap-5 rounded-3xl mb-[10px] shadowwhite border-[1px] border-[rgba(255,255,255,0.3)]'>
                    <div className=''>
                      <h3 className='text-white text-[18px]'>Basic Info</h3>
                      <hr className='border-[#494949] mt-2' />
                      <form
                        className='mt-4 flex flex-col gap-5'
                        onSubmit={handleUpdateBasicInfo}
                      >
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
                              name='username'
                              placeholder={currentUserData?.user_username}
                              value={basicInfoForm?.username}
                              onChange={handleBasicInfoFormChange}
                              className='w-full border p-2 rounded'
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
                              name='age'
                              placeholder={currentUserData?.user_age}
                              value={basicInfoForm?.age}
                              onChange={handleBasicInfoFormChange}
                              className='w-full border p-2 rounded'
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
                              name='city'
                              placeholder={currentUserData?.user_city}
                              value={basicInfoForm?.city}
                              onChange={handleBasicInfoFormChange}
                              className='w-full border p-2 rounded'
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
                              name='state'
                              placeholder={currentUserData?.user_state}
                              value={basicInfoForm?.state}
                              onChange={handleBasicInfoFormChange}
                              className='w-full border p-2 rounded'
                            />
                          </div>
                          <div className='w-full'>
                            <label
                              className='text-white p-1 mb-1 block'
                              htmlFor='age'
                            >
                              Country
                            </label>
                            <input
                              type='text'
                              name='country'
                              placeholder={currentUserData?.user_country}
                              value={basicInfoForm?.country}
                              onChange={handleBasicInfoFormChange}
                              className='w-full border p-2 rounded'
                            />
                          </div>
                        </div>
                        <div className='flex justify-end gap-[20px]'>
                          <button
                            type='submit'
                            disabled={basicInfoFormLoading}
                            className='px-4 py-[5px] mt-2 text-white bg-[#53A870] rounded-full font-normal'
                          >
                            {basicInfoFormLoading ? 'Updating...' : 'Update'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                  <div className='music_list_item px-[20px]  pt-[20px] pb-[30px] flex flex-col gap-5 rounded-3xl mb-[20px] shadowwhite border-[1px] border-[rgba(255,255,255,0.3)]'>
                    <div className=''>
                      <h3 className='text-white text-[18px]'>About Me</h3>
                      <hr className='border-[#494949] mt-2' />
                      <form
                        className='mt-4 flex flex-col gap-5'
                        onSubmit={handleUpdateAbout}
                      >
                        <div className='flex gap-[20px]'>
                          <div className='w-full'>
                            <label
                              className='text-white p-1 mb-1 block'
                              htmlFor='genres'
                            >
                              Favorite Genres
                            </label>
                            <MultiSelect
                              value={aboutForm.user_fav_genres}
                              onChange={(e) =>
                                setAboutForm((prev) => ({
                                  ...prev,
                                  user_fav_genres: e.value,
                                }))
                              }
                              options={genreList}
                              optionLabel='label'
                              display='chip'
                              placeholder='Please select up to 3 genres...'
                              maxSelectedLabels={3}
                              className='w-full md:w-20rem'
                            />

                          </div>
                        </div>
                        <div className='flex gap-[20px]'>
                          <div className='w-full'>
                            <label
                              className='text-white p-1 mb-1 gap-2 flex items-center'
                              htmlFor='username'
                            >
                              Bio
                              <FaCircleInfo
                                data-tooltip-id='bio-tooltip'
                                data-tooltip-content='One sentence about yourself.'
                              />
                              <Tooltip id='bio-tooltip' />
                            </label>
                            <input
                              type='text'
                              name='user_bio'
                              placeholder={currentUserData.user_bio}
                              value={aboutForm?.user_bio}
                              onChange={handleAboutFormChange}
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
                      <form
                        className='mt-4 flex flex-col gap-5'
                        onSubmit={handleUpdateSocial}
                      >
                        <div className='flex gap-[20px]'>
                          <div className='w-full'>
                            <label
                              className='text-white p-1 mb-1 flex items-center gap-2'
                              htmlFor='youtube'
                            >
                              <FaYoutube className='text-lg text-white' />
                              YouTube
                            </label>
                            <input
                              type='text'
                              name='youtube'
                              placeholder={currentUserData.user_youtube}
                              value={socialForm?.youtube}
                              onChange={handleSocialFormChange}
                              className='w-full border p-2 rounded'
                            />
                          </div>
                          <div className='w-full'>
                            <label
                              className='text-white p-1 mb-1 flex items-center gap-2'
                              htmlFor='instagram'
                            >
                              <FaSquareInstagram className='text-lg text-white' />
                              Instagram
                            </label>
                            <input
                              type='text'
                              name='instagram'
                              placeholder={currentUserData.user_instagram}
                              value={socialForm?.instagram}
                              onChange={handleSocialFormChange}
                              className='w-full border p-2 rounded'
                            />
                          </div>
                        </div>
                        <div className='flex gap-[20px]'>
                          <div className='w-full'>
                            <label
                              className='text-white p-1 mb-1 flex items-center gap-2'
                              htmlFor='soundcloud'
                            >
                              <FaSoundcloud className='text-lg text-white' />
                              SoundCloud
                            </label>
                            <input
                              type='text'
                              name='soundcloud'
                              placeholder={currentUserData.user_soundcloud}
                              value={socialForm?.soundcloud}
                              onChange={handleSocialFormChange}
                              className='w-full border p-2 rounded'
                            />
                          </div>
                          <div className='w-full'>
                            <label
                              className='text-white p-1 mb-1 flex items-center gap-2'
                              htmlFor='spotify'
                            >
                              <FaSpotify className='text-lg text-white' />
                              Spotify
                            </label>
                            <input
                              type='text'
                              name='spotify'
                              placeholder={currentUserData.user_spotify}
                              value={socialForm?.spotify}
                              onChange={handleSocialFormChange}
                              className='w-full border p-2 rounded'
                            />
                          </div>
                        </div>
                        <div className='flex justify-end gap-[20px]'>
                          <button
                            type='submit'
                            disabled={socialFormLoading}
                            className='px-4 py-[5px] mt-2 text-white bg-[#53A870] rounded-full font-normal'
                          >
                            {socialFormLoading ? 'Updating...' : 'Update'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}
              {favoritesVisible && (
                <div className='music_list_item p-[20px] flex flex-col gap-5'>
                  <h2 className='text-white text-[30px]'>Favorites</h2>

                  {Array.isArray(userFavorites) &&
                    userFavorites.map((post) => {
                      const isFav = userFavorites.includes(post.id);
                      return (
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
                            <p className='text-white'>
                              {post.plain_text_excerpt}
                            </p>
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
                                <div
                                  className='flex flex-row gap-1 items-center text-[20px] text-white cursor-pointer'
                                  onClick={() => handleAddToFavorites(post.id)}
                                >
                                  {isFav ? (
                                    <MdFavorite color='red' />
                                  ) : (
                                    <MdFavoriteBorder />
                                  )}
                                </div>
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
                      );
                    })}
                  {userFavorites.length === 0 && (
                    <p className='text-white'>
                      You have no favorite tones yet. Head over to the{' '}
                      <Link
                        href='tonefeed.jsx'
                        className='text-[#53A870] font-bold'
                      >
                        Tone Feed
                      </Link>{' '}
                      to start listening!
                    </p>
                  )}
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

                            <div className='flex flex-row gap-2 items-center justify-end'>
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
                              <button
                                onClick={() => {
                                  setActiveReplyReviewId(review.id);
                                  setReplyForm((prev) => ({
                                    ...prev,
                                    review_id: review.id,
                                  }));
                                }}
                                className='py-1 px-[45px] text-[13px] mt-3 text-[#53A870] text-center bg-none border-[#53A870] border-[2px] rounded-full inline-block cursor-pointer'
                              >
                                {review.review_reply !== ''
                                  ? 'Edit Reply'
                                  : 'Reply'}
                              </button>
                            </div>
                          </div>

                          <p className='text-white'>
                            {review.acf.tone_review_text}
                          </p>
                          {review.review_reply !== '' && (
                            <div className='border-gray-500 border-t p-4 mt-2'>
                              <h4 className='text-sm text-white mb-1'>
                                Your Reply
                              </h4>
                              <span className='text-white text-[10px] uppercase tracking-[1px]'>
                                {moment(review.review_reply_date).format(
                                  'MMMM Do YYYY'
                                )}
                              </span>
                              <p className='text-xs text-white'>
                                {replaceProfanities(review.review_reply)}
                              </p>
                            </div>
                          )}
                          <div className='flexr'>
                            {activeReplyReviewId === review.id && (
                              <form
                                className='mt-4 flex flex-col gap-5'
                                onSubmit={handleUpdateReply}
                              >
                                <div className='w-full'>
                                  <label
                                    className='text-white p-1 mb-1 block'
                                    htmlFor='age'
                                  >
                                    Your Reply
                                  </label>
                                  <input
                                    type='text'
                                    name='reply'
                                    placeholder=''
                                    value={replyForm?.reply}
                                    onChange={handleReplyFormChange}
                                    className='w-full border py-2 px-4 rounded-full'
                                  />

                                  <button
                                    type='submit'
                                    disabled={replyFormLoading}
                                    className='w-full flex justify-end p-0'
                                  >
                                    <div className='cursor-pointer font-normal bg-[#53A870] text-[15px] px-4 py-2 min-w-[140px] rounded-full ml-auto mr-0 mt-2 text-center flex justify-center items-center'>
                                      {replyFormLoading ? (
                                        <ThreeDots
                                          height='20'
                                          width='20'
                                          radius='9'
                                          color='#fff'
                                          ariaLabel='three-dots-loading'
                                          wrapperStyle={{ margin: '0px' }}
                                          wrapperClass='custom-loader'
                                          visible={true}
                                        />
                                      ) : (
                                        <span className='font-normal text-sm text-white'>
                                          Submit Reply
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                </div>
                              </form>
                            )}
                          </div>
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
    </RequireAuth>
  );
}

export default Dashboard;
