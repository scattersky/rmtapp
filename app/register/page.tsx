"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import { collection, getDocs, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "@/lib/firebase";

import { Stepper } from "primereact/stepper";
import { StepperPanel } from "primereact/stepperpanel";
import { MultiSelect } from "primereact/multiselect";
import { Button } from "primereact/button";
import {PiSoundcloudLogoFill, PiSpotifyLogoFill, PiYoutubeLogoFill} from "react-icons/pi";
import {AiFillInstagram} from "react-icons/ai";
import {IoIosSkipBackward} from "react-icons/io";

export default function RegisterPage() {
    const router = useRouter();
    const stepperRef = useRef<any>(null);

    const [genres, setGenres] = useState<any[]>([]);
    const [errors, setErrors] = useState<any>({});

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        password: "",

        city: "",
        state: "",
        country: "",
        favoriteGenres: [] as string[],
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

    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // ✅ VALIDATION PER STEP
    const validateStep1 = () => {
        const newErrors: any = {};

        if (!form.firstName) newErrors.firstName = "Required";
        if (!form.lastName) newErrors.lastName = "Required";
        if (!form.username) newErrors.username = "Required";
        if (!form.email) newErrors.email = "Required";
        if (!form.password || form.password.length < 6)
            newErrors.password = "Min 6 characters";

        if (!form.city) newErrors.city = "Required";
        if (!form.state) newErrors.state = "Required";
        if (!form.country) newErrors.country = "Required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors: any = {};

        if (form.favoriteGenres.length === 0)
            newErrors.favoriteGenres = "Pick at least 1 genre";

        if (!form.bio) newErrors.bio = "Bio required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const goBack = () => {
        router.back();
    }

    // 🔥 REGISTER
    const handleRegister = async () => {
        try {
            // CREATE AUTH USER
            const cred = await createUserWithEmailAndPassword(
              auth,
              form.email,
              form.password
            );

            const uid = cred.user.uid;

            // SAVE TO FIRESTORE
            await setDoc(doc(db, "users", uid), {
                uid,
                firstName: form.firstName,
                lastName: form.lastName,
                username: form.username,
                email: form.email,

                city: form.city,
                state: form.state,
                country: form.country,
                bio: form.bio,
                favoriteGenres: form.favoriteGenres,
                favorites: [],
                image:
                  "https://ratemytone.com/wp-content/uploads/2026/04/author_default_avatar.webp",
                youtube: form.youtube,
                instagram: form.instagram,
                soundcloud: form.soundcloud,
                spotify: form.spotify,
                createdAt: serverTimestamp(),
            });

            router.push("/dashboard");
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
      <>
          {/* HEADER */}
          <div className="h-25 flex items-center bg-[#141414] border-b-[3px] border-white">
              <div className="mx-auto w-full max-w-341.5 p-4">
                  <h1 className="text-white text-3xl font-bold uppercase">
                      Register
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
          <div className="max-w-[1366px] mx-auto mt-10 pb-20">

              <div className="p-5 mb-6 flex flex-col w-full min-w-200 gap-6 rounded-3xl border border-white/20 bg-[#1a1a1a]">
              <h2 className='text-white text-2xl font-bold'>Basic Info</h2>
              <div className="flex flex-col gap-3">

                  <div className="flex items-center gap-3 w-full">
                      <div className='w-full'>
                          <p className="text-xs mb-2 uppercase tracking-widest text-gray-400">
                              First Name
                          </p>
                          <input name="firstName" placeholder="First Name" className="bg-[#424242] p-3 text-white placeholder:text-white rounded-md w-full mb-2" onChange={handleChange} />
                          {errors.firstName && <span className="error">{errors.firstName}</span>}
                      </div>
                      <div className='w-full'>
                          <p className="text-xs mb-2 uppercase tracking-widest text-gray-400">
                              Last Name
                          </p>
                          <input name="lastName" placeholder="Last Name" className="bg-[#424242] p-3 text-white placeholder:text-white rounded-md w-full mb-2"  onChange={handleChange} />
                          {errors.lastName && <span className="error">{errors.lastName}</span>}
                      </div>
                  </div>

                  <div className="flex items-center gap-3 w-full">
                      <div className='w-full'>
                          <p className="text-xs mb-2 uppercase tracking-widest text-gray-400">
                              Display Name
                          </p>
                          <input name="username" placeholder="Username (Display Name)" className="bg-[#424242] p-3 text-white placeholder:text-white rounded-md w-full mb-2" onChange={handleChange} />
                          {errors.username && <span className="error">{errors.username}</span>}
                      </div>

                  </div>

                  <div className="flex items-center gap-3 w-full">
                      <div className='w-full'>
                          <p className="text-xs mb-2 uppercase tracking-widest text-gray-400">
                              Email
                          </p>
                          <input name="email" placeholder="Email" className="bg-[#424242] p-3 text-white placeholder:text-white rounded-md w-full mb-2" onChange={handleChange} />
                          {errors.email && <span className="error">{errors.email}</span>}
                      </div>
                      <div className='w-full'>
                          <p className="text-xs mb-2 uppercase tracking-widest text-gray-400">
                              Password
                          </p>
                          <input name="password" type="password" placeholder="Password" className="bg-[#424242] p-3 text-white placeholder:text-white rounded-md w-full mb-2"  onChange={handleChange} />
                          {errors.password && <span className="error">{errors.password}</span>}
                      </div>
                  </div>

                  <div className="flex items-center gap-3 w-full">
                      <div className='w-full'>
                          <p className="text-xs mb-2 uppercase tracking-widest text-gray-400">
                              City
                          </p>
                          <input name="city" placeholder="City"  className="bg-[#424242] p-3 text-white placeholder:text-white rounded-md w-full mb-2" onChange={handleChange} />
                          {errors.city && <span className="error">{errors.city}</span>}
                      </div>
                      <div className='w-full'>
                          <p className="text-xs mb-2 uppercase tracking-widest text-gray-400">
                              State/Province
                          </p>
                          <input name="state" placeholder="State / Province"  className="bg-[#424242] p-3 text-white placeholder:text-white rounded-md w-full mb-2"  onChange={handleChange} />
                          {errors.state && <span className="error">{errors.state}</span>}
                      </div>
                      <div className='w-full'>
                          <p className="text-xs mb-2 uppercase tracking-widest text-gray-400">
                              Country
                          </p>
                          <input name="country" placeholder="Country"  className="bg-[#424242] p-3 text-white placeholder:text-white rounded-md w-full mb-2" onChange={handleChange} />
                          {errors.country && <span className="error">{errors.country}</span>}
                      </div>
                  </div>


              </div>
          </div>
              <div className="p-5 mb-6 flex flex-col min-w-100 gap-6 rounded-3xl border border-white/20 bg-[#1a1a1a]">
              <h2 className='text-white text-2xl font-bold'>About You</h2>
              <div className="flex flex-col gap-3">
                  <div className="w-full">
                      <p className="text-xs mb-2 uppercase tracking-widest text-gray-400">
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
                      {errors.favoriteGenres && <span className="error">{errors.favoriteGenres}</span>}
                  </div>
                  <div className="w-full">
                      <p className="text-xs mb-2 uppercase tracking-widest text-gray-400">
                          Short Bio
                      </p>
                      <textarea
                        name="bio"
                        placeholder="Short bio..."
                        className="bg-[#424242] p-3 text-white placeholder:text-white rounded-md w-full mb-2"
                        onChange={handleChange}
                      />
                      {errors.bio && <span className="error">{errors.bio}</span>}
                  </div>

              </div>
          </div>
              <div className="p-5 mb-6 flex flex-col min-w-100 gap-6 rounded-3xl border border-white/20 bg-[#1a1a1a]">
                <div>
                    <h2 className='text-white text-2xl font-bold mb-1'>Socials</h2>
                    <p className="text-xs text-gray-400 ">
                        ⚠️ Enter FULL URLs (not just usernames)
                    </p>
                </div>

              <div className="flex flex-col gap-3">



                  <div className="flex items-center gap-3 w-full">
                      <div className='w-full'>
                          <p className="text-xs mb-2 uppercase tracking-widest text-gray-400 flex items-center gap-1">
                              <PiYoutubeLogoFill size={18}/>
                              <span>YouTube</span>
                          </p>
                          <input name="youtube" placeholder="YouTube URL"  className="bg-[#424242] p-3 text-white placeholder:text-white rounded-md w-full mb-2" onChange={handleChange} />
                      </div>
                      <div className='w-full'>
                          <p className="text-xs mb-2 uppercase tracking-widest text-gray-400 flex items-center gap-1">
                              <AiFillInstagram size={18}/>
                              <span>Instagram</span>
                          </p>
                          <input name="instagram" placeholder="Instagram URL"  className="bg-[#424242] p-3 text-white placeholder:text-white rounded-md w-full mb-2" onChange={handleChange} />
                      </div>
                  </div>

                  <div className="flex items-center gap-3 w-full">
                      <div className='w-full'>
                          <p className="text-xs mb-2 uppercase tracking-widest text-gray-400 flex items-center gap-1">
                              <PiSoundcloudLogoFill size={18}/>
                              <span>SoundCloud</span>
                          </p>
                          <input name="soundcloud" placeholder="SoundCloud URL"  className="bg-[#424242] p-3 text-white placeholder:text-white rounded-md w-full mb-2" onChange={handleChange} />
                      </div>
                      <div className='w-full'>
                          <p className="text-xs mb-2 uppercase tracking-widest text-gray-400 flex items-center gap-1">
                              <PiSpotifyLogoFill size={18}/>
                              <span>Spotify</span>
                          </p>
                          <input name="spotify" placeholder="Spotify URL"  className="bg-[#424242] p-3 text-white placeholder:text-white rounded-md w-full mb-2" onChange={handleChange} />
                      </div>
                  </div>




              </div>

          </div>
              <button
                className="w-1/2 block px-4 py-2 mx-auto mt-10 bg-[#53A870] text-white rounded-md"
                onClick={handleRegister}
              >
                  Submit
              </button>
          </div>
      </>
    );
}