package com.example.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.PhotoLibrary
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.R
import com.example.data.model.Plant
import com.example.ui.viewmodel.DiagnoseUiState
import com.example.ui.viewmodel.PlantiniaViewModel

@Composable
fun DiagnoseScreen(
    viewModel: PlantiniaViewModel,
    modifier: Modifier = Modifier
) {
    val diagnoseState by viewModel.diagnoseState.collectAsState()
    val selectedUri by viewModel.selectedImageUri.collectAsState()
    val plants by viewModel.plants.collectAsState()
    var selectedPlant by remember { mutableStateOf<Plant?>(null) }
    var selectedConditionPreset by remember { mutableStateOf<String?>("Early Blight") }

    val isAnalyzing = diagnoseState is DiagnoseUiState.Analyzing

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFFF8FAF7))
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header
        Column {
            Text(
                text = "AI Plant Pathology Scan",
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF1B4332)
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = "Upload or capture a leaf photo to detect disease, estimate severity, and generate treatment plans.",
                fontSize = 13.sp,
                color = Color(0xFF64748B)
            )
        }

        // Camera / Image Preview Card
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
            modifier = Modifier
                .fillMaxWidth()
                .testTag("diagnose_camera_card")
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(240.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(Color(0xFFF1F5F9)),
                    contentAlignment = Alignment.Center
                ) {
                    Image(
                        painter = painterResource(id = R.drawable.sample_plant_leaf),
                        contentDescription = "Target Plant Specimen",
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )

                    // Scanner overlay grid
                    if (isAnalyzing) {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(Color(0x99081C15)),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                CircularProgressIndicator(color = Color(0xFF52B788))
                                Spacer(modifier = Modifier.height(14.dp))
                                val analyzingStage = (diagnoseState as DiagnoseUiState.Analyzing)
                                Text(
                                    text = analyzingStage.stageText,
                                    color = Color.White,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.SemiBold
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                LinearProgressIndicator(
                                    progress = { analyzingStage.progressPercent / 100f },
                                    modifier = Modifier.width(180.dp),
                                    color = Color(0xFF52B788)
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Image Quality Check result banner
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(Color(0xFFE8F5E9))
                        .padding(horizontal = 12.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.CheckCircle,
                        contentDescription = "Quality OK",
                        tint = Color(0xFF2E7D32),
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Image Quality Verified: High clarity, natural light, intact foliage frame.",
                        fontSize = 12.sp,
                        color = Color(0xFF1B4332),
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }

        // Quick Presets & Test Specimens (For rapid verification)
        Text(
            text = "Select Specimen to Scan:",
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF1B4332)
        )

        val specimenPresets = listOf(
            "Early Blight" to "Alternaria Solani fungal spots",
            "Powdery Mildew" to "White powdery spores",
            "Nutrient Deficiency" to "Iron interveinal chlorosis",
            "Healthy" to "Normal cuticle & green tissue"
        )

        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            specimenPresets.forEach { (presetName, subtext) ->
                val isSelected = selectedConditionPreset == presetName
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(if (isSelected) Color(0xFFD8F3DC) else Color.White)
                        .border(
                            width = if (isSelected) 2.dp else 1.dp,
                            color = if (isSelected) Color(0xFF2D6A4F) else Color(0xFFE2E8F0),
                            shape = RoundedCornerShape(12.dp)
                        )
                        .clickable { selectedConditionPreset = presetName }
                        .padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text(
                            text = presetName,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = Color(0xFF1B4332)
                        )
                        Text(
                            text = subtext,
                            fontSize = 12.sp,
                            color = Color(0xFF64748B)
                        )
                    }

                    if (isSelected) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = "Selected",
                            tint = Color(0xFF2D6A4F),
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }
        }

        // Plant Association Selector
        if (plants.isNotEmpty()) {
            Text(
                text = "Associate with Garden Plant (Optional):",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF1B4332)
            )

            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(plants) { plant ->
                    val isSelected = selectedPlant?.id == plant.id
                    Card(
                        shape = RoundedCornerShape(10.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = if (isSelected) Color(0xFF1B4332) else Color.White
                        ),
                        modifier = Modifier.clickable {
                            selectedPlant = if (isSelected) null else plant
                        }
                    ) {
                        Text(
                            text = plant.name,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = if (isSelected) Color.White else Color(0xFF1E293B),
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)
                        )
                    }
                }
            }
        }

        // CTA Button
        Button(
            onClick = {
                viewModel.runDiagnosis(
                    targetPlant = selectedPlant,
                    conditionOverride = selectedConditionPreset
                )
            },
            enabled = !isAnalyzing,
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1B4332)),
            shape = RoundedCornerShape(14.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(54.dp)
                .testTag("start_ai_diagnosis_button")
        ) {
            Icon(imageVector = Icons.Default.CameraAlt, contentDescription = null, tint = Color.White)
            Spacer(modifier = Modifier.width(10.dp))
            Text(
                text = if (isAnalyzing) "Analyzing Leaf..." else "Start AI Diagnosis",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
        }

        Spacer(modifier = Modifier.height(24.dp))
    }
}
