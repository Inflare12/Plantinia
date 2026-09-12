package com.example.data.model

data class DatasetVersion(
    val id: String,
    val versionTag: String, // e.g., "v2.1"
    val name: String,
    val description: String,
    val imageCount: Int,
    val classCount: Int,
    val classes: List<String>,
    val splitRatio: String, // "70/20/10"
    val validationStatus: String, // "VALID", "WARNING", "INVALID"
    val invalidLabelsCount: Int = 0,
    val missingImagesCount: Int = 0,
    val createdAt: Long = System.currentTimeMillis(),
    val author: String = "Plantinia ML Ops"
)

data class TrainingJob(
    val id: String,
    val datasetVersion: String,
    val modelArchitecture: String, // "YOLOv8x-Detection", "YOLO11m", "EfficientNetV2"
    val epochs: Int,
    val batchSize: Int,
    val imgSize: Int,
    val learningRate: Double,
    val device: String, // "CUDA:0 (NVIDIA A100)", "Apple Metal", "CPU"
    val status: String, // "QUEUED", "RUNNING", "COMPLETED", "FAILED", "CANCELLED"
    val currentEpoch: Int,
    val trainLoss: Float,
    val valLoss: Float,
    val map50: Float,
    val map5095: Float,
    val logs: List<String>,
    val startTime: Long,
    val endTime: Long? = null
)

data class ModelRegistryItem(
    val id: String,
    val name: String,
    val version: String,
    val architecture: String,
    val datasetVersion: String,
    val precision: Float,
    val recall: Float,
    val map50: Float,
    val map5095: Float,
    val inferenceTimeMs: Long,
    val status: String, // "STAGING", "PRODUCTION", "ARCHIVED"
    val fileSizeBytes: Long,
    val checksum: String,
    val registeredDate: Long = System.currentTimeMillis(),
    val promotedDate: Long? = null
)

data class AuditLogItem(
    val id: String,
    val adminUser: String,
    val action: String, // "MODEL_PROMOTED", "MODEL_ROLLED_BACK", "DATASET_CREATED", "TRAINING_STARTED"
    val target: String,
    val timestamp: Long = System.currentTimeMillis(),
    val details: String
)

data class FeatureFlag(
    val key: String,
    val title: String,
    val description: String,
    val isEnabled: Boolean,
    val category: String = "GENERAL"
)
