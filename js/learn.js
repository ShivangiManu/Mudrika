/*
let currentLessonId = "lesson1"; // default lesson

fetch("data/lessons.json")
  .then(res => res.json())
  .then(lessons => {
    const lesson = lessons.find(l => l.id === currentLessonId);
    if (!lesson) return;

    const content = document.getElementById("lessonContent");
    if (!content) return;

    content.innerHTML = `
      <h2>${lesson.title}</h2>
      <p>${lesson.description}</p>
      <img src="${lesson.gif}" width="300">
    `;
  });

const completeBtn = document.getElementById("completeBtn");

if (completeBtn) {
  completeBtn.addEventListener("click", () => {
    let progress = JSON.parse(localStorage.getItem("progress")) || {};
    let xp = Number(localStorage.getItem("xp")) || 0;
    let streak = Number(localStorage.getItem("streak")) || 0;

    if (!progress[currentLessonId]) {
      progress[currentLessonId] = true;
      xp += 10;
      streak += 1;
    }

    localStorage.setItem("progress", JSON.stringify(progress));
    localStorage.setItem("xp", xp);
    localStorage.setItem("streak", streak);

    alert("🎉 Lesson completed! +10 XP");
  });
}
*/

// Reads ?id=lesson-X from the URL, loads that lesson, shows signs one by one
let currentLesson = null;
let currentSignIndex = 0;

// Update the quiz link based on current lesson
function updateQuizLink() {
    const quizLink = document.getElementById("quizLink");
    if (quizLink && currentLesson) {
        const quizId = currentLesson.id.replace("lesson", "quiz");
        quizLink.href = "quiz.html?id=" + quizId;
        console.log("Quiz link set to:", quizLink.href);
    }
}

async function loadLesson() {
  const params = new URLSearchParams(window.location.search);
  const lessonId = params.get("id") || "lesson-1";

  let lessons;
  try {
    const res = await fetch("data/lessons.json");
    lessons = await res.json();
  } catch (e) {
    document.getElementById("lessonContent").innerHTML = "<p>Could not load lesson data.</p>";
    return;
  }

  currentLesson = lessons.find(l => l.id === lessonId);
  if (!currentLesson) {
    document.getElementById("lessonContent").innerHTML = "<p>Lesson not found.</p>";
    return;
  }

  document.title = "Mudrika | " + currentLesson.title;
  
   // 🔥 ADD THESE TWO LINES RIGHT HERE 🔥
  console.log("Current lesson ID:", currentLesson.id);
  console.log("Quiz link should be: quiz.html?id=" + currentLesson.id.replace("lesson", "quiz"));
  
   // 🔥 UPDATE QUIZ LINK HERE
  updateQuizLink();

  // 🔥 LOAD SAVED PROGRESS for this lesson
  currentSignIndex = getSavedProgress(lessonId);
    
  console.log(`Loading lesson ${lessonId}, resuming at sign ${currentSignIndex + 1} of ${currentLesson.signs.length}`);

  renderSign();
}

