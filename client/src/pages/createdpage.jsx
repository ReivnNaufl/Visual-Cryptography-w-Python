import { ArrowLeft, Trash2 } from "lucide-react"; 
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import backgroundImage from "../assets/background_Star.png";
import placeholderimg from "../assets/material-symbols_image.png";
import { useAuth } from "../context/AuthContext";

function CreatedQRScreenDetail() {
  const navigate = useNavigate();
  const { qrId } = useParams(); // 1. Dapatkan qrId dari URL
  const { currentUser } = useAuth();

  // State untuk data, loading, dan error
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`http://127.0.0.1:8000/qr/${qrId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Gagal menghapus QR." }));
        throw new Error(errorData.detail);
      }
      alert("QR berhasil dihapus.");
      navigate("/home");
    } catch (err) {
      setError(err.message);
      console.error("Error deleting QR:", err);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false); // Tutup modal setelah selesai
    }
  };

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
          onClick={() => setIsDeleteModalOpen(true)}
          className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-700 transition mt-5 flex items-center justify-center gap-2"
        >
          <Trash2 className="h-5 w-5"/>
          <span className="font-semibold">Delete</span>
        </button>


      </div>
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 px-4">
          <div className="bg-slate-800 text-white p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h3 className="text-lg font-bold mb-2">Konfirmasi Penghapusan</h3>
            <p className="mb-6 text-gray-300">
              Apakah Anda yakin ingin menghapus toko <span className="font-bold">"{qrId}"</span>? Aksi ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-md transition disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="py-2 px-4 bg-red-600 hover:bg-red-700 rounded-md transition flex items-center justify-center disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menghapus...
                  </>
                ) : (
                  'Ya, Hapus'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreatedQRScreenDetail;