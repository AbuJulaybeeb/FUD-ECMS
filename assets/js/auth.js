import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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
const db = getFirestore(app);

// ==========================================
// 1. SIGNUP LOGIC
// ==========================================
const signupForm = document.getElementById('signup-form');

if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent page reload
        
        // Get user inputs
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;
        const submitBtn = signupForm.querySelector('button[type="submit"]');

        try {
            submitBtn.textContent = "Creating Account...";
            submitBtn.disabled = true;

            // 1. Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Save additional user data in Firestore
            await setDoc(doc(db, "users", user.uid), {
                fullName: fullName,
                email: email,
                role: role,
                createdAt: new Date()
            });

            alert("Account created successfully!");
            
            // 3. Redirect based on role
            window.location.href = `dashboard/${role}.html`;

        } catch (error) {
            console.error("Signup Error:", error.message);
            alert("Error: " + error.message);
            submitBtn.textContent = "Sign Up";
            submitBtn.disabled = false;
        }
    });
}

// ==========================================
// 2. LOGIN LOGIC
// ==========================================
const loginForm = document.getElementById('login-form');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const submitBtn = loginForm.querySelector('button[type="submit"]');

        try {
            submitBtn.textContent = "Signing In...";
            submitBtn.disabled = true;

            // 1. Authenticate User
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Fetch User Role from Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));
            
            if (userDoc.exists()) {
                const userData = userDoc.data();
                
                // 3. Route to the correct dashboard
                window.location.href = `dashboard/${userData.role}.html`;
            } else {
                alert("No user record found in database!");
            }

        } catch (error) {
            console.error("Login Error:", error.message);
            alert("Invalid email or password.");
            submitBtn.textContent = "Sign In";
            submitBtn.disabled = false;
        }
    });
}