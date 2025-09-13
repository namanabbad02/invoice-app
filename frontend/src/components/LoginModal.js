import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import FloatingLabelInput from './FloatingLabelInput';
import { Link } from 'react-router-dom';

const LoginModal = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await login({ username, password });
      auth.login(data); // This will update the auth context, causing the modal to disappear
      toast.success("Login successful!");
    } catch (error) {
      toast.error("Invalid username or password.");
      console.error("Login failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 100 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: { opacity: 0, scale: 0.8, y: 100 },
  };

  return (
    <AnimatePresence>
      <motion.div
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <motion.div variants={modalVariants} className="glass-card w-full max-w-md p-8">
          <h2 className="text-3xl font-bold mb-6 text-center">Login Required</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-6">You need to be logged in to access this page.</p>
          <form onSubmit={handleLogin} className="space-y-6">
            <FloatingLabelInput
              id="modal-username"
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <FloatingLabelInput
              id="modal-password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-lg flex items-center justify-center text-lg shadow-lg disabled:opacity-50"
            >
              {isLoading ? <ClipLoader color="#ffffff" size={24} /> : 'Login'}
            </motion.button>
          </form>
          <p className="text-center mt-4 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-blue-500 hover:underline">
              Register here
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoginModal;