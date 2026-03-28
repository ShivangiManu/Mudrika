// ============================================================
// videos.js  -  Mudrika Video Lectures
// Displays all ISL words grouped by letter
// Click any word to open video in a modal popup
// ============================================================

const videoData = {
  A: [
    { word: "Apple", id: "nuYcIMq8e5U" },
    { word: "Army", id: "uRwmFRKMF58" },
    { word: "Allergy", id: "q_HxcWofEZU" },
    { word: "Analysis", id: "zlGi_SB04cI" },
    { word: "Audiometer", id: "At0PWlWiUoI" }
  ],
  B: [
    { word: "Bowl", id: "doWXendPFc0" },
    { word: "Boy", id: "FBngX7K4yaI" },
    { word: "Bib", id: "W6k4SdELuOA" },
    { word: "Baby", id: "ee81RfWTEq0" },
    { word: "Bed Rest", id: "rw8hYbppJmg" }
  ],
  C: [
    { word: "Child", id: "vLbvf0zEj5M" },
    { word: "Car", id: "SUGgjeP54CQ" },
    { word: "Calipers", id: "WQPsJY8idjs" },
    { word: "Capsicum", id: "kjF2AUzUKO0" },
    { word: "Crumb", id: "r8g6qc1zWOM" }
  ],
  D: [
    { word: "Dog", id: "7O43NW_PICc" },
    { word: "Dress", id: "3snObAxKXOQ" },
    { word: "Dislocation", id: "fbCNw1h5Svk" },
    { word: "Decree", id: "WSHHPJxiI80" },
    { word: "Dust", id: "ACJG5VeKrvQ" }
  ],
  E: [
    { word: "Electrolysis", id: "f059jSXLyCQ" },
    { word: "Elephant", id: "LlpSiou4X7w" },
    { word: "Eat", id: "Cgs1MibMXJ0" },
    { word: "Egg", id: "o_ebrgyrnuk" },
    { word: "Exclude", id: "BN8N3UwtL00" }
  ],
  F: [
    { word: "Fan", id: "DY7bPAPaDTM" },
    { word: "Flyover", id: "A20dc_CbsOI" },
    { word: "Fox", id: "IWBVW-QyFEw" },
    { word: "Food", id: "dTI8mMq81eM" },
    { word: "Future", id: "iT0YsG0QkbU" }
  ],
  G: [
    { word: "Guava", id: "5luUUDnqHL0" },
    { word: "Gun", id: "t9b5K6YsBk8" },
    { word: "Guitar", id: "pVFFflkBVio" },
    { word: "Group", id: "VkrF0Q4fWRo" },
    { word: "Girl", id: "wedIVeQMY1k" }
  ],
  H: [
    { word: "Heel", id: "jT3B4xMBr0E" },
    { word: "Hen", id: "B2EviVR2LCM" },
    { word: "Hair", id: "FTNGNvDqp-g" },
    { word: "Hello", id: "yBQA3coUjH0" },
    { word: "House", id: "U--0FZU2bDg" }
  ],
  I: [
    { word: "Infant", id: "uPpD0etfJrk" },
    { word: "Infection", id: "50Age2AKB6g" },
    { word: "Ice Cream", id: "0z2x6EjJ5ak" },
    { word: "India", id: "hjbpSOoOBmw" },
    { word: "Itch", id: "U_I4IzFnhdw" }
  ],
  J: [
    { word: "Job", id: "JSEGoqKaQM0" },
    { word: "Jacket", id: "Aresava8ILw" },
    { word: "Jalebi", id: "y4CEIJJVt64" },
    { word: "Join", id: "-iI-2pvNmWQ" },
    { word: "Jail", id: "atyCov9u9no" }
  ],
  K: [
    { word: "Kitchen", id: "EzA7vpG_mnw" },
    { word: "Kite", id: "iLrSnUDmfC4" },
    { word: "Kidney", id: "AFI9CRiFC5s" },
    { word: "Know", id: "jTBahbE4_OY" },
    { word: "Karate", id: "EvZvymz1nRo" }
  ],
  L: [
    { word: "Lock", id: "ZcVzjZeVwj0" },
    { word: "Line", id: "1TiirpYN_W8" },
    { word: "Lightening", id: "bbWDUkaUXLE" },
    { word: "Live", id: "ea8VG_U1OM4" },
    { word: "Lion", id: "RhEpVt-AEK8" }
  ],
  M: [
    { word: "Monkey", id: "D-6KziM3_ac" },
    { word: "Medicine", id: "YQ-O-pVHqcE" },
    { word: "Medication", id: "f48qzpAaVXA" },
    { word: "Marigold", id: "L8RxN_IwuxU" },
    { word: "Moon", id: "cYsUFoYx5do" }
  ],
  N: [
    { word: "Nutrition", id: "KKOqbdFgAgo" },
    { word: "Nurse", id: "933fIHNLS9s" },
    { word: "Name", id: "ZlECIvK4NRU" },
    { word: "North", id: "gvz1mZnNRJw" },
    { word: "Noon", id: "6ZWrFKv-PrI" }
  ],
  O: [
    { word: "Owl", id: "C9W9Hvx3nNY" },
    { word: "Old", id: "z-gika19BqU" },
    { word: "Oil", id: "aHRwIisA1Pc" },
    { word: "Oval", id: "-EqicMMq320" },
    { word: "Other", id: "_Ugi-tUFXN8" }
  ],
  P: [
    { word: "Passed Away", id: "xFUkNWsspHw" },
    { word: "Pen Drive", id: "AY5ZDfd57vc" },
    { word: "Papad", id: "10JZF0uiyuQ" },
    { word: "Paralysis", id: "XvU3rScmfT8" },
    { word: "Piano", id: "GZTuJ6NMvbw" }
  ],
  Q: [
    { word: "Quarantine", id: "IAbloDB94LI" },
    { word: "Quarter", id: "QowRgF354O8" },
    { word: "Quickly", id: "IGsDuTIs2ZU" },
    { word: "Quiet", id: "FWmsk6FzQkk" },
    { word: "Query", id: "Km1_9ZLW-w0" }
  ],
  R: [
    { word: "Rhinoceros", id: "945eoq95GKM" },
    { word: "Reduce", id: "HJLgJ0K4-pk" },
    { word: "Read", id: "wB_IFLoc1yE" },
    { word: "Refugee", id: "4UH8Dr9gql0" },
    { word: "Repair", id: "4JPQ0EUdcbg" }
  ],
  S: [
    { word: "Shark", id: "KtLvUejfy4w" },
    { word: "Shirt", id: "f3PZuOrAeqM" },
    { word: "Slippers", id: "eGmAeiNT3qY" },
    { word: "Starvation", id: "s42rKQoFo2w" },
    { word: "Scabies", id: "64hb_H9Pwls" }
  ],
  T: [
    { word: "Tea", id: "YQSQml2ePQM" },
    { word: "Toxicology", id: "9Mo0t3duY0I" },
    { word: "Tonsillectomy", id: "Wtu3ksF0L4Y" },
    { word: "Tablet", id: "kJc7lHoG_kk" },
    { word: "Take", id: "Cw13fIyVSNA" }
  ],
  U: [
    { word: "Urine", id: "muZYTR0Snk4" },
    { word: "Uranus", id: "PLw79dcIj-4" },
    { word: "Uterine", id: "Yg0o81UchyY" },
    { word: "Up", id: "rn4NJPtL1m8" },
    { word: "Update", id: "tyYUlCikK1Q" }
  ],
  V: [
    { word: "Veterinarian", id: "VH9BKxQgE4I" },
    { word: "Vitamin", id: "MW6BHvkZkt8" },
    { word: "Visit", id: "7_MGbl4Rwlo" },
    { word: "Vulture", id: "HJZlFVyPI5g" },
    { word: "Voltmeter", id: "y707Jq7ORR4" }
  ],
  W: [
    { word: "Website", id: "Tv1bOlYSqYI" },
    { word: "Weather", id: "0DYcaZmhlkY" },
    { word: "Wedding", id: "_rHStCQCPno" },
    { word: "Weightlifting", id: "4LndvMQ2dO0" },
    { word: "Weekly", id: "95KlTHhKlmk" }
  ],
  X: [
    { word: "Xylophone", id: "_Zk6T8osdEc" },
    { word: "Xbox", id: "TdwAJ3968lM" },
    { word: "Xylem", id: "uDFcyG4aqV8" },
    { word: "X Ray", id: "kKPQyWPMUF0" },
    { word: "Dental X Ray", id: "3ga1Wrb-SXw" }
  ],
  Y: [
    { word: "Yak", id: "lZi4g6ZWBro" },
    { word: "Yes", id: "LAT-u9Ww5ZU" },
    { word: "Yellow", id: "doW1fga72Kk" },
    { word: "Yolk", id: "-QF3_AuexYY" },
    { word: "Yell", id: "eGupva-rFEA" }
  ],
  Z: [
    { word: "Zone", id: "wQEaOUWUGPM" },
    { word: "Zoo", id: "ws_qjks_TFo" },
    { word: "Zoom", id: "guOIIr835FE" },
    { word: "Zebra", id: "DCjd5dJLuF4" },
    { word: "Zipper", id: "QMFllz8bqbI" }
  ]
};

