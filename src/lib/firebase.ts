const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase services as promises to ensure they're ready when needed
let firebaseInitPromise: Promise<{
  auth: any;
  googleProvider: any;
  db: any;
}> | null = null;

const initializeFirebase = async () => {
  if (typeof window === 'undefined') {
    throw new Error('Firebase can only be initialized on client side');
  }

  if (!firebaseConfig.apiKey) {
    throw new Error('Firebase configuration is missing');
  }

  const { initializeApp } = await import('firebase/app');
  const { getAuth, GoogleAuthProvider } = await import('firebase/auth');
  const { getFirestore } = await import('firebase/firestore');

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();
  const db = getFirestore(app);

  console.log('Firebase initialized successfully');
  return { auth, googleProvider, db };
};

const getFirebaseServices = () => {
  if (!firebaseInitPromise) {
    firebaseInitPromise = initializeFirebase().catch(error => {
      console.error('Firebase initialization failed:', error);
      firebaseInitPromise = null;
      throw error;
    });
  }
  return firebaseInitPromise;
};

// Export functions that return promises instead of direct exports
export const getAuth = async () => {
  const services = await getFirebaseServices();
  return services.auth;
};

export const getGoogleProvider = async () => {
  const services = await getFirebaseServices();
  return services.googleProvider;
};

export const getDB = async () => {
  const services = await getFirebaseServices();
  return services.db;
};

// Legacy exports for backward compatibility (will be undefined initially)
export let auth: any = undefined;
export let googleProvider: any = undefined;
export let db: any = undefined;