package com.example.data.repository

import com.example.data.model.AuditLogItem
import com.example.data.model.DatasetVersion
import com.example.data.model.FeatureFlag
import com.example.data.model.ModelRegistryItem
import com.example.data.model.TrainingJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.UUID

class AdminMlRepository {

    // 1. Datasets
    private val _datasets = MutableStateFlow(
        listOf(
            DatasetVersion(
                id = "ds_v21",
                versionTag = "v2.1",
                name = "Plantinia Tropical Pathology YOLOv8",
                description = "24,800 annotated plant leaf images with 16 disease classes & healthy foliage.",
                imageCount = 24800,
                classCount = 16,
                classes = listOf("Early Blight", "Late Blight", "Powdery Mildew", "Bacterial Spot", "Spider Mites", "Iron Chlorosis", "Anthracnose", "Healthy"),
                splitRatio = "70% Train / 20% Val / 10% Test",
                validationStatus = "VALID",
                invalidLabelsCount = 0,
                missingImagesCount = 0,
                createdAt = System.currentTimeMillis() - 86400000L * 14,
                author = "Lead ML Researcher"
            ),
            DatasetVersion(
                id = "ds_v20",
                versionTag = "v2.0",
                name = "Plantinia General Flora Detection",
                description = "Baseline 18,200 images from greenhouse active learning pipeline.",
                imageCount = 18200,
                classCount = 12,
                classes = listOf("Early Blight", "Powdery Mildew", "Spider Mites", "Healthy"),
                splitRatio = "75% Train / 15% Val / 10% Test",
                validationStatus = "VALID",
                invalidLabelsCount = 12,
                missingImagesCount = 2,
                createdAt = System.currentTimeMillis() - 86400000L * 45,
                author = "ML Operations Team"
            ),
            DatasetVersion(
                id = "ds_v10",
                versionTag = "v1.0",
                name = "Initial PlantVillage Seed Dataset",
                description = "Curated lab photos of single leaf specimens.",
                imageCount = 12500,
                classCount = 8,
                classes = listOf("Blight", "Mildew", "Mites", "Healthy"),
                splitRatio = "80% Train / 20% Val",
                validationStatus = "VALID",
                invalidLabelsCount = 4,
                missingImagesCount = 0,
                createdAt = System.currentTimeMillis() - 86400000L * 120,
                author = "Plantinia Foundation"
            )
        )
    )
    val datasets: StateFlow<List<DatasetVersion>> = _datasets.asStateFlow()

    // 2. Training Jobs
    private val _trainingJobs = MutableStateFlow(
        listOf(
            TrainingJob(
                id = "job_tr_992",
                datasetVersion = "v2.1",
                modelArchitecture = "YOLOv8x-Detection",
                epochs = 60,
                batchSize = 16,
                imgSize = 640,
                learningRate = 0.001,
                device = "CUDA:0 (NVIDIA A100-SXM4-80GB)",
                status = "COMPLETED",
                currentEpoch = 60,
                trainLoss = 0.024f,
                valLoss = 0.038f,
                map50 = 0.942f,
                map5095 = 0.785f,
                logs = listOf(
                    "Epoch 60/60 complete. GPU Memory: 14.2GB/80GB",
                    "Class 'Early Blight' mAP50: 0.958, Recall: 0.942",
                    "Class 'Powdery Mildew' mAP50: 0.962, Recall: 0.951",
                    "Best model weights exported to /artifacts/plantinia_v21_best.pt"
                ),
                startTime = System.currentTimeMillis() - 86400000L * 3,
                endTime = System.currentTimeMillis() - 86400000L * 3 + 14400000L
            ),
            TrainingJob(
                id = "job_tr_988",
                datasetVersion = "v2.0",
                modelArchitecture = "YOLO11m-PlantDoctor",
                epochs = 50,
                batchSize = 32,
                imgSize = 640,
                learningRate = 0.002,
                device = "CUDA:1 (NVIDIA RTX 4090)",
                status = "COMPLETED",
                currentEpoch = 50,
                trainLoss = 0.031f,
                valLoss = 0.045f,
                map50 = 0.918f,
                map5095 = 0.741f,
                logs = listOf("Training finished cleanly. Checkpoints saved."),
                startTime = System.currentTimeMillis() - 86400000L * 15,
                endTime = System.currentTimeMillis() - 86400000L * 15 + 10800000L
            )
        )
    )
    val trainingJobs: StateFlow<List<TrainingJob>> = _trainingJobs.asStateFlow()

