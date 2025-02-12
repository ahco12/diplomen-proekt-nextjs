"use client"; // Add this at the very top

import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  admin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  admin: false,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setAdmin(userDoc.data().admin ?? false); // Default to false if missing
        } else {
          setAdmin(false);
        }
      } else {
        setAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, admin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
