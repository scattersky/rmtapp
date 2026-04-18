"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MultiSelect } from "primereact/multiselect";

export default function RegisterPage() {
    const { register } = useAuth();
    const router = useRouter();
    const [genres, setGenres] = useState<any[]>([]);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        username: "",
        age: "",
        city: "",
        state: "",
        country: "",
        favoriteGenres: [],
        bio: "",
        youtube: "",
        instagram: "",
        soundcloud: "",
        spotify: "",
        email: "",
        password: "",
    });

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

    const handleRegister = async () => {
        try {
            await register(form);
            router.push("/dashboard");
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <>
            <div className='h-25 flex justify-between items-center  bg-[#141414] border-b-[3px] border-white'>
                <div className='mx-auto w-full max-w-341.5 p-4'>
                    <h1 className='text-white text-3xl font-bold uppercase'>
                        Register
                    </h1>
                </div>
            </div>
        <div className="max-w-200 mx-auto mt-10 flex gap-6 w-full">
            <div className='flex flex-col gap-3 rounded-2xl shadow-[0_0_40px_-2px_rgba(255,255,255,0.3)] bg-black p-6 w-full'>
                <h2 className="text-xl font-bold text-white">Basic Info</h2>
                <input name="firstName" placeholder="First Name" className="border p-2 bg-white rounded-sm" onChange={handleChange} />
                <input name="lastName" placeholder="Last Name" className="border p-2 bg-white rounded-sm" onChange={handleChange} />
                <input name="username" placeholder="Username" className="border p-2 bg-white rounded-sm" onChange={handleChange} />
                <input name="age" placeholder="Age" className="border p-2 bg-white rounded-sm" onChange={handleChange} />

                <input name="city" placeholder="City" className="border p-2 bg-white rounded-sm" onChange={handleChange} />
                <input name="state" placeholder="State" className="border p-2 bg-white rounded-sm" onChange={handleChange} />
                <input name="country" placeholder="Country" className="border p-2 bg-white rounded-sm" onChange={handleChange} />

                <h2 className="text-xl font-bold text-white">About You</h2>
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
                    className="w-ful bg-white  rounded-sm"
                />
                <textarea name="bio" placeholder="Bio" className="border p-2 bg-white rounded-sm" onChange={handleChange} />

                <input name="youtube" placeholder="YouTube URL" className="border p-2 bg-white rounded-sm" onChange={handleChange} />
                <input name="instagram" placeholder="Instagram URL" className="border p-2 bg-white rounded-sm" onChange={handleChange} />
                <input name="soundcloud" placeholder="SoundCloud URL" className="border p-2 bg-white rounded-sm" onChange={handleChange} />
                <input name="spotify" placeholder="Spotify URL" className="border p-2 bg-white rounded-sm" onChange={handleChange} />

                <input name="email" placeholder="Email" className="border p-2 bg-white rounded-sm" onChange={handleChange} />
                <input name="password" type="password" placeholder="Password" className="border p-2 bg-white rounded-sm" onChange={handleChange} />
                <button
                    className="bg-green-600 text-white p-2"
                    onClick={handleRegister}
                >
                    Create Account
                </button>
            </div>
            <h1 className="text-xl font-bold">Register</h1>





        </div>
        </>
    );
}