/**
 * AI-POWERED IRRIGATION ADVISORY SYSTEM FOR SUGARCANE (KJS-AGR-01)
 * Express Backend API & Mock AI Recommendation Engine
 * 
 * NOTE FOR PRODUCTION ARCHITECTURE / ML / DB INTEGRATION:
 * -----------------------------------------------------------------------
 * 1. REAL ML / AI ADVISORY:
 *    In production, this module would invoke an external Python microservice or 
 *    ONNX / TensorFlow runtime executing a trained Crop Water Stress Model (e.g. FAO-56 Penman-Monteith 
 *    Evapotranspiration equation integrated with XGBoost or Deep Neural Networks trained on satellite NDVI, 
 *    soil texture, and microclimate data).
 * 
 * 2. REAL IOT INTEGRATION:
 *    Instead of generating mock sensor readings, an MQTT broker (e.g., AWS IoT Core / ThingsBoard / Mosquitto)
 *    would ingest telemetry packets from LoRaWAN / GSM soil sensors (e.g., Capacitive Soil Moisture Sensors, 
 *    DS18B20 Temp sensors, Rain Gauges) installed across sugarcane plots.
 * 
 * 3. REAL DATABASE LAYER:
 *    The mock JSON objects returned here would be stored in a relational spatial database like PostgreSQL + PostGIS 
 *    (or MongoDB with geospatial indices) to track plot polygons, historical sensor time-series, and user accounts.
 * -----------------------------------------------------------------------
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Helper: Seeded pseudo-random generator based on string (e.g. plotId + date)
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * GET /api/health
 * Server healthcheck endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'AI-Powered Sugarcane Irrigation Advisory Platform (KJS-AGR-01)',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/weather/:plotId
 * Returns a 5-day microclimate weather forecast for a given sugarcane plot
 */
app.get('/api/weather/:plotId', (req, res) => {
  const { plotId } = req.params;
  const hash = hashString(plotId);

  const weatherConditions = ['Sunny', 'Partly Cloudy', 'Overcast', 'Light Rain', 'Moderate Rain'];
  const today = new Date();
  const forecast = [];

  for (let i = 0; i < 5; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const dayHash = hashString(plotId + d.toISOString().split('T')[0]);
    const tempMax = 30 + (dayHash % 7);
    const tempMin = 20 + (dayHash % 5);
    const humidity = 55 + (dayHash % 35);
    const rainChance = i === 2 ? 65 : (dayHash % 40);
    const condition = rainChance > 50 ? 'Light Rain' : weatherConditions[dayHash % 3];
    const et0 = parseFloat((4.5 + (dayHash % 20) / 10).toFixed(1)); // Evapotranspiration mm/day

    forecast.push({
      date: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      tempMax,
      tempMin,
      humidity,
      rainChance,
      rainfallMm: rainChance > 50 ? parseFloat((5 + (dayHash % 15)).toFixed(1)) : 0,
      condition,
      et0
    });
  }

  res.json({
    plotId,
    location: 'Sugarcane Agro-climatic Zone (Maharashtra/Karnataka Belt)',
    updatedAt: new Date().toISOString(),
    forecast
  });
});

/**
 * GET /api/recommendation/:plotId
 * Computes AI-driven irrigation advisory based on soil moisture, crop stage, ET0, and weather forecast
 */
