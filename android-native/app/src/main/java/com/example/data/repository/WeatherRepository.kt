package com.example.data.repository

import com.example.data.model.WeatherInfo
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class WeatherRepository {

    private val _weather = MutableStateFlow(WeatherInfo())
    val weather: StateFlow<WeatherInfo> = _weather.asStateFlow()

    fun updateLocation(locationName: String, temp: Int, condition: String, humidity: Int, rainChance: Int) {
        val rainAlert = if (rainChance > 50) {
            "Rain probability is ${rainChance}%. Move delicate outdoor potted succulents under covered porch."
        } else null

        val wateringAdvice = if (rainChance > 50) {
            "Heavy rain likely. Suspend all outdoor irrigation today."
        } else if (temp > 32) {
            "High heat detected (${temp}°C). Provide morning deep soak and check for drooping leaves."
        } else {
            "Comfortable conditions. Follow baseline soil drying checks."
        }

        _weather.value = _weather.value.copy(
            locationName = locationName,
            temperatureC = temp,
            condition = condition,
            humidityPercent = humidity,
            rainProbabilityPercent = rainChance,
            rainAlert = rainAlert,
            wateringRecommendation = wateringAdvice
        )
    }
}
