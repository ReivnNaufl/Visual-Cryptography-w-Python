import { useState } from "react";
import { PlusCircle, QrCode, User } from "lucide-react";
import qrIcon from "../assets/qr-icon.png";
import backgroundImage from "../assets/background_Star.png";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function ProfileScreen() {
  const navigate = useNavigate();
  const [qrList] = useState([
    "Nama Toko", "Nama Toko 1", "Nama Toko 2",
    "Nama Toko 3", "Nama Toko 4", "Nama Toko 5", "Nama Toko 6"
  ]);

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
      <div className="relative z-10 text-white"
        style={{marginTop: '2rem'}}
      >
        {/* Heading */}
        <h1 className="text-2xl font-bold mb-4">Profile</h1>

        {/* Value */}
        <div className="space-y-10 mt-15">
          <div
              className="bg-[#2b2b2b] rounded-xl p-3 flex justify-between items-center shadow-md"
            >
              <div className="flex gap-3 items-center">
                <div>
                  <h2 className="font-semibold">Username</h2>
                </div>
              </div>
              <p className="text-xs text-gray-400 whitespace-nowrap">Data</p>
            </div>
        </div>

        <div className="space-y-10 mt-80">
          <button
          className="w-full py-3 bg-red-600 hover:bg-red-700 transition rounded-lg font-semibold cursor-pointer"
          >Logout</button>
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
    </div>
  );
}

export default ProfileScreen;
