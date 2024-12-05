'use client';

import React from 'react';
import Navbar from './components/navbar'; // Import the reusable Navbar component
import { useRouter } from 'next/navigation'; // Next.js router for navigation
import { useAuth } from './components/AuthProvider'; // Your Auth context to get the user state

const HomePage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();

  const handleGoToMinigame = () => {
    if (!user) {
      alert('You need to log in or create an account first!');
      router.push('./pages/register'); // Redirect to register/login if not authenticated
    } else {
      router.push('./pages/game'); // Redirect to the minigame if authenticated
    }
  };

  const handleGoToStore = () => {
    router.push('./pages/store'); // Navigate to the store page
  };

  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
        <h1 className="text-4xl font-bold mb-8 text-center text-black">
          Hello and welcome to our game!
        </h1>
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
    </div>
  );
};

export default HomePage;
