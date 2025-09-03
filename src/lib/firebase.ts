const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Only initialize in browser environment
let app: any = undefined;
let auth: any = undefined;
let googleProvider: any = undefined;
let db: any = undefined;

if (typeof window !== 'undefined' && firebaseConfig.apiKey) {
  const initFirebase = async () => {
    try {
      const { initializeApp } = await import('firebase/app');
      const { getAuth, GoogleAuthProvider } = await import('firebase/auth');
      const { getFirestore } = await import('firebase/firestore');

      if (!app) {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        googleProvider = new GoogleAuthProvider();
        db = getFirestore(app);
      }
    } catch (error) {
      console.error('Firebase initialization error:', error);
    }
  };
  
  initFirebase();
}

export { auth, googleProvider, db };
export default app;