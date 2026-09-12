package com.example.ui.screens.admin

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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Dataset
import androidx.compose.material.icons.filled.FactCheck
import androidx.compose.material.icons.filled.FitnessCenter
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material.icons.filled.ManageHistory
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.viewmodel.PlantiniaViewModel

@Composable
fun AdminDashboardScreen(
    viewModel: PlantiniaViewModel,
    modifier: Modifier = Modifier
) {
    val adminRepo = viewModel.adminMlRepo
    val datasets by adminRepo.datasets.collectAsState()
    val models by adminRepo.models.collectAsState()
    val trainingJobs by adminRepo.trainingJobs.collectAsState()
    val feedbackList by viewModel.feedbackList.collectAsState()

    val prodModel = models.find { it.status == "PRODUCTION" }

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
            Column {
                Text(
                    text = "Plantinia ML Operations Studio",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF1B4332)
                )
                Text(
                    text = "Production Model Registry, Training & Active Learning",
                    fontSize = 11.sp,
                    color = Color(0xFF64748B)
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(14.dp),
            modifier = Modifier.weight(1f)
        ) {
            // Production Model Status Hero
            item {
                Card(
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1B4332)),
                    modifier = Modifier.fillMaxWidth().testTag("admin_production_model_card")
                ) {
                    Column(modifier = Modifier.padding(18.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "ACTIVE PRODUCTION MODEL",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF52B788),
                                letterSpacing = 1.sp
                            )
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(Color(0xFF52B788))
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Text("LIVE INFERENCE", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Color(0xFF081C15))
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Text(
                            text = prodModel?.name ?: "Plantinia-YOLOv8x-Production",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Text(
                            text = "Architecture: ${prodModel?.architecture ?: "YOLOv8x"} • Version: ${prodModel?.version ?: "v2.1"}",
                            fontSize = 12.sp,
                            color = Color(0xFFD8F3DC)
                        )

                        Spacer(modifier = Modifier.height(14.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text("mAP@50", fontSize = 10.sp, color = Color(0xFF94A3B8))
                                Text("${prodModel?.map50 ?: 0.942f}", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                            }
                            Column {
                                Text("Precision", fontSize = 10.sp, color = Color(0xFF94A3B8))
                                Text("${prodModel?.precision ?: 0.934f}", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                            }
                            Column {
                                Text("Latency", fontSize = 10.sp, color = Color(0xFF94A3B8))
                                Text("${prodModel?.inferenceTimeMs ?: 38}ms", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color(0xFF52B788))
                            }
                            Column {
                                Text("Recall", fontSize = 10.sp, color = Color(0xFF94A3B8))
                                Text("${prodModel?.recall ?: 0.946f}", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                            }
                        }
                    }
                }
            }

            // Quick Navigation Modules
            item {
                Text("ML Workspaces", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1B4332))
            }

            val workspaces = listOf(
                Triple("admin_datasets", "Pathology Datasets", "Manage versions, 24k+ images, YAML validation" to Icons.Default.Dataset),
                Triple("admin_training", "Training Pipelines", "Launch YOLO jobs, live loss curves, epochs" to Icons.Default.FitnessCenter),
                Triple("admin_models", "Model Registry", "Quality gates, staging promotion, safe rollback" to Icons.Default.Layers),
                Triple("admin_feedback", "Active Learning Review", "${feedbackList.size} user verdicts queued for relabeling" to Icons.Default.FactCheck),
                Triple("admin_system", "Feature Flags & Audit", "System toggles & immutable change log" to Icons.Default.Tune)
            )

            workspaces.forEach { (screenId, title, details) ->
                val (subtitle, icon) = details
                item {
                    Card(
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { viewModel.navigateTo(screenId) }
                            .testTag("admin_nav_$screenId")
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(42.dp)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(Color(0xFFE8F5E9)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(imageVector = icon, contentDescription = title, tint = Color(0xFF1B4332), modifier = Modifier.size(22.dp))
                            }
                            Spacer(modifier = Modifier.width(14.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(title, fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1B4332))
                                Text(subtitle, fontSize = 12.sp, color = Color(0xFF64748B))
                            }
                        }
                    }
                }
            }

            item { Spacer(modifier = Modifier.height(20.dp)) }
        }
    }
}
