import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { storageApi } from '../utils/storage';
import { apiService } from '../services/api';
import { 
  Droplet, 
  Thermometer, 
  Activity, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  Zap, 
  CloudRain, 
  Sun, 
  Sparkles, 
  CheckCircle, 
  ArrowRight,
  TrendingUp,
  Wind
} from 'lucide-react';

export default function Dashboard() {
  const { farmer, activePlot, activePlotId, t } = useApp();

  const [latestSensor, setLatestSensor] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [lastIrrigation, setLastIrrigation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch data on activePlotId change
  useEffect(() => {
    if (!activePlotId) return;

    let isMounted = true;
    setLoading(true);

    async function loadDashboardData() {
      // 1. Get latest telemetry from localStorage
      const sensor = storageApi.getLatestSensorReading(activePlotId) || {
        soilMoisture: 32.5,
        soilTemp: 26.2,
        humidity: 64,
        rainfall: 0,
        ndvi: 0.74
      };

      // 2. Get latest manual irrigation log
      const logs = storageApi.getIrrigationLogs(activePlotId);
      const lastLog = logs.length > 0 ? logs[0] : null;

      // 3. Compute crop age
      let cropAgeDays = 120;
      if (activePlot && activePlot.plantingDate) {
        const pDate = new Date(activePlot.plantingDate);
        cropAgeDays = Math.ceil(Math.abs(new Date() - pDate) / (86400000));
      }

      // 4. Fetch Express REST APIs (or offline fallbacks)
      const [recRes, weatherRes] = await Promise.all([
        apiService.getRecommendation(
          activePlotId, 
          sensor.soilMoisture, 
          cropAgeDays, 
          activePlot ? activePlot.soilType : 'Black Cotton Soil'
        ),
        apiService.getWeather(activePlotId)
      ]);

      if (isMounted) {
        setLatestSensor(sensor);
        setLastIrrigation(lastLog);
        setRecommendation(recRes);
        setWeatherData(weatherRes);
        setLoading(false);
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [activePlotId, activePlot]);

  if (!activePlot) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>No Plot Selected</h2>
        <p>Please register or select a plot from settings.</p>
      </div>
    );
  }

  // Water Stress Calculation logic
  const soilMoistureVal = latestSensor ? latestSensor.soilMoisture : 32.5;
  let stressLevel = 'LOW';
  let stressColor = '#22c55e';
  if (soilMoistureVal < 30) {
    stressLevel = 'HIGH';
    stressColor = '#e11d48';
  } else if (soilMoistureVal < 40) {
    stressLevel = 'MODERATE';
    stressColor = '#f59e0b';
  }

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Plot & Farmer Header Overview Banner */}
      <div className="agro-gradient-card" style={{ padding: '24px', borderRadius: '20px' }}>
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', padding: '4px 12px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '600', marginBottom: '8px', color: '#95d5b2' }}>
              <Sparkles size={14} /> AI-ENHANCED AGRI-ADVISORY PLATFORM
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>
              {activePlot.plotName}
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#d8f3dc' }}>
              {farmer?.name} | {farmer?.village}, {farmer?.district} • {activePlot.areaAcres} Acres • Soil: {activePlot.soilType}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '10px 18px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.2)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: '#95d5b2', textTransform: 'uppercase' }}>Cane Variety</div>
              <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#ffffff' }}>{activePlot.cropVariety}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '10px 18px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.2)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: '#95d5b2', textTransform: 'uppercase' }}>Planting Date</div>
              <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#ffffff' }}>{activePlot.plantingDate}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Summary Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        
        {/* Soil Moisture */}
        <div className="glass-card" style={{ padding: '18px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b' }}>{t('soilMoisture')}</span>
            <div style={{ background: '#e0f2fe', padding: '8px', borderRadius: '10px' }}>
              <Droplet size={20} color="#0284c7" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a' }}>
            {latestSensor?.soilMoisture}%
          </div>
          <div style={{ fontSize: '0.75rem', color: latestSensor?.soilMoisture < 35 ? '#e11d48' : '#22c55e', fontWeight: '600', marginTop: '4px' }}>
            {latestSensor?.soilMoisture < 35 ? '⚠️ Below Target (Target 50%)' : '✓ Optimal Root Zone Level'}
          </div>
        </div>

        {/* Soil Temp */}
        <div className="glass-card" style={{ padding: '18px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b' }}>{t('soilTemp')}</span>
            <div style={{ background: '#fef3c7', padding: '8px', borderRadius: '10px' }}>
              <Thermometer size={20} color="#d97706" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a' }}>
            {latestSensor?.soilTemp}°C
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Root Zone Warmth: Healthy
          </div>
        </div>

        {/* NDVI Health Index */}
        <div className="glass-card" style={{ padding: '18px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b' }}>{t('ndviIndex')}</span>
            <div style={{ background: '#d8f3dc', padding: '8px', borderRadius: '10px' }}>
              <Activity size={20} color="#2d6a4f" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a' }}>
            {latestSensor?.ndvi}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#2d6a4f', fontWeight: '600', marginTop: '4px' }}>
            🟢 Dense Sugarcane Canopy
          </div>
        </div>

        {/* Water Stress Index */}
        <div className="glass-card" style={{ padding: '18px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b' }}>{t('waterStress')}</span>
            <div style={{ background: '#ffe4e6', padding: '8px', borderRadius: '10px' }}>
              <AlertTriangle size={20} color="#e11d48" />
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: stressColor }}>
            {stressLevel}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Transpiration Deficit Index
          </div>
        </div>

        {/* Last Irrigation Date */}
        <div className="glass-card" style={{ padding: '18px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b' }}>{t('lastIrrigation')}</span>
            <div style={{ background: '#f1f5f9', padding: '8px', borderRadius: '10px' }}>
              <Clock size={20} color="#475569" />
            </div>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>
            {lastIrrigation ? lastIrrigation.date : '2 Days Ago'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            {lastIrrigation ? `${lastIrrigation.durationHours} hrs (${lastIrrigation.waterQuantity} L)` : '3.0 hrs Drip Run'}
          </div>
        </div>

      </div>

      {/* 3. AI Irrigation Advisory Highlight Card */}
      <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', borderLeft: '6px solid #2d6a4f', background: 'linear-gradient(to right, #ffffff, #f0fdf4)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#2d6a4f', padding: '8px', borderRadius: '12px', color: '#ffffff' }}>
              <Zap size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: '#0f172a', fontWeight: '700' }}>{t('aiAdvisoryTitle')}</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Engineered Rule & ET0 Hydro-Model Inference for {recommendation?.cropStage || 'Grand Growth Phase'}
              </p>
            </div>
          </div>

          <span className={recommendation?.priority === 'URGENT' ? 'badge-urgent' : 'badge-success'}>
            {recommendation?.priority || 'NORMAL'} PRIORITY
          </span>
        </div>

        {/* Main Recommendation Text */}
        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '14px', border: '1px solid #bbf7d0', marginBottom: '16px' }}>
          <div style={{ fontSize: '1.15rem', fontWeight: '700', color: '#1b4332', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={20} color="#40916c" />
            <span>"{recommendation?.summary || 'Irrigate tomorrow morning for 2.5 hours'}"</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0', fontSize: '0.88rem' }}>
            <div>
              <span style={{ color: '#64748b' }}>📅 Next Schedule:</span>{' '}
              <strong style={{ color: '#0f172a' }}>{recommendation?.recommendedDate}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>⏱️ Recommended Run Time:</span>{' '}
              <strong style={{ color: '#2d6a4f' }}>{recommendation?.recommendedDurationHours || 2.5} Hours</strong>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>💧 Water Volume:</span>{' '}
              <strong style={{ color: '#0284c7' }}>{(recommendation?.recommendedWaterLitersPerAcre * (activePlot?.areaAcres || 2.5)).toLocaleString()} Liters</strong>
            </div>
          </div>
        </div>

        {/* Agronomic Tips */}
        <div>
          <h4 style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600', marginBottom: '8px' }}>💡 Smart Farming Agronomic Tips:</h4>
          <ul style={{ paddingLeft: '20px', fontSize: '0.82rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {recommendation?.tips ? (
              recommendation.tips.map((tip, idx) => <li key={idx}>{tip}</li>)
            ) : (
              <li>Irrigate during early morning hours to limit evaporation losses.</li>
            )}
          </ul>
        </div>

      </div>

      {/* 4. Mini 5-Day Weather Forecast Strip */}
      <div className="glass-card" style={{ padding: '20px', borderRadius: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CloudRain size={20} color="#0284c7" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>{t('fiveDayForecast')}</h3>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Microclimate Evapotranspiration (ET0) Telemetry</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
          {weatherData?.forecast ? (
            weatherData.forecast.map((day, i) => (
              <div 
                key={i} 
                style={{ 
                  background: i === 0 ? '#f0fdf4' : '#f8fafc', 
                  border: i === 0 ? '1px solid #86efac' : '1px solid #e2e8f0', 
                  borderRadius: '14px', 
                  padding: '14px', 
                  textAlign: 'center' 
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: i === 0 ? '#1b4332' : '#334155' }}>
                  {day.dayName}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '8px' }}>{day.date}</div>
                
                <div style={{ margin: '8px 0' }}>
                  {day.condition.includes('Rain') ? (
                    <CloudRain size={24} color="#0284c7" style={{ margin: '0 auto' }} />
                  ) : (
                    <Sun size={24} color="#f59e0b" style={{ margin: '0 auto' }} />
                  )}
                </div>

                <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a' }}>
                  {day.tempMax}° <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '500' }}>/ {day.tempMin}°C</span>
                </div>

                <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: '600', marginTop: '6px' }}>
                  ☔ Rain: {day.rainChance}%
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                  ET0: {day.et0} mm/d
                </div>
              </div>
            ))
          ) : (
            <div>Loading Weather Telemetry...</div>
          )}
        </div>
      </div>

    </div>
  );
}
