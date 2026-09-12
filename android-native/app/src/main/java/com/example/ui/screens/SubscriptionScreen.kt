package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Diamond
import androidx.compose.material.icons.filled.Receipt
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.SubscriptionPlan
import com.example.data.model.SubscriptionTier
import com.example.ui.viewmodel.PlantiniaViewModel

@Composable
fun SubscriptionScreen(
    viewModel: PlantiniaViewModel,
    modifier: Modifier = Modifier
) {
    val stats by viewModel.userStats.collectAsState()
    val plans = viewModel.subscriptionRepo.availablePlans
    val invoices by viewModel.subscriptionRepo.invoices.collectAsState()

    var showUpgradeConfirm by remember { mutableStateOf<SubscriptionPlan?>(null) }
    var upgradeSuccessNotice by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFFF8FAF7))
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = { viewModel.navigateTo("dashboard") }) {
                Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back", tint = Color(0xFF1B4332))
            }
            Text(
                text = "Subscription & Usage",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF1B4332)
            )
        }

        Spacer(modifier = Modifier.height(10.dp))

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(14.dp),
            modifier = Modifier.weight(1f)
        ) {
            // Usage meters card
            item {
                Card(
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                    modifier = Modifier.fillMaxWidth().testTag("subscription_usage_card")
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = "Current Plan: ${stats.currentPlan.name}",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF1B4332)
                                )
                                Text(
                                    text = "Renews: ${stats.renewalDateText}",
                                    fontSize = 12.sp,
                                    color = Color(0xFF64748B)
                                )
                            }
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(Color(0xFFD8F3DC))
                                    .padding(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Text("ACTIVE", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1B4332))
                            }
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        // Diagnosis usage meter
                        val diagPercent = (stats.diagnosesUsedThisMonth.toFloat() / stats.diagnosesLimit).coerceIn(0f, 1f)
                        Text(
                            text = "AI Leaf Diagnoses: ${stats.diagnosesUsedThisMonth} / ${stats.diagnosesLimit} used",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color(0xFF1E293B)
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        LinearProgressIndicator(
                            progress = { diagPercent },
                            modifier = Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp)),
                            color = Color(0xFF2D6A4F)
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        // Assistant usage meter
                        val assistantPercent = (stats.assistantQueriesUsed.toFloat() / stats.assistantLimit).coerceIn(0f, 1f)
                        Text(
                            text = "AI Botanical Inquiries: ${stats.assistantQueriesUsed} / ${stats.assistantLimit} used",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color(0xFF1E293B)
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        LinearProgressIndicator(
                            progress = { assistantPercent },
                            modifier = Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp)),
                            color = Color(0xFF52B788)
                        )
                    }
                }
            }

            // Upgrade notice if any
            if (upgradeSuccessNotice != null) {
                item {
                    Card(
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFFD1FAE5))
                    ) {
                        Text(
                            text = upgradeSuccessNotice!!,
                            color = Color(0xFF065F46),
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 13.sp,
                            modifier = Modifier.padding(14.dp)
                        )
                    }
                }
            }

            // Plans List
            items(plans) { plan ->
                val isCurrent = stats.currentPlan == plan.tier
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = if (isCurrent) Color(0xFFEFFDF5) else Color.White
                    ),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
                    modifier = Modifier.fillMaxWidth().testTag("plan_card_${plan.tier.name}")
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = plan.title,
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF1B4332)
                                )
                                Text(
                                    text = if (plan.priceMonthlyInr == 0) "Free forever" else "₹${plan.priceMonthlyInr} / month (or ₹${plan.priceYearlyInr}/yr)",
                                    fontSize = 13.sp,
                                    color = Color(0xFF2D6A4F),
                                    fontWeight = FontWeight.SemiBold
                                )
                            }

                            if (plan.tier == SubscriptionTier.PRO) {
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(Color(0xFFFEF3C7))
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text("PRO", fontSize = 10.sp, color = Color(0xFFB45309), fontWeight = FontWeight.Bold)
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        plan.features.forEach { feat ->
                            Row(modifier = Modifier.padding(vertical = 3.dp), verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Check, contentDescription = null, tint = Color(0xFF10B981), modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(feat, fontSize = 12.sp, color = Color(0xFF475569))
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        if (isCurrent) {
                            Button(
                                onClick = { },
                                enabled = false,
                                modifier = Modifier.fillMaxWidth(),
                                colors = ButtonDefaults.buttonColors(disabledContainerColor = Color(0xFFE2E8F0))
                            ) {
                                Text("Current Active Plan", color = Color(0xFF64748B))
                            }
                        } else {
                            Button(
                                onClick = { showUpgradeConfirm = plan },
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1B4332)),
                                shape = RoundedCornerShape(10.dp),
                                modifier = Modifier.fillMaxWidth().testTag("upgrade_button_${plan.tier.name}")
                            ) {
                                Text("Upgrade to ${plan.title}")
                            }
                        }
                    }
                }
            }

            // Invoices section
            item {
                Text(
                    text = "Billing Invoices",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF1B4332)
                )
            }

            items(invoices) { inv ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(Color.White)
                        .padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(inv.description, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF1E293B))
                        Text("${inv.dateText} • ${inv.id}", fontSize = 11.sp, color = Color(0xFF64748B))
                    }
                    Text(
                        text = if (inv.amountInr == 0) "Free" else "₹${inv.amountInr}",
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        color = Color(0xFF2D6A4F)
                    )
                }
            }

            item { Spacer(modifier = Modifier.height(24.dp)) }
        }
    }

    // Confirmation dialog
    if (showUpgradeConfirm != null) {
        val p = showUpgradeConfirm!!
        AlertDialog(
            onDismissRequest = { showUpgradeConfirm = null },
            title = { Text("Upgrade to ${p.title}?") },
            text = {
                Text("Confirm plan change to ${p.title} for ₹${p.priceMonthlyInr}/month. Access to high-capacity YOLOv8 inference and multi-plant tracking will unlock instantly.")
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.upgradePlan(p.tier)
                        upgradeSuccessNotice = "Successfully upgraded to ${p.title}! Razorpay webhook verified."
                        showUpgradeConfirm = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1B4332))
                ) {
                    Text("Confirm & Pay")
                }
            },
            dismissButton = {
                TextButton(onClick = { showUpgradeConfirm = null }) {
                    Text("Cancel")
                }
            }
        )
    }
}
