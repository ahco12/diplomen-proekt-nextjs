'use client';

import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaHome, FaEnvelope, FaLock } from 'react-icons/fa';

const Login: React.FC = () => {
  const [email, setEmail] = useState(''); // Holds the email
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false); // Track if we're on the client
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [showForgotPassword, setShowForgotPassword] = useState(false); // Modal visibility
  const [resetEmail, setResetEmail] = useState(''); // Email for password reset
  const [successMessage, setSuccessMessage] = useState(''); // Success message for password reset
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Start loading
    setError(''); // Clear previous errors

    try {
      // Sign in with email and password
      await signInWithEmailAndPassword(auth, email, password);

      // Navigate to the homepage after successful login
      router.push('/');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message); // Display the error message
      } else {
        setError('An unknown error occurred'); // Handle non-Error cases
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setSuccessMessage(''); // Clear previous success messages

    try {
      if (!resetEmail) {
        throw new Error('Please enter a valid email.');
      }

      await sendPasswordResetEmail(auth, resetEmail);
      setSuccessMessage('Беше изпратен имейл за промяна на паролата! Моля проверете имейла си.');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred while sending the password reset email.');
      }
    }
  };

  // Avoid rendering during SSR to prevent hydration mismatch
  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 relative">
        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Здравейте отново</h2>
            <p className="text-sm text-gray-500">Моля влезте в акаунта си</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-50 text-green-500 p-3 rounded-lg text-sm mb-4">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="Имейл"
                  className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  placeholder="Парола"
                  className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                Забравена парола?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Влизане...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Нямате акаунт?{' '}
              <Link href="../register" className="font-medium text-blue-600 hover:text-blue-500">
                Направете си акаунт.
              </Link>
            </p>
          </div>
        </div>

        {/* Home Button */}
        <button
          onClick={() => router.push('/')}
          className="fixed bottom-8 right-8 bg-white p-4 rounded-full shadow-lg text-blue-600 hover:text-blue-500 hover:shadow-xl transition-all duration-300"
        >
          <FaHome size={24} />
        </button>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md transform transition-all">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Промени паролата си</h3>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="Въведете имейл адреса си"
                  className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Прати Reset Link.
                </button>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Откажи
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;