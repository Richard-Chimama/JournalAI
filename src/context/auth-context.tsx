
"use client";

import type { User } from "firebase/auth";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthChanged } from "@/lib/firebase/auth";

interface AuthContextType {
  user: User | null;
  authLoading: boolean;
  getFirebaseToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChanged((firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getFirebaseToken = async () => {
    if (user) {
      return user.getIdToken();
    }
    return null;
  };


  return (
    <AuthContext.Provider value={{ user, authLoading, getFirebaseToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
