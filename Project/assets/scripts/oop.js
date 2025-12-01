// OOP CLASS (Global)
class FloodSensor {
    constructor(location, waterLevel, rainfall) {
        this.location = location;
        this.waterLevel = waterLevel;
        this.rainfall = rainfall;
    }

    get riskLevel() {
        if (this.waterLevel > 80) return "Severe";
        if (this.waterLevel > 50) return "Moderate";
        return "Low";
    }

    toJSON() {
        return {
            location: this.location,
            waterLevel: this.waterLevel,
            rainfall: this.rainfall,
            riskLevel: this.riskLevel
        };
    }
}

// Make class globally accessible
window.FloodSensor = FloodSensor;
