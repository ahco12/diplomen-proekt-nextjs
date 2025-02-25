"use client";

import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, updateDoc, arrayUnion, increment } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig"; 
import { useAuth } from "../../components/AuthProvider"; 
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
  const [pointsUsed, setPointsUsed] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth(); 

  const [isRedeeming, setIsRedeeming] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

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
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, "storeItems"));
    const items: StoreItem[] = [];

    querySnapshot.forEach((doc) => {
      const documentData = doc.data();
      const image = documentData.image || "";

      Object.keys(documentData).forEach((key) => {
        if (key !== "image") { 
          const nestedMap = documentData[key];
          items.push({
            id: key,
            name: nestedMap.name || "Unnamed Item",
            pointsRequired: nestedMap.pointsRequired || 0,
            image,
            description: nestedMap.description || "",
          });
        }
      });
    });

    setStoreItems(items);
    setFilteredItems(items);
    setLoading(false);
  };

  const fetchUserData = async () => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserPoints(data?.points || 0);
        setPointsUsed(data?.pointsUsed || 0);
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

    if (userPoints < selectedItem.pointsRequired) {
      alert("Not enough points to redeem this item.");
      setShowConfirmation(false);
      return;
    }

    setIsRedeeming(true);
    const userDocRef = doc(db, "users", user.uid);
    const newGiftCardCode = generateGiftCardCode();
    const uniqueId = `${selectedItem.id}_${Date.now()}`;

    try {
      await updateDoc(userDocRef, {
        points: increment(-selectedItem.pointsRequired),
        pointsUsed: increment(selectedItem.pointsRequired),
        redeemedItems: arrayUnion({
          id: selectedItem.id,
          uniqueId,
          name: selectedItem.name,
          date: new Date().toISOString(),
          giftCardCode: newGiftCardCode,
        }),
      });

      setUserPoints(userPoints - selectedItem.pointsRequired);
      setPointsUsed(pointsUsed + selectedItem.pointsRequired);
      setSelectedItem(null);
      setShowConfirmation(false);
      setShowSuccess(true); // Show success modal after redemption
    } catch (error) {
      console.error("Error redeeming item:", error);
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-50 to-gray-200">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Store</h1>

      {/* Points Display */}
      <div className="text-center mb-6">
        <p className="text-xl font-medium text-gray-700">
          Your Points: <span className="text-blue-600 font-semibold">{userPoints}</span>
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto mb-6">
        <input
          type="text"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-5 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Store Items Grid */}
      {loading ? (
        <p className="text-center text-gray-600">Loading store items...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center">
              <Image src={item.image} alt={item.name} width={150} height={100} className="rounded-md" />
              <h2 className="text-xl font-semibold mt-3">{item.name}</h2>
              <p className="text-gray-500 text-sm text-center mt-2">{item.description}</p>
              <p className="text-lg font-bold text-blue-600 mt-3">Points Required: {item.pointsRequired}</p>
              <button
                onClick={() => confirmRedeem(item)}
                className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition disabled:bg-gray-400"
                disabled={userPoints < item.pointsRequired}
              >
                Redeem
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-xl font-bold mb-4">Confirm Redemption</h2>
            <p>Redeem <span className="font-semibold">{selectedItem.name}</span> for {selectedItem.pointsRequired} points?</p>
            <div className="mt-4 flex justify-center space-x-3">
              <button className="px-4 py-2 bg-gray-300 rounded-md" onClick={() => setShowConfirmation(false)}>Cancel</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md" onClick={redeemItem} disabled={isRedeeming}>
                {isRedeeming ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-xl font-bold text-green-600 mb-4">Redemption Successful!</h2>
            <p className="text-gray-700">Your item has been redeemed successfully. Check your profile for the gift card code.</p>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md" onClick={() => setShowSuccess(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
