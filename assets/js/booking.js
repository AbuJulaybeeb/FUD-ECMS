import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    serverTimestamp 
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

// Keep track of the currently logged-in student
let currentStudent = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentStudent = user;
    }
});

// Handle the Booking Form Submission
const bookingForm = document.getElementById('booking-form');

if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Stop the page from refreshing

        if (!currentStudent) {
            alert("You must be logged in to book an appointment.");
            return;
        }

        // 1. Grab values from the modal form
        const counselorSelect = document.getElementById('counselor-select').value;
        const date = document.getElementById('appointment-date').value;
        const time = document.getElementById('appointment-time').value;
        const reason = document.getElementById('appointment-reason').value;
        const submitBtn = bookingForm.querySelector('button[type="submit"]');

        try {
            // Disable button to prevent double-booking
            submitBtn.textContent = "Submitting...";
            submitBtn.disabled = true;

            // 2. Push data to the 'appointments' collection in Firestore
            await addDoc(collection(db, "appointments"), {
                studentId: currentStudent.uid,
                studentEmail: currentStudent.email,
                counselorId: counselorSelect,
                date: date,
                time: time,
                reason: reason,
                status: "Pending", // Default status when created
                createdAt: serverTimestamp() // Firebase server time
            });

            // 3. Success Feedback
            alert("Your appointment request has been submitted successfully!");
            
            // Reset form and close DaisyUI modal
            bookingForm.reset();
            document.getElementById('book_modal').close();

        } catch (error) {
            console.error("Error booking appointment: ", error);
            alert("Failed to book appointment. Please try again.");
        } finally {
            // Re-enable button
            submitBtn.textContent = "Submit Request";
            submitBtn.disabled = false;
        }
    });
}