import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import InvoicePage from './pages/InvoicePage';
import Products from './pages/Products';
import Login from './pages/Login'; // Create this component similar to Register
import Register from './pages/Register';
import InvoicesListPage from './pages/InvoicesListPage'; // <-- Import the new page
import InvoiceDetailPage from './pages/InvoiceDetailPage'; // <-- Import the new page
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from './context/ThemeContext';
import DashboardPage from './pages/DashboardPage';

// A wrapper for routes that require authentication
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
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
    </AuthProvider>
  );
}

export default App;