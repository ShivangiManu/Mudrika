/*
// Get splash element
const splash = document.getElementById("splash");

if (splash) {
  document.body.classList.add("no-scroll");
  const ring = document.getElementById("ringText");
  // Create circular text around logo
  if (ring) {
    const text = ring.innerText;
    ring.innerHTML = "";

    const radius = 60; // distance from center (outside logo)

    [...text].forEach((char, i) => {
      const span = document.createElement("span");
      const angle = (360 / text.length) * i;

      span.innerText = char;
      span.style.position = "absolute";
      span.style.transform = `
        rotate(${angle}deg)
        translate(${radius}px)
        rotate(90deg)
      `;

      ring.appendChild(span);
    });
  }

  // Hide splash after ~2 rotations
  setTimeout(() => {
    splash.classList.add("hide");
    document.body.classList.remove("no-scroll");
  }, 2000);
}
*/

/* ------------------------------
   LOAD LESSON CARDS
--------------------------------*/
/*
fetch("data/lessons.json")
  .then(response => response.json())
  .then(lessons => {
    const container = document.getElementById("lessonContainer");
    if (!container) return;

    lessons.forEach(lesson => {
      const card = document.createElement("div");
      card.className = "lesson-card";
      card.innerHTML = `
        <h3>${lesson.title}</h3>
        <p>${lesson.description}</p>
        <a href="learn.html">Start Lesson</a>
      `;
      container.appendChild(card);
    });
  })
  .catch(error => console.error("Error loading lessons:", error));
*/

// ── Splash screen ──────────────────────────────────────────────────────────────
document.body.classList.add("no-scroll");

window.addEventListener("load", () => {
  const splash = document.getElementById("splash");
  const ringEl = document.getElementById("ringText");

  if (ringEl) {
    const text = ringEl.textContent.trim();
    ringEl.textContent = "";
    const total = text.length;
    text.split("").forEach((char, i) => {
      const span = document.createElement("span");
      span.textContent = char === " " ? "\u00A0" : char;
      span.style.transform = `rotate(${(360 / total) * i}deg)`;
      ringEl.appendChild(span);
    });
  }

  setTimeout(() => {
    if (splash) {
      splash.classList.add("hide");
      document.body.classList.remove("no-scroll");
      setTimeout(() => splash.remove(), 900);
    }
  }, 2500);
});


// ── Lesson cards ───────────────────────────────────────────────────────────────
async function loadLessons() {
  const container = document.getElementById("lessonContainer");
  if (!container) return;

  let lessons;
  try {
    const res = await fetch("data/lessons.json");
    lessons = await res.json();
  } catch (e) {
    container.innerHTML = "<p style='text-align:center;color:#C65A3A;'>Could not load lessons.</p>";
    return;
  }

  const completed   = JSON.parse(localStorage.getItem("completedLessons") || "[]");
  const levelColors = { Beginner: "#4CAF50", Intermediate: "#FF9800", Advanced: "#E53935" };

  container.innerHTML = "";

  lessons.forEach((lesson, index) => {
    const isDone   = completed.includes(lesson.id);
    const isLocked = index > 0 && !completed.includes(lessons[index - 1].id);

    const card = document.createElement("div");
    card.className = "lesson-card";
    card.style.cssText = `
      opacity: ${isLocked ? "0.55" : "1"};
      position: relative;
      cursor: ${isLocked ? "not-allowed" : "pointer"};
    `;

    card.innerHTML = `
      ${isDone   ? '<div style="position:absolute;top:12px;right:14px;font-size:1.3rem;">✅</div>' : ""}
      ${isLocked ? '<div style="position:absolute;top:12px;right:14px;font-size:1.3rem;">🔒</div>' : ""}
      <div style="font-size:2rem;margin-bottom:8px;">${getLessonEmoji(lesson.title)}</div>
      <h3 style="margin:0 0 6px;">${lesson.title}</h3>
      <p style="margin:0 0 10px;font-size:0.88rem;color:#6B5044;">${lesson.description}</p>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">
        <span style="background:${levelColors[lesson.level] || "#888"};color:#fff;padding:3px 10px;border-radius:12px;font-size:0.75rem;font-weight:600;">${lesson.level}</span>
        <span style="color:#C65A3A;font-weight:600;font-size:0.85rem;">+${lesson.xp} XP</span>
      </div>
    `;

    card.addEventListener("click", () => {
      if (isLocked) { showToast("Complete the previous lesson first!"); return; }
      window.location.href = "learn.html?id=" + lesson.id;
    });

    container.appendChild(card);
  });
}

function getLessonEmoji(title) {
  if (title.match(/[A-Z]-[A-Z]/))  return "🤟";
  if (title.includes("Number"))     return "🔢";
  if (title.includes("Greeting"))   return "👋";
  if (title.includes("Family"))     return "👨‍👩‍👧";
  if (title.includes("Color"))      return "🎨";
  return "📖";
}

function showToast(msg) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.style.cssText = `
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
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = "1";
  clearTimeout(t._t);
  t._t = setTimeout(() => t.style.opacity = "0", 2800);
}

loadLessons();
