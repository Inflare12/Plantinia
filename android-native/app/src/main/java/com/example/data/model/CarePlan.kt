package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

data class CareTask(
    val id: String,
    val title: String,
    val description: String,
    val taskType: String, // "WATER", "SOIL_CHECK", "INSPECT_LEAVES", "FERTILIZE", "ROTATE", "MIST"
    val frequencyOrDay: String, // "Every Monday", "Every 2 Weeks", etc.
    val isCompleted: Boolean = false
)

@Entity(tableName = "care_plans")
data class CarePlan(
    @PrimaryKey val id: String,
    val plantId: String,
    val plantName: String,
    val species: String,
    val scheduleSummary: String,
    val tasksJson: String, // serialized List<CareTask>
    val seasonalAdvice: String,
    val weatherAdjustedRule: String,
    val createdAt: Long = System.currentTimeMillis()
)
