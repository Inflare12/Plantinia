package com.example.data.model

enum class SubscriptionTier {
    FREE,
    PREMIUM,
    PRO
}

data class SubscriptionPlan(
    val tier: SubscriptionTier,
    val title: String,
    val priceMonthlyInr: Int,
    val priceYearlyInr: Int,
    val diagnosisLimitPerMonth: Int,
    val aiAssistantLimitPerMonth: Int,
    val features: List<String>,
    val isCurrent: Boolean = false
)

data class UserUsageStats(
    val diagnosesUsedThisMonth: Int = 3,
    val diagnosesLimit: Int = 10,
    val assistantQueriesUsed: Int = 8,
    val assistantLimit: Int = 25,
    val currentPlan: SubscriptionTier = SubscriptionTier.FREE,
    val renewalDateText: String = "October 1, 2026"
)

data class InvoiceItem(
    val id: String,
    val dateText: String,
    val amountInr: Int,
    val status: String,
    val description: String
)
