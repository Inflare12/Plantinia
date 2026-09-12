import test from 'node:test';
import assert from 'node:assert/strict';

// Test 1: JWT Signing & Verification
test('Auth Web Crypto JWT signs and verifies payload correctly', async () => {
  const { signJWT, verifyJWT } = await import('../src/lib/auth/jwt.ts');

  const testPayload = {
    userId: 'usr_test_123',
    email: 'tester@plantinia.app',
    role: 'user',
    subscriptionTier: 'free',
  };

  const token = await signJWT(testPayload, 7);
  assert.ok(token, 'JWT token should be generated');
  assert.equal(token.split('.').length, 3, 'JWT should contain 3 parts');

  const decoded = await verifyJWT(token);
  assert.ok(decoded, 'Decoded token must be truthy');
  assert.equal(decoded.userId, 'usr_test_123');
  assert.equal(decoded.email, 'tester@plantinia.app');
  assert.equal(decoded.role, 'user');
});

// Test 2: In-Memory / PostgreSQL Database Adapter CRUD
test('Database Adapter handles user and plant CRUD operations', async () => {
  const { db } = await import('../src/lib/db/adapter.ts');

  const newUser = await db.users.create({
    name: 'Test Botanist',
    email: `botanist_${Date.now()}@example.com`,
    passwordHash: 'hash_test_123',
    role: 'user',
    isEmailVerified: true,
    subscriptionTier: 'free',
    subscriptionStatus: 'active',
    creditsRemaining: 5,
  });

  assert.ok(newUser.id, 'Created user should have an ID');
  const foundUser = await db.users.findByEmail(newUser.email);
  assert.equal(foundUser?.id, newUser.id, 'User should be found by email');

  // Test Plant creation
  const plant = await db.plants.create({
    userId: newUser.id,
    name: 'Test Pothos',
    species: 'Epipremnum aureum',
    commonName: 'Golden Pothos',
    imageUrl: 'https://example.com/pothos.jpg',
    location: 'indoor',
    healthStatus: 'healthy',
    sunlightNeeds: 'indirect',
    wateringFrequencyDays: 7,
  });

  assert.ok(plant.id, 'Created plant should have an ID');
  const userPlants = await db.plants.listByUser(newUser.id);
  assert.equal(userPlants.length, 1);
  assert.equal(userPlants[0].name, 'Test Pothos');
});

// Test 3: Modular AI Engine Fallback & Diagnostics
test('Modular AI Engine generates full pathology diagnostics with treatments', async () => {
  const { MockAIEngine } = await import('../src/lib/ai/mock.ts');
  const engine = new MockAIEngine();

  const diagnosis = await engine.diagnosePlant({
    mediaUrl: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa',
    mediaType: 'image',
    plantSpeciesHint: 'Tomato',
    notes: 'Dark spots on leaves',
  });

  assert.ok(diagnosis.identifiedSpecies.includes('Tomato'));
  assert.ok(diagnosis.confidence > 80, 'Confidence should be high');
  assert.ok(['mild', 'moderate', 'severe', 'critical'].includes(diagnosis.severity));
  assert.ok(diagnosis.treatmentSteps.length > 0, 'Must have treatment steps');
  assert.ok(diagnosis.organicRemedies.length > 0, 'Must have organic recipes');
  assert.ok(diagnosis.chemicalRemedies.length > 0, 'Must have chemical prescriptions');
  assert.ok(diagnosis.boundingBoxes.length > 0, 'Must produce bounding boxes');
});

// Test 4: Entitlements and Usage Limits
test('Entitlement checks enforce Free tier limits and allow Pro tier', async () => {
  const { checkAndDeductDiagnosisEntitlement } = await import('../src/lib/payments/entitlements.ts');

  const freeUser = {
    id: 'usr_free_test',
    email: 'free@test.com',
    passwordHash: 'hash',
    name: 'Free User',
    role: 'user',
    isEmailVerified: true,
    subscriptionTier: 'free',
    subscriptionStatus: 'active',
    creditsRemaining: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Video scan should be blocked for Free tier
  const videoCheck = await checkAndDeductDiagnosisEntitlement(freeUser, 'video');
  assert.equal(videoCheck.allowed, false, 'Free tier should not be allowed video diagnosis');

  // Image scan with 1 credit should be allowed and deduct credit to 0
  const imageCheck = await checkAndDeductDiagnosisEntitlement(freeUser, 'image');
  assert.equal(imageCheck.allowed, true);
  assert.equal(imageCheck.remainingCredits, 0);

  // Pro tier should have unlimited access for both image and video
  const proUser = { ...freeUser, subscriptionTier: 'pro', creditsRemaining: 0 };
  const proVideoCheck = await checkAndDeductDiagnosisEntitlement(proUser, 'video');
  assert.equal(proVideoCheck.allowed, true, 'Pro tier should have unlimited video scans');
});

// Test 5: Open-Meteo Weather Agronomic Calculations
test('Weather agronomic engine returns valid humidity and disease risk indices', async () => {
  const { getPlantWeatherAdvisory } = await import('../src/lib/weather/open-meteo.ts');

  const advisory = await getPlantWeatherAdvisory(28.6139, 77.2090, 'Delhi Test Garden');
  assert.ok(typeof advisory.temperatureC === 'number');
  assert.ok(typeof advisory.humidityPct === 'number');
  assert.ok(['low', 'moderate', 'high'].includes(advisory.fungalRisk));
  assert.ok(advisory.wateringAdvice.length > 0);
});
