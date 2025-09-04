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