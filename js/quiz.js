let currentLessonId = "lesson1";
let correctAnswers = [];

fetch("data/lessons.json")
  .then(res => res.json())
  .then(data => {
    const lesson = data.find(l => l.id === currentLessonId);
    if (!lesson || !lesson.quiz) return;

    const container = document.getElementById("quizContainer");
    if (!container) return;

    lesson.quiz.forEach((q, index) => {
      const div = document.createElement("div");
      div.innerHTML = `
        <h3>${q.question}</h3>
        ${q.options.map(opt => `
          <label>
            <input type="radio" name="q${index}" value="${opt}">
            ${opt}
          </label><br>
        `).join("")}
        <br>
      `;
      container.appendChild(div);
    });

    correctAnswers = lesson.quiz.map(q => q.answer);
  });

function submitQuiz() {
  let score = 0;

  correctAnswers.forEach((ans, index) => {
    const selected = document.querySelector(`input[name="q${index}"]:checked`);
    if (selected && selected.value === ans) {
      score++;
    }
  });

  let quizResults = JSON.parse(localStorage.getItem("quizResults")) || {};
  quizResults[currentLessonId] = score;
  localStorage.setItem("quizResults", JSON.stringify(quizResults));

  let xp = Number(localStorage.getItem("xp")) || 0;
  xp += 5;
  localStorage.setItem("xp", xp);

  alert(`Quiz completed! Score: ${score}`);
  window.location.href = "progress.html";
}
