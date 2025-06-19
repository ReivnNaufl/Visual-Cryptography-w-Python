import { useNavigate } from 'react-router-dom';
import {useState, useEffect} from "react"

import backgroundImage from "../assets/background_Star.png"

function SignPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingQR, setLoadingQR] = useState(false);
    const [username, setUsername] = useState("");
    const [phone, setPhone] = useState("");


    return (
        <div className="relative min-h-screen flex items-center justify-center px-4">
    {/* Background image + overlay */}
    <div className="absolute inset-0 bg-slate-950 bg-opacity-60"></div>
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        
        backgroundPosition: 'center',
      }}
    >
      
    </div>

    {/* Konten utama */}
    <div className="relative z-10 w-full max-w-sm text-white text-center space-y-6">
        {/* Logo bulat */}
        <div className="mx-auto w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center">
            <div className="text-2xl font-bold">🔰</div>
        </div>

        {/* Heading */}
        <div>
            <h1 className="text-2xl font-semibold">Sign in to your</h1>
            <h1 className="text-2xl font-bold">Account</h1>
            <p className="text-sm mt-2 text-gray-300">
                Alerady have an account?{" "}
                <a href="#" className="text-blue-400 hover:underline">
                    Sign in
                </a>
            </p>
        </div>

        {/* Form input */}
        <div className="bg-white text-black rounded-xl p-4 space-y-3">
            <div className="flex items-center border-b pb-2">
                <input
                    type="text"
                    className="flex-1 bg-transparent outline-none"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            <div className="flex items-center border-b pb-2">
                <input
                    type="email"
                    className="flex-1 bg-transparent outline-none"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="flex items-center border-b pb-2">
                <input
                    type="tel"
                    className="flex-1 bg-transparent outline-none"
                    placeholder="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />
            </div>
            <div className="flex items-center">
                <input
                    type="password"
                    className="flex-1 bg-transparent outline-none"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
        </div>


        {/* Buttons */}
        <button
        onClick={() => {
          setLoading(true);
          // Simulasi async (misalnya login)
          setTimeout(() => setLoading(false), 2000);
        }}
        disabled={loading}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 transition rounded-lg font-semibold cursor-pointer"
        >
        {loading ? (
          <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : (
          'Sign Up'
        )}
      </button>
    </div>
</div>

    );
}

export default SignPage;