import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { login } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import { X } from 'lucide-react';
import FloatingLabelInput from './FloatingLabelInput';

const GlobalLoginModal = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const { isLoginModalOpen, closeLoginModal } = useModal(); // Use the new modal context

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await login({ username, password });
      auth.login(data);
      toast.success("Login successful!");
      closeLoginModal(); // Close the modal on successful login
    } catch (error) {
      toast.error("Invalid username or password.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Prevents closing the modal when clicking inside the form area
  const stopPropagation = (e) => e.stopPropagation();

  const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
  const modalVariants = { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } };

  return (
    <AnimatePresence>
      {isLoginModalOpen && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={closeLoginModal} // Close when clicking the backdrop
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div variants={modalVariants} onClick={stopPropagation} className="glass-card w-full max-w-md p-8 relative">
            {/* --- CLOSE BUTTON --- */}
            <button onClick={closeLoginModal} className="absolute top-4 right-4 text-gray-500 hover:text-white">
              <X size={24} />
            </button>

            <h2 className="text-3xl font-bold mb-6 text-center">Login Required</h2>
            <form onSubmit={handleLogin} className="space-y-6">
              <FloatingLabelInput id="modal-username" label="Username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
              <FloatingLabelInput id="modal-password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <motion.button type="submit" disabled={isLoading} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-lg flex items-center justify-center text-lg">
                {isLoading ? <ClipLoader color="#ffffff" size={24} /> : 'Login'}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalLoginModal;