/**
 * LocalStorage Storage Utility Module
 * Wraps localStorage getItem/setItem with JSON serialization, error handling,
 * and pre-populated seed data for first-time application initialization.
 */

const STORAGE_KEYS = {
  FARMERS: 'farmers',
  PLOTS: 'plots',
  SENSOR_READINGS: 'sensorReadings',
  IRRIGATION_LOGS: 'irrigationLogs',
  ALERTS: 'alerts',
  SETTINGS: 'settings',
  ACTIVE_FARMER_ID: 'activeFarmerId',
  ACTIVE_PLOT_ID: 'activePlotId'
};

// Safe JSON Parse wrapper
function getItem(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (err) {
    console.error(`[Storage Utility] Error reading key "${key}":`, err);
    return defaultValue;
  }
}

// Safe JSON Stringify wrapper
function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`[Storage Utility] Error writing key "${key}":`, err);
    return false;
  }
}

/**
 * Generates 30 days of realistic historical sensor readings for sugarcane plots
 */
function generateSeedSensorReadings(plotIds) {
  const readings = [];
  const today = new Date();

  plotIds.forEach(plotId => {
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      // Moisture fluctuates between 28% and 52%, dropping periodically then spiking after irrigation
      const dayCycle = i % 5;
      const baseMoisture = dayCycle === 0 ? 52 : (50 - dayCycle * 4.5);
      const soilMoisture = parseFloat((baseMoisture + (Math.sin(i) * 2)).toFixed(1));
      const soilTemp = parseFloat((24 + (Math.cos(i) * 3)).toFixed(1));
      const humidity = parseFloat((62 + (Math.sin(i * 0.5) * 12)).toFixed(1));
      const rainfall = (i === 12 || i === 24) ? 14.5 : (i === 5 ? 4.0 : 0);
      const ndvi = parseFloat((0.68 + (30 - i) * 0.003).toFixed(2)); // Gradual canopy improvement

      readings.push({
        id: `sr_${plotId}_${dateStr}`,
        plotId,
        date: dateStr,
        soilMoisture,
        soilTemp,
        humidity,
        rainfall,
        ndvi
      });
    }
  });

  return readings;
}

/**
 * Initialize Seed Data if localStorage is clean/unpopulated
 */
