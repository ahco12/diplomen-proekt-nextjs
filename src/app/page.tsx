'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './components/AuthProvider';
import { doc, getDoc, getDocs, collection, query, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase/firebaseConfig';
import { FaTrophy, FaCoins, FaStore, FaGamepad, FaCrown } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';

interface LeaderboardEntry {
  id: string;
  username: string;
  points: number;
}

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [userPoints, setUserPoints] = useState<number>(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  // Memoize fetchUserPoints to avoid redefinition on every render
  const fetchUserPoints = useCallback(async () => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setUserPoints(userDoc.data()?.points || 0);
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUserPoints();
    }
    fetchLeaderboard();
  }, [user, fetchUserPoints]); // Include fetchUserPoints in the dependency array

  const fetchLeaderboard = async () => {
    try {
      const leaderboardQuery = query(
        collection(db, 'users'),
        orderBy('points', 'desc'),
        limit(6) // Limit to top 6 players
      );
      const querySnapshot = await getDocs(leaderboardQuery);

      const leaderboardData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        username: doc.data().username || 'Anonymous',
        points: doc.data().points || 0,
      }));

      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const handleGameModeClick = (path: string) => {
    if (!user) {
      toast.error('Моля влезте в профила си за да продължите!', {
        style: {
          background: '#EF4444',
          color: 'white',
        },
        duration: 2000, // Toast will stay for 2 seconds
        position: 'top-center',
      });
      return;
    }
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-[#1a1740] bg-gradient-to-b from-[#1a1740] to-[#0d0b24] text-white">
      <Toaster position="top-center" />
      
      {/* Hero Section */}
      <div className="relative h-[40vh] md:h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/20 z-0">
          <div className="absolute inset-0 bg-[url('/millionaire-bg.webp')] bg-cover bg-center md:bg-[position:0px_600px] opacity-30 mix-blend-overlay"></div>
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 md:mb-6">
            <span className="bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text">
              Learn & Earn
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-300 mb-6 md:mb-8">Вашето пътуване към знанието и наградите</p>
          {user && (
            <div className="inline-block bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-4 md:p-6 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center gap-3 md:gap-4">
                <FaCoins className="text-yellow-400 text-2xl md:text-3xl animate-pulse" />
                <div>
                  <p className="text-xs md:text-sm text-blue-300">Вашите точки</p>
                  <p className="text-2xl md:text-4xl font-bold text-yellow-400">{userPoints.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Game Modes Section */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          <button
            onClick={() => handleGameModeClick('./game')}
            className="group relative overflow-hidden rounded-2xl p-[2px] transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl animate-gradient-x"></div>
            <div className="relative bg-[#1a1740] p-8 rounded-2xl h-full transition-transform duration-300 group-hover:scale-[0.99]">
              <FaGamepad className="text-5xl mb-4 text-blue-400" />
              <h3 className="text-2xl font-bold mb-2">KLasicheska Vitkoriq test 123</h3>
              <p className="text-blue-300">Проверете вашите знания със серия от въпроси!</p>
            </div>
          </button>

          <button
            onClick={() => handleGameModeClick('./earn-more')}
            className="group relative overflow-hidden rounded-2xl p-[2px] transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-blue-600 to-green-600 rounded-2xl animate-gradient-x"></div>
            <div className="relative bg-[#1a1740] p-8 rounded-2xl h-full transition-transform duration-300 group-hover:scale-[0.99]">
              <FaCoins className="text-5xl mb-4 text-yellow-400" />
              <h3 className="text-2xl font-bold mb-2">Математическо предизвикателство</h3>
              <p className="text-blue-300">Бързи математически задачи за бързи награди, но с уловка!</p>
            </div>
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
          <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 p-6 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-4">
              <FaTrophy className="text-3xl text-yellow-400" />
              <h3 className="text-xl font-bold">Състезавайте се</h3>
            </div>
            <p className="text-blue-300">Предизвикайте себе си и се изкачете в класацията!</p>
          </div>

          <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 p-6 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-4">
              <FaCoins className="text-3xl text-yellow-400" />
              <h3 className="text-xl font-bold">Печели</h3>
            </div>
            <p className="text-blue-300">Натрупвайте точки с всеки правилен отговор!</p>
          </div>

          <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 p-6 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-4">
              <FaStore className="text-3xl text-yellow-400" />
              <h3 className="text-xl font-bold">Осребри</h3>
            </div>
            <p className="text-blue-300">Разменете точки за невероятни награди!</p>
          </div>
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl p-4 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-center">🏆 Шампиони</h2>

          {loadingLeaderboard ? (
            <p className="text-center text-blue-300">Loading leaderboard...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
              {leaderboard.map((player, index) => (
                <div
                  key={player.id}
                  className={`p-6 rounded-xl text-center ${
                    index === 0
                      ? 'bg-gradient-to-br from-yellow-500/20 to-yellow-700/20'
                      : index === 1
                      ? 'bg-gradient-to-br from-gray-400/20 to-gray-600/20'
                      : index === 2
                      ? 'bg-gradient-to-br from-orange-500/20 to-orange-700/20'
                      : 'bg-white/10'
                  }`}
                >
                  <div className="text-4xl mb-2">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : <FaCrown className="text-yellow-400" />}
                  </div>
                  <p className="font-bold">{player.username}</p>
                  <p className="text-yellow-400">{player.points.toLocaleString()} точки</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
