'use client';

import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaHome, FaUser, FaEnvelope, FaLock } from 'react-icons/fa';

const Register: React.FC = () => {
  const [username, setUsername] = useState<string>(''); // New state for username
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Step 1: Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("User registered successfully:", user.uid);

      // Step 2: Create user document in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        username: username, // Store username
        email: email, 
        points: 0, 
        pointsUsed: 0, 
        createdAt: new Date(),
      });
      console.log("User document created in Firestore.");

      // Step 3: Redirect to homepage
      router.push('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
      console.error("Registration error:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 relative">
        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Създай акаунт</h2>
            <p className="text-sm text-gray-500">Присъедини се и започни да печелиш</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            {/* Username Input */}
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Потребителско име"
                className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {/* Email Input */}
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

            {/* Password Input */}
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

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
            >
              Създай акаунт
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Вече имаш акаунт?{' '}
              <Link href="../login" className="font-medium text-blue-600 hover:text-blue-500">
                Влез
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
    </div>
  );
};

export default Register;