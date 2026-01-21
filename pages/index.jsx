import React, { useEffect, useState } from 'react';
import  Header  from '../components/Header';
import axios from 'axios'
import Link from 'next/link';
import { FaRegComments } from 'react-icons/fa6';
import { MdFavorite, MdModeComment } from 'react-icons/md';
import { AudioPlayer } from 'react-audio-play';
import { Audio } from 'react-loader-spinner'
import ReactStars from 'react-rating-stars-component/dist/react-stars';
import { IoSend } from 'react-icons/io5';
import { SlideDown } from 'react-slidedown';
import 'react-slidedown/lib/slidedown.css';
import { MdAdd } from 'react-icons/md';
import { MdArrowDownward } from 'react-icons/md';
import { MdArrowUpward } from 'react-icons/md';
import { Tooltip } from 'react-tooltip'
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  // Check Auth Status

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('rmt_token');
      if (!token) {
        router.push('/login');
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
    checkAuth();
    fetchCurrentUserData();
  }, []);

  const [currentUserData, setCurrentUserData] = useState([]);
  const [currentUserError, setCurrentUserError] = useState(null);
  const [currentUserLoading, setCurrentUserLoading] = useState(true);

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]); // Stores data to display
  const [searchTerm, setSearchTerm] = useState('');

  const [isGenresOpen, setIsGenresOpen] = useState(false);
  const [isInstrumentsOpen, setIsInstrumentsOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest");

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewStatus, setReviewStatus] = useState(false);


  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);


  const onReviewTextChange = (event) => {
    setReviewText(event.target.value);
  };
  const onReviewRatingChange = (newRating) => {
    setReviewRating(newRating);
  };

  const [openItemId, setOpenItemId] = useState(null);
  const toggleItem = (id) => {
    setOpenItemId((prev) => (prev === id ? null : id));
  };

  const genreList = [
    'Acoustic',
    'Bluegrass',
    'Blues',
    'Country',
    'Electronic',
    'Experimental',
    'Funk',
    'Hip Hop',
    'Jazz',
    'Latin',
    'Metal',
    'Other',
    'Pop',
    'Psychedelic',
    'R&B / Soul',
    'Reggae',
    'Rock',
    'World'
  ];
  const [selectedGenres, setSelectedGenres] = useState([]);

  const instrumentList = [
    'Accordion',
    'Banjo',
    'Bass',
    'Cello',
    'Drum Machine',
    'Drums',
    'Guitar',
    'Harp',
    'Horns/Wind',
    'Keyboard',
    'Orchid',
    'Organ',
    'Other',
    'Percussion',
    'Piano',
    'Sampler',
    'Synth',
    'Violin',
    'Vocal',
  ];
  const [selectedInstruments, setSelectedInstruments] = useState([]);



  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          'https://ratemytone.com/wp-json/wp/v2/music_list'
        );
        setData(response.data); // Axios data is in response.data
        setFilteredData(response.data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };
    fetchData();
  }, []); // The empty dependency array ensures this runs only once on mount



  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  useEffect(() => {
    const term = searchTerm.toLowerCase();

    const results = data
      .filter((item) => {
        // TEXT SEARCH
        const matchesText =
          !term ||
          item.title?.rendered?.toLowerCase().includes(term) ||
          item.plain_text_description?.toLowerCase().includes(term);

        // GENRE FILTER (multi-select)
        const matchesGenres =
          selectedGenres.length === 0 ||
          item.genres?.some((g) => selectedGenres.includes(g));

        // INSTRUMENT FILTER (multi-select)
        const matchesInstruments =
          selectedInstruments.length === 0 ||
          item.instruments?.some((i) => selectedInstruments.includes(i));

        return matchesText && matchesGenres && matchesInstruments;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);

        return sortOrder === 'newest'
          ? dateB - dateA // newest first
          : dateA - dateB; // oldest first
      });

    setFilteredData(results);
  }, [searchTerm, selectedGenres, selectedInstruments, sortOrder, data]);



  const handleGenreChange = (event) => {
    const { value, checked } = event.target;
    if (checked) {
      // If checked, add the value to the array
      setSelectedGenres([...selectedGenres, value]);
    } else {
      // If unchecked, remove the value from the array
      setSelectedGenres(selectedGenres.filter((item) => item !== value));
    }
  };
  const handleInstrumentChange = (event) => {
    const { value, checked } = event.target;
    if (checked) {
      // If checked, add the value to the array
      setSelectedInstruments([...selectedInstruments, value]);
    } else {
      // If unchecked, remove the value from the array
      setSelectedInstruments(
        selectedInstruments.filter((item) => item !== value)
      );
    }
  };

  const handleToneReviewSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('rmt_token');

    if (!token) {
      console.error('No JWT token found. User not authenticated.');
      return;
    }
    const form = event.target;
    const formData = new FormData(form);
    const reviewToneID = formData.get('reviewToneID');
    const reviewToneTitle = formData.get('reviewToneTitle');
    const reviewToneAuthor = formData.get('reviewToneAuthor');

    try {
      const response = await axios.post(
        'https://ratemytone.com/wp-json/wp/v2/tone-review',
        // Data payload
        {
          title: reviewToneTitle,
          content: reviewText,
          status: 'publish',
          acf: {
            tone_review_tone_id: reviewToneID,
            tone_review_stars: reviewRating,
            tone_review_text: reviewText,
            tone_review_reviewed_by: currentUserData.id,
            tone_review_reviewed_by_name: currentUserData.name,
            tone_review_tone_author_id: reviewToneAuthor,
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
      const triggerReviewStatus = () => {
        setReviewStatus(true);
      };
      triggerReviewStatus();
      console.log('Post created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating post:', error.response.data.message);
      throw new Error(error.response.data.message);
    }
  };




  if (loading || currentUserLoading)
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
  if (error || currentUserError)
    return (
      <div>
        <p>Error: {error.message}</p>
        <p>Error: {currentUserError.message}</p>
      </div>
    );

  return (
    <div id='page'>
      <Header />
      <div className='flex flex-1 flex-col items-center bg-[#141414] w-full h-full min-w-[100vw] min-h-[100vh]'>
        {/*Page Title*/}
        <div className='flex flex-row justify-center items-center w-full p-[20px] border-b-[3px] border-white mb-5'>
          <div className='max-w-[1300px] w-full px-6'>
            <h1 className='text-white text-[30px] font-bold leading-4 tracking-wider py-5'>
              TONE FEED
            </h1>
          </div>
        </div>
        {/*Page Content*/}
        <div className='flex min-h-[100vh] flex-row max-w-[1300px] w-full py-6 px-6 gap-6'>
          <div className='w-[20%]'>
            <h3 className='text-white text-[16px] font-bold tracking-[3px] uppercase mb-1 pl-2'>
              Search
            </h3>
            <div className='flex flex-col gap-3'>
              <div>
                <input
                  type='text'
                  placeholder='Enter a keyword...'
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className='rounded-full w-full'
                />
              </div>
              <div className='pt-2'>
                <h4 className='text-white text-[16px] font-bold tracking-[3px] uppercase mb-1 pl-2'>
                  Sort
                </h4>
                <div className='flex items-center justify-between gap-3 text-white'>
                  {sortOrder === 'newest' ? (
                    <button
                      className='flex items-center justify-center gap-2 bg-[#53A870] border-[3px] border-[#53A870] px-3 pb-[3px] pt-[5px] rounded-full flex-1'
                      onClick={() => setSortOrder('newest')}
                    >
                      <span className='text-white text-[15px]'>Newest</span>
                      <MdArrowDownward className='text-white text-[17px]' />
                    </button>
                  ) : (
                    <button
                      className='flex items-center justify-center gap-2 border-[3px] border-[#53A870] px-3 pb-[3px] pt-[5px] rounded-full flex-1'
                      onClick={() => setSortOrder('newest')}
                    >
                      <span className='text-white text-[15px]'>Newest</span>
                      <MdArrowDownward className='text-white text-[17px]' />
                    </button>
                  )}
                  {sortOrder === 'oldest' ? (
                    <button
                      className='flex items-center justify-center gap-2 bg-[#53A870] border-[3px] border-[#53A870] px-3 pb-[3px] pt-[5px] rounded-full flex-1'
                      onClick={() => setSortOrder('oldest')}
                    >
                      <span className='text-white text-[15px]'>Oldest</span>
                      <MdArrowUpward className='text-white text-[17px]' />
                    </button>
                  ) : (
                    <button
                      className='flex items-center justify-center gap-2 border-[3px] border-[#53A870] px-3 pb-[3px] pt-[5px] rounded-full flex-1'
                      onClick={() => setSortOrder('oldest')}
                    >
                      <span className='text-white text-[15px]'>Oldest</span>
                      <MdArrowUpward className='text-white text-[17px]' />
                    </button>
                  )}
                </div>
              </div>
              <div className='pt-2 pl-2'>
                <div className='flex items-center justify-between text-white mb-1'>
                  <h4 className='text-white text-[16px] font-bold tracking-[3px] uppercase'>
                    Genre
                  </h4>
                  <MdAdd
                    className='text-[22px]'
                    onClick={() => setIsGenresOpen(!isGenresOpen)}
                  />
                </div>
                <SlideDown className={'my-dropdown-slidedown'}>
                  {isGenresOpen ? (
                    <div className='genre-options'>
                      {genreList.map((option) => (
                        <label key={option} className='text-white block mb-2'>
                          <input
                            type='checkbox'
                            value={option}
                            checked={selectedGenres.includes(option)} // Check if the item is in the state array
                            onChange={handleGenreChange}
                            className='mr-2'
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  ) : null}
                </SlideDown>
              </div>
              <div className='pt-3 pl-2'>
                <div className='flex items-center justify-between text-white mb-1'>
                  <h4 className='text-white text-[16px] font-bold tracking-[3px] uppercase'>
                    Instruments
                  </h4>
                  <MdAdd
                    className='text-[22px]'
                    onClick={() => setIsInstrumentsOpen(!isInstrumentsOpen)}
                  />
                </div>
                {isInstrumentsOpen ? (
                  <div className='instrument-options'>
                    {instrumentList.map((option) => (
                      <label key={option} className='text-white block mb-2'>
                        <input
                          type='checkbox'
                          value={option}
                          checked={selectedInstruments.includes(option)} // Check if the item is in the state array
                          onChange={handleInstrumentChange}
                          className='mr-2'
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <div className='w-[80%]'>
            {filteredData.map((post) => (
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
                      <MdFavorite
                        data-tooltip-id='fav-tooltip'
                        data-tooltip-content='Favorite'
                      />
                      3
                      <Tooltip id='fav-tooltip' />
                    </div>
                    <div
                      className='flex flex-row gap-1 items-center justify-center text-[20px] text-white cursor-pointer'
                      onClick={() => toggleItem(post.id)}
                    >
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
                    />
                  </div>
                </div>

                {/*Music Card Leave Review*/}
                <SlideDown className={'my-dropdown-slidedown'}>
                  {openItemId === post.id && (
                    <div>
                      {reviewStatus ? (
                        <div className='flex items-center justify-center w-full'>
                          <p className='text-white'>
                            You Have Already Rated This Tone.
                          </p>
                        </div>
                      ) : (
                        <form onSubmit={handleToneReviewSubmit}>
                          <input
                            type='hidden'
                            value={post.id}
                            name='reviewToneID'
                          />
                          <input
                            type='hidden'
                            value={post.title.rendered}
                            name='reviewToneTitle'
                          />
                          <input
                            type='hidden'
                            value={post.author}
                            name='reviewToneAuthor'
                          />
                          <div className='w-full flex flex-row gap-4 justify-between items-center px-3 py-2 bg-[#3a3a3a] rounded-full'>
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
                                onChange={onReviewTextChange}
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
                        </form>
                      )}
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
