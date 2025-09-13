import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const { data } = await register({ username, password });
//       login(data); // Automatically log in after registration
//       navigate('/products');
//     } catch (error) {
//       alert('Registration failed. User might already exist.');
//     }
//   };
    const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await register({ username, password });
      login(data); // Automatically log in after registration
      navigate('/products');
    } catch (error) {
      // Check if the server sent a specific error message
      if (error.response && error.response.data && error.response.data.message) {
        // Display the server's message (e.g., "User already exists")
        alert(error.response.data.message);
      } else {
        // Fallback for other types of errors
        alert('Registration failed. Please try again.');
      }
    }
};

  return (
    <div className="container mx-auto max-w-sm mt-20">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required className="w-full p-2 mb-4 border rounded" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="w-full p-2 mb-4 border rounded" />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Register</button>
      </form>
    </div>
  );
};

export default Register;