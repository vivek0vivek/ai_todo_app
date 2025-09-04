// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
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

// Initialize Firebase - simple and direct approach
let app: any;
let auth: any;
let db: any;

if (typeof window !== 'undefined') {
  // Only run on client side
  console.log('Starting Firebase initialization...');
  
  import('firebase/app').then(({ initializeApp }) => {
    import('firebase/auth').then(({ getAuth }) => {
      import('firebase/firestore').then(({ getFirestore }) => {
        if (!app && firebaseConfig.apiKey) {
          try {
            console.log('Initializing Firebase with config...');
            app = initializeApp(firebaseConfig);
            auth = getAuth(app);
            db = getFirestore(app);
            console.log('✅ Firebase initialized successfully!');
          } catch (error) {
            console.error('❌ Firebase initialization failed:', error);
          }
        }
      });
    });
  }).catch(error => {
    console.error('❌ Firebase import error:', error);
  });
}

export { auth, db };