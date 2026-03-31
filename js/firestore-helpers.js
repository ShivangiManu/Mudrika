// ============================================
// MUDRIKA - FIRESTORE HELPER FUNCTIONS
// ============================================

// Save user progress to Firestore
async function saveUserProgress(userId, progressData) {
    if (!userId || userId === 'guest') {
        console.log("Guest user - not saving to Firestore");
        return false;
    }
    
    try {

        // Check if db is available
        if (typeof db === 'undefined') {
            console.warn("Firestore not available - saving to localStorage only");
            return false;
        }

        const userRef = db.collection('users').doc(userId);
        await userRef.set({
            ...progressData,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        console.log("Progress saved to Firestore for user:", userId);
        return true;
    } catch (error) {
        console.error("Error saving to Firestore:", error);
        return false;
    }
}

// Load user progress from Firestore
async function loadUserProgress(userId) {
    if (!userId || userId === 'guest') {
        console.log("Guest user - using localStorage");
        return null;
    }
    
    try {
        const userRef = db.collection('users').doc(userId);
        const doc = await userRef.get();
        
        if (doc.exists) {
            console.log("Progress loaded from Firestore for user:", userId);
            return doc.data();
        } else {
            console.log("No existing data for user:", userId);
            return null;
        }
    } catch (error) {
        console.error("Error loading from Firestore:", error);
        return null;
    }
}

// Sync localStorage with Firestore
async function syncProgressWithFirestore(userId) {
    if (!userId || userId === 'guest') return;
    
    
    // First, load from Firestore
    const firestoreData = await loadUserProgress(userId);
    
    if (firestoreData) {
        // If data exists in Firestore, use it
        localStorage.setItem('completedLessons', JSON.stringify(firestoreData.completedLessons || []));
        localStorage.setItem('totalXP', firestoreData.totalXP || '0');
        localStorage.setItem('xp', firestoreData.xp || '0');
        localStorage.setItem('streak', firestoreData.streak || '0');
        localStorage.setItem('quizScores', JSON.stringify(firestoreData.quizScores || {}));
        localStorage.setItem('lessonScores', JSON.stringify(firestoreData.lessonScores || {}));
        
        console.log("Synced from Firestore to localStorage");
    } else {
        // If no data in Firestore, save current localStorage to Firestore
        await saveUserProgress(userId, {
            completedLessons: JSON.parse(localStorage.getItem('completedLessons') || '[]'),
            totalXP: parseInt(localStorage.getItem('totalXP') || '0'),
            xp: parseInt(localStorage.getItem('xp') || '0'),
            streak: parseInt(localStorage.getItem('streak') || '0'),
            quizScores: JSON.parse(localStorage.getItem('quizScores') || '{}'),
            lessonScores: JSON.parse(localStorage.getItem('lessonScores') || '{}')
        });
        console.log("Saved localStorage to Firestore");
    }
}

// Save quiz score to Firestore
async function saveQuizScore(userId, quizId, score, total) {
    if (!userId || userId === 'guest') return false;
    
    try {

         if (typeof db === 'undefined') {
            console.warn("Firestore not available - saving to localStorage only");
            return false;
        }

        const userRef = db.collection('users').doc(userId);
        const quizScores = {};
        quizScores[quizId] = {
            score: score,
            total: total,
            date: new Date().toISOString(),
            percentage: Math.round((score / total) * 100)
        };
        
        await userRef.update({
            [`quizScores.${quizId}`]: quizScores[quizId],
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log("Quiz score saved to Firestore");
        return true;
    } catch (error) {
        console.error("Error saving quiz score:", error);
        return false;
    }
}

// Save lesson completion to Firestore
async function saveLessonCompletion(userId, lessonId, xpEarned) {
    if (!userId || userId === 'guest') return false;
    
    try {
        const userRef = db.collection('users').doc(userId);
        
        // Get current completed lessons
        const completedLessons = JSON.parse(localStorage.getItem('completedLessons') || '[]');
        if (!completedLessons.includes(lessonId)) {
            completedLessons.push(lessonId);
            localStorage.setItem('completedLessons', JSON.stringify(completedLessons));
        }
        
        // Update Firestore
        await userRef.update({
            completedLessons: completedLessons,
            totalXP: firebase.firestore.FieldValue.increment(xpEarned),
            xp: firebase.firestore.FieldValue.increment(xpEarned),
            streak: firebase.firestore.FieldValue.increment(1),
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log("Lesson completion saved to Firestore");
        return true;
    } catch (error) {
        console.error("Error saving lesson completion:", error);
        return false;
    }
}