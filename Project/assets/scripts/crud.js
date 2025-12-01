// ----------------- CRUD Functions -----------------

// Add a new record
function addRecord() {
    const location = document.getElementById("location").value.trim();
    const waterLevel = parseFloat(document.getElementById("waterLevel").value);
    const rainfall = parseFloat(document.getElementById("rainfall").value);
    const latitude = parseFloat(document.getElementById("latitude").value);
    const longitude = parseFloat(document.getElementById("longitude").value);

    if (!location || isNaN(waterLevel) || isNaN(rainfall) || isNaN(latitude) || isNaN(longitude)) {
        alert("Please fill all fields correctly!");
        return;
    }

    const records = JSON.parse(localStorage.getItem("floodRecords") || "[]");

    // Create record object
    const record = {
        location,
        waterLevel,
        rainfall,
        latitude,
        longitude
    };

    records.push(record);
    localStorage.setItem("floodRecords", JSON.stringify(records));

    document.getElementById("recordForm").reset();
    displayRecords();
}

// Display all records in the table
function displayRecords() {
    const records = JSON.parse(localStorage.getItem("floodRecords") || "[]");
    const table = document.getElementById("recordsTable");
    table.innerHTML = "";

    records.forEach((rec, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${rec.location}</td>
            <td>${rec.waterLevel}</td>
            <td>${rec.rainfall}</td>
            <td>${calculateRisk(rec.waterLevel)}</td>
            <td><button onclick="deleteRecord(${index})">Delete</button></td>
        `;
        table.appendChild(row);
    });
}

// Delete a record
function deleteRecord(index) {
    const records = JSON.parse(localStorage.getItem("floodRecords") || "[]");
    records.splice(index, 1);
    localStorage.setItem("floodRecords", JSON.stringify(records));
    displayRecords();
}

// Calculate risk based on water level
function calculateRisk(waterLevel) {
    if (waterLevel >= 100) return "High";
    if (waterLevel >= 50) return "Medium";
    return "Low";
}
