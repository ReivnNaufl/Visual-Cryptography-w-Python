import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase'; // Pastikan path ini benar

// Membuat Context
const AuthContext = createContext();

// Custom hook untuk mempermudah penggunaan context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component yang akan membungkus aplikasi kita
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // State untuk menunggu pengecekan auth awal

  useEffect(() => {
    // onAuthStateChanged adalah listener dari Firebase
    // yang akan terpanggil setiap kali status login pengguna berubah
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setLoading(false); // Selesai loading setelah pengecekan pertama
    });

    // Cleanup listener saat komponen di-unmount
    return unsubscribe;
  }, []); // [] berarti useEffect ini hanya berjalan sekali saat komponen pertama kali mount

  const value = {
    currentUser,
  };

  // Kita tidak merender children sampai pengecekan auth selesai
  // Ini mencegah "flash" halaman yang salah saat refresh
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};