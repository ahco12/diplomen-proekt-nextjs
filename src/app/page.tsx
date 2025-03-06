'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './components/AuthProvider';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase/firebaseConfig';
import { FaTrophy, FaCoins, FaStore, FaGamepad } from 'react-icons/fa';

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
    <div className="min-h-screen bg-[#1a1740] bg-gradient-to-b from-[#1a1740] to-[#0d0b24] text-white">
      {/* Hero Section with Millionaire-style design */}
      <div className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/20 z-0">
          <div className="absolute inset-0 bg-[url('/millionaire-bg.webp')] bg-cover bg-[position:0px_600px] opacity-30 mix-blend-overlay"></div>
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-6xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text">
              Learn & Earn
            </span>
          </h1>
          <p className="text-2xl text-blue-300 mb-8">Your Journey to Knowledge and Rewards</p>
          {user && (
            <div className="inline-block bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-6 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <FaCoins className="text-yellow-400 text-3xl animate-pulse" />
                <div>
                  <p className="text-sm text-blue-300">Your Points Balance</p>
                  <p className="text-4xl font-bold text-yellow-400">{userPoints.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Game Modes Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <button
            onClick={() => router.push('./game')}
            className="group relative overflow-hidden rounded-2xl p-[2px] transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl animate-gradient-x"></div>
            <div className="relative bg-[#1a1740] p-8 rounded-2xl h-full transition-transform duration-300 group-hover:scale-[0.99]">
              <FaGamepad className="text-5xl mb-4 text-blue-400" />
              <h3 className="text-2xl font-bold mb-2">Classic Quiz Mode</h3>
              <p className="text-blue-300">Test your knowledge with our millionaire-style quiz!</p>
            </div>
          </button>

          <button
            onClick={() => router.push('./earn-more')}
            className="group relative overflow-hidden rounded-2xl p-[2px] transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-blue-600 to-green-600 rounded-2xl animate-gradient-x"></div>
            <div className="relative bg-[#1a1740] p-8 rounded-2xl h-full transition-transform duration-300 group-hover:scale-[0.99]">
              <FaCoins className="text-5xl mb-4 text-yellow-400" />
              <h3 className="text-2xl font-bold mb-2">Speed Math Challenge</h3>
              <p className="text-blue-300">Quick math problems for quick rewards!</p>
            </div>
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 p-6 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-4">
              <FaTrophy className="text-3xl text-yellow-400" />
              <h3 className="text-xl font-bold">Compete</h3>
            </div>
            <p className="text-blue-300">Challenge yourself and climb the leaderboard!</p>
          </div>

          <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 p-6 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-4">
              <FaCoins className="text-3xl text-yellow-400" />
              <h3 className="text-xl font-bold">Earn</h3>
            </div>
            <p className="text-blue-300">Accumulate points with each correct answer!</p>
          </div>

          <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 p-6 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-4">
              <FaStore className="text-3xl text-yellow-400" />
              <h3 className="text-xl font-bold">Redeem</h3>
            </div>
            <p className="text-blue-300">Exchange points for amazing rewards!</p>
          </div>
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl p-8">
          <h2 className="text-3xl font-bold mb-6 text-center">🏆 Top Champions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Top 3 Players */}
            <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-700/20 p-6 rounded-xl text-center">
              <div className="text-4xl mb-2">🥇</div>
              <p className="font-bold">Player1</p>
              <p className="text-yellow-400">5,000 points</p>
            </div>
            <div className="bg-gradient-to-br from-gray-400/20 to-gray-600/20 p-6 rounded-xl text-center">
              <div className="text-4xl mb-2">🥈</div>
              <p className="font-bold">Player2</p>
              <p className="text-gray-400">4,000 points</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500/20 to-orange-700/20 p-6 rounded-xl text-center">
              <div className="text-4xl mb-2">🥉</div>
              <p className="font-bold">Player3</p>
              <p className="text-orange-400">3,500 points</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
