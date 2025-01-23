import React from 'react';
import { AuthProvider } from './components/AuthProvider'; // Path to AuthProvider
import './globals.css'; // Your global styles
import { Manrope } from 'next/font/google';
import Navbar from './components/navbar';

const manrope = Manrope({
  subsets: ['latin'], // Use the subset for your language
  weight: ['400', '500', '700'], // Include weights as needed (e.g., Regular, Medium, Bold)
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
          <Navbar />
          {children} {/* All page content will be wrapped by AuthProvider */}
        </AuthProvider>
      </body>
    </html>
  );
}
