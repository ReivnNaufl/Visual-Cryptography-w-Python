import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/loginpage";
import SignPage from "./pages/signuppage";
import CreatedQRScreen from "./pages/homepage";
import ProfileScreen from "./pages/profilepage";
import CreateQRScreen from "./pages/createpage";
import CreatedQRScreenDetail from "./pages/createdpage";
import ScanQRScreen from "./pages/searchtoko";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage/>} />
        <Route path="/signup" element={<SignPage/>}/>
        <Route path="/home" element={<CreatedQRScreen/>}/>
        <Route path="/profile" element={<ProfileScreen/>}/>
        <Route path="/create" element={<CreateQRScreen/>} />
        <Route path="/created" element={<CreatedQRScreenDetail/>}/>
        <Route path="/searchtoko" element={<ScanQRScreen/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
