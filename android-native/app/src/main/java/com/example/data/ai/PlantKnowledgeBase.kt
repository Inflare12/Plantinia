package com.example.data.ai

import com.example.data.model.PlantSpecies

object PlantKnowledgeBase {

    data class DiseaseInfo(
        val name: String,
        val pathogenType: String, // "Fungal", "Bacterial", "Pest", "Physiological", "Nutrient"
        val commonHosts: List<String>,
        val symptoms: String,
        val organicTreatments: List<String>,
        val preventiveMeasures: List<String>,
        val doNotList: List<String>
    )

    val diseases = mapOf(
        "Early Blight" to DiseaseInfo(
            name = "Early Blight",
            pathogenType = "Fungal (Alternaria solani)",
            commonHosts = listOf("Tomato", "Potato", "Eggplant"),
            symptoms = "Target-board concentric dark brown circular spots starting on lower leaves, surrounded by yellow chlorotic halos.",
            organicTreatments = listOf(
                "Isolate the plant immediately and prune infected lower foliage with sterilized shears.",
                "Apply organic copper fungicide spray or potassium bicarbonate in early morning.",
                "Apply 1-inch layer of clean mulch over topsoil to prevent fungal spores from splashing up during watering."
            ),
            preventiveMeasures = listOf(
                "Water strictly at the soil base and avoid wetting foliage.",
                "Ensure at least 30-45 cm spacing between plants for adequate airflow.",
                "Rotate solanaceous crops on a 3-year cycle."
            ),
            doNotList = listOf(
                "DO NOT overhead sprinkle water onto wet foliage in late afternoon.",
                "DO NOT compost pruned diseased leaves in home compost piles.",
                "DO NOT work with wet plants as fungal spores spread rapidly via moisture."
            )
        ),
        "Powdery Mildew" to DiseaseInfo(
            name = "Powdery Mildew",
            pathogenType = "Fungal (Erysiphales)",
            commonHosts = listOf("Monstera", "Rose", "Basil", "Zucchini", "Cucumber"),
            symptoms = "White to dusty gray talcum-like patches coating upper leaf surfaces, causing leaf curling and reduced photosynthesis.",
            organicTreatments = listOf(
                "Wipe affected leaves gently with a diluted neem oil solution (1 tsp cold-pressed neem oil + 1/2 tsp mild soap per litre of warm water).",
                "Alternatively, spray a 40% milk and 60% water mixture in full sunlight to activate natural antiseptic proteins.",
                "Increase localized air movement with an oscillating fan."
            ),
            preventiveMeasures = listOf(
                "Reduce ambient relative humidity if stagnant.",
                "Keep plants in bright, well-ventilated positions.",
                "Maintain consistent soil moisture without waterlogging."
            ),
            doNotList = listOf(
                "DO NOT apply neem oil under harsh direct midday sun to avoid phytotoxic leaf burn.",
                "DO NOT overcrowd plants with dense touching canopies."
            )
        ),
        "Bacterial Leaf Spot" to DiseaseInfo(
            name = "Bacterial Leaf Spot",
            pathogenType = "Bacterial (Xanthomonas spp.)",
            commonHosts = listOf("Pepper", "Tomato", "Philodendron", "Begonia"),
            symptoms = "Angular, water-soaked dark lesions bounded by leaf veins, often developing necrotic centers.",
            organicTreatments = listOf(
                "Remove and bag affected leaves immediately.",
                "Apply fixed copper octanoate spray as a protective bacterial barrier.",
                "Sanitize pruners between every cut with 70% isopropyl alcohol."
            ),
            preventiveMeasures = listOf(
                "Ensure leaves stay dry using bottom-watering or drip irrigation.",
                "Quarantine newly purchased plants for 14 days.",
                "Improve soil drainage."
            ),
            doNotList = listOf(
                "DO NOT spray chemical fungicides expecting antibacterial eradication.",
                "DO NOT touch healthy leaves after touching infected leaves."
            )
        ),
        "Spider Mites" to DiseaseInfo(
            name = "Spider Mites",
            pathogenType = "Pest (Tetranychidae)",
            commonHosts = listOf("Fiddle Leaf Fig", "Calathea", "Palm", "Croton"),
            symptoms = "Fine stippling (tiny yellow pinprick dots) on leaf surfaces and delicate silky webbing in leaf axils.",
            organicTreatments = listOf(
                "Take plant into shower or garden and wash undersides of leaves with lukewarm pressurized water.",
                "Spray insecticidal soap or horticultural oil weekly for 3 weeks to break hatch cycles.",
                "Release beneficial predatory mites (Phytoseiulus persimilis) in enclosed greenhouses."
            ),
            preventiveMeasures = listOf(
                "Increase indoor ambient humidity above 55% as spider mites thrive in dry conditions.",
                "Mist foliage periodically with distilled water."
            ),
            doNotList = listOf(
                "DO NOT use broad-spectrum synthetic pyrethroids which wipe out natural mite predators.",
                "DO NOT leave dry dusty leaves uncleaned."
            )
        ),
        "Nutrient Deficiency" to DiseaseInfo(
            name = "Iron / Nitrogen Chlorosis",
            pathogenType = "Nutrient / Soil pH Imbalance",
            commonHosts = listOf("Gardenia", "Citrus", "Monstera", "Pothos"),
            symptoms = "Interveinal chlorosis (yellowing between green leaf veins) or pale yellow leaves progressing from bottom up.",
            organicTreatments = listOf(
                "Check soil pH; ensure it is between 6.0 and 6.8 for optimal nutrient uptake.",
                "Apply chelated iron foliar feed for immediate greening response.",
                "Top-dress container with balanced organic worm castings and compost tea."
            ),
            preventiveMeasures = listOf(
                "Use balanced organic fertilizer (N-P-K 3-1-2 or 10-10-10) during the active spring/summer growing season.",
                "Flush potting soil annually to prevent mineral salt build-up."
            ),
            doNotList = listOf(
                "DO NOT over-fertilize stressed or dormant winter plants.",
                "DO NOT assume yellowing is always a disease without checking watering and soil pH."
            )
        ),
        "Healthy" to DiseaseInfo(
            name = "Healthy Foliage",
            pathogenType = "None",
            commonHosts = listOf("All Plants"),
            symptoms = "Vibrant, turgid green leaves with intact cuticle and no sign of pest or fungal lesions.",
            organicTreatments = listOf(
                "Continue current routine care schedule.",
                "Dust leaves gently once a month to maximize light absorption."
            ),
            preventiveMeasures = listOf(
                "Monitor watering frequency according to seasonal temperature changes.",
                "Inspect leaf undersides weekly for early pest detection."
            ),
            doNotList = listOf(
                "DO NOT alter environmental factors abruptly."
            )
        )
    )

