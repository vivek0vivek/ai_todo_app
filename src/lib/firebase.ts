// Firebase configuration - temporarily hardcoded to fix env var issues
const firebaseConfig = {
  apiKey: "AIzaSyD6QwKTLIKdQ6b52HdFr7f_OiXglu29Hgc",
  authDomain: "ai-todo-app-fe8a5.firebaseapp.com",
  projectId: "ai-todo-app-fe8a5",
  storageBucket: "ai-todo-app-fe8a5.firebasestorage.app",
  messagingSenderId: "15709189569",
  appId: "1:15709189569:web:96eee03b1f21a9c342eb40",
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