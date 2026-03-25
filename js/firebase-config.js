// ============================================
// MUDRIKA - FIREBASE CONFIGURATION
// ============================================

// Your Firebase configuration (the one you got from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyDhDuARpAf8VsT_eyiVPDcLbZsf0A-ENCo",
  authDomain: "mudrika-3add0.firebaseapp.com",
  projectId: "mudrika-3add0",
  storageBucket: "mudrika-3add0.firebasestorage.app",
  messagingSenderId: "101246041783",
  appId: "1:101246041783:web:594fe8f8e085db61e49732"
};

// Initialize Firebase (using the compatibility version)
// Make sure Firebase has been loaded via script tags before this
if (typeof firebase !== 'undefined') {
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
  // Get authentication instance
  const auth = firebase.auth();
  
  // Make auth available globally
  window.auth = auth;
  
  console.log("Firebase initialized successfully!");
} else {
  console.error("Firebase SDK not loaded! Check your script tags.");
}