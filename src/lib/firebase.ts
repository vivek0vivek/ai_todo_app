// Firebase configuration - correct credentials from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyAXkKnkC7564grnwCBEhm1doIaEqEOqZkY",
  authDomain: "ai-todo-fresh.firebaseapp.com",
  projectId: "ai-todo-fresh",
  storageBucket: "ai-todo-fresh.firebasestorage.app",
  messagingSenderId: "196781214933",
  appId: "1:196781214933:web:0ed9f7db99f5717c90a65c",
};

// Debug logging - make it impossible to miss
console.error('🔥 FIREBASE DEBUG - Config Check:', {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasProjectId: !!firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  apiKeyFirst10: firebaseConfig.apiKey?.substring(0, 10) + '...',
});

// Also show in UI for debugging
if (typeof window !== 'undefined' && !firebaseConfig.apiKey) {
  setTimeout(() => {
    alert('❌ FIREBASE CONFIG MISSING: API Key not found in environment variables!');
  }, 1000);
}

// Initialize Firebase immediately
let app: any = null;
let auth: any = null;
let db: any = null;

// Initialize Firebase function
const initializeFirebase = async () => {
  if (app) return { app, auth, db }; // Already initialized
  
  try {
    console.log('🔥 Starting Firebase initialization...');
    
    const { initializeApp } = await import('firebase/app');
    const { getAuth } = await import('firebase/auth');
    const { getFirestore } = await import('firebase/firestore');
    
    if (!firebaseConfig.apiKey) {
      throw new Error('Firebase API key not found');
    }
    
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    console.log('✅ Firebase initialized successfully!');
    console.log('Auth instance:', !!auth);
    console.log('DB instance:', !!db);
    
    return { app, auth, db };
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    throw error;
  }
};

// Initialize on client side
if (typeof window !== 'undefined') {
  initializeFirebase().catch(console.error);
}

// Export function to get initialized Firebase instances
export const getFirebaseInstances = async () => {
  if (typeof window === 'undefined') {
    throw new Error('Firebase can only be initialized on client side');
  }
  
  return await initializeFirebase();
};

// Legacy exports for backward compatibility
export { auth, db };