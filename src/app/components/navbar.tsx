"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { FaUserCircle, FaCoins, FaGamepad, FaStore } from "react-icons/fa";

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
    <nav className="bg-gradient-to-r from-[#1a1740] to-[#2a1f6f] shadow-lg p-4">
      <div className="max-w-full mx-auto flex justify-between items-center">
        {/* Logo with left margin */}
        <button
          onClick={() => handleNavigation("Home")}
          className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200 font-bold text-2xl tracking-wide hover:opacity-80 transition flex items-center gap-2 ml-6"
        >
          <FaGamepad className="text-yellow-400" />
          Learn & Earn
        </button>

        {/* Center Navigation Buttons */}
        <div className="flex items-center gap-12 relative">
          {/* Store Button */}
          <button
            onClick={() => handleNavigation("Store")}
            className="flex items-center text-lg gap-2 text-blue-200 hover:text-yellow-400 transition-colors duration-300 hover:underline decoration-2 underline-offset-4"
          >
            <FaStore />
            <span>Store</span>
          </button>

          {/* Centered Play Game Button */}
          <button
            onClick={handleGameNavigation}
            className="relative px-8 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold rounded-lg shadow-lg 
                     hover:from-yellow-500 hover:to-yellow-600 transform hover:scale-105 transition-all duration-300
                     text-xl z-10"
          >
            Play Game
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg blur opacity-30 group-hover:opacity-50" />
          </button>

          {/* Earn More Button */}
          <button
            onClick={() => handleNavigation("earn-more")}
            className="flex items-center text-lg gap-2 text-blue-200 hover:text-yellow-400 transition-colors duration-300 hover:underline decoration-2 underline-offset-4"
          >
            <FaCoins />
            <span>Earn More</span>
          </button>
        </div>

        {/* Right Side: Auth Buttons or User Dropdown with right margin */}
        <div className="relative z-10 mr-6">
          {user ? (
            <div>
              <button
                onClick={() => setDropdownVisible((prev) => !prev)}
                className="flex items-center gap-2 px-4 py-4 border-2 border-yellow-400 rounded-lg text-yellow-400 hover:text-[#2a1f6f] hover:bg-yellow-400 transition-colors duration-300"
              >
                <FaUserCircle className="text-2xl" />
              </button>
              {dropdownVisible && (
                <div
                  ref={dropdownRef}
                  className="absolute right-0 mt-3 w-48 bg-[#1a1740] border border-blue-500 shadow-lg rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => router.push("/pages/profile")}
                    className="block px-4 py-2 text-left text-blue-200 hover:bg-blue-900 w-full transition-colors duration-300"
                  >
                    Profile
                  </button>

                  {admin && (
                    <button
                      onClick={() => router.push("/pages/admin")}
                      className="block px-4 py-2 text-left text-blue-200 hover:bg-blue-900 w-full transition-colors duration-300"
                    >
                      Admin Page
                    </button>
                  )}

                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="block px-4 py-2 text-left text-red-400 hover:bg-red-900/50 w-full transition-colors duration-300"
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
                className="px-4 py-2 text-blue-200 border border-blue-400 rounded-lg hover:bg-blue-900/50 transition-colors duration-300"
              >
                Login
              </button>
              <button
                onClick={() => router.push("/pages/register")}
                className="px-5 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold rounded-lg shadow-md 
                          hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Redesigned Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
          <div className="bg-[#1a1740] border border-blue-500 p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-xl font-semibold text-center mb-4 text-blue-200">
              Are you sure you want to log out?
            </h2>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg 
                          hover:from-red-600 hover:to-red-700 transition-colors duration-300"
              >
                Yes
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg 
                          hover:from-blue-600 hover:to-blue-700 transition-colors duration-300"
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
