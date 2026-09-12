import {
  IAIEngine,
  DiagnosisInput,
  DiagnosisOutput,
  IdentifyInput,
  IdentifyOutput,
  ChatInput,
  ChatOutput,
} from './types';

export class MockAIEngine implements IAIEngine {
  name = 'plantinia-botanic-neural-mock';

  async diagnosePlant(input: DiagnosisInput): Promise<DiagnosisOutput> {
    const hint = (input.plantSpeciesHint || input.notes || '').toLowerCase();

    if (hint.includes('rose') || hint.includes('black spot')) {
      return {
        identifiedSpecies: 'Rosa gallica (Garden Rose)',
        diseaseName: 'Black Spot (Diplocarpon rosae)',
        pathogenType: 'fungal',
        confidence: 94.8,
        severity: 'moderate',
        symptoms: [
          'Circular black spots with feathery edges on upper foliage',
          'Yellowing of surrounding tissue and early leaf drop',
          'Stems show purplish-red blister-like spots',
        ],
        causes: [
          'Prolonged leaf moisture (>7 hours wetness)',
          'High relative humidity and warm temperatures (20°C–25°C)',
          'Overhead sprinkler irrigation wetting foliage',
        ],
        prognosis: 'Good if treated promptly. Fungus spreads via water splash but roots remain unaffected.',
        treatmentSteps: [
          {
            stepNumber: 1,
            title: 'Sanitation',
            instruction: 'Strip all infected leaves from the plant and pick up all fallen debris from soil. Bag and discard.',
            frequency: 'Immediate',
          },
          {
            stepNumber: 2,
            title: 'Fungicidal Spray',
            instruction: 'Apply neem oil or sulfur-based bio-fungicide thoroughly covering tops and undersides of remaining foliage.',
            frequency: 'Every 7-10 days',
          },
          {
            stepNumber: 3,
            title: 'Water Management',
            instruction: 'Water solely at the soil base in early morning. Avoid getting water on the leaves.',
            frequency: 'Permanent practice',
          },
        ],
        organicRemedies: [
          'Neem Oil Solution: 5ml cold-pressed neem oil + 2ml baby shampoo in 1L water.',
          'Baking Soda Spray: 1 teaspoon baking soda + few drops of horticultural soap in 1L water.',
        ],
        chemicalRemedies: [
          {
            name: 'Rose Shield / Mancozeb Fungicide',
            activeIngredient: 'Mancozeb 75% WP',
            approximateCost: '₹320 / $7.50',
            instructions: 'Mix 2g/L water. Spray foliage until dripping.',
          },
          {
            name: 'Bio-Fungicide Bacillus subtilis',
            activeIngredient: 'Bacillus subtilis strain QST 713',
            approximateCost: '₹450 / $9.00',
            instructions: 'Organic biological preventative foliar spray.',
          },
        ],
        preventativeMeasures: [
          'Prune inner canes each spring to promote open vase shape with maximum airflow.',
          'Always disinfect pruners between cuts with 70% alcohol.',
        ],
        boundingBoxes: [
          { x: 28, y: 32, width: 34, height: 30, label: 'Diplocarpon Lesion' },
          { x: 62, y: 48, width: 22, height: 24, label: 'Chlorotic Margin' },
        ],
        aiProviderUsed: 'mock-botanic-v1',
      };
    }

    if (hint.includes('monstera') || hint.includes('yellow') || hint.includes('rot')) {
      return {
        identifiedSpecies: 'Monstera deliciosa (Swiss Cheese Plant)',
        diseaseName: 'Early Stage Root Stress & Edema',
        pathogenType: 'environmental',
        confidence: 91.5,
        severity: 'mild',
        symptoms: [
          'Lower foliage turning pale lime-green with slight chlorotic leaf margins',
          'Loss of turgor pressure in petiole stems',
          'Slowed drainage through pot substrate',
        ],
        causes: [
          'Water retention in the root ball from compacted potting mix or insufficient drainage holes',
          'Low light reducing transpiration rate while watering frequency remained constant',
        ],
        prognosis: 'Excellent. No systemic fungal pathogen detected. Adjusting moisture and aeration will reverse yellowing.',
        treatmentSteps: [
          {
            stepNumber: 1,
            title: 'Moisture Audit',
            instruction: 'Insert wooden chopstick 3 inches into soil. Withhold water until top 50% feels dry.',
            frequency: 'Immediate',
          },
          {
            stepNumber: 2,
            title: 'Substrate Aeration',
            instruction: 'Gently poke 5-6 holes into soil surface using a sterile probe to increase oxygen to root tips.',
            frequency: 'Once',
          },
          {
            stepNumber: 3,
            title: 'Light Adjustment',
            instruction: 'Move 2 feet closer to an east or south-facing window with filtered bright light.',
            frequency: 'Permanent',
          },
        ],
        organicRemedies: [
          'Dilute 3% Hydrogen Peroxide Drench: 1 tablespoon 3% hydrogen peroxide in 1L water to oxygenate root zone.',
          'Cinnamon Powder Dusting: Lightly dust surface soil to deter fungal gnats and surface molds.',
        ],
        chemicalRemedies: [
          {
            name: 'Chunky Aroid Soil Mix (Perlite + Pine Bark + Coco Coir)',
            activeIngredient: 'Coarse Pumice & Horticultural Charcoal',
            approximateCost: '₹350 / $8.00',
            instructions: 'Repot if existing substrate remains soggy for over 8 days.',
          },
        ],
        preventativeMeasures: [
          'Never leave planter standing in runoff water in the saucer.',
          'Clean glossy leaves monthly with damp microfiber cloth to maximize photosynthesis.',
        ],
        boundingBoxes: [
          { x: 35, y: 40, width: 30, height: 28, label: 'Chlorotic Zone' },
        ],
        aiProviderUsed: 'mock-botanic-v1',
      };
    }

    // Default Tomato Blight Diagnostic
    return {
      identifiedSpecies: 'Solanum lycopersicum (Tomato)',
      diseaseName: 'Early Blight (Alternaria solani)',
      pathogenType: 'fungal',
      confidence: 95.3,
      severity: 'moderate',
      symptoms: [
        'Concentric ring spots (target-board appearance) on mature lower leaves',
        'Yellow halo surrounding brownish-black necrotic lesions',
        'Lower leaf senescence progressing upwards towards apical canopy',
      ],
      causes: [
        'Alternaria solani fungal spores overwintering in soil splash',
        'Temperatures of 24°C–29°C combined with morning dew or wet foliage',
        'Dense planting limiting lower canopy air movement',
      ],
      prognosis: 'Manageable with targeted pruning and bio-fungicide. Harvest can be preserved if upper canopy stays protected.',
      treatmentSteps: [
        {
          stepNumber: 1,
          title: 'Pruning Lower Foliage',
          instruction: 'Remove all foliage within 12 inches of soil line. Sterilize pruner after every cut.',
          frequency: 'Immediate',
        },
        {
          stepNumber: 2,
          title: 'Protective Spraying',
          instruction: 'Spray copper octanoate or potassium bicarbonate solution thoroughly under leaves.',
          frequency: 'Every 7 days',
        },
        {
          stepNumber: 3,
          title: 'Ground Barrier Application',
          instruction: 'Spread straw or cedar mulch 2 inches thick around tomato base to block soil splash.',
          frequency: 'Immediate',
        },
      ],
      organicRemedies: [
        'Milk-Water Foliar Spray: 1 part cow milk to 9 parts water sprayed in morning sun. Lactoferrin inhibits fungal germination.',
        'Cold-pressed Neem Oil: 5ml neem + 2ml liquid soap per 1L water.',
      ],
      chemicalRemedies: [
        {
          name: 'Liquid Copper Fungicide',
          activeIngredient: 'Copper Octanoate (Copper Soap)',
          approximateCost: '₹290 / $6.90',
          instructions: 'Apply 15ml per liter of water at first sign of target spots.',
        },
        {
          name: 'Chlorothalonil 75% WP',
          activeIngredient: 'Chlorothalonil',
          approximateCost: '₹420 / $9.50',
          instructions: 'Broad-spectrum preventative foliar spray for high infection pressure.',
        },
      ],
      preventativeMeasures: [
        'Practice minimum 3-year crop rotation away from solanaceous plants.',
        'Use drip irrigation or soaker hoses instead of overhead sprinklers.',
      ],
      boundingBoxes: [
        { x: 30, y: 25, width: 38, height: 35, label: 'Target-Board Fungal Lesion' },
        { x: 70, y: 55, width: 20, height: 22, label: 'Chlorotic Halo' },
      ],
      aiProviderUsed: 'mock-botanic-v1',
    };
  }

