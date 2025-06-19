import { useNavigate } from 'react-router-dom';
import {useState, useEffect} from "react"

import backgroundImage from "../assets/background_Star.png"

function SignPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingQR, setLoadingQR] = useState(false);


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
                Don’t have an account?{" "}
                <a href="#" className="text-blue-400 hover:underline">
                    Sign Up
                </a>
            </p>
        </div>

        {/* Form input */}
        <div className="bg-white text-black rounded-xl p-4 space-y-3">
            <div className="flex items-center border-b pb-2">
                <input
                    type="email"
                    className="flex-1 bg-transparent outline-none"
                    placeholder="Email"
                />
            </div>
            <div className="flex items-center">
                <input
                    type="password"
                    className="flex-1 bg-transparent outline-none"
                    placeholder="Password"
                />
            </div>
        </div>

        {/* Forgot password */}
        <div className="text-right text-sm text-blue-400 hover:underline">
            <a href="#">Forgot Your Password ?</a>
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
          'Log In'
        )}
      </button>

        <div className="text-center text-sm text-gray-400">OR</div>

        <button
        onClick={() => {
          setLoadingQR(true);
          // Simulasi proses scan QR
          setTimeout(() => setLoadingQR(false), 2000);
        }}
        disabled={loadingQR}
        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 transition rounded-lg font-semibold cursor-pointer disabled:opacity-60"
      >
        {loadingQR ? (
          <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : (
          <>
            <span>Scan QR</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M3 4a1 1 0 011-1h3m4 0h3a1 1 0 011 1v3m0 4v3a1 1 0 01-1 1h-3m-4 0H4a1 1 0 01-1-1v-3m0-4V4" />
            </svg>
          </>
        )}
      </button>
    </div>
</div>

    );
}

export default SignPage;