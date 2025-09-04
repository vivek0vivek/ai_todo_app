'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
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

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { auth } = await import('./firebase');
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      
      if (!auth) {
        throw new Error('Firebase not initialized');
      }
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      setUser({
        uid: result.user.uid,
        email: result.user.email || '',
        displayName: result.user.displayName || result.user.email?.split('@')[0] || '',
        photoURL: result.user.photoURL || undefined,
      });
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const { auth } = await import('./firebase');
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      
      if (!auth) {
        throw new Error('Firebase not initialized');
      }
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      setUser({
        uid: result.user.uid,
        email: result.user.email || '',
        displayName: result.user.email?.split('@')[0] || '',
        photoURL: result.user.photoURL || undefined,
      });
    } catch (error) {
      console.error('Error signing up with email:', error);
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
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};