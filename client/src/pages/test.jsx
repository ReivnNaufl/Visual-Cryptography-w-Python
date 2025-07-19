import { useState,useRef,useEffect } from 'react';
import backgroundImage from "../assets/background_Star.png";
import { QRCodeSVG } from 'qrcode.react';
import { useLocation } from "react-router-dom";
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
    const svgElement = qrCodeRef.current.querySelector('svg');
    if (!svgElement) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const context = canvas.getContext('2d');

      // Gambar SVG ke dalam canvas
      context.drawImage(img, 0, 0);

      // Buat data URL PNG dari canvas
      const pngUrl = canvas.toDataURL('image/png');

      // Buat dan klik link unduhan
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = 'QRIS_Code.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // Bersihkan object URL
      URL.revokeObjectURL(url);
    };

    img.onerror = () => {
      console.error("Gagal memuat gambar SVG ke dalam canvas.");
    };

    img.src = url;
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
            Download QRIS (.png)
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
  const { state } = useLocation();
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (state?.scanResult) {
      setResult({
        success: true,
        data: state.scanResult.data,
      });
    }
  }, [state]);

  if (!result) {
    return (
      <div className="text-white p-4">
        <p>🔄 Menunggu hasil scan QR...</p>
      </div>
    );
  }

  return (
    <div className="text-white p-4 bg-slate-950 min-h-screen flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Hasil Rekonstruksi QR</h1>
      <div className="w-full max-w-md p-6 bg-gray-800 rounded-lg shadow">
        <QrResult resultData={result.data} onReset={() => window.history.back()} />
      </div>
    </div>
  );
}

export default ReconstructiveQrScanner;