/*
const progress = JSON.parse(localStorage.getItem("progress")) || {};
const quizResults = JSON.parse(localStorage.getItem("quizResults")) || {};
const xp = localStorage.getItem("xp") || 0;
const streak = localStorage.getItem("streak") || 0;

fetch("data/lessons.json")
  .then(res => res.json())
  .then(lessons => {
    const container = document.getElementById("progressContainer");
    if (!container) return;

    lessons.forEach(lesson => {
      const completed = progress[lesson.id] ? "Completed" : "Not Completed";
      const score = quizResults[lesson.id] !== undefined
        ? `Quiz Score: ${quizResults[lesson.id]}`
        : "Quiz not taken";

      const div = document.createElement("div");
      div.className = "lesson-card";
      div.innerHTML = `
        <h3>${lesson.title}</h3>
        <p>${completed}</p>
        <p>${score}</p>
      `;
      container.appendChild(div);
    });
  });

const hero = document.querySelector(".hero");
if (hero) {
  const stats = document.createElement("h3");
  stats.innerHTML = `XP: ${xp} | Streak: ${streak}`;
  hero.prepend(stats);
}
*/

// Reads completedLessons, quizScores, totalXP, streak from localStorage and renders dashboard
function loadProgress() {
  const container = document.getElementById("progressContainer");
  if (!container) return;

  // --- Read all localStorage keys (both original + merged) ---
  const completed    = JSON.parse(localStorage.getItem("completedLessons") || "[]");
  const progress     = JSON.parse(localStorage.getItem("progress") || "{}");
  const quizScores   = JSON.parse(localStorage.getItem("quizScores") || "{}");
  const quizResults  = JSON.parse(localStorage.getItem("quizResults") || "{}");
  const totalXP      = parseInt(localStorage.getItem("totalXP") || "0");
  const xp           = Number(localStorage.getItem("xp")) || 0;
  const streak       = Number(localStorage.getItem("streak")) || 0;

  // Use whichever XP value is higher (in case only one was written)
  const displayXP = Math.max(totalXP, xp);

  // --- Inject XP + Streak into .hero if present (merged) ---
  const hero = document.querySelector(".hero");
  if (hero) {
    const statsEl = document.createElement("h3");
    statsEl.style.cssText = "text-align:center;margin:10px 0 0;color:#C65A3A;font-size:1rem;";
    statsEl.innerHTML = `XP: ${displayXP} &nbsp;|&nbsp; 🔥 Streak: ${streak}`;
    hero.prepend(statsEl);
  }

  // --- Header stat cards ---
  const statBar = document.createElement("div");
  statBar.style.cssText = "grid-column:1/-1;text-align:center;padding:20px 0;";
  statBar.innerHTML = `
    <div style="display:flex;justify-content:center;gap:40px;flex-wrap:wrap;margin-bottom:30px;">
      <div style="background:#FFF9F2;border-radius:16px;padding:20px 30px;box-shadow:0 4px 15px rgba(0,0,0,0.08);">
        <div style="font-size:2rem;font-weight:700;color:#C65A3A;">${displayXP}</div>
        <div style="color:#6B5044;font-size:0.9rem;">Total XP</div>
      </div>
      <div style="background:#FFF9F2;border-radius:16px;padding:20px 30px;box-shadow:0 4px 15px rgba(0,0,0,0.08);">
        <div style="font-size:2rem;font-weight:700;color:#355C7D;">${completed.length}</div>
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

  // --- Lesson cards ---
  fetch("data/lessons.json")
    .then(r => r.json())
    .then(lessons => {
      lessons.forEach(lesson => {
        // Check completion from both keys (original array + merged object)
        const isDone = completed.includes(lesson.id) || !!progress[lesson.id];

        const quizId = lesson.id.replace("lesson", "quiz");

        // Check quiz result from both keys (detailed quizScores + simple quizResults)
        const quizDetailed = quizScores[quizId];
        const quizSimple   = quizResults[quizId] !== undefined ? quizResults[quizId] : quizResults[lesson.id];

        let quizHtml;
        if (quizDetailed) {
          // Rich display from original quizScores
          quizHtml = `
            <div style="margin-top:10px;font-size:0.85rem;color:#355C7D;">
              Quiz: <strong>${quizDetailed.score}/${quizDetailed.total}</strong>
              (${Math.round((quizDetailed.score / quizDetailed.total) * 100)}%)
              &nbsp;•&nbsp; ${quizDetailed.date}
            </div>`;
        } else if (quizSimple !== undefined) {
          // Fallback to simple score from merged quizResults
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
        card.style.cssText = "position:relative;opacity:" + (isDone ? "1" : "0.6") + ";";
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
          ${!isDone ? '<a href="learn.html?id=' + lesson.id + '" style="display:inline-block;margin-top:12px;font-size:0.85rem;color:#C65A3A;font-weight:600;">Start Lesson →</a>' : ""}
        `;
        container.appendChild(card);
      });
    })
    .catch(() => {
      container.innerHTML += "<p style='text-align:center;'>Could not load lesson data.</p>";
    });
}

loadProgress();