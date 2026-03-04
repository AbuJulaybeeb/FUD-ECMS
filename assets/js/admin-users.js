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

const tableBody = document.getElementById('admin-users-tbody');

// Fetch Users in Real-Time
if (tableBody) {
    onSnapshot(collection(db, "users"), (snapshot) => {
        tableBody.innerHTML = '';
        
        snapshot.forEach((docSnapshot) => {
            const user = docSnapshot.data();
            const userId = docSnapshot.id;
            
            // Default to Active if no status field exists yet
            const status = user.status || "Active"; 
            const isSuspended = status === "Suspended";
            
            const statusBadge = isSuspended 
                ? `<span class="text-red-600 text-sm font-bold">Suspended</span>` 
                : `<span class="text-green-600 text-sm font-bold">Active</span>`;
                
            const actionBtn = isSuspended
                ? `<button onclick="toggleUserStatus('${userId}', 'Active')" class="btn btn-xs btn-outline btn-success">Reactivate</button>`
                : `<button onclick="toggleUserStatus('${userId}', 'Suspended')" class="btn btn-xs btn-outline btn-error">Suspend</button>`;

            tableBody.innerHTML += `
                <tr class="${isSuspended ? 'opacity-50 bg-red-50' : ''}">
                    <td>
                        <div class="font-bold text-slate-800">${user.fullName || "N/A"}</div>
                        <div class="text-sm text-slate-500">${user.email}</div>
                    </td>
                    <td><span class="badge badge-ghost badge-sm capitalize">${user.role}</span></td>
                    <td>${statusBadge}</td>
                    <td>${actionBtn}</td>
                </tr>
            `;
        });
    });
}

// 2. Suspend/Reactivate Logic (Global function)
window.toggleUserStatus = async function(userId, newStatus) {
    if(confirm(`Are you sure you want to mark this user as ${newStatus}?`)) {
        try {
            await updateDoc(doc(db, "users", userId), { status: newStatus });
        } catch (error) {
            console.error("Error updating user: ", error);
            alert("Failed to update user status.");
        }
    }
};

// Add User Logic (Creates a profile document)
const addUserForm = document.getElementById('add-user-form');
if (addUserForm) {
    addUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('new-user-name').value;
        const email = document.getElementById('new-user-email').value;
        const role = document.getElementById('new-user-role').value;
        const btn = addUserForm.querySelector('button[type="submit"]');

        try {
            btn.textContent = "Creating...";
            btn.disabled = true;

            await addDoc(collection(db, "users"), {
                fullName: name,
                email: email,
                role: role,
                status: "Active",
                createdAt: serverTimestamp()
            });

            alert("User profile created successfully!");
            addUserForm.reset();
            document.getElementById('add_user_modal').close();
        } catch (error) {
            console.error("Error adding user: ", error);
        } finally {
            btn.textContent = "Create Profile";
            btn.disabled = false;
        }
    });
}