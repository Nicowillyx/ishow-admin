const backend = "https://ishow-feedback-backend-1.onrender.com";

const loginScreen = document.getElementById("loginScreen");
const dashboard = document.getElementById("dashboard");
const loginBtn = document.getElementById("loginBtn");
const adminPassword = document.getElementById("adminPassword");
const loginMsg = document.getElementById("loginMsg");
const feedbackList = document.getElementById("feedbackList");

// LOGIN SYSTEM
loginBtn.addEventListener("click", async () => {
  const key = adminPassword.value.trim();

  const res = await fetch(`${backend}/api/admin-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key })   // VERY IMPORTANT
  });

  const json = await res.json();

  if (!res.ok) {
    loginMsg.textContent = json.error || "Invalid password";
    return;
  }

  // LOGIN SUCCESS
  loginScreen.classList.add("hidden");
  dashboard.classList.remove("hidden");

  loadFeedback();
});

// LOAD FEEDBACK
async function loadFeedback() {
  feedbackList.innerHTML = "Loading...";

  const res = await fetch(`${backend}/api/feedbacks`);
  const data = await res.json();

  if (!data.ok) {
    feedbackList.innerHTML = "Failed to load feedback.";
    return;
  }

  feedbackList.innerHTML = "";

  data.rows.forEach(fb => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <div class="rating">⭐ ${fb.rating}</div>
      <div class="item">${fb.item || "No item"}</div>
      <p>${fb.message}</p>
      <small>${fb.name || "Anonymous"}</small><br>

      ${fb.image_url ? `
        <div class="image-preview">
          <img src="${fb.image_url}">
        </div>
      ` : ""}

      <button class="delete-btn" onclick="deleteFeedback('${fb._id}')">Delete</button>
    `;

    feedbackList.appendChild(card);
  });
}

// DELETE FEEDBACK
async function deleteFeedback(id) {
  if (!confirm("Delete this feedback?")) return;

  await fetch(`${backend}/api/delete/${id}`, {
    method: "DELETE"
  });

  loadFeedback();
}
