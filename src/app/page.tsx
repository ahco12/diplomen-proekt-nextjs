'use client'; // This is a client-side component

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Next.js router for navigation
import { useAuth } from './components/AuthProvider'; // Your Auth context to get the user state

const HomePage: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter(); // Safe to use router after the client is mounted
  const { user } = useAuth();

  // Set the isClient state to true after the component is mounted on the client
  useEffect(() => {
    setIsClient(true);  // This runs only on the client side
  }, []);

  const handleGoToMinigame = () => {
    if (!user) {
      alert('You need to log in or create an account first!');
      router.push('./pages/register');  // Redirect to register/login if not authenticated
    } else {
      router.push('./pages/game');  // Redirect to the minigame if authenticated
    }
  };

  const handleGoToStore = () => {
    router.push('./pages/store');  // Navigate to the store page
  };

  const handleLogin = () => {
    router.push('./pages/login');  // Navigate to the login page
  };

  const handleRegister = () => {
    router.push('./pages/register');  // Navigate to the register page
  };

  // Render nothing or loading state until the component is mounted
  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 relative">
      {/* Login and Register buttons at the top right */}
      <div className="absolute top-4 right-4 flex space-x-4">
        <button
          onClick={handleLogin}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Login
        </button>
        <button
          onClick={handleRegister}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
        >
          Register
        </button>
      </div>

      {/* Main Content */}
      <h1 className="text-4xl font-bold mb-8 text-center text-black">Hello and welcome to our game!</h1>
      <div className="flex space-x-4">
        <button
          onClick={handleGoToMinigame}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition"
        >
          Go to Minigame
        </button>
        <button
          onClick={handleGoToStore}
          className="px-6 py-3 bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600 transition"
        >
          Go to Store
        </button>
      </div>
    </div>
  );
};

export default HomePage;
