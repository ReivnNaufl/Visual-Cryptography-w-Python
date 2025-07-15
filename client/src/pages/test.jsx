import { useState,useRef } from 'react';
import backgroundImage from "../assets/background_Star.png";
import { QRCodeSVG } from 'qrcode.react';
// --- Komponen QrResult digunakan kembali untuk menampilkan hasil ---
// (Ini sama dengan komponen dari contoh sebelumnya)
// --- Komponen QrResult yang sudah dimodifikasi ---
const QrResult = ({ resultData, onReset }) => {
  const { type, content } = resultData;
  
  // Buat sebuah ref untuk menunjuk ke wrapper div dari QR code
  const qrCodeRef = useRef(null);

  const paymentDeepLinks = [
    {
      name: 'GoPay',
      scheme: `gopay://qris/scan?data=${encodeURIComponent(content)}`,
      className: 'bg-sky-500 hover:bg-sky-600',
    },
    {
      name: 'DANA',
      scheme: `danaid://payment?qr=${encodeURIComponent(content)}`,
      className: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      name: 'ShopeePay',
      scheme: `shopeeid://qris/scan?data=${encodeURIComponent(content)}`,
      className: 'bg-orange-500 hover:bg-orange-600',
    },
    {
      name: 'OVO',
      scheme: `ovo://qris/scan?data=${encodeURIComponent(content)}`,
      className: 'bg-purple-600 hover:bg-purple-700',
    },
  ];

  const handlePayment = (urlScheme) => {
    window.location.href = urlScheme;
  };
  
  // Fungsi untuk menangani proses unduhan QR code
  const handleDownload = () => {
    if (qrCodeRef.current) {
      // 1. Cari elemen SVG di dalam div yang direferensikan
      const svgElement = qrCodeRef.current.querySelector('svg');
      if (!svgElement) return;

      // 2. Ubah SVG menjadi string XML
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);

      // 3. Buat Data URL dari string SVG (aman untuk karakter khusus)
      const dataUrl = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgString)));

      // 4. Buat link sementara untuk memicu unduhan
      const downloadLink = document.createElement('a');
      downloadLink.href = dataUrl;
      downloadLink.download = 'QRIS_Code'; // Nama file yang akan diunduh

      // 5. Tambahkan ke DOM, klik, lalu hapus
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };


  return (
    <div className="w-full">
      {type === 'URL' && (
        // ... (kode untuk tipe URL tidak berubah)
        <div>
          <h3>Tautan Ditemukan</h3>
          <p>QR code berisi sebuah alamat web.</p>
          <a href={content} target="_blank" rel="noopener noreferrer">
            <button className="w-full mt-2 py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition">Buka Tautan</button>
          </a>
        </div>
      )}

      {/* BLOK YANG DIMODIFIKASI */}
      {type === 'QRIS' && (
        <div>
          {/* Wrapper div untuk QR code, tambahkan ref di sini */}
          <div ref={qrCodeRef} className="mb-2 p-4 bg-white rounded-lg flex justify-center">
            <QRCodeSVG 
              value={content}
              size={200}
              bgColor={"#ffffff"}
              fgColor={"#000000"}
              level={"L"}
              includeMargin={true}
            />
          </div>

          {/* Tombol Download Baru */}
          <button 
            onClick={handleDownload}
            className="w-full py-2 px-4 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-semibold transition mb-4"
          >
            Download QRIS (.svg)
          </button>

          <h3 className="text-xl font-semibold text-center mb-2">QRIS Terdeteksi</h3>
          <p className="text-center text-gray-300">Pilih aplikasi untuk menyelesaikan pembayaran:</p>
          <div className="flex flex-col space-y-2 mt-4">
            {paymentDeepLinks.map((p) => (
              <button
                key={p.name}
                onClick={() => handlePayment(p.scheme)}
                className={`w-full py-2 px-4 rounded-lg text-white font-semibold transition ${p.className}`}
              >
                Bayar dengan {p.name}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {type === 'TEXT' && (
        // ... (kode untuk tipe TEXT tidak berubah)
        <div>
          <h3>Teks Biasa Ditemukan</h3>
          <pre className="mt-2 p-3 bg-gray-800 rounded text-sm whitespace-pre-wrap break-all">{content}</pre>
        </div>
      )}

      <button onClick={onReset} className="w-full mt-4 py-2 px-4 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-semibold transition">
        Pindai Gambar Lain
      </button>
    </div>
  );
};


// Komponen utama untuk skenario rekonstruksi
function ReconstructiveQrScanner() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      // Reset hasil sebelumnya saat gambar baru dipilih
      setResult(null);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Harap pilih file gambar QR terlebih dahulu.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    // Gunakan 'file' sebagai key, sesuai dengan parameter di endpoint FastAPI
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/scan', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `Error: ${response.status}`);
      }
      
      const data = await response.json();
      setResult(data);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetScanner = () => {
      setSelectedFile(null);
      setImagePreview(null);
      setResult(null);
      setError('');
      setIsLoading(false);
      
      // Tambahkan ini untuk me-reset input file
      document.getElementById('qr-upload').value = null; 
  }

  return (
    <div className="bg-slate-950 text-white min-h-screen p-4 sm:p-6 flex flex-col items-center">
      
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-4">QR Scanner</h1>
        
        {result && result.success ? (
            <div className="mt-6 p-6 bg-gray-800 rounded-lg shadow-lg">
                <QrResult resultData={result.data} onReset={resetScanner} />
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <label htmlFor="qr-upload" className="cursor-pointer">
                    <div className="w-full h-64 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:bg-gray-700 hover:border-gray-500 transition">
                        {imagePreview ? ( 
                            <img src={imagePreview} alt="Preview" className="h-full w-full object-contain p-2" />
                        ) : (
                            <>
                                <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1.586-1.586a2 2 0 00-2.828 0L6 14m6-6l.01.01"></path></svg>
                                <p>Klik untuk mengunggah gambar QR</p>
                            </>
                        )}
                    </div>
                </label>
                <input id="qr-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

                <button type="submit" disabled={isLoading || !selectedFile} className="w-full mt-6 py-3 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center">
                    {isLoading ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                        'Analisis Gambar QR'
                    )}
                </button>
            </form>
        )}
        
        {error && <div className="mt-4 p-3 bg-red-900 bg-opacity-50 text-red-300 rounded-lg text-center">{error}</div>}
      </div>
    </div>
  );
}

export default ReconstructiveQrScanner;