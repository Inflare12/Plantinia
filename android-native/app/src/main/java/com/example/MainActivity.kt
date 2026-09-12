package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import com.example.ui.components.PlantiniaBottomBar
import com.example.ui.components.PlantiniaTopBar
import com.example.ui.screens.AssistantScreen
import com.example.ui.screens.CarePlansScreen
import com.example.ui.screens.DashboardScreen
import com.example.ui.screens.DiagnoseScreen
import com.example.ui.screens.DiagnosisResultScreen
import com.example.ui.screens.ExploreHubScreen
import com.example.ui.screens.HistoryTimelineScreen
import com.example.ui.screens.NurseriesScreen
import com.example.ui.screens.PlantLibraryScreen
import com.example.ui.screens.PlantsScreen
import com.example.ui.screens.ReportsScreen
import com.example.ui.screens.SettingsScreen
import com.example.ui.screens.SubscriptionScreen
import com.example.ui.screens.WeatherScreen
import com.example.ui.screens.admin.AdminDashboardScreen
import com.example.ui.screens.admin.AdminDatasetsScreen
import com.example.ui.screens.admin.AdminFeedbackScreen
import com.example.ui.screens.admin.AdminModelsScreen
import com.example.ui.screens.admin.AdminSystemScreen
import com.example.ui.screens.admin.AdminTrainingScreen
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.viewmodel.PlantiniaViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: PlantiniaViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                PlantiniaApp(viewModel = viewModel)
            }
        }
    }
}

@Composable
fun PlantiniaApp(viewModel: PlantiniaViewModel) {
    val currentScreen by viewModel.currentScreen.collectAsState()
    val weather by viewModel.weather.collectAsState()

    // Handle back button gracefully
    BackHandler(enabled = currentScreen != "dashboard") {
        when {
            currentScreen.startsWith("admin_") && currentScreen != "admin_dashboard" -> {
                viewModel.navigateTo("admin_dashboard")
            }
            currentScreen == "admin_dashboard" -> {
                viewModel.navigateTo("dashboard")
            }
            currentScreen == "diagnosis_result" -> {
                viewModel.navigateTo("diagnose")
            }
            else -> {
                viewModel.navigateTo("dashboard")
            }
        }
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        topBar = {
            PlantiniaTopBar(
                currentScreen = currentScreen,
                weather = weather,
                onAdminClick = {
                    if (currentScreen.startsWith("admin_")) {
                        viewModel.navigateTo("dashboard")
                    } else {
                        viewModel.navigateTo("admin_dashboard")
                    }
                },
                onWeatherClick = {
                    viewModel.navigateTo("weather")
                }
            )
        },
        bottomBar = {
            PlantiniaBottomBar(
                currentScreen = currentScreen,
                onNavigate = { route -> viewModel.navigateTo(route) }
            )
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (currentScreen) {
                "dashboard" -> DashboardScreen(viewModel = viewModel)
                "plants" -> PlantsScreen(viewModel = viewModel)
                "diagnose" -> DiagnoseScreen(viewModel = viewModel)
                "diagnosis_result" -> DiagnosisResultScreen(viewModel = viewModel)
                "assistant" -> AssistantScreen(viewModel = viewModel)
                "more" -> ExploreHubScreen(viewModel = viewModel)
                "care_plans" -> CarePlansScreen(viewModel = viewModel)
                "library" -> PlantLibraryScreen(viewModel = viewModel)
                "history" -> HistoryTimelineScreen(viewModel = viewModel)
                "weather" -> WeatherScreen(viewModel = viewModel)
                "nurseries" -> NurseriesScreen(viewModel = viewModel)
                "reports" -> ReportsScreen(viewModel = viewModel)
                "subscription" -> SubscriptionScreen(viewModel = viewModel)
                "settings" -> SettingsScreen(viewModel = viewModel)

                // Admin ML screens
                "admin_dashboard" -> AdminDashboardScreen(viewModel = viewModel)
                "admin_datasets" -> AdminDatasetsScreen(viewModel = viewModel)
                "admin_training" -> AdminTrainingScreen(viewModel = viewModel)
                "admin_models" -> AdminModelsScreen(viewModel = viewModel)
                "admin_feedback" -> AdminFeedbackScreen(viewModel = viewModel)
                "admin_system" -> AdminSystemScreen(viewModel = viewModel)

                else -> DashboardScreen(viewModel = viewModel)
            }
        }
    }
}
