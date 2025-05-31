import { useNavigate } from 'react-router-dom';
import {useState, useEffect} from "react"

function LoginPage(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-gray-900 text-white px-4">
          <div className="w-full max-w-sm">
            <div className="text-center mb-8">
              <div className="mx-auto w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                <div className="text-xl font-bold">🔰</div>
              </div>
              <h1 className="text-2xl font-semibold">Sign in to your</h1>
              <h1 className="text-2xl font-bold">Account</h1>
              <p className="text-sm mt-2">
                Don’t have an account?{" "}
                <a href="#" className="text-blue-400 hover:underline">
                  Sign Up
                </a>
              </p>
            </div>
    
            <div className="bg-white text-black rounded-xl p-4 mb-4 space-y-3">
              <div className="flex items-center border-b pb-2">
                <input
                  type="email"
                  className="flex-1 bg-transparent outline-none"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex items-center">  
                <input
                  type="password"
                  className="flex-1 bg-transparent outline-none"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
    
            <div className="text-right mb-4">
              <a href="#" className="text-sm text-blue-400 hover:underline">
                Forgot Your Password ?
              </a>
            </div>
    
            <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 transition rounded-lg font-semibold mb-4">
              Log In
            </button>
    
            <div className="text-center mb-4 text-sm text-gray-400">OR</div>
    
            <button className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 transition rounded-lg font-semibold">
              Scan QR
            </button>
          </div>
        </div>
      );
}

export default LoginPage;