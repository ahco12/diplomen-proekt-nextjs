'use client'; // This is a client-side component

import React from 'react';
import Navbar from '../../components/navbar'; // Import the reusable Navbar component

const GamePage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <Navbar />
      <h1 className="text-3xl font-bold text-black">Welcome to earn more!</h1>
    </div>
  );
};

export default GamePage;
