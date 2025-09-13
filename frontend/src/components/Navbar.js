
import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {useModal} from '../context/ModalContext'; // Import useModal

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { openLoginModal } = useModal(); // Get the function to open the modal
  const navigate = useNavigate();
  // const handleLogout = () => {
  //   logout();
  //   navigate('/login');
  // };

  const activeLinkStyle = {
    color: '#3b82f6' // Tailwind's blue-500
  };
  const handleLogout = () => {
    logout(); // Log the user out from the AuthContext
    openLoginModal(); // Immediately open the login modal
  };

  const NavItem = ({ to, children }) => (
    <NavLink
      to={to}
      style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
      className="block py-2 text-lg hover:text-blue-500 transition-colors"
      onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
    >
      {children}
    </NavLink>
  );
  
  const mobileMenuVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20 }
  }

  return (
    <nav className="sticky top-0 z-40 glass-card">
      <div className="container mx-auto flex justify-between items-center p-4">
        <NavLink to={user ? "/dashboard" : "/"} className="text-2xl font-bold">Embellish Jewels</NavLink>

        {/* --- Desktop Navigation --- */}
        <div className="hidden md:flex items-center space-x-8 text-lg">
          {user && <NavItem to="/dashboard">Dashboard</NavItem>}
          <NavItem to="/">Create Invoice</NavItem>
          {user && <NavItem to="/products">Products</NavItem>}
          {user && <NavItem to="/invoices">Invoices</NavItem>}
        </div>

        {/* --- Right-side Actions --- */}
        <div className="flex items-center space-x-4">
          <motion.button whileTap={{ scale: 0.8, rotate: 360 }} onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </motion.button>
          
          {user ? (
            <div className="hidden md:block">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 flex items-center gap-2">
                <LogOut size={16} /> Logout
              </motion.button>
            </div>
            ) : (
                <>
                  <Link to="/login" className="font-semibold">Login</Link>
                  <Link to="/register" className="font-semibold">Register</Link>
                </>
          )}

          {/* --- Hamburger Menu Button --- */}
          <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* --- Mobile Menu --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
  variants={mobileMenuVariants}
  initial="hidden"
  animate="visible"
  exit="exit"
  className="md:hidden absolute top-full left-0 w-full p-4 bg-white dark:bg-gray-900 shadow-lg rounded-b-xl"
>

            <div className="flex flex-col items-center space-y-4">
              {user && <NavItem to="/dashboard">Dashboard</NavItem>}
              <NavItem to="/">Create Invoice</NavItem>
              {user && <NavItem to="/products">Products</NavItem>}
              {user && <NavItem to="/invoices">Invoices</NavItem>}
              {user ? (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleLogout} className="w-full bg-red-500 text-white mt-4 px-4 py-2 rounded-lg font-semibold hover:bg-red-600 flex items-center justify-center gap-2">
                  <LogOut size={16} /> Logout
                </motion.button>
              ) : (
                <>
                  <Link to="/login" className="font-semibold">Login</Link>
                  <Link to="/register" className="font-semibold">Register</Link>
                </>

              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

// import React from 'react';
// import { Link, NavLink, useNavigate } from 'react-router-dom';  
// import { useAuth } from '../context/AuthContext';
// import { useTheme } from '../context/ThemeContext';
// import { Sun, Moon, LogOut } from 'lucide-react';
// import { motion } from 'framer-motion';

// const Navbar = () => {
//   const { user, logout } = useAuth();
//   const { theme, toggleTheme } = useTheme();
//   const navigate = useNavigate();
//   const handleLogout = () => {
//     logout();
//     navigate('/login');
//   };
  
//   const activeLinkStyle = {
//     color: '#3b82f6' // blue-500
//   };

//   return (
//     <nav className="sticky top-0 z-50 glass-card">
//       <div className="container mx-auto flex justify-between items-center p-4">
//         <NavLink to="/" className="text-2xl font-bold">Embellish Jewels</NavLink>
//         <div className="hidden md:flex items-center space-x-8 text-lg">
//           {user && <NavLink to="/dashboard" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="hover:text-blue-500 transition-colors">Dashboard</NavLink>}
//           <NavLink to="/" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="hover:text-blue-500 transition-colors">Create Invoice</NavLink>
//           {user && <NavLink to="/products" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="hover:text-blue-500 transition-colors">Products</NavLink>}
//           {user && <NavLink to="/invoices" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="hover:text-blue-500 transition-colors">Invoices</NavLink>}
//         </div>
//         <div className="flex items-center space-x-4">
//           <motion.button whileTap={{ scale: 0.8, rotate: 360 }} onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
//             {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
//           </motion.button>
//           {user ? (
//             <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 flex items-center gap-2">
//               <LogOut size={16}/> Logout
//             </motion.button>
//             ) : (
//             <>
//             <Link to="/login" className="font-semibold">Login</Link>
//             <Link to="/register" className="font-semibold">Register</Link>
//             </>
//           )}
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;

// import React from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { useTheme } from '../context/ThemeContext'; // Import useTheme
// import { Sun, Moon } from 'lucide-react'; // Import icons

// const Navbar = () => {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
  
//   const { theme, toggleTheme } = useTheme(); // Use theme context

//   const handleLogout = () => {
//     logout();
//     navigate('/login');
//   };

//   return (
//     // <nav className="bg-gray-800 text-white p-4 shadow-md">
//     //   <div className="container mx-auto flex justify-between items-center">
//     //     <Link to="/" className="text-xl font-bold">Emebllish Jewels</Link>
//     //     <div>
//     //       <Link to="/" className="px-3 hover:text-gray-300">Create Invoice</Link>
//     //       {user && <Link to="/products" className="px-3 hover:text-gray-300">Products</Link>}
//     //       {user && <Link to="/invoices" className="px-3 hover:text-gray-300">Invoices</Link>}
//     //     </div>
//     //     <div>
//     //       {user ? (
//     //         <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded hover:bg-red-600">
//     //           Logout
//     //         </button>
//     //       ) : (
//     //         <>
//     //           <Link to="/login" className="px-3 hover:text-gray-300">Login</Link>
//     //           <Link to="/register" className="px-3 hover:text-gray-300">Register</Link>
//     //         </>
//     //       )}
//     //     </div>
//     //   </div>
//     // </nav>
//      <nav className="sticky top-0 z-50 glass-card">
//       <div className="container mx-auto flex justify-between items-center p-4">
//         <Link to="/" className="text-2xl font-bold">Embellish Jewels</Link>
//         <div className="hidden md:flex items-center space-x-6 text-lg">
//           <Link to="/" className="hover:text-blue-400">Create Invoice</Link>
//           {user && <Link to="/products" className="hover:text-blue-400">Products</Link>}
//           {user && <Link to="/invoices" className="hover:text-blue-400">Invoices</Link>}
//         </div>
//         <div className="flex items-center space-x-4">
//           <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
//             {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
//           </button>
//           {user ? (
//             <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600">
//               Logout
//             </button>
//           ) : (
//             <>
//             <Link to="/login" className="font-semibold">Login</Link>
//             <Link to="/register" className="font-semibold">Register</Link>
//             </>
//           )}
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;
