import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import backgroundImage from "../assets/background_Star.png";

function ScanQRScreen() {
  const navigate = useNavigate();
  const [name, setName] = useState("");

  const handleSearch = () => {
    console.log("Searching for:", name);
    // navigasi atau fetch ke data share di sini
  };

  return (
    <div className="relative min-h-screen px-4 pt-6 pb-24 overflow-y-auto">
      {/* Background */}
      <div
        className="absolute inset-0 z-10"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-slate-950 bg-opacity-70 z-0" />

      {/* Main Content */}
      <div className="relative z-10 text-white"
        style={{marginTop: '2rem'}}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="text-white h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold">Scan QR</h1>
        </div>

        {/* Input Nama */}
        <label className="block text-sm mb-2">Nama</label>
        <input
          type="text"
          className="w-full p-3 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Masukkan nama share"
        />

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold transition"
        >
          Search Share
        </button>
      </div>
    </div>
  );
}

export default ScanQRScreen;
