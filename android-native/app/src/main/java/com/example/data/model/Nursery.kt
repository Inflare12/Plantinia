package com.example.data.model

data class Nursery(
    val id: String,
    val name: String,
    val address: String,
    val distanceKm: Double,
    val rating: Float,
    val totalReviews: Int,
    val openHours: String,
    val phone: String,
    val website: String,
    val specialties: List<String>
)
