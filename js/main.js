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

/* ------------------------------
   LOAD LESSON CARDS
--------------------------------*/

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

