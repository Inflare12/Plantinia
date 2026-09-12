package com.example.data.repository

import com.example.data.ai.PlantiniaAIEngine
import com.example.data.local.DiagnosisDao
import com.example.data.local.FeedbackDao
import com.example.data.model.DiagnosisRecord
import com.example.data.model.FeedbackItem
import com.example.data.model.Plant
import com.example.data.model.WeatherInfo
import kotlinx.coroutines.flow.Flow
import java.util.UUID

class DiagnosisRepository(
    private val diagnosisDao: DiagnosisDao,
    private val feedbackDao: FeedbackDao
) {

    val allDiagnoses: Flow<List<DiagnosisRecord>> = diagnosisDao.getAllDiagnoses()

    fun getDiagnosesForPlant(plantId: String): Flow<List<DiagnosisRecord>> =
        diagnosisDao.getDiagnosesForPlant(plantId)

    suspend fun getDiagnosisById(id: String): DiagnosisRecord? =
        diagnosisDao.getDiagnosisById(id)

    suspend fun runDiagnosis(
        imageUri: String,
        selectedPlant: Plant? = null,
        conditionOverride: String? = null,
        weather: WeatherInfo? = null,
        modelVersion: String = "Plantinia-YOLOv8x-v2.1"
    ): DiagnosisRecord {
        val result = PlantiniaAIEngine.runInference(
            imageUri = imageUri,
            selectedPlant = selectedPlant,
            simulatedCondition = conditionOverride,
            weatherContext = weather,
            modelVersion = modelVersion
        )
        diagnosisDao.insertDiagnosis(result)
        return result
    }

    suspend fun submitFeedback(
        diagnosisId: String,
        verdict: String, // "CORRECT", "INCORRECT", "NOT_SURE"
        correction: String = ""
    ) {
        diagnosisDao.updateFeedback(diagnosisId, verdict)
        val diagnosis = diagnosisDao.getDiagnosisById(diagnosisId)
        if (diagnosis != null) {
            val feedbackItem = FeedbackItem(
                id = UUID.randomUUID().toString(),
                diagnosisId = diagnosisId,
                plantName = diagnosis.plantName,
                imageUri = diagnosis.imageUri,
                predictedCondition = diagnosis.primaryIssue,
                confidence = diagnosis.confidence,
                modelVersion = diagnosis.modelVersion,
                userVerdict = verdict,
                userCorrection = correction,
                adminReviewStatus = "PENDING",
                timestamp = System.currentTimeMillis()
            )
            feedbackDao.insertFeedback(feedbackItem)
        }
    }

    suspend fun seedInitialDiagnosesIfEmpty() {
        val seedDiagnoses = listOf(
            DiagnosisRecord(
                id = "diag_seed_1",
                plantId = "plant_fig_2",
                plantName = "Balcony Fiddle Leaf",
                speciesIdentified = "Ficus lyrata (Fiddle Leaf Fig)",
                speciesConfidence = 0.96f,
                imageUri = "android.resource://com.aistudio.plantinia.app/drawable/sample_plant_leaf",
                overallHealth = "MODERATE_DISEASE",
                healthScore = 74,
                primaryIssue = "Early Blight",
                severity = "MODERATE",
                affectedAreaPercent = 14.8f,
                confidence = 0.89f,
                summary = "Detected moderate fungal leaf spot symptoms with 14.8% foliage involvement.",
                explanation = "Moderate severity because approx 14.8% of visible surface displays concentric necrotic rings across 2 leaf clusters. Decoupled from model confidence (89%).",
                treatmentStepsJson = "[\"Isolate plant and prune lowest 2 affected leaves.\",\"Apply copper fungicide spray early morning.\",\"Ensure bottom watering only.\"]",
                doNotListJson = "[\"DO NOT overhead mist foliage.\",\"DO NOT place in drafty airflow.\"]",
                preventiveActionsJson = "[\"Improve ventilation.\",\"Keep foliage dry during irrigation.\"]",
                followUpDays = 7,
                detectionsJson = "[{\"id\":\"det_1\",\"diseaseClass\":\"Early Blight\",\"confidence\":0.89,\"severity\":\"MODERATE\"}]",
                modelVersion = "Plantinia-YOLOv8x-v2.1",
                inferenceLatencyMs = 430L,
                feedbackStatus = "CORRECT",
                timestamp = System.currentTimeMillis() - 86400000L * 1
            )
        )
        diagnosisDao.insertAll(seedDiagnoses)
    }
}
