import React from 'react';
import { AuthProvider } from './components/AuthProvider'; // Path to AuthProvider
import './globals.css'; // Your global styles

export const metadata = {
  title: 'My App',
  description: 'A Next.js app with Firebase authentication',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children} {/* All page content will be wrapped by AuthProvider */}
        </AuthProvider>
      </body>
    </html>
  );
}
