import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

// Impor yang diperlukan dari Firebase
import { doc, updateDoc,  } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase"; // Pastikan Anda sudah mengekspor 'db' dari firebase.js

import backgroundImage from "../assets/background_Star.png";
import placeholderimg from "../assets/material-symbols_image.png";

function CreateQRScreen() {
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // Dapatkan pengguna yang sedang login dari context

  // State untuk input form
  const [name, setName] = useState("");
  const [imagePreview, setImagePreview] = useState(null); // Untuk menampilkan preview gambar
  const [imageFile, setImageFile] = useState(null); // Untuk menyimpan file gambar yang akan dikirim

  // State untuk UI feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Simpan file asli untuk di-upload
      setImageFile(file);
      // Buat URL sementara untuk preview di UI
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    // 1. Validasi Input
    if (!name || !imageFile) {
      setError("Nama toko dan gambar QR wajib diisi.");
      return;
    }
    if (!currentUser) {
      setError("Anda harus login untuk melakukan aksi ini.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // 2. Update nama toko di Firestore
      const idToken = await currentUser.getIdToken();

      const addStoreResponse = await fetch(`http://127.0.0.1:8000/users/${currentUser.uid}/add-store`, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            // Header ini WAJIB ada untuk mengakses rute yang dilindungi
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({
            name: name,
          }),
      });

      // 3. Siapkan FormData untuk dikirim ke API FastAPI
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("name", name);
      formData.append("userId", currentUser.uid);
      
      // 4. Kirim request ke backend
      const response = await fetch("http://127.0.0.1:8000/upload/", { // Sesuaikan URL jika perlu
        method: "POST",
        body: formData,
        // Untuk FormData, browser akan otomatis set Content-Type ke multipart/form-data
      });
      
      // Karena backend Anda mengembalikan HTML, kita cek statusnya saja
      if (!response.ok) {
        // Coba baca detail error jika ada
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Gagal mengunggah gambar.");
      }
      
      // 5. Jika berhasil
      alert("QR code berhasil dibuat!");
      navigate("/home"); // Arahkan ke halaman home atau halaman lain yang sesuai

    } catch (err) {
      console.error("Terjadi kesalahan:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
      <div className="relative z-10 text-white">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="text-white h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold">Create</h1>
        </div>
        
        {/* Tampilkan pesan error jika ada */}
        {error && <p className="text-red-400 bg-red-900 bg-opacity-50 p-2 rounded-md text-sm mb-4">{error}</p>}

        {/* Input Nama */}
        <label className="block text-sm mb-2">Nama</label>
        <input
          type="text"
          className="w-full p-3 rounded-lg bg-[#1e1e1e] text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Masukkan nama toko"
        />

        {/* Upload QR */}
        <label className="block text-sm mb-2">Upload QR</label>
        <div className="w-full h-48 bg-white rounded-xl flex items-center justify-center overflow-hidden mb-6">
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="h-full object-contain" />
          ) : (
            <label className="cursor-pointer flex flex-col items-center justify-center text-black">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <div className="bg-white rounded-md p-4">
                <img
                  src={placeholderimg}
                  alt="Placeholder"
                  className="h-10 w-10"
                />
              </div>
            </label>
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading} // Disable tombol saat loading
          className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold transition flex justify-center items-center"
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'Submit'
          )}
        </button>
      </div>
    </div>
  );
}

export default CreateQRScreen;