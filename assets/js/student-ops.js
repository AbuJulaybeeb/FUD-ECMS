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
    // Query appointments, sort by creation date
    const q = query(
        collection(db, "appointments"), 
        where("studentId", "==", studentId),
        orderBy("createdAt", "desc")
    );

    onSnapshot(q, (snapshot) => {
        // Notifications Logic
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

        const historyList = document.getElementById('dashboard-history-list');
        historyList.innerHTML = ''; // Clear loading text
        
        let latestAppointment = null;
        let appointmentCount = 0;

        snapshot.forEach((doc) => {
            const data = doc.data();
            appointmentCount++;

            // Determine Next Appointment Card (First Pending/Confirmed found)
            if (!latestAppointment && (data.status === "Confirmed" || data.status === "Pending")) {
                latestAppointment = data;
            }

            // Build History Table Rows
            let badgeClass = "badge-ghost";
            if (data.status === "Pending") badgeClass = "badge-warning";
            if (data.status === "Confirmed") badgeClass = "badge-info text-white";
            if (data.status === "Completed") badgeClass = "badge-success text-white";
            if (data.status === "Declined") badgeClass = "badge-error text-white";

            const counselorName = data.counselorId === 'dr_jenkins' ? 'Dr. Sarah Jenkins' : 'Dr. Michael Chen';

            historyList.innerHTML += `
                <tr>
                    <td class="font-medium">${data.date}<br><span class="text-xs text-stone-400">${data.time}</span></td>
                    <td>${counselorName}</td>
                    <td class="truncate max-w-xs">${data.reason}</td>
                    <td><div class="badge ${badgeClass} font-bold shadow-sm">${data.status}</div></td>
                </tr>
            `;
        });

        if (appointmentCount === 0) {
            historyList.innerHTML = `<tr><td colspan="4" class="text-center italic text-stone-500 py-4">No sessions booked yet.</td></tr>`;
        }

        // Update Next Appointment UI Card
        if (latestAppointment) {
            noApptState.classList.add('hidden');
            activeApptState.classList.remove('hidden');
            document.getElementById('next-appt-status').textContent = latestAppointment.status;
            document.getElementById('next-appt-counselor').textContent = latestAppointment.counselorId === 'dr_jenkins' ? 'Dr. Sarah Jenkins' : 'Dr. Michael Chen';
            document.getElementById('next-appt-reason').textContent = latestAppointment.reason;
            document.getElementById('next-appt-date').textContent = latestAppointment.date;
            document.getElementById('next-appt-time').textContent = latestAppointment.time;

            const statusBadge = document.getElementById('next-appt-status');
            statusBadge.className = latestAppointment.status === "Pending" 
                ? "badge bg-orange-100 text-orange-700 border-none font-bold mb-2" 
                : "badge bg-green-100 text-green-700 border-none font-bold mb-2";
        } else {
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