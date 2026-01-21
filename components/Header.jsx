import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function Header() {
  const rmtLogo =
    'https://ratemytone.com/wp-content/uploads/2024/09/RMT-Logo-lg-1.png';
  const userAvatar = 'https://ratemytone.com/wp-content/uploads/2024/04/172724-1.jpg';

  const [currentUser, setCurrentUser] = useState('');
  const [currentUserData, setCurrentUserData] = useState([]);
  const [currentUserError, setCurrentUserError] = useState(null);

  useEffect(() => {
    const fetchCurrentcurrentUserData = async () => {
      try {
        const currentUserID = localStorage.getItem('user_id');

        setCurrentUser(currentUserID);
        const response = await axios.get(
          'https://ratemytone.com/wp-json/wp/v2/users/' + currentUserID
        );
        setCurrentUserData(response.data); // Axios data is in response.data

      } catch (err) {
        setCurrentUserError(err);
        console.log(currentUserError);
      }
    };
    fetchCurrentcurrentUserData();
  }, []);

  return (
    <div
      id='site_header'
      className='h=full min-h-[100px] w-full bg-[#000] flex items-center justify-center'
    >
      <div className='flex w-full max-w-[1300px] items-center justify-between p-4'>
        <div className=''>
          <img src={rmtLogo} className='w-full max-w-[80px]' />
        </div>
        <div className='flex items-center justify-center gap-5'>
          <div className='flex items-center justify-center'>
            <a
              href='#'
              className='block text-white uppercase text-[16px] hover:text-[#3FE297] mr-5'
            >
              Home
            </a>
            <a
              href='/'
              className='block text-white uppercase text-[16px] hover:text-[#3FE297] mr-5'
            >
              Tone Feed
            </a>
            <a
              href='#'
              className='block text-white uppercase text-[16px] hover:text-[#3FE297] mr-5'
            >
              Blog
            </a>
            <a
              href='#'
              className='block text-white uppercase text-[16px] hover:text-[#3FE297] mr-5'
            >
              Contact
            </a>
            <a
              href='#'
              className='block text-white uppercase text-[16px] hover:text-[#3FE297]'
            >
              Upload
            </a>
          </div>
          <div className='flex items-center justify-center'>
            <img
              src={currentUserData.author_image_url}
              className='w-full max-w-[50px] rounded-full'
            />
          </div>
          <div className='flex items-center justify-center'>
            <Link
              href={{
                pathname: '/dashboard',
              }}
            >
              <div className='block px-5 py-2 text-white uppercase text-[16px] cursor-pointer rounded-full bg-[#53A870] font-normal'>
                Dashboard
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}