    val plantSpeciesList = listOf(
        PlantSpecies(
            id = "monstera_deliciosa",
            commonName = "Monstera Deliciosa",
            scientificName = "Monstera deliciosa",
            family = "Araceae",
            description = "Iconic Swiss Cheese Plant famous for dramatic natural leaf fenestrations. Native to tropical rainforests of southern Mexico.",
            sunlight = "Bright Indirect",
            watering = "Allow top 2 inches of soil to dry out between waterings",
            humidity = "60% - 80% (Prefers elevated humidity)",
            temperature = "18°C - 30°C",
            difficulty = "Easy",
            isIndoor = true,
            isPetSafe = false,
            propagation = "Stem cutting with node or aerial root in water",
            commonDiseases = listOf("Powdery Mildew", "Bacterial Leaf Spot", "Root Rot"),
            commonPests = listOf("Spider Mites", "Thrips", "Scale"),
            tags = listOf("Tropical", "Air Purifier", "Statement Plant", "Fenestrations")
        ),
        PlantSpecies(
            id = "fiddle_leaf_fig",
            commonName = "Fiddle Leaf Fig",
            scientificName = "Ficus lyrata",
            family = "Moraceae",
            description = "Stately indoor tree with violin-shaped leathery leaves that adds dramatic architectural beauty to bright spaces.",
            sunlight = "Bright Indirect to gentle morning sun",
            watering = "Water thoroughly when top 2-3 inches are completely dry",
            humidity = "50% - 65%",
            temperature = "18°C - 26°C",
            difficulty = "Moderate",
            isIndoor = true,
            isPetSafe = false,
            propagation = "Tip cutting in moist perlite under high humidity",
            commonDiseases = listOf("Bacterial Leaf Spot", "Root Rot", "Edema"),
            commonPests = listOf("Spider Mites", "Mealybugs"),
            tags = listOf("Architectural", "Indoor Tree", "Bright Light")
        ),
        PlantSpecies(
            id = "snake_plant",
            commonName = "Snake Plant",
            scientificName = "Dracaena trifasciata",
            family = "Asparagaceae",
            description = "Virtually indestructible succulent plant with architectural upright sword-like mottled leaves. Excellent NASA air filter.",
            sunlight = "Low to Bright Direct (Tolerates anything)",
            watering = "Allow soil to dry out completely (every 2-4 weeks)",
            humidity = "30% - 50% (Tolerates dry air easily)",
            temperature = "15°C - 32°C",
            difficulty = "Easy",
            isIndoor = true,
            isPetSafe = false,
            propagation = "Leaf cuttings or rhizome division",
            commonDiseases = listOf("Root Rot (Over-watering)"),
            commonPests = listOf("Mealybugs (rare)"),
            tags = listOf("Drought Tolerant", "Air Purifying", "Beginner Friendly", "Low Light")
        ),
        PlantSpecies(
            id = "tomato_plant",
            commonName = "Garden Tomato",
            scientificName = "Solanum lycopersicum",
            family = "Solanaceae",
            description = "Vigorous fruiting vegetable essential in home gardens. Highly productive when given adequate nutrition and direct sun.",
            sunlight = "Full Sun (6-8+ hours direct)",
            watering = "Deep, consistent watering; keep evenly moist",
            humidity = "40% - 70%",
            temperature = "20°C - 30°C",
            difficulty = "Moderate",
            isIndoor = false,
            isPetSafe = false,
            propagation = "Seeds or sucker stem cuttings",
            commonDiseases = listOf("Early Blight", "Late Blight", "Blossom End Rot", "Bacterial Canker"),
            commonPests = listOf("Hornworms", "Aphids", "Whiteflies"),
            tags = listOf("Edible", "Outdoor", "Fruit Bearing", "Sun Loving")
        ),
        PlantSpecies(
            id = "peace_lily",
            commonName = "Peace Lily",
            scientificName = "Spathiphyllum wallisii",
            family = "Araceae",
            description = "Elegant dark green glossy leaves with stately white flower spathes. Expressive communicator that droops visibly when thirsty.",
            sunlight = "Low to Medium Indirect",
            watering = "Water when top inch is dry; never let stand in saturated mud",
            humidity = "55% - 75%",
            temperature = "18°C - 28°C",
            difficulty = "Easy",
            isIndoor = true,
            isPetSafe = false,
            propagation = "Crown division during spring repotting",
            commonDiseases = listOf("Root Rot", "Leaf Tip Burn"),
            commonPests = listOf("Spider Mites", "Scale"),
            tags = listOf("Flowering", "Low Light", "Air Purifier", "Communicator")
        ),
        PlantSpecies(
            id = "golden_pothos",
            commonName = "Golden Pothos",
            scientificName = "Epipremnum aureum",
            family = "Araceae",
            description = "Fast-growing trailing vine with heart-shaped variegated green and yellow leaves. Perfect for hanging baskets or moss poles.",
            sunlight = "Low to Bright Indirect",
            watering = "Allow top 50% of soil to dry out",
            humidity = "40% - 60%",
            temperature = "17°C - 30°C",
            difficulty = "Easy",
            isIndoor = true,
            isPetSafe = false,
            propagation = "Water rooting of node stem cuttings",
            commonDiseases = listOf("Root Rot"),
            commonPests = listOf("Mealybugs"),
            tags = listOf("Trailing", "Beginner Friendly", "Fast Growing", "Hanging Basket")
        ),
        PlantSpecies(
            id = "sweet_basil",
            commonName = "Sweet Basil",
            scientificName = "Ocimum basilicum",
            family = "Lamiaceae",
            description = "Aromatic culinary herb with tender lush green leaves. Thrives on kitchen windowsills and sunny herb gardens.",
            sunlight = "Full Sun to Bright Direct (6+ hours)",
            watering = "Keep soil consistently moist but free-draining",
            humidity = "40% - 60%",
            temperature = "20°C - 32°C",
            difficulty = "Easy",
            isIndoor = true,
            isPetSafe = true,
            propagation = "Seeds or stem tip cuttings in water",
            commonDiseases = listOf("Downy Mildew", "Fusarium Wilt", "Bacterial Leaf Spot"),
            commonPests = listOf("Aphids", "Slugs"),
            tags = listOf("Pet Safe", "Culinary", "Fragrant", "Sun Loving")
        ),
        PlantSpecies(
            id = "spider_plant",
            commonName = "Spider Plant",
            scientificName = "Chlorophytum comosum",
            family = "Asparagaceae",
            description = "Playful, arching variegated ribbon leaves that produce miniature spiderette baby plantlets. Completely non-toxic to cats and dogs.",
            sunlight = "Bright Indirect",
            watering = "Water when top 1 inch feels dry",
            humidity = "40% - 60%",
            temperature = "15°C - 27°C",
            difficulty = "Easy",
            isIndoor = true,
            isPetSafe = true,
            propagation = "Planting spiderette plantlets directly in moist soil",
            commonDiseases = listOf("Tip Burn (from fluoride/chlorine in tap water)"),
            commonPests = listOf("Scale", "Aphids"),
            tags = listOf("Pet Safe", "Baby Plantlets", "Air Purifier", "Easy Care")
        )
    )
}
