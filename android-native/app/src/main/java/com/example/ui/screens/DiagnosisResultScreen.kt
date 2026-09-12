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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.HelpOutline
import androidx.compose.material.icons.filled.QuestionMark
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.ThumbDown
import androidx.compose.material.icons.filled.ThumbUp
import androidx.compose.material.icons.filled.WarningAmber
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
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
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.R
import com.example.data.model.BoundingBox
import com.example.ui.components.BoundingBoxOverlay
import com.example.ui.components.HealthScoreIndicator
import com.example.ui.components.SeverityBadge
import com.example.ui.viewmodel.PlantiniaViewModel
import org.json.JSONArray

@Composable
fun DiagnosisResultScreen(
    viewModel: PlantiniaViewModel,
    modifier: Modifier = Modifier
) {
    val diagnosis by viewModel.activeDiagnosis.collectAsState()

    if (diagnosis == null) {
        Box(modifier = modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("No active diagnosis result.")
        }
        return
    }

    val result = diagnosis!!
    var feedbackGiven by remember { mutableStateOf(result.feedbackStatus != null) }
    var selectedFeedbackVerdict by remember { mutableStateOf(result.feedbackStatus) }

    // Parse JSON arrays
    val treatmentSteps = remember(result.treatmentStepsJson) {
        try {
            val arr = JSONArray(result.treatmentStepsJson)
            (0 until arr.length()).map { arr.getString(it) }
        } catch (e: Exception) {
            listOf("Isolate plant", "Prune affected leaves", "Apply organic spray")
        }
    }

    val doNotList = remember(result.doNotListJson) {
        try {
            val arr = JSONArray(result.doNotListJson)
            (0 until arr.length()).map { arr.getString(it) }
        } catch (e: Exception) {
            listOf("DO NOT overhead mist foliage.", "DO NOT use harsh chemical pesticides indoors.")
        }
    }

    val preventiveActions = remember(result.preventiveActionsJson) {
        try {
            val arr = JSONArray(result.preventiveActionsJson)
            (0 until arr.length()).map { arr.getString(it) }
        } catch (e: Exception) {
            listOf("Improve ventilation", "Water soil base only")
        }
    }

    val boundingBoxes = listOf(
        BoundingBox(0.28f, 0.32f, 0.58f, 0.62f, result.primaryIssue),
        BoundingBox(0.62f, 0.44f, 0.82f, 0.76f, result.primaryIssue)
    )

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFFF8FAF7))
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Top navigation row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = { viewModel.navigateTo("dashboard") }) {
                Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back", tint = Color(0xFF1B4332))
            }
            Text(
                text = "Diagnosis Report",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF1B4332)
            )
            IconButton(onClick = { viewModel.navigateTo("reports") }) {
                Icon(imageVector = Icons.Default.Description, contentDescription = "PDF Report", tint = Color(0xFF2D6A4F))
            }
        }

        // Bounding Box Visual Inspection Canvas
        Card(
            shape = RoundedCornerShape(18.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
            modifier = Modifier.fillMaxWidth().testTag("diagnosis_result_card")
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                BoundingBoxOverlay(
                    imageRes = R.drawable.sample_plant_leaf,
                    boxes = if (result.primaryIssue == "Healthy") emptyList() else boundingBoxes
                )

                Spacer(modifier = Modifier.height(14.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = result.primaryIssue,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF1B4332)
                        )
                        Text(
                            text = "Species: ${result.speciesIdentified} (${"%.0f".format(result.speciesConfidence * 100)}% match)",
                            fontSize = 13.sp,
                            color = Color(0xFF64748B)
                        )
                    }

                    SeverityBadge(severity = result.severity)
                }
            }
        }

        // Key Metrics Summary Row (Health Score, Affected Area, Inference Latency)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                modifier = Modifier.weight(1f)
            ) {
                Column(
                    modifier = Modifier.padding(12.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    HealthScoreIndicator(score = result.healthScore, sizeDp = 62)
                    Spacer(modifier = Modifier.height(6.dp))
                    Text("Health Index", fontSize = 11.sp, color = Color(0xFF64748B), fontWeight = FontWeight.Bold)
                }
            }

            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                modifier = Modifier.weight(1f)
            ) {
                Column(
                    modifier = Modifier.padding(12.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "~${"%.1f".format(result.affectedAreaPercent)}%",
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFEA580C)
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text("Affected Area", fontSize = 11.sp, color = Color(0xFF64748B), fontWeight = FontWeight.Bold)
                    Text("2 leaf clusters", fontSize = 10.sp, color = Color(0xFF94A3B8))
                }
            }

            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                modifier = Modifier.weight(1f)
            ) {
                Column(
                    modifier = Modifier.padding(12.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "${result.inferenceLatencyMs}ms",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF2D6A4F)
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text("Inference Time", fontSize = 11.sp, color = Color(0xFF64748B), fontWeight = FontWeight.Bold)
                    Text(result.modelVersion, fontSize = 9.sp, color = Color(0xFF94A3B8), maxLines = 1)
                }
            }
        }

        // Scientific Explanation
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Pathology Explanation",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF1B4332)
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = result.explanation,
                    fontSize = 13.sp,
                    color = Color(0xFF334155),
                    lineHeight = 19.sp
                )
            }
        }

        // Treatment Plan: What to Do
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(24.dp)
                            .clip(CircleShape)
                            .background(Color(0xFFD8F3DC)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(imageVector = Icons.Default.Check, contentDescription = null, tint = Color(0xFF1B4332), modifier = Modifier.size(14.dp))
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Treatment Steps (What to Do)",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF1B4332)
                    )
                }
                Spacer(modifier = Modifier.height(10.dp))
                treatmentSteps.forEachIndexed { index, step ->
                    Row(modifier = Modifier.padding(vertical = 4.dp)) {
                        Text("${index + 1}. ", fontWeight = FontWeight.Bold, color = Color(0xFF2D6A4F), fontSize = 13.sp)
                        Text(step, fontSize = 13.sp, color = Color(0xFF334155), lineHeight = 18.sp)
                    }
                }
            }
        }

        // Precautions: What NOT to Do
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFFFFFBEB)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(24.dp)
                            .clip(CircleShape)
                            .background(Color(0xFFFDE68A)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = null, tint = Color(0xFFB45309), modifier = Modifier.size(14.dp))
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "What NOT to Do (Safety Precautions)",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFB45309)
                    )
                }
                Spacer(modifier = Modifier.height(10.dp))
                doNotList.forEach { caution ->
                    Row(modifier = Modifier.padding(vertical = 3.dp)) {
                        Text("• ", fontWeight = FontWeight.Bold, color = Color(0xFFB45309), fontSize = 13.sp)
                        Text(caution, fontSize = 13.sp, color = Color(0xFF92400E), lineHeight = 18.sp)
                    }
                }
            }
        }

        // Preventive Actions & Follow-up
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Follow-up Recommendation",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF1B4332)
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "Inspect and re-scan this specimen in ${result.followUpDays} days to assess treatment containment. A reminder has been queued in your Care Calendar.",
                    fontSize = 13.sp,
                    color = Color(0xFF64748B),
                    lineHeight = 18.sp
                )
            }
        }

        // Feedback / Active Learning Section
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFFF1F5F9)),
            modifier = Modifier.fillMaxWidth().testTag("diagnosis_feedback_section")
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Was this AI diagnosis helpful?",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = Color(0xFF1E293B)
                )
                Spacer(modifier = Modifier.height(10.dp))

                if (feedbackGiven) {
                    Text(
                        text = "✓ Feedback recorded (${selectedFeedbackVerdict}). Dispatched to Active Learning Review queue.",
                        fontSize = 12.sp,
                        color = Color(0xFF10B981),
                        fontWeight = FontWeight.SemiBold
                    )
                } else {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Button(
                            onClick = {
                                viewModel.submitFeedback("CORRECT")
                                feedbackGiven = true
                                selectedFeedbackVerdict = "CORRECT"
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2D6A4F)),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Icon(imageVector = Icons.Default.ThumbUp, contentDescription = null, modifier = Modifier.size(14.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Correct", fontSize = 12.sp)
                        }

                        Button(
                            onClick = {
                                viewModel.submitFeedback("INCORRECT")
                                feedbackGiven = true
                                selectedFeedbackVerdict = "INCORRECT"
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFDC2626)),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Icon(imageVector = Icons.Default.ThumbDown, contentDescription = null, modifier = Modifier.size(14.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Incorrect", fontSize = 12.sp)
                        }

                        OutlinedButton(
                            onClick = {
                                viewModel.submitFeedback("NOT_SURE")
                                feedbackGiven = true
                                selectedFeedbackVerdict = "NOT_SURE"
                            },
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text("Not Sure", fontSize = 12.sp)
                        }
                    }
                }
            }
        }

        // Action Buttons (Ask AI Assistant + Back)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Button(
                onClick = { viewModel.navigateTo("assistant") },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1B4332)),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.weight(1f).height(48.dp).testTag("ask_ai_assistant_followup_button")
            ) {
                Text("Ask AI About This", fontWeight = FontWeight.Bold)
            }

            OutlinedButton(
                onClick = { viewModel.navigateTo("dashboard") },
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.weight(1f).height(48.dp)
            ) {
                Text("Done")
            }
        }

        Spacer(modifier = Modifier.height(30.dp))
    }
}
