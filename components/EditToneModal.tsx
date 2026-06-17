"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  collection,
  doc, getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

import { MultiSelect } from "primereact/multiselect";
import SignalFlowBuilder from "@/components/SignalFlowBuilder";

type EditableTone = {
  id: string;
  title?: string;
  shortDescription?: string;
  longDescription?: string;
  genres?: string[];
  instruments?: string[];
  signalFlow?: string[];
  image?: string;
  music_url?: string;
  [key: string]: unknown;
};

type SelectOption = {
  label: string;
  value: string;
};

type MultiSelectValueChange = {
  value: string[];
};

type Props = {
  tone: EditableTone;
  onClose: () => void;
  onUpdated: () => void;
};

export default function EditToneModal({ tone, onClose, onUpdated }: Props) {
  const [form, setForm] = useState<EditableTone>(tone);
  const [original] = useState<EditableTone>(tone);

  const [genres, setGenres] = useState<SelectOption[]>([]);
  const [instruments, setInstruments] = useState<SelectOption[]>([]);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [musicFile, setMusicFile] = useState<File | null>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(tone.image ?? null);

  const fileRef = useRef<HTMLInputElement>(null);

  // 🔥 fetch dropdowns
  useEffect(() => {
    const fetchData = async () => {
      const g = await getDocs(collection(db, "genres"));
      const i = await getDocs(collection(db, "instruments"));

      setGenres(g.docs.map((d) => {
        const name = String(d.data().name || "");
        return { label: name, value: name };
      }));
      setInstruments(i.docs.map((d) => {
        const name = String(d.data().name || "");
        return { label: name, value: name };
      }));
    };

    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("https://ratemytone.com/upload.php", {
      method: "POST",
      body: fd,
    });

    const data = await res.json() as { url: string };
    return data.url;
  };

  const handleUpdate = async () => {
    const updates: Record<string, unknown> = {};

    for (const key in form) {
      if (JSON.stringify(form[key]) !== JSON.stringify(original[key])) {
        updates[key] = form[key];
      }
    }

    // 🔥 FILES
    if (imageFile) {
      updates.image = await uploadFile(imageFile);
    }

    if (musicFile) {
      updates.music_url = await uploadFile(musicFile);
    }

    if (Object.keys(updates).length === 0) {
      alert("No changes made");
      return;
    }

    await updateDoc(doc(db, "tones", tone.id), updates);

    alert("Tone updated!");

    // reset file UI
    setImageFile(null);
    setMusicFile(null);

    if (fileRef.current) fileRef.current.value = "";

    onUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] p-6 rounded-2xl w-full max-w-[1366px]  max-h-[90vh] overflow-y-auto gap-6 flex flex-col">

        <div className='w-full flex items-center justify-between'>
          <h2 className="text-xl font-bold mb-4">Edit Tone</h2>
          <button className='text-gray-400 hover:text-gray-200 text-xs cursor-pointer' onClick={onClose}>CLOSE</button>
        </div>




        {/* TITLE */}
        <div className='w-full'>
          <p className="text-xs mb-2 uppercase tracking-widest text-gray-400">
            Title
          </p>
          <input
            name="title"
            value={form.title || ""}
            className="bg-[#424242] p-3 rounded-md w-full"
            onChange={handleChange}
          />
        </div>


        {/* SHORT */}
        <div className='w-full'>
          <p className="text-xs mb-2 uppercase tracking-widest text-gray-400">
            Short Description
          </p>
          <input
            name="shortDescription"
            value={form.shortDescription || ""}
            className="bg-[#424242] p-3 rounded-md w-full"
            onChange={handleChange}
          />
        </div>


        {/* LONG */}
        <div className='w-full'>
          <p className="text-xs mb-2 uppercase tracking-widest text-gray-400">
            Long Description
          </p>
          <textarea
            name="longDescription"
            value={form.longDescription || ""}
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
            onChange={(e: MultiSelectValueChange) => {
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
            onChange={(e: MultiSelectValueChange) => {
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

        {/* SIGNAL FLOW */}
        <SignalFlowBuilder
          value={form.signalFlow ?? []}
          onChange={(val) => setForm({ ...form, signalFlow: val })}
        />

        {/* IMAGE */}
        <div className='w-full h-0.5 my-4 bg-gray-600'></div>
        {/* IMAGE */}
        <div className='w-full'>

          <div className="flex items-start gap-4">
            <div className='w-1/2'>
              <p className="text-xs mb-2 uppercase tracking-widest text-gray-400">
                Image
              </p>
              <input
                ref={fileRef}
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setImageFile(file);
                  if (file) setImagePreview(URL.createObjectURL(file));
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


        {/* ACTIONS */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleUpdate}
            className="bg-[#42B27B] px-4 py-2 rounded-md"
          >
            Save Changes
          </button>

          <button
            onClick={onClose}
            className="bg-gray-600 px-4 py-2 rounded-md"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
