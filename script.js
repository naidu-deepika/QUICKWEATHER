console.log("✅ script.js loaded");

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const geoBtn = document.getElementById("geoBtn");

const weatherCard = document.getElementById("weatherCard");
const locationName = document.getElementById("locationName");
const temperature = document.getElementById("temperature");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const description = document.getElementById("description");

const hourlyDiv = document.getElementById("hourly");
const dailyDiv = document.getElementById("daily");

// 🔹 Fetch weather using coordinates
async function fetchWeather(lat, lon, place) {
  const url =
    `https://api.open-meteo.com/v1/forecast?` +
    `latitude=${lat}&longitude=${lon}` +
    `&current_weather=true` +
    `&hourly=temperature_2m,relativehumidity_2m` +
    `&daily=temperature_2m_max,temperature_2m_min` +
    `&timezone=auto`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    updateCurrent(data, place);
    updateHourly(data);
    updateDaily(data);
  } catch (err) {
    console.error(err);
    alert("Error fetching weather");
  }
}

// 🔹 Search by city
searchBtn.addEventListener("click", async () => {
  const city = cityInput.value.trim();
  if (!city) return;

  const geoUrl =
    `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`;

  const res = await fetch(geoUrl);
  const data = await res.json();

  if (!data.results) {
    alert("City not found");
    return;
  }

  const { latitude, longitude, name, country } = data.results[0];
  fetchWeather(latitude, longitude, `${name}, ${country}`);
});

// 🔹 Current location (NO reverse geocoding)
geoBtn.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude.toFixed(2);
      const lon = pos.coords.longitude.toFixed(2);
      fetchWeather(lat, lon, "Current Location");
    },
    () => alert("Location permission denied")
  );
});

// 🔹 Update current weather (FIXED HUMIDITY)
function updateCurrent(data, place) {
  weatherCard.classList.remove("hidden");

  locationName.innerText = place;
  temperature.innerText = Math.round(data.current_weather.temperature);
  wind.innerText = data.current_weather.windspeed;

  // ✅ FIXED humidity (this is the correct line)
  humidity.innerText = data.hourly.relativehumidity_2m[0];

  // 🌤 Climate text + icon (YES, this comes at the end)
  const climate = getClimate(data.current_weather.weathercode);
  description.innerText = `${climate.icon} ${climate.text}`;
}


// 🌤 Weather code mapping
function getClimate(code) {
  if (code === 0) return { text: "Clear Sky", icon: "☀️" };
  if (code <= 3) return { text: "Partly Cloudy", icon: "⛅" };
  if (code <= 48) return { text: "Foggy", icon: "🌫️" };
  if (code <= 67) return { text: "Rainy", icon: "🌧️" };
  if (code <= 77) return { text: "Snow", icon: "❄️" };
  if (code <= 99) return { text: "Thunderstorm", icon: "⛈️" };
  return { text: "Weather", icon: "🌡️" };
}

// 🔹 Hourly forecast (next 12 hours)
function updateHourly(data) {
  hourlyDiv.innerHTML =
    `<h3>Hourly Forecast</h3><div class="forecast-grid"></div>`;
  const grid = hourlyDiv.querySelector(".forecast-grid");

  for (let i = 0; i < 12; i++) {
    grid.innerHTML += `
      <div class="item">
        <div>${data.hourly.time[i].split("T")[1]}</div>
        <div>${Math.round(data.hourly.temperature_2m[i])}°</div>
      </div>
    `;
  }
}

// 🔹 7-day forecast
function updateDaily(data) {
  dailyDiv.innerHTML =
    `<h3>7-Day Forecast</h3><div class="forecast-grid"></div>`;
  const grid = dailyDiv.querySelector(".forecast-grid");

  for (let i = 0; i < 7; i++) {
    grid.innerHTML += `
      <div class="item">
        <div>${data.daily.time[i]}</div>
        <div>${Math.round(data.daily.temperature_2m_max[i])}° /
             ${Math.round(data.daily.temperature_2m_min[i])}°</div>
      </div>
    `;
  }
}


