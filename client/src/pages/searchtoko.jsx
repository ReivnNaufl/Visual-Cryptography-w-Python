import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import backgroundImage from "../assets/background_Star.png";

function ScanQRScreen() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);

  useEffect(() => {
    // Jika input kosong, jangan lakukan apa-apa
    if (searchTerm.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    // Debouncing untuk menunda pencarian
    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        // --- PERUBAHAN DI SINI ---
        // Hapus .toLowerCase() dari searchTerm agar casing asli terkirim
        const response = await fetch(`http://127.0.0.1:8000/public/search/stores?name=${searchTerm}`);
        // -------------------------
        
        if (!response.ok) {
          throw new Error("Gagal mencari data toko.");
        }
        
        const data = await response.json();
        setSuggestions(data.results);
      } catch (error) {
        console.error(error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]); // Efek berjalan setiap kali searchTerm berubah

  const handleSuggestionClick = (suggestion) => {
    // Saat rekomendasi diklik, isi input dan simpan data toko yang dipilih
    setSearchTerm(suggestion.name);
    setSelectedStore(suggestion);
    setSuggestions([]);
  };

  const handleSearch = () => {
    if (selectedStore) {
        // Jika sebuah toko sudah dipilih dari rekomendasi,
        // kita bisa langsung navigasi ke halaman detailnya.
        // Anda perlu membuat halaman detail publik baru.
        // Contoh: navigate(`/store/${selectedStore.id}`);
        alert(`Navigasi ke halaman detail untuk toko ID: ${selectedStore.id}`);
    } else {
        alert("Silakan pilih toko dari daftar rekomendasi.");
    }
  };

  return (
    <div className="relative min-h-screen px-4 pt-6 pb-24 overflow-y-auto">
      {/* Background */}
      <div className="absolute inset-0 z-10" style={{ backgroundImage: `url(${backgroundImage})`, backgroundPosition: "center" }} />
      <div className="absolute inset-0 bg-slate-950 bg-opacity-70 z-0" />

      {/* Main Content */}
      <div className="relative z-10 text-white" style={{ marginTop: '2rem' }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="text-white h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold">Cari Toko</h1>
        </div>

        {/* Input Nama dan Area Rekomendasi */}
        <div className="relative">
          <label className="block text-sm mb-2">Nama Toko</label>
          <input
            type="text"
            className="w-full p-3 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Ketik nama toko..."
            autoComplete="off"
          />
          {/* Tampilkan spinner atau daftar rekomendasi */}
          {loading ? (
            <div className="absolute w-full mt-1 bg-[#2b2b2b] rounded-lg p-2 text-center text-gray-400">Mencari...</div>
          ) : (
            suggestions.length > 0 && (
              <ul className="absolute w-full mt-1 bg-[#2b2b2b] rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-600 last:border-b-0"
                  >
                    {suggestion.name}
                  </li>
                ))}
              </ul>
            )
          )}
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={!selectedStore} // Tombol disable jika belum ada toko yang dipilih
          className="w-full py-3 mt-6 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Lihat Detail Toko
        </button>
      </div>
    </div>
  );
}

export default ScanQRScreen;