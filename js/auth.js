// ============================================
// MUDRIKA - FIREBASE AUTHENTICATION
// ============================================

console.log("auth.js loaded");

// Wait for the page to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("Page loaded, checking Firebase auth...");
    
    // Check if Firebase auth is available
    if (typeof auth !== 'undefined') {
        console.log("Firebase auth is available");
        
        // Listen for auth state changes
        auth.onAuthStateChanged(function(user) {
            if (user) {
                console.log("User is logged in:", user.email);
                // Update any UI elements that need to show user info
                updateUserDisplay(user);
            } else {
                console.log("No user is logged in");
            }
        });
    } else {
        console.error("Firebase auth not available! Check your script tags.");
    }
});

// Function to update display (can be called from other pages)
function updateUserDisplay(user) {
    const userDisplay = document.getElementById('userDisplay');
    if (userDisplay && user) {
        const username = localStorage.getItem('mudrika_username') || user.email.split('@')[0];
        userDisplay.innerHTML = `👋 ${username}`;
    }
}

// ============================================
// SIGN UP FUNCTION (WITH EMAIL VERIFICATION)
// ============================================
async function signup() {
    console.log("Signup function called");
    
    // Get form values - for signup.html we have 3 fields
    const usernameInput = document.getElementById('signup-username');
    const emailInput = document.getElementById('signup-email');
    const passwordInput = document.getElementById('signup-password');
    
    // If using old signup.html without IDs, try querySelector
    let username, email, password;
    
    if (usernameInput && emailInput && passwordInput) {
        username = usernameInput.value.trim();
        email = emailInput.value.trim();
        password = passwordInput.value;
    } else {
        // Fallback for older HTML structure
        const inputs = document.querySelectorAll("input");
        if (inputs.length >= 3) {
            username = inputs[0].value.trim();
            email = inputs[1].value.trim();
            password = inputs[2].value;
        } else {
            showMsg("Please use the updated signup form", "error");
            return;
        }
    }
    
    // Validation
    if (!username || !email || !password) {
        showMsg("Please fill in all fields.", "error");
        return;
    }
    
    if (password.length < 6) {
        showMsg("Password must be at least 6 characters.", "error");
        return;
    }
    
    // Show loading message
    showMsg("Creating account...", "success");
    
    try {
        // Create user with Firebase
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        console.log("User created successfully:", user.uid);
        
        // ============================================
        // SEND EMAIL VERIFICATION
        // ============================================
        await user.sendEmailVerification();
        console.log("Verification email sent to:", email);
        
        // Store username in localStorage
        localStorage.setItem('mudrika_username', username);
        localStorage.setItem('mudrika_user_id', user.uid);
        
        // Initialize user progress
        const initialProgress = {
            completedLessons: [],
            totalXP: 0,
            xp: 0,
            streak: 0,
            quizScores: {},
            lessonScores: {}
        };
        
        localStorage.setItem('completedLessons', JSON.stringify(initialProgress.completedLessons));
        localStorage.setItem('totalXP', initialProgress.totalXP.toString());
        localStorage.setItem('xp', initialProgress.xp.toString());
        localStorage.setItem('streak', initialProgress.streak.toString());
        localStorage.setItem('quizScores', JSON.stringify(initialProgress.quizScores));
        localStorage.setItem('lessonScores', JSON.stringify(initialProgress.lessonScores));
        
        // Save to Firestore
        await saveUserProgress(user.uid, initialProgress);
        
        // Show success message with verification notice
        showMsg("Account created! Verification email sent to " + email + ". Please check your inbox and verify your email.", "success");
        
        // Redirect after 2 seconds (giving time to read the message)
        setTimeout(() => {
            window.location.href = "index.html";
        }, 2000);
        
    } catch (error) {
        console.error("Signup error:", error);
        
        // Handle common errors
        let errorMessage = "Signup failed. ";
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = "This email is already registered. Please login instead.";
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = "Please enter a valid email address.";
        } else if (error.code === 'auth/weak-password') {
            errorMessage = "Password should be at least 6 characters.";
        } else {
            errorMessage += error.message;
        }
        
        showMsg(errorMessage, "error");
    }
}

