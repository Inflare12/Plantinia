import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const knowledge = [
  {
    id: 'kb_seed_tomato_late_blight',
    type: 'disease',
    name: 'Tomato Late Blight',
    scientificName: 'Phytophthora infestans',
    category: 'disease',
    description: 'A serious disease of tomato and other nightshades favored by cool, wet conditions and prolonged leaf wetness.',
    affectedPlants: ['Tomato', 'Potato', 'Eggplant'],
    symptoms: ['Irregular dark water-soaked lesions', 'Rapid browning', 'Possible white sporulation under humid conditions'],
    treatment: { steps: ['Remove severely infected tissue', 'Improve airflow', 'Avoid overhead irrigation', 'Use only locally registered products according to their label'] },
    prevention: { steps: ['Keep foliage dry', 'Use adequate plant spacing', 'Remove infected debris'] },
    sources: [{ title: 'Cornell Vegetable MD Online', url: 'https://vegetablemdonline.ppath.cornell.edu/' }],
  },
  {
    id: 'kb_seed_powdery_mildew',
    type: 'disease',
    name: 'Powdery Mildew',
    scientificName: 'Podosphaera spp.',
    category: 'disease',
    description: 'A group of fungal diseases producing characteristic white powdery growth on plant surfaces.',
    affectedPlants: ['Rose', 'Cucumber', 'Zucchini', 'Grape'],
    symptoms: ['White powdery growth', 'Leaf distortion', 'Reduced vigor'],
    treatment: { steps: ['Remove heavily affected leaves', 'Increase airflow', 'Follow a locally registered fungicide label when treatment is necessary'] },
    prevention: { steps: ['Avoid overcrowding', 'Provide suitable light', 'Avoid excessive nitrogen'] },
    sources: [{ title: 'UC IPM', url: 'https://ipm.ucanr.edu/' }],
  },
  {
    id: 'kb_seed_spider_mites',
    type: 'pest',
    name: 'Spider Mites',
    scientificName: 'Tetranychus spp.',
    category: 'pest',
    description: 'Tiny sap-feeding pests that can cause stippling, bronzing and fine webbing, especially in hot dry conditions.',
    affectedPlants: ['Tomato', 'Rose', 'Bean', 'Houseplants'],
    symptoms: ['Fine stippling', 'Bronzing', 'Fine webbing', 'Leaf drop in severe infestations'],
    treatment: { steps: ['Inspect leaf undersides', 'Wash foliage with water where appropriate', 'Use an approved miticide only according to its label'] },
    prevention: { steps: ['Reduce plant stress', 'Inspect new plants before introducing them'] },
    sources: [{ title: 'UC IPM Spider Mites', url: 'https://ipm.ucanr.edu/' }],
  },
  {
    id: 'kb_seed_root_stress',
    type: 'symptom',
    name: 'Root Stress / Overwatering',
    category: 'environmental stress',
    description: 'Waterlogged roots can become oxygen-starved and may lead to yellowing, wilting despite wet soil, and root decline.',
    affectedPlants: ['Houseplants', 'Herbs', 'Vegetables'],
    symptoms: ['Yellowing leaves', 'Wilting in wet soil', 'Slow growth'],
    treatment: { steps: ['Check soil moisture and drainage', 'Allow the appropriate drying interval for the species', 'Inspect roots if symptoms persist'] },
    prevention: { steps: ['Use containers with drainage', 'Match watering frequency to plant and substrate needs'] },
    sources: [{ title: 'RHS', url: 'https://www.rhs.org.uk/' }],
  },
  {
    id: 'kb_seed_nitrogen_deficiency',
    type: 'nutrient_deficiency',
    name: 'Nitrogen Deficiency',
    category: 'nutrient deficiency',
    description: 'Insufficient available nitrogen commonly causes older leaves to become uniformly pale or yellow while growth slows.',
    affectedPlants: ['Vegetables', 'Herbs', 'Ornamentals'],
    symptoms: ['Older leaves yellow first', 'Reduced growth', 'Small pale foliage'],
    treatment: { steps: ['Confirm the diagnosis before fertilizing', 'Use a balanced fertilizer appropriate for the crop and label directions'] },
    prevention: { steps: ['Maintain appropriate soil fertility', 'Use soil testing where practical'] },
    sources: [{ title: 'University extension plant nutrition resources', url: 'https://extension.umn.edu/' }],
  },
];

async function main() {
  for (const item of knowledge) {
    await prisma.knowledgeItem.upsert({
      where: { id: item.id },
      update: { ...item, isActive: true, lastUpdated: new Date() },
      create: { ...item, isActive: true },
    });
  }

  await prisma.modelMetadata.upsert({
    where: { version: 'plantinia-baseline-1.0' },
    update: { isActive: true, status: 'active', lastUpdated: new Date() },
    create: {
      name: 'Plantinia Baseline Vision',
      version: 'plantinia-baseline-1.0',
      type: 'disease_detection',
      status: 'active',
      description: 'Baseline provider-agnostic Plantinia diagnosis metadata. Replace with the validated custom model when available.',
      trainedOn: 'Provider-assisted baseline',
      classes: ['healthy', 'disease', 'pest', 'environmental stress'],
      isActive: true,
    },
  });

  console.log(`Seeded ${knowledge.length} knowledge records and 1 model metadata record.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  await prisma.$disconnect();
});
