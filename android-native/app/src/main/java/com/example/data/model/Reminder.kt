package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "reminders")
data class Reminder(
    @PrimaryKey val id: String,
    val plantId: String,
    val plantName: String,
    val reminderType: String, // "WATER", "FERTILIZE", "PRUNE", "REPOT", "INSPECT", "CUSTOM"
    val title: String,
    val note: String = "",
    val dueTimestamp: Long,
    val repeatDays: Int = 7,
    val isCompleted: Boolean = false,
    val createdAt: Long = System.currentTimeMillis()
)
