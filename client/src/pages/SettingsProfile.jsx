import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { storageApi } from '../utils/storage';
import { 
  User, 
  Layers, 
  Globe, 
  RefreshCw, 
  Plus, 
  Save, 
  CheckCircle,
  ShieldCheck,
  Smartphone
} from 'lucide-react';

export default function SettingsProfile() {
  const { farmer, farmerId, plots, activePlot, switchPlot, language, setLanguage, updateSettings, t, refreshData } = useApp();

  // Profile Form state
  const [name, setName] = useState(farmer?.name || '');
  const [mobile, setMobile] = useState(farmer?.mobile || '');
  const [village, setVillage] = useState(farmer?.village || '');
  const [taluk, setTaluk] = useState(farmer?.taluk || '');
  const [district, setDistrict] = useState(farmer?.district || '');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Add Plot Form state
  const [showAddPlot, setShowAddPlot] = useState(false);
  const [newPlotName, setNewPlotName] = useState('');
  const [newArea, setNewArea] = useState('2.5');
  const [newSoil, setNewSoil] = useState('Black Cotton Soil');
  const [newVariety, setNewVariety] = useState('Co-86032');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

  // Handle Profile Update
  const handleSaveProfile = (e) => {
    e.preventDefault();
    storageApi.saveFarmer({
      id: farmerId,
      name,
      mobile,
      village,
      taluk,
      district
    });
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
    refreshData();
  };

  // Handle Add Plot
  const handleAddPlotSubmit = (e) => {
    e.preventDefault();
    if (!newPlotName) return;

    const newPlotId = `p_${Date.now()}`;
    const p = storageApi.savePlot({
      id: newPlotId,
      farmerId: farmerId,
      plotName: newPlotName,
      areaAcres: parseFloat(newArea) || 2.5,
      soilType: newSoil,
      cropVariety: newVariety,
      plantingDate: newDate
    });

    switchPlot(newPlotId);
    setShowAddPlot(false);
    setNewPlotName('');
    refreshData();
  };

  // Reset System Data
  const handleResetData = () => {
    if (window.confirm('Reset all localStorage data back to original seed demo values? Any custom logs will be reset.')) {
      storageApi.resetAllData();
      window.location.reload();
    }
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Farmer Profile Manager */}
      <div className="glass-card" style={{ padding: '24px', borderRadius: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ background: '#d8f3dc', padding: '10px', borderRadius: '12px' }}>
            <User size={22} color="#2d6a4f" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Farmer Account Profile</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Edit your personal registration details (saved locally)</p>
          </div>
        </div>

        {profileSuccess && (
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#1b4332', padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={16} /> Farmer profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSaveProfile}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>Farmer Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>Mobile Number</label>
              <input
                type="text"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>Village</label>
              <input
                type="text"
                required
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>Taluk</label>
              <input
                type="text"
                required
                value={taluk}
                onChange={(e) => setTaluk(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>District</label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>

          <button
            type="submit"
            style={{
              padding: '10px 20px',
              background: '#2d6a4f',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Save size={16} /> Save Profile Changes
          </button>
        </form>
      </div>

      {/* 2. Registered Plots Management */}
      <div className="glass-card" style={{ padding: '24px', borderRadius: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#e0f2fe', padding: '10px', borderRadius: '12px' }}>
              <Layers size={22} color="#0284c7" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Manage Sugarcane Plots</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Switch or add new plots owned by this farmer</p>
            </div>
          </div>

          <button
            onClick={() => setShowAddPlot(!showAddPlot)}
            style={{
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus size={16} /> Add New Plot
          </button>
        </div>

        {/* Existing Plots Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: showAddPlot ? '20px' : '0' }}>
          {plots.map(p => (
            <div 
              key={p.id}
              onClick={() => switchPlot(p.id)}
              style={{
                border: activePlot?.id === p.id ? '2px solid #2d6a4f' : '1px solid #e2e8f0',
                background: activePlot?.id === p.id ? '#f0fdf4' : '#ffffff',
                borderRadius: '14px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>{p.plotName}</h4>
                {activePlot?.id === p.id && (
                  <span style={{ background: '#2d6a4f', color: '#fff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '99px', fontWeight: '700' }}>ACTIVE</span>
                )}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569' }}>Area: {p.areaAcres} Acres</div>
              <div style={{ fontSize: '0.82rem', color: '#475569' }}>Variety: {p.cropVariety}</div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>Soil: {p.soilType}</div>
            </div>
          ))}
        </div>

        {/* Form to Add New Plot */}
        {showAddPlot && (
          <form onSubmit={handleAddPlotSubmit} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '18px', borderRadius: '14px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '12px' }}>Register New Sugarcane Plot</h4>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>Plot Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. South Canal Field B"
                value={newPlotName}
                onChange={(e) => setNewPlotName(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px' }}>Area (Acres)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newArea}
                  onChange={(e) => setNewArea(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px' }}>Soil Type</label>
                <select
                  value={newSoil}
                  onChange={(e) => setNewSoil(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                >
                  <option value="Black Cotton Soil">Black Cotton Soil</option>
                  <option value="Red Loamy Soil">Red Loamy Soil</option>
                  <option value="Alluvial Soil">Alluvial Soil</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px' }}>Variety</label>
                <select
                  value={newVariety}
                  onChange={(e) => setNewVariety(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                >
                  <option value="Co-86032">Co-86032</option>
                  <option value="CoM-0265">CoM-0265</option>
                  <option value="Co-0238">Co-0238</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              style={{
                padding: '10px 18px',
                background: '#40916c',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Add Plot to Farmer Profile
            </button>
          </form>
        )}
      </div>

      {/* 3. System Preferences & Multilingual Settings */}
      <div className="glass-card" style={{ padding: '24px', borderRadius: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ background: '#fef3c7', padding: '10px', borderRadius: '12px' }}>
            <Globe size={22} color="#d97706" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>{t('selectLanguage')}</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Language configuration matching the LLM Advisory concept</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {[
            { code: 'en', label: 'English' },
            { code: 'hi', label: 'हिंदी (Hindi)' },
            { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
            { code: 'mr', label: 'मराठी (Marathi)' }
          ].map(lang => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                border: language === lang.code ? '2px solid #2d6a4f' : '1px solid #cbd5e1',
                background: language === lang.code ? '#f0fdf4' : '#ffffff',
                color: language === lang.code ? '#1b4332' : '#475569',
                fontWeight: language === lang.code ? '700' : '500',
                cursor: 'pointer'
              }}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* Reset Data Button */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>Reset Local Storage Data</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Re-populate initial sugarcane seed data (Ramesh Patil - Sangli)</div>
          </div>
          <button
            onClick={handleResetData}
            style={{
              background: '#ffe4e6',
              border: '1px solid #fca5a5',
              color: '#e11d48',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={15} /> Reset Seed Data
          </button>
        </div>

      </div>

    </div>
  );
}
