"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { FaUserCircle } from "react-icons/fa";

const Navbar: React.FC = () => {
  const router = useRouter();
  const { user, admin } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownVisible(false);
      }
    };

    if (dropdownVisible) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [dropdownVisible]);

  const handleNavigation = (link: string) => {
    if (link === "Home") {
      router.push("/");
    } else {
      router.push(`/pages/${link.toLowerCase().replace(" ", "-")}`);
    }
  };

  const handleGameNavigation = () => {
    if (user) {
      router.push("/pages/game");
    } else {
      alert("You must be logged in to play the game.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowLogoutModal(false);
      router.push("/");
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-md p-4 flex justify-between items-center">
      {/* Logo */}
      <button
        onClick={() => handleNavigation("Home")}
        className="text-white font-bold text-2xl tracking-wide hover:opacity-80 transition"
      >
        Learn & Earn
      </button>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => handleNavigation("Store")}
          className="text-white font-semibold hover:underline transition"
        >
          Store
        </button>

        <button
          onClick={handleGameNavigation}
          className="px-5 py-2 bg-yellow-400 text-black font-semibold rounded-lg shadow-md hover:bg-yellow-300 transition"
        >
          Play Game
        </button>

        <button
          onClick={() => handleNavigation("earn-more")}
          className="text-white font-semibold hover:underline transition"
        >
          Earn More
        </button>
      </div>

      {/* Right Side: Auth Buttons or User Dropdown */}
      <div className="relative">
        {user ? (
          <div>
            <button
              onClick={() => setDropdownVisible((prev) => !prev)}
              className="text-white text-2xl"
            >
              <FaUserCircle />
            </button>
            {dropdownVisible && (
              <div
                ref={dropdownRef}
                className="absolute right-0 mt-3 w-48 bg-white shadow-lg rounded-lg border transition-opacity"
              >
                <button
                  onClick={() => router.push("/pages/profile")}
                  className="block px-4 py-2 text-left text-gray-700 hover:bg-gray-100 w-full"
                >
                  Profile
                </button>

                {admin && (
                  <button
                    onClick={() => router.push("/pages/admin")}
                    className="block px-4 py-2 text-left text-gray-700 hover:bg-gray-100 w-full"
                  >
                    Admin Page
                  </button>
                )}

                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="block px-4 py-2 text-left text-red-600 hover:bg-gray-100 w-full"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex space-x-4">
            <button
              onClick={() => router.push("/pages/login")}
              className="px-4 py-2 text-white border border-white rounded-lg hover:bg-white hover:text-blue-600 transition"
            >
              Login
            </button>
            <button
              onClick={() => router.push("/pages/register")}
              className="px-5 py-2 bg-yellow-400 text-black font-semibold rounded-lg shadow-md hover:bg-yellow-300 transition"
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
            <h2 className="text-xl font-semibold text-center mb-4 text-black">
              Are you sure you want to log out?
            </h2>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Yes
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
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
