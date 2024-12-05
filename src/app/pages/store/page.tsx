'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Navbar from '../../components/navbar'; // Import the Navbar component

interface Item {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
}

const StorePage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('recommended');
  const [priceRange, setPriceRange] = useState<number>(100); // Slider value
  const [maxPrice, setMaxPrice] = useState<number>(100); // Maximum price of items

  useEffect(() => {
    const fetchItems = async () => {
      const fetchedItems: Item[] = [
        { id: 1, name: 'Item 1', description: 'Description 1', price: 20, image: '/image1.jpg' },
        { id: 2, name: 'Item 2', description: 'Description 2', price: 40, image: '/image2.jpg' },
        { id: 3, name: 'Item 3', description: 'Description 3', price: 60, image: '/image3.jpg' },
        { id: 4, name: 'Item 4', description: 'Description 4', price: 100, image: '/image4.jpg' },
      ];

      setItems(fetchedItems);
      setFilteredItems(fetchedItems);

      const maxItemPrice = Math.max(...fetchedItems.map((item) => item.price));
      setMaxPrice(Math.ceil(maxItemPrice / 10) * 10); // Round up to the nearest $10
      setPriceRange(Math.ceil(maxItemPrice / 10) * 10); // Set the slider to max by default
    };

    fetchItems();
  }, []);

  useEffect(() => {
    const filtered = items.filter((item) =>
      (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.price.toString().includes(searchQuery)) &&
      item.price <= priceRange
    );

    if (sortOrder === 'low-to-high') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'high-to-low') {
      filtered.sort((a, b) => b.price - a.price);
    }

    setFilteredItems(filtered);
  }, [searchQuery, sortOrder, priceRange, items]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </div>

      {/* Store Page Content */}
      <div className="flex flex-1 mt-[90px]"> {/* Adjust to match navbar height */}
        {/* Filters Section */}
        <div className="w-1/5 p-4 h-full">
          <h2 className="text-lg font-bold mb-4 text-customOrange">Filters</h2>
          <ul>
            <li>
              <label className="text-customOrange">
                <input type="checkbox" />
                Filter 1
              </label>
            </li>
            <li>
              <label className="text-customOrange">
                <input type="checkbox" />
                Filter 2
              </label>
            </li>
          </ul>
          <h3 className="mt-4 font-bold text-customOrange">Price Range</h3>
          <div className="flex items-center justify-between mt-2">
            <span className="text-customOrange">$0</span>
            <span className="text-customOrange">${maxPrice}</span>
          </div>
          <input
            type="range"
            min="0"
            max={maxPrice}
            step="10"
            value={priceRange}
            onChange={(e) => setPriceRange(Number(e.target.value))}
            className="w-full mt-2"
          />
          <p className="text-sm mt-2 text-customBlue">Selected Price: ${priceRange}</p>
        </div>

        {/* Main Section */}
        <div className="flex-1 p-4">
          {/* Search and Sort */}
          <div className="flex justify-between items-center mb-4">
            <input
              type="text"
              placeholder="Search..."
              className="p-2 border rounded-xl w-2/3 text-black"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="p-2 border rounded bg-white text-customBlue"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="recommended">Recommended</option>
              <option value="low-to-high">Price: Low to High</option>
              <option value="high-to-low">Price: High to Low</option>
            </select>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="border rounded p-4 flex flex-col items-center">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={150}
                  height={150}
                  className="mb-2 object-cover"
                />
                <h3 className="font-bold text-md text-black">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
                <p className="font-bold text-customOrange">${item.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorePage;
