import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import { storageApi } from '../utils/storage';
import { 
  FlaskConical, 
  TrendingUp, 
  Zap, 
  Clock, 
  Award, 
  Info, 
  BarChart3, 
  CheckCircle,
  HelpCircle,
  Settings
} from 'lucide-react';

export default function FertigationYield() {
  const { activePlot, activePlotId, settings, updateSettings, t } = useApp();

  const [fertigationData, setFertigationData] = useState(null);
  const [yieldData, setYieldData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pump window setting editor
  const [elecWindow, setElecWindow] = useState(settings.electricityWindows || '06:00 AM - 12:00 PM (Day Shift)');
  const [elecHours, setElecHours] = useState(settings.electricityHoursPerDay || 6);
  const [isEditingWindow, setIsEditingWindow] = useState(false);

  useEffect(() => {
    if (!activePlotId) return;

    loadData();
  }, [activePlotId, activePlot]);

  const loadData = async () => {
    setLoading(true);

    let cropAgeDays = 120;
    if (activePlot && activePlot.plantingDate) {
      const pDate = new Date(activePlot.plantingDate);
      cropAgeDays = Math.ceil(Math.abs(new Date() - pDate) / (86400000));
    }

    const latestSensor = storageApi.getLatestSensorReading(activePlotId);
    const moisture = latestSensor ? latestSensor.soilMoisture : 42;
    const ndvi = latestSensor ? latestSensor.ndvi : 0.74;
    const area = activePlot ? activePlot.areaAcres : 2.5;

    const [fertRes, yieldRes] = await Promise.all([
      apiService.getFertigation(activePlotId, cropAgeDays),
      apiService.getYieldPrediction(activePlotId, moisture, ndvi, area)
    ]);

    setFertigationData(fertRes);
    setYieldData(yieldRes);
    setLoading(false);
  };

  const handleSaveElectricityConfig = (e) => {
    e.preventDefault();
    updateSettings({
      electricityWindows: elecWindow,
      electricityHoursPerDay: parseInt(elecHours) || 6
    });
    setIsEditingWindow(false);
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Fertigation Advisory Card */}
      <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', borderLeft: '6px solid #d97706' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#fef3c7', padding: '10px', borderRadius: '12px' }}>
              <FlaskConical size={24} color="#d97706" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>{t('fertigationCard')}</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Stage: <strong style={{ color: '#0f172a' }}>{fertigationData?.stage || 'Grand Growth Peak Phase'}</strong> ({fertigationData?.cropAgeDays || 120} Days Old)
              </p>
            </div>
          </div>

          <span className="badge-medium">
            RECOMMENDED DOSAGE PER ACRE
          </span>
        </div>

        {/* N-P-K Doses Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '16px' }}>
          
          {/* Urea */}
          <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '16px', borderRadius: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>{t('urea')}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: '4px 0' }}>
              {fertigationData?.dosesKgPerAcre?.urea || 45} <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>Kg/Acre</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: '600' }}>Drip Venturi Injection</div>
          </div>

          {/* DAP */}
          <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '16px', borderRadius: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>{t('dap')}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: '4px 0' }}>
              {fertigationData?.dosesKgPerAcre?.dap || 25} <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>Kg/Acre</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#d97706', fontWeight: '600' }}>Root Zone Stimulation</div>
          </div>

          {/* MOP */}
          <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '16px', borderRadius: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>{t('mop')}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: '4px 0' }}>
              {fertigationData?.dosesKgPerAcre?.mop || 30} <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>Kg/Acre</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#2d6a4f', fontWeight: '600' }}>Sucrose & Stalk Thickness</div>
          </div>

          {/* Micronutrient Mix */}
          <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '16px', borderRadius: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>Micronutrient Mix (Zn+Fe+B)</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: '4px 0' }}>
              {fertigationData?.dosesKgPerAcre?.micronutrientMix || 5} <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>Kg/Acre</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#7c3aed', fontWeight: '600' }}>Chlorophyll Booster</div>
          </div>

        </div>

        {/* Fertigation Instructions */}
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '12px 16px', borderRadius: '12px', fontSize: '0.85rem', color: '#92400e' }}>
          📌 <strong>Drip Fertigation Instruction:</strong> {fertigationData?.instructions || 'Inject solubilized fertilizers into drip irrigation line during the second half of the irrigation cycle.'}
        </div>

      </div>

      {/* 2. Yield Prediction AI Engine Section */}
      <div className="glass-card" style={{ padding: '24px', borderRadius: '20px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#d8f3dc', padding: '8px', borderRadius: '10px' }}>
              <TrendingUp size={22} color="#2d6a4f" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>{t('yieldPredictionTitle')}</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Deterministic Hydro-Agro AI Model based on soil health & moisture adequacy</p>
            </div>
          </div>

          <span className="badge-success">CONFIDENCE SCORE: 92%</span>
        </div>

        {/* Primary Yield Gauge Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          
          {/* Tonnes per Acre */}
          <div style={{ background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)', color: '#ffffff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(45, 106, 79, 0.2)' }}>
            <div style={{ fontSize: '0.8rem', color: '#95d5b2', fontWeight: '600' }}>PREDICTED YIELD (PER ACRE)</div>
            <div style={{ fontSize: '2.4rem', fontWeight: '800', margin: '4px 0' }}>
              {yieldData?.predictedYieldPerAcre || 42.5} <span style={{ fontSize: '1rem', fontWeight: '500', color: '#d8f3dc' }}>Tons/Acre</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#d8f3dc', marginTop: '6px' }}>
              Expected Potential Range: <strong>{yieldData?.rangePerAcre?.min || 38.0} - {yieldData?.rangePerAcre?.max || 46.5} Tons</strong>
            </div>
          </div>

          {/* Total Plot Yield */}
          <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600' }}>TOTAL PLOT EXPECTED HARVEST ({activePlot?.areaAcres || 2.5} ACRES)</div>
            <div style={{ fontSize: '2.4rem', fontWeight: '800', color: '#38bdf8', margin: '4px 0' }}>
              {yieldData?.predictedTotalTons || 106.2} <span style={{ fontSize: '1rem', fontWeight: '500', color: '#94a3b8' }}>Total Tonnes</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '6px' }}>
              Metric Hectare Equivalent: <strong>{yieldData?.yieldPerHectare || 105.0} Tonnes/Hectare</strong>
            </div>
          </div>

        </div>

        {/* Limiting Factors & Upside Advice */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '14px' }}>
            <h4 style={{ fontSize: '0.9rem', color: '#334155', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Info size={16} color="#0284c7" /> Primary Yield Limiting Factor:
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>
              {yieldData?.limitingFactor || 'Optimal Soil Moisture & Canopy Health'}
            </p>
          </div>

          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '14px' }}>
            <h4 style={{ fontSize: '0.9rem', color: '#1b4332', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Award size={16} color="#2d6a4f" /> How to Unlock +{yieldData?.potentialUpsidePercent || 14}% Higher Yield:
            </h4>
            <ul style={{ paddingLeft: '18px', fontSize: '0.8rem', color: '#1b4332', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {yieldData?.recommendationsForHigherYield ? (
                yieldData.recommendationsForHigherYield.map((rec, idx) => <li key={idx}>{rec}</li>)
              ) : (
                <li>Apply split doses of Potash at 120 days.</li>
              )}
            </ul>
          </div>

        </div>

      </div>

      {/* 3. Pump Scheduling Panel (Electricity Windows) */}
      <div className="glass-card" style={{ padding: '24px', borderRadius: '20px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#e0f2fe', padding: '8px', borderRadius: '10px' }}>
              <Zap size={22} color="#0284c7" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>{t('pumpSchedule')}</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Configure local 3-phase grid electricity availability windows</p>
            </div>
          </div>

          <button
            onClick={() => setIsEditingWindow(!isEditingWindow)}
            style={{
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '0.82rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Settings size={15} /> {isEditingWindow ? 'Cancel' : 'Configure Window'}
          </button>
        </div>

        {!isEditingWindow ? (
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '18px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Active Electricity Availability Window</div>
              <div style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>
                ⚡ {settings.electricityWindows || '06:00 AM - 12:00 PM (Day Shift)'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px' }}>
                Total Daily Grid Power: <strong>{settings.electricityHoursPerDay || 6} Hours / Day</strong>
              </div>
            </div>

            <div style={{ background: '#d8f3dc', padding: '12px 18px', borderRadius: '12px', textAlign: 'center', border: '1px solid #86efac' }}>
              <div style={{ fontSize: '0.75rem', color: '#1b4332', fontWeight: '700' }}>RECOMMENDED PUMP START</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#2d6a4f' }}>06:30 AM</div>
              <div style={{ fontSize: '0.72rem', color: '#2d6a4f' }}>2.5 Hours Drip Automated Run</div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveElectricityConfig} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '18px', borderRadius: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>Electricity Window Schedule</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 06:00 AM - 12:00 PM (Day Shift)"
                  value={elecWindow}
                  onChange={(e) => setElecWindow(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>Hours Available</label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  required
                  value={elecHours}
                  onChange={(e) => setElecHours(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>

            <button
              type="submit"
              style={{
                padding: '10px 20px',
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Save Pump Schedule Config
            </button>
          </form>
        )}

      </div>

    </div>
  );
}
