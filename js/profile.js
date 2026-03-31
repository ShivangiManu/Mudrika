// ============================================
// MUDRIKA - PROFILE PAGE SCRIPT
// ============================================

let currentUser = null;
let currentUserData = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log("Profile page loaded");
    
    // Check if user is logged in
    if (typeof auth !== 'undefined') {
        auth.onAuthStateChanged(async function(user) {
            if (user) {
                currentUser = user;
                console.log("User loaded:", user.uid);
                await loadUserProfile();
                setupEventListeners();
                updateNavbarDisplay(user);
            } else {
                // Not logged in, redirect to login
                window.location.href = "login.html";
            }
        });
    } else {
        console.error("Firebase auth not available");
        window.location.href = "login.html";
    }
});

async function loadUserProfile() {
    if (!currentUser) return;
    
    // Load from Firestore
    try {
        currentUserData = await loadUserProfileData(currentUser.uid);
        console.log("Profile data loaded:", currentUserData);
    } catch (error) {
        console.error("Error loading profile:", error);
        currentUserData = {};
    }
    
    // Display basic info
    document.getElementById('userEmailDisplay').textContent = currentUser.email;
    document.getElementById('userEmailValue').textContent = currentUser.email;
    document.getElementById('userNameDisplay').textContent = currentUserData.displayName || currentUser.displayName || currentUser.email.split('@')[0];
    document.getElementById('displayNameText').textContent = currentUserData.displayName || currentUser.displayName || currentUser.email.split('@')[0];
    
    // Display profile picture
    if (currentUserData.profilePic) {
        document.getElementById('profileImage').src = currentUserData.profilePic;
    } else if (currentUser.photoURL) {
        document.getElementById('profileImage').src = currentUser.photoURL;
    } else {
        document.getElementById('profileImage').src = 'assets/default-avatar.png';
    }
    
    // Account creation date
    if (currentUser.metadata && currentUser.metadata.creationTime) {
        const createdDate = new Date(currentUser.metadata.creationTime);
        document.getElementById('accountCreated').textContent = createdDate.toLocaleDateString();
    } else {
        document.getElementById('accountCreated').textContent = 'N/A';
    }
    
    // Email verification status
    updateEmailVerificationStatus();
}

function updateEmailVerificationStatus() {
    const emailStatus = document.getElementById('emailStatus');
    const verifyBtn = document.getElementById('verifyEmailBtn');
    
    if (currentUser.emailVerified) {
        emailStatus.innerHTML = '<span style="color:#4CAF50;">✓ Email verified</span>';
        emailStatus.className = 'message success';
        verifyBtn.disabled = true;
        verifyBtn.textContent = 'Verified';
    } else {
        emailStatus.innerHTML = '<span style="color:#E53935;">⚠ Email not verified. Verify to access all features.</span>';
        emailStatus.className = 'message error';
        verifyBtn.disabled = false;
        verifyBtn.textContent = 'Send Verification Email';
    }
}

async function sendVerificationEmail() {
    if (!currentUser) return;
    
    const verifyBtn = document.getElementById('verifyEmailBtn');
    const emailStatus = document.getElementById('emailStatus');
    
    verifyBtn.disabled = true;
    verifyBtn.textContent = 'Sending...';
    
    try {
        await currentUser.sendEmailVerification();
        emailStatus.innerHTML = '<span style="color:#4CAF50;">✓ Verification email sent! Check your inbox.</span>';
        emailStatus.className = 'message success';
        setTimeout(() => {
            emailStatus.innerHTML = '';
        }, 5000);
    } catch (error) {
        console.error("Error sending verification email:", error);
        emailStatus.innerHTML = '<span style="color:#E53935;">Error: ' + error.message + '</span>';
        emailStatus.className = 'message error';
    } finally {
        verifyBtn.disabled = false;
        verifyBtn.textContent = 'Send Verification Email';
    }
}

