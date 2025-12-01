// ----------------- GLOBAL VARIABLES -----------------
const API_KEY = "28274614bb1989f2bb2e37eeec50e83c";
let floodChart;
let map;

// ----------------- INIT DASHBOARD -----------------
function initDashboard() {
    checkAuth();                // Auth check
    getWeather("Manila");       // Default city
    displayFloodChart();        // Load chart from records
    displayFloodMap();          // Load map from records
}

// ----------------- LOGOUT -----------------
function logout() {
    localStorage.removeItem("loggedIn");
    window.location.href = "index.html";
}

// ----------------- WEATHER FUNCTIONS -----------------
async function getWeather(cityName) {
    const city = cityName || document.getElementById("cityInput").value.trim();
    if (!city) return;

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.cod === "404") return showError("City not found.");

        document.getElementById("errorMsg").style.display = "none";
        document.getElementById("weatherCard").style.display = "block";

        document.getElementById("cityName").innerText = data.name;
        document.getElementById("temp").innerText = "Temperature: " + data.main.temp + "°C";
        document.getElementById("humidity").innerText = "Humidity: " + data.main.humidity + "%";
        document.getElementById("seaLevel").innerText = data.main.sea_level ? 
            "Sea Level: " + data.main.sea_level + " hPa" : "Sea Level: N/A";
        document.getElementById("description").innerText = "Weather: " + data.weather[0].description;

        const iconCode = data.weather[0].icon;
        document.getElementById("weatherIcon").src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    } catch (err) {
        showError("Cannot fetch weather. Check internet/API key.");
    }
}

function showError(message) {
    document.getElementById("errorMsg").innerText = message;
    document.getElementById("errorMsg").style.display = "block";
    document.getElementById("weatherCard").style.display = "none";
}

// ----------------- FLOOD CHART -----------------
function displayFloodChart() {
    const records = JSON.parse(localStorage.getItem("floodRecords") || "[]");
    const labels = records.map(r => r.location);
    const data = records.map(r => r.waterLevel);

    const ctx = document.getElementById('floodChart').getContext('2d');

    if (floodChart) floodChart.destroy(); // Destroy previous chart

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
    const records = JSON.parse(localStorage.getItem("floodRecords") || "[]");

    // Clear map container before creating new map
    document.getElementById('map').innerHTML = "";

    if (records.length === 0) {
        map = L.map('map').setView([14.5995, 120.9842], 6); // default map
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data © OpenStreetMap contributors'
        }).addTo(map);
        return;
    }

    map = L.map('map');
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data © OpenStreetMap contributors'
    }).addTo(map);

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
        }).addTo(map).bindPopup(`${r.location} <br> Water Level: ${r.waterLevel}cm <br> Risk: ${risk}`);

        markers.push([lat, lng]);
    });

    // Fit map bounds to show all markers
    const bounds = L.latLngBounds(markers);
    map.fitBounds(bounds, { padding: [50, 50] });
}