app.get('/api/recommendation/:plotId', (req, res) => {
  const { plotId } = req.params;
  const soilMoisture = parseFloat(req.query.soilMoisture) || 32; // % Volumetric Water Content
  const cropAgeDays = parseInt(req.query.cropAgeDays) || 120; // Days after planting
  const soilType = req.query.soilType || 'Black Cotton Soil (Clay)';

  // Sugarcane stage determination
  let cropStage = 'Germination Phase';
  let targetMoistureThreshold = 45; // Field capacity %
  let kcFactor = 0.4; // Crop coefficient

  if (cropAgeDays > 35 && cropAgeDays <= 100) {
    cropStage = 'Tillering Phase';
    targetMoistureThreshold = 50;
    kcFactor = 0.85;
  } else if (cropAgeDays > 100 && cropAgeDays <= 270) {
    cropStage = 'Grand Growth Phase';
    targetMoistureThreshold = 55; // Critical peak water requirement
    kcFactor = 1.25;
  } else if (cropAgeDays > 270) {
    cropStage = 'Maturity & Ripening Phase';
    targetMoistureThreshold = 35; // Controlled water stress to increase sucrose Brix %
    kcFactor = 0.65;
  }

  const deficitPct = Math.max(0, targetMoistureThreshold - soilMoisture);
  
  // Rule-based decision tree for advisory
  let actionNeeded = false;
  let priority = 'NORMAL';
  let recommendedDate = 'No immediate irrigation needed';
  let durationHours = 0;
  let waterQuantityLitersPerAcre = 0;
  let summary = '';

  if (cropStage === 'Maturity & Ripening Phase' && cropAgeDays > 330) {
    summary = 'Crop is near harvesting. Maintain dry soil conditions to maximize sugar Brix concentration.';
    priority = 'LOW';
  } else if (deficitPct > 15) {
    actionNeeded = true;
    priority = 'URGENT';
    recommendedDate = 'Tomorrow Morning (6:00 AM - 9:30 AM)';
    durationHours = 3.5;
    waterQuantityLitersPerAcre = 35000;
    summary = `Soil moisture (${soilMoisture}%) is critically below target (${targetMoistureThreshold}%). Immediate drip/flood irrigation required to prevent wilting stress during ${cropStage}.`;
  } else if (deficitPct > 5) {
    actionNeeded = true;
    priority = 'MEDIUM';
    recommendedDate = 'In 2 Days at 7:00 AM';
    durationHours = 2.5;
    waterQuantityLitersPerAcre = 24000;
    summary = `Moderate moisture depletion detected in active root zone. Scheduled irrigation recommended to sustain peak photosynthetic rate.`;
  } else {
    summary = `Soil moisture (${soilMoisture}%) is optimal for sugarcane ${cropStage}. Next routine check recommended in 3 days.`;
  }

  res.json({
    plotId,
    cropStage,
    cropAgeDays,
    soilMoisture,
    targetMoistureThreshold,
    kcFactor,
    actionNeeded,
    priority,
    recommendedDate,
    recommendedDurationHours: durationHours,
    recommendedWaterLitersPerAcre: waterQuantityLitersPerAcre,
    summary,
    tips: [
      'Irrigate during early morning or late evening to reduce evapotranspiration losses by up to 20%.',
      'Ensure trash mulching between cane rows to preserve soil moisture and regulate soil temperature.',
      'Check drip emitters for lateral clogging if pressure gauge shows variation above 1.5 bar.'
    ],
    generatedAt: new Date().toISOString()
  });
});

/**
 * GET /api/yield-prediction/:plotId
 * Computes deterministic sugarcane yield estimate (Tonnes / Hectare and Tonnes / Acre)
 */
