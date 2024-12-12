'use client';

import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, getFirestore } from 'firebase/firestore';
import Link from 'next/link'; // Import Link for client-side navigation
import { FaHome } from 'react-icons/fa'; // Import the house icon

const Login: React.FC = () => {
  const [input, setInput] = useState(''); // Holds either the username or email
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false); // Track if we're on the client
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [showForgotPassword, setShowForgotPassword] = useState(false); // Modal visibility
  const [resetEmail, setResetEmail] = useState(''); // Email for password reset
  const [successMessage, setSuccessMessage] = useState(''); // Success message for password reset
  const router = useRouter();
  const db = getFirestore();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Start loading
    setError(''); // Clear previous errors

    try {
      let emailToUse = input;

      if (!input.includes('@')) {
        // Treat input as a username, query Firestore
        const userQuery = query(collection(db, 'users'), where('username', '==', input));
        const querySnapshot = await getDocs(userQuery);

        if (!querySnapshot.empty) {
          emailToUse = querySnapshot.docs[0].data().email; // Fetch associated email
        } else {
          throw new Error('Username not found');
        }
      }

      // Sign in with the resolved email
      await signInWithEmailAndPassword(auth, emailToUse, password);

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
      setSuccessMessage('Password reset email sent! Please check your inbox.');
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
    <div className="flex justify-center items-center min-h-screen relative">
      <form onSubmit={handleLogin} className=" bg-white p-5 rounded-2xl border-2 border-gray-200 shadow-lg w-96">
        <h2 className="text-4xl font-bold mb-4 text-black">Welcome Back</h2>
        <p className="mb-8 font-medium text-lg text-gray-600">Welcome Back! Please enter your details.</p>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        {successMessage && <p className="text-green-500 text-sm mb-2">{successMessage}</p>}

        <input
          type="text"
          placeholder="Username or Email"
          className="w-full p-3 mb-4 border-2 border-gray-100 rounded-xl text-black bg-transparent"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 border-2 border-gray-100 rounded-xl text-black bg-transparent"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {/* Forgot Password Link */}
        <div className="mb-4 text-start">
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-sm text-customBlue hover:underline"
          >
            Forgot Password?
          </button>
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-customBlue font-bold text-lg text-white rounded-xl disabled:bg-gray-400 active:scale-[.98] active:duration-75 transition-all hover:scale-[1.03] ease-in-out"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        {/* Link to register page */}
        <div className="mt-4 text-center">
          <p className="text-black font-medium text-base">
            Don&apos;t have an account?{' '}
            <Link href="../../pages/register" className="ml-2 text-customBlue hover:underline font-medium">
              Register
            </Link>
          </p>
        </div>
      </form>

      {/* Floating Home Button */}
      <button
        onClick={() => router.push('/')}
        className="fixed bottom-10 right-10 bg-customBlue p-6 rounded-full shadow-lg text-white hover:bg-customOrange transition ease-in-out duration-300"
      >
        <FaHome size={28} />
      </button>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4 text-black text-center">Forgot Password</h2>
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <form onSubmit={handleForgotPassword}>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full p-3 mb-4 border rounded text-black"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
              <div className="flex justify-between">
                <button
                  type="submit"
                  className="px-4 py-2 bg-customBlue text-white rounded active:scale-[.98] active:duration-75 transition-all hover:scale-[1.05] ease-in-out"
                >
                  Send Reset Link
                </button>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
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
