import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// FIREBASE CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyAXhIeAIOSXrBMqp9kCPUJ_CgzuR_Pyf9Q",
  authDomain: "educational-counsel-system.firebaseapp.com",
  projectId: "educational-counsel-system",
  storageBucket: "educational-counsel-system.firebasestorage.app",
  messagingSenderId: "189241267093",
  appId: "1:189241267093:web:18c780db587ff723bd1c9c",
  measurementId: "G-TKM57CELR6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ==========================================
// ROUTE PROTECTION (Run on every dashboard page)
// ==========================================
onAuthStateChanged(auth, (user) => {
    if (!user) {
        // User is signed out, redirect to login page
        console.warn("No active session. Redirecting to login...");
        window.location.href = '../login.html'; 
    } else {
        // User is signed in. You can display their email or UID here if needed.
        console.log("Active session for:", user.email);
    }
});

// ==========================================
// LOGOUT LOGIC
// ==========================================
const logoutBtn = document.getElementById('logout-btn');

if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
            // The onAuthStateChanged listener will automatically detect this and redirect!
        } catch (error) {
            console.error("Error signing out:", error);
            alert("Failed to sign out. Please try again.");
        }
    });
}