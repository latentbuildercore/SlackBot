const axios = require("axios");
require("dotenv").config();

const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});

/* ---------------- GLOBAL ERROR HANDLER ---------------- */
app.error(async (error) => {
  console.error("SLACK BOLT ERROR:", error);
});

/* ---------------- HELP COMMAND ---------------- */
app.command("/dsb-help", async ({ ack, respond }) => {
  await ack();

  try {
    await respond({
      response_type: "ephemeral",
      text:
`📌 Available Commands:

/dsb-ping - Check bot latency
/dsb-catfact - Get a cat fact
/dsb-joke - Get a random joke
/dsb-apod - NASA Astronomy Picture
/dsb-mars - Mars rover photo
/dsb-asteroid - Near-Earth asteroid info
/dsb-launches - Upcoming space launches
/dsb-iss - ISS position
/dsb-astronauts - People in space`
    });
  } catch (err) {
    console.error("HELP COMMAND ERROR:", err);
  }
});

/* ---------------- PING ---------------- */
app.command("/dsb-ping", async ({ command, ack, respond }) => {
  await ack();

  const start = Date.now();
  await respond({ text: "Pinging..." });

  const latency = Date.now() - start;

  await respond({ text: `🏓 Pong!\nLatency: ${latency}ms` });
});

/* ---------------- CAT FACT ---------------- */
app.command("/dsb-catfact", async ({ ack, respond }) => {
  await ack();

  try {
    const res = await axios.get("https://catfact.ninja/fact");
    await respond({ text: `🐱 Cat Fact:\n${res.data.fact}` });
  } catch (err) {
    console.error(err);
    await respond({ text: "Failed to fetch cat fact." });
  }
});

/* ---------------- JOKE ---------------- */
app.command("/dsb-joke", async ({ ack, respond }) => {
  await ack();

  try {
    const res = await axios.get("https://official-joke-api.appspot.com/random_joke");
    await respond({
      text: `😂 Joke:\n\n${res.data.setup}\n\n${res.data.punchline}`
    });
  } catch {
    await respond({ text: "Failed to fetch joke." });
  }
});

/* ---------------- NASA APOD ---------------- */
app.command("/dsb-apod", async ({ ack, respond }) => {
  await ack();

  try {
    const res = await axios.get(
      `https://api.nasa.gov/planetary/apod?api_key=${process.env.NASA_API_KEY}`
    );

    const data = res.data;

    await respond({
      blocks: [
        {
          type: "image",
          image_url: data.url,
          alt_text: data.title
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*${data.title}*\n\n${data.explanation}`
          }
        }
      ]
    });
  } catch {
    await respond({ text: "Failed to fetch APOD 🚀" });
  }
});

/* ---------------- MARS ---------------- */
app.command("/dsb-mars", async ({ ack, respond }) => {
  await ack();

  try {
    const res = await axios.get(
      `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=1000&api_key=${process.env.NASA_API_KEY}`
    );

    const photos = res.data.photos;
    const photo = photos[Math.floor(Math.random() * photos.length)];

    await respond({
      text:
`🔴 Mars Rover Photo

Camera: ${photo.camera.full_name}
📷 ${photo.img_src}`
    });
  } catch {
    await respond({ text: "Failed to fetch Mars photo 🚀" });
  }
});

/* ---------------- ASTEROID ---------------- */
app.command("/dsb-asteroid", async ({ ack, respond }) => {
  await ack();

  try {
    const today = new Date().toISOString().split("T")[0];

    const res = await axios.get(
      `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${process.env.NASA_API_KEY}`
    );

    const list = res.data.near_earth_objects[today];
    const asteroid = list[Math.floor(Math.random() * list.length)];

    await respond({
      text:
`☄️ ${asteroid.name}

Max size: ${Math.round(
  asteroid.estimated_diameter.meters.estimated_diameter_max
)} meters`
    });
  } catch {
    await respond({ text: "Failed to fetch asteroid data 🚀" });
  }
});

/* ---------------- LAUNCHES ---------------- */
app.command("/dsb-launches", async ({ ack, respond }) => {
  await ack();

  try {
    const res = await axios.get(
      "https://1l.thespacedevs.com/2.2.0/launch/upcoming/?limit=3"
    );

    const launches = res.data.results;

    const text = launches.map(l =>
      `🚀 ${l.name}\n📅 ${l.net}\n📍 ${l.pad.location.name}`
    ).join("\n\n");

    await respond({ text });
  } catch {
    await respond("Failed to fetch launches 🚀");
  }
});

/* ---------------- ISS ---------------- */
app.command("/dsb-iss", async ({ ack, respond }) => {
  await ack();

  try {
    const res = await axios.get("http://api.open-notify.org/iss-now.json");

    const pos = res.data.iss_position;

    await respond({
      text:
`🛰️ ISS Position:
Latitude: ${pos.latitude}
Longitude: ${pos.longitude}`
    });
  } catch {
    await respond("Failed to track ISS 🛰️");
  }
});

/* ---------------- ASTRONAUTS ---------------- */
app.command("/dsb-astronauts", async ({ ack, respond }) => {
  await ack();

  try {
    const res = await axios.get("http://api.open-notify.org/astros.json");

    const names = res.data.people.map(p => `👨‍🚀 ${p.name}`).join("\n");

    await respond(`🌍 People in space:\n\n${names}`);
  } catch {
    await respond("Failed to fetch astronauts 🚀");
  }
});


(async () => {
  await app.start();
  console.log("🚀 Slack bot is running!");
})();