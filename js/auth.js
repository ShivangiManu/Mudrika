/*
function login() {
  alert("Logged in as guest (backend not connected yet).");
  window.location.href = "index.html";
}

function signup() {
  alert("Signup successful (dummy). Please login.");
  window.location.href = "login.html";
}
*/

// Simple localStorage-based auth (no real backend needed for a school project)
// Users are stored as { username, password } in localStorage


/*
function signup() {
  const inputs = document.querySelectorAll("input");
  const username = inputs[0].value.trim();
  const password = inputs[1].value;

  if (!username || !password) {
    showMsg("Please fill in all fields.", "error"); return;
  }
  if (password.length < 4) {
    showMsg("Password must be at least 4 characters.", "error"); return;
  }

  const users = JSON.parse(localStorage.getItem("mudrika_users") || "{}");
  if (users[username]) {
    showMsg("Username already taken. Try another.", "error"); return;
  }

  users[username] = password;
  localStorage.setItem("mudrika_users", JSON.stringify(users));
  localStorage.setItem("mudrika_current_user", username);
  showMsg("Account created! Redirecting...", "success");
  setTimeout(() => window.location.href = "index.html", 1200);
}

function login() {
  const inputs = document.querySelectorAll("input");
  const username = inputs[0].value.trim();
  const password = inputs[1].value;

  if (!username || !password) {
    showMsg("Please fill in all fields.", "error"); return;
  }

  const users = JSON.parse(localStorage.getItem("mudrika_users") || "{}");
  if (!users[username] || users[username] !== password) {
    showMsg("Incorrect username or password.", "error"); return;
  }

  localStorage.setItem("mudrika_current_user", username);
  showMsg("Welcome back, " + username + "!", "success");
  setTimeout(() => window.location.href = "index.html", 1200);
}

// Guest login (merged) — skips credentials, sets a guest session
function loginAsGuest() {
  localStorage.setItem("mudrika_current_user", "guest");
  showMsg("Continuing as guest...", "success");
  setTimeout(() => window.location.href = "index.html", 1000);
}

function logout() {
  localStorage.removeItem("mudrika_current_user");
  window.location.href = "login.html";
}

function showMsg(msg, type) {
  let el = document.getElementById("auth-msg");
  if (!el) {
    el = document.createElement("p");
    el.id = "auth-msg";
    el.style.cssText = "font-weight:600;margin-top:12px;font-size:0.9rem;";
    document.querySelector("button").insertAdjacentElement("afterend", el);
  }
  el.textContent = msg;
  el.style.color = type === "error" ? "#E53935" : "#4CAF50";
}
 */

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
// SIGN UP FUNCTION
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
    
    //console.log("Signup attempt for:", email);
    
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
        
        // Store username in localStorage (we'll move to Firestore later)
        localStorage.setItem('mudrika_username', username);
        localStorage.setItem('mudrika_user_id', user.uid);
        
        // Initialize user progress
        /*
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
        */
        
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
        
        // 🔥 Save to Firestore
        await saveUserProgress(user.uid, initialProgress);
        
        showMsg("Account created successfully! Redirecting...", "success");
        
        // Redirect after 1.5 seconds
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1500);
        
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
    
    //console.log("Login attempt for:", email);
    
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
        
        await syncProgressWithFirestore(user.uid);

        // Get username (from localStorage or use email prefix)
        const username = localStorage.getItem('mudrika_username') || email.split('@')[0];
        
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

// Update the Google Sign-In function to sync with Firestore
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
        
        // 🔥 Sync with Firestore
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
                username: localStorage.getItem('mudrika_username') || user.email.split('@')[0]
            };
        }
    }
    
    // Check for guest
    if (localStorage.getItem('mudrika_current_user') === 'guest') {
        return {
            uid: 'guest',
            email: null,
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
    
    // Clear message after 3 seconds
    setTimeout(() => {
        if (el) el.textContent = "";
    }, 3000);
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

