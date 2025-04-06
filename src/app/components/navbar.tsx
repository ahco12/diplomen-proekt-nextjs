"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { FaUserCircle, FaCoins, FaGamepad, FaStore } from "react-icons/fa";
import { toast } from "react-hot-toast";

const Navbar: React.FC = () => {
  const router = useRouter();
  const { user, admin } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      router.push(`/${link.toLowerCase().replace(" ", "-")}`);
    }
  };

  const handleGameNavigation = () => {
    if (user) {
      router.push("/game");
    } else {
      toast.error("Трябва да сте влезнали в профила за да продължите.", {
        position: "top-center",
      });
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
      <div className="max-w-full mx-auto">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <button
            onClick={() => handleNavigation("Home")}
            className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200 font-bold text-xl md:text-2xl tracking-wide hover:opacity-80 transition flex items-center gap-2"
          >
            <FaGamepad className="text-yellow-400" />
            <span className="hidden sm:inline">Learn & Earn</span>
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-12">
            {/* Store Button */}
            <button
              onClick={() => handleNavigation("Store")}
              className="flex items-center text-lg gap-2 text-blue-200 hover:text-yellow-400 transition-colors duration-300 hover:underline decoration-2 underline-offset-4"
            >
              <FaStore />
              <span>Магазин</span>
            </button>

            {/* Centered Play Game Button */}
            <button
              onClick={handleGameNavigation}
              className="relative px-8 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold rounded-lg shadow-lg 
                     hover:from-yellow-500 hover:to-yellow-600 transform hover:scale-105 transition-all duration-300
                     text-xl z-10"
            >
              Играй
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg blur opacity-30 group-hover:opacity-50" />
            </button>

            {/* Earn More Button */}
            <button
              onClick={() => handleNavigation("earn-more")}
              className="flex items-center text-lg gap-2 text-blue-200 hover:text-yellow-400 transition-colors duration-300 hover:underline decoration-2 underline-offset-4"
            >
              <FaCoins />
              <span>Спечели повече</span>
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="absolute top-16 left-0 right-0 bg-[#1a1740] shadow-lg md:hidden z-50">
              <div className="flex flex-col p-4 space-y-4">
                <button
                  onClick={() => {
                    handleNavigation("Store");
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 text-blue-200 hover:text-yellow-400"
                >
                  <FaStore />
                  <span>Store</span>
                </button>
                
                <button
                  onClick={() => {
                    handleGameNavigation();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 text-blue-200 hover:text-yellow-400"
                >
                  <FaGamepad />
                  <span>Play Game</span>
                </button>

                <button
                  onClick={() => {
                    handleNavigation("earn-more");
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 text-blue-200 hover:text-yellow-400"
                >
                  <FaCoins />
                  <span>Earn More</span>
                </button>
              </div>
            </div>
          )}

          {/* Auth Buttons */}
          <div className="relative z-10">
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
                      onClick={() => router.push("/profile")}
                      className="block px-4 py-2 text-left text-blue-200 hover:bg-blue-900 w-full transition-colors duration-300"
                    >
                      Профил
                    </button>

                    {admin && (
                      <button
                        onClick={() => router.push("/admin")}
                        className="block px-4 py-2 text-left text-blue-200 hover:bg-blue-900 w-full transition-colors duration-300"
                      >
                        Административна страница
                      </button>
                    )}

                    <button
                      onClick={() => setShowLogoutModal(true)}
                      className="block px-4 py-2 text-left text-red-400 hover:bg-red-900/50 w-full transition-colors duration-300"
                    >
                      Излез
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-2 md:space-x-4">
                <button
                  onClick={() => router.push("/login")}
                  className="px-3 md:px-4 py-2 text-sm md:text-base text-blue-200 border border-blue-400 rounded-lg hover:bg-blue-900/50"
                >
                  Влизане
                </button>
                <button
                  onClick={() => router.push("/register")}
                  className="px-3 md:px-5 py-2 text-sm md:text-base bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold rounded-lg"
                >
                  Регистрация
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Redesigned Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
          <div className="bg-[#1a1740] border border-blue-500 p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-xl font-semibold text-center mb-4 text-blue-200">
              Сигурни ли сте че искате да излезете?
            </h2>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg 
                          hover:from-red-600 hover:to-red-700 transition-colors duration-300"
              >
                Да
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg 
                          hover:from-blue-600 hover:to-blue-700 transition-colors duration-300"
              >
                Не
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
