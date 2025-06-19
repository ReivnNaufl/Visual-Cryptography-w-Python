import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import backgroundImage from "../assets/background_Star.png";
import placeholderimg from "../assets/material-symbols_image.png"

function CreatedQRScreenDetail() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
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

        {/* Nama */}
        <label className="block text-sm mb-2">Nama</label>
        <div className="w-full p-3 rounded-lg bg-[#1e1e1e] text-white mb-6">
          {name || "Nama Toko"}
        </div>


        {/* QR */}
        <label className="block text-sm mb-2">QR Share</label>
        <div className="w-full h-48 bg-white rounded-xl flex items-center justify-center overflow-hidden mb-6">
          {image ? (
            <img src={image} alt="Image" className="h-full object-contain" />
          ) : (
            <label className="cursor-pointer flex flex-col items-center justify-center text-black">
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

        {/* Download Button */}
        <a
          href={image}
          download="qr-share.png"
          className="block w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold text-center transition"
        >
          Download Share
        </a>

        <button
          onClick={() => console.log("Delete QR")}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-semibold transition mt-5"
        >
          Delete
        </button>

      </div>
    </div>
  );
}

export default CreatedQRScreenDetail;
