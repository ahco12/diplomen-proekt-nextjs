"use client";

import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig"; // Adjust path if needed
import { useAuth } from "../../components/AuthProvider"; // Adjust path if needed

interface RedeemedItem {
  id: string;
  name: string;
  date: string;
  code: string;
  pointsRequired: number;
  description: string; // Add description property
  uniqueId: string; // Add uniqueID property
}

export default function ProfilePage() {
  const { user } = useAuth(); // Get current user
  const [username, setUsername] = useState<string>("");
  const [points, setPoints] = useState<number>(0);
  const [pointsUsed, setPointsUsed] = useState<number>(0);
  const [questionsAnswered, setQuestionsAnswered] = useState<number>(0);
  const [redeemedItems, setRedeemedItems] = useState<RedeemedItem[]>([]);
  const [selectedGiftCard, setSelectedGiftCard] = useState<RedeemedItem | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUsername(userData?.username || "User");
        setPoints(userData?.points || 0);
        setPointsUsed(userData?.pointsUsed || 0);
        setQuestionsAnswered(userData?.questionsAnswered || 0);
        setRedeemedItems(userData?.redeemedItems || []);
      }
    }
  };

  const fetchGiftCardDetails = async (uniqueId: string) => {
    const giftCardDocRef = doc(db, "giftCards", uniqueId);
    const giftCardDoc = await getDoc(giftCardDocRef);

    if (giftCardDoc.exists()) {
      return giftCardDoc.data();
    } else {
      throw new Error(`Gift card with unique ID ${uniqueId} does not exist.`);
    }
  };

  const handleGiftCardClick = async (item: RedeemedItem) => {
    try {
      const giftCardDetails = await fetchGiftCardDetails(item.uniqueId);
      setSelectedGiftCard({
        ...item,
        pointsRequired: giftCardDetails.pointsRequired,
        description: giftCardDetails.description,
      });
    } catch (error) {
      console.error("Error fetching gift card details:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-6">
          Welcome, {username}!
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-blue-100 p-4 rounded-md shadow-md">
            <h2 className="text-lg font-medium">Points</h2>
            <p className="text-2xl font-bold text-blue-600">{points}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-md shadow-md">
            <h2 className="text-lg font-medium">Points Used</h2>
            <p className="text-2xl font-bold text-green-600">{pointsUsed}</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-md shadow-md">
            <h2 className="text-lg font-medium">Questions Answered</h2>
            <p className="text-2xl font-bold text-yellow-600">
              {questionsAnswered}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-4">Redeemed Gift Cards</h2>
          {redeemedItems.length === 0 ? (
            <p className="text-gray-600">No gift cards redeemed yet.</p>
          ) : (
            <ul className="space-y-4">
              {redeemedItems.map((item) => (
                <li
                  key={item.id}
                  className="p-4 bg-gray-100 rounded-lg shadow-md flex justify-between items-center cursor-pointer hover:bg-gray-200"
                  onClick={() => handleGiftCardClick(item)}
                >
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      Redeemed on: {new Date(item.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-sm text-blue-600 underline">
                    View Code
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Gift Card Modal */}
      {selectedGiftCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md">
            <h3 className="text-xl font-bold mb-4">Gift Card Code</h3>
            <p className="text-lg font-mono bg-gray-100 p-2 rounded-lg">
              {selectedGiftCard.code}
            </p>
            <p className="text-lg mt-2">
              Points Required: {selectedGiftCard.pointsRequired}
            </p>
            <p className="text-lg mt-2">
              Description: {selectedGiftCard.description}
            </p>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedGiftCard(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
