import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/loginpage";
import SignPage from "./pages/signuppage";
import CreatedQRScreen from "./pages/homepage";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage/>} />
        <Route path="/signup" element={<SignPage/>}/>
        <Route path="home" element={<CreatedQRScreen/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
