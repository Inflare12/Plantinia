package com.example.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.data.model.FeedbackItem
import kotlinx.coroutines.flow.Flow

@Dao
interface FeedbackDao {
    @Query("SELECT * FROM feedback_items ORDER BY timestamp DESC")
    fun getAllFeedback(): Flow<List<FeedbackItem>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertFeedback(feedback: FeedbackItem)

    @Update
    suspend fun updateFeedback(feedback: FeedbackItem)

    @Query("UPDATE feedback_items SET adminReviewStatus = :status WHERE id = :id")
    suspend fun updateAdminReviewStatus(id: String, status: String)
}
