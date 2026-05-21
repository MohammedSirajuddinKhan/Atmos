require("dotenv").config();

const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

const API_KEY = process.env.WEATHER_API_KEY;

const BASE_URL = process.env.WEATHER_API_BASE_URL;

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index", {
    weather: null,
    error: null,
  });
});

app.post("/weather", async (req, res) => {
  try {
    const city = req.body.city?.trim();

    if (!city) {
      return res.render("index", {
        weather: null,
        error: "Please enter a city.",
      });
    }

    const response = await axios.get(`${BASE_URL}/current.json`, {
      params: {
        key: API_KEY,
        q: city,
        aqi: "yes",
      },
    });

    const data = response.data;

    const weather = {
      city: data.location.name,
      country: data.location.country,
      region: data.location.region,
      temperature: data.current.temp_c,
      feelsLike: data.current.feelslike_c,
      humidity: data.current.humidity,
      windSpeed: data.current.wind_kph,
      description: data.current.condition.text,
      icon: data.current.condition.icon,
      cloud: data.current.cloud,
      isDay: data.current.is_day,
      rain:
        data.current.precip_mm > 0 ? `${data.current.precip_mm} mm` : "No Rain",
      snow: data.current.condition.text.toLowerCase().includes("snow")
        ? "Snowing"
        : "No Snow",
      lastUpdated: data.current.last_updated,
    };

    res.render("index", {
      weather,
      error: null,
    });
  } catch (error) {
    console.log(error.response?.data || error.message);

    res.render("index", {
      weather: null,
      error: "City not found or API failed.",
    });
  }
});

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
