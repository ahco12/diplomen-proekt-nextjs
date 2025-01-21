'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase/firebaseConfig'; // Firebase auth and Firestore
import { doc, getDoc } from 'firebase/firestore';

const Navbar: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsername = async () => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUsername(userDoc.data().username);
        }
      }
    };

    fetchUsername();
  }, [user]);

  // Navigation function
  const handleNavigation = (link: string) => {
    if (link === 'Home') {
      router.push('/');
    } else {
      router.push(`/pages/${link.toLowerCase().replace(' ', '-')}`);
    }
  };

  const handleGameNavigation = () => {
    if (user) {
      router.push('/pages/game');
    } else {
      alert('You must be logged in to play the game.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth); // Log out the user
      setShowLogoutModal(false); // Close the modal
      router.push('../'); // Redirect to home page
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className="bg-orange-500 py-4 px-8 flex justify-between items-center">
      {/* Left Side: Logo */}
      <button
        onClick={() => handleNavigation('Home')}
        className="text-customGrey font-bold text-xl border-2 border-customGrey rounded-lg px-4 py-2 hover:text-black hover:border-black transition ease-in-out duration-300"
      >
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
          onClick={handleGameNavigation}
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

      {/* Right Side: Auth Buttons or Dropdown */}
      <div className="relative">
        {user ? (
          <div>
            <button
              onClick={() => setDropdownVisible((prev) => !prev)}
              className="px-5 py-3 text-black border-2 border-black rounded-lg hover:bg-black hover:text-customOrange transition ease-in-out duration-300"
            >
              {username || user.email}
            </button>
            {dropdownVisible && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg border">
                <button
                  onClick={() => router.push('/pages/profile')}
                  className="block px-4 py-2 text-left text-gray-700 hover:bg-gray-100 w-full"
                >
                  Profile
                </button>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="block px-4 py-2 text-left text-gray-700 hover:bg-gray-100 w-full"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex space-x-4">
            <button
              onClick={() => router.push('/pages/login')}
              className="px-5 py-3 text-black border-2 border-black rounded-lg hover:bg-black hover:text-customOrange transition ease-in-out duration-300"
            >
              Login
            </button>
            <button
              onClick={() => router.push('/pages/register')}
              className="px-9 py-3 bg-customGrey text-customOrange rounded-lg hover:bg-black transition ease-in-out duration-300"
            >
              Register
            </button>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-xl font-semibold text-center mb-4 text-black">Are you sure you want to log out?</h2>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Yes
              </button>
              <button
                onClick={handleCancelLogout}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
