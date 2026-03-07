import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { 
    getFirestore, collection, onSnapshot, doc, updateDoc, addDoc, serverTimestamp 
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

const usersTableBody = document.querySelector('tbody');

// Fetch all users in real-time
if (usersTableBody) {
    onSnapshot(collection(db, "users"), (snapshot) => {
        usersTableBody.innerHTML = ''; // Clear table
        
        if (snapshot.empty) {
            usersTableBody.innerHTML = `<tr><td colspan="4" class="text-center italic text-stone-500 py-4">No users found.</td></tr>`;
            return;
        }

        snapshot.forEach((docSnapshot) => {
            const user = docSnapshot.data();
            const userId = docSnapshot.id;
            
            // Skip showing the admin themselves in the management table
            if (user.role === 'admin') return;

            // Define status and UI colors
            const currentStatus = user.accountStatus || 'Active';
            const statusColor = currentStatus === 'Active' ? 'text-green-600' : 'text-red-600';
            const roleBadge = user.role === 'counselor' 
                ? '<span class="badge bg-blue-100 text-blue-700 border-none badge-sm">Counselor</span>'
                : '<span class="badge badge-ghost badge-sm">Student</span>';

            // Button Logic (Toggle between Suspend and Reactivate)
            const actionBtn = currentStatus === 'Active'
                ? `<button onclick="toggleUserStatus('${userId}', 'Suspended')" class="btn btn-xs btn-outline btn-error">Suspend</button>`
                : `<button onclick="toggleUserStatus('${userId}', 'Active')" class="btn btn-xs btn-outline btn-success">Reactivate</button>`;

            usersTableBody.innerHTML += `
                <tr>
                    <td>
                        <div class="font-bold text-slate-800">${user.fullName || 'Unknown User'}</div>
                        <div class="text-sm text-slate-500">${user.email}</div>
                    </td>
                    <td>${roleBadge}</td>
                    <td><span class="${statusColor} text-sm font-bold">${currentStatus}</span></td>
                    <td>${actionBtn}</td>
                </tr>
            `;
        });
    });
}

// Global function to update user status
window.toggleUserStatus = async function(userId, newStatus) {
    // Add a confirmation dialog so the admin doesn't click it by accident
    const confirmMessage = newStatus === 'Suspended' 
        ? "Are you sure you want to suspend this user? They will not be able to log in."
        : "Reactivate this user's account?";
        
    if (!confirm(confirmMessage)) return;

    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            accountStatus: newStatus
        });
        // The table will automatically re-render because of onSnapshot!
    } catch (error) {
        console.error("Error updating user status: ", error);
        alert("Failed to update user status.");
    }
};

// Add User Mock Function (For Prototype)
const addUserBtn = document.querySelector('button.bg-slate-900');
if (addUserBtn) {
    addUserBtn.addEventListener('click', () => {
        alert("In a production environment, this opens a secure modal to invite users via email or create them using the Firebase Admin SDK.");
    });
}