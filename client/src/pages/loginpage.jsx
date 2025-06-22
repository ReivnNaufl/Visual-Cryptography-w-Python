import { useNavigate } from 'react-router-dom';
import {useState, useEffect} from "react"
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';


import backgroundImage from "../assets/background_Star.png"

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingQR, setLoadingQR] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
      e.preventDefault();
      setError(null);
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // INI BAGIAN PENTING: Ambil ID Token
        const idToken = await user.getIdToken();
        //console.log("Login berhasil! Token ID:", idToken);

        // Simpan token ini untuk digunakan dalam panggilan API
        // Contoh: simpan di localStorage atau state management (Context/Redux)
        localStorage.setItem('firebaseIdToken', idToken);

        // Anda bisa memanggil API ke backend setelah ini
        fetchProtectedData(idToken);
        navigate("/home")

      } catch (error) {
        setError(error.message);
        console.error("Error saat login:", error);
      }
    };

      // Contoh fungsi untuk memanggil endpoint yang dilindungi
    const fetchProtectedData = async (token) => {
      try {
        const response = await fetch('http://127.0.0.1:8000/protected', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          }
        });

        if (!response.ok) {
          throw new Error('Gagal mengambil data terproteksi');
        }

        const data = await response.json();
        console.log("Data dari backend:", data);
      } catch (error) {
        console.error(error);
      }
    };





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
                <a href="/signup" className="text-blue-400 hover:underline">
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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

        {/* Forgot password */}
        <div className="text-right text-sm text-blue-400 hover:underline">
            <a href="#">Forgot Your Password ?</a>
        </div>

        {/* Buttons */}
        <button
        onClick={(e) => {
          setLoading(true);
          handleLogin(e).finally(() => setLoading(false));
        }}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 transition rounded-lg font-semibold cursor-pointer disabled:opacity-60"
        >
        {loading ? (
          <svg className="flex items-center animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
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
            <span className="align-middle">Scan QR</span>
          </>
        )}
      </button>

    </div>
</div>

    );
}

export default LoginPage;