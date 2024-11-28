'use client';

import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, getFirestore } from 'firebase/firestore';
import Link from 'next/link'; // Import Link for client-side navigation
import Navbar from '../../components/navbar'; // Import the reusable Navbar component


const Login: React.FC = () => {
  const [input, setInput] = useState(''); // Holds either the username or email
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false); // Track if we're on the client
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const router = useRouter();
  const db = getFirestore();

  // Ensure the component is mounted on the client
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
    }
  };
  

  // Avoid rendering during SSR to prevent hydration mismatch
  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Navbar />
      <form onSubmit={handleLogin} className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-black">Login</h2>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <input
          type="text"
          placeholder="Username or Email"
          className="w-full p-3 mb-4 border rounded text-black"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 border rounded text-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:bg-gray-400"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        {/* Link to register page */}
        <div className="mt-4 text-center">
          <p className="text-sm text-black">
            Don&apos;t have an account?{' '}
            <Link href="../../pages/register" className="text-blue-500 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
