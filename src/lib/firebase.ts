// Only initialize Firebase on client side to prevent SSR issues
let auth: any = undefined;
let googleProvider: any = undefined; 
let db: any = undefined;

if (typeof window !== 'undefined') {
  // Import Firebase dynamically to prevent build issues
  import('firebase/app').then(({ initializeApp }) => {
    import('firebase/auth').then(({ getAuth, GoogleAuthProvider }) => {
      import('firebase/firestore').then(({ getFirestore }) => {
        const firebaseConfig = {
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        };

        if (firebaseConfig.apiKey) {
          try {
            const app = initializeApp(firebaseConfig);
            auth = getAuth(app);
            googleProvider = new GoogleAuthProvider();
            db = getFirestore(app);
          } catch (error) {
            console.error('Firebase initialization error:', error);
          }
        }
      });
    });
  });
}

export { auth, googleProvider, db };