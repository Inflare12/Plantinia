package com.example.data.ai

import com.example.data.model.BoundingBox
import com.example.data.model.OverallHealth
import com.example.data.model.SeverityLevel

object SeverityEngine {

    data class SeverityAnalysis(
        val severity: SeverityLevel,
        val overallHealth: OverallHealth,
        val estimatedAffectedPercent: Float,
        val healthScore: Int,
        val explanation: String
    )

    // Disease inherent severity factors (0.0 to 1.0)
    private val diseaseInherentRisk = mapOf(
        "Healthy" to 0.0f,
        "Nutrient Deficiency" to 0.35f,
        "Under-Watering" to 0.30f,
        "Powdery Mildew" to 0.45f,
        "Spider Mites" to 0.50f,
        "Early Blight" to 0.65f,
        "Bacterial Leaf Spot" to 0.70f,
        "Anthracnose" to 0.75f,
        "Late Blight" to 0.85f,
        "Root Rot" to 0.90f
    )

    fun evaluate(
        diseaseClass: String,
        confidence: Float,
        boundingBoxes: List<BoundingBox>,
        imageQualityScore: Float = 0.95f
    ): SeverityAnalysis {
        if (diseaseClass.equals("Healthy", ignoreCase = true) || boundingBoxes.isEmpty()) {
            return SeverityAnalysis(
                severity = SeverityLevel.LOW,
                overallHealth = OverallHealth.HEALTHY,
                estimatedAffectedPercent = 0.0f,
                healthScore = 95,
                explanation = "No active pathogens or visible tissue lesions detected across the visible leaf surface."
            )
        }

        // Calculate cumulative normalized surface area from bounding boxes
        var totalBoxArea = 0.0f
        for (box in boundingBoxes) {
            val width = (box.xMax - box.xMin).coerceIn(0.0f, 1.0f)
            val height = (box.yMax - box.yMin).coerceIn(0.0f, 1.0f)
            totalBoxArea += (width * height)
        }

        // Realistic leaf coverage calculation with slight overlap discount
        val estimatedCoverage = (totalBoxArea * 0.75f).coerceIn(0.02f, 0.85f)
        val affectedPercent = (estimatedCoverage * 100f)

        val riskWeight = diseaseInherentRisk[diseaseClass] ?: 0.50f
        val severityIndex = (estimatedCoverage * 0.6f) + (riskWeight * 0.4f)

        val severityLevel: SeverityLevel
        val overallHealth: OverallHealth
        val healthScore: Int

        when {
            severityIndex < 0.20f -> {
                severityLevel = SeverityLevel.LOW
                overallHealth = OverallHealth.MINOR_ISSUE
                healthScore = (85 - (affectedPercent * 0.8f)).toInt().coerceIn(70, 85)
            }
            severityIndex < 0.45f -> {
                severityLevel = SeverityLevel.MODERATE
                overallHealth = OverallHealth.MODERATE_DISEASE
                healthScore = (70 - (affectedPercent * 0.7f)).toInt().coerceIn(45, 69)
            }
            severityIndex < 0.70f -> {
                severityLevel = SeverityLevel.HIGH
                overallHealth = OverallHealth.MODERATE_DISEASE
                healthScore = (45 - (affectedPercent * 0.5f)).toInt().coerceIn(25, 44)
            }
            else -> {
                severityLevel = SeverityLevel.CRITICAL
                overallHealth = OverallHealth.SEVERE_DAMAGE
                healthScore = (25 - (affectedPercent * 0.4f)).toInt().coerceIn(5, 24)
            }
        }

        val regionCount = boundingBoxes.size
        val explanation = buildString {
            append("${severityLevel.name.lowercase().replaceFirstChar { it.uppercase() }} severity estimated. ")
            append("Approximately ${"%.1f".format(affectedPercent)}% of the visible foliage shows symptoms ")
            append("across $regionCount distinct symptom ${if (regionCount == 1) "cluster" else "clusters"}. ")
            append("Assessment is decoupled from model confidence (${"%.1f".format(confidence * 100)}%) ")
            append("and weighted by pathogen impact ($diseaseClass).")
        }

        return SeverityAnalysis(
            severity = severityLevel,
            overallHealth = overallHealth,
            estimatedAffectedPercent = affectedPercent,
            healthScore = healthScore,
            explanation = explanation
        )
    }
}
