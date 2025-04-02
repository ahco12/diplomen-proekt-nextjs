'use client';

import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { FaCrown } from 'react-icons/fa';

interface User {
  id: string;
  username: string;
  points: number;
}

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const leaderboardQuery = query(
          collection(db, 'users'),
          orderBy('points', 'desc'),
          limit(10)
        );

        const querySnapshot = await getDocs(leaderboardQuery);

        const leaderboardData: User[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          username: doc.data().username,
          points: doc.data().points,
        }));

        setLeaderboard(leaderboardData);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-6">🏆 Класация</h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading leaderboard...</p>
      ) : (
        <ol className="space-y-4">
          {leaderboard.map((user, index) => (
            <li
              key={user.id}
              className={`flex justify-between items-center p-4 rounded-lg ${
                index === 0
                  ? 'bg-yellow-100 border-2 border-yellow-400'
                  : index === 1
                  ? 'bg-gray-100 border-2 border-gray-400'
                  : index === 2
                  ? 'bg-orange-100 border-2 border-orange-400'
                  : 'bg-white border'
              }`}
            >
              <div className="flex items-center space-x-4">
                {index === 0 && <FaCrown className="text-yellow-400 text-xl" />}
                <span className="text-lg font-medium">{user.username || 'Anonymous'}</span>
              </div>
              <span className="font-bold text-blue-600">{user.points} точки</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default Leaderboard;
