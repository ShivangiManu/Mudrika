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
