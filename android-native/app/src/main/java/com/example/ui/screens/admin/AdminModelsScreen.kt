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
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material.icons.filled.Undo
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
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
import com.example.data.model.ModelRegistryItem
import com.example.ui.viewmodel.PlantiniaViewModel

@Composable
fun AdminModelsScreen(
    viewModel: PlantiniaViewModel,
    modifier: Modifier = Modifier
) {
    val models by viewModel.adminMlRepo.models.collectAsState()
    var modelToPromote by remember { mutableStateOf<ModelRegistryItem?>(null) }
    var modelToRollback by remember { mutableStateOf<ModelRegistryItem?>(null) }

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
            IconButton(onClick = { viewModel.navigateTo("admin_dashboard") }) {
                Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back", tint = Color(0xFF1B4332))
            }
            Column {
                Text(
                    text = "Model Registry & Deployment",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF1B4332)
                )
                Text(
                    text = "Strict quality gates, promotion to production & rollbacks",
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
            items(models) { model ->
                ModelItemCard(
                    model = model,
                    onPromote = { modelToPromote = model },
                    onRollback = { modelToRollback = model }
                )
            }

            item { Spacer(modifier = Modifier.height(20.dp)) }
        }
    }

    // Explicit Promotion Confirmation Dialog (Mandated by safety quality gates)
    if (modelToPromote != null) {
        val m = modelToPromote!!
        AlertDialog(
            onDismissRequest = { modelToPromote = null },
            title = { Text("Promote Model to PRODUCTION?") },
            text = {
                Text("Are you sure you want to promote ${m.name} (${m.version}) to live production traffic? Current production model will be archived. Verified: mAP50 = ${m.map50} (>= 0.90 gate).")
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.adminMlRepo.promoteModel(m.id)
                        modelToPromote = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1B4332))
                ) {
                    Text("Promote to Production")
                }
            },
            dismissButton = {
                TextButton(onClick = { modelToPromote = null }) {
                    Text("Cancel")
                }
            }
        )
    }

    // Rollback Confirmation Dialog
    if (modelToRollback != null) {
        val m = modelToRollback!!
        AlertDialog(
            onDismissRequest = { modelToRollback = null },
            title = { Text("Emergency Rollback?") },
            text = {
                Text("Revert production inference to ${m.name} (${m.version})? This will immediately switch the runtime pipeline.")
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.adminMlRepo.rollbackToModel(m.id)
                        modelToRollback = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFDC2626))
                ) {
                    Text("Confirm Rollback")
                }
            },
            dismissButton = {
                TextButton(onClick = { modelToRollback = null }) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
fun ModelItemCard(
    model: ModelRegistryItem,
    onPromote: () -> Unit,
    onRollback: () -> Unit
) {
    val isProd = model.status == "PRODUCTION"

    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isProd) Color(0xFFEFFDF5) else Color.White
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
        modifier = Modifier.fillMaxWidth().testTag("model_card_${model.id}")
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = model.name,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF1B4332)
                    )
                    Text(
                        text = "${model.architecture} • ${model.version}",
                        fontSize = 12.sp,
                        color = Color(0xFF64748B)
                    )
                }

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(
                            when (model.status) {
                                "PRODUCTION" -> Color(0xFF10B981)
                                "STAGING" -> Color(0xFFF59E0B)
                                else -> Color(0xFF94A3B8)
                            }
                        )
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = model.status,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Metrics Grid
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text("mAP@50", fontSize = 10.sp, color = Color(0xFF94A3B8))
                    Text("${model.map50}", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1E293B))
                }
                Column {
                    Text("Precision", fontSize = 10.sp, color = Color(0xFF94A3B8))
                    Text("${model.precision}", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1E293B))
                }
                Column {
                    Text("Recall", fontSize = 10.sp, color = Color(0xFF94A3B8))
                    Text("${model.recall}", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1E293B))
                }
                Column {
                    Text("Latency", fontSize = 10.sp, color = Color(0xFF94A3B8))
                    Text("${model.inferenceTimeMs}ms", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color(0xFF2D6A4F))
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Actions
            if (!isProd) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = onPromote,
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1B4332)),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(1f).testTag("promote_button_${model.id}")
                    ) {
                        Text("Promote to Prod", fontSize = 12.sp)
                    }

                    if (model.status == "ARCHIVED") {
                        OutlinedButton(
                            onClick = onRollback,
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.weight(1f).testTag("rollback_button_${model.id}")
                        ) {
                            Text("Rollback Here", fontSize = 12.sp)
                        }
                    }
                }
            }
        }
    }
}
