"use client";

import { useCallback, useEffect, useState } from "react";
import toast, { Toaster } from 'react-hot-toast';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  arrayUnion,
  increment,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../components/AuthProvider";
import Image from "next/image";

// Add company type to StoreItem interface
interface StoreItem {
  id: string;
  name: string;
  pointsRequired: number;
  image: string;
  description?: string;
  company: string; // ✅ Company type exists now
}

function generateGiftCardCode(): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const segmentLength = 4;
  const segments = 3;
  let code = "";

  for (let i = 0; i < segments; i++) {
    let segment = "";
    for (let j = 0; j < segmentLength; j++) {
      segment += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
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
  const [companies, setCompanies] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"pointsLow" | "pointsHigh">("pointsLow");

  // Memoize fetchUserData to avoid redefinition on every render
  const fetchUserData = useCallback(async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      setUserPoints(data?.points || 0);
      setPointsUsed(data?.pointsUsed || 0);
    } else {
      console.error("User document does not exist!");
    }
  }, [user]);

  useEffect(() => {
    fetchStoreItems();
    if (user) fetchUserData();
  }, [user, fetchUserData]); // Include fetchUserData in the dependency array

  useEffect(() => {
    let filtered = [...storeItems];

    // ✅ Company filter working now
    if (selectedCompany !== "all") {
      filtered = filtered.filter(
        (item) => item.company === selectedCompany
      );
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "pointsLow") {
        return a.pointsRequired - b.pointsRequired;
      } else {
        return b.pointsRequired - a.pointsRequired;
      }
    });

    setFilteredItems(filtered);
  }, [searchQuery, selectedCompany, sortBy, storeItems]);

  const fetchStoreItems = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, "storeItems"));
    const items: StoreItem[] = [];
    const uniqueCompanies = new Set<string>();

    querySnapshot.forEach((docSnap) => {
      const documentData = docSnap.data();
      const company = docSnap.id; // ✅ Use document ID as company
      uniqueCompanies.add(company); // ✅ Collect company name for filter

      let image = "";

      // Set image based on document ID
      switch (company) {
        case "amazon":
          image = "/amazon.webp";
          break;
        case "billa":
          image = "/billa.webp";
          break;
        case "kaufland":
          image = "/kaufland.webp";
          break;
        case "lidl":
          image = "/lidl.webp";
          break;
        case "H&M":
          image = "/hm.webp";
          break;
        case "Nike":
          image = "/nike.webp";
          break;
        case "Adidas":
          image = "/adidas.webp";
          break;
        case "Starbucks":
          image = "/starbucks.webp";
          break;
        case "Dominos":
          image = "/dominos.webp";
          break;
        default:
          image = "/default.webp";
          break;
      }
      

      Object.keys(documentData).forEach((key) => {
        const nestedMap = documentData[key];

        items.push({
          id: key,
          name: nestedMap.name || "Unnamed Item",
          pointsRequired: nestedMap.pointsRequired || 0,
          image,
          description: nestedMap.description || "",
          company, // ✅ Correctly assign company from document ID
        });
      });
    });

    setCompanies(Array.from(uniqueCompanies));
    setStoreItems(items);
    setFilteredItems(items);
    setLoading(false);
  };

  const confirmRedeem = (item: StoreItem) => {
    setSelectedItem(item);
    setShowConfirmation(true);
  };

  const redeemItem = async () => {
    if (!selectedItem || !user) return;

    if (userPoints < selectedItem.pointsRequired) {
      toast.error("Not enough points to redeem this item.");
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
      setShowSuccess(true);
      toast.success('Item redeemed successfully!');
    } catch (error) {
      console.error("Error redeeming item:", error);
      toast.error('Failed to redeem item. Please try again.');
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-50 to-gray-200">
      <Toaster 
        position="top-center"
        toastOptions={{
          success: {
            style: {
              background: '#10B981',
              color: 'white',
            },
          },
          error: {
            style: {
              background: '#EF4444',
              color: 'white',
            },
          },
        }}
      />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Магазин</h1>

        {/* Points Display */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <p className="text-xl font-medium text-center text-gray-700">
          Налични точки: <span className="text-blue-600 font-semibold">{userPoints}</span>
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Bar */}
            <input
              type="text"
              placeholder="търсенете карти..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
            />

            {/* Company Filter */}
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
            >
              <option value="all">Всички компании</option>
              {companies.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "pointsLow" | "pointsHigh")
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
            >
              <option value="pointsLow">Точки: Възходящ ред</option>
              <option value="pointsHigh">Точки: Низходящ ред</option>
            </select>
          </div>
        </div>

        {/* Store Items Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg overflow-hidden shadow-lg transform transition-all duration-200 hover:scale-105"
              >
                <div className="relative h-48">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    style={{ objectFit: "cover" }}
                    className="rounded-t-lg"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-semibold">{item.name}</h2>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {item.company}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-4">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold text-blue-600">
                      {item.pointsRequired} точки
                    </p>
                    <button
                      onClick={() => confirmRedeem(item)}
                      className={`px-4 py-2 rounded-md shadow-md transition ${
                        userPoints >= item.pointsRequired
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                      disabled={userPoints < item.pointsRequired}
                    >
                      Осребряване
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-xl font-bold mb-4">Потвърди осребряването</h2>
            <p>
              Redeem{" "}
              <span className="font-semibold">{selectedItem.name}</span> for{" "}
              {selectedItem.pointsRequired} точки?
            </p>
            <div className="mt-4 flex justify-center space-x-3">
              <button
                className="px-4 py-2 bg-gray-300 rounded-md"
                onClick={() => setShowConfirmation(false)}
              >
                Откажи
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
                onClick={redeemItem}
                disabled={isRedeeming}
              >
                {isRedeeming ? "Processing..." : "Потвърди"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-xl font-bold text-green-600 mb-4">
              Осребряването е успешно!
            </h2>
            <p className="text-gray-700">
              Вашият артикул беше купен успешно. Проверете вашия профил за
              кода на подаръчната карта.
            </p>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
              onClick={() => setShowSuccess(false)}
            >
              Затвори
            </button>
          </div>
        </div>
      )}
    </div>
  );
}