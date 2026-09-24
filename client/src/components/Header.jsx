import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Globe, 
  MapPin, 
  Calendar, 
  Sun, 
  ChevronDown, 
  Layers
} from 'lucide-react';

export default function Header() {
  const { farmer, plots, activePlot, activePlotId, switchPlot, language, setLanguage, t } = useApp();

  // Calculate crop age in days
  let cropAgeDays = 120;
  if (activePlot && activePlot.plantingDate) {
    const pDate = new Date(activePlot.plantingDate);
    const today = new Date();
    const diffTime = Math.abs(today - pDate);
    cropAgeDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="glass-card no-print" style={{ margin: '16px 24px 0 24px', padding: '14px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
      
      {/* Left: Active Plot Selector & Crop Summary */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '6px 14px', borderRadius: '12px' }}>
          <Layers size={18} color="#2d6a4f" />
          <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#1b4332' }}>{t('activePlot')}:</span>
          
          {plots && plots.length > 0 ? (
            <select
              value={activePlotId || ''}
              onChange={(e) => switchPlot(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#1b4332',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {plots.map(p => (
                <option key={p.id} value={p.id}>
                  {p.plotName} ({p.areaAcres} Acres)
                </option>
              ))}
            </select>
          ) : (
            <span style={{ fontSize: '0.88rem', fontWeight: '700' }}>No Plots Registered</span>
          )}
        </div>

        {activePlot && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.82rem', color: '#475569' }}>
            <span style={{ background: '#e2e8f0', padding: '3px 8px', borderRadius: '6px', fontWeight: '600' }}>
              🌱 {activePlot.cropVariety || 'Sugarcane Co-86032'}
            </span>
            <span>
              📅 {t('cropAge')}: <strong style={{ color: '#0f172a' }}>{cropAgeDays} Days</strong>
            </span>
          </div>
        )}
      </div>

      {/* Right: Language Selector & Date Widget */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        
        {/* Weather Brief */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#334155', background: '#e0f2fe', padding: '6px 12px', borderRadius: '10px' }}>
          <Sun size={16} color="#0284c7" />
          <span style={{ fontWeight: '600' }}>32°C</span>
          <span style={{ color: '#64748b' }}>| Sunny</span>
        </div>

        {/* Date Display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#64748b' }}>
          <Calendar size={15} />
          <span>{currentDateStr}</span>
        </div>

        {/* Multilingual Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ffffff', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '10px' }}>
          <Globe size={16} color="#475569" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: '#334155',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="en">English</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="kn">ಕನ್ನಡ (Kannada)</option>
            <option value="mr">मराठी (Marathi)</option>
          </select>
        </div>

      </div>
    </header>
  );
}
