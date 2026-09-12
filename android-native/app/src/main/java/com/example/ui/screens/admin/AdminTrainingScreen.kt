package com.example.ui.screens.admin

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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.OutlinedTextField
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
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.TrainingJob
import com.example.ui.viewmodel.PlantiniaViewModel

@Composable
fun AdminTrainingScreen(
    viewModel: PlantiniaViewModel,
    modifier: Modifier = Modifier
) {
    val jobs by viewModel.adminMlRepo.trainingJobs.collectAsState()
    var showStartDialog by remember { mutableStateOf(false) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFFF8FAF7))
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = { viewModel.navigateTo("admin_dashboard") }) {
                    Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back", tint = Color(0xFF1B4332))
                }
                Text(
                    text = "Training Pipelines",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF1B4332)
                )
            }

            Button(
                onClick = { showStartDialog = true },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1B4332)),
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.testTag("start_training_job_button")
            ) {
                Icon(Icons.Default.PlayArrow, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("New Job", fontSize = 12.sp)
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(14.dp),
            modifier = Modifier.weight(1f)
        ) {
            items(jobs) { job ->
                TrainingJobCard(job = job)
            }
            item { Spacer(modifier = Modifier.height(20.dp)) }
        }
    }

    if (showStartDialog) {
        var epochs by remember { mutableStateOf("60") }
        var batchSize by remember { mutableStateOf("16") }
        var lr by remember { mutableStateOf("0.001") }
        var architecture by remember { mutableStateOf("YOLOv8x-Detection") }

        AlertDialog(
            onDismissRequest = { showStartDialog = false },
            title = { Text("Launch YOLO Training Run", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = architecture,
                        onValueChange = { architecture = it },
                        label = { Text("Architecture") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = epochs,
                        onValueChange = { epochs = it },
                        label = { Text("Epochs") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = batchSize,
                        onValueChange = { batchSize = it },
                        label = { Text("Batch Size") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = lr,
                        onValueChange = { lr = it },
                        label = { Text("Learning Rate (lr0)") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.adminMlRepo.startTrainingJob(
                            datasetVersion = "v2.1",
                            architecture = architecture,
                            epochs = epochs.toIntOrNull() ?: 50,
                            batchSize = batchSize.toIntOrNull() ?: 16,
                            imgSize = 640,
                            lr = lr.toDoubleOrNull() ?: 0.001
                        )
                        showStartDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1B4332))
                ) {
                    Text("Queue Run")
                }
            },
            dismissButton = {
                TextButton(onClick = { showStartDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
fun TrainingJobCard(job: TrainingJob) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
        modifier = Modifier.fillMaxWidth().testTag("job_card_${job.id}")
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "${job.modelArchitecture} (${job.id})",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF1B4332)
                    )
                    Text(
                        text = "Dataset: ${job.datasetVersion} • ${job.device}",
                        fontSize = 11.sp,
                        color = Color(0xFF64748B)
                    )
                }

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(if (job.status == "RUNNING") Color(0xFFDBEAFE) else Color(0xFFE8F5E9))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = job.status,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (job.status == "RUNNING") Color(0xFF1E40AF) else Color(0xFF2E7D32)
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Metrics row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text("Progress", fontSize = 10.sp, color = Color(0xFF94A3B8))
                    Text("${job.currentEpoch}/${job.epochs} eps", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                }
                Column {
                    Text("Train Loss", fontSize = 10.sp, color = Color(0xFF94A3B8))
                    Text("${"%.3f".format(job.trainLoss)}", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color(0xFF059669))
                }
                Column {
                    Text("Val Loss", fontSize = 10.sp, color = Color(0xFF94A3B8))
                    Text("${"%.3f".format(job.valLoss)}", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color(0xFF059669))
                }
                Column {
                    Text("mAP@50", fontSize = 10.sp, color = Color(0xFF94A3B8))
                    Text("${job.map50 ?: "—"}", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1B4332))
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Log Console Box
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(8.dp))
                    .background(Color(0xFF0F172A))
                    .padding(10.dp)
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                    job.logs.takeLast(3).forEach { logLine ->
                        Text(
                            text = "> $logLine",
                            fontFamily = FontFamily.Monospace,
                            fontSize = 10.sp,
                            color = Color(0xFF38BDF8)
                        )
                    }
                }
            }
        }
    }
}
