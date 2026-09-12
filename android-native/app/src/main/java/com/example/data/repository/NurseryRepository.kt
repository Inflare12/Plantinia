package com.example.data.repository

import com.example.data.model.Nursery
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class NurseryRepository {

    private val allNurseries = listOf(
        Nursery(
            id = "nurs_1",
            name = "Verdant Oasis Botanical Nursery",
            address = "42 Green Valley Road, Indiranagar, Bangalore",
            distanceKm = 1.4,
            rating = 4.8f,
            totalReviews = 342,
            openHours = "8:00 AM - 7:30 PM (Open Today)",
            phone = "+91 98450 12345",
            website = "https://verdantoasisplants.com",
            specialties = listOf("Rare Aroids", "Monstera Variegata", "Organic Potting Mixes", "Fungicides")
        ),
        Nursery(
            id = "nurs_2",
            name = "Flora Bloom Garden Center",
            address = "18 Outer Ring Road, Bellandur, Bangalore",
            distanceKm = 3.2,
            rating = 4.6f,
            totalReviews = 198,
            openHours = "9:00 AM - 8:00 PM (Open Today)",
            phone = "+91 80234 56789",
            website = "https://florabloombangalore.in",
            specialties = listOf("Exotic Succulents", "Fruit Trees", "Ceramic Planters", "Pest Sprays")
        ),
        Nursery(
            id = "nurs_3",
            name = "Green Thumb Plant Clinic & Nursery",
            address = "77 100ft Road, Koramangala 4th Block",
            distanceKm = 4.8,
            rating = 4.9f,
            totalReviews = 512,
            openHours = "8:30 AM - 7:00 PM (Open Today)",
            phone = "+91 99001 88776",
            website = "https://greenthumbclinic.org",
            specialties = listOf("Plant Health Diagnosis", "Organic Neem Products", "Bonsai", "Indoor Palms")
        ),
        Nursery(
            id = "nurs_4",
            name = "Eden Heritage Garden Hub",
            address = "Plot 12, Whitefield Main Road, Bangalore",
            distanceKm = 7.5,
            rating = 4.5f,
            totalReviews = 145,
            openHours = "9:00 AM - 6:30 PM",
            phone = "+91 94480 33445",
            website = "https://edenheritagegardens.com",
            specialties = listOf("Native Indian Flora", "Balcony Garden Kits", "Perlite & Coco Peat")
        )
    )

    private val _nurseries = MutableStateFlow(allNurseries)
    val nurseries: StateFlow<List<Nursery>> = _nurseries.asStateFlow()

    fun filter(query: String) {
        if (query.isBlank()) {
            _nurseries.value = allNurseries
        } else {
            val q = query.lowercase()
            _nurseries.value = allNurseries.filter {
                it.name.lowercase().contains(q) ||
                it.address.lowercase().contains(q) ||
                it.specialties.any { spec -> spec.lowercase().contains(q) }
            }
        }
    }
}
