'use client'; // This is a client-side component

import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig'; // Adjust this path to your Firebase configuration
import { useRouter } from 'next/navigation'; // Next.js router for navigation
import { doc, setDoc, getFirestore } from 'firebase/firestore';
import Link from 'next/link'; // Import Link for client-side navigation
import Navbar from '../../components/navbar'; // Import the reusable Navbar component


const Register: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [error, setError] = useState<string>('');
  const router = useRouter();
  const db = getFirestore();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Store the username in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        username,
        email,
      });
  
      // Redirect to homepage after successful registration
      router.push('/'); // Navigate to the homepage
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  return (
    
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Navbar />
      <form onSubmit={handleRegister} className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-black">Register</h2>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <input
          type="text"
          placeholder="Username"
          className="w-full p-3 mb-4 border rounded text-black"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 border rounded text-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 border rounded text-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" className="w-full py-3 bg-blue-500 text-white rounded hover:bg-blue-600">
          Register
        </button>

        {/* Link to login page */}
        <div className="mt-4 text-center">
          <p className="text-sm text-black">
            Already have an account?{' '}
            <Link href="../../pages/login" className="text-blue-500 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Register;
