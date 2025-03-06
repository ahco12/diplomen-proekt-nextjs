'use client'; // This file must be a client component to use 'usePathname'

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './navbar'; // Your existing navbar component

export default function NavbarWrapper() {
  const pathname = usePathname();

  // Define the routes that SHOULD NOT display the navbar
  const hiddenRoutes = ['/login', '/register', '/game'];

  // If current path is in hiddenRoutes, return nothing
  if (hiddenRoutes.includes(pathname)) {
    return null;
  }

  // Otherwise, render the navbar
  return <Navbar />;
}