// ============================================
// LOGIN FUNCTION
// ============================================
async function login() {
    console.log("Login function called");
    
    // Get form values
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    
    let email, password;
    
    if (emailInput && passwordInput) {
        email = emailInput.value.trim();
        password = passwordInput.value;
    } else {
        // Fallback for older HTML structure
        const inputs = document.querySelectorAll("input");
        if (inputs.length >= 2) {
            email = inputs[0].value.trim();
            password = inputs[1].value;
        } else {
            showMsg("Please use the updated login form", "error");
            return;
        }
    }
    
    // Validation
    if (!email || !password) {
        showMsg("Please fill in all fields.", "error");
        return;
    }
    
    // Show loading message
    showMsg("Logging in...", "success");
    
    try {
        // Sign in with Firebase
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        console.log("User logged in:", user.uid);
        
        localStorage.setItem('mudrika_user_id', user.uid);
        localStorage.setItem('mudrika_user_email', user.email);
        
        // Check if email is verified (optional - can show warning but still allow login)
        if (!user.emailVerified) {
            showMsg("⚠️ Email not verified. Please check your inbox and verify your email.", "error");
            // Optional: You can still allow login but show warning
        }
        
        // Get username (from localStorage or use email prefix)
        const username = localStorage.getItem('mudrika_username') || email.split('@')[0];
        
        await syncProgressWithFirestore(user.uid);
        
        showMsg("Welcome back, " + username + "!", "success");
        
        // Redirect after 1.5 seconds
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1500);
        
    } catch (error) {
        console.error("Login error:", error);
        
        // Handle common errors
        let errorMessage = "Login failed. ";
        if (error.code === 'auth/user-not-found') {
            errorMessage = "No account found with this email. Please sign up first.";
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = "Incorrect password. Please try again.";
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = "Please enter a valid email address.";
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = "Too many failed attempts. Please try again later.";
        } else {
            errorMessage += error.message;
        }
        
        showMsg(errorMessage, "error");
    }
}

// ============================================
// GOOGLE SIGN-IN FUNCTION
// ============================================
async function loginWithGoogle() {
    console.log("Google Sign-In called");
    
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        
        showMsg("Opening Google Sign-In...", "success");
        
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        
        console.log("Google Sign-In successful:", user.email);
        
        let username = user.displayName;
        if (!username) {
            username = user.email.split('@')[0];
        }
        
        localStorage.setItem('mudrika_username', username);
        localStorage.setItem('mudrika_user_id', user.uid);
        localStorage.setItem('mudrika_user_email', user.email);
        console.log("User ID saved to localStorage:", user.uid);
        
        // Note: Google users are automatically verified by Google
        if (user.emailVerified) {
            console.log("Google user email is verified");
        }
        
        // Sync with Firestore
        const firestoreData = await loadUserProgress(user.uid);
        
        if (!firestoreData) {
            // New user - initialize progress
            const initialProgress = {
                completedLessons: [],
                totalXP: 0,
                xp: 0,
                streak: 0,
                quizScores: {},
                lessonScores: {}
            };
            
            localStorage.setItem('completedLessons', JSON.stringify(initialProgress.completedLessons));
            localStorage.setItem('totalXP', initialProgress.totalXP.toString());
            localStorage.setItem('xp', initialProgress.xp.toString());
            localStorage.setItem('streak', initialProgress.streak.toString());
            localStorage.setItem('quizScores', JSON.stringify(initialProgress.quizScores));
            localStorage.setItem('lessonScores', JSON.stringify(initialProgress.lessonScores));
            
            await saveUserProgress(user.uid, initialProgress);
        } else {
            // Existing user - load progress
            await syncProgressWithFirestore(user.uid);
        }
        
        showMsg("Welcome, " + username + "!", "success");
        
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1500);
        
    } catch (error) {
        console.error("Google Sign-In error:", error);
        
        let errorMessage = "Google Sign-In failed. ";
        if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = "Sign-in popup was closed. Please try again.";
        } else if (error.code === 'auth/popup-blocked') {
            errorMessage = "Pop-up was blocked. Please allow pop-ups for this site.";
        } else if (error.code === 'auth/unauthorized-domain') {
            errorMessage = "This domain is not authorized. Please check Firebase settings.";
        } else {
            errorMessage += error.message;
        }
        
        showMsg(errorMessage, "error");
    }
}

// ============================================
// GUEST LOGIN
// ============================================
function loginAsGuest() {
    console.log("Guest login");
    
    // Store guest session in localStorage
    localStorage.setItem('mudrika_current_user', 'guest');
    localStorage.setItem('mudrika_username', 'Guest User');
    
    // Initialize guest progress if not exists
    if (!localStorage.getItem('completedLessons')) {
        localStorage.setItem('completedLessons', JSON.stringify([]));
    }
    if (!localStorage.getItem('totalXP')) {
        localStorage.setItem('totalXP', '0');
    }
    if (!localStorage.getItem('xp')) {
        localStorage.setItem('xp', '0');
    }
    if (!localStorage.getItem('streak')) {
        localStorage.setItem('streak', '0');
    }
    
    showMsg("Continuing as guest...", "success");
    
    setTimeout(() => {
        window.location.href = "index.html";
    }, 1000);
}