export function initSeedData(forceReset = false) {
  if (forceReset || !localStorage.getItem(STORAGE_KEYS.FARMERS)) {
    const defaultFarmer = {
      id: 'f_101',
      name: 'Ramesh Patil',
      mobile: '9876543210',
      village: 'Sangli Rural',
      taluk: 'Miraj',
      district: 'Sangli',
      plots: ['p_201', 'p_202']
    };

    const defaultPlots = [
      {
        id: 'p_201',
        farmerId: 'f_101',
        plotName: 'Plot 1 - Krishna River Side (Sugarcane Co-86032)',
        areaAcres: 3.5,
        soilType: 'Deep Black Cotton Soil (Vertisol)',
        cropVariety: 'Co-86032 (Nira)',
        plantingDate: '2025-10-15',
        irrigationType: 'Sub-surface Drip Irrigation'
      },
      {
        id: 'p_202',
        farmerId: 'f_101',
        plotName: 'Plot 2 - North Ridge (Sugarcane CoM-0265)',
        areaAcres: 2.0,
        soilType: 'Medium Clay Loam Soil',
        cropVariety: 'CoM-0265 (Phule 265)',
        plantingDate: '2025-11-20',
        irrigationType: 'Surface Furrow Irrigation'
      }
    ];

    const seedSensors = generateSeedSensorReadings(['p_201', 'p_202']);

    const defaultIrrigationLogs = [
      {
        id: 'ir_301',
        plotId: 'p_201',
        date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
        durationHours: 3.0,
        waterQuantity: 30000,
        source: 'recommended',
        notes: 'AI Recommended Drip Irrigation run successfully.'
      },
      {
        id: 'ir_302',
        plotId: 'p_201',
        date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
        durationHours: 2.5,
        waterQuantity: 25000,
        source: 'manual',
        notes: 'Manual furrow watering pre-fertigation.'
      },
      {
        id: 'ir_303',
        plotId: 'p_202',
        date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
        durationHours: 4.0,
        waterQuantity: 40000,
        source: 'manual',
        notes: 'Canal release supply utilized.'
      }
    ];

    const defaultAlerts = [
      {
        id: 'alt_401',
        plotId: 'p_201',
        type: 'MOISTURE_LOW',
        severity: 'URGENT',
        message: 'Soil moisture dropped to 31.5% in Plot 1. Root zone deficit detected.',
        date: new Date().toISOString().split('T')[0],
        read: false
      },
      {
        id: 'alt_402',
        plotId: 'p_202',
        type: 'WEATHER_RAIN',
        severity: 'INFO',
        message: 'Rainfall expected in 2 days (~12mm). Recommendation: Delay next irrigation by 24h.',
        date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
        read: true
      },
      {
        id: 'alt_403',
        plotId: 'p_201',
        type: 'FERTIGATION_DUE',
        severity: 'MEDIUM',
        message: 'Grand Growth Phase Urea & Potash dosage due for Plot 1.',
        date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
        read: false
      }
    ];

    const defaultSettings = {
      electricityWindows: '06:00 AM - 12:00 PM (3-Phase Daytime Power)',
      electricityHoursPerDay: 6,
      language: 'en',
      soilMoistureAlertThreshold: 35
    };

    setItem(STORAGE_KEYS.FARMERS, [defaultFarmer]);
    setItem(STORAGE_KEYS.PLOTS, defaultPlots);
    setItem(STORAGE_KEYS.SENSOR_READINGS, seedSensors);
    setItem(STORAGE_KEYS.IRRIGATION_LOGS, defaultIrrigationLogs);
    setItem(STORAGE_KEYS.ALERTS, defaultAlerts);
    setItem(STORAGE_KEYS.SETTINGS, defaultSettings);
    setItem(STORAGE_KEYS.ACTIVE_FARMER_ID, defaultFarmer.id);
    setItem(STORAGE_KEYS.ACTIVE_PLOT_ID, defaultPlots[0].id);

    console.log('[Storage Utility] Seed data successfully populated in localStorage!');
  }
}

