/*
function login() {
  alert("Logged in as guest (backend not connected yet).");
  window.location.href = "index.html";
}

function signup() {
  alert("Signup successful (dummy). Please login.");
  window.location.href = "login.html";
}
*/

// Simple localStorage-based auth (no real backend needed for a school project)
// Users are stored as { username, password } in localStorage

function signup() {
  const inputs = document.querySelectorAll("input");
  const username = inputs[0].value.trim();
  const password = inputs[1].value;

  if (!username || !password) {
    showMsg("Please fill in all fields.", "error"); return;
  }
  if (password.length < 4) {
    showMsg("Password must be at least 4 characters.", "error"); return;
  }

  const users = JSON.parse(localStorage.getItem("mudrika_users") || "{}");
  if (users[username]) {
    showMsg("Username already taken. Try another.", "error"); return;
  }

  users[username] = password;
  localStorage.setItem("mudrika_users", JSON.stringify(users));
  localStorage.setItem("mudrika_current_user", username);
  showMsg("Account created! Redirecting...", "success");
  setTimeout(() => window.location.href = "index.html", 1200);
}

function login() {
  const inputs = document.querySelectorAll("input");
  const username = inputs[0].value.trim();
  const password = inputs[1].value;

  if (!username || !password) {
    showMsg("Please fill in all fields.", "error"); return;
  }

  const users = JSON.parse(localStorage.getItem("mudrika_users") || "{}");
  if (!users[username] || users[username] !== password) {
    showMsg("Incorrect username or password.", "error"); return;
  }

  localStorage.setItem("mudrika_current_user", username);
  showMsg("Welcome back, " + username + "!", "success");
  setTimeout(() => window.location.href = "index.html", 1200);
}

// Guest login (merged) — skips credentials, sets a guest session
function loginAsGuest() {
  localStorage.setItem("mudrika_current_user", "guest");
  showMsg("Continuing as guest...", "success");
  setTimeout(() => window.location.href = "index.html", 1000);
}

function logout() {
  localStorage.removeItem("mudrika_current_user");
  window.location.href = "login.html";
}

function showMsg(msg, type) {
  let el = document.getElementById("auth-msg");
  if (!el) {
    el = document.createElement("p");
    el.id = "auth-msg";
    el.style.cssText = "font-weight:600;margin-top:12px;font-size:0.9rem;";
    document.querySelector("button").insertAdjacentElement("afterend", el);
  }
  el.textContent = msg;
  el.style.color = type === "error" ? "#E53935" : "#4CAF50";
}