// ── Build the page ─────────────────────────────────────────
const mainContainer = document.getElementById("videoWordsContainer");

Object.keys(videoData).forEach(letter => {
  // Letter heading
  const section = document.createElement("div");
  section.style.cssText = "margin-bottom: 40px;";

  section.innerHTML = `
    <h2 style="
      font-family: 'Cinzel', serif;
      color: #C65A3A;
      font-size: 1.8rem;
      border-bottom: 2px solid #F2B36D;
      padding-bottom: 8px;
      margin-bottom: 16px;
    ">${letter}</h2>
    <div class="word-grid" id="grid-${letter}"></div>
  `;

  mainContainer.appendChild(section);

  // Word chips
  const grid = section.querySelector(`#grid-${letter}`);
  videoData[letter].forEach(item => {
    const chip = document.createElement("button");
    chip.textContent = item.word;
    chip.style.cssText = `
      background: #FFF9F2;
      color: #3A2E2A;
      border: 2px solid #D8BFA8;
      padding: 8px 18px;
      border-radius: 20px;
      font-family: 'Poppins', sans-serif;
      font-size: 0.9rem;
      cursor: pointer;
      margin: 6px;
      transition: all 0.2s ease;
    `;
    chip.onmouseover = () => {
      chip.style.background = "#C65A3A";
      chip.style.color = "#fff";
      chip.style.borderColor = "#C65A3A";
    };
    chip.onmouseout = () => {
      chip.style.background = "#FFF9F2";
      chip.style.color = "#3A2E2A";
      chip.style.borderColor = "#D8BFA8";
    };
    chip.onclick = () => openModal(item.word, item.id);
    grid.appendChild(chip);
  });
});

