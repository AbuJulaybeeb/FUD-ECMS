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
    const q = query(
        collection(db, "appointments"), 
        where("studentId", "==", studentId)
    );

    onSnapshot(q, (snapshot) => {
        // Toast Notifications for status changes
        snapshot.docChanges().forEach((change) => {
            if (change.type === "modified") {
                const data = change.doc.data();
                if (data.status === "Confirmed") {
                    showNotification(`✅ Good news! Your session on ${data.date} is confirmed.`, "alert-success");
                } else if (data.status === "Declined") {
                    showNotification(`❌ Update: Your session request for ${data.date} was declined.`, "alert-error");
                }
            }
        });

        // Extract, Filter, and Sort data for the Dashboard Card
        let activeAppointments = [];
        
        snapshot.forEach((doc) => {
            const data = doc.data();
            // We only want to show Pending or Confirmed sessions on the main dashboard
            if (data.status === "Pending" || data.status === "Confirmed") {
                activeAppointments.push(data);
            }
        });

        // Sort by Date (Closest date first)
        activeAppointments.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Update the UI
        if (activeAppointments.length > 0) {
            const nextAppt = activeAppointments[0]; // Grab the closest upcoming one

            // Hide the "Empty" state, show the "Active" state
            noApptState.classList.add('hidden');
            activeApptState.classList.remove('hidden');

            // Populate the data into the HTML elements
            document.getElementById('next-appt-status').textContent = nextAppt.status;
            document.getElementById('next-appt-counselor').textContent = 
                nextAppt.counselorId === 'dr_jenkins' ? 'Dr. Sarah Jenkins' : 'Dr. Michael Chen';
            
            // Truncate the reason if it's too long
            let reasonText = nextAppt.reason;
            if (reasonText.length > 35) reasonText = reasonText.substring(0, 35) + "...";
            document.getElementById('next-appt-reason').textContent = reasonText;
            
            document.getElementById('next-appt-date').textContent = nextAppt.date;
            document.getElementById('next-appt-time').textContent = nextAppt.time;

            // Change badge color based on status
            const statusBadge = document.getElementById('next-appt-status');
            if (nextAppt.status === "Pending") {
                statusBadge.className = "badge bg-orange-100 text-orange-700 border-none font-bold mb-2";
            } else {
                statusBadge.className = "badge bg-green-100 text-green-700 border-none font-bold mb-2";
            }
        } else {
            // No active appointments found (hide card, show empty state)
            noApptState.classList.remove('hidden');
            activeApptState.classList.add('hidden');
        }
    });
}

// Function to trigger DaisyUI Chat Bubble / Toast
function showNotification(message, typeClass) {
    if (!notificationContainer) return;
    
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