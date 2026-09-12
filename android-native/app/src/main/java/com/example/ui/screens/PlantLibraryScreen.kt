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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.FilterAlt
import androidx.compose.material.icons.filled.Pets
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.WaterDrop
import androidx.compose.material.icons.filled.WbSunny
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.PlantSpecies
import com.example.ui.viewmodel.PlantiniaViewModel

@Composable
fun PlantLibraryScreen(
    viewModel: PlantiniaViewModel,
    modifier: Modifier = Modifier
) {
    val searchQuery by viewModel.librarySearchQuery.collectAsState()
    val difficultyFilter by viewModel.selectedDifficultyFilter.collectAsState()
    val petSafeOnly by viewModel.petSafeOnlyFilter.collectAsState()

    val filteredSpecies = viewModel.getFilteredSpecies()
    var selectedSpeciesForModal by remember { mutableStateOf<PlantSpecies?>(null) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFFF8FAF7))
            .padding(16.dp)
    ) {
        // Search & Filter Header
        Text(
            text = "Botanical Encyclopedia",
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF1B4332)
        )
        Spacer(modifier = Modifier.height(2.dp))
        Text(
            text = "Comprehensive botanical database with disease vulnerabilities, lighting, and watering profiles.",
            fontSize = 12.sp,
            color = Color(0xFF64748B)
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Search bar
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { viewModel.setLibrarySearchQuery(it) },
            leadingIcon = { Icon(imageVector = Icons.Default.Search, contentDescription = null, tint = Color(0xFF64748B)) },
            placeholder = { Text("Search by name, species, or tag...", fontSize = 13.sp) },
            shape = RoundedCornerShape(14.dp),
            modifier = Modifier
                .fillMaxWidth()
                .testTag("library_search_field")
        )

        Spacer(modifier = Modifier.height(10.dp))

        // Filter chips (Easy, Moderate, Pet Safe)
        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            item {
                FilterChip(
                    selected = difficultyFilter == null && !petSafeOnly,
                    onClick = {
                        viewModel.setDifficultyFilter(null)
                        if (petSafeOnly) viewModel.togglePetSafeFilter()
                    },
                    label = { Text("All") },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = Color(0xFF1B4332),
                        selectedLabelColor = Color.White
                    )
                )
            }
            item {
                FilterChip(
                    selected = difficultyFilter == "Easy",
                    onClick = {
                        viewModel.setDifficultyFilter(if (difficultyFilter == "Easy") null else "Easy")
                    },
                    label = { Text("Easy Care") },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = Color(0xFF2D6A4F),
                        selectedLabelColor = Color.White
                    )
                )
            }
            item {
                FilterChip(
                    selected = petSafeOnly,
                    onClick = { viewModel.togglePetSafeFilter() },
                    leadingIcon = { Icon(imageVector = Icons.Default.Pets, contentDescription = null, modifier = Modifier.size(14.dp)) },
                    label = { Text("Pet Safe") },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = Color(0xFF10B981),
                        selectedLabelColor = Color.White
                    )
                )
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Results list
        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(10.dp),
            modifier = Modifier.weight(1f)
        ) {
            items(filteredSpecies) { species ->
                Card(
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { selectedSpeciesForModal = species }
                        .testTag("species_card_${species.id}")
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = species.commonName,
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF1B4332)
                                )
                                Text(
                                    text = "${species.scientificName} • ${species.family}",
                                    fontSize = 12.sp,
                                    color = Color(0xFF64748B),
                                    fontStyle = androidx.compose.ui.text.font.FontStyle.Italic
                                )
                            }

                            if (species.isPetSafe) {
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(Color(0xFFE8F5E9))
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text("Pet Safe", fontSize = 10.sp, color = Color(0xFF2E7D32), fontWeight = FontWeight.Bold)
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        Text(
                            text = species.description,
                            fontSize = 12.sp,
                            color = Color(0xFF475569),
                            maxLines = 2
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.WbSunny, contentDescription = null, tint = Color(0xFFD97706), modifier = Modifier.size(13.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(species.sunlight, fontSize = 11.sp, color = Color(0xFF64748B))
                            }
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.WaterDrop, contentDescription = null, tint = Color(0xFF2563EB), modifier = Modifier.size(13.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(species.difficulty, fontSize = 11.sp, color = Color(0xFF64748B))
                            }
                        }
                    }
                }
            }

            item { Spacer(modifier = Modifier.height(20.dp)) }
        }
    }

    // Modal Details Dialog
    if (selectedSpeciesForModal != null) {
        val sp = selectedSpeciesForModal!!
        AlertDialog(
            onDismissRequest = { selectedSpeciesForModal = null },
            title = {
                Column {
                    Text(sp.commonName, fontWeight = FontWeight.Bold, color = Color(0xFF1B4332))
                    Text(sp.scientificName, fontSize = 12.sp, fontStyle = androidx.compose.ui.text.font.FontStyle.Italic, color = Color(0xFF64748B))
                }
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(sp.description, fontSize = 13.sp, color = Color(0xFF334155))
                    Divider(modifier = Modifier.padding(vertical = 4.dp))
                    Text("• Sunlight: ${sp.sunlight}", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    Text("• Watering: ${sp.watering}", fontSize = 12.sp)
                    Text("• Humidity: ${sp.humidity}", fontSize = 12.sp)
                    Text("• Propagation: ${sp.propagation}", fontSize = 12.sp)
                    Text("• Common Diseases: ${sp.commonDiseases.joinToString(", ")}", fontSize = 12.sp, color = Color(0xFFDC2626))
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.addPlant(
                            name = sp.commonName,
                            species = sp.scientificName,
                            location = if (sp.isIndoor) "Living Room" else "Garden Bed",
                            isIndoor = sp.isIndoor,
                            sunlight = sp.sunlight,
                            wateringDays = 7
                        )
                        selectedSpeciesForModal = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1B4332))
                ) {
                    Text("Add to My Garden")
                }
            },
            dismissButton = {
                TextButton(onClick = { selectedSpeciesForModal = null }) {
                    Text("Close")
                }
            }
        )
    }
}
