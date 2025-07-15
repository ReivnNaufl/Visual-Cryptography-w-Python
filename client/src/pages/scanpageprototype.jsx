import React, { useEffect, useRef, useState } from 'react';

const CameraFeed = () => {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);

  // Fungsi untuk memulai kamera
  useEffect(() => {
    let stream = null; // Variabel untuk menyimpan stream

    const startCamera = async () => {
      try {
        // Minta akses ke kamera belakang (environment)
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // 'user' untuk kamera depan
            width: { ideal: 1920 }, // Resolusi yang diinginkan
            height: { ideal: 1080 }
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing the camera: ", err);
        setError("Tidak dapat mengakses kamera. Pastikan Anda telah memberikan izin dan tidak ada aplikasi lain yang sedang menggunakannya.");
      }
    };

    startCamera();

    // Cleanup function untuk menghentikan stream kamera saat komponen di-unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        console.log("Camera stream stopped.");
      }
    };
  }, []); // Array dependensi kosong agar useEffect hanya berjalan sekali

  return (
    <div className="font-sans bg-gray-800 text-white h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-700 p-4 relative z-20 flex items-center shadow-md">
        <button
          className="text-white text-2xl cursor-pointer absolute left-4"
          onClick={() => window.history.back()}
        >
          &larr;
        </button>
        <h1 className="mx-auto font-semibold text-lg">Scan QR</h1>
      </header>

      {/* Kontainer Utama */}
      <main className="flex-grow flex justify-center items-center bg-black relative">
        {error ? (
          <div className="p-4 text-center text-red-400">{error}</div>
        ) : (
          <div className="relative w-full h-full max-w-screen-md flex justify-center items-center">
            {/* Elemen Video untuk menampilkan feed kamera */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Overlay dengan bingkai biru */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] pointer-events-none">
              {/* Garis animasi pemindai */}
              
              
              {/* Sudut-sudut biru */}
              <div className="w-full h-full relative">
                {/* Top-Left Corner */}
                <div className="absolute -top-1 -left-1 w-12 h-12 border-t-8 border-l-8 border-blue-500 rounded-tl-3xl"></div>
                {/* Top-Right Corner */}
                <div className="absolute -top-1 -right-1 w-12 h-12 border-t-8 border-r-8 border-blue-500 rounded-tr-3xl"></div>
                {/* Bottom-Left Corner */}
                <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-8 border-l-8 border-blue-500 rounded-bl-3xl"></div>
                {/* Bottom-Right Corner */}
                <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-8 border-r-8 border-blue-500 rounded-br-3xl"></div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CameraFeed;