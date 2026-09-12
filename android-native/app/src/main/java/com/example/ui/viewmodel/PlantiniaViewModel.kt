package com.example.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.ai.PlantKnowledgeBase
import com.example.data.ai.PlantiniaAIEngine
import com.example.data.local.PlantDatabase
import com.example.data.model.CarePlan
import com.example.data.model.DiagnosisRecord
import com.example.data.model.FeedbackItem
import com.example.data.model.Plant
import com.example.data.model.PlantSpecies
import com.example.data.model.Reminder
import com.example.data.model.SubscriptionTier
import com.example.data.repository.AdminMlRepository
import com.example.data.repository.CareRepository
import com.example.data.repository.DiagnosisRepository
import com.example.data.repository.NurseryRepository
import com.example.data.repository.PlantRepository
import com.example.data.repository.SubscriptionRepository
import com.example.data.repository.WeatherRepository
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.util.UUID

data class ChatMessage(
    val id: String = UUID.randomUUID().toString(),
    val sender: String, // "USER" or "ASSISTANT"
    val message: String,
    val timestamp: Long = System.currentTimeMillis()
)

sealed class DiagnoseUiState {
    object Idle : DiagnoseUiState()
    data class Analyzing(val stageText: String, val progressPercent: Int) : DiagnoseUiState()
    data class Success(val record: DiagnosisRecord) : DiagnoseUiState()
    data class Error(val message: String) : DiagnoseUiState()
}

class PlantiniaViewModel(application: Application) : AndroidViewModel(application) {

    private val db = PlantDatabase.getDatabase(application)
    val plantRepo = PlantRepository(db.plantDao())
    val diagnosisRepo = DiagnosisRepository(db.diagnosisDao(), db.feedbackDao())
    val careRepo = CareRepository(db.carePlanDao(), db.reminderDao())
    val weatherRepo = WeatherRepository()
    val nurseryRepo = NurseryRepository()
    val subscriptionRepo = SubscriptionRepository()
    val adminMlRepo = AdminMlRepository()

    // Navigation state
    private val _currentScreen = MutableStateFlow("dashboard")
    val currentScreen: StateFlow<String> = _currentScreen.asStateFlow()

    // Plants & Data
    val plants: StateFlow<List<Plant>> = plantRepo.allPlants
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val diagnoses: StateFlow<List<DiagnosisRecord>> = diagnosisRepo.allDiagnoses
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val carePlans: StateFlow<List<CarePlan>> = careRepo.allCarePlans
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val reminders: StateFlow<List<Reminder>> = careRepo.allReminders
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val feedbackList: StateFlow<List<FeedbackItem>> = db.feedbackDao().getAllFeedback()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val weather = weatherRepo.weather
    val nurseries = nurseryRepo.nurseries
    val userStats = subscriptionRepo.userStats

    // Diagnosis flow state
    private val _diagnoseState = MutableStateFlow<DiagnoseUiState>(DiagnoseUiState.Idle)
    val diagnoseState: StateFlow<DiagnoseUiState> = _diagnoseState.asStateFlow()

    private val _selectedImageUri = MutableStateFlow("android.resource://com.aistudio.plantinia.app/drawable/sample_plant_leaf")
    val selectedImageUri: StateFlow<String> = _selectedImageUri.asStateFlow()

    private val _activeDiagnosis = MutableStateFlow<DiagnosisRecord?>(null)
    val activeDiagnosis: StateFlow<DiagnosisRecord?> = _activeDiagnosis.asStateFlow()

    // AI Assistant Chat
    private val _chatMessages = MutableStateFlow(
        listOf(
            ChatMessage(
                sender = "ASSISTANT",
                message = "Hello! I am your Plantinia AI botanical assistant. I have full context on your saved plants, active diagnoses, and current weather. How can I assist your garden today?"
            )
        )
    )
    val chatMessages: StateFlow<List<ChatMessage>> = _chatMessages.asStateFlow()

    private val _isAssistantTyping = MutableStateFlow(false)
    val isAssistantTyping: StateFlow<Boolean> = _isAssistantTyping.asStateFlow()

    // Plant Library state
    private val _librarySearchQuery = MutableStateFlow("")
    val librarySearchQuery: StateFlow<String> = _librarySearchQuery.asStateFlow()

    private val _selectedDifficultyFilter = MutableStateFlow<String?>(null)
    val selectedDifficultyFilter: StateFlow<String?> = _selectedDifficultyFilter.asStateFlow()

    private val _petSafeOnlyFilter = MutableStateFlow(false)
    val petSafeOnlyFilter: StateFlow<Boolean> = _petSafeOnlyFilter.asStateFlow()

    init {
        viewModelScope.launch {
            plantRepo.seedInitialPlantsIfEmpty()
            diagnosisRepo.seedInitialDiagnosesIfEmpty()
            careRepo.seedInitialCareAndRemindersIfEmpty()
        }
    }

    fun navigateTo(screen: String) {
        _currentScreen.value = screen
    }

    fun selectImageForDiagnosis(uri: String) {
        _selectedImageUri.value = uri
    }

