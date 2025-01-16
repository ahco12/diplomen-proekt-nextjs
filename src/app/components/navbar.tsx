'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const Navbar: React.FC = () => {
  const router = useRouter();

  // Navigation function
  const handleNavigation = (link: string) => {
    if (link === 'Home') {
      router.push('/');
    } else {
      router.push(`/pages/${link.toLowerCase().replace(' ', '-')}`);
    }
  };

  return (
    <div className="bg-orange-500 py-4 px-8 flex justify-between items-center">
      {/* Left Side: Logo */}
      <button
        onClick={() => handleNavigation('Home')}
        className="text-customGrey font-bold text-xl border-2 border-customGrey rounded-lg px-4 py-2 hover:text-black hover:border-black transition ease-in-out duration-300"      >
        Learn & Earn
      </button>

      {/* Center: Navigation Links */}
      <div className="flex items-center text-customOrange rounded-full shadow-lg">
        {/* Store Button */}
        <button
          onClick={() => handleNavigation('Store')}
          className="px-10 py-3 rounded-l-lg bg-customGrey hover:bg-black transition"
        >
          Store
        </button>

        {/* Play Game Button */}
        <button
          onClick={() => handleNavigation('game')}
          className="px-14 py-5 font-semibold bg-customGrey rounded-lg hover:bg-black transition border-gray-700"
        >
          Play game
        </button>

        {/* EarnMore Button */}
        <button
          onClick={() => handleNavigation('earn-more')}
          className="px-10 py-3 rounded-r-lg bg-customGrey hover:bg-black transition-all ease-in-out"
        >
          Earn More
        </button>
      </div>

      {/* Right Side: Auth Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={() => handleNavigation('Login')}
          className="px-5 py-3  text-black border-2 border-black rounded-lg hover:bg-black hover:text-customOrange transition ease-in-out duration-300"
        >
          Log in
        </button>
        <button
          onClick={() => handleNavigation('Register')}
          className="px-9 py-3 bg-customGrey text-customOrange rounded-lg hover:bg-black transition ease-in-out duration-300"
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default Navbar;
