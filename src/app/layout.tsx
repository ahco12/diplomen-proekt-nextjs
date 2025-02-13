import React from 'react';
import { AuthProvider } from './components/AuthProvider'; // Path to your AuthProvider
import './globals.css';
import { Manrope } from 'next/font/google';

import NavbarWrapper from './components/NavbarWrapper'; // <-- Import our wrapper

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

export const metadata = {
  title: 'Learn & Earn',
  description: 'A Next.js app with Firebase authentication',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={manrope.className}>
      <body>
        <AuthProvider>
          {/* The NavbarWrapper will decide whether to display the actual <Navbar /> */}
          <NavbarWrapper />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}