    fun runDiagnosis(targetPlant: Plant? = null, conditionOverride: String? = null) {
        viewModelScope.launch {
            _diagnoseState.value = DiagnoseUiState.Analyzing("Preprocessing leaf image & validating resolution...", 20)
            delay(350)
            _diagnoseState.value = DiagnoseUiState.Analyzing("Running Plantinia YOLOv8x feature extraction...", 45)
            delay(400)
            _diagnoseState.value = DiagnoseUiState.Analyzing("Calculating surface area bounding boxes...", 75)
            delay(350)
            _diagnoseState.value = DiagnoseUiState.Analyzing("SeverityEngine computing pathogen impact...", 90)
            delay(300)

            val currentModel = adminMlRepo.models.value.find { it.status == "PRODUCTION" }?.name
                ?: "Plantinia-YOLOv8x-Production"

            val result = diagnosisRepo.runDiagnosis(
                imageUri = _selectedImageUri.value,
                selectedPlant = targetPlant,
                conditionOverride = conditionOverride,
                weather = weather.value,
                modelVersion = currentModel
            )
            subscriptionRepo.incrementDiagnosisUsage()
            _activeDiagnosis.value = result
            _diagnoseState.value = DiagnoseUiState.Success(result)
            _currentScreen.value = "diagnosis_result"
        }
    }

    fun viewDiagnosisDetail(record: DiagnosisRecord) {
        _activeDiagnosis.value = record
        _currentScreen.value = "diagnosis_result"
    }

    fun submitFeedback(verdict: String, notes: String = "") {
        val diag = _activeDiagnosis.value ?: return
        viewModelScope.launch {
            diagnosisRepo.submitFeedback(diag.id, verdict, notes)
            _activeDiagnosis.value = diag.copy(feedbackStatus = verdict)
        }
    }

    fun sendChatMessage(prompt: String) {
        if (prompt.isBlank()) return
        val userMsg = ChatMessage(sender = "USER", message = prompt)
        _chatMessages.value = _chatMessages.value + userMsg
        _isAssistantTyping.value = true

        viewModelScope.launch {
            delay(600)
            val answer = PlantiniaAIEngine.answerPlantQuery(
                userPrompt = prompt,
                userPlants = plants.value,
                recentDiagnosis = _activeDiagnosis.value ?: diagnoses.value.firstOrNull(),
                weather = weather.value
            )
            subscriptionRepo.incrementAssistantUsage()
            _chatMessages.value = _chatMessages.value + ChatMessage(sender = "ASSISTANT", message = answer)
            _isAssistantTyping.value = false
        }
    }

    fun addPlant(name: String, species: String, location: String, isIndoor: Boolean, sunlight: String, wateringDays: Int) {
        viewModelScope.launch {
            val newPlant = Plant(
                id = "plant_${UUID.randomUUID()}",
                name = name,
                species = species,
                location = location,
                isIndoor = isIndoor,
                sunlightLevel = sunlight,
                wateringFrequencyDays = wateringDays,
                healthStatus = "HEALTHY",
                healthScore = 95
            )
            plantRepo.addPlant(newPlant)
            careRepo.generateCarePlanForPlant(newPlant.id, newPlant.name, newPlant.species)
            // Add a reminder
            careRepo.addReminder(
                Reminder(
                    id = "rem_${UUID.randomUUID()}",
                    plantId = newPlant.id,
                    plantName = newPlant.name,
                    reminderType = "WATER",
                    title = "Water ${newPlant.name}",
                    dueTimestamp = System.currentTimeMillis() + 86400000L * wateringDays,
                    repeatDays = wateringDays
                )
            )
        }
    }

    fun markWatered(plant: Plant) {
        viewModelScope.launch {
            val nextWater = System.currentTimeMillis() + 86400000L * plant.wateringFrequencyDays
            val updated = plant.copy(
                lastWateredDate = System.currentTimeMillis(),
                nextWateringDate = nextWater,
                healthScore = (plant.healthScore + 2).coerceAtMost(100),
                updatedAt = System.currentTimeMillis()
            )
            plantRepo.updatePlant(updated)
        }
    }

    fun deletePlant(plant: Plant) {
        viewModelScope.launch {
            plantRepo.deletePlant(plant)
        }
    }

    fun toggleReminder(reminder: Reminder) {
        viewModelScope.launch {
            careRepo.toggleReminderCompleted(reminder.id, !reminder.isCompleted)
        }
    }

    fun upgradePlan(tier: SubscriptionTier) {
        subscriptionRepo.upgradePlan(tier)
    }

    fun setLibrarySearchQuery(query: String) {
        _librarySearchQuery.value = query
    }

    fun setDifficultyFilter(diff: String?) {
        _selectedDifficultyFilter.value = diff
    }

    fun togglePetSafeFilter() {
        _petSafeOnlyFilter.value = !_petSafeOnlyFilter.value
    }

    fun getFilteredSpecies(): List<PlantSpecies> {
        val query = _librarySearchQuery.value.lowercase()
        val diff = _selectedDifficultyFilter.value
        val petOnly = _petSafeOnlyFilter.value

        return PlantKnowledgeBase.plantSpeciesList.filter { species ->
            val matchesQuery = query.isBlank() ||
                species.commonName.lowercase().contains(query) ||
                species.scientificName.lowercase().contains(query) ||
                species.tags.any { it.lowercase().contains(query) }

            val matchesDiff = diff == null || species.difficulty.equals(diff, ignoreCase = true)
            val matchesPet = !petOnly || species.isPetSafe

            matchesQuery && matchesDiff && matchesPet
        }
    }
}
