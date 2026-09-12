package com.example.data.repository

import com.example.data.local.PlantDao
import com.example.data.model.Plant
import kotlinx.coroutines.flow.Flow
import java.util.UUID

class PlantRepository(private val plantDao: PlantDao) {

    val allPlants: Flow<List<Plant>> = plantDao.getAllPlants()

    suspend fun getPlantById(id: String): Plant? = plantDao.getPlantById(id)

    suspend fun addPlant(plant: Plant) = plantDao.insertPlant(plant)

    suspend fun updatePlant(plant: Plant) = plantDao.updatePlant(plant)

    suspend fun deletePlant(plant: Plant) = plantDao.deletePlant(plant)

    suspend fun deletePlantById(id: String) = plantDao.deletePlantById(id)

    suspend fun seedInitialPlantsIfEmpty() {
        val seedPlants = listOf(
            Plant(
                id = "plant_monstera_1",
                name = "Living Room Monstera",
                species = "Monstera deliciosa",
                variety = "Variegata",
                imageUri = "android.resource://com.aistudio.plantinia.app/drawable/sample_plant_leaf",
                location = "Living Room Window",
                isIndoor = true,
                sunlightLevel = "Bright Indirect",
                soilType = "Chunky Aroid Mix (Bark + Perlite)",
                wateringFrequencyDays = 7,
                notes = "Growing well, new fenestrated leaf unfurling.",
                healthStatus = "HEALTHY",
                healthScore = 92,
                lastDiagnosisDate = System.currentTimeMillis() - 86400000L * 4,
                lastDiagnosisIssue = "Minor Chlorosis (Resolved)",
                lastWateredDate = System.currentTimeMillis() - 86400000L * 2,
                nextWateringDate = System.currentTimeMillis() + 86400000L * 5
            ),
            Plant(
                id = "plant_fig_2",
                name = "Balcony Fiddle Leaf",
                species = "Ficus lyrata",
                variety = "Bambino",
                imageUri = "android.resource://com.aistudio.plantinia.app/drawable/plantinia_hero",
                location = "East Balcony",
                isIndoor = true,
                sunlightLevel = "Morning Direct Sun",
                soilType = "Well Draining Potting Soil",
                wateringFrequencyDays = 8,
                notes = "Needs weekly leaf dusting. Check for spider mites.",
                healthStatus = "ATTENTION_NEEDED",
                healthScore = 74,
                lastDiagnosisDate = System.currentTimeMillis() - 86400000L * 1,
                lastDiagnosisIssue = "Early Blight / Leaf Spot",
                lastWateredDate = System.currentTimeMillis() - 86400000L * 5,
                nextWateringDate = System.currentTimeMillis() + 86400000L * 3
            ),
            Plant(
                id = "plant_snake_3",
                name = "Office Snake Plant",
                species = "Dracaena trifasciata",
                variety = "Laurentii",
                imageUri = "",
                location = "Work Desk",
                isIndoor = true,
                sunlightLevel = "Low Light",
                soilType = "Cactus & Succulent Blend",
                wateringFrequencyDays = 21,
                notes = "Hardy and drought tolerant. Only water once a month.",
                healthStatus = "HEALTHY",
                healthScore = 98,
                lastDiagnosisDate = null,
                lastWateredDate = System.currentTimeMillis() - 86400000L * 10,
                nextWateringDate = System.currentTimeMillis() + 86400000L * 11
            )
        )
        plantDao.insertAll(seedPlants)
    }
}
