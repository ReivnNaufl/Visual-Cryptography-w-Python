import { useState, useEffect } from "react"; // 1. Impor useEffect
import { PlusCircle, QrCode, User } from "lucide-react";
import qrIcon from "../assets/qr-icon.png";
import backgroundImage from "../assets/background_Star.png";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // 2. Impor useAuth untuk mendapatkan currentUser

function CreatedQRScreen() {
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // Dapatkan pengguna yang sedang login

  // 3. Ubah state untuk menampung data dari API, loading, dan error
  const [qrList, setQrList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 4. Gunakan useEffect untuk mengambil data saat komponen dimuat
  useEffect(() => {
    // Pastikan ada pengguna yang login sebelum mengambil data
    if (!currentUser) {
      setLoading(false);
      setError("Anda harus login untuk melihat data ini.");
      return;
    }

    // Buat fungsi async di dalam useEffect untuk fetching data
    const fetchUserQRs = async () => {
      setLoading(true);
      setError(null);
      try {
        // Ambil ID Token untuk otentikasi
        const token = await currentUser.getIdToken();

        // Panggil API backend Anda
        const response = await fetch(`http://127.0.0.1:8000/qr/user/${currentUser.uid}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}` // Sertakan token untuk endpoint yang dilindungi
          }
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil data dari server.");
        }

        const data = await response.json();
        setQrList(data.qrs); // Simpan data dari API ke dalam state
        
      } catch (err) {
        setError(err.message);
        console.error("Error fetching QR list:", err);
      } finally {
        setLoading(false); // Hentikan loading, baik berhasil maupun gagal
      }
    };

    fetchUserQRs();
  }, [currentUser]); // Dependency array [currentUser] berarti efek ini akan berjalan lagi jika currentUser berubah

  // 5. Buat fungsi untuk memformat tanggal agar lebih mudah dibaca
  const formatDate = (isoString) => {
    // Cek jika inputnya adalah string yang valid
    if (!isoString || typeof isoString !== 'string') return "Tanggal tidak valid";

    // JavaScript Date object bisa langsung mem-parsing string format ISO
    const date = new Date(isoString);

    // Cek lagi jika hasil parsingnya valid
    if (isNaN(date)) return "Format tanggal salah";

    return date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  // 6. Tampilkan pesan loading saat data sedang diambil
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-white bg-slate-950">
        <p>Loading data...</p>
      </div>
    );
  }

  // Tampilkan pesan error jika terjadi kesalahan
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-400 bg-slate-950">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen px-4 pt-6 pb-24 overflow-y-auto">
      {/* Background + Overlay */}
      <div className="absolute inset-0 z-10" style={{ backgroundImage: `url(${backgroundImage})`, backgroundPosition: 'center' }} />
      <div className="absolute inset-0 bg-slate-950 bg-opacity-60 z-0" />

      {/* Main content */}
      <div className="relative z-10 text-white" style={{ marginTop: '2rem' }}>
        <h1 className="text-2xl font-bold mb-4">Created QR</h1>

        {/* 7. Ubah cara render list sesuai dengan struktur data dari API */}
        <div className="space-y-3">
          {qrList.length > 0 ? (
            qrList.map((qrItem) => (
              <div key={qrItem.id} className="bg-[#2b2b2b] rounded-xl p-3 flex justify-between items-center shadow-md">
                <div className="flex gap-3 items-center">
                  <img 
                    src={`data:image/png;base64,${qrItem.public_share}`} 
                    alt={`QR for ${qrItem.metadata?.name}`} 
                    className="w-10 h-10 object-contain bg-white" 
                  />
                  <div>
                    <h2 className="font-semibold">{qrItem.id || "Nama Tidak Ada"}</h2> 
                  </div>
                </div>
                {/* Format timestamp menjadi tanggal yang mudah dibaca */}
                 <p className="text-xs text-gray-400 whitespace-nowrap">{formatDate(qrItem.metadata?.timestamp)}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 mt-10">Anda belum membuat QR code.</p>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <button onClick={() => navigate("/create")} className="fixed bottom-5 z-30 left-1/2 transform -translate-x-1/2 bg-blue-600 hover:bg-blue-700 transition rounded-full p-4 shadow-lg">
        <PlusCircle className="h-10 w-10 text-white" />
      </button>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 w-full bg-[#2b2b2b] py-2 px-8 flex justify-between items-center rounded-t-xl shadow-inner z-20">
        <Link to="/home" className="flex flex-col items-center text-blue-400">
          <QrCode className="h-6 w-6" />
          <span className="text-xs">Created</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center text-gray-400">
          <User className="h-6 w-6" />
          <span className="text-xs">Profile</span>
        </Link>
      </div>
    </div>
  );
}

export default CreatedQRScreen;