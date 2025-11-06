// Firebase Configuration
// Project: MD3 SCP Cases
// https://console.firebase.google.com/project/md3-scp-cases

const firebaseConfig = {
  apiKey: "AIzaSyDnS7b6D-jJ5k3-OGOKozDV80pY1Or_zoI",
  authDomain: "md3-scp-cases.firebaseapp.com",
  projectId: "md3-scp-cases",
  storageBucket: "md3-scp-cases.firebasestorage.app",
  messagingSenderId: "345495579967",
  appId: "1:345495579967:web:e71f23bf33bc4eaf9c378a"
};

// Initialize Firebase immediately when this script loads
let app, auth, db;

try {
  // Check if Firebase is loaded
  if (typeof firebase === 'undefined') {
    throw new Error('Firebase SDK not loaded');
  }

  // Check if we're running on a supported protocol
  const protocol = window.location.protocol;
  if (protocol === 'file:') {
    console.warn('Running on file:// protocol. Firebase will not be initialized. Using localStorage only.');
  } else {
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    console.log('Firebase initialized successfully');
  }
} catch (error) {
  console.warn('Firebase initialization skipped or failed:', error.message);
  console.log('The app will continue to work using localStorage only.');
}

// Export for use in other modules (may be undefined if Firebase not initialized)
window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDb = db;
