'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        const { getAuth } = await import('./firebase');
        const { onAuthStateChanged } = await import('firebase/auth');
        
        console.log('Initializing auth listener...');
        const auth = await getAuth();
        
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser) {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              photoURL: firebaseUser.photoURL || undefined,
            });
          } else {
            setUser(null);
          }
          setLoading(false);
        });

        console.log('Auth listener initialized');
        return unsubscribe;
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setLoading(false);
      }
    };

    const cleanup = initAuth();
    return () => {
      cleanup?.then(unsubscribe => unsubscribe?.());
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      const { getAuth, getGoogleProvider } = await import('./firebase');
      const { signInWithPopup } = await import('firebase/auth');
      
      console.log('Getting Firebase auth services...');
      const auth = await getAuth();
      const googleProvider = await getGoogleProvider();
      
      console.log('Firebase services ready, attempting sign in...');
      const result = await signInWithPopup(auth, googleProvider);
      
      setUser({
        uid: result.user.uid,
        email: result.user.email || '',
        displayName: result.user.displayName || '',
        photoURL: result.user.photoURL || undefined,
      });
      
      console.log('Sign in successful');
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { getAuth } = await import('./firebase');
      const { signOut: firebaseSignOut } = await import('firebase/auth');
      
      const auth = await getAuth();
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};