app.get('/api/yield-prediction/:plotId', (req, res) => {
  const { plotId } = req.params;
  const soilMoistureAvg = parseFloat(req.query.soilMoistureAvg) || 42;
  const ndviAvg = parseFloat(req.query.ndviAvg) || 0.72; // Normalized Difference Vegetation Index (0.1 - 0.9)
  const areaAcres = parseFloat(req.query.areaAcres) || 2.5;

  // Standard benchmark yield for sugarcane: 100 Tonnes / Hectare (~40 Tonnes / Acre)
  const baseYieldTonsPerAcre = 40;

  // Factor multipliers based on agronomic logic
  const moistureFactor = Math.min(1.15, Math.max(0.65, soilMoistureAvg / 45));
  const ndviFactor = Math.min(1.2, Math.max(0.7, ndviAvg / 0.70));
  const managementFactor = 1.05; // Standard good management practices

  const predictedYieldPerAcre = parseFloat((baseYieldTonsPerAcre * moistureFactor * ndviFactor * managementFactor).toFixed(1));
  const predictedTotalTons = parseFloat((predictedYieldPerAcre * areaAcres).toFixed(1));

  // Yield range min/max
  const minYieldPerAcre = parseFloat((predictedYieldPerAcre * 0.88).toFixed(1));
  const maxYieldPerAcre = parseFloat((predictedYieldPerAcre * 1.12).toFixed(1));
  const minTotalTons = parseFloat((minYieldPerAcre * areaAcres).toFixed(1));
  const maxTotalTons = parseFloat((maxYieldPerAcre * areaAcres).toFixed(1));

  let limitingFactor = 'Optimal Conditions';
  if (moistureFactor < 0.9) {
    limitingFactor = 'Sub-optimal soil moisture during grand growth phase';
  } else if (ndviFactor < 0.9) {
    limitingFactor = 'Slight canopy density drop detected via NDVI satellite Index';
  }

  res.json({
    plotId,
    areaAcres,
    predictedYieldPerAcre,
    predictedTotalTons,
    rangePerAcre: { min: minYieldPerAcre, max: maxYieldPerAcre },
    rangeTotalTons: { min: minTotalTons, max: maxTotalTons },
    yieldPerHectare: parseFloat((predictedYieldPerAcre * 2.471).toFixed(1)),
    limitingFactor,
    potentialUpsidePercent: 14,
    recommendationsForHigherYield: [
      'Apply split doses of Potash (MOP) at 120 & 180 days to increase cane stalk thickness and sucrose density.',
      'Maintain earthing up operations at 120 days to prevent crop lodging under wind stress.',
      'Incorporate fertigation via drip to increase nutrient absorption efficiency by 30% compared to soil broadcasting.'
    ]
  });
});

/**
 * GET /api/fertigation/:plotId
 * Computes stage-specific fertigation schedule (Urea, DAP, MOP doses in kg/acre)
 */
app.get('/api/fertigation/:plotId', (req, res) => {
  const { plotId } = req.params;
  const cropAgeDays = parseInt(req.query.cropAgeDays) || 90;

  let stage = 'Basal / Germination';
  let ureaKgPerAcre = 25;
  let dapKgPerAcre = 50;
  let mopKgPerAcre = 20;
  let frequencyDays = 15;

  if (cropAgeDays > 30 && cropAgeDays <= 90) {
    stage = 'Early Tillering Phase';
    ureaKgPerAcre = 45;
    dapKgPerAcre = 30;
    mopKgPerAcre = 25;
    frequencyDays = 10;
  } else if (cropAgeDays > 90 && cropAgeDays <= 180) {
    stage = 'Grand Growth Peak Phase';
    ureaKgPerAcre = 60;
    dapKgPerAcre = 20;
    mopKgPerAcre = 40;
    frequencyDays = 7;
  } else if (cropAgeDays > 180 && cropAgeDays <= 270) {
    stage = 'Late Growth / Stalk Elongation';
    ureaKgPerAcre = 30;
    dapKgPerAcre = 0;
    mopKgPerAcre = 35;
    frequencyDays = 14;
  } else if (cropAgeDays > 270) {
    stage = 'Maturity (Pre-Harvest)';
    ureaKgPerAcre = 0;
    dapKgPerAcre = 0;
    mopKgPerAcre = 15;
    frequencyDays = 0;
  }

  res.json({
    plotId,
    cropAgeDays,
    stage,
    dosesKgPerAcre: {
      urea: ureaKgPerAcre,
      dap: dapKgPerAcre,
      mop: mopKgPerAcre,
      micronutrientMix: 5
    },
    fertigationIntervalDays: frequencyDays,
    instructions: `Inject solubilized fertilizers into drip irrigation line during the second half of the irrigation cycle. Run plain water for 15 minutes post-fertigation to flush drip lines.`
  });
});

app.listen(PORT, () => {
  console.log(`=================================================================`);
  console.log(`🌾 Sugarcane AI Irrigation Advisory API Backend Running on Port ${PORT}`);
  console.log(`   Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=================================================================`);
});
