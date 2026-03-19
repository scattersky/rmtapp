'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import React, { useState, useRef } from 'react';
import RequireAuth from '@/components/RequireAuth';
import { toast, ToastContainer } from 'react-toastify';
import { FileUpload } from 'primereact/fileupload';
import { ProgressBar } from 'primereact/progressbar';
import axios from 'axios';
import {AudioPlayer} from "react-audio-play";

export default function Upload() {
  const { user_id, token } = useAuth();
  const router = useRouter();
  const [hideUploader, setHideUploader] = useState(false);
  const fileUploadRef = useRef(null);

  const [uploadReturn, setUploadReturn] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  // ✅ AXIOS UPLOAD HANDLER
  const uploadWithAxios = async ({ files }) => {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append('files[]', file);
    });

    // optional: send user_id
    formData.append('user_id', user_id);

    try {
      const res = await axios.post(
        'https://ratemytone.com/rmt_api_upload_tone.php',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            // Authorization: `Bearer ${token}`
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percent);
          },
        }
      );

      setUploadReturn(res.data.files || []);
      setHideUploader(true);
      toast.success('Files uploaded successfully');


      fileUploadRef.current.clear();
      setUploadProgress(0);
    } catch (err) {
      console.error(err);
      toast.error('Upload failed');
    }
  };


  const emptyTemplate = () => {
    return (
      <div className='flex flex-col items-center justify-center py-10 text-white'>
        <div className='w-24 h-24 flex items-center justify-center rounded-full border-2 border-dashed border-[#53A870] mb-4'>
          <i className='pi pi-image text-3xl text-[#53A870]' />
        </div>
        <p className='text-lg'>Drag & drop files here</p>
        <p className='text-sm text-gray-500'>or click to browse</p>
      </div>
    );
  };


  const chooseOptions = {
    className:
      'bg-transparent text-[#53A870] rounded-full px-4 py-2 ',
  };

  const uploadOptions = {
    className:
      'text-gray-400 px-4 py-2 hover:opacity-90',
  };

  const cancelOptions = {
    className: 'text-gray-400 px-4 py-2 hover:opacity-90',
  };

  return (
    <RequireAuth>
      <div id='page'>
        <Header />

        <div className='flex flex-col items-center bg-[#141414] w-full min-h-screen'>
          {/* HEADER */}
          <div className='w-full border-b-2 border-white mb-5'>
            <div className='max-w-[1300px] mx-auto px-6 py-5'>
              <h1 className='text-white text-3xl font-bold tracking-wider'>
                UPLOAD
              </h1>
            </div>
          </div>

          {/* CONTENT */}
          <div className='pt-10 w-full max-w-[1300px] px-6'>
            {/* UPLOADER */}
            {!hideUploader && (
              <>
                {/* PROGRESS BAR */}
                {uploadProgress > 0 && (
                  <div className='mb-4'>
                    <ProgressBar value={uploadProgress} />
                    <p className='text-white text-sm mt-2'>
                      Uploading: {uploadProgress}%
                    </p>
                  </div>
                )}
                <FileUpload
                  ref={fileUploadRef}
                  customUpload
                  uploadHandler={uploadWithAxios}
                  multiple
                  accept='audio/mpeg,audio/mp3'
                  chooseOptions={chooseOptions}
                  uploadOptions={uploadOptions}
                  cancelOptions={cancelOptions}
                  emptyTemplate={emptyTemplate}
                  pt={{
                    root: {
                      className:
                        'bg-[#141414] border-4 border-dashed border-[#53A870] rounded-2xl p-6',
                    },
                    header: {
                      className: 'bg-transparent border-none text-white',
                    },
                    content: {
                      className: 'bg-[#141414] rounded-lg p-4 text-white',
                    },
                    buttonbar: {
                      className: 'flex gap-2 bg-[#141414]',
                    },
                  }}
                />
              </>
            )}

            {uploadReturn.length > 0 && (
              <div className='flex justify-center items-start w-full gap-4'>
                <div className='w-[50%] flex flex-col gap-4 p-6'>
                  {uploadReturn.map((file, index) => (
                    <div key={index} className=''>
                      <p className='text-white px-3 py-2'>{file.name}</p>
                      <div className='rounded-full overflow-hidden'>
                        <AudioPlayer
                          src={file.url}
                          className='rounded-full'
                          backgroundColor='#272727'
                          width='100%'
                          sliderColor='#53A870'
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className='w-[50%] flex flex-col gap-4 p-6'>
                  <h3 className='text-white'>Tone Notes</h3>
                </div>
              </div>
            )}
          </div>
        </div>

        <ToastContainer />
      </div>
    </RequireAuth>
  );
}
