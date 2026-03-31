// Loads a quiz from data/quizzes.json matching ?id=quiz-X
let quizData = null;
let userAnswers = {};

async function loadQuiz() {
  const params = new URLSearchParams(window.location.search);
  const quizId = params.get("id") || "quiz-1";

  let quizzes;
  try {
    const res = await fetch("data/quizzes.json");
    quizzes = await res.json();
  } catch (e) {
    document.getElementById("quizContainer").innerHTML = "<p>Could not load quiz data.</p>";
    return;
  }

  quizData = quizzes.find(q => q.id === quizId);
  if (!quizData) {
    document.getElementById("quizContainer").innerHTML = "<p>Quiz not found.</p>";
    return;
  }

  document.title = "Mudrika | " + quizData.title;
  renderQuiz();
}

function renderQuiz() {
  const container = document.getElementById("quizContainer");
  container.innerHTML = `<h2 style="font-family:'Cinzel',serif;">${quizData.title}</h2>`;

  quizData.questions.forEach((q, qi) => {
    const block = document.createElement("div");
    block.style.cssText = "background:#FFF9F2;border-radius:16px;padding:24px;margin:20px auto;max-width:520px;box-shadow:0 4px 15px rgba(0,0,0,0.08);text-align:left;";

    let imageHtml = "";
    if (q.image) {
      imageHtml = `
        <div style="text-align:center;margin-bottom:14px;">
          <img src="${q.image}" alt="sign" style="max-width:160px;max-height:160px;border-radius:12px;background:#F6E2CC;padding:8px;"
            onerror="this.style.display='none';">
        </div>`;
    }

    const optionsHtml = q.options.map(opt => `
      <label style="display:flex;align-items:center;gap:10px;margin:8px 0;cursor:pointer;padding:10px 14px;border-radius:10px;border:2px solid #D8BFA8;transition:border-color 0.2s;" class="opt-label" id="label-${q.id}-${opt.replace(/\s/g,'_')}">
        <input type="radio" name="q-${q.id}" value="${opt}" onchange="selectAnswer('${q.id}', '${opt.replace(/'/g,"\\'")}', this)">
        <span>${opt}</span>
      </label>
    `).join("");

    block.innerHTML = `
      <p style="font-weight:600;margin:0 0 12px;font-size:1rem;"><span style="color:#C65A3A;">Q${qi+1}.</span> ${q.question}</p>
      ${imageHtml}
      <div id="opts-${q.id}">${optionsHtml}</div>
      <div id="feedback-${q.id}" style="margin-top:10px;font-weight:600;font-size:0.9rem;"></div>
    `;

    container.appendChild(block);
  });
}

function selectAnswer(qid, value, input) {
  userAnswers[qid] = value;
  // Highlight selected
  const question = quizData.questions.find(q => q.id === qid);
  question.options.forEach(opt => {
    const label = document.getElementById("label-" + qid + "-" + opt.replace(/\s/g,'_'));
    if (label) label.style.borderColor = opt === value ? "#C65A3A" : "#D8BFA8";
  });
}

async function submitQuiz() {
  if (!quizData) return;

  let score = 0;

  quizData.questions.forEach(q => {
    const selected = userAnswers[q.id];
    const feedbackEl = document.getElementById("feedback-" + q.id);
    const optsEl = document.getElementById("opts-" + q.id);

    // Disable all radio inputs for this question
    optsEl.querySelectorAll("input[type=radio]").forEach(r => r.disabled = true);

    // Color the labels
    q.options.forEach(opt => {
      const label = document.getElementById("label-" + q.id + "-" + opt.replace(/\s/g,'_'));
      if (!label) return;
      if (opt === q.answer) {
        label.style.borderColor = "#4CAF50";
        label.style.background = "#f0fff4";
      } else if (opt === selected && opt !== q.answer) {
        label.style.borderColor = "#E53935";
        label.style.background = "#fff5f5";
      }
    });

    if (selected === q.answer) {
      score++;
      feedbackEl.style.color = "#4CAF50";
      feedbackEl.textContent = "✓ Correct!";
    } else {
      feedbackEl.style.color = "#E53935";
      feedbackEl.textContent = selected
        ? `✗ Incorrect. Correct answer: ${q.answer}`
        : `✗ Not answered. Correct answer: ${q.answer}`;
    }
  });

  const total = quizData.questions.length;
  const pct = Math.round((score / total) * 100);

  // Save detailed quiz score 
  const quizScores = JSON.parse(localStorage.getItem("quizScores") || "{}");
  quizScores[quizData.id] = {
    score, total,
    title: quizData.title,
    date: new Date().toLocaleDateString()
  };
  localStorage.setItem("quizScores", JSON.stringify(quizScores));

  // Save simple quizResults map (merged) — keyed by quizId for cross-page compatibility
  const quizResults = JSON.parse(localStorage.getItem("quizResults") || "{}");
  quizResults[quizData.id] = score;
  localStorage.setItem("quizResults", JSON.stringify(quizResults));

  // Award XP for quiz (merged) — +5 XP per quiz attempt
  const xp = Number(localStorage.getItem("xp")) || 0;
  localStorage.setItem("xp", xp + 5);

  // Keep totalXP in sync (original)
  const totalXP = parseInt(localStorage.getItem("totalXP") || "0");
  localStorage.setItem("totalXP", totalXP + 5);

  //Save to Firestore if user is logged in
  const userId = localStorage.getItem('mudrika_user_id');
  const isGuest = localStorage.getItem('mudrika_current_user') === 'guest';
  
  if (userId && !isGuest && typeof saveQuizScore !== 'undefined') {
          try {
          await saveQuizScore(userId, quizData.id, score, total);
          console.log("Quiz score saved to Firestore");
          
          // Also save overall progress
          await saveUserProgress(userId, {
              quizScores: quizScores,
              totalXP: parseInt(localStorage.getItem("totalXP") || "0"),
              xp: parseInt(localStorage.getItem("xp") || "0")
          });
          console.log("Overall progress saved to Firestore");
      } catch (error) {
          console.error("Firestore save failed, but data saved locally:", error);
          // Don't show error to user - data is saved locally
      }
  } else {
      console.log("Quiz score saved to localStorage only (guest or no Firestore)");
  }

  // Completion alert with score 
  alert("Quiz completed! Score: " + score + " / " + total + " (" + pct + "%)");

  // Show result banner 
  const container = document.getElementById("quizContainer");
  const banner = document.createElement("div");
  banner.style.cssText = "background:#FFF9F2;border-radius:20px;padding:30px;max-width:520px;margin:20px auto;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,0.1);";
  banner.innerHTML = `
    <h2 style="font-family:'Cinzel',serif;color:${pct >= 60 ? "#4CAF50" : "#E53935"};">${pct >= 60 ? "Well Done! 🎉" : "Keep Practising! 💪"}</h2>
    <p style="font-size:1.3rem;">Score: <strong>${score} / ${total}</strong> (${pct}%)</p>
    <div style="display:flex;gap:12px;justify-content:center;margin-top:20px;flex-wrap:wrap;">
      <a href="index.html" class="start-btn">Back to Lessons</a>
      <a href="progress.html" class="start-btn" style="background:#355C7D;">View Progress</a>
    </div>
  `;
  container.appendChild(banner);

  banner.scrollIntoView({ behavior: "smooth" });

  // Hide submit button
  const submitBtn = document.querySelector("button[onclick='submitQuiz()']");
  if (submitBtn) submitBtn.style.display = "none";
}

loadQuiz();