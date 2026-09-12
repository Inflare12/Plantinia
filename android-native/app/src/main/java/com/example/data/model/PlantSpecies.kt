package com.example.data.model

data class PlantSpecies(
    val id: String,
    val commonName: String,
    val scientificName: String,
    val family: String,
    val description: String,
    val sunlight: String,       // "Bright Indirect", "Full Sun", "Low Light", etc.
    val watering: String,       // "Allow top 2 inches to dry", "Keep evenly moist", etc.
    val humidity: String,       // "50% - 70%", "Average indoor", "High humidity"
    val temperature: String,    // "18°C - 28°C"
    val difficulty: String,     // "Easy", "Moderate", "Experienced"
    val isIndoor: Boolean,
    val isPetSafe: Boolean,
    val propagation: String,    // "Stem cutting in water/soil"
    val commonDiseases: List<String>,
    val commonPests: List<String>,
    val tags: List<String>
)
