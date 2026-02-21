import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: "10mb" })); // allow base64 image uploads

// Path to manual events JSON
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const manualEventsPath = path.join(__dirname, "..", "Database", "manualEvents.json");

function readManualEvents() {
  try {
    if (!fs.existsSync(manualEventsPath)) {
      fs.writeFileSync(manualEventsPath, "[]", "utf8");
    }
    const raw = fs.readFileSync(manualEventsPath, "utf8");
    return JSON.parse(raw || "[]");
  } catch (err) {
    console.error("Error reading manualEvents.json:", err);
    return [];
  }
}

function writeManualEvents(events) {
  fs.writeFileSync(manualEventsPath, JSON.stringify(events, null, 2), "utf8");
}
// ---------- SCRAPER LOGIC ----------
async function getUmsuEvents() {
  try {
    const url = "https://umsu.ca/events/";
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const $ = cheerio.load(data);
    const results = [];

    $("article").each((i, art) => {
      const el = $(art);
      const linkTag = el.find("a.tribe-events-pro-photo__event-title-link");

      // Skip if no title/link found
      if (linkTag.length === 0) return;

      const timeContainer = el.find("div.tribe-events-pro-photo__event-datetime");
      const actualTimes = timeContainer.find("time");

      results.push({
        id: `umsu-${i}-${Date.now()}`,
        title: linkTag.text().trim() || "Untitled Event",
        image:
          el.find("img.tribe-events-pro-photo__event-featured-image").attr("src") || "",
        link: linkTag.attr("href") || "#",
        date:
          el.find("time.tribe-events-pro-photo__event-date-tag-datetime").attr("datetime") ||
          "N/A",
        start_time: $(actualTimes[0]).text().trim() || "N/A",
        end_time: $(actualTimes[1]).text().trim() || "N/A",
        location: "",
        description: "",
        source: "UMSU"
      });
    });

    return results;
  } catch (err) {
    console.error("UMSU Scrape Failed:", err.message);
    return [];
  }
}

async function getUmMusicEvents() {
  try {
    const url = "https://umanitoba.ca/music/concert-hall-events";
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const $ = cheerio.load(data);
    const results = [];

    $("article.event-card-new").each((i, art) => {
      const el = $(art);
      const month = el.find(".month").text().trim();
      const day = el.find(".day").text().trim();

      let link = el.closest("a").attr("href") || "N/A";
      if (link && link.startsWith("/")) {
        link = `https://umanitoba.ca${link}`;
      }

      let image = el.find("img").attr("src") || "";
      if (image && image.startsWith("/")) {
        image = `https://umanitoba.ca${image}`;
      }

      results.push({
        id: `music-${i}-${Date.now()}`,
        title: el.find("h3").text().trim() || "Music Event",
        image,
        link,
        date: `${month} ${day}`.trim() || "N/A",
        start_time: el.find(".start").text().trim() || "N/A",
        end_time: el.find(".end").text().trim() || "N/A",
        location: "",
        description: "",
        source: "UofM Music"
      });
    });

    return results;
  } catch (err) {
    console.error("Music Scrape Failed:", err.message);
    return [];
  }
}

// ---------- ROUTES ----------

// Combined events (manual + scraped) for homepage
app.get("/", async (req, res) => {
  try {
    const manualEvents = readManualEvents();
    const umsu = await getUmsuEvents();
    const music = await getUmMusicEvents();

    res.json({
      message: "Server is working!",
      data: [...manualEvents, ...umsu, ...music]
    });
  } catch (error) {
    console.error("GET / error:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// Optional API route
app.get("/api/events", async (req, res) => {
  try {
    const manualEvents = readManualEvents();
    const umsu = await getUmsuEvents();
    const music = await getUmMusicEvents();

    res.json([...manualEvents, ...umsu, ...music]);
  } catch (error) {
    console.error("GET /api/events error:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// Get only manual events (for admin page)
app.get("/manual-events", (req, res) => {
  try {
    const manualEvents = readManualEvents();
    res.json({ data: manualEvents });
  } catch (err) {
    console.error("GET /manual-events error:", err);
    res.status(500).json({ error: "Failed to load manual events" });
  }
});

// Add manual event
app.post("/manual-events", (req, res) => {
  try {
    const {
      title,
      date,
      start_time = "",
      end_time = "",
      location = "",
      description = "",
      link = "",
      image = "",
      source = "Manual"
    } = req.body;

    if (!title || !date) {
      return res.status(400).json({ error: "title and date are required" });
    }

    const manualEvents = readManualEvents();

    const newEvent = {
      id: `manual-${Date.now()}`,
      title,
      date, // YYYY-MM-DD
      start_time,
      end_time,
      location,
      description,
      link,
      image,
      source
    };

    manualEvents.unshift(newEvent);
    writeManualEvents(manualEvents);

    res.status(201).json({ message: "Event saved", event: newEvent });
  } catch (err) {
    console.error("POST /manual-events error:", err);
    res.status(500).json({ error: "Failed to save event" });
  }
});

// Update manual event (edit)
app.put("/manual-events/:id", (req, res) => {
  try {
    const { id } = req.params;
    const manualEvents = readManualEvents();
    const index = manualEvents.findIndex((ev) => ev.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "Event not found" });
    }

    const existing = manualEvents[index];
    const updated = {
      ...existing,
      ...req.body,
      image: req.body.image || existing.image || ""
    };

    manualEvents[index] = updated;
    writeManualEvents(manualEvents);

    res.json({ message: "Event updated", event: updated });
  } catch (err) {
    console.error("PUT /manual-events/:id error:", err);
    res.status(500).json({ error: "Failed to update event" });
  }
});

// Delete manual event
app.delete("/manual-events/:id", (req, res) => {
  try {
    const { id } = req.params;
    const manualEvents = readManualEvents();

    const updated = manualEvents.filter((ev) => ev.id !== id);

    if (updated.length === manualEvents.length) {
      return res.status(404).json({ error: "Event not found" });
    }

    writeManualEvents(updated);
    res.json({ message: "Event deleted" });
  } catch (err) {
    console.error("DELETE /manual-events/:id error:", err);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

app.listen(PORT, () => {
  console.log(`Scraper server live on http://localhost:${PORT}`);
});