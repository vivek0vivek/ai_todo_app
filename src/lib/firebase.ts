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
let googleProvider: any;
let db: any;

if (typeof window !== 'undefined') {
  // Only run on client side
  console.error('🔥 STARTING Firebase initialization on client...');
  
  import('firebase/app').then(({ initializeApp }) => {
    import('firebase/auth').then(({ getAuth, GoogleAuthProvider }) => {
      import('firebase/firestore').then(({ getFirestore }) => {
        if (!app && firebaseConfig.apiKey) {
          try {
            console.error('🔥 INITIALIZING Firebase with config:', {
              hasApiKey: !!firebaseConfig.apiKey,
              authDomain: firebaseConfig.authDomain,
              projectId: firebaseConfig.projectId
            });
            app = initializeApp(firebaseConfig);
            auth = getAuth(app);
            googleProvider = new GoogleAuthProvider();
            db = getFirestore(app);
            console.error('🔥 ✅ Firebase initialized successfully - auth and provider ready!');
          } catch (error) {
            console.error('🔥 ❌ Firebase app initialization failed:', error);
          }
        } else {
          console.error('🔥 ❌ Firebase config missing or app already initialized:', {
            hasApp: !!app,
            hasApiKey: !!firebaseConfig.apiKey
          });
        }
      });
    });
  }).catch(error => {
    console.error('🔥 ❌ Firebase module import error:', error);
  });
}

export { auth, googleProvider, db };