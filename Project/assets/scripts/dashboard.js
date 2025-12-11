// ----------------- GLOBAL VARIABLES -----------------
const API_KEY = "28274614bb1989f2bb2e37eeec50e83c";
let floodChart = null;
let map = null;

// ----------------- INIT DASHBOARD -----------------
window.onload = function() {
    applySavedTheme();
    checkAuth();
    getWeather("Manila");       // Default city
    displayFloodChart();        // Load chart from records
    displayFloodMap();          // Load map from records
};

// ----------------- AUTH -----------------
function checkAuth() {
    if (!localStorage.getItem("loggedIn")) {
        window.location.href = "index.html";
    }
}

function logout() {
    localStorage.removeItem("loggedIn");
    window.location.href = "index.html";
}

// ----------------- THEME -----------------
function toggleTheme() {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
}

function applySavedTheme() {
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
    }
}

// ----------------- WEATHER -----------------
async function getWeather(cityName) {
    const city = cityName || document.getElementById("cityInput").value.trim();
    if (!city) return;

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data || !data.main) return showError("City not found or API error.");

        document.getElementById("errorMsg").style.display = "none";
        document.getElementById("weatherCard").style.display = "block";

        document.getElementById("cityName").innerText = data.name;
        document.getElementById("temp").innerText = `Temperature: ${Math.round(data.main.temp)}°C`;
        document.getElementById("humidity").innerText = `Humidity: ${data.main.humidity}%`;
        document.getElementById("seaLevel").innerText = data.main.sea_level ? 
            `Sea Level: ${data.main.sea_level} hPa` : "Sea Level: N/A";
        document.getElementById("description").innerText = `Weather: ${data.weather[0].description}`;

        document.getElementById("weatherIcon").src = 
            `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

        applyWeatherTheme(data.weather[0].main.toLowerCase());
    } catch (err) {
        showError("Cannot fetch weather. Check your internet/API key.");
    }
}

function showError(message) {
    document.getElementById("errorMsg").innerText = message;
    document.getElementById("errorMsg").style.display = "block";
    document.getElementById("weatherCard").style.display = "none";
}

// ----------------- WEATHER THEME -----------------
function applyWeatherTheme(condition) {
    const body = document.body;
    body.classList.remove("weather-clear","weather-clouds","weather-rain","weather-thunderstorm","weather-snow","weather-mist");

    if(condition.includes("clear")) body.classList.add("weather-clear");
    else if(condition.includes("cloud")) body.classList.add("weather-clouds");
    else if(condition.includes("rain")) body.classList.add("weather-rain");
    else if(condition.includes("thunder")) body.classList.add("weather-thunderstorm");
    else if(condition.includes("snow")) body.classList.add("weather-snow");
    else if(condition.includes("mist") || condition.includes("fog") || condition.includes("haze")) body.classList.add("weather-mist");
    else body.classList.add("weather-clouds");
}

// ----------------- FLOOD CHART -----------------
function displayFloodChart() {
    let records = JSON.parse(localStorage.getItem("floodRecords") || "[]");

    if (!records.length) {
        // Dummy data for testing
        records = [
            { location: "Manila", waterLevel: 50 },
            { location: "Cebu", waterLevel: 30 },
            { location: "Davao", waterLevel: 70 }
        ];
    }

    const labels = records.map(r => r.location);
    const data = records.map(r => r.waterLevel);

    const ctx = document.getElementById('floodChart').getContext('2d');

    if (floodChart) floodChart.destroy();

    floodChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Flood Water Level (cm)',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.6)'
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });
}

// ----------------- FLOOD MAP -----------------
function displayFloodMap() {
    let records = JSON.parse(localStorage.getItem("floodRecords") || "[]");

    if (!records.length) {
        // Dummy data for testing
        records = [
            { location:"Manila", latitude:14.5995, longitude:120.9842, waterLevel:50 },
            { location:"Cebu", latitude:10.3157, longitude:123.8854, waterLevel:30 }
        ];
    }

    // Initialize map once
    if (!map) {
        map = L.map('map').setView([14.5995, 120.9842], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data © OpenStreetMap contributors'
        }).addTo(map);
    } else {
        map.eachLayer(layer => {
            if (layer instanceof L.Circle || layer instanceof L.Marker) map.removeLayer(layer);
        });
    }

    const markers = [];

    records.forEach(r => {
        const lat = r.latitude;
        const lng = r.longitude;
        const risk = r.waterLevel >= 100 ? "High" : r.waterLevel >= 50 ? "Medium" : "Low";
        const color = risk === "High" ? "red" : risk === "Medium" ? "orange" : "green";

        const circle = L.circle([lat, lng], {
            color: color,
            fillColor: color,
            fillOpacity: 0.5,
            radius: r.waterLevel * 10
        }).addTo(map)
          .bindPopup(`${r.location} <br> Water Level: ${r.waterLevel}cm <br> Risk: ${risk}`);

        markers.push([lat, lng]);
    });

    if (markers.length) {
        const bounds = L.latLngBounds(markers);
        map.fitBounds(bounds, { padding: [50, 50] });
    }
}

// ----------------- SEARCH INPUT -----------------
function searchCity() {
    const city = document.getElementById("cityInput").value.trim();
    if (city) getWeather(city);
}
