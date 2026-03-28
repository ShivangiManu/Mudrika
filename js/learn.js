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
  currentSignIndex = 0;
  renderSign();
}

function renderSign() {
  const sign = currentLesson.signs[currentSignIndex];
  const total = currentLesson.signs.length;
  const container = document.getElementById("lessonContent");

  container.innerHTML = `
    <h2 style="font-family:'Cinzel',serif;">${currentLesson.title}</h2>
    <p style="color:#6B5044;font-size:0.9rem;">Sign ${currentSignIndex + 1} of ${total}</p>

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
  `;
}

function nextSign() {
  if (currentSignIndex < currentLesson.signs.length - 1) {
    currentSignIndex++;
    renderSign();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function prevSign() {
  if (currentSignIndex > 0) {
    currentSignIndex--;
    renderSign();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
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
    const streak = Number(localStorage.getItem("streak")) || 0;
    localStorage.setItem("streak", streak + 1);

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

  // Completion alert (merged)
  alert("🎉 Lesson completed! +" + lessonXP + " XP");

  // Redirect to quiz
  const quizId = lessonId.replace("lesson", "quiz");
  window.location.href = "quiz.html?id=" + quizId;
}

// Wire up the "Mark as Complete" button if present
const completeBtn = document.getElementById("completeBtn");
if (completeBtn) {
  completeBtn.addEventListener("click", completeLesson);
  completeBtn.style.display = "none";
}

loadLesson();