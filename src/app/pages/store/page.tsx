"use client";

import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, updateDoc, increment } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig"; // Adjust path as needed
import { useAuth } from "../../components/AuthProvider"; // Assuming you have a hook for authentication
import Image from "next/image";

interface StoreItem {
  id: string;
  name: string;
  pointsRequired: number;
  image: string;
  description?: string;
}

function generateGiftCardCode(): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const segmentLength = 4;
  const segments = 3;
  let code = "";

  for (let i = 0; i < segments; i++) {
    let segment = "";
    for (let j = 0; j < segmentLength; j++) {
      segment += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    code += segment + (i < segments - 1 ? "-" : "");
  }

  return code;
}

export default function StorePage() {
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<StoreItem[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [pointsUsed, setPointsUsed] = useState(0); // Track points used by the user
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth(); // Get current user from authentication

  const [isRedeeming, setIsRedeeming] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [giftCardCode, setGiftCardCode] = useState("");

  useEffect(() => {
    fetchStoreItems();
    if (user) fetchUserData();
  }, [user]);

  useEffect(() => {
    setFilteredItems(
      storeItems.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, storeItems]);

  const fetchStoreItems = async () => {
    const querySnapshot = await getDocs(collection(db, "storeItems"));
    const items: StoreItem[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as StoreItem[];
    setStoreItems(items);
    setFilteredItems(items);
  };

  const fetchUserData = async () => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserPoints(data?.points || 0);
        setPointsUsed(data?.pointsUsed || 0); // Fetch points used from Firestore
      } else {
        console.error("User document does not exist!");
      }
    }
  };

  const confirmRedeem = (item: StoreItem) => {
    setSelectedItem(item);
    setShowConfirmation(true);
  };

  const redeemItem = async () => {
    if (!selectedItem || !user) return;

    const item = selectedItem;

    if (userPoints < item.pointsRequired) {
      alert("Not enough points to redeem this item.");
      setShowConfirmation(false);
      return;
    }

    setIsRedeeming(true);

    const userDocRef = doc(db, "users", user.uid);
    const newPoints = userPoints - item.pointsRequired;
    const newPointsUsed = pointsUsed + item.pointsRequired;
    const newGiftCardCode = generateGiftCardCode();

    try {
      // Update points, pointsUsed, and redeemed items in Firestore
      await updateDoc(userDocRef, {
        points: newPoints,
        pointsUsed: increment(item.pointsRequired), // Increment the points used
        redeemedItems: [
          {
            id: item.id,
            name: item.name,
            date: new Date().toISOString(),
            giftCardCode: newGiftCardCode, // Store the gift card code
          },
        ],
      });

      // Update local state
      setUserPoints(newPoints);
      setPointsUsed(newPointsUsed);
      setGiftCardCode(newGiftCardCode);
      setShowConfirmation(false);
      setShowSuccess(true);
    } catch (error) {
      console.error("Error redeeming item:", error);
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold text-center mb-8">Store</h1>
      <div className="text-center mb-4">
        <p className="text-lg font-medium">
          Your Points: <span className="text-blue-600">{userPoints}</span>
        </p>
      </div>
      <div className="text-center mb-4">
        <input
          type="text"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border rounded-md"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center"
          >
            <Image
              src={item.image}
              alt={item.name}
              width={150}
              height={100}
              className="mb-4"
            />
            <h2 className="text-xl font-bold">{item.name}</h2>
            <p className="text-gray-600 mb-2">{item.description}</p>
            <p className="text-lg font-semibold mb-4">
              Points Required: {item.pointsRequired}
            </p>
            <button
              onClick={() => confirmRedeem(item)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              disabled={userPoints < item.pointsRequired}
            >
              Redeem
            </button>
          </div>
        ))}
      </div>

      {showConfirmation && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Confirm Redemption</h2>
            <p>Are you sure you want to redeem this item?</p>
            <div className="mt-4 flex justify-end">
              <button
                className="px-4 py-2 mr-2 bg-gray-300 rounded-md"
                onClick={() => setShowConfirmation(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
                onClick={redeemItem}
                disabled={isRedeeming}
              >
                {isRedeeming ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-xl text-green-600 font-bold mb-4">Redeem Successful</h2>
            <p>Your gift card code: <span className="font-mono">{giftCardCode}</span></p>
            <div className="mt-4 flex justify-end">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
                onClick={() => setShowSuccess(false)}
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
