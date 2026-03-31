// ============================================
// MUDRIKA - PROGRESS PAGE
// Accurately shows completed lessons only
// ============================================

async function loadProgress() {
    const container = document.getElementById("progressContainer");
    if (!container) return;

    // Get current user
    const currentUser = getCurrentUser();
    const userId = currentUser?.uid;
    const isGuest = localStorage.getItem('mudrika_current_user') === 'guest';
    
    // Variables to store progress data
    let completedLessons = [];
    let quizScores = {};
    let totalXP = 0;
    let streak = 0;
    
    console.log("Loading progress for user:", userId || "guest");
    
    // If logged in with Firebase, load from Firestore
    if (userId && !isGuest && typeof loadUserProgress !== 'undefined') {
        try {
            const userData = await loadUserProgress(userId);
            if (userData) {
                completedLessons = userData.completedLessons || [];
                quizScores = userData.quizScores || {};
                totalXP = userData.totalXP || 0;
                streak = userData.streak || 0;
                console.log("Loaded from Firestore:", completedLessons);
            }
        } catch (error) {
            console.error("Error loading from Firestore:", error);
        }
    }
    
    // If not logged in or Firestore failed, use localStorage
    if (completedLessons.length === 0) {
        completedLessons = JSON.parse(localStorage.getItem("completedLessons") || "[]");
        quizScores = JSON.parse(localStorage.getItem("quizScores") || "{}");
        totalXP = parseInt(localStorage.getItem("totalXP") || "0");
        streak = parseInt(localStorage.getItem("streak") || "0");
        console.log("Loaded from localStorage:", completedLessons);
    }
    
    // Get simple quiz results from localStorage as fallback
    const quizResults = JSON.parse(localStorage.getItem("quizResults") || "{}");
    
    console.log("Final completed lessons:", completedLessons);
    
    // --- Inject XP + Streak into .hero ---
    const hero = document.querySelector(".hero");
    if (hero) {
        // Remove existing stats if any
        const existingStats = hero.querySelector('.stats-header');
        if (existingStats) existingStats.remove();
        
        const statsEl = document.createElement("h3");
        statsEl.className = "stats-header";
        statsEl.style.cssText = "text-align:center;margin:10px 0 0;color:#C65A3A;font-size:1rem;";
        statsEl.innerHTML = `XP: ${totalXP} &nbsp;|&nbsp; 🔥 Streak: ${streak}`;
        hero.prepend(statsEl);
    }
    
    // --- Header stat cards ---
    const statBar = document.createElement("div");
    statBar.style.cssText = "grid-column:1/-1;text-align:center;padding:20px 0;";
    statBar.innerHTML = `
        <div style="display:flex;justify-content:center;gap:40px;flex-wrap:wrap;margin-bottom:30px;">
            <div style="background:#FFF9F2;border-radius:16px;padding:20px 30px;box-shadow:0 4px 15px rgba(0,0,0,0.08);">
                <div style="font-size:2rem;font-weight:700;color:#C65A3A;">${totalXP}</div>
                <div style="color:#6B5044;font-size:0.9rem;">Total XP</div>
            </div>
            <div style="background:#FFF9F2;border-radius:16px;padding:20px 30px;box-shadow:0 4px 15px rgba(0,0,0,0.08);">
                <div style="font-size:2rem;font-weight:700;color:#355C7D;">${completedLessons.length}</div>
                <div style="color:#6B5044;font-size:0.9rem;">Lessons Done</div>
            </div>
            <div style="background:#FFF9F2;border-radius:16px;padding:20px 30px;box-shadow:0 4px 15px rgba(0,0,0,0.08);">
                <div style="font-size:2rem;font-weight:700;color:#4CAF50;">${Object.keys(quizScores).length}</div>
                <div style="color:#6B5044;font-size:0.9rem;">Quizzes Taken</div>
            </div>
            <div style="background:#FFF9F2;border-radius:16px;padding:20px 30px;box-shadow:0 4px 15px rgba(0,0,0,0.08);">
                <div style="font-size:2rem;font-weight:700;color:#E07B39;">🔥 ${streak}</div>
                <div style="color:#6B5044;font-size:0.9rem;">Day Streak</div>
            </div>
        </div>
    `;
    container.appendChild(statBar);
    
    // --- Load and display lessons ---
    try {
        const res = await fetch("data/lessons.json");
        const lessons = await res.json();
        
        lessons.forEach(lesson => {
            // ONLY check completedLessons array - NO other sources
            const isDone = completedLessons.includes(lesson.id);
            
            const quizId = lesson.id.replace("lesson", "quiz");
            
            // Get quiz score
            let quizHtml = '';
            const quizScore = quizScores[quizId];
            const quizSimple = quizResults[quizId];
            
            if (quizScore && quizScore.score !== undefined) {
                const percentage = Math.round((quizScore.score / quizScore.total) * 100);
                quizHtml = `
                    <div style="margin-top:10px;font-size:0.85rem;color:#355C7D;">
                        Quiz: <strong>${quizScore.score}/${quizScore.total}</strong> (${percentage}%)
                        ${quizScore.date ? `&nbsp;•&nbsp; ${quizScore.date}` : ''}
                    </div>`;
            } else if (quizSimple !== undefined && !isNaN(quizSimple)) {
                quizHtml = `
                    <div style="margin-top:10px;font-size:0.85rem;color:#355C7D;">
                        Quiz Score: <strong>${quizSimple}</strong>
                    </div>`;
            } else {
                quizHtml = `<div style="margin-top:10px;font-size:0.85rem;color:#aaa;">Quiz not taken yet</div>`;
            }
            
            const pct = isDone ? 100 : 0;
            const card = document.createElement("div");
            card.className = "lesson-card";
            card.style.cssText = "position:relative;opacity:" + (isDone ? "1" : "0.8") + ";";
            
            card.innerHTML = `
                ${isDone ? '<div style="position:absolute;top:12px;right:14px;font-size:1.3rem;">✅</div>' : ""}
                <h3 style="margin:0 0 6px;">${lesson.title}</h3>
                <p style="font-size:0.85rem;color:#6B5044;margin:0 0 10px;">${lesson.level} &nbsp;•&nbsp; +${lesson.xp} XP</p>
                <p style="font-size:0.85rem;color:${isDone ? "#4CAF50" : "#aaa"};margin:0 0 8px;font-weight:600;">
                    ${isDone ? "✓ Completed" : "Not completed"}
                </p>
                <div style="background:#D8BFA8;border-radius:20px;height:8px;">
                    <div style="width:${pct}%;background:#C65A3A;height:8px;border-radius:20px;transition:width 0.5s;"></div>
                </div>
                ${quizHtml}
                ${!isDone ? '<a href="learn.html?id=' + lesson.id + '" style="display:inline-block;margin-top:12px;font-size:0.85rem;color:#C65A3A;font-weight:600;">Start Lesson →</a>' : 
                            '<a href="learn.html?id=' + lesson.id + '" style="display:inline-block;margin-top:12px;font-size:0.85rem;color:#355C7D;font-weight:600;">Review Lesson →</a>'}
            `;
            container.appendChild(card);
        });
        
    } catch (error) {
        console.error("Error loading lessons:", error);
        container.innerHTML += "<p style='text-align:center;'>Could not load lesson data.</p>";
    }
}

// Helper function to get current user
function getCurrentUser() {
    // Check Firebase auth first
    if (typeof auth !== 'undefined' && auth.currentUser) {
        return {
            uid: auth.currentUser.uid,
            email: auth.currentUser.email
        };
    }
    // Check localStorage
    const userId = localStorage.getItem('mudrika_user_id');
    if (userId) {
        return { uid: userId };
    }
    return null;
}

// Load progress when page is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log("Progress page loaded");
    // Small delay to ensure Firebase is initialized
    setTimeout(() => {
        loadProgress();
    }, 500);
});