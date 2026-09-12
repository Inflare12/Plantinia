package com.example.data.model

data class WeatherInfo(
    val locationName: String = "Bangalore, India",
    val temperatureC: Int = 27,
    val condition: String = "Partly Cloudy",
    val humidityPercent: Int = 68,
    val rainProbabilityPercent: Int = 40,
    val uvIndex: Int = 6,
    val windSpeedKmh: Int = 14,
    val heatAlert: String? = null,
    val frostAlert: String? = null,
    val rainAlert: String? = "Possible afternoon showers. Check outdoor potted drainage.",
    val wateringRecommendation: String = "Moderate evaporation today. Water indoor tropicals; delay outdoor plants until rain passes.",
    val forecastDays: List<DayForecast> = listOf(
        DayForecast("Today", 27, 20, "Scattered Showers", 45),
        DayForecast("Tomorrow", 28, 21, "Sunny Intervals", 20),
        DayForecast("Thursday", 29, 21, "Partly Cloudy", 15),
        DayForecast("Friday", 26, 19, "Light Rain", 60),
        DayForecast("Saturday", 27, 20, "Clear Sky", 10)
    )
)

data class DayForecast(
    val dayName: String,
    val tempMax: Int,
    val tempMin: Int,
    val condition: String,
    val rainChance: Int
)
