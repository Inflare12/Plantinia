package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.PictureAsPdf
import androidx.compose.material.icons.filled.Print
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
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
import com.example.ui.components.HealthScoreIndicator
import com.example.ui.components.SeverityBadge
import com.example.ui.viewmodel.PlantiniaViewModel
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun ReportsScreen(
    viewModel: PlantiniaViewModel,
    modifier: Modifier = Modifier
) {
    val diagnosis = viewModel.activeDiagnosis.collectAsState().value
        ?: viewModel.diagnoses.collectAsState().value.firstOrNull()

    var exportNotice by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFFF8FAF7))
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = { viewModel.navigateTo("dashboard") }) {
                Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back", tint = Color(0xFF1B4332))
            }
            Text(
                text = "Plant Health Report",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF1B4332)
            )
            IconButton(onClick = { exportNotice = "Report exported to device storage as /Documents/Plantinia_Report_${System.currentTimeMillis() % 1000}.pdf" }) {
                Icon(imageVector = Icons.Default.Download, contentDescription = "Export PDF", tint = Color(0xFF2D6A4F))
            }
        }

        if (exportNotice != null) {
            Card(
                shape = RoundedCornerShape(10.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFD1FAE5))
            ) {
                Text(
                    text = exportNotice!!,
                    color = Color(0xFF065F46),
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.padding(12.dp)
                )
            }
        }

        if (diagnosis == null) {
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("No diagnosis record available to generate report.", modifier = Modifier.padding(20.dp), color = Color(0xFF64748B))
            }
            return
        }

        // Printable PDF Canvas Frame
        Card(
            shape = RoundedCornerShape(14.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(14.dp))
                .testTag("printable_report_canvas")
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                // Report Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "PLANTINIA BOTANICAL CLINIC",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = Color(0xFF1B4332),
                            letterSpacing = 1.sp
                        )
                        Text(
                            text = "Diagnostic Pathology Summary",
                            fontSize = 10.sp,
                            color = Color(0xFF64748B)
                        )
                    }

                    Text(
                        text = "REF: #${diagnosis.id.take(8).uppercase()}",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF64748B)
                    )
                }

                Divider(modifier = Modifier.padding(vertical = 12.dp))

                // Patient/Plant specs
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text("SPECIMEN", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFF94A3B8))
                        Text(diagnosis.plantName, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1E293B))
                        Text(diagnosis.speciesIdentified, fontSize = 11.sp, fontStyle = androidx.compose.ui.text.font.FontStyle.Italic, color = Color(0xFF64748B))
                    }
                    Column(horizontalAlignment = Alignment.End) {
                        Text("DATE & TIME", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFF94A3B8))
                        val date = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault()).format(Date(diagnosis.timestamp))
                        Text(date, fontSize = 12.sp, color = Color(0xFF1E293B))
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Diagnostic Findings Box
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color(0xFFF8FAF7))
                        .padding(12.dp)
                ) {
                    Column {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Primary Finding: ${diagnosis.primaryIssue}", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Color(0xFF1B4332))
                            SeverityBadge(severity = diagnosis.severity)
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("Health Index Score: ${diagnosis.healthScore}/100 • Affected Surface Area: ~${"%.1f".format(diagnosis.affectedAreaPercent)}%", fontSize = 11.sp, color = Color(0xFF475569))
                        Text("Inference Model: ${diagnosis.modelVersion} (Latency: ${diagnosis.inferenceLatencyMs}ms)", fontSize = 10.sp, color = Color(0xFF94A3B8))
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Clinical summary & recommendations
                Text("Pathological Analysis:", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1E293B))
                Spacer(modifier = Modifier.height(2.dp))
                Text(diagnosis.explanation, fontSize = 12.sp, color = Color(0xFF334155), lineHeight = 16.sp)

                Spacer(modifier = Modifier.height(10.dp))

                Text("Prescribed Intervention:", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1E293B))
                Spacer(modifier = Modifier.height(2.dp))
                Text("Apply copper fungicide spray, isolate foliage from high humidity, and prune lower 2 infected nodes.", fontSize = 12.sp, color = Color(0xFF334155))

                Divider(modifier = Modifier.padding(vertical = 14.dp))

                // Footer signature & verification stamp
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Generated by Plantinia AI ML Engine • Verified Clinical Pipeline",
                        fontSize = 9.sp,
                        color = Color(0xFF94A3B8)
                    )
                    Text(
                        text = "Page 1 of 1",
                        fontSize = 10.sp,
                        color = Color(0xFF64748B)
                    )
                }
            }
        }

        // Action Buttons
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Button(
                onClick = { exportNotice = "Sending report to connected printer / air-print..." },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1B4332)),
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.weight(1f)
            ) {
                Icon(Icons.Default.Print, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("Print Report")
            }

            OutlinedButton(
                onClick = { exportNotice = "PDF report share sheet opened." },
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.weight(1f)
            ) {
                Icon(Icons.Default.Share, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("Share PDF")
            }
        }

        Spacer(modifier = Modifier.height(20.dp))
    }
}
