import { auth, db } from "./firebase-config.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    const authBtn = document.getElementById("authBtn");
    const toggleAuthMode = document.getElementById("toggleAuthMode");
    const authTitle = document.getElementById("authTitle");
    const usernameInput = document.getElementById("username");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const errorMsg = document.getElementById("errorMsg");

    // Theme loading
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "clean") {
        document.body.classList.add("clean");
    }

    let isSignUp = false;

    // Check if already logged in -> redirect to dashboard
    onAuthStateChanged(auth, (user) => {
        if (user) {
            window.location.href = "index.html";
        }
    });

    toggleAuthMode.onclick = () => {
        isSignUp = !isSignUp;
        errorMsg.innerText = "";
        
        if (isSignUp) {
            authTitle.innerText = "Sign Up";
            authBtn.innerText = "Sign Up";
            toggleAuthMode.innerText = "Already have an account? Sign In";
            usernameInput.style.display = "block";
        } else {
            authTitle.innerText = "Sign In";
            authBtn.innerText = "Sign In";
            toggleAuthMode.innerText = "Need an account? Sign Up";
            usernameInput.style.display = "none";
        }
    };

    authBtn.onclick = async () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const username = usernameInput.value.trim();

        if (!email || !password) {
            errorMsg.innerText = "Please fill in all required fields.";
            return;
        }

        if (isSignUp && !username) {
            errorMsg.innerText = "Username is required for Sign Up.";
            return;
        }

        try {
            errorMsg.innerText = "";
            authBtn.disabled = true;
            authBtn.innerText = "Wait...";

            if (isSignUp) {
                // Sign Up Process
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                
                // Save user metadata to Firestore
                await setDoc(doc(db, "users", user.uid), {
                    username: username,
                    email: email,
                    createdAt: new Date()
                });
            } else {
                // Sign In Process
                await signInWithEmailAndPassword(auth, email, password);
            }
            // Will auto redirect due to onAuthStateChanged listener
        } catch (error) {
            console.error(error);
            // Firebase sends generic/long messages; you can tidy them up here if desired
            errorMsg.innerText = error.message.replace("Firebase: ", "");
            authBtn.disabled = false;
            authBtn.innerText = isSignUp ? "Sign Up" : "Sign In";
        }
    };
});
