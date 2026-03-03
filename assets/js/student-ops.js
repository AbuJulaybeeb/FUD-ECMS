import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { 
    getFirestore, collection, query, where, onSnapshot, orderBy 
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
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const notificationContainer = document.getElementById('notification-container');
const noApptState = document.getElementById('no-appointment-state');
const activeApptState = document.getElementById('active-appointment-state');

// Listen for the current user
onAuthStateChanged(auth, (user) => {
    if (user) {
        listenToStudentAppointments(user.uid);
    }
});

function listenToStudentAppointments(studentId) {
    // Query: Get appointments for THIS student only, sorted by newest first
    const q = query(
        collection(db, "appointments"), 
        where("studentId", "==", studentId)
    );

    onSnapshot(q, (snapshot) => {
        
        // 1. Check for Real-Time Changes to trigger Notifications
        snapshot.docChanges().forEach((change) => {
            if (change.type === "modified") {
                const data = change.doc.data();
                
                if (data.status === "Confirmed") {
                    showNotification(`✅ Good news! Your session on ${data.date} has been confirmed.`, "alert-success");
                } else if (data.status === "Declined") {
                    showNotification(`❌ Update: Your session request for ${data.date} was declined.`, "alert-error");
                }
            }
        });

        // 2. Update the "Next Appointment" UI Card
        let latestAppointment = null;
        
        // Find the most recent upcoming appointment (Confirmed or Pending)
        snapshot.forEach((doc) => {
            const data = doc.data();
            // In a real app we'd compare dates, here we grab the first valid one for the prototype
            if (data.status === "Confirmed" || data.status === "Pending") {
                latestAppointment = data;
            }
        });

        if (latestAppointment) {
            // Hide the "Empty" state, show the "Active" state
            noApptState.classList.add('hidden');
            activeApptState.classList.remove('hidden');

            // Populate the data
            document.getElementById('next-appt-status').textContent = latestAppointment.status;
            document.getElementById('next-appt-counselor').textContent = 
                latestAppointment.counselorId === 'dr_jenkins' ? 'Dr. Sarah Jenkins' : 'Dr. Michael Chen';
            document.getElementById('next-appt-reason').textContent = latestAppointment.reason;
            document.getElementById('next-appt-date').textContent = latestAppointment.date;
            document.getElementById('next-appt-time').textContent = latestAppointment.time;

            // Change badge color based on status
            const statusBadge = document.getElementById('next-appt-status');
            if (latestAppointment.status === "Pending") {
                statusBadge.className = "badge bg-orange-100 text-orange-700 border-none font-bold mb-2";
            } else {
                statusBadge.className = "badge bg-green-100 text-green-700 border-none font-bold mb-2";
            }
        } else {
            // No active appointments
            noApptState.classList.remove('hidden');
            activeApptState.classList.add('hidden');
        }
    });
}

// Function to trigger DaisyUI Chat Bubble / Toast
function showNotification(message, typeClass) {
    const bubble = document.createElement('div');
    bubble.className = `alert ${typeClass} shadow-lg text-white font-medium mb-2 transform transition-all duration-300 translate-x-full`;
    bubble.innerHTML = `<span>${message}</span>`;
    
    notificationContainer.appendChild(bubble);

    // Slide in animation
    setTimeout(() => {
        bubble.classList.remove('translate-x-full');
    }, 10);

    // Remove after 5 seconds
    setTimeout(() => {
        bubble.classList.add('opacity-0');
        setTimeout(() => bubble.remove(), 300);
    }, 5000);
}