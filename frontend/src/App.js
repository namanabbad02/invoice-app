import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Analytics } from "@vercel/analytics/react";
import { ModalProvider, useModal } from './context/ModalContext'; // Import ModalProvider and useModal
import { ToastContainer } from 'react-toastify';
import { useEffect } from 'react';
import { toast } from "react-toastify";

import Navbar from './components/Navbar';
import InvoicePage from './pages/InvoicePage';
import Products from './pages/Products';
import Login from './pages/Login'; // Create this component similar to Register
import Register from './pages/Register';
import InvoicesListPage from './pages/InvoicesListPage'; // <-- Import the new page
import InvoiceDetailPage from './pages/InvoiceDetailPage'; // <-- Import the new page

import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from './context/ThemeContext';
import DashboardPage from './pages/DashboardPage';
import LoginModal from './components/LoginModal';
import GlobalLoginModal from './components/GlobalLoginModal';
import { setupAxiosInterceptors } from './services/api'; // We'll create this next

// A wrapper for routes that require authentication
// const ProtectedRoute = ({ children }) => {
//   const { user } = useAuth();
//   return user ? children : <Navigate to="/login" />;
// };
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const { openLoginModal } = useModal();

  // This effect will run when the component mounts or when the user's auth state changes.
  useEffect(() => {
    if (!user) {
      openLoginModal();
    }
  }, [user, openLoginModal]);
  
  // Render the page only if the user is logged in. Otherwise, render nothing (the modal will handle it).
  return user ? children : null;
};

// A special component to set up global listeners
const GlobalAuthListener = () => {
    const { logout } = useAuth();
    const { openLoginModal } = useModal();

    useEffect(() => {
        // This sets up the interceptor that listens for 401 errors from the API
        setupAxiosInterceptors(() => {
            logout();
            openLoginModal();
            toast.error("Your session has expired. Please log in again.");
        });
    }, [logout, openLoginModal]);

    return null; // This component doesn't render anything
}

function App() {
  return (
    <AuthProvider>
      <ModalProvider>
      <Router>  
        <GlobalAuthListener /> {/* Add the global listener */}
            <Navbar />
            <GlobalLoginModal /> {/* Render the modal once, globally */}
        <main>
          <Routes>
            <Route path="/" element={<InvoicePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/invoices/:id"
              element={
                <ProtectedRoute>
                  <InvoiceDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoices"
              element={
                <ProtectedRoute>
                  <InvoicesListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <ToastContainer position="bottom-right" theme="colored" autoClose={3000} hideProgressBar />
      </Router>
      <Analytics />
      </ModalProvider>
    </AuthProvider>
  );
}

export default App;