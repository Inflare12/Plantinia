package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AdminPanelSettings
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.Cloud
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Diamond
import androidx.compose.material.icons.filled.EventNote
import androidx.compose.material.icons.filled.LocalFlorist
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Store
import androidx.compose.material.icons.filled.Timeline
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.viewmodel.PlantiniaViewModel

data class HubItem(
    val id: String,
    val title: String,
    val subtitle: String,
    val icon: ImageVector,
    val iconBgColor: Color,
    val iconTint: Color,
    val badge: String? = null
)

@Composable
fun ExploreHubScreen(
    viewModel: PlantiniaViewModel,
    modifier: Modifier = Modifier
) {
    val items = listOf(
        HubItem("care_plans", "Care Plans", "Adaptive schedules & tasks", Icons.Default.EventNote, Color(0xFFE8F5E9), Color(0xFF2D6A4F)),
        HubItem("library", "Plant Encyclopedia", "15+ species guides", Icons.Default.Book, Color(0xFFEFF6FF), Color(0xFF2563EB)),
        HubItem("history", "Health Timeline", "Past scans & progressions", Icons.Default.Timeline, Color(0xFFF3E8FF), Color(0xFF7C3AED)),
        HubItem("weather", "Weather Intelligence", "Watering advisories & frost", Icons.Default.Cloud, Color(0xFFE0F2FE), Color(0xFF0284C7)),
        HubItem("nurseries", "Nurseries & Clinics", "Nearby certified centers", Icons.Default.Store, Color(0xFFFEF3C7), Color(0xFFD97706)),
        HubItem("reports", "Health Reports", "Printable diagnosis PDF", Icons.Default.Description, Color(0xFFFFEDD5), Color(0xFFEA580C)),
        HubItem("subscription", "Subscription", "Free, Care+, Botanist Pro", Icons.Default.Diamond, Color(0xFFFCE7F3), Color(0xFFDB2777)),
        HubItem("settings", "Preferences", "Units, language, alerts", Icons.Default.Settings, Color(0xFFF1F5F9), Color(0xFF475569)),
        HubItem("admin_dashboard", "Admin & ML Studio", "Datasets, training, models", Icons.Default.AdminPanelSettings, Color(0xFFD8F3DC), Color(0xFF1B4332), badge = "STUDIO")
    )

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFFF8FAF7))
            .padding(16.dp)
    ) {
        Text(
            text = "Gardening Tools & Features",
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF1B4332)
        )
        Text(
            text = "Access schedules, encyclopedia, clinics, and ML operations",
            fontSize = 12.sp,
            color = Color(0xFF64748B)
        )

        Spacer(modifier = Modifier.height(16.dp))

        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(items) { hubItem ->
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { viewModel.navigateTo(hubItem.id) }
                        .testTag("hub_item_${hubItem.id}")
                ) {
                    Column(
                        modifier = Modifier.padding(14.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(40.dp)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(hubItem.iconBgColor),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = hubItem.icon,
                                    contentDescription = hubItem.title,
                                    tint = hubItem.iconTint,
                                    modifier = Modifier.size(20.dp)
                                )
                            }

                            if (hubItem.badge != null) {
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(Color(0xFF1B4332))
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        text = hubItem.badge,
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color.White
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        Text(
                            text = hubItem.title,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF1B4332)
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = hubItem.subtitle,
                            fontSize = 11.sp,
                            color = Color(0xFF64748B),
                            lineHeight = 14.sp
                        )
                    }
                }
            }
        }
    }
}
