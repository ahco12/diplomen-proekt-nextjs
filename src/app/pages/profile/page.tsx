"use client";

import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig"; // Adjust path if needed
import { useAuth } from "../../components/AuthProvider"; // Adjust path if needed

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
        setUsername(userData?.username || "User");
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
                  key={item.uniqueId}
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
            <h3 className="text-xl font-bold mb-4">Gift Card Details</h3>

            <p className="text-lg font-mono bg-gray-100 p-2 rounded-lg">
              Code: {selectedGiftCard.giftCardCode ?? "Not Available"}
            </p>
            <p className="text-lg mt-2">
              Bought for: {selectedGiftCard.pointsRequired ?? "Unknown"}
            </p>
            <p className="text-lg mt-2">
              Description: {selectedGiftCard.description ?? "No description available"}
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