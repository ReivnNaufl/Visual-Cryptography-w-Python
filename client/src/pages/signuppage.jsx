import { useNavigate } from 'react-router-dom';
import { useState } from "react";

// Impor yang diperlukan dari Firebase
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; 
import { auth, db } from '../firebase'; // Sesuaikan path ke file firebase.js Anda

import backgroundImage from "../assets/background_Star.png";

function SignPage() {
    // Inisialisasi useNavigate untuk navigasi
    const navigate = useNavigate();

    // State yang sudah ada
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [phone, setPhone] = useState("");
    
    // State baru untuk menampilkan pesan error
    const [error, setError] = useState("");

    // Fungsi untuk menangani proses registrasi
    const handleSignUp = async () => {
        // Validasi input dasar
        if (!username || !email || !phone || !password) {
            setError("Semua kolom wajib diisi.");
            return;
        }

        setError(""); // Bersihkan error sebelumnya
        setLoading(true);

        try {
            // 1. Buat pengguna dengan email dan password di Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Update profil di Firebase Auth untuk menyimpan nama pengguna (displayName)
            await updateProfile(user, {
                displayName: username
            });

            // 3. Simpan data tambahan (username, email, phone) ke Firestore Database
            // Dokumen akan dibuat di koleksi 'users' dengan ID yang sama dengan UID pengguna
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                username: username,
                email: email,
                phone: phone,
                createdAt: new Date(), // Tambahkan timestamp kapan akun dibuat
            });

            // 4. Jika semua berhasil, arahkan pengguna ke halaman login
            // Anda bisa mengubah "/signin" ke halaman lain seperti "/" atau "/dashboard"
            navigate("/home");

        } catch (err) {
            // Tangani error dari Firebase
            console.error("Error saat Sign Up:", err.code, err.message);
            if (err.code === 'auth/email-already-in-use') {
                setError("Email ini sudah terdaftar. Silakan gunakan email lain.");
            } else if (err.code === 'auth/weak-password') {
                setError("Password terlalu lemah (minimal 6 karakter).");
            } else {
                setError("Gagal membuat akun. Silakan coba lagi.");
            }
        } finally {
            // Hentikan loading baik berhasil maupun gagal
            setLoading(false);
        }
    };
    
    // Fungsi untuk navigasi ke halaman Sign In
    const handleNavigateToSignIn = (e) => {
        e.preventDefault(); // Mencegah perilaku default link
        navigate('/'); // Ganti dengan path halaman login Anda
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center px-4">
            {/* Background image + overlay (Tidak diubah) */}
            <div className="absolute inset-0 bg-slate-950 bg-opacity-60"></div>
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundPosition: 'center',
                }}
            ></div>

            {/* Konten utama (Tidak diubah) */}
            <div className="relative z-10 w-full max-w-sm text-white text-center space-y-6">
                <div className="mx-auto w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center">
                    <div className="text-2xl font-bold"></div>
                </div>

                <div>
                    <h1 className="text-2xl font-semibold">Sign in to your</h1>
                    <h1 className="text-2xl font-bold">Account</h1>
                    <p className="text-sm mt-2 text-gray-300">
                        Alerady have an account?{" "}
                        <a href="#" onClick={handleNavigateToSignIn} className="text-blue-400 hover:underline">
                            Sign in
                        </a>
                    </p>
                </div>
                
                {/* Penampil Pesan Error */}
                {error && <p className="text-red-400 bg-red-900 bg-opacity-50 p-2 rounded-md text-sm">{error}</p>}

                {/* Form input (Tidak diubah) */}
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

                {/* Tombol dengan logika baru */}
                <button
                    onClick={handleSignUp} // Menggunakan fungsi handleSignUp
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 transition rounded-lg font-semibold cursor-pointer flex items-center justify-center"
                >
                    {loading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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