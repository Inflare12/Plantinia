package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "feedback_items")
data class FeedbackItem(
    @PrimaryKey val id: String,
    val diagnosisId: String,
    val plantName: String,
    val imageUri: String,
    val predictedCondition: String,
    val confidence: Float,
    val modelVersion: String,
    val userVerdict: String, // "CORRECT", "INCORRECT", "NOT_SURE"
    val userCorrection: String = "",
    val adminReviewStatus: String = "PENDING", // "PENDING", "APPROVED_FOR_DATASET", "REJECTED"
    val timestamp: Long = System.currentTimeMillis()
)
