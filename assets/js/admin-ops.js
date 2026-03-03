import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { 
    getFirestore, collection, query, where, onSnapshot
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM Elements
const studentsCountEl = document.getElementById('total-students-count');
const appointmentsCountEl = document.getElementById('total-appointments-count');

if (studentsCountEl && appointmentsCountEl) {
    // 1. Fetch Total Number of Students
    const usersRef = collection(db, "users");
    // We only want to count users whose role is "student"
    const studentQuery = query(usersRef, where("role", "==", "student"));
    
    onSnapshot(studentQuery, (snapshot) => {
        // snapshot.size gives us the total number of documents returned
        studentsCountEl.textContent = snapshot.size;
    });

    // 2. Fetch Total Number of Appointments (All Time)
    const appointmentsRef = collection(db, "appointments");
    
    onSnapshot(appointmentsRef, (snapshot) => {
        appointmentsCountEl.textContent = snapshot.size;
    });
}