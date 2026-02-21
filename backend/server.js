const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

// --- BULLETPROOF SCRAPER LOGIC ---

async function getUmsuEvents() {
    try {
        const url = "https://umsu.ca/events/";
        const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $ = cheerio.load(data);
        const results = [];

        $('article').each((i, art) => {
            const el = $(art);
            const linkTag = el.find('a.tribe-events-pro-photo__event-title-link');
            
            // Skip if no title/link found
            if (linkTag.length === 0) return;

            const timeContainer = el.find('div.tribe-events-pro-photo__event-datetime');
            const actualTimes = timeContainer.find('time');

            results.push({
                title: linkTag.text().trim() || "Untitled Event",
                image: el.find('img.tribe-events-pro-photo__event-featured-image').attr('src') || "default.jpg",
                link: linkTag.attr('href') || "#",
                date: el.find('time.tribe-events-pro-photo__event-date-tag-datetime').attr('datetime') || "N/A",
                start_time: $(actualTimes[0]).text().trim() || "N/A",
                end_time: $(actualTimes[1]).text().trim() || "N/A",
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
        const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $ = cheerio.load(data);
        const results = [];

        $('article.event-card-new').each((i, art) => {
            const el = $(art);
            const month = el.find('.month').text().trim();
            const day = el.find('.day').text().trim();

            results.push({
                title: el.find('h3').text().trim() || "Music Event",
                image: el.find('img').attr('src') || "default.jpg",
                // In your Python, you used find_parent('a'). In Cheerio, we use .closest('a')
                link: el.closest('a').attr('href') || "N/A",
                date: `${month} ${day}`.trim() || "N/A",
                start_time: el.find('.start').text().trim() || "N/A",
                end_time: el.find('.end').text().trim() || "N/A",
                source: "UofM Music"
            });
        });
        return results;
    } catch (err) {
        console.error("Music Scrape Failed:", err.message);
        return [];
    }
}

// --- THE ROUTES ---

// This handles http://localhost:3000/api/events
app.get('/api/events', async (req, res) => {
    console.log("Frontend is requesting data...");
    try {
        const umsu = await getUmsuEvents();
        const music = await getUmMusicEvents();
        res.json([...umsu, ...music]);
    } catch (error) {
        console.error("Scrape Error:", error);
        res.status(500).json({ error: "Failed to fetch events" });
    }
});

// This handles http://localhost:3000/ (The root)
app.get('/', async (req, res) => {
    console.log("Root path hit, redirecting to events...");
    try {
        const umsu = await getUmsuEvents();
        const music = await getUmMusicEvents();
        res.json({
            message: "Server is working!",
            data: [...umsu, ...music]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => console.log('Scraper server live on http://localhost:3000'));