async function updateDisplayName(newName) {
    if (!currentUser || !newName.trim()) return false;
    
    try {
        // Update in Firebase Auth (if user is using email/password)
        // Note: Google sign-in users might have restrictions, but we can still update
        await currentUser.updateProfile({
            displayName: newName.trim()
        });
        
        // Update in Firestore
        await saveUserProfileData(currentUser.uid, {
            displayName: newName.trim()
        });
        
        // Update local storage
        localStorage.setItem('mudrika_username', newName.trim());
        
        // Refresh UI
        await loadUserProfile();
        
        showMessage('Name updated successfully!', 'success');
        return true;
    } catch (error) {
        console.error("Error updating name:", error);
        showMessage('Error updating name: ' + error.message, 'error');
        return false;
    }
}

async function uploadProfilePicture(file) {
    if (!currentUser || !file) return;
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        showMessage('Image too large. Max 5MB.', 'error');
        return;
    }
    
    // Show loading
    const uploadBtn = document.getElementById('uploadPicBtn');
    uploadBtn.textContent = 'Uploading...';
    uploadBtn.disabled = true;
    
    try {
        // Convert to base64 for simplicity (or use Firebase Storage)
        const reader = new FileReader();
        reader.onloadend = async function() {
            const base64String = reader.result;
            
            // Save to Firestore
            await saveUserProfileData(currentUser.uid, {
                profilePic: base64String
            });
            
            // Update display
            document.getElementById('profileImage').src = base64String;
            showMessage('Profile picture updated!', 'success');
            
            uploadBtn.textContent = '📷 Change Photo';
            uploadBtn.disabled = false;
        };
        reader.readAsDataURL(file);
        
    } catch (error) {
        console.error("Error uploading image:", error);
        showMessage('Error uploading image: ' + error.message, 'error');
        uploadBtn.textContent = '📷 Change Photo';
        uploadBtn.disabled = false;
    }
}

function setupEventListeners() {
    // Edit name
    const editBtn = document.getElementById('editNameBtn');
    const nameDisplay = document.getElementById('nameDisplay');
    const nameEdit = document.getElementById('nameEdit');
    const saveBtn = document.getElementById('saveNameBtn');
    const cancelBtn = document.getElementById('cancelNameBtn');
    const editInput = document.getElementById('editNameInput');
    
    editBtn.addEventListener('click', () => {
        editInput.value = currentUserData.displayName || currentUser.displayName || '';
        nameDisplay.classList.add('hidden');
        nameEdit.classList.remove('hidden');
    });
    
    saveBtn.addEventListener('click', async () => {
        const newName = editInput.value.trim();
        if (newName) {
            await updateDisplayName(newName);
        }
        nameDisplay.classList.remove('hidden');
        nameEdit.classList.add('hidden');
    });
    
    cancelBtn.addEventListener('click', () => {
        nameDisplay.classList.remove('hidden');
        nameEdit.classList.add('hidden');
    });
    
    // Verify email
    document.getElementById('verifyEmailBtn').addEventListener('click', sendVerificationEmail);
    
    // Upload profile picture
    const fileInput = document.getElementById('profilePicUpload');
    const uploadPicBtn = document.getElementById('uploadPicBtn');
    
    uploadPicBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            uploadProfilePicture(e.target.files[0]);
        }
    });
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', async (e) => {
        e.preventDefault();
        if (typeof logout !== 'undefined') {
            await logout();
        } else {
            window.location.href = 'login.html';
        }
    });
}

function showMessage(msg, type) {
    const msgDiv = document.getElementById('profileMessage');
    msgDiv.textContent = msg;
    msgDiv.className = `message ${type}`;
    msgDiv.classList.remove('hidden');
    
    setTimeout(() => {
        msgDiv.classList.add('hidden');
    }, 3000);
}

function updateNavbarDisplay(user) {
    const userDisplay = document.getElementById('userDisplay');
    if (userDisplay && user) {
        const username = localStorage.getItem('mudrika_username') || user.displayName || user.email.split('@')[0];
        userDisplay.innerHTML = username;
    }
}