// Data Access API
export const storageApi = {
  // Reset / Re-seed
  resetAllData() {
    localStorage.clear();
    initSeedData(true);
    return true;
  },

  // Active Session
  getActiveFarmerId() {
    return getItem(STORAGE_KEYS.ACTIVE_FARMER_ID, 'f_101');
  },
  setActiveFarmerId(farmerId) {
    return setItem(STORAGE_KEYS.ACTIVE_FARMER_ID, farmerId);
  },
  getActivePlotId() {
    return getItem(STORAGE_KEYS.ACTIVE_PLOT_ID, 'p_201');
  },
  setActivePlotId(plotId) {
    return setItem(STORAGE_KEYS.ACTIVE_PLOT_ID, plotId);
  },

  // Farmers CRUD
  getFarmers() {
    return getItem(STORAGE_KEYS.FARMERS, []);
  },
  getFarmerById(farmerId) {
    const farmers = this.getFarmers();
    return farmers.find(f => f.id === farmerId) || null;
  },
  saveFarmer(farmerData) {
    const farmers = this.getFarmers();
    const existingIndex = farmers.findIndex(f => f.id === farmerData.id);
    
    if (existingIndex >= 0) {
      farmers[existingIndex] = { ...farmers[existingIndex], ...farmerData };
    } else {
      farmers.push(farmerData);
    }
    setItem(STORAGE_KEYS.FARMERS, farmers);
    return farmerData;
  },

  // Plots CRUD
  getPlots(farmerId = null) {
    const plots = getItem(STORAGE_KEYS.PLOTS, []);
    if (farmerId) {
      return plots.filter(p => p.farmerId === farmerId);
    }
    return plots;
  },
  getPlotById(plotId) {
    const plots = this.getPlots();
    return plots.find(p => p.id === plotId) || null;
  },
  savePlot(plotData) {
    const plots = this.getPlots();
    const existingIndex = plots.findIndex(p => p.id === plotData.id);
    
    if (existingIndex >= 0) {
      plots[existingIndex] = { ...plots[existingIndex], ...plotData };
    } else {
      plots.push(plotData);
    }
    setItem(STORAGE_KEYS.PLOTS, plots);

    // Ensure farmer's plot array includes this plotId
    if (plotData.farmerId) {
      const farmer = this.getFarmerById(plotData.farmerId);
      if (farmer && !farmer.plots.includes(plotData.id)) {
        farmer.plots.push(plotData.id);
        this.saveFarmer(farmer);
      }
    }
    return plotData;
  },

  // Sensor Readings
  getSensorReadings(plotId) {
    const readings = getItem(STORAGE_KEYS.SENSOR_READINGS, []);
    return readings.filter(r => r.plotId === plotId).sort((a, b) => new Date(a.date) - new Date(b.date));
  },
  getLatestSensorReading(plotId) {
    const readings = this.getSensorReadings(plotId);
    return readings.length > 0 ? readings[readings.length - 1] : null;
  },
  addSensorReading(readingData) {
    const readings = getItem(STORAGE_KEYS.SENSOR_READINGS, []);
    const newEntry = {
      id: `sr_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      ...readingData
    };
    readings.push(newEntry);
    setItem(STORAGE_KEYS.SENSOR_READINGS, readings);
    return newEntry;
  },

  // Irrigation Logs CRUD
  getIrrigationLogs(plotId = null) {
    const logs = getItem(STORAGE_KEYS.IRRIGATION_LOGS, []);
    const filtered = plotId ? logs.filter(l => l.plotId === plotId) : logs;
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  },
  addIrrigationLog(logData) {
    const logs = getItem(STORAGE_KEYS.IRRIGATION_LOGS, []);
    const newLog = {
      id: `ir_${Date.now()}`,
      ...logData
    };
    logs.push(newLog);
    setItem(STORAGE_KEYS.IRRIGATION_LOGS, logs);
    return newLog;
  },
  updateIrrigationLog(logId, updatedFields) {
    const logs = getItem(STORAGE_KEYS.IRRIGATION_LOGS, []);
    const index = logs.findIndex(l => l.id === logId);
    if (index >= 0) {
      logs[index] = { ...logs[index], ...updatedFields };
      setItem(STORAGE_KEYS.IRRIGATION_LOGS, logs);
      return logs[index];
    }
    return null;
  },
  deleteIrrigationLog(logId) {
    const logs = getItem(STORAGE_KEYS.IRRIGATION_LOGS, []);
    const filtered = logs.filter(l => l.id !== logId);
    setItem(STORAGE_KEYS.IRRIGATION_LOGS, filtered);
    return true;
  },

  // Alerts CRUD
  getAlerts(plotId = null) {
    const alerts = getItem(STORAGE_KEYS.ALERTS, []);
    return plotId ? alerts.filter(a => a.plotId === plotId) : alerts;
  },
  toggleAlertRead(alertId) {
    const alerts = getItem(STORAGE_KEYS.ALERTS, []);
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      alert.read = !alert.read;
      setItem(STORAGE_KEYS.ALERTS, alerts);
    }
    return alert;
  },
  dismissAlert(alertId) {
    const alerts = getItem(STORAGE_KEYS.ALERTS, []);
    const filtered = alerts.filter(a => a.id !== alertId);
    setItem(STORAGE_KEYS.ALERTS, filtered);
    return true;
  },

  // Settings
  getSettings() {
    return getItem(STORAGE_KEYS.SETTINGS, {
      electricityWindows: '06:00 AM - 12:00 PM (Day Shift)',
      electricityHoursPerDay: 6,
      language: 'en',
      soilMoistureAlertThreshold: 35
    });
  },
  saveSettings(newSettings) {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    setItem(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  }
};
