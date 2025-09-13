import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// 1. Import 'login' from the API service and rename it to 'apiLogin' to avoid conflicts.
import { login as apiLogin } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  // 2. This 'login' function comes from our AuthContext. It's used to update the app state.
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 3. Call the renamed API function 'apiLogin'.
      const { data } = await apiLogin({ username, password });
      
      // 4. On success, call the context's login function with the user data.
      login(data);
      
      // 5. Navigate to a protected page.
      navigate('/products');
    } catch (error) {
      // 6. Provide a correct error message for a failed login.
      alert('Login failed. Please check your username and password.');
      console.error("Login error:", error);
    }
  };

  return (
    <div className="container mx-auto max-w-sm mt-20">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg">
        {/* 7. Update the UI text to "Login". */}
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required className="w-full p-2 mb-4 border rounded" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="w-full p-2 mb-4 border rounded" />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Login</button>
      </form>
    </div>
  );
};

export default Login;