package com.example.ui.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.Eco
import androidx.compose.material.icons.filled.MoreHoriz
import androidx.compose.material.icons.outlined.AutoAwesome
import androidx.compose.material.icons.outlined.CameraAlt
import androidx.compose.material.icons.outlined.Dashboard
import androidx.compose.material.icons.outlined.Eco
import androidx.compose.material.icons.outlined.MoreHoriz
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun PlantiniaBottomBar(
    currentScreen: String,
    onNavigate: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    NavigationBar(
        modifier = modifier.testTag("bottom_navigation_bar"),
        containerColor = MaterialTheme.colorScheme.surface,
        tonalElevation = 8.dp
    ) {
        val navItems = listOf(
            Triple("dashboard", "Dashboard", Icons.Filled.Dashboard to Icons.Outlined.Dashboard),
            Triple("plants", "Plants", Icons.Filled.Eco to Icons.Outlined.Eco),
            Triple("diagnose", "Diagnose", Icons.Filled.CameraAlt to Icons.Outlined.CameraAlt),
            Triple("assistant", "AI Chat", Icons.Filled.AutoAwesome to Icons.Outlined.AutoAwesome),
            Triple("more", "Explore", Icons.Filled.MoreHoriz to Icons.Outlined.MoreHoriz)
        )

        navItems.forEach { (route, label, icons) ->
            val isSelected = currentScreen == route ||
                (route == "more" && (currentScreen in listOf("care_plans", "reminders", "library", "history", "weather", "nurseries", "reports", "subscription", "settings") || currentScreen.startsWith("admin")))

            NavigationBarItem(
                selected = isSelected,
                onClick = { onNavigate(route) },
                icon = {
                    Icon(
                        imageVector = if (isSelected) icons.first else icons.second,
                        contentDescription = label
                    )
                },
                label = {
                    Text(
                        text = label,
                        fontSize = 11.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                    )
                },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = Color(0xFF1B4332),
                    selectedTextColor = Color(0xFF1B4332),
                    indicatorColor = Color(0xFFD8F3DC),
                    unselectedIconColor = Color(0xFF64748B),
                    unselectedTextColor = Color(0xFF64748B)
                ),
                modifier = Modifier.testTag("nav_item_$route")
            )
        }
    }
}
