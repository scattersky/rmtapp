import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

const rmtLogo =
  'https://ratemytone.com/wp-content/uploads/2024/09/RMT-Logo-lg-1.png';


export default function Index() {
  const { login, user_id, token } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user_id) {
      router.push('/tonefeed');
    }
    if (token) {
      router.push('/tonefeed');
    }
  }, [user_id, token, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const success = await login(username, password);

    if (success) {
      router.push('/tonefeed'); // redirect after login
    } else {
      setError('Invalid credentials');
    }
  };





  return (
    <div
      id='loginPage'
      className='flex justify-center items-center w-[100vw] h-[100vh]'
    >
      <div
        id='loginPageLeft'
        className='w-full h-full bg-[#141414] flex justify-center items-start pt-[25vh]'
      >
        <div className='flex flex-col gap-6 items-center justify-center w-[100%] max-w-[300px]'>
          <img
            src={rmtLogo}
            className='w-full max-w-[140px]'
            alt='Rate My Tone Logo'
          />
          <div id='loginForm' className='w-[100%] m-w-[600px]'>
            <form onSubmit={handleSubmit}>
              <label htmlFor='username' className='text-white px-2 mb-2 block'>
                Username:
              </label>
              <input
                className='w-[100%] rounded-full text-white placeholder-white focus:border-[#53A870] mb-4 focus:border-[3px] bg-[#707070]'
                type='text'
                placeholder='Username'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <label htmlFor='username' className='text-white px-2 mb-2 block'>
                Password:
              </label>
              <input
                className='w-[100%] rounded-full text-white placeholder-white focus:border-[#53A870] mb-4 focus:border-[3px] bg-[#707070]'
                type='password'
                placeholder='Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                className='block px-10 py-2 mt-4 min-w-[160px] mx-auto text-white text-[16px] rounded-full bg-[#53A870] font-normal'
                type="submit"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
      <div
        id='loginPageRight'
        className='w-full h-full bg-gradient-to-r from-[#6DD99A] to-[#57B8AE]'
      ></div>
    </div>
  );
}
