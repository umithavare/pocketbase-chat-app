// pages/login.tsx
"use client";
import { useState, useEffect } from 'react';
import pb from '../../services/pocketbase';
import { useRouter } from 'next/navigation';
import { Snackbar, Alert, Avatar } from '@mui/material';

export default function LoginPage() {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [severity, setSeverity] = useState<'error' | 'success'>('success');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      router.push('/conversations');
    }
  }, [router]);

  const handleLogin = async () => {
    if (username.trim() === '' || password.trim() === '') {
      setErrorMessage('Username and password are required.');
      setSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    try {
      const authData = await pb.collection('users').authWithPassword(username, password);
      localStorage.setItem('auth_token', authData.token);

      const user_record = JSON.stringify(authData.record);
      localStorage.setItem('user_record', user_record);
      setSuccessMessage('Login successful!');
      setSeverity('success');
      setOpenSnackbar(true);
      setTimeout(() => {
        router.push('/conversations');
      }, 2000);
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Invalid username or password. Please try again.');
      setSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-gray-200">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full relative">
        <Avatar
          src="/assets/app-icon.png"
          alt="Chat App Logo"
          sx={{
            width: 80,
            height: 80,
            position: 'absolute',
            top: '-40px',
            left: 'calc(50% - 40px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          }}
        />
        <h2 className="text-3xl font-bold mt-12 mb-6 text-center text-white">Login</h2>
        <div className="mb-4">
          <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Login
        </button>
      </div>
      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={severity} sx={{ width: '100%' }}>
          {severity === 'error' ? errorMessage : successMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}