// 🔥 NEW: Save current sign progress
function saveProgress(lessonId, signIndex) {
    // Get existing progress or create new object
    let lessonProgress = JSON.parse(localStorage.getItem("lessonProgress") || "{}");
    
    // Save which sign we're on for this lesson
    lessonProgress[lessonId] = {
        signIndex: signIndex,
        lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem("lessonProgress", JSON.stringify(lessonProgress));
    console.log(`Progress saved for ${lessonId}: sign ${signIndex + 1}`);
}

// 🔥 NEW: Get saved progress for a lesson
function getSavedProgress(lessonId) {
    const lessonProgress = JSON.parse(localStorage.getItem("lessonProgress") || "{}");
    
    // Check if we have saved progress for this lesson
    if (lessonProgress[lessonId]) {
        const savedIndex = lessonProgress[lessonId].signIndex;
        
        // Make sure the saved index is valid (not beyond total signs)
        if (currentLesson && savedIndex < currentLesson.signs.length) {
            return savedIndex;
        }
    }
    
    // Also check if lesson is already completed
    const completedLessons = JSON.parse(localStorage.getItem("completedLessons") || "[]");
    if (completedLessons.includes(lessonId)) {
        // If lesson is completed, start from beginning (they might want to review)
        return 0;
    }
    
    // Default: start from beginning
    return 0;
}

function renderSign() {
  const sign = currentLesson.signs[currentSignIndex];
  const total = currentLesson.signs.length;
  const container = document.getElementById("lessonContent");

  // Check if lesson is completed
  const completedLessons = JSON.parse(localStorage.getItem("completedLessons") || "[]");
  const isCompleted = completedLessons.includes(currentLesson.id);

  container.innerHTML = `
    <h2 style="font-family:'Cinzel',serif;">${currentLesson.title}</h2>
    <p style="color:#6B5044;font-size:0.9rem;">${isCompleted ? '✅ Completed! ' : ''} Sign ${currentSignIndex + 1} of ${total}</p>

    <!-- Progress bar -->
    <div style="width:60%;margin:0 auto 20px;background:#D8BFA8;border-radius:20px;height:10px;">
      <div style="width:${((currentSignIndex + 1) / total) * 100}%;background:#C65A3A;height:10px;border-radius:20px;transition:width 0.4s;"></div>
    </div>

    <!-- Sign card -->
    <div style="
      background:#FFF9F2;border-radius:20px;padding:30px;
      max-width:420px;margin:0 auto;
      box-shadow:0 8px 30px rgba(0,0,0,0.1);
    ">
      <div style="
        width:200px;height:200px;margin:0 auto 20px;
        background:#F6E2CC;border-radius:16px;
        display:flex;align-items:center;justify-content:center;
        overflow:hidden;
      ">
        <img src="${sign.image}" alt="${sign.letter}"
          style="max-width:100%;max-height:100%;object-fit:contain;"
          onerror="this.style.display='none';this.parentElement.innerHTML='<span style=font-size:3rem;>${sign.letter}</span>';">
      </div>
      <h2 style="font-family:'Cinzel',serif;font-size:2.2rem;color:#C65A3A;margin:0 0 10px;">${sign.letter}</h2>
      <p style="font-size:0.95rem;color:#3A2E2A;line-height:1.6;">${sign.description}</p>
    </div>

    <!-- Navigation buttons -->
    <div style="margin-top:30px;display:flex;gap:15px;justify-content:center;flex-wrap:wrap;">
      ${currentSignIndex > 0 ? '<button onclick="prevSign()" style="background:#355C7D;">Previous</button>' : ""}
      ${currentSignIndex < total - 1
        ? '<button onclick="nextSign()">Next Sign</button>'
        : '<button onclick="completeLesson()" style="background:#4CAF50;">Complete Lesson ✓</button>'
      }
    </div>
    <!-- Resume button (show if not at last sign and not completed) -->
    ${!isCompleted && currentSignIndex > 0 && currentSignIndex < total - 1 ? `
        <div style="margin-top:20px;">
            <button onclick="resetLesson()" style="background:#888;">Restart Lesson</button>
        </div>
    ` : ""}

    <!-- Review message for completed lessons -->
    ${isCompleted ? `
        <div style="margin-top:20px;padding:15px;background:#e8f5e9;border-radius:10px;">
            <p style="color:#2e7d32;margin:0;">✨ You've already completed this lesson! ✨</p>
            <button onclick="resetLesson()" style="background:#C65A3A;margin-top:10px;">Review All Signs</button>
        </div>
    ` : ""}
  `;
}

function nextSign() {
  if (currentSignIndex < currentLesson.signs.length - 1) {
    currentSignIndex++;
    renderSign();
    window.scrollTo({ top: 0, behavior: "smooth" });
    // 🔥 SAVE PROGRESS after moving to next sign
    saveProgress(currentLesson.id, currentSignIndex);
  }
}

function prevSign() {
  if (currentSignIndex > 0) {
    currentSignIndex--;
    renderSign();
    window.scrollTo({ top: 0, behavior: "smooth" });
    // 🔥 SAVE PROGRESS after moving to previous sign
    saveProgress(currentLesson.id, currentSignIndex);
  }
}

// 🔥 NEW: Reset lesson progress (start from beginning)
function resetLesson() {
    if (confirm("Restart this lesson from the beginning? Your progress will be reset.")) {
        currentSignIndex = 0;
        // Clear saved progress for this lesson
        let lessonProgress = JSON.parse(localStorage.getItem("lessonProgress") || "{}");
        delete lessonProgress[currentLesson.id];
        localStorage.setItem("lessonProgress", JSON.stringify(lessonProgress));
        
        renderSign();
        window.scrollTo({ top: 0, behavior: "smooth" });
        
        showToast("Lesson restarted from beginning!");
    }
}

function updateStreak() {
  const today = new Date().toDateString(); // e.g. "Mon Jan 20 2026"
  const lastActiveDay = localStorage.getItem("lastActiveDay");
  let streak = parseInt(localStorage.getItem("streak") || "0");
 
  if (lastActiveDay === today) {
    // Already logged activity today — do NOT increase streak
    return;
  }
 
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();
 
  if (lastActiveDay === yesterdayStr) {
    // Was active yesterday — continue streak
    streak += 1;
  } else if (!lastActiveDay) {
    // First time ever
    streak = 1;
  } else {
    // Missed a day — reset streak
    streak = 1;
  }
 
  localStorage.setItem("streak", streak);
  localStorage.setItem("lastActiveDay", today);
}

async function completeLesson() {
  const lessonId = currentLesson.id;
  const lessonXP = currentLesson.xp || 10;

  // Get current user
  const userId = localStorage.getItem('mudrika_user_id');
  const isGuest = localStorage.getItem('mudrika_current_user') === 'guest';

  // completedLessons array (original)
  const completed = JSON.parse(localStorage.getItem("completedLessons") || "[]");
  const isNew = !completed.includes(lessonId);

  if (isNew) {
    completed.push(lessonId);
    localStorage.setItem("completedLessons", JSON.stringify(completed));
  }

  // progress object (merged)
  const progress = JSON.parse(localStorage.getItem("progress") || "{}");
  if (!progress[lessonId]) {
    progress[lessonId] = true;
    localStorage.setItem("progress", JSON.stringify(progress));
  }

  // XP and streak — only on first-time completion
  if (isNew) {
    const currentXP = parseInt(localStorage.getItem("totalXP") || "0");
    localStorage.setItem("totalXP", currentXP + lessonXP);

    // Keep simpler "xp" key in sync (merged)
    const simpleXP = Number(localStorage.getItem("xp")) || 0;
    localStorage.setItem("xp", simpleXP + lessonXP);

    // Streak tracking (merged)
    //const streak = Number(localStorage.getItem("streak")) || 0;
    //localStorage.setItem("streak", streak + 1);
    updateStreak();

    // Save to Firestore if not guest
    if (userId && !isGuest && typeof saveLessonCompletion !== 'undefined') {
      await saveLessonCompletion(userId, lessonId, lessonXP);
       console.log("Lesson saved to Firestore");
    }

  }

  // Lesson scores for progress page
  const scores = JSON.parse(localStorage.getItem("lessonScores") || "{}");
  scores[lessonId] = { completed: true, xp: lessonXP, title: currentLesson.title };
  localStorage.setItem("lessonScores", JSON.stringify(scores));

  //Save quiz scores to Firestore if available
  if (userId && !isGuest && typeof saveUserProgress !== 'undefined') {
      await saveUserProgress(userId, {
          completedLessons: completed,
          totalXP: parseInt(localStorage.getItem("totalXP") || "0"),
          xp: parseInt(localStorage.getItem("xp") || "0"),
          streak: parseInt(localStorage.getItem("streak") || "0"),
          lessonScores: scores
      });
  }

   // 🔥 Clear progress for this lesson (since it's completed)
  let lessonProgress = JSON.parse(localStorage.getItem("lessonProgress") || "{}");
  delete lessonProgress[lessonId];
  localStorage.setItem("lessonProgress", JSON.stringify(lessonProgress));

  // 🔥 Save to Firestore if available
  if (userId && !isGuest && typeof saveUserProgress !== 'undefined') {
      await saveUserProgress(userId, {
          completedLessons: completed,
          totalXP: parseInt(localStorage.getItem("totalXP") || "0"),
          xp: parseInt(localStorage.getItem("xp") || "0"),
          streak: parseInt(localStorage.getItem("streak") || "0"),
          lessonScores: scores
      });
  }

  // Completion alert (merged)
  showToast("🎉 Lesson completed! +" + lessonXP + " XP");

  // Redirect to quiz
  const quizId = lessonId.replace("lesson", "quiz");
  console.log("Redirecting to quiz:", quizId);
  setTimeout(() => {
        window.location.href = "quiz.html?id=" + quizId;
  }, 1500);
}

// Toast notification helper
function showToast(msg) {
    let toast = document.getElementById("lesson-toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "lesson-toast";
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: #3A2E2A;
            color: #FFF9F2;
            padding: 12px 26px;
            border-radius: 25px;
            font-size: 0.9rem;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.4s;
        `;
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = "1";
    setTimeout(() => {
        toast.style.opacity = "0";
    }, 2000);
}

// Wire up the "Mark as Complete" button if present
const completeBtn = document.getElementById("completeBtn");
if (completeBtn) {
  completeBtn.addEventListener("click", completeLesson);
  completeBtn.style.display = "none";
}

loadLesson();