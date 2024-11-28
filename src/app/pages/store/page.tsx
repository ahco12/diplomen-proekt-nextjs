import React from 'react';
import Navbar from '../../components/navbar'; // Import the reusable Navbar component

const StorePage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Navbar />
      <h1 className="text-3xl font-bold">Welcome to the Store!</h1>
    </div>
  );
};

export default StorePage;