console.log("PostHandler loaded ✅");

const form = document.getElementById("eventForm");
const postsContainer = document.getElementById("postsContainer");
const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const sortSelect = document.getElementById("sortPosts");
const editingEventIdInput = document.getElementById("editingEventId");
const cancelEditBtn = document.getElementById("cancelEditBtn");

const API_BASE = "http://localhost:3000";

let manualPosts = [];

// ---------- Utils ----------
function formatDateForCard(dateValue) {
  if (!dateValue) return "";
  const d = new Date(dateValue + "T00:00:00");
  return d.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

function formatTime(timeValue) {
  if (!timeValue) return "";
  const [hour, minute] = timeValue.split(":");
  const d = new Date();
  d.setHours(Number(hour), Number(minute));
  return d.toLocaleTimeString("en-CA", {
    hour: "numeric",
    minute: "2-digit"
  });
}

function toInputTime(prettyTime) {
  if (!prettyTime || prettyTime === "N/A") return "";
  const match = prettyTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return "";

  let hour = Number(match[1]);
  const minute = match[2];
  const ampm = match[3].toUpperCase();

  if (ampm === "PM" && hour !== 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;

  return `${String(hour).padStart(2, "0")}:${minute}`;
}

function getNumericIdPart(id) {
  // manual-1730000000000 -> 1730000000000
  if (!id) return 0;
  const parts = String(id).split("-");
  return Number(parts[parts.length - 1]) || 0;
}

function sortPostsList(posts, mode) {
  const arr = [...posts];

  switch (mode) {
    case "oldest":
      arr.sort((a, b) => getNumericIdPart(a.id) - getNumericIdPart(b.id));
      break;
    case "dateAsc":
      arr.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
      break;
    case "dateDesc":
      arr.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      break;
    case "titleAsc":
      arr.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
      break;
    case "titleDesc":
      arr.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
      break;
    case "newest":
    default:
      arr.sort((a, b) => getNumericIdPart(b.id) - getNumericIdPart(a.id));
      break;
  }

  return arr;
}

function resetFormState() {
  form.reset();
  preview.style.display = "none";
  preview.src = "";
  editingEventIdInput.value = "";

  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.textContent = "Publish";
}

// ---------- Image preview ----------
imageInput?.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) {
    preview.style.display = "none";
    preview.src = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    preview.src = e.target.result;
    preview.style.display = "block";
  };
  reader.readAsDataURL(file);
});

// ---------- Render ----------
function createPostCard(eventData) {
  const article = document.createElement("article");
  article.className = "post";

  const displayDate = formatDateForCard(eventData.date);
  const timeText =
    eventData.start_time && eventData.end_time
      ? `${eventData.start_time} • ${eventData.end_time}`
      : eventData.start_time || "Time N/A";

  article.innerHTML = `
    ${eventData.image ? `<img src="${eventData.image}" alt="${eventData.title}" style="width:100%; max-height:180px; object-fit:cover; border-radius:12px; margin-bottom:10px;">` : ""}
    <h3>${eventData.title}</h3>
    <p class="meta">${displayDate} • ${eventData.location || "No location"} • ${timeText}</p>
    <p>${eventData.description || ""}</p>
    ${eventData.link ? `<p><a href="${eventData.link}" target="_blank">Event Link</a></p>` : ""}
    <div class="post-actions">
      <button class="btn small edit-btn" type="button">Edit</button>
      <button class="btn small danger delete-btn" type="button">Delete</button>
    </div>
  `;

  // Edit
  article.querySelector(".edit-btn").addEventListener("click", () => {
    document.getElementById("title").value = eventData.title || "";
    document.getElementById("date").value = eventData.date || "";
    document.getElementById("time").value = toInputTime(eventData.start_time || "");
    document.getElementById("location").value = eventData.location || "";
    document.getElementById("description").value = eventData.description || "";
    document.getElementById("eventLink").value = eventData.link || "";
    editingEventIdInput.value = eventData.id || "";

    if (eventData.image) {
      preview.src = eventData.image;
      preview.style.display = "block";
    } else {
      preview.src = "";
      preview.style.display = "none";
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.textContent = "Update Event";

    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Delete
  article.querySelector(".delete-btn").addEventListener("click", async () => {
    const ok = confirm(`Delete "${eventData.title}"?`);
    if (!ok) return;

    try {
      const res = await fetch(`${API_BASE}/manual-events/${eventData.id}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Delete failed");
      }

      await loadManualPosts();
    } catch (err) {
      console.error(err);
      alert("Failed to delete event.");
    }
  });

  return article;
}

function renderManualPosts() {
  if (!postsContainer) return;

  const mode = sortSelect?.value || "newest";
  const sorted = sortPostsList(manualPosts, mode);

  postsContainer.innerHTML = "";

  if (sorted.length === 0) {
    postsContainer.innerHTML = `<p>No manual posts yet.</p>`;
    return;
  }

  sorted.forEach((ev) => {
    postsContainer.appendChild(createPostCard(ev));
  });
}

// ---------- Load ----------
async function loadManualPosts() {
  if (!postsContainer) return;

  postsContainer.innerHTML = `<p>Loading your posts...</p>`;

  try {
    const res = await fetch(`${API_BASE}/manual-events`);
    const json = await res.json();
    manualPosts = json.data || [];
    renderManualPosts();
  } catch (err) {
    console.error("Failed to load manual posts:", err);
    postsContainer.innerHTML = `<p style="color:red;">Unable to load posts. Is backend running?</p>`;
  }
}

// ---------- Submit (Create or Update) ----------
form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const rawDate = document.getElementById("date").value;
  const rawTime = document.getElementById("time").value;
  const location = document.getElementById("location").value.trim();
  const description = document.getElementById("description").value.trim();
  const link = document.getElementById("eventLink").value.trim();

  let imageBase64 = "";
  const file = imageInput.files[0];

  if (file) {
    imageBase64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (ev) => resolve(ev.target.result);
      reader.readAsDataURL(file);
    });
  } else if (editingEventIdInput.value && preview.src) {
    imageBase64 = preview.src; // keep old image while editing
  }

  const payload = {
    title,
    date: rawDate,               // YYYY-MM-DD
    start_time: formatTime(rawTime),
    end_time: "",
    location,
    description,
    link,
    image: imageBase64,
    source: "Manual"
  };

  const editingId = editingEventIdInput.value;

  try {
    let res;

    if (editingId) {
      // UPDATE
      res = await fetch(`${API_BASE}/manual-events/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } else {
      // CREATE
      res = await fetch(`${API_BASE}/manual-events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Save failed");

    resetFormState();
    await loadManualPosts();

    alert(editingId ? "Event updated ✅" : "Event published ✅");
  } catch (err) {
    console.error(err);
    alert("Failed to save event. Make sure backend is running.");
  }
});

// ---------- Sort ----------
sortSelect?.addEventListener("change", renderManualPosts);

// ---------- Cancel Edit ----------
cancelEditBtn?.addEventListener("click", () => {
  resetFormState();
});

// ---------- Init ----------
window.addEventListener("DOMContentLoaded", loadManualPosts);