// ── Modal ──────────────────────────────────────────────────
function openModal(word, youtubeId) {
  // Remove existing modal if any
  const existing = document.getElementById("videoModal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "videoModal";
  modal.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.75);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    padding: 20px;
  `;

  modal.innerHTML = `
    <div style="
      background: #FFF9F2;
      border-radius: 20px;
      padding: 24px;
      max-width: 680px;
      width: 100%;
      position: relative;
      box-shadow: 0 20px 60px rgba(0,0,0,0.4);
    ">
      <!-- Close button -->
      <button onclick="closeModal()" style="
        position: absolute;
        top: 14px;
        right: 16px;
        background: #C65A3A;
        color: white;
        border: none;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        font-size: 1.1rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
      ">✕</button>

      <!-- Word title -->
      <h2 style="
        font-family: 'Cinzel', serif;
        color: #C65A3A;
        margin: 0 0 16px;
        font-size: 1.5rem;
      ">${word}</h2>

      <!-- Video embed -->
      <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;">
        <iframe
          src="https://www.youtube.com/embed/${youtubeId}?autoplay=1"
          style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;border-radius:12px;"
          allow="autoplay; encrypted-media"
          allowfullscreen>
        </iframe>
      </div>
    </div>
  `;

  // Click outside to close
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  document.body.appendChild(modal);
}

function closeModal() {
  const modal = document.getElementById("videoModal");
  if (modal) modal.remove();
}

// Close with Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});