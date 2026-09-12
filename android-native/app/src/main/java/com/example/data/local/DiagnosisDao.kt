package com.example.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.data.model.DiagnosisRecord
import kotlinx.coroutines.flow.Flow

@Dao
interface DiagnosisDao {
    @Query("SELECT * FROM diagnoses ORDER BY timestamp DESC")
    fun getAllDiagnoses(): Flow<List<DiagnosisRecord>>

    @Query("SELECT * FROM diagnoses WHERE plantId = :plantId ORDER BY timestamp DESC")
    fun getDiagnosesForPlant(plantId: String): Flow<List<DiagnosisRecord>>

    @Query("SELECT * FROM diagnoses WHERE id = :id")
    suspend fun getDiagnosisById(id: String): DiagnosisRecord?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDiagnosis(diagnosis: DiagnosisRecord)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(diagnoses: List<DiagnosisRecord>)

    @Update
    suspend fun updateDiagnosis(diagnosis: DiagnosisRecord)

    @Query("UPDATE diagnoses SET feedbackStatus = :status WHERE id = :id")
    suspend fun updateFeedback(id: String, status: String)

    @Query("DELETE FROM diagnoses WHERE id = :id")
    suspend fun deleteDiagnosisById(id: String)
}
