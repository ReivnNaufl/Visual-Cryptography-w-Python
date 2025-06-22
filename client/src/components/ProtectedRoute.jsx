import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth(); // Dapatkan info pengguna dari context

  // Jika tidak ada pengguna yang login, arahkan ke halaman login
  if (!currentUser) {
    // 'replace' akan mengganti history, jadi pengguna tidak bisa menekan tombol 'back'
    // untuk kembali ke halaman yang dilindungi setelah di-redirect.
    return <Navigate to="/" replace />;
  }

  // Jika ada pengguna yang login, tampilkan halaman yang diminta (children)
  return children;
};

export default ProtectedRoute;