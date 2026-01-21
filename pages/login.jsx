import React, { useEffect, useState } from 'react';
import axios from "axios";
const rmtLogo =
  'https://ratemytone.com/wp-content/uploads/2024/09/RMT-Logo-lg-1.png';


export default function Login() {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const checkAuth = () => {
    const token = localStorage.getItem('rmt_token');
    if (token) {
      window.location.replace('/');
    }
  };
  // Check Auth Status
  useEffect(() => {

    checkAuth();
  }, []);


  const onUsernameChange = (event) => {
    setUsername(event.target.value);
  };
  const onPasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleLogin = async () => {
    const url = 'https://ratemytone.com/wp-json/jwt-auth/v1/token'; // Replace with your API endpoint
    const data = {
      username: username,
      password: password,
    };

    const config = {
      headers: {
        'Content-Type': 'application/json'
      },
    };

    axios
      .post(url, data, config)
      .then((response) => {
        localStorage.setItem('rmt_token', response.data.token);
        localStorage.setItem('user_id', response.data.user_id);
        console.log('Response Status:', response.status);
        console.log('Response Data:', response.data);
        checkAuth();
      })
      .catch((error) => {
        console.error('Error making POST request:', error.message);
        if (error.response) {
          console.error('Error response data:', error.response.data);
          console.error('Error response status:', error.response.status);
        }
      });
  };

  return (
    <div
      id='loginPage'
      className='flex justify-center items-center w-[100vw] h-[100vh]'
    >
      <div
        id='loginPageLeft'
        className='w-full h-full bg-[#141414] flex justify-center items-center'
      >
        <div className='flex flex-col gap-6 items-center justify-center w-[100%] max-w-[300px]'>
          <img src={rmtLogo} className='w-full max-w-[140px]' />
          <div id='loginForm' className='w-[100%] m-w-[600px]'>
            <label htmlFor='username' className='text-white px-2 mb-2 block'>
              Username:
            </label>
            <input
              type='text'
              className='w-[100%] rounded-full text-white placeholder-white focus:border-[#53A870] mb-4 focus:border-[3px] bg-[#707070]'
              onChange={onUsernameChange} // 4. The onChange handler updates the state
              placeholder=''
            />
            <label htmlFor='username' className='text-white px-2 mb-2 block'>
              Password:
            </label>
            <input
              type='password'
              className='w-[100%] rounded-full text-white placeholder-white focus:border-[#53A870] mb-4 focus:border-[3px] bg-[#707070]'
              onChange={onPasswordChange} // 4. The onChange handler updates the state
              placeholder=''
            />
            <button
              className='block px-10 py-2 mt-4 min-w-[160px] mx-auto text-white text-[16px] rounded-full bg-[#53A870] font-normal'
              onClick={handleLogin}
            >
              Login
            </button>
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
