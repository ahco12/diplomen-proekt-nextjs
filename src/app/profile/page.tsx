"use client";

import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig"; // Adjust path if needed
import { useAuth } from "../components/AuthProvider"; // Adjust path if needed

interface RedeemedItem {
  id: string; // Nested map key (e.g., "amazon_card_10")
  name: string;
  date: string;
  giftCardCode: string;
  pointsRequired?: number;
  description?: string;
  uniqueId: string;
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
    if (!user) return;
  
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
  
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUsername(userData?.username ?? (user.email ? user.email.split("@")[0] : "User"));
        setPoints(userData?.points || 0);
        setPointsUsed(userData?.pointsUsed || 0);
        setQuestionsAnswered(userData?.questionsAnswered || 0);
        setRedeemedItems(userData?.redeemedItems || []);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };
  
  

  const fetchGiftCardDetails = async (id: string) => {
    try {
      // Extract company name (first part of the ID) e.g., "billa" from "billa_card_10"
      const companyName = id.split("_")[0];
      console.log(`Extracted company: ${companyName}`);

      const companyDocRef = doc(db, "storeItems", companyName);
      console.log("Fetching document from Firestore:", companyDocRef.path);

      const companyDoc = await getDoc(companyDocRef);

      if (companyDoc.exists()) {
        const giftCards = companyDoc.data(); // Entire document contains all gift cards

        if (giftCards && giftCards[id]) {
          console.log(`Gift card found: ${id}`, giftCards[id]);
          return giftCards[id]; // Return gift card details
        } else {
          console.error(`Gift card with ID ${id} does not exist inside '${companyName}'.`);
          throw new Error(`Gift card with ID ${id} does not exist inside '${companyName}'.`);
        }
      } else {
        console.error(`Company '${companyName}' does not exist in storeItems.`);
        throw new Error(`Company '${companyName}' does not exist in storeItems.`);
      }
    } catch (error) {
      console.error("Error fetching gift card:", error);
      throw error;
    }
  };

  const handleGiftCardClick = async (item: RedeemedItem) => {
    try {
      const giftCardDetails = await fetchGiftCardDetails(item.id);
      setSelectedGiftCard({
        ...item, // Keep 'code' from users collection
        pointsRequired: giftCardDetails?.pointsRequired ?? item.pointsRequired,
        description: giftCardDetails?.description ?? item.description,
      });
    } catch (error) {
      console.error("Error fetching gift card details:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-3xl text-white font-bold">
                {username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Welcome back, {username}!
              </h1>
              <p className="text-gray-500 mt-1">Your Learning Dashboard</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Available Points</p>
                  <h3 className="text-3xl font-bold mt-1">{points}</h3>
                </div>
                <div className="text-3xl">🏆</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Points Used</p>
                  <h3 className="text-3xl font-bold mt-1">{pointsUsed}</h3>
                </div>
                <div className="text-3xl">💎</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Questions Answered</p>
                  <h3 className="text-3xl font-bold mt-1">{questionsAnswered}</h3>
                </div>
                <div className="text-3xl">✨</div>
              </div>
            </div>
          </div>
        </div>

        {/* Gift Cards Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Your Gift Cards
          </h2>
          
          {redeemedItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🎁</div>
              <p className="text-gray-500">No gift cards redeemed yet.</p>
              <p className="text-sm text-gray-400 mt-2">Start earning points to get your first gift card!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {redeemedItems.map((item) => (
                <div
                  key={item.uniqueId}
                  onClick={() => handleGiftCardClick(item)}
                  className="bg-gray-50 hover:bg-gray-100 rounded-xl p-6 cursor-pointer transition-all duration-200 border border-gray-200 hover:border-indigo-300"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(item.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-indigo-600 text-sm font-medium hover:text-indigo-700">
                      View Details →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal - Updated Design */}
      {selectedGiftCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Gift Card Details
              </h3>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Gift Card Code</p>
                  <p className="font-mono text-lg font-medium">
                    {selectedGiftCard.giftCardCode ?? "Not Available"}
                  </p>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500 mb-1">Points Cost</p>
                    <p className="font-medium">
                      {selectedGiftCard.pointsRequired ?? "Unknown"} points
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Description</p>
                  <p className="text-gray-700">
                    {selectedGiftCard.description ?? "No description available"}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedGiftCard(null)}
                  className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}