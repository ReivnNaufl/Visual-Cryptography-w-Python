import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom"; // Impor useParams
import { useState, useEffect } from "react"; // Impor useEffect
import backgroundImage from "../assets/background_Star.png";
import placeholderimg from "../assets/material-symbols_image.png";
import { useAuth } from "../context/AuthContext"; // Impor untuk otentikasi

function CreatedQRScreenDetail() {
  const navigate = useNavigate();
  const { qrId } = useParams(); // 1. Dapatkan qrId dari URL
  const { currentUser } = useAuth();

  // State untuk data, loading, dan error
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Gunakan useEffect untuk mengambil data detail berdasarkan qrId
  useEffect(() => {
    if (!qrId || !currentUser) return;

    const fetchQrDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await currentUser.getIdToken();
        // Anda perlu membuat endpoint ini di backend
        const response = await fetch(`http://127.0.0.1:8000/qr/${qrId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil detail QR.");
        }
        const data = await response.json();
        setQrData(data); // Simpan seluruh data QR ke state

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQrDetail();
  }, [qrId, currentUser]); // Efek ini akan berjalan jika qrId atau currentUser berubah

  // Tampilkan loading & error state
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-red-400">Error: {error}</div>;

  // Siapkan URL gambar untuk ditampilkan dan diunduh
  const imageUrl = qrData?.public_share ? `data:image/png;base64,${qrData.public_share}` : placeholderimg;

  return (
    <div className="relative min-h-screen px-4 pt-6 pb-24 overflow-y-auto">
      {/* Background */}
      <div className="absolute inset-0 z-10" style={{ backgroundImage: `url(${backgroundImage})`, backgroundPosition: "center" }} />
      <div className="absolute inset-0 bg-slate-950 bg-opacity-70 z-0" />

      {/* Main Content */}
      <div className="relative z-10 text-white">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="text-white h-6 w-6" />
          </button>
          {/* 3. Gunakan data dinamis */}
          <h1 className="text-2xl font-bold">{"Detail QR"}</h1>
        </div>

        {/* Nama */}
        <label className="block text-sm mb-2">Nama</label>
        <div className="w-full p-3 rounded-lg bg-[#1e1e1e] text-white mb-6">
          {qrId || "Nama Toko Tidak Ditemukan"}
        </div>

        {/* QR */}
        <label className="block text-sm mb-2">QR Share</label>
        <div className="w-full h-48 bg-white rounded-xl flex items-center justify-center overflow-hidden mb-6">
          <img src={imageUrl} alt="QR Share" className="h-full object-contain" />
        </div>

        {/* Download Button */}
        <a
          href={imageUrl}
          download={`qr-${qrData?.metadata?.name || qrId}.png`}
          className={`block w-full py-3 rounded-lg text-white font-semibold text-center transition ${!qrData?.public_share ? 'bg-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'}`}
        >
          Download Share
        </a>
        
        {/* Tombol Delete akan memerlukan fungsinya sendiri */}
        <button
          onClick={() => alert(`Fungsi delete untuk QR ID: ${qrId} belum diimplementasikan.`)}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-semibold transition mt-5"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default CreatedQRScreenDetail;