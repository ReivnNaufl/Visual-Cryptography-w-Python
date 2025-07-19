import React, { useEffect, useRef, useState } from "react";

const CameraScanner = ({ qrName, onBack }) => {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [resultImg, setResultImg] = useState(null);
  const [errorRate, setErrorRate] = useState(null);
  const [wsClosed, setWsClosed] = useState(false);

  useEffect(() => {
    let stream = null;
    let ws = null;
    let interval = null;

    const b64FromVideo = (videoEl) => {
      const canvas = document.createElement("canvas");
      canvas.width = videoEl.videoWidth;
      canvas.height = videoEl.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg").split(",")[1]; // base64 only
    };

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Start WebSocket
        ws = new WebSocket(`ws://localhost:8000/ws/scan?qr_name=${encodeURIComponent(qrName)}`);

        ws.onopen = () => {
          interval = setInterval(() => {
            if (videoRef.current?.videoWidth) {
              const frameB64 = b64FromVideo(videoRef.current);
              ws.send(frameB64);
            }
          }, 200); // setiap 200ms
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);

          if (data.success) {
            clearInterval(interval);
            stopCamera();
            setResultImg(data.image_b64);
            setErrorRate(`✅ Success! Error rate: ${data.error_rate.toFixed(2)}%`);
          } else {
            setErrorRate(`❌ Scanning... Error rate: ${data.error_rate.toFixed(2)}%`);
          }
        };

        ws.onerror = (e) => {
          console.error("WebSocket error:", e);
        };

        ws.onclose = () => {
          setWsClosed(true);
          stopCamera();
        };
      } catch (err) {
        console.error("Camera error:", err);
        setError("Gagal mengakses kamera. Pastikan izin diberikan.");
      }
    };

    const stopCamera = () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        console.log("Camera stopped.");
      }
    };

    startCamera();

    return () => {
      clearInterval(interval);
      if (ws) ws.close();
      stopCamera();
    };
  }, [qrName]);

  return (
    <div className="relative min-h-screen px-4 py-6 bg-black text-white">
      <header className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-white text-xl">&larr;</button>
        <h1 className="text-lg font-bold">Scan QR</h1>
      </header>

      {error ? (
        <p className="text-red-400">{error}</p>
      ) : (
        <div className="flex flex-col items-center justify-center">
          {!resultImg && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full max-w-md aspect-video object-cover rounded-md"
            />
          )}

          {resultImg && (
            <img
              src={`data:image/png;base64,${resultImg}`}
              alt="Hasil Rekonstruksi"
              className="max-w-md mt-4 rounded-md"
            />
          )}

          {errorRate && (
            <p className="mt-4 text-lg font-semibold" style={{ color: errorRate.includes("✅") ? "lightgreen" : "red" }}>
              {errorRate}
            </p>
          )}

          {wsClosed && (
            <p className="mt-2 text-gray-400 text-sm">WebSocket closed.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CameraScanner;
