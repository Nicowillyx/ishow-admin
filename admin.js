// ==========================
// CONFIG
// ==========================
const API_BASE = "https://ishow-feedback-backend-1.onrender.com";

// ==========================
// ADMIN LOGIN
// ==========================
function loginAdmin() {
  const key = document.getElementById("password").value.trim();
  const errorBox = document.getElementById("login-error");

  fetch(`${API_BASE}/api/admin-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.ok) {
        localStorage.setItem("ISHOW_ADMIN", "true");
        window.location.href = "admin.html";
      } else {
        errorBox.textContent = "Invalid password";
      }
    })
    .catch(() => {
      errorBox.textContent = "Network error";
    });
}

// Check login session
function requireAdmin() {
  if (!localStorage.getItem("ISHOW_ADMIN")) {
    window.location.href = "index.html";
  }
}

// Logout
function logout() {
  localStorage.removeItem("ISHOW_ADMIN");
  window.location.href = "index.html";
}

// ==========================
// FETCH FEEDBACK
// ==========================
async function loadFeedback() {
  const container = document.getElementById("feedback-container");
  const totalBox = document.getElementById("total-feedback");
  const avgBox = document.getElementById("avg-rating");

  container.innerHTML = `<div class="loader"></div>`;

  try {
    const res = await fetch(`${API_BASE}/api/feedbacks`);
    const data = await res.json();

    if (!data.ok) {
      container.innerHTML = "<p>Error loading feedback.</p>";
      return;
    }

    let rows = data.rows;

    // Compute statistics
    totalBox.textContent = rows.length;
    const avg =
      rows.reduce((sum, f) => sum + f.rating, 0) / (rows.length || 1);
    avgBox.textContent = `${avg.toFixed(1)} ⭐`;

    renderFeedback(rows);

    window.ALL_FEEDBACK = rows; // save globally for search/filter

  } catch (err) {
    container.innerHTML = "<p>Network error loading data.</p>";
  }
}

// ==========================
// RENDER FEEDBACK CARDS
// ==========================
function renderFeedback(list) {
  const container = document.getElementById("feedback-container");

  if (!list.length) {
    container.innerHTML = "<p>No feedback found.</p>";
    return;
  }

  container.innerHTML = "";

  list.forEach((fb) => {
    const card = document.createElement("div");
    card.className = "feedback-card";

    card.innerHTML = `
      <h3>${fb.name || "Anonymous"}</h3>
      <p><strong>Item:</strong> ${fb.item || "None"}</p>
      <p><strong>Rating:</strong> ${"⭐".repeat(fb.rating)}</p>
      <p class="msg">${fb.message}</p>

      ${
        fb.image_url
          ? `<img src="${fb.image_url}" onclick="zoomImage('${fb.image_url}')" />`
          : ""
      }

      <button class="delete-btn" onclick="deleteFeedback('${fb._id}', this)">
        Delete
      </button>
    `;

    container.appendChild(card);
  });
}

// ==========================
// DELETE FEEDBACK
// ==========================
function deleteFeedback(id, btn) {
  if (!confirm("Delete this feedback?")) return;

  btn.textContent = "Deleting…";

  fetch(`${API_BASE}/api/delete/${id}`, {
    method: "DELETE",
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.ok) {
        const card = btn.parentElement;
        card.style.opacity = "0";
        card.style.transform = "scale(0.9)";
        setTimeout(() => card.remove(), 300);
      } else {
        alert("Delete failed.");
      }
    });
}

// ==========================
// SEARCH
// ==========================
function searchFeedback() {
  const term = document.getElementById("search").value.toLowerCase();

  const filtered = window.ALL_FEEDBACK.filter((f) => {
    return (
      (f.name || "").toLowerCase().includes(term) ||
      (f.message || "").toLowerCase().includes(term) ||
      (f.item || "").toLowerCase().includes(term)
    );
  });

  renderFeedback(filtered);
}

// ==========================
// FILTER BY RATING
// ==========================
function filterRating(star) {
  if (star === "all") {
    renderFeedback(window.ALL_FEEDBACK);
    return;
  }

  const filtered = window.ALL_FEEDBACK.filter(
    (f) => f.rating === Number(star)
  );

  renderFeedback(filtered);
}

// ==========================
// IMAGE ZOOM MODAL
// ==========================
function zoomImage(url) {
  const modal = document.createElement("div");
  modal.className = "img-modal";
  modal.innerHTML = `
    <div class="img-box">
      <img src="${url}">
    </div>
  `;
  modal.onclick = () => modal.remove();
  document.body.appendChild(modal);
}

// ==========================
// RUN DASHBOARD
// ==========================
if (window.location.pathname.includes("admin.html")) {
  requireAdmin();
  window.onload = loadFeedback;
}
