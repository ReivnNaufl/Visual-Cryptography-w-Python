import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/loginpage";
import SignPage from "./pages/signuppage";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage/>} />
        <Route path="/signup" element={<SignPage/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
