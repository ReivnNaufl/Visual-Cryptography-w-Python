import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/loginpage";
import SignPage from "./pages/signuppage";
import CreatedQRScreen from "./pages/homepage";
import ProfileScreen from "./pages/profilepage";
import CreateQRScreen from "./pages/createpage";
import CreatedQRScreenDetail from "./pages/createdpage";
import ScanQRScreen from "./pages/searchtoko";

// Impor komponen ProtectedRoute
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- Rute Publik (Bisa diakses siapa saja) --- */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignPage />} />
        {/* Kita asumsikan /searchtoko juga publik, jika harus login, bungkus juga */}
        <Route path="/searchtoko" element={<ScanQRScreen />} />

        {/* --- Rute yang Dilindungi (Hanya untuk yang sudah login) --- */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <CreatedQRScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <CreateQRScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/created/:qrId"
          element={
            <ProtectedRoute>
              <CreatedQRScreenDetail />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;