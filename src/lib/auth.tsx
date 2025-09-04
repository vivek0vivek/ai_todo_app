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
        const { auth } = await import('./firebase');
        const { onAuthStateChanged } = await import('firebase/auth');
        
        console.log('Initializing auth listener...');
        
        // Wait for Firebase to initialize
        let attempts = 0;
        while (!auth && attempts < 10) {
          await new Promise(resolve => setTimeout(resolve, 500));
          attempts++;
        }
        
        if (!auth) {
          console.error('Firebase auth not available after waiting');
          setLoading(false);
          return;
        }
        
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
      const { auth, googleProvider } = await import('./firebase');
      const { signInWithPopup } = await import('firebase/auth');
      
      console.error('🔥 CHECKING Firebase services for sign-in...');
      console.error('🔥 Auth object:', auth);
      console.error('🔥 GoogleProvider object:', googleProvider);
      
      if (!auth || !googleProvider) {
        console.error('🔥 ❌ Firebase auth services not ready - auth:', !!auth, 'provider:', !!googleProvider);
        throw new Error('Firebase not initialized');
      }
      
      console.error('🔥 ✅ Firebase services ready, attempting sign in...');
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
      const { auth } = await import('./firebase');
      const { signOut: firebaseSignOut } = await import('firebase/auth');
      
      if (!auth) {
        console.error('Firebase auth not ready');
        return;
      }
      
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