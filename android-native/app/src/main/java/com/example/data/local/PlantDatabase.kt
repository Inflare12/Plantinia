package com.example.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.example.data.model.CarePlan
import com.example.data.model.DiagnosisRecord
import com.example.data.model.FeedbackItem
import com.example.data.model.Plant
import com.example.data.model.Reminder

@Database(
    entities = [
        Plant::class,
        DiagnosisRecord::class,
        CarePlan::class,
        Reminder::class,
        FeedbackItem::class
    ],
    version = 1,
    exportSchema = false
)
abstract class PlantDatabase : RoomDatabase() {
    abstract fun plantDao(): PlantDao
    abstract fun diagnosisDao(): DiagnosisDao
    abstract fun carePlanDao(): CarePlanDao
    abstract fun reminderDao(): ReminderDao
    abstract fun feedbackDao(): FeedbackDao

    companion object {
        @Volatile
        private var INSTANCE: PlantDatabase? = null

        fun getDatabase(context: Context): PlantDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    PlantDatabase::class.java,
                    "plantinia_database"
                )
                .fallbackToDestructiveMigration()
                .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
