import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const ScanQRPage = () => {
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const qrName = params.get("qrName");

  const [error, setError] = useState(null);

  useEffect(() => {
    let ws;
    let stream;
    let isScanning = true;

    const sendFrame = () => {
      if (!videoRef.current || !isScanning) return;

      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0);

      const frameB64 = canvas.toDataURL("image/jpeg", 0.8).split(",")[1];
      ws.send(frameB64);
    };

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 2560 },
            height: { ideal: 1440 },
          },
        });
        videoRef.current.srcObject = stream;

        ws = new WebSocket(`ws://localhost:8000/ws/scan?qr_name=${encodeURIComponent(qrName)}`);

        ws.onopen = () => {
          console.log("[WS] Connection opened");
          sendFrame(); // Start with the first frame
        };

        ws.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            console.log("[WS] Received response:", data);

            if (data.success) {
              console.log("[SCAN] Success result received:", data);
              isScanning = false;
              ws.close();
              stream.getTracks().forEach((t) => t.stop());
              navigate("/test", { state: { scanResult: data } });
            } else {
              // Continue scanning if not successful
              sendFrame();
            }
          } catch (err) {
            console.error("[WS] Error parsing message:", err);
            sendFrame();
          }
        };

        ws.onerror = (e) => {
          console.error("[WS] Error:", e);
          setError("Terjadi kesalahan koneksi WebSocket");
        };

        ws.onclose = () => {
          console.log("[WS] Connection closed");
          isScanning = false;
        };
      } catch (err) {
        console.error("[CAMERA] Error accessing camera:", err);
        setError("Tidak bisa mengakses kamera.");
      }
    };

    start();

    return () => {
      isScanning = false;
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (ws) ws.close();
    };
  }, [qrName, navigate]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute top-0 left-0 w-full h-full object-cover"
      />

      <div className="absolute top-0 left-0 right-0 flex items-center px-4 py-5 z-10">
        <button onClick={() => navigate(-1)} className="text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-white text-lg font-semibold ml-3">Scan QR</h1>
      </div>

      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="relative w-[70vw] h-[70vw] max-w-xs border-4 border-transparent">
          <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-xl" />
        </div>
      </div>

      {error && (
        <div className="absolute bottom-10 w-full text-center">
          <div className="inline-block bg-red-800 text-red-200 px-4 py-2 rounded-md text-sm">
            {error}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanQRPage;
