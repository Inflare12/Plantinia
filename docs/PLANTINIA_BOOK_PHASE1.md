# Plantinia Book — Phase 1 Research Record

This document records the first research pass supplied to the Plantinia project. It is a research working record, not a claim that every individual source or treatment has already been independently re-verified.

## Research rules

1. Identify the subject precisely.
2. Prefer multiple independent reliable sources.
3. Cross-check important claims where possible.
4. Record source title, author/organisation, year, URL, source type, and supported information.
5. Separate established facts from uncertainty and contradictions.
6. Use plain-language explanations alongside scientific terminology.
7. Never fabricate a source, URL, scientific name, diagnosis, or treatment.
8. Use evidence grades: VERY STRONG, STRONG, MODERATE, LIMITED, TRADITIONAL, ANECDOTAL, UNCERTAIN.
9. Preserve the rule **SYMPTOM != DIAGNOSIS**.

## Proposed knowledge taxonomy

```text
Plant
 ├── Identity
 ├── Identification
 ├── Growing Conditions
 ├── Care
 ├── Diseases
 │    ├── Symptoms
 │    ├── Causes
 │    ├── Differential Diagnosis
 │    ├── Management
 │    └── Evidence
 ├── Pests
 ├── Nutrient Problems
 ├── Environmental Stress
 ├── Toxicity
 └── Sources
```

## Phase 1 plant coverage

- Tomato — *Solanum lycopersicum*
- Potato — *Solanum tuberosum*
- Chilli/Pepper — *Capsicum annuum*
- Rose — *Rosa* spp.
- Mango — *Mangifera indica*
- Lemon/Citrus — *Citrus × limon*
- Pothos/Money Plant — *Epipremnum aureum*
- Snake Plant — *Dracaena trifasciata*
- Monstera — *Monstera deliciosa*

Remaining Phase 2 plants: Peace Lily, Aloe Vera, Basil, Mint, Spider Plant, Jade Plant, Hibiscus, Marigold, Bougainvillea, Neem, and Tulsi.

## Topics covered in Phase 1

The initial research contains identity/origin/identification/care information plus selected diseases, pests, stress and toxicity information for the nine plants above. It also includes dedicated working entries for:

- Tomato diseases and pests, including blights, bacterial diseases, fungal diseases, viral diseases, aphids, whiteflies, caterpillar pests and physiological stresses.
- Potato late/early blight, wart disease, powdery scab, common scab, insect pests and nutrient problems.
- Pepper/chilli anthracnose, Phytophthora blight, bacterial wilt, bacterial spot, blossom-end rot and common pests.
- Rose black spot, powdery mildew, rust, mosaic/rosette viruses and common pests/stresses.
- Mango anthracnose, powdery mildew, bacterial/algal problems, fruit rots and major insect pests.
- Citrus greening/HLB, canker, tristeza, gummosis, scab, sooty mold, psyllid, leafminer and nutrient issues.
- Pothos bacterial/root/stem problems and common pests.
- Snake plant root/leaf/stem problems and common pests.
- Monstera leaf/root problems and common pests.

Dedicated examples were also created for late blight, rose black spot, Colorado potato beetle and the symptom "yellow leaves / chlorosis".

## Diagnostic reasoning example

Yellow leaves are explicitly treated as a symptom rather than a diagnosis. Candidate causes can include nutrient deficiency, watering/root problems, disease, aging, light limitations, temperature stress and root damage. The intended AI should ask discriminating questions such as leaf age, uniform vs interveinal yellowing, spots/lesions, onset, watering changes, soil moisture, light/temperature changes, and whether other plants are affected.

## AI architecture principle

The Plantinia Book should remain a factual/evidence layer. The intended production reasoning path is:

```text
Vision model
    ↓
Observed visual features / predictions
    ↓
Plantinia Book + retrieval
    ↓
Evidence and candidate causes
    ↓
Reasoning model
    ↓
Dr. Flora response
```

The small LLM should not be expected to memorize the entire botanical knowledge base. Retrieval and structured evidence should remain the source of truth.

## Phase 2 research queue

- Remaining 11 core plants.
- Early blight, powdery mildew, citrus greening, rose rosette virus, bacterial wilt.
- Aphids, spider mites, mealybugs, fruit flies and whiteflies.
- Brown leaves, wilting, leaf spots, root rot, stunting and leaf drop.
- N/P/K/Mg/Ca/Fe/S/Zn/Mn/B/Cu/Mo nutrient problems.
- Overwatering, underwatering, heat, cold, sunburn and transplant shock.
- Evidence-graded treatment and prevention compendium.
- Careful evaluation of home/organic remedies, including limits and safety.

## Training data rule

Only validated/structured research should become supervised LLM training data. Raw research text should not be blindly converted into model targets. Contradictions and uncertainty should be retained so Plantinia learns to avoid overconfident diagnosis.
