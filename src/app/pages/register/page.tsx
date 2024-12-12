'use client'; // This is a client-side component

import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig'; // Adjust this path to your Firebase configuration
import { useRouter } from 'next/navigation'; // Next.js router for navigation
import { doc, setDoc, getFirestore } from 'firebase/firestore';
import Link from 'next/link'; // Import Link for client-side navigation
import { FaHome } from 'react-icons/fa'; // Import the house icon


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
    
    <div className="flex justify-center items-center min-h-screen">
      <form onSubmit={handleRegister} className="bg-white p-5 rounded-2xl border-2 border-gray-200 shadow-lg w-96">
        <h2 className="text-4xl font-bold mb-4 text-black flex justify-center">Register</h2>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <input
          type="text"
          placeholder="Username"
          className="w-full p-3 mb-4 border-2 border-gray-100 rounded-xl text-black bg-transparent"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 border-2 border-gray-100 rounded-xl text-black bg-transparent"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 border-2 border-gray-100 rounded-xl text-black bg-transparent"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" className="w-full py-3 bg-customBlue font-bold text-lg text-white rounded-xl disabled:bg-gray-400 active:scale-[.98] active:duration-75 transition-all hover:scale-[1.03] ease-in-out">
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

      {/* Floating Home Button */}
      <button
        onClick={() => router.push('/')}
        className="fixed bottom-10 right-10 bg-customBlue p-6 rounded-full shadow-lg text-white hover:bg-customOrange transition ease-in-out duration-300"
      >
        <FaHome size={28} />
      </button>
    </div>
  );
};

export default Register;
