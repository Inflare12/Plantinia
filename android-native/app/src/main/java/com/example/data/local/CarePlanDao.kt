package com.example.data.local

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.data.model.CarePlan
import kotlinx.coroutines.flow.Flow

@Dao
interface CarePlanDao {
    @Query("SELECT * FROM care_plans ORDER BY createdAt DESC")
    fun getAllCarePlans(): Flow<List<CarePlan>>

    @Query("SELECT * FROM care_plans WHERE plantId = :plantId LIMIT 1")
    fun getCarePlanForPlant(plantId: String): Flow<CarePlan?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCarePlan(carePlan: CarePlan)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(plans: List<CarePlan>)

    @Update
    suspend fun updateCarePlan(carePlan: CarePlan)

    @Delete
    suspend fun deleteCarePlan(carePlan: CarePlan)
}
