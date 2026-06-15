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

type SelectOption = {
  label: string;
  value: string;
};

type UploadFormErrors = Partial<
  Record<
    | "musicFile"
    | "title"
    | "shortDescription"
    | "longDescription"
    | "genres"
    | "instruments"
    | "imageFile",
    string
  >
>;

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;

  return (
    <p id={id} className="mt-2 text-sm text-red-400">
      {message}
    </p>
  );
}

export default function ToneUpload() {
  const { user, loading: authLoading } = useAuth();
  const [genres, setGenres] = useState<SelectOption[]>([]);
  const [instruments, setInstruments] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<UploadFormErrors>({});
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

  const clearError = (field: keyof UploadFormErrors) => {
    setErrors((currentErrors) => {
      const remainingErrors = { ...currentErrors };
      delete remainingErrors[field];
      return remainingErrors;
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm({ ...form, [name]: value });

    if (value.trim()) {
      clearError(name as keyof UploadFormErrors);
    }
  };

  const validateForm = () => {
    const nextErrors: UploadFormErrors = {};

    if (!musicFile) nextErrors.musicFile = "Audio file is required.";
    if (!form.title.trim()) nextErrors.title = "Title is required.";
    if (!form.shortDescription.trim()) {
      nextErrors.shortDescription = "Short description is required.";
    }
    if (!form.longDescription.trim()) {
      nextErrors.longDescription = "Long description is required.";
    }
    if (form.genres.length === 0) {
      nextErrors.genres = "Select at least one genre.";
    }
    if (form.instruments.length === 0) {
      nextErrors.instruments = "Select at least one instrument.";
    }
    if (!imageFile) nextErrors.imageFile = "Image is required.";

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
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
    if (loading) return;

    if (!validateForm()) return;
    if (!musicFile || !imageFile) return;

    try {
      setLoading(true);

      const imageUrl = await uploadFile(imageFile);
      const musicUrl = await uploadFile(musicFile);

      const docRef = await addDoc(collection(db, "tones"), {
        title: form.title.trim(),
        shortDescription: form.shortDescription.trim(),
        longDescription: form.longDescription.trim(),
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

    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Upload failed");
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
            aria-label="Go back"
            className='text-[#42b27c] text-sm mt-1 cursor-pointer flex items-center gap-2'
            onClick={goBack}
          >
            <IoIosSkipBackward size={20}/>
          </button>
        </div>
      </div>
      <div className="max-w-[1366px] mx-auto px-4 pb-6 pt-12 flex gap-6">
        <div className="p-5 w-full flex flex-col gap-6 rounded-3xl border border-white/20 bg-[#1a1a1a] text-white">

        <h2 className="text-2xl font-bold">Upload Tone</h2>

          {Object.keys(errors).length > 0 && (
            <div
              role="alert"
              className="rounded-md border border-red-400/40 bg-red-950/30 px-4 py-3 text-sm text-red-200"
            >
              Please complete the required fields before uploading.
            </div>
          )}

          {/* MUSIC */}
          <div className='w-full'>
            <p className="text-xs mb-2 uppercase tracking-widest text-gray-400">
              Audio File
            </p>
            <div className="flex items-center gap-2">
              <div className='w-1/3'>
                <input
                  type="file"
                  accept="audio/*"
                  required
                  aria-invalid={Boolean(errors.musicFile)}
                  aria-describedby={errors.musicFile ? "upload-music-error" : undefined}
                  className="bg-[#424242] p-3 rounded-md file:border file:border-[#42B27B] file:py-2 file:px-4 file:rounded-md file:mr-4 w-full"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setMusicFile(file);
                    if (file) clearError("musicFile");
                  }}
                />
                <FieldError id="upload-music-error" message={errors.musicFile} />
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
              value={form.title}
              required
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? "upload-title-error" : undefined}
              className="bg-[#424242] p-3 rounded-md w-full"
              onChange={handleChange}
            />
            <FieldError id="upload-title-error" message={errors.title} />
          </div>

          {/* SHORT DESC */}
          <div className='w-full'>
            <p className="text-xs mb-2 uppercase tracking-widest text-gray-400">
              Short Description
            </p>
            <input
              name="shortDescription"
              placeholder="Short Description"
              value={form.shortDescription}
              required
              aria-invalid={Boolean(errors.shortDescription)}
              aria-describedby={
                errors.shortDescription ? "upload-short-description-error" : undefined
              }
              className="bg-[#424242] p-3 rounded-md w-full"
              onChange={handleChange}
            />
            <FieldError
              id="upload-short-description-error"
              message={errors.shortDescription}
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
              value={form.longDescription}
              required
              aria-invalid={Boolean(errors.longDescription)}
              aria-describedby={
                errors.longDescription ? "upload-long-description-error" : undefined
              }
              className="bg-[#424242] p-3 rounded-md w-full"
              rows={4}
              onChange={handleChange}
            />
            <FieldError
              id="upload-long-description-error"
              message={errors.longDescription}
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
                  if (e.value.length > 0) clearError("genres");
                }
              }}

              display="chip"
              placeholder="Select up to 3 genres"
              aria-describedby={errors.genres ? "upload-genres-error" : undefined}
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
            <FieldError id="upload-genres-error" message={errors.genres} />
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
                  if (e.value.length > 0) clearError("instruments");
                }
              }}
              display="chip"
              maxSelectedLabels={3}
              placeholder="Select up to 3 instruments"
              aria-describedby={
                errors.instruments ? "upload-instruments-error" : undefined
              }
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
            <FieldError id="upload-instruments-error" message={errors.instruments} />
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
                  required
                  aria-invalid={Boolean(errors.imageFile)}
                  aria-describedby={errors.imageFile ? "upload-image-error" : undefined}
                  className="bg-[#424242] p-3 rounded-md file:border file:border-[#42B27B] file:py-2 file:px-4 file:rounded-md file:mr-4 w-full"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setImageFile(file);

                    if (file) {
                      const previewUrl = URL.createObjectURL(file);
                      setImagePreview(previewUrl);
                      clearError("imageFile");
                    } else {
                      setImagePreview(null);
                    }
                  }}
                />
                <FieldError id="upload-image-error" message={errors.imageFile} />
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
            className="bg-[#42B27B] px-4 py-2 rounded-md max-w-[200px] mx-auto cursor-pointer mt-6 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Uploading..." : "Upload Tone"}
          </button>
        </div>
      </div>
    </div>
  );
}