  async identifyPlant(input: IdentifyInput): Promise<IdentifyOutput> {
    return {
      species: 'Monstera deliciosa',
      commonName: 'Swiss Cheese Plant',
      family: 'Araceae',
      confidence: 98.1,
      sunlightNeeds: 'indirect',
      wateringFrequencyDays: 7,
      difficulty: 'easy',
      careSummary: 'Fast-growing tropical vine famous for natural leaf holes (fenestrations). Thrives in bright indirect sunlight and well-aerated soil.',
      toxicityAlert: 'Contains calcium oxalate crystals; mildly toxic to cats and dogs if chewed.',
      aiProviderUsed: 'mock-botanic-v1',
    };
  }

  async chatWithDoctor(input: ChatInput): Promise<ChatOutput> {
    const lastMsg = input.messages[input.messages.length - 1]?.content.toLowerCase() || '';

    let reply = `Hello! I'm Dr. Flora, your Plantinia AI Plant Doctor. `;

    if (lastMsg.includes('water') || lastMsg.includes('how often')) {
      reply += `Watering is all about moisture levels, not just the calendar! As a golden rule, always test the soil 2 inches deep. If it feels cool and damp, wait another 2–3 days. When you do water, soak thoroughly until water drains out from the bottom holes, then discard excess tray water so roots don't sit in stagnant water.`;
    } else if (lastMsg.includes('yellow') || lastMsg.includes('leaves')) {
      reply += `Yellow leaves are a signal, not a death sentence! If bottom leaves yellow first, it is most often overwatering or natural shedding. If newer top leaves yellow with dark green veins, it's typically iron deficiency (chlorosis). Check your soil moisture and consider flushing with balanced organic fertilizer.`;
    } else if (lastMsg.includes('bug') || lastMsg.includes('pest') || lastMsg.includes('mite')) {
      reply += `For soft-bodied pests like spider mites, aphids, or mealybugs, start with a mechanical wash: take the plant to the sink and shower off the leaves. Next, apply a gentle spray of 1 tsp cold-pressed neem oil + 1/2 tsp gentle dish soap in 1 liter of lukewarm water. Repeat every 5 days for 3 cycles.`;
    } else {
      reply += `I've analyzed your garden context. For best vigor, ensure your plants receive 6+ hours of appropriate light, check drainage holes, and avoid overhead leaf wetting. What specific symptoms or changes are you noticing on your plant today?`;
    }

    return {
      response: reply,
      suggestedFollowUps: [
        'How do I test my soil moisture accurately?',
        'Can you analyze a photo of my leaf spots?',
        'What organic home fertilizer can I prepare?',
      ],
      aiProviderUsed: 'mock-botanic-v1',
    };
  }
}
