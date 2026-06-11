const axios = require("axios");
require("dotenv").config();

const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});

app.command("/dsb-ping", async ({ command, ack, respond }) => {
  const start = Date.now();
  await ack();
  const latency = Date.now() - start;
  await respond({ text: `Pong!\nLatency: ${latency}ms` });
});

(async () => {
  await app.start();
  console.log("bot is running!");
})();

app.command("/dsb-help", async ({ ack, respond }) => {
  await ack();
  await respond({
    text:
`Available Commands:
/dsb-ping - Check bot latency
/dsb-catfact - Get a cat fact
/dsb-joke - Get a random joke`
  });
});

app.command("/dsb-catfact", async ({ ack, respond }) => {
  await ack();

  try {
    const response = await axios.get("https://catfact.ninja/fact");
    await respond({ text: `Cat Fact:\n${response.data.fact}` });
  } catch (err) {
    await respond({ text: "Failed to fetch a cat fact." });
  }
});

app.command("/dsb-joke", async ({ ack, respond }) => {
  await ack();

  try {
    const response = await axios.get("https://official-joke-api.appspot.com/random_joke");
    await respond({
      text:
`${response.data.setup}

${response.data.punchline}`
    });
  } catch (err) {
    await respond({ text: "Failed to fetch a joke." });
  }
});

app.command("/dsb-apod", async ({ ack, respond }) => {
  await ack();

  try {
    const response = await axios.get(
      `https://api.nasa.gov/planetary/apod?api_key=${process.env.NASA_API_KEY}`
    );

    const data = response.data;

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
  } catch (err) {
    await respond({ text: "Failed to fetch APOD data 🚀" });
  }
});

app.command("/dsb-mars", async ({ ack, respond }) => {
  await ack();

  try {
    const response = await axios.get(
      `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=1000&api_key=${process.env.NASA_API_KEY}`
    );

    const photos = response.data.photos;
    const photo = photos[Math.floor(Math.random() * photos.length)];

    await respond({
      text:
`🔴 *Mars Rover Photo*

Camera: ${photo.camera.full_name}

📷 ${photo.img_src}`
    });

  } catch (err) {
    await respond({ text: "Failed to fetch Mars photo 🚀" });
  }
});

app.command("/dsb-asteroid", async ({ ack, respond }) => {
  await ack();

  try {
    const today = new Date().toISOString().split("T")[0];

    const response = await axios.get(
      `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${process.env.NASA_API_KEY}`
    );

    const asteroids = response.data.near_earth_objects[today];
    const asteroid = asteroids[Math.floor(Math.random() * asteroids.length)];

    await respond({
      text:
`☄️ *${asteroid.name}*

Estimated size: ${Math.round(
  asteroid.estimated_diameter.meters.estimated_diameter_max
)} meters`
    });

  } catch (err) {
    await respond({ text: "Failed to fetch asteroid data 🚀" });
  }
});

app.command("/dsb-launches",async ({ ack, respond }) => {
  await ack();

  try {
    const res = await axios.get("https://1l.thespacedevs.com/2.2.0/launch/upcoming/?limit=3");
    const launches = res.data.results;
    const text = launches.map(l =>
      `🚀 *${l.name}*\n📅 ${l.net}\n📍 ${l.pad.location.name}`
    ).join("\n\n");

      await respond({ text });
  } catch (err) {
    await respond("Failed to fetch launches 🚀");
  }
});

app.command("/dsb-iss", async ({ ack, respond }) => {
  await ack();

  try {
    const res = await axios.get("http://api.open-notify.org/iss-now.json");

    const pos = res.data.iss_position;

    await respond({
      text:
`🛰️ ISS Current Position:
Latitude: ${pos.latitude}
Longitude: ${pos.longitude}`
    });
  } catch {
    await respond("Failed to track ISS 🛰️");
  }
});

app.command("/dsb-astronauts", async ({ ack, respond }) => {
  await ack();

  try {
    const res = await axios.get("http://api.open-notify.org/astros.json");

    const names = res.data.people.map(p => `👨‍🚀 ${p.name}`).join("\n");

    await respond(`🌍 People in space now:\n\n${names}`);
  } catch {
    await respond("Failed to fetch astronauts 🚀");
  }
});


    







