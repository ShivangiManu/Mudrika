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
