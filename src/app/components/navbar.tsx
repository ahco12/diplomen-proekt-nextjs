'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { FaUserCircle } from 'react-icons/fa';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig'; // Import Firestore

const Navbar: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // State to track admin status
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch user role from Firestore
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setIsAdmin(userSnap.data().role === 'admin'); // Check if the role is "admin"
        }
      }
    };

    checkAdminStatus();
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownVisible(false);
      }
    };

    if (dropdownVisible) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [dropdownVisible]);

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
      await signOut(auth);
      setShowLogoutModal(false);
      router.push('../');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className="bg-orange-500 py-4 px-8 flex justify-between items-center">
      <button
        onClick={() => handleNavigation('Home')}
        className="text-customGrey font-bold text-xl border-2 border-customGrey rounded-lg px-4 py-2 hover:text-black hover:border-black transition ease-in-out duration-300"
      >
        Learn & Earn
      </button>

      <div className="flex items-center text-customOrange rounded-full shadow-lg">
        <button
          onClick={() => handleNavigation('Store')}
          className="px-10 py-3 rounded-l-lg bg-customGrey hover:bg-black transition"
        >
          Store
        </button>

        <button
          onClick={handleGameNavigation}
          className="px-14 py-5 font-semibold text-xl bg-customGrey rounded-lg hover:bg-black transition border-gray-700"
        >
          Play game
        </button>

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
              <FaUserCircle className="text-2xl" />
            </button>
            {dropdownVisible && (
              <div
                ref={dropdownRef}
                className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg border"
              >
                <button
                  onClick={() => router.push('/pages/profile')}
                  className="block px-4 py-2 text-left text-gray-700 hover:bg-gray-100 w-full"
                >
                  Profile
                </button>

                {/* Admin Page Link (Only for Admins) */}
                {isAdmin && (
                  <button
                    onClick={() => router.push('/pages/admin')}
                    className="block px-4 py-2 text-left text-gray-700 hover:bg-gray-100 w-full"
                  >
                    Admin Page
                  </button>
                )}

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
