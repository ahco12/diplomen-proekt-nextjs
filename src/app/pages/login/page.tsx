'use client'; // This is a client-side component

import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import { useRouter } from 'next/navigation';  // Use next/navigation for routing
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import Link from 'next/link';  // Use Next.js Link for navigation

const Login: React.FC = () => {
  const [input, setInput] = useState<string>('');  // This will hold either the username or email
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isClient, setIsClient] = useState<boolean>(false); // Track whether we're on the client side
  const router = useRouter();  // Navigation hook from next/navigation
  const db = getFirestore();

  // UseEffect to ensure certain code only runs on the client side
  useEffect(() => {
    setIsClient(true);  // Set to true after the component mounts
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let emailToUse = input;

      // Check if the input is an email or a username
      if (!input.includes('@')) {
        // If input doesn't contain "@", it's treated as a username, so we query Firestore
        const userQuery = await getDoc(doc(db, 'users', input)); // using username as userID
        if (userQuery.exists()) {
          emailToUse = userQuery.data().email; // Get the email associated with the username
        } else {
          throw new Error('Username not found');
        }
      }

      // Log the user in with the email and password
      const userCredential = await signInWithEmailAndPassword(auth, emailToUse, password);
      const user = userCredential.user;

      // After successful login, optionally fetch username or other user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('Logged in user:', userData); // Use this data for further functionality
      }

      // Redirect to homepage after successful login
      router.push('/');  // Use next/navigation to redirect to the homepage
    } catch (err) {
      // Handle error correctly
      if (err instanceof Error) {
        setError(err.message);  // Display the error message
      } else {
        setError('An unknown error occurred');  // Handle non-Error cases
      }
    }
  };

  if (!isClient) {
    return null;  // Return null during SSR to avoid hydration mismatch
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <input
          type="text"
          placeholder="Username or Email"
          className="w-full p-3 mb-4 border rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="w-full py-3 bg-blue-500 text-white rounded hover:bg-blue-600">
          Login
        </button>

        {/* Link to register page */}
        <div className="mt-4 text-center">
          <p className="text-sm">
            Dont have an account?{' '}
            <Link href="/register" className="text-blue-500 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