// ============================================
// LOGOUT FUNCTION
// ============================================
async function logout() {
    console.log("Logout function called");
    
    try {
        if (typeof auth !== 'undefined') {
            await auth.signOut();
        }
        localStorage.removeItem('mudrika_current_user');
        localStorage.removeItem('mudrika_username');
        localStorage.removeItem('mudrika_user_id');
        
        showMsg("Logged out successfully!", "success");
        
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1000);
        
    } catch (error) {
        console.error("Logout error:", error);
        showMsg("Logout failed. Please try again.", "error");
    }
}

// ============================================
// GET CURRENT USER INFO
// ============================================
function getCurrentUser() {
    if (typeof auth !== 'undefined') {
        const user = auth.currentUser;
        if (user) {
            return {
                uid: user.uid,
                email: user.email,
                emailVerified: user.emailVerified,
                username: localStorage.getItem('mudrika_username') || user.email.split('@')[0]
            };
        }
    }
    
    // Check for guest
    if (localStorage.getItem('mudrika_current_user') === 'guest') {
        return {
            uid: 'guest',
            email: null,
            emailVerified: false,
            username: 'Guest User'
        };
    }
    
    return null;
}

// ============================================
// CHECK IF USER IS LOGGED IN
// ============================================
function isLoggedIn() {
    return new Promise((resolve) => {
        if (typeof auth !== 'undefined') {
            auth.onAuthStateChanged(function(user) {
                resolve(user !== null);
            });
        } else {
            resolve(localStorage.getItem('mudrika_current_user') === 'guest');
        }
    });
}

// ============================================
// FORGOT PASSWORD FUNCTION
// ============================================
async function forgotPassword() {
    console.log("Forgot password called");
    
    // Ask for email
    const email = prompt("Please enter your email address to reset your password:");
    
    if (!email) {
        return; // User cancelled
    }
    
    // Basic email validation
    if (!email.includes('@') || !email.includes('.')) {
        showMsg("Please enter a valid email address.", "error");
        return;
    }
    
    showMsg("Sending password reset email...", "success");
    
    try {
        await auth.sendPasswordResetEmail(email);
        showMsg("Password reset email sent! Check your inbox.", "success");
        console.log("Password reset email sent to:", email);
    } catch (error) {
        console.error("Password reset error:", error);
        
        let errorMessage = "Failed to send reset email. ";
        if (error.code === 'auth/user-not-found') {
            errorMessage = "No account found with this email address.";
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = "Please enter a valid email address.";
        } else {
            errorMessage += error.message;
        }
        
        showMsg(errorMessage, "error");
    }
}

// ============================================
// RESEND VERIFICATION EMAIL FUNCTION
// ============================================
async function resendVerificationEmail() {
    console.log("Resend verification email called");
    
    const user = auth.currentUser;
    
    if (!user) {
        showMsg("Please log in to resend verification email.", "error");
        return;
    }
    
    if (user.emailVerified) {
        showMsg("Your email is already verified!", "success");
        return;
    }
    
    showMsg("Sending verification email...", "success");
    
    try {
        await user.sendEmailVerification();
        showMsg("Verification email sent! Please check your inbox.", "success");
        console.log("Verification email sent to:", user.email);
    } catch (error) {
        console.error("Error sending verification email:", error);
        showMsg("Failed to send verification email. Please try again later.", "error");
    }
}

// ============================================
// HELPER FUNCTION TO SHOW MESSAGES
// ============================================
function showMsg(msg, type) {
    console.log("Showing message:", msg, type);
    
    let el = document.getElementById("auth-msg");
    
    // If element doesn't exist, create it
    if (!el) {
        el = document.createElement("p");
        el.id = "auth-msg";
        el.style.cssText = "font-weight:600;margin-top:12px;font-size:0.9rem;";
        
        // Try to find where to insert it
        const button = document.querySelector("button");
        if (button) {
            button.insertAdjacentElement("afterend", el);
        } else {
            const container = document.querySelector("div[style*='flex']");
            if (container) container.appendChild(el);
        }
    }
    
    el.textContent = msg;
    el.style.color = type === "error" ? "#E53935" : "#4CAF50";
    
    // Clear message after 5 seconds for verification messages (longer)
    const timeout = msg.includes("verification") ? 5000 : 3000;
    setTimeout(() => {
        if (el) el.textContent = "";
    }, timeout);
}