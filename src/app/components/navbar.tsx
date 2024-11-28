'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider'; // Your Auth context to get the user state
import { auth } from '../firebase/firebaseConfig'; // Firebase auth
import { signOut } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore'; // Firestore functions

const Navbar: React.FC = () => {
  const [username, setUsername] = useState<string | null>(null); // Username state
  const [dropdownVisible, setDropdownVisible] = useState(false); // Dropdown visibility
  const [showLogoutModal, setShowLogoutModal] = useState(false); // Modal visibility for logout confirmation
  const { user } = useAuth(); // Auth context to check if the user is logged in
  const router = useRouter();
  const db = getFirestore();

  // Fetch username from Firestore if the user is logged in
  useEffect(() => {
    const fetchUsername = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUsername(userDoc.data().username || null);
        }
      }
    };
    fetchUsername();
  }, [user, db]);

  const handleLogout = async () => {
    try {
      await signOut(auth); // Log out the user
      setShowLogoutModal(false); // Close the modal
      router.push('../'); // Redirect to home page
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const handleProfile = () => {
    router.push('../pages/profile'); // Navigate to profile page
  };

  const toggleDropdown = () => {
    setDropdownVisible((prev) => !prev); // Toggle dropdown visibility
  };

  const handleLogin = () => {
    router.push('../pages/login'); // Navigate to login page
  };

  const handleRegister = () => {
    router.push('../pages/register'); // Navigate to register page
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false); // Close the modal without logging out
  };

  return (
    <nav className="bg-orange-500 py-4 shadow-md fixed top-0 left-0 w-full z-10">
      <div className="container mx-auto flex justify-between items-center px-4">
        {/* Logo or Title */}
        <h1 className="text-white text-xl font-bold cursor-pointer" onClick={() => router.push('/')}>
          Learn & Earn
        </h1>

        {/* Right side: Login/Register or Username with Dropdown */}
        <div className="relative">
          {user ? (
            <div>
              <button
                onClick={toggleDropdown}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                {username || 'User'}
              </button>
              {dropdownVisible && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg border">
                  <button
                    onClick={handleProfile}
                    className="block px-4 py-2 text-left text-gray-700 hover:bg-gray-100 w-full"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => setShowLogoutModal(true)} // Show the logout confirmation modal
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
                onClick={handleLogin}
                className="px-4 py-2 bg-white text-orange-500 border border-orange-500 rounded-lg hover:bg-orange-500 hover:text-white transition"
              >
                Login
              </button>
              <button
                onClick={handleRegister}
                className="px-4 py-2 bg-white text-orange-500 border border-orange-500 rounded-lg hover:bg-orange-500 hover:text-white transition"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-xl font-semibold text-center mb-4">Are you sure you want to log out?</h2>
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
    </nav>
  );
};

export default Navbar;
