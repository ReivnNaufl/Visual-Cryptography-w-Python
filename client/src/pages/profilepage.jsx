import { useState } from "react";
import { PlusCircle, QrCode, User } from "lucide-react";
import qrIcon from "../assets/qr-icon.png";
import backgroundImage from "../assets/background_Star.png";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

function ProfileScreen() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // 1. Tambah state untuk mengontrol modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Pengguna berhasil logout.");
      navigate('/');
    } catch (error) {
      console.error("Gagal untuk logout:", error);
      alert("Terjadi kesalahan saat mencoba logout.");
    }
  };

  return (
    <div className="relative min-h-screen px-4 pt-6 pb-24 overflow-y-auto">

      {/* Background + Overlay */}
      <div className="absolute inset-0 z-10"
       style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundPosition: 'center',
      }} />
      <div className="absolute inset-0 bg-slate-950 bg-opacity-60 z-0" />

      {/* Main content */}
      <div className="relative z-10 text-white" style={{marginTop: '2rem'}}>
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <div className="space-y-10 mt-15">
          <div className="bg-[#2b2b2b] rounded-xl p-3 flex justify-between items-center shadow-md">
            <div className="flex gap-3 items-center">
              <div>
                {/* Menampilkan username atau email dari currentUser */}
                <h2 className="font-semibold">{currentUser?.displayName || "Username"}</h2>
              </div>
            </div>
            <p className="text-xs text-gray-400 whitespace-nowrap">{currentUser?.email}</p>
          </div>
        </div>

        <div className="space-y-10 mt-80">
          {/* 2. Tombol ini sekarang membuka modal, bukan langsung logout */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full py-3 bg-red-600 hover:bg-red-700 transition rounded-lg font-semibold cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Floating Action Button */}
      <button onClick={() => navigate("/create")} className="fixed bottom-5 z-30 left-1/2 transform -translate-x-1/2 bg-blue-600 hover:bg-blue-700 transition rounded-full p-4 shadow-lg">
        <PlusCircle className="h-10 w-10 text-white" />
      </button>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 w-full bg-[#2b2b2b] py-2 px-8 flex justify-between items-center rounded-t-xl shadow-inner z-20">
        <Link to="/home" className="flex flex-col items-center text-gray-400">
          <QrCode className="h-6 w-6" />
          <span className="text-xs">Created</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center text-blue-400">
          <User className="h-6 w-6" />
          <span className="text-xs">Profile</span>
        </Link>
      </div>

      {/* 3. Komponen Modal Konfirmasi Logout */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-slate-800 text-white p-6 rounded-lg shadow-xl w-11/12 max-w-sm">
            <h3 className="text-lg font-bold mb-4">Konfirmasi Logout</h3>
            <p className="mb-6">Apakah Anda yakin ingin keluar dari akun Anda?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-md transition"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="py-2 px-4 bg-red-600 hover:bg-red-700 rounded-md transition"
              >
                Ya, Logout
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ProfileScreen;