    // 3. Model Registry
    private val _models = MutableStateFlow(
        listOf(
            ModelRegistryItem(
                id = "mod_prod_1",
                name = "Plantinia-YOLOv8x-Production",
                version = "v2.1",
                architecture = "YOLOv8x-Detection",
                datasetVersion = "v2.1",
                precision = 0.934f,
                recall = 0.946f,
                map50 = 0.942f,
                map5095 = 0.785f,
                inferenceTimeMs = 38L,
                status = "PRODUCTION",
                fileSizeBytes = 136_500_000L,
                checksum = "sha256:8f4c2e11d9a04...",
                registeredDate = System.currentTimeMillis() - 86400000L * 2,
                promotedDate = System.currentTimeMillis() - 86400000L * 1
            ),
            ModelRegistryItem(
                id = "mod_stag_2",
                name = "Plantinia-YOLO11m-Candidate",
                version = "v2.2-beta",
                architecture = "YOLO11m-PlantDoctor",
                datasetVersion = "v2.1",
                precision = 0.948f,
                recall = 0.952f,
                map50 = 0.956f,
                map5095 = 0.804f,
                inferenceTimeMs = 24L,
                status = "STAGING",
                fileSizeBytes = 68_200_000L,
                checksum = "sha256:3e7b89f012aa...",
                registeredDate = System.currentTimeMillis() - 86400000L * 1,
                promotedDate = null
            ),
            ModelRegistryItem(
                id = "mod_arch_3",
                name = "Plantinia-YOLOv8s-Legacy",
                version = "v1.0",
                architecture = "YOLOv8s",
                datasetVersion = "v1.0",
                precision = 0.882f,
                recall = 0.875f,
                map50 = 0.889f,
                map5095 = 0.690f,
                inferenceTimeMs = 28L,
                status = "ARCHIVED",
                fileSizeBytes = 44_800_000L,
                checksum = "sha256:1a2b3c4d5e6f...",
                registeredDate = System.currentTimeMillis() - 86400000L * 90,
                promotedDate = System.currentTimeMillis() - 86400000L * 85
            )
        )
    )
    val models: StateFlow<List<ModelRegistryItem>> = _models.asStateFlow()

    // 4. Feature Flags
    private val _featureFlags = MutableStateFlow(
        listOf(
            FeatureFlag("FLAG_AI_ASSISTANT", "Plantinia AI Assistant", "Enable botanical conversational Q&A agent for all active users", true),
            FeatureFlag("FLAG_BOUNDING_BOXES", "Visual Bounding Boxes", "Overlay YOLO symptom detection boxes on diagnosed leaf photos", true),
            FeatureFlag("FLAG_WEATHER_ADVISORY", "Weather Intelligence", "Weather-aware irrigation suggestions and frost/rain alerts", true),
            FeatureFlag("FLAG_NURSERY_DISCOVERY", "Local Nursery Discovery", "Search and display nearby garden centers and clinics", true),
            FeatureFlag("FLAG_ACTIVE_LEARNING", "Active Learning Pipeline", "Collect low-confidence and user-flagged diagnoses for retraining queue", true),
            FeatureFlag("FLAG_ON_DEVICE_FALLBACK", "On-Device Inference Fallback", "Enable local TFLite/ONNX offline execution when network unavailable", true)
        )
    )
    val featureFlags: StateFlow<List<FeatureFlag>> = _featureFlags.asStateFlow()

