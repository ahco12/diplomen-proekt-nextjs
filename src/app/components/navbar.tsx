'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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
  const pathname = usePathname(); // Get the current pathname
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

  const handleCancelLogout = () => {
    setShowLogoutModal(false); // Close the modal without logging out
  };

  const handleNavigation = (link: string) => {
    router.push(`/pages/${link.toLowerCase().replace(' ', '-')}`); // Navigate to the correct page
  };

  // Get active link from the current pathname
  const getActiveLink = (link: string) => {
    const linkPath = `/pages/${link.toLowerCase().replace(' ', '-')}`;
    return pathname === linkPath;
  };

  return (
    <nav className="bg-orange-500 py-4 shadow-md fixed top-0 left-0 w-full z-10">
      <div className="container mx-auto flex justify-between items-center px-4">
        {/* Logo */}
        <h1
          className="text-white text-xl font-bold cursor-pointer bg-orange-600 px-4 py-2 rounded-md"
          onClick={() => router.push('/')}
        >
          Learn & Earn
        </h1>

        {/* Oval Navigation Links */}
        <div className="bg-white px-6 py-2 rounded-full flex items-center space-x-8 shadow-md">
          {['Store', 'Game', 'Earn More'].map((link) => (
            <button
              key={link}
              onClick={() => handleNavigation(link)}
              className={`text-orange-500 px-4 py-2 rounded-lg transition relative hover:scale-105 ${
                getActiveLink(link)
                  ? 'border border-orange-500 scale-105 shadow-md text-orange-600 font-semibold bg-orange-100'
                  : ''
              } ${link === 'Game' ? 'text-lg font-bold' : ''}`}
            >
              {link}
            </button>
          ))}
        </div>

        {/* Right Side: Auth Buttons or Dropdown */}
        <div className="relative">
          {user ? (
            <div>
              <button
                onClick={() => setDropdownVisible((prev) => !prev)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                {username || 'User'}
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
                className="px-4 py-2 bg-white text-orange-500 border border-orange-500 rounded-lg hover:bg-orange-500 hover:text-white transition"
              >
                Login
              </button>
              <button
                onClick={() => router.push('/pages/register')}
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
    </nav>
  );
};

export default Navbar;
