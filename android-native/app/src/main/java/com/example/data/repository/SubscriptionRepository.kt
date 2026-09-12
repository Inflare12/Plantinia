package com.example.data.repository

import com.example.data.model.InvoiceItem
import com.example.data.model.SubscriptionPlan
import com.example.data.model.SubscriptionTier
import com.example.data.model.UserUsageStats
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class SubscriptionRepository {

    val availablePlans = listOf(
        SubscriptionPlan(
            tier = SubscriptionTier.FREE,
            title = "Free Explorer",
            priceMonthlyInr = 0,
            priceYearlyInr = 0,
            diagnosisLimitPerMonth = 10,
            aiAssistantLimitPerMonth = 25,
            features = listOf(
                "10 AI Diagnoses per month",
                "Full Plant Library Access",
                "Basic Severity Assessment",
                "Up to 3 Saved Plants in Collection",
                "Standard Weather Advice"
            )
        ),
        SubscriptionPlan(
            tier = SubscriptionTier.PREMIUM,
            title = "Plantinia Care+",
            priceMonthlyInr = 299,
            priceYearlyInr = 2499,
            diagnosisLimitPerMonth = 100,
            aiAssistantLimitPerMonth = 200,
            features = listOf(
                "100 AI Diagnoses per month",
                "Unlimited Plant Collection Tracking",
                "Bounding Box Symptom Segmentation",
                "Automated Personalized Care Plans",
                "Push Reminders & Calendar Sync",
                "Full Health History Timeline",
                "Downloadable PDF Plant Health Reports"
            )
        ),
        SubscriptionPlan(
            tier = SubscriptionTier.PRO,
            title = "Botanist Pro",
            priceMonthlyInr = 699,
            priceYearlyInr = 5999,
            diagnosisLimitPerMonth = 500,
            aiAssistantLimitPerMonth = 1000,
            features = listOf(
                "500 AI Diagnoses / month",
                "Multi-garden / Nursery Inventory Management",
                "Priority GPU Inference Pipeline (<200ms)",
                "Admin ML Model Testing & A/B Access",
                "Batch Image Diagnosis",
                "Dedicated Plant Pathologist Consultation"
            )
        )
    )

    private val _userStats = MutableStateFlow(
        UserUsageStats(
            diagnosesUsedThisMonth = 3,
            diagnosesLimit = 10,
            assistantQueriesUsed = 8,
            assistantLimit = 25,
            currentPlan = SubscriptionTier.FREE,
            renewalDateText = "October 1, 2026"
        )
    )
    val userStats: StateFlow<UserUsageStats> = _userStats.asStateFlow()

    private val _invoices = MutableStateFlow(
        listOf(
            InvoiceItem("inv_1092", "Sept 1, 2026", 0, "PAID", "Free Explorer Tier Renewal"),
            InvoiceItem("inv_1044", "Aug 1, 2026", 0, "PAID", "Free Explorer Tier Activation")
        )
    )
    val invoices: StateFlow<List<InvoiceItem>> = _invoices.asStateFlow()

    fun upgradePlan(targetTier: SubscriptionTier) {
        val selectedPlan = availablePlans.find { it.tier == targetTier } ?: return
        _userStats.value = _userStats.value.copy(
            currentPlan = targetTier,
            diagnosesLimit = selectedPlan.diagnosisLimitPerMonth,
            assistantLimit = selectedPlan.aiAssistantLimitPerMonth
        )
        if (selectedPlan.priceMonthlyInr > 0) {
            val newInvoice = InvoiceItem(
                id = "inv_${System.currentTimeMillis() % 10000}",
                dateText = "Today",
                amountInr = selectedPlan.priceMonthlyInr,
                status = "PAID (Razorpay Webhook Verified)",
                description = "${selectedPlan.title} Monthly Subscription"
            )
            _invoices.value = listOf(newInvoice) + _invoices.value
        }
    }

    fun incrementDiagnosisUsage() {
        _userStats.value = _userStats.value.copy(
            diagnosesUsedThisMonth = _userStats.value.diagnosesUsedThisMonth + 1
        )
    }

    fun incrementAssistantUsage() {
        _userStats.value = _userStats.value.copy(
            assistantQueriesUsed = _userStats.value.assistantQueriesUsed + 1
        )
    }
}