    // 5. Audit Logs
    private val _auditLogs = MutableStateFlow(
        listOf(
            AuditLogItem(UUID.randomUUID().toString(), "admin_lead", "MODEL_PROMOTED", "Plantinia-YOLOv8x v2.1 -> PRODUCTION", System.currentTimeMillis() - 86400000L * 1, "Passed quality gate: mAP50 >= 0.90"),
            AuditLogItem(UUID.randomUUID().toString(), "admin_lead", "DATASET_VALIDATED", "Dataset v2.1 (24,800 images)", System.currentTimeMillis() - 86400000L * 3, "All bounding box formats valid"),
            AuditLogItem(UUID.randomUUID().toString(), "admin_ops", "TRAINING_STARTED", "YOLOv8x 60 epochs on ds_v21", System.currentTimeMillis() - 86400000L * 3, "Targeting high recall on Solanaceae")
        )
    )
    val auditLogs: StateFlow<List<AuditLogItem>> = _auditLogs.asStateFlow()

    fun promoteModel(modelId: String) {
        val currentList = _models.value
        val target = currentList.find { it.id == modelId } ?: return

        _models.value = currentList.map {
            when {
                it.id == modelId -> it.copy(status = "PRODUCTION", promotedDate = System.currentTimeMillis())
                it.status == "PRODUCTION" -> it.copy(status = "ARCHIVED")
                else -> it
            }
        }

        val log = AuditLogItem(
            id = UUID.randomUUID().toString(),
            adminUser = "admin_current",
            action = "MODEL_PROMOTED",
            target = "${target.name} (${target.version}) -> PRODUCTION",
            timestamp = System.currentTimeMillis(),
            details = "Explicit promotion via Admin Model Registry. Previous production model archived."
        )
        _auditLogs.value = listOf(log) + _auditLogs.value
    }

    fun rollbackToModel(modelId: String) {
        val currentList = _models.value
        val target = currentList.find { it.id == modelId } ?: return

        _models.value = currentList.map {
            when {
                it.id == modelId -> it.copy(status = "PRODUCTION", promotedDate = System.currentTimeMillis())
                it.status == "PRODUCTION" -> it.copy(status = "STAGING")
                else -> it
            }
        }

        val log = AuditLogItem(
            id = UUID.randomUUID().toString(),
            adminUser = "admin_current",
            action = "MODEL_ROLLED_BACK",
            target = "Reverted production model to ${target.name} (${target.version})",
            timestamp = System.currentTimeMillis(),
            details = "Emergency rollback executed via Admin Registry."
        )
        _auditLogs.value = listOf(log) + _auditLogs.value
    }

    fun toggleFeatureFlag(flagKey: String, isEnabled: Boolean) {
        _featureFlags.value = _featureFlags.value.map {
            if (it.key == flagKey) it.copy(isEnabled = isEnabled) else it
        }
    }

    fun startTrainingJob(
        datasetVersion: String,
        architecture: String,
        epochs: Int,
        batchSize: Int,
        imgSize: Int,
        lr: Double
    ) {
        val newJob = TrainingJob(
            id = "job_tr_${System.currentTimeMillis() % 10000}",
            datasetVersion = datasetVersion,
            modelArchitecture = architecture,
            epochs = epochs,
            batchSize = batchSize,
            imgSize = imgSize,
            learningRate = lr,
            device = "CUDA:0 (NVIDIA A100-80GB)",
            status = "RUNNING",
            currentEpoch = 1,
            trainLoss = 0.082f,
            valLoss = 0.095f,
            map50 = 0.620f,
            map5095 = 0.440f,
            logs = listOf(
                "Training job queued and initiated.",
                "Loaded dataset $datasetVersion. Validated 24,800 images.",
                "Epoch 1/$epochs: Train Loss 0.082, Val Loss 0.095, Learning rate: $lr"
            ),
            startTime = System.currentTimeMillis()
        )
        _trainingJobs.value = listOf(newJob) + _trainingJobs.value

        val log = AuditLogItem(
            id = UUID.randomUUID().toString(),
            adminUser = "admin_current",
            action = "TRAINING_STARTED",
            target = "$architecture on $datasetVersion",
            timestamp = System.currentTimeMillis(),
            details = "Epochs: $epochs, Batch: $batchSize, ImgSize: $imgSize"
        )
        _auditLogs.value = listOf(log) + _auditLogs.value
    }
}
