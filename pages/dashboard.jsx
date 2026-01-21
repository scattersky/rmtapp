import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import { Audio } from 'react-loader-spinner';
import moment from 'moment';
import Header from '@/components/Header';
import { MultiSelect } from 'primereact/multiselect';
import { InputTextarea } from 'primereact/inputtextarea';


function Dashboard() {

  const router = useRouter();
  const params = router.query;

  const [currentUser, setCurrentUser] = useState('');

  const [currentUserData, setCurrentUserData] = useState([]);
  const [currentUserError, setCurrentUserError] = useState(null);
  const [currentUserLoading, setCurrentUserLoading] = useState(true);

  const [settingsVisible, setSettingsVisible] = useState(true);
  const handleSettingsVisibility = ()=>{
    setSettingsVisible(true);
  }

  useEffect(() => {
    const fetchCurrentcurrentUserData = async () => {
      try {
        const currentUserID = localStorage.getItem('user_id');

        setCurrentUser(currentUserID);
        const response = await axios.get(
          'https://ratemytone.com/wp-json/wp/v2/users/' + currentUserID
        );
        setCurrentUserData(response.data); // Axios data is in response.data
        setCurrentUserLoading(false);
      } catch (err) {
        setCurrentUserError(err);
        setCurrentUserLoading(false);
      }
    };
    fetchCurrentcurrentUserData();
  }, []);

  // Profile Settings
  const [userUsername, setUserUsername] = useState(currentUserData.user_username);
  const [inputUserCity, setInputUserCity] = useState(currentUserData.user_city);
  const [inputUserState, setInputUserState] = useState(currentUserData.user_state);
  const [inputUserCountry, setInputUserCountry] = useState(currentUserData.user_country);
  const [inputUserBio, setInputUserBio] = useState(currentUserData.user_bio);
  const [inputUserAge, setInputUserAge] = useState(currentUserData.user_age);
  const [selectedGenres, setSelectedGenres] = useState(currentUserData.user_fav_genres);
  const [inputUserYoutube, setInputUserYoutube] = useState(currentUserData.user_youtube);
  const [inputUserInsta, setInputUserInsta] = useState(currentUserData.user_insta);
  const [inputUserSoundcloud, setInputUserSoundcloud] = useState(currentUserData.user_soundcloud);
  const [inputUserSpotify, setInputUserSpotify] = useState(currentUserData.user_spotify);


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
    { label: 'World', value: 'World' }
  ];




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
                    @{currentUserData.slug}
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
                  className='block px-5 py-2 w-[100%] text-center text-white text-[14px] cursor-pointer rounded-full bg-[#53A870] font-normal'
                >
                  Profile Settings
                </button>
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
                            placeholder={userUsername}
                            value={userUsername}
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
                            placeholder={inputUserAge}
                            value={inputUserAge}
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
                            placeholder={inputUserCity}
                            value={inputUserCity}
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
                            placeholder={inputUserState}
                            value={inputUserState}
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
                          <input
                            type='number'
                            placeholder={inputUserCountry}
                            value={inputUserCountry}
                            onChange={(e) => setInputUserCountry(e.target.value)}
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
                            placeholder='Select up to 3 genres...'
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
                            placeholder={inputUserBio}
                            value={inputUserBio}
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
                            value={inputUserYoutube}
                            onChange={(e) => setInputUserYoutube(e.target.value)}
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
                            placeholder={inputUserInsta}
                            value={inputUserInsta}
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
                            placeholder={inputUserSoundcloud}
                            value={inputUserSoundcloud}
                            onChange={(e) => setInputUserSoundcloud(e.target.value)}
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
                            placeholder={inputUserSpotify}
                            value={inputUserSpotify}
                            onChange={(e) => setInputUserSpotify(e.target.value)}
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
