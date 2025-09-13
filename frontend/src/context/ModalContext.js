import React, { createContext, useState, useContext, useCallback } from 'react';

// Create the context
const ModalContext = createContext();

// Create the provider component
export const ModalProvider = ({ children }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Use useCallback to prevent unnecessary re-renders of consuming components
  const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);

  return (
    <ModalContext.Provider value={{ isLoginModalOpen, openLoginModal, closeLoginModal }}>
      {children}
    </ModalContext.Provider>
  );
};

// Create a custom hook for easy access to the context
export const useModal = () => useContext(ModalContext);