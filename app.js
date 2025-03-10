import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

//import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
//import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
//import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyC5qQdiJpCHW6FtZnpa2RYdL-b66VqYQfk",
    authDomain: "streamplex-935ff.firebaseapp.com",
    databaseURL: "https://streamplex-935ff-default-rtdb.firebaseio.com",
    projectId: "streamplex-935ff",
    storageBucket: "streamplex-935ff.firebasestorage.app",
    messagingSenderId: "32314467540",
    appId: "1:32314467540:web:8a6ada369a64c4ecd80741"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function displayMessage(message, type = 'info') {
    let messageEl = document.getElementById('message');
    if (!messageEl) {
        // Create a message element dynamically if it doesn't exist
        messageEl = document.createElement('div');
        messageEl.id = 'message';
        // Basic styling (you can override this with your CSS)
        messageEl.style.position = 'fixed';
        messageEl.style.bottom = '20px';
        messageEl.style.left = '50%';
        messageEl.style.transform = 'translateX(-50%)';
        messageEl.style.padding = '10px 20px';
        messageEl.style.borderRadius = '5px';
        messageEl.style.fontFamily = 'Arial, sans-serif';
        messageEl.style.zIndex = '1000';
        document.body.appendChild(messageEl);
    }
    // Set background and text colors based on the type of message
    if (type === 'error') {
        messageEl.style.backgroundColor = '#f8d7da';
        messageEl.style.color = '#721c24';
        messageEl.style.border = '1px solid #f5c6cb';
    } else if (type === 'success') {
        messageEl.style.backgroundColor = '#d4edda';
        messageEl.style.color = '#155724';
        messageEl.style.border = '1px solid #c3e6cb';
    } else {
        messageEl.style.backgroundColor = '#d1ecf1';
        messageEl.style.color = '#0c5460';
        messageEl.style.border = '1px solid #bee5eb';
    }
    messageEl.innerText = message;
    // Clear the message after 1 second
    setTimeout(() => {
        messageEl.innerText = '';
    }, 1000);
}

// --- Signup ---
const signupBtn = document.getElementById('signupBtn');
if (signupBtn) {
    signupBtn.addEventListener('click', async () => {
        const username = document.getElementById('username').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Store user info in Firestore
            await setDoc(doc(db, "users", user.uid), {
                username: username,
                email: email,  // optional if you want to store the email too
                points: 0
            });

            // Display a success message then redirect after a short delay
            displayMessage('Signup successful!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } catch (error) {
            displayMessage('Error: ' + error.message, 'error');
        }
    });
}

// --- Login ---
const loginBtn = document.getElementById('loginBtn');
if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            displayMessage('Login successful!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } catch (error) {
            displayMessage('Error: ' + error.message, 'error');
        }
    });
}

// --- Dashboard (Show username, points, and uid) ---
if (document.getElementById('welcomeMessage')) {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                document.getElementById('welcomeMessage').innerText = `Hello ${userData.username}`;
                document.getElementById('pointsDisplay').innerText = `Points earned: ${userData.points}`;
                document.getElementById('userIdDisplay').innerText = user.uid;

                // Add copy user ID functionality
                const copyBtn = document.getElementById('copyUserIdBtn');
                if (copyBtn) {
                    copyBtn.addEventListener('click', () => {
                        navigator.clipboard.writeText(user.uid).then(() => {
                            displayMessage("User ID copied to clipboard!", 'success');
                        }).catch(err => {
                            displayMessage("Failed to copy User ID", 'error');
                        });
                    });
                }
            } else {
                displayMessage('User data not found!', 'error');
            }
        } else {
            window.location.href = 'login.html';
        }
    });

    // --- Logout ---
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await signOut(auth);
            window.location.href = 'login.html';
        });
    }
}