'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import React, { useState, useRef, useEffect } from 'react';
import RequireAuth from '@/components/RequireAuth';
import { FileUpload } from 'primereact/fileupload';
import { ProgressBar } from 'primereact/progressbar';
import axios from 'axios';
import { AudioPlayer } from "react-audio-play";
import { MultiSelect } from 'primereact/multiselect';

export default function Upload() {
  const { user_id, token } = useAuth();
  const router = useRouter();
  const [hideUploader, setHideUploader] = useState(false);
  const fileUploadRef = useRef(null);

  const [uploadReturn, setUploadReturn] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedInstruments, setSelectedInstruments] = useState([]);
  const [audioURL, setAudioURL] = useState('');
  const [imageURL, setImageURL] = useState('');
  const [imageAttachmentId, setImageAttachmentId] = useState(null);
  const [genreList, setGenreList] = useState([]);
  const [instrumentList, setInstrumentList] = useState([]);

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

  useEffect(() => {
    const fetchInstruments = async () => {
      try {
        const res = await axios.get(
          'https://ratemytone.com/wp-json/wp/v2/music_list_instrument'
        );

        // 🔥 Transform API response
        const formatted = res.data.map((term) => ({
          label: term.name, // what shows in UI
          value: term.id, // what gets stored
        }));

        setInstrumentList(formatted);
      } catch (err) {
        console.error('Error fetching instruments:', err);
      }
    };

    fetchInstruments();
  }, []);



  const uploadWithAxios = async ({ files }) => {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append('files[]', file);
    });

    formData.append('user_id', user_id);

    try {
      const res = await axios.post(
        'https://ratemytone.com/rmt_api_upload_tone.php',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
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
      setImageURL('');


      //fileUploadRef.current.clear();
      setUploadProgress(0);
      console.log(res.data.files[0].url);
      setAudioURL(res.data.files[0].url);
    } catch (err) {
      console.error(err);

    }
  };

  const uploadImageWithAxios = async ({ files }) => {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append('files[]', file);
    });

    formData.append('user_id', user_id);

    try {
      const res = await axios.post(
        'https://ratemytone.com/rmt_api_upload_image.php',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      console.log(res.data.files[0].url);
      setImageURL(res.data.files[0].url);
      setImageAttachmentId(res.data.files[0].attachment_id);

    } catch (err) {

    }
  };

  const emptyTemplate = () => (
    <div className='flex flex-col items-center justify-center py-10 text-white'>
      <div className='w-24 h-24 flex items-center justify-center rounded-full border-2 border-dashed border-[#53A870] mb-4'>
        <i className='pi pi-image text-3xl text-[#53A870]' />
      </div>
      <p className='text-lg'>Drag & drop files here</p>
      <p className='text-sm text-gray-500'>or click to browse</p>
    </div>
  );

  const chooseOptions = {
    className: 'bg-transparent text-[#53A870] rounded-full px-4 py-2 ',
  };

  const uploadOptions = {
    className: 'text-gray-400 px-4 py-2 hover:opacity-90',
  };

  const cancelOptions = {
    className: 'text-gray-400 px-4 py-2 hover:opacity-90',
  };

  const [toneNotesFormLoading, setToneNotesFormLoading] = useState(false);
  const [toneNotesForm, setToneNotesForm] = useState({
    toneTitle: '',
    toneGenres: [],
    toneInstruments: [],
    toneSignalFlow: [],
    toneShortDesc: '',
    toneDescription: '',
    toneMakePublic: false,
    toneAllowDownload: false,
    toneAudioURL: '',
    toneImageURL: '',
    imageAttachmentId: imageAttachmentId,
    user_id: user_id,
  });

  const handleToneNotesFormChange = (e) => {
    setToneNotesForm({
      ...toneNotesForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleUploadToneNotes = async (e) => {
    e.preventDefault();

    if (toneNotesFormLoading) return; // prevent double submit

    // ✅ Validate required data
    if (!user_id) {

      return;
    }

    if (!audioURL || !imageURL) {

      return;
    }

    if (!toneNotesForm.toneTitle?.trim()) {

      return;
    }

    setToneNotesFormLoading(true);

    try {
      // ✅ Build payload fresh (no stale state)
      const payload = {
        toneTitle: toneNotesForm.toneTitle,
        toneDescription: toneNotesForm.toneDescription,
        short_desc: toneNotesForm.toneShortDesc, // ✅ matches PHP
        toneGenres: toneNotesForm.toneGenres,
        toneInstruments: toneNotesForm.toneInstruments,
        toneSignalFlow: toneNotesForm.toneSignalFlow,
        toneMakePublic: toneNotesForm.toneMakePublic,
        toneAllowDownload: toneNotesForm.toneAllowDownload,

        toneAudioURL: audioURL,
        toneImageURL: imageURL,

        imageAttachmentId: imageAttachmentId, // ✅ latest state
        user_id: user_id, // ✅ latest auth value
      };

      // ✅ Debug (remove in production)
      console.log('Submitting tone:', payload);

      const res = await axios.post(
        'https://ratemytone.com/rmt_api_create_tone.php',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Response:', res.data);

      // ✅ Proper response handling
      if (res.data?.success) {


        // setAudioURL('');
        // setImageURL('');
        // setImageAttachmentId(null);

        // ✅ Optional: redirect
        router.push('/tonefeed');
      } else {
        throw new Error(res.data?.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);


    } finally {
      setToneNotesFormLoading(false);
    }
  };


  return (
    <RequireAuth>
      <>
        <div id='page'>
          <Header />

          <div className='flex flex-col items-center bg-[#141414] w-full min-h-screen'>
            {/*Page Title*/}
            <div className='flex flex-row justify-center items-center w-full p-[20px] border-b-[3px] border-white mb-5'>
              <div className='max-w-[1300px] w-full px-6'>
                <h1 className='text-white text-[30px] font-bold leading-4 tracking-wider py-5'>
                  UPLOAD
                </h1>
              </div>
            </div>

            <div className='pt-10 w-full max-w-[1300px] px-6'>
              {!hideUploader && (
                <>
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
                    auto
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
                <div className='flex gap-4'>
                  <div className='w-[50%] p-6'>
                    {uploadReturn.map((file, index) => (
                      <div key={index}>
                        <p className='text-white px-3 py-2'>{file.name}</p>
                        <div
                          key={index}
                          className='rounded-full overflow-hidden'
                        >
                          <AudioPlayer
                            backgroundColor='#272727'
                            width='100%'
                            sliderColor='#53A870'
                            src={file.url}
                          />
                        </div>
                      </div>
                    ))}

                    {!imageURL && (
                      <div className='mt-4'>
                        <h3 className='text-white'>Tone Image</h3>
                        <FileUpload
                          customUpload
                          auto
                          uploadHandler={uploadImageWithAxios}
                          accept='image/*'
                          chooseOptions={chooseOptions}
                          emptyTemplate={emptyTemplate}
                          pt={{
                            root: {
                              className:
                                'bg-[#141414] border-4 border-dashed border-[#53A870] rounded-2xl p-6',
                            },
                            header: {
                              className:
                                'bg-transparent border-none text-white',
                            },
                            content: {
                              className:
                                'bg-[#141414] rounded-lg p-4 text-white',
                            },
                            buttonbar: {
                              className: 'flex gap-2 bg-[#141414]',
                            },
                          }}
                        />
                      </div>
                    )}

                    {imageURL && <img src={imageURL} className='rounded-xl' />}
                  </div>

                  <div className='w-[50%] flex flex-col gap-4 p-6'>
                    <h3 className='text-white'>Tone Notes</h3>
                    <form
                      className='mt-4 flex flex-col gap-5'
                      onSubmit={handleUploadToneNotes}
                    >
                      <div className='w-full'>
                        <label
                          className='text-white p-1 mb-1 block'
                          htmlFor='username'
                        >
                          Title
                        </label>
                        <input
                          name='toneTitle'
                          onChange={handleToneNotesFormChange}
                          className='w-full border p-2 rounded-xl min-h-[50px]'
                        />
                      </div>

                      <div className='w-full'>
                        <label
                          className='text-white p-1 mb-1 block'
                          htmlFor='age'
                        >
                          Genre(s)
                        </label>
                        <MultiSelect
                          value={toneNotesForm.toneGenres}
                          onChange={(e) =>
                            setToneNotesForm({
                              ...toneNotesForm,
                              toneGenres: e.value,
                            })
                          }
                          options={genreList}
                          placeholder='Please select up to 3 genres...'
                          display='chip'
                          maxSelectedLabels={3}
                          className='w-full md:w-20rem rounded-xl min-h-[50px]'
                        />
                      </div>

                      <div className='w-full'>
                        <label
                          className='text-white p-1 mb-1 block'
                          htmlFor='age'
                        >
                          Instrument(s)
                        </label>
                        <MultiSelect
                          value={toneNotesForm.toneInstruments}
                          onChange={(e) =>
                            setToneNotesForm({
                              ...toneNotesForm,
                              toneInstruments: e.value,
                            })
                          }
                          options={instrumentList}
                          placeholder='Please select up to 3 instruments...'
                          display='chip'
                          maxSelectedLabels={3}
                          className='w-full md:w-20rem rounded-xl min-h-[50px]'
                        />
                      </div>

                      <div className='w-full'>
                        <label
                          className='text-white p-1 mb-1 block'
                          htmlFor='age'
                        >
                          Signal Flow
                        </label>
                        <input
                          type='text'
                          name='toneSignalFlow'
                          value={toneNotesForm?.toneSignalFlow}
                          onChange={handleToneNotesFormChange}
                          className='w-full border p-2 rounded-xl min-h-[50px]'
                        />
                      </div>

                      <div className='w-full'>
                        <label
                          className='text-white p-1 mb-1 block'
                          htmlFor='username'
                        >
                          Short Description
                        </label>
                        <input
                          type='text'
                          name='toneShortDesc'
                          value={toneNotesForm?.toneShortDesc}
                          onChange={handleToneNotesFormChange}
                          className='w-full border p-2 rounded-xl min-h-[50px]'
                        />
                      </div>
                      <div className='w-full'>
                        <label
                          className='text-white p-1 mb-1 block'
                          htmlFor='age'
                        >
                          Full Description
                        </label>
                        <input
                          type='text'
                          name='toneDescription'
                          value={toneNotesForm?.toneDescription}
                          onChange={handleToneNotesFormChange}
                          className='w-full border p-2 rounded-xl min-h-[50px]'
                        />
                      </div>

                      <div className='flex items-center gap-3'>
                        <input
                          type='checkbox'
                          checked={toneNotesForm.toneMakePublic}
                          onChange={(e) =>
                            setToneNotesForm({
                              ...toneNotesForm,
                              toneMakePublic: e.target.checked,
                            })
                          }
                        />
                        <label className='text-white'>Make Public</label>
                      </div>

                      <div className='flex items-center gap-3'>
                        <input
                          type='checkbox'
                          checked={toneNotesForm.toneAllowDownload}
                          onChange={(e) =>
                            setToneNotesForm({
                              ...toneNotesForm,
                              toneAllowDownload: e.target.checked,
                            })
                          }
                        />
                        <label className='text-white'>Allow Download</label>
                      </div>

                      <div className='flex justify-end gap-[20px]'>
                        <button
                          type='submit'
                          disabled={toneNotesFormLoading}
                          className={`px-4 py-[5px] mt-2 text-white rounded-full ${
                            toneNotesFormLoading
                              ? 'bg-gray-500'
                              : 'bg-[#53A870]'
                          }`}
                        >
                          {toneNotesFormLoading ? 'Submitting...' : 'Submit'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </>
    </RequireAuth>
  );
}