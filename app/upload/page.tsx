"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MultiSelect } from "primereact/multiselect";
import {IoIosSkipBackward} from "react-icons/io";
import {useRouter} from "next/navigation";
import {useAuth} from "@/context/AuthContext";
import {Audio} from "react-loader-spinner";
import SignalFlowBuilder from "@/components/SignalFlowBuilder";
import AudioWaveformPreview from "@/components/AudioWaveformPreview";

export default function ToneUpload() {
  const { user, loading: authLoading } = useAuth();
  const [genres, setGenres] = useState<any[]>([]);
  const [instruments, setInstruments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    shortDescription: "",
    longDescription: "",
    genres: [] as string[],
    instruments: [] as string[],
    signalFlow: [] as string[],
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // 🔥 placeholder signal flow options
  const signalFlowOptions = [
    { label: "Mic", value: "Mic" },
    { label: "Preamp", value: "Preamp" },
    { label: "EQ", value: "EQ" },
    { label: "Compressor", value: "Compressor" },
    { label: "Reverb", value: "Reverb" },
    { label: "Limiter", value: "Limiter" },
  ];

  // 🔥 FETCH GENRES + INSTRUMENTS
  useEffect(() => {
    const fetchData = async () => {
      const g = await getDocs(collection(db, "genres"));
      const i = await getDocs(collection(db, "instruments"));

      setGenres(g.docs.map((d) => ({ label: d.data().name, value: d.data().name })));
      setInstruments(i.docs.map((d) => ({ label: d.data().name, value: d.data().name })));
    };

    fetchData();
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔥 FILE UPLOAD
  const uploadFile = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("https://ratemytone.com/upload.php", {
      method: "POST",
      body: fd,
    });

    const data = await res.json();
    return data.url;
  };

  // 🔥 SUBMIT
  const handleSubmit = async () => {
    try {
      setLoading(true);

      let imageUrl = "";
      let musicUrl = "";

      if (imageFile) imageUrl = await uploadFile(imageFile);
      if (musicFile) musicUrl = await uploadFile(musicFile);

      const docRef = await addDoc(collection(db, "tones"), {
        title: form.title,
        shortDescription: form.shortDescription,
        longDescription: form.longDescription,
        genres: form.genres,
        instruments: form.instruments,
        signalFlow: form.signalFlow,
        image: imageUrl,
        music_url: musicUrl,
        createdAt: serverTimestamp(),
        createdBy: user?.uid,
      });

      const toneId = docRef.id;

      alert("Tone uploaded!");

      // 👉 redirect to tone page
      router.push(`/tone/${toneId}`);

    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };
  const goBack = () => {
    router.back();
  }

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#141414]">
        <Audio height={100} width={100} color="#42b27c" />
      </div>
    );
  }

  return (
    <div className="bg-[#141414] min-h-screen text-white">
      <div className='h-25 flex justify-between items-center  bg-[#141414] border-b-[3px] border-white'>
        <div className='mx-auto w-full max-w-341.5 p-4'>
          <h1 className='text-white text-3xl font-bold uppercase'>
            Upload
          </h1>
          <button
            className='text-[#42b27c] text-sm mt-1 cursor-pointer flex items-center gap-2'
            onClick={goBack}
          >
            <IoIosSkipBackward size={20}/>
            <span className="font-medium ">Go Back</span>
          </button>
        </div>
      </div>
      <div className="max-w-[1366px] mx-auto px-4 pb-6 pt-12 flex gap-6">
        <div className="p-5 w-full flex flex-col gap-6 rounded-3xl border border-white/20 bg-[#1a1a1a] text-white">

        <h2 className="text-2xl font-bold">Upload Tone</h2>

          {/* MUSIC */}
          <div className='w-full'>
            <p className="text-xs mb-2 uppercase tracking-widest text-gray-400">
              Audio File
            </p>
            <div className="flex items-center gap-2">
              <div className='w-1/3'>
                <input
                  type="file"
                  accept="audio/mp3"
                  className="bg-[#424242] p-3 rounded-md file:border file:border-[#42B27B] file:py-2 file:px-4 file:rounded-md file:mr-4 w-full"
                  onChange={(e) => setMusicFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className='w-2/3'>
                <AudioWaveformPreview file={musicFile} />
              </div>
            </div>
          </div>

          {/* TITLE */}
          <div className='w-full'>
            <p className="text-xs mb-2 uppercase tracking-widest text-gray-400">
              Title
            </p>
            <input
              name="title"
              placeholder="Title"
              className="bg-[#424242] p-3 rounded-md w-full"
              onChange={handleChange}
            />
          </div>

          {/* SHORT DESC */}
          <div className='w-full'>
            <p className="text-xs mb-2 uppercase tracking-widest text-gray-400">
              Short Description
            </p>
            <input
              name="shortDescription"
              placeholder="Short Description"
              className="bg-[#424242] p-3 rounded-md w-full"
              onChange={handleChange}
            />
          </div>


          {/* LONG DESC */}
          <div className='w-full'>
            <p className="text-xs mb-2 uppercase tracking-widest text-gray-400">
              Long Description
            </p>
            <textarea
              name="longDescription"
              placeholder="Long Description"
              className="bg-[#424242] p-3 rounded-md w-full"
              rows={4}
              onChange={handleChange}
            />
          </div>

          {/* GENRES */}
          <div className='w-full'>
            <p className="text-xs mb-2 uppercase tracking-widest text-gray-400">
              Genres
            </p>
            <MultiSelect
              value={form.genres}
              options={genres}
              onChange={(e) => {
                if (e.value.length <= 3) {
                  setForm({ ...form, genres: e.value });
                }
              }}

              display="chip"
              placeholder="Select up to 3 genres"
              className="bg-[#707070] border-none text-white focus:outline-none focus:ring-0 mb-2 w-full"
              pt={{
                root: {
                  style: { backgroundColor: "#424242", border: "none", borderRadius: "10px" },
                },
                label: {
                  style: { backgroundColor: "#424242", border: "none", borderRadius: "10px" },
                },
                labelContainer: {
                  style: { backgroundColor: "#424242", border: "none", borderRadius: "10px" },
                },
                trigger: {
                  style: { backgroundColor: "#000" },
                },
                token: {
                  style: { backgroundColor: "#53A870", border: "none", borderRadius: "10px", marginTop: 1, marginBottom: 1 },
                },
                tokenLabel: {
                  style: { color: "#FFF", fontSize: "14px" },
                },
                removeTokenIcon: {
                  style: { color: "#FFF" },
                }
              }}
            />
          </div>


          {/* INSTRUMENTS */}
          <div className='w-full'>
            <p className="text-xs mb-2 uppercase tracking-widest text-gray-400">
              Instruments
            </p>
            <MultiSelect
              value={form.instruments}
              options={instruments}
              onChange={(e) => {
                if (e.value.length <= 3) {
                  setForm({ ...form, instruments: e.value });
                }
              }}
              display="chip"
              maxSelectedLabels={3}
              placeholder="Select up to 3 instruments"
              className="bg-[#707070] border-none text-white focus:outline-none focus:ring-0 mb-2 w-full"
              pt={{
                root: {
                  style: { backgroundColor: "#424242", border: "none", borderRadius: "10px" },
                },
                label: {
                  style: { backgroundColor: "#424242", border: "none", borderRadius: "10px" },
                },
                labelContainer: {
                  style: { backgroundColor: "#424242", border: "none", borderRadius: "10px" },
                },
                trigger: {
                  style: { backgroundColor: "#000" },
                },
                token: {
                  style: { backgroundColor: "#53A870", border: "none", borderRadius: "10px", marginTop: 1, marginBottom: 1 },
                },
                tokenLabel: {
                  style: { color: "#FFF", fontSize: "14px" },
                },
                removeTokenIcon: {
                  style: { color: "#FFF" },
                }
              }}
            />
          </div>

          <div className='w-full h-0.5 my-4 bg-gray-600'></div>


          {/* SIGNAL FLOW */}
          <div className='w-full min-h-64'>
            <SignalFlowBuilder
              value={form.signalFlow}
              onChange={(val) =>
                setForm({ ...form, signalFlow: val })
              }
            />
          </div>

          <div className='w-full h-0.5 my-4 bg-gray-600'></div>
          {/* IMAGE */}
          <div className='w-full'>

            <div className="flex items-start gap-4">
              <div className='w-1/2'>
                <p className="text-xs mb-2 uppercase tracking-widest text-gray-400">
                  Image
                </p>
                <input
                  type="file"
                  accept="image/*"
                  className="bg-[#424242] p-3 rounded-md file:border file:border-[#42B27B] file:py-2 file:px-4 file:rounded-md file:mr-4 w-full"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setImageFile(file);

                    if (file) {
                      const previewUrl = URL.createObjectURL(file);
                      setImagePreview(previewUrl);
                    }
                  }}
                />
              </div>
              <div className='w-1/2'>
                <p className="text-xs mb-2 uppercase tracking-widest text-gray-400">
                  Image Preview
                </p>
                {imagePreview && (
                  <div className="mt-0">


                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full max-h-80 object-cover rounded-md border border-white/10"
                    />
                  </div>
                )}
              </div>
            </div>

          </div>




          {/* SUBMIT */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#42B27B] px-4 py-2 rounded-md max-w-[200px] mx-auto cursor-pointer mt-6"
          >
            {loading ? "Uploading..." : "Upload Tone"}
          </button>
        </div>
      </div>
    </div>
  );
}