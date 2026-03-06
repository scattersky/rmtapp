import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Audio } from 'react-loader-spinner';

const RequireAuth = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/tonefeed');
    }
  }, [isAuthenticated, loading]);

  if (loading)return (
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

  if (!isAuthenticated) return null;

  return children;
};

export default RequireAuth;
