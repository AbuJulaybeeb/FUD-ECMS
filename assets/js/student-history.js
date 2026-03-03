import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { 
    getFirestore, collection, query, where, onSnapshot, orderBy, doc, updateDoc 
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

const tableBody = document.getElementById('history-table-body');
let currentUserId = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUserId = user.uid;
        loadHistory(user.uid);
    }
});

function loadHistory(studentId) {
    const q = query(
        collection(db, "appointments"),
        where("studentId", "==", studentId),
        orderBy("createdAt", "desc")
    );

    onSnapshot(q, (snapshot) => {
        tableBody.innerHTML = ''; // Clear existing
        
        if (snapshot.empty) {
            tableBody.innerHTML = `<tr><td colspan="4" class="text-center italic text-stone-500 py-4">No session history found.</td></tr>`;
            return;
        }

        snapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            const docId = docSnapshot.id;
            
            // Format Badge
            let badgeClass = "badge-ghost";
            if (data.status === "Pending") badgeClass = "badge-warning";
            if (data.status === "Confirmed") badgeClass = "badge-info text-white";
            if (data.status === "Completed") badgeClass = "badge-success text-white";
            if (data.status === "Declined") badgeClass = "badge-error text-white";

            // Determine if we should show the "Feedback" button
            let actionHtml = '';
            if (data.status === "Completed" && !data.feedbackProvided) {
                actionHtml = `<button onclick="openFeedback('${docId}')" class="btn btn-xs bg-rust text-white border-none hover:bg-mahogany">Leave Feedback</button>`;
            } else if (data.status === "Completed" && data.feedbackProvided) {
                 actionHtml = `<span class="text-xs text-stone-400">Feedback Submitted</span>`;
            }

            tableBody.innerHTML += `
                <tr>
                    <td class="font-medium">${data.date}<br><span class="text-xs text-stone-400">${data.time}</span></td>
                    <td>${data.counselorId === 'dr_jenkins' ? 'Dr. Sarah Jenkins' : 'Dr. Michael Chen'}</td>
                    <td class="truncate max-w-xs">${data.reason}</td>
                    <td>
                        <div class="flex flex-col gap-2 items-start">
                            <div class="badge ${badgeClass} gap-2">${data.status}</div>
                            ${actionHtml}
                        </div>
                    </td>
                </tr>
            `;
        });
    });
}

// Global function to open modal
window.openFeedback = function(docId) {
    document.getElementById('feedback-appointment-id').value = docId;
    document.getElementById('feedback_modal').showModal();
};

// Handle Feedback Submission
const feedbackForm = document.getElementById('feedback-form');
if (feedbackForm) {
    feedbackForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const appointmentId = document.getElementById('feedback-appointment-id').value;
        // DaisyUI Rating uses radio groups. We find the checked one.
        const rating = document.querySelector('input[name="session-rating"]:checked').value;
        const comments = document.getElementById('feedback-comments').value;
        const submitBtn = feedbackForm.querySelector('button[type="submit"]');

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = "Submitting...";

            // Update the appointment document to include the feedback
            const appointmentRef = doc(db, "appointments", appointmentId);
            await updateDoc(appointmentRef, {
                feedbackProvided: true,
                feedbackRating: parseInt(rating),
                feedbackComments: comments
            });

            alert("Thank you! Your feedback has been recorded.");
            feedbackForm.reset();
            document.getElementById('feedback_modal').close();

        } catch (error) {
            console.error("Error submitting feedback: ", error);
            alert("Failed to submit feedback.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Submit Feedback";
        }
    });
}