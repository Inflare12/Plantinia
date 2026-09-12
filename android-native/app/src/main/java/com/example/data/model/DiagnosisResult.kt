package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

enum class SeverityLevel {
    LOW,
    MODERATE,
    HIGH,
    CRITICAL
}

enum class OverallHealth {
    HEALTHY,
    MINOR_ISSUE,
    MODERATE_DISEASE,
    SEVERE_DAMAGE
}

data class BoundingBox(
    val xMin: Float, // 0.0 to 1.0
    val yMin: Float, // 0.0 to 1.0
    val xMax: Float, // 0.0 to 1.0
    val yMax: Float, // 0.0 to 1.0
    val label: String = ""
)

data class DetectionItem(
    val id: String,
    val diseaseClass: String,
    val confidence: Float,
    val boundingBox: BoundingBox,
    val severity: SeverityLevel,
    val affectedAreaPercent: Float,
    val recommendation: String
)

@Entity(tableName = "diagnoses")
data class DiagnosisRecord(
    @PrimaryKey val id: String,
    val plantId: String? = null,
    val plantName: String,
    val speciesIdentified: String,
    val speciesConfidence: Float,
    val imageUri: String,
    val overallHealth: String, // HEALTHY, MINOR_ISSUE, MODERATE_DISEASE, SEVERE_DAMAGE
    val healthScore: Int, // 0 - 100
    val primaryIssue: String,
    val severity: String, // LOW, MODERATE, HIGH, CRITICAL
    val affectedAreaPercent: Float,
    val confidence: Float,
    val summary: String,
    val explanation: String,
    val treatmentStepsJson: String, // JSON string of List<String>
    val doNotListJson: String,      // JSON string of List<String>
    val preventiveActionsJson: String, // JSON string of List<String>
    val followUpDays: Int,
    val detectionsJson: String,     // JSON string of List<DetectionItem>
    val modelVersion: String = "Plantinia-YOLOv8x-v2.1",
    val inferenceLatencyMs: Long = 420L,
    val feedbackStatus: String? = null, // "CORRECT", "INCORRECT", "NOT_SURE"
    val timestamp: Long = System.currentTimeMillis()
)
