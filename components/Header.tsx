'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import {useAuth} from "@/context/AuthContext";

export default function Header() {


  const rmtLogo =
    'https://ratemytone.com/wp-content/uploads/2024/09/RMT-Logo-lg-1.png';
  const profile_placeholder ='https://ratemytone.com/wp-content/uploads/2024/04/172724-1.jpg';

  return (
    <div
      id='site_header'
      className='h-full min-h-25 w-full bg-[#000] flex items-center justify-center'
    >
      <div className='flex w-full max-w-341.5 items-center justify-between p-4'>
        <div className=''>
          <img
            src={rmtLogo}
            className='w-full max-w-20'
            alt='Rate My Tone Logo'
          />
        </div>
        <div className='flex items-center justify-center gap-5'>
          <div className='hidden md:flex items-center justify-center'>
            <a
              href='#'
              className='block text-white uppercase text-[16px] hover:text-[#3FE297] mr-5'
            >
              Home
            </a>
            <Link
              href={{
                pathname: '/',
              }}
              className='cursor-pointer'
            >
              <span className=' block text-white uppercase text-[16px] hover:text-[#3FE297] mr-5 cursor-pointer'>
                Tone Feed
              </span>
            </Link>

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
              href='/upload'
              className='block text-white uppercase text-[16px] hover:text-[#3FE297]'
            >
              Upload
            </a>
          </div>
          <div className='flex items-center justify-center'>
            <img
              src={profile_placeholder}
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