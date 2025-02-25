'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './components/AuthProvider';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase/firebaseConfig';
import Image from 'next/image';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [userPoints, setUserPoints] = useState<number>(0);

  useEffect(() => {
    if (user) {
      fetchUserPoints();
    }
  }, [user]);

  const fetchUserPoints = async () => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setUserPoints(userDoc.data()?.points || 0);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center p-6">
      {/* Hero Section */}
      <div className="text-center mt-10">
        <h1 className="text-5xl font-extrabold text-blue-400 drop-shadow-md">
          Welcome to the Ultimate Quiz Challenge! 🎮
        </h1>
        <p className="mt-4 text-lg text-gray-300">
          Test your knowledge, earn points, and redeem real rewards!
        </p>
      </div>

      {/* User Stats */}
      {user && (
        <div className="mt-6 p-4 bg-gray-800 rounded-lg shadow-lg flex items-center space-x-4">
          <p className="text-lg">Your Points:</p>
          <span className="text-3xl font-bold text-yellow-400">{userPoints}</span>
        </div>
      )}

      {/* Call to Actions */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <button
          onClick={() => router.push('/quiz')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-xl font-bold shadow-md transition-all"
        >
          🎯 Play Quiz
        </button>
        <button
          onClick={() => router.push('/earn-more')}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-xl font-bold shadow-md transition-all"
        >
          🔢 Earn More (Math Mode)
        </button>
      </div>

      {/* How It Works Section */}
      <div className="mt-14 w-full max-w-4xl text-center">
        <h2 className="text-3xl font-bold text-white mb-6">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-blue-400">🎮 Play & Answer</h3>
            <p className="text-gray-300 mt-2">
              Answer trivia questions and solve math problems to earn points.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-yellow-400">💰 Earn Points</h3>
            <p className="text-gray-300 mt-2">
              The harder the question, the more points you win!
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-green-400">🎁 Redeem Rewards</h3>
            <p className="text-gray-300 mt-2">
              Use your points to claim gift cards and prizes in the store.
            </p>
          </div>
        </div>
      </div>

      {/* Leaderboard & Rewards */}
      <div className="mt-16 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Leaderboard Preview */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold text-yellow-400">🏆 Leaderboard</h3>
          <p className="text-gray-300 mt-2">Top players of the week</p>
          {/* Placeholder for dynamic leaderboard */}
          <div className="mt-4 space-y-2">
            <p className="text-white">🥇 Player1 - 5000 points</p>
            <p className="text-white">🥈 Player2 - 4000 points</p>
            <p className="text-white">🥉 Player3 - 3500 points</p>
          </div>
        </div>

        {/* Rewards Preview */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold text-green-400">🎁 Top Rewards</h3>
          <p className="text-gray-300 mt-2">Check out some of the prizes you can win!</p>
          <div className="mt-4 flex items-center space-x-4">
            <Image src="/gift-card.png" alt="Gift Card" width={50} height={50} />
            <p className="text-white">Amazon Gift Card - 1000 points</p>
          </div>
        </div>
      </div>
    </div>
  );
}
