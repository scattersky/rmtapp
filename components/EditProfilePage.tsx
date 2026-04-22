"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@/lib/firebase";

import { MultiSelect } from "primereact/multiselect";
import {PiSoundcloudLogoFill, PiSpotifyLogoFill, PiYoutubeLogoFill} from "react-icons/pi";
import {AiFillInstagram} from "react-icons/ai";

// ✅ TYPE
type FormData = {
  firstName: string;
  lastName: string;
  username: string;
  city: string;
  state: string;
  country: string;
  favoriteGenres: string[];
  bio: string;
  youtube: string;
  instagram: string;
  soundcloud: string;
  spotify: string;
};

export default function EditProfilePage() {
  const router = useRouter();

  const [genres, setGenres] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [originalData, setOriginalData] = useState<FormData | null>(null);

  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    username: "",
    city: "",
    state: "",
    country: "",
    favoriteGenres: [],
    bio: "",
    youtube: "",
    instagram: "",
    soundcloud: "",
    spotify: "",
  });

  // 🔥 FETCH GENRES
  useEffect(() => {
    const fetchGenres = async () => {
      const snapshot = await getDocs(collection(db, "genres"));
      const list = snapshot.docs.map((doc) => ({
        label: doc.data().name,
        value: doc.data().name,
      }));
      setGenres(list);
    };

    fetchGenres();
  }, []);

  // 🔥 FETCH USER DATA
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();

        const hydrated: FormData = {
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          username: data.username || "",
          city: data.city || "",
          state: data.state || "",
          country: data.country || "",
          favoriteGenres: data.favoriteGenres || [],
          bio: data.bio || "",
          youtube: data.youtube || "",
          instagram: data.instagram || "",
          soundcloud: data.soundcloud || "",
          spotify: data.spotify || "",
        };

        setForm(hydrated);
        setOriginalData(hydrated);
      }
    });

    return () => unsub();
  }, [router]);

  // 🔧 HANDLE INPUT CHANGE
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ VALIDATION
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.firstName) newErrors.firstName = "Required";
    if (!form.lastName) newErrors.lastName = "Required";
    if (!form.username) newErrors.username = "Required";
    if (!form.city) newErrors.city = "Required";
    if (!form.state) newErrors.state = "Required";
    if (!form.country) newErrors.country = "Required";

    if (form.favoriteGenres.length === 0)
      newErrors.favoriteGenres = "Pick at least 1 genre";

    if (!form.bio) newErrors.bio = "Bio required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🔥 UPDATE ONLY CHANGED FIELDS (FIXED)
  const handleUpdate = async () => {
    if (!validate()) return;

    const user = auth.currentUser;
    if (!user || !originalData) return;

    const updates: Partial<FormData> = {};

    for (const key in form) {
      const typedKey = key as keyof FormData;

      const currentValue = form[typedKey];
      const originalValue = originalData[typedKey];

      if (JSON.stringify(currentValue) !== JSON.stringify(originalValue)) {
        (updates as Record<keyof FormData, FormData[keyof FormData]>)[typedKey] = currentValue;
      }
    }

    if (Object.keys(updates).length === 0) {
      alert("No changes made");
      return;
    }

    try {
      await updateDoc(doc(db, "users", user.uid), updates);
      alert("Profile updated!");
      setOriginalData(form);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const isChanged = (key: keyof FormData) => {
    if (!originalData) return false;

    return JSON.stringify(form[key]) !== JSON.stringify(originalData[key]);
  };

  return (
    <>


      <div className="w-full mx-auto">

        {/* BASIC INFO */}
        <div className="p-0 mb-12 flex flex-col w-full gap-6">
          <h2 className="text-white text-2xl font-bold">Basic Info</h2>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 w-full">
              <div className="w-full">
                <p className="text-xs mb-1 uppercase tracking-widest text-gray-400">
                  First Name
                </p>
                <input
                  name="firstName"
                  value={form.firstName}
                  placeholder="First Name"
                  className={`bg-[#424242] p-3 text-white placeholder:text-white rounded-md w-full mb-2 ${
                    isChanged("firstName") ? "ring-2 ring-[#53A870]" : ""
                  }`}
                  onChange={handleChange}
                />
                {errors.firstName && <span className="error">{errors.firstName}</span>}
              </div>

              <div className="w-full">
                <p className="text-xs mb-1 uppercase tracking-widest text-gray-400">
                  Last Name
                </p>
                <input
                  name="lastName"
                  value={form.lastName}
                  placeholder="Last Name"
                  className={`bg-[#424242] p-3 text-white placeholder:text-white rounded-md w-full mb-2 ${
                    isChanged("lastName") ? "ring-2 ring-[#53A870]" : ""
                  }`}
                  onChange={handleChange}
                />
                {errors.lastName && <span className="error">{errors.lastName}</span>}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full">
              <div className="w-full">
                <p className="text-xs mb-1 uppercase tracking-widest text-gray-400">
                  Display Name
                </p>
                <input
                  name="username"
                  value={form.username}
                  placeholder="Username (Display Name)"
                  className={`bg-[#424242] p-3 text-white placeholder:text-white rounded-md w-full mb-2 ${
                    isChanged("username") ? "ring-2 ring-[#53A870]" : ""
                  }`}
                  onChange={handleChange}
                />
                {errors.username && <span className="error">{errors.username}</span>}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full">
              <div className="w-full">
                <p className="text-xs mb-1 uppercase tracking-widest text-gray-400">
                  City
                </p>
                <input
                  name="city"
                  value={form.city}
                  placeholder="City"
                  className={`bg-[#424242] p-3 text-white placeholder:text-white rounded-md w-full mb-2 ${
                    isChanged("city") ? "ring-2 ring-[#53A870]" : ""
                  }`}
                  onChange={handleChange}
                />
                {errors.city && <span className="error">{errors.city}</span>}
              </div>

              <div className="w-full">
                <p className="text-xs mb-1 uppercase tracking-widest text-gray-400">
                  State/Province
                </p>
                <input
                  name="state"
                  value={form.state}
                  placeholder="State / Province"
                  className={`bg-[#424242] p-3 text-white placeholder:text-white rounded-md w-full mb-2 ${
                    isChanged("state") ? "ring-2 ring-[#53A870]" : ""
                  }`}
                  onChange={handleChange}
                />
                {errors.state && <span className="error">{errors.state}</span>}
              </div>

              <div className="w-full">
                <p className="text-xs mb-1 uppercase tracking-widest text-gray-400">
                  Country
                </p>
                <input
                  name="country"
                  value={form.country}
                  placeholder="Country"
                  className={`bg-[#424242] p-3 text-white placeholder:text-white rounded-md w-full mb-2 ${
                    isChanged("country") ? "ring-2 ring-[#53A870]" : ""
                  }`}
                  onChange={handleChange}
                />
                {errors.country && <span className="error">{errors.country}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* ABOUT */}
        <div className="p-0 mb-12 flex flex-col min-w-100 gap-6">
          <h2 className="text-white text-2xl font-bold">About You</h2>

          <div className="flex flex-col gap-3">
            <div className="w-full">
              <p className="text-xs mb-1 uppercase tracking-widest text-gray-400">
                Favorite Genres
              </p>
              <MultiSelect
                value={form.favoriteGenres}
                options={genres}
                onChange={(e) => {
                  if (e.value.length <= 3) {
                    setForm({ ...form, favoriteGenres: e.value });
                  }
                }}
                display="chip"
                placeholder="Select up to 3 genres"
                className="bg-[#424242] p-3 text-white placeholder:text-white rounded-md w-full mb-2 "
                pt={{
                  root: { style: { backgroundColor: "#424242", border: "none", borderRadius: "10px" } },
                  label: { style: { backgroundColor: "#424242", border: "none", borderRadius: "10px" } },
                  labelContainer: { style: { backgroundColor: "#424242", border: "none", borderRadius: "10px" } },
                  trigger: { style: { backgroundColor: "#000" } },
                  token: { style: { backgroundColor: "#53A870", border: "none", borderRadius: "10px", marginTop: 1, marginBottom: 1 } },
                  tokenLabel: { style: { color: "#FFF", fontSize: "14px" } },
                  removeTokenIcon: { style: { color: "#FFF" } }
                }}
              />
              {errors.favoriteGenres && <span className="error">{errors.favoriteGenres}</span>}
            </div>

            <div className="w-full">
              <p className="text-xs mb-1 uppercase tracking-widest text-gray-400">
                Short Bio
              </p>
              <textarea
                name="bio"
                value={form.bio}
                placeholder="Short bio..."
                rows={6}
                className={`bg-[#424242] p-3 text-white placeholder:text-white rounded-md w-full mb-2 ${
                  isChanged("bio") ? "ring-2 ring-[#53A870]" : ""
                }`}
                onChange={handleChange}
              />
              {errors.bio && <span className="error">{errors.bio}</span>}
            </div>
          </div>
        </div>

        {/* SOCIALS */}
        <div className="p-0 mb-6 flex flex-col  gap-6 ">
          <div>
            <h2 className="text-white text-2xl font-bold mb-1">Socials</h2>
            <p className="text-xs text-gray-400">
              ⚠️ Enter FULL URLs (not just usernames)
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 w-full">
              <div className="w-full">
                <p className="text-xs mb-2 uppercase tracking-widest text-gray-400 flex items-center gap-1">
                  <PiYoutubeLogoFill size={18}/>
                  <span>YouTube</span>
                </p>
                <input
                  name="youtube"
                  value={form.youtube}
                  placeholder="YouTube URL"
                  className={`bg-[#424242] p-3 text-white placeholder:text-white rounded-md w-full mb-2 ${
                    isChanged("youtube") ? "ring-2 ring-[#53A870]" : ""
                  }`}
                  onChange={handleChange}
                />
              </div>

              <div className="w-full">
                <p className="text-xs mb-2 uppercase tracking-widest text-gray-400 flex items-center gap-1">
                  <AiFillInstagram size={18}/>
                  <span>Instagram</span>
                </p>
                <input
                  name="instagram"
                  value={form.instagram}
                  placeholder="Instagram URL"
                  className={`bg-[#424242] p-3 text-white placeholder:text-white rounded-md w-full mb-2 ${
                    isChanged("instagram") ? "ring-2 ring-[#53A870]" : ""
                  }`}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 w-full">
              <div className="w-full">
                <p className="text-xs mb-2 uppercase tracking-widest text-gray-400 flex items-center gap-1">
                  <PiSoundcloudLogoFill size={18}/>
                  <span>SoundCloud</span>
                </p>
                <input
                  name="soundcloud"
                  value={form.soundcloud}
                  placeholder="SoundCloud URL"
                  className={`bg-[#424242] p-3 text-white placeholder:text-white rounded-md w-full mb-2 ${
                    isChanged("soundcloud") ? "ring-2 ring-[#53A870]" : ""
                  }`}
                  onChange={handleChange}
                />
              </div>

              <div className="w-full">
                <p className="text-xs mb-2 uppercase tracking-widest text-gray-400 flex items-center gap-1">
                  <PiSpotifyLogoFill size={18}/>
                  <span>Spotify</span>
                </p>
                <input
                  name="spotify"
                  value={form.spotify}
                  placeholder="Spotify URL"
                  className={`bg-[#424242] p-3 text-white placeholder:text-white rounded-md w-full mb-2 ${
                    isChanged("spotify") ? "ring-2 ring-[#53A870]" : ""
                  }`}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* BUTTON */}
        <button
          className="w-1/2 block px-4 py-2 mx-auto mt-10 bg-[#53A870] text-white rounded-md"
          onClick={handleUpdate}
        >
          Save Changes
        </button>
      </div>
    </>
  );
}