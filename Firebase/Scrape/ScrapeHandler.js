let allEvents = [];

// Convert your event date strings into something searchable
function normalizeText(s) {
  return (s || "").toString().toLowerCase().trim();
}

function renderEvents(events) {
  const container = document.getElementById("cardsContainer");
  if (!container) return;

  container.innerHTML = ""; // clear old cards

  if (!events.length) {
    container.innerHTML = `<p style="padding:12px;">No events found.</p>`;
    return;
  }

  for (const ev of events) {
    // date formatting (keep simple)
    const dateText = ev.date || "";
    const timeText =
      ev.start_time && ev.end_time ? `${ev.start_time} - ${ev.end_time}` :
      ev.start_time ? ev.start_time : "Time N/A";

    const card = document.createElement("article");
    card.className = "event-tile";
    card.innerHTML = `
      <img class="event-img" src="${ev.image || "../Assets/background.png"}" alt="Event">
      <div class="event-details">
        <div class="date-box">
          <div class="month">${(dateText.split(" ")[0] || "TBD").toUpperCase()}</div>
          <div class="day">${(dateText.split(" ")[1] || "").toUpperCase()}</div>
        </div>
        <div class="event-text">
          <div class="meta-row">
            <span class="tag">${ev.source || "Free"}</span>
            <span class="time">${timeText}</span>
          </div>
          <h3 class="event-title">${ev.title || "Untitled Event"}</h3>
          <a class="see-more-btn" href="${ev.link || "#"}" target="_blank" rel="noreferrer">See More</a>
        </div>
      </div>
    `;
    container.appendChild(card);
  }
}

function applySearch() {
  const input = document.getElementById("search-input");
  const q = normalizeText(input?.value);

  // empty search -> show everything
  if (!q) {
    renderEvents(allEvents);
    return;
  }

  const filtered = allEvents.filter(ev => {
    const haystack = [
      ev.title,
      ev.date,
      ev.start_time,
      ev.end_time,
      ev.source
    ].map(normalizeText).join(" ");

    return haystack.includes(q);
  });

  renderEvents(filtered);
}

async function loadEvents() {
  const res = await fetch("http://localhost:3000/api/events");
  allEvents = await res.json();
  renderEvents(allEvents);
}

window.addEventListener("DOMContentLoaded", () => {
  loadEvents();

  // click search
  const btn = document.getElementById("search-btn");
  if (btn) btn.addEventListener("click", applySearch);

  // press Enter to search
  const input = document.getElementById("search-input");
  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") applySearch();
    });

    // OPTIONAL: live filtering as you type
    input.addEventListener("input", applySearch);
  }
});