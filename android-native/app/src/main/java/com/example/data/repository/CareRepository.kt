package com.example.data.repository

import com.example.data.local.CarePlanDao
import com.example.data.local.ReminderDao
import com.example.data.model.CarePlan
import com.example.data.model.CareTask
import com.example.data.model.Reminder
import kotlinx.coroutines.flow.Flow
import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID

class CareRepository(
    private val carePlanDao: CarePlanDao,
    private val reminderDao: ReminderDao
) {

    val allCarePlans: Flow<List<CarePlan>> = carePlanDao.getAllCarePlans()
    val allReminders: Flow<List<Reminder>> = reminderDao.getAllReminders()
    val pendingReminders: Flow<List<Reminder>> = reminderDao.getPendingReminders()

    suspend fun addReminder(reminder: Reminder) = reminderDao.insertReminder(reminder)

    suspend fun toggleReminderCompleted(id: String, isCompleted: Boolean) =
        reminderDao.setCompleted(id, isCompleted)

    suspend fun deleteReminder(reminder: Reminder) = reminderDao.deleteReminder(reminder)

    suspend fun generateCarePlanForPlant(plantId: String, plantName: String, species: String): CarePlan {
        val tasks = listOf(
            CareTask(UUID.randomUUID().toString(), "Check Soil Moisture", "Insert finger 2 inches deep. Water only if dry.", "SOIL_CHECK", "Monday & Thursday"),
            CareTask(UUID.randomUUID().toString(), "Inspect Foliage & Pests", "Check leaf undersides for fine webbing or aphids.", "INSPECT_LEAVES", "Every Wednesday"),
            CareTask(UUID.randomUUID().toString(), "Rotate Pot 90 Degrees", "Even out light distribution to prevent lopsided leaning.", "ROTATE", "Every 2 Weeks"),
            CareTask(UUID.randomUUID().toString(), "Gentle Leaf Cleaning", "Wipe dust with damp microfiber cloth to boost photosynthesis.", "MIST", "1st of Every Month")
        )

        val tasksJson = JSONArray().apply {
            tasks.forEach { task ->
                put(JSONObject().apply {
                    put("id", task.id)
                    put("title", task.title)
                    put("description", task.description)
                    put("taskType", task.taskType)
                    put("frequencyOrDay", task.frequencyOrDay)
                    put("isCompleted", task.isCompleted)
                })
            }
        }.toString()

        val plan = CarePlan(
            id = UUID.randomUUID().toString(),
            plantId = plantId,
            plantName = plantName,
            species = species,
            scheduleSummary = "Bi-weekly inspection & moisture-monitored hydration",
            tasksJson = tasksJson,
            seasonalAdvice = "Autumn transition: reduce fertilization by 50% as daylight hours shorten.",
            weatherAdjustedRule = "Delay outdoor watering during humid or overcast conditions."
        )

        carePlanDao.insertCarePlan(plan)
        return plan
    }

    suspend fun seedInitialCareAndRemindersIfEmpty() {
        val now = System.currentTimeMillis()
        val seedReminders = listOf(
            Reminder(
                id = "rem_1",
                plantId = "plant_monstera_1",
                plantName = "Living Room Monstera",
                reminderType = "WATER",
                title = "Water Living Room Monstera",
                note = "Use room-temperature water. Check bottom tray for standing water.",
                dueTimestamp = now + 86400000L * 1, // Tomorrow
                repeatDays = 7,
                isCompleted = false
            ),
            Reminder(
                id = "rem_2",
                plantId = "plant_fig_2",
                plantName = "Balcony Fiddle Leaf",
                reminderType = "INSPECT",
                title = "Inspect Fiddle Leaf Blight Follow-up",
                note = "Check if pruned cuts have calloused and copper spray has contained the lesion spread.",
                dueTimestamp = now + 86400000L * 2,
                repeatDays = 7,
                isCompleted = false
            ),
            Reminder(
                id = "rem_3",
                plantId = "plant_snake_3",
                plantName = "Office Snake Plant",
                reminderType = "FERTILIZE",
                title = "Half-strength Cactus Fertilizer",
                note = "Light feed for active desk growth.",
                dueTimestamp = now + 86400000L * 5,
                repeatDays = 30,
                isCompleted = false
            )
        )
        reminderDao.insertAll(seedReminders)

        val defaultPlan = generateCarePlanForPlant(
            plantId = "plant_monstera_1",
            plantName = "Living Room Monstera",
            species = "Monstera deliciosa"
        )
    }
}
