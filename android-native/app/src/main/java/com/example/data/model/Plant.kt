package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "plants")
data class Plant(
    @PrimaryKey val id: String,
    val userId: String = "user_default",
    val name: String,
    val species: String,
    val variety: String = "",
    val imageUri: String = "",
    val dateAdded: Long = System.currentTimeMillis(),
    val location: String = "Living Room", // Living Room, Balcony, Garden, Office, etc.
    val isIndoor: Boolean = true,
    val sunlightLevel: String = "Bright Indirect", // Low, Medium, Bright Indirect, Direct Sun
    val soilType: String = "Peat Perlite Mix",
    val wateringFrequencyDays: Int = 7,
    val notes: String = "",
    val healthStatus: String = "HEALTHY", // HEALTHY, ATTENTION_NEEDED, CRITICAL
    val healthScore: Int = 92, // 0 - 100
    val lastDiagnosisDate: Long? = null,
    val lastDiagnosisIssue: String? = null,
    val lastWateredDate: Long = System.currentTimeMillis() - 86400000L * 2,
    val nextWateringDate: Long = System.currentTimeMillis() + 86400000L * 5,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)
