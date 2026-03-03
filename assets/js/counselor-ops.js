import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    onSnapshot, 
    doc, 
    updateDoc,
    query,
    orderBy
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
const pendingContainer = document.getElementById('pending-container');
const confirmedContainer = document.getElementById('confirmed-container');

// Listen to the 'appointments' collection in Real-Time
if (pendingContainer && confirmedContainer) {
    const q = query(collection(db, "appointments"), orderBy("createdAt", "desc"));

    onSnapshot(q, (snapshot) => {
        pendingContainer.innerHTML = ''; // Clear loading text
        confirmedContainer.innerHTML = ''; // Clear loading text
        
        let pendingCount = 0;
        let confirmedCount = 0;

        snapshot.forEach((docSnapshot) => {
            const appointment = docSnapshot.data();
            const docId = docSnapshot.id; // We need the ID to update the status later

            if (appointment.status === "Pending") {
                pendingCount++;
                pendingContainer.innerHTML += generatePendingHTML(appointment, docId);
            } else if (appointment.status === "Confirmed") {
                confirmedCount++;
                confirmedContainer.innerHTML += generateConfirmedHTML(appointment);
            }
        });

        // Handle empty states
        if (pendingCount === 0) {
            pendingContainer.innerHTML = `<p class="text-sm text-stone-500 italic p-4">No pending requests right now.</p>`;
        }
        if (confirmedCount === 0) {
            confirmedContainer.innerHTML = `<p class="text-sm text-stone-500 italic p-4">No confirmed appointments yet.</p>`;
        }
    });
}

// Function to generate the HTML card for Pending requests
function generatePendingHTML(data, docId) {
    return `
    <div class="bg-white p-5 rounded-xl border border-orange-200 shadow-sm border-l-4 border-l-orange-400">
        <div class="flex justify-between items-start mb-2">
            <h4 class="font-bold text-stone-800">${data.studentEmail.split('@')[0]}</h4>
            <span class="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded font-semibold">Pending</span>
        </div>
        <p class="text-sm text-stone-500 mb-1 truncate">${data.reason}</p>
        <p class="text-sm text-stone-700 font-medium mb-4">Requested: ${data.date} at ${data.time}</p>
        <div class="flex gap-2">
            <button onclick="updateStatus('${docId}', 'Confirmed')" class="flex-1 bg-mahogany text-white text-sm py-2 rounded hover:bg-rust transition-colors shadow-sm">Accept</button>
            <button onclick="updateStatus('${docId}', 'Declined')" class="flex-1 bg-white border border-stone-300 text-stone-600 text-sm py-2 rounded hover:bg-stone-50 transition-colors">Decline</button>
        </div>
    </div>`;
}

// Function to generate the HTML row for Confirmed requests
function generateConfirmedHTML(data) {
    // Basic date parsing for the UI block
    const dateObj = new Date(data.date);
    const month = dateObj.toLocaleString('default', { month: 'short' });
    const day = dateObj.getDate() || '--';

    return `
    <div class="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
        <div class="flex items-center gap-4">
            <div class="bg-green-100 text-green-700 w-12 h-12 rounded-lg flex flex-col items-center justify-center">
                <span class="text-xs font-bold uppercase">${month}</span>
                <span class="text-lg font-black leading-none">${day}</span>
            </div>
            <div>
                <h4 class="font-bold text-stone-800 text-lg">${data.studentEmail.split('@')[0]}</h4>
                <p class="text-sm text-stone-500">${data.time} • ${data.reason.substring(0, 30)}...</p>
            </div>
        </div>
        <button class="px-4 py-2 text-sm font-medium text-rust border border-rust/30 rounded-lg hover:bg-rust hover:text-white transition-colors">View Details</button>
    </div>`;
}

// Make the updateStatus function globally available so the onclick attributes can fire it
window.updateStatus = async function(docId, newStatus) {
    try {
        const appointmentRef = doc(db, "appointments", docId);
        await updateDoc(appointmentRef, {
            status: newStatus
        });
        // We don't need to manually refresh the UI!
        // The onSnapshot listener will detect the database change and move the card automatically!
    } catch (error) {
        console.error("Error updating status:", error);
        alert("Failed to update appointment status.");
    }
};