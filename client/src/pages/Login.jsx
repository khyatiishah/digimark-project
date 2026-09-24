import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { storageApi } from '../utils/storage';
import { Sprout, Phone, User, MapPin, Plus, CheckCircle, ShieldCheck } from 'lucide-react';

export default function Login() {
  const { loginFarmer } = useApp();
  const [isRegistering, setIsRegistering] = useState(false);

  // Login state
  const [loginMobile, setLoginMobile] = useState('');
  const [loginError, setLoginError] = useState('');

  // Registration state
  const [regName, setRegName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regVillage, setRegVillage] = useState('');
  const [regTaluk, setRegTaluk] = useState('');
  const [regDistrict, setRegDistrict] = useState('');
  
  // Initial plot registration
  const [plotName, setPlotName] = useState('Plot 1 - Sugarcane Field');
  const [areaAcres, setAreaAcres] = useState('3.0');
  const [soilType, setSoilType] = useState('Black Cotton Soil');
  const [cropVariety, setCropVariety] = useState('Co-86032');
  const [plantingDate, setPlantingDate] = useState('2025-10-01');

  // Handle direct login via registered mobile or demo load
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');

    const farmers = storageApi.getFarmers();
    const found = farmers.find(f => f.mobile === loginMobile || f.id === loginMobile);

    if (found) {
      loginFarmer(found.id);
    } else if (farmers.length > 0) {
      // Default fallback to first farmer for quick testing
      loginFarmer(farmers[0].id);
    } else {
      setLoginError('Mobile number not found. Please register as a new farmer.');
    }
  };

  // Handle new Farmer + Plot registration
  const handleRegisterSubmit = (e) => {
    e.preventDefault();

    if (!regName || !regMobile || !regVillage || !regTaluk || !regDistrict) {
      alert('Please fill in all mandatory farmer registration fields.');
      return;
    }

    const farmerId = `f_${Date.now()}`;
    const plotId = `p_${Date.now()}`;

    const newFarmer = {
      id: farmerId,
      name: regName,
      mobile: regMobile,
      village: regVillage,
      taluk: regTaluk,
      district: regDistrict,
      plots: [plotId]
    };

    const newPlot = {
      id: plotId,
      farmerId: farmerId,
      plotName: plotName || 'Main Sugarcane Plot',
      areaAcres: parseFloat(areaAcres) || 2.5,
      soilType: soilType || 'Black Cotton Soil',
      cropVariety: cropVariety || 'Co-86032',
      plantingDate: plantingDate || new Date().toISOString().split('T')[0]
    };

    storageApi.saveFarmer(newFarmer);
    storageApi.savePlot(newPlot);
    loginFarmer(farmerId);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #081c15 0%, #1b4332 50%, #2d6a4f 100%)', padding: '20px' }}>
      
      <div className="glass-card" style={{ width: '100%', maxWidth: '540px', padding: '36px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)' }}>
        
        {/* Header Icon */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '64px', height: '64px', background: '#52b788', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', boxShadow: '0 8px 16px rgba(82, 183, 136, 0.4)' }}>
            <Sprout size={36} color="#081c15" />
          </div>
          <h1 style={{ fontSize: '1.65rem', color: '#0f172a', fontWeight: '700' }}>Sugarcane AI Advisory</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>IoT Sensor Telemetry & Smart Irrigation Platform</p>
        </div>

        {/* Tab Selector: Login vs Register */}
        <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px', marginBottom: '24px' }}>
          <button
            onClick={() => setIsRegistering(false)}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '0.9rem',
              cursor: 'pointer',
              background: !isRegistering ? '#ffffff' : 'transparent',
              color: !isRegistering ? '#1b4332' : '#64748b',
              boxShadow: !isRegistering ? '0 2px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Farmer Login
          </button>
          <button
            onClick={() => setIsRegistering(true)}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '0.9rem',
              cursor: 'pointer',
              background: isRegistering ? '#ffffff' : 'transparent',
              color: isRegistering ? '#1b4332' : '#64748b',
              boxShadow: isRegistering ? '0 2px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            New Registration
          </button>
        </div>

        {!isRegistering ? (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Mobile Number or Farmer ID
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="e.g. 9876543210 (or click Quick Demo Login)"
                  value={loginMobile}
                  onChange={(e) => setLoginMobile(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
              </div>
              {loginError && <p style={{ color: '#e11d48', fontSize: '0.8rem', marginTop: '6px' }}>{loginError}</p>}
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '14px',
                background: '#2d6a4f',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(45, 106, 79, 0.3)',
                marginBottom: '16px'
              }}
            >
              Login to Dashboard
            </button>

            {/* Quick Demo Login Preset Button */}
            <div style={{ textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '8px' }}>Demo Mode Available:</p>
              <button
                type="button"
                onClick={() => loginFarmer('f_101')}
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #86efac',
                  color: '#1b4332',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ShieldCheck size={16} /> Load Demo Farmer (Ramesh Patil - Sangli)
              </button>
            </div>
          </form>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegisterSubmit} style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '4px' }}>
            
            <h4 style={{ fontSize: '0.9rem', color: '#2d6a4f', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>1. Farmer Personal Details</h4>
            
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155' }}>Farmer Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Suresh Kumar Deshmukh"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155' }}>Mobile Number *</label>
              <input
                type="tel"
                required
                placeholder="10-digit mobile number"
                value={regMobile}
                onChange={(e) => setRegMobile(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#334155' }}>Village *</label>
                <input
                  type="text"
                  required
                  placeholder="Village"
                  value={regVillage}
                  onChange={(e) => setRegVillage(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#334155' }}>Taluk *</label>
                <input
                  type="text"
                  required
                  placeholder="Taluk"
                  value={regTaluk}
                  onChange={(e) => setRegTaluk(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#334155' }}>District *</label>
                <input
                  type="text"
                  required
                  placeholder="District"
                  value={regDistrict}
                  onChange={(e) => setRegDistrict(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <h4 style={{ fontSize: '0.9rem', color: '#2d6a4f', marginBottom: '12px', borderTop: '1px dashed #cbd5e1', paddingTop: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>2. Register Primary Sugarcane Plot</h4>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155' }}>Plot Name</label>
              <input
                type="text"
                placeholder="e.g. Riverbank Plot A"
                value={plotName}
                onChange={(e) => setPlotName(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#334155' }}>Area (Acres)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="50"
                  value={areaAcres}
                  onChange={(e) => setAreaAcres(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#334155' }}>Soil Type</label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                >
                  <option value="Black Cotton Soil">Black Cotton Soil (Clay)</option>
                  <option value="Red Loamy Soil">Red Loamy Soil</option>
                  <option value="Alluvial Soil">Alluvial Soil</option>
                  <option value="Sandy Loam">Sandy Loam</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#334155' }}>Cane Variety</label>
                <select
                  value={cropVariety}
                  onChange={(e) => setCropVariety(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                >
                  <option value="Co-86032">Co-86032 (Nira)</option>
                  <option value="CoM-0265">CoM-0265 (Phule 265)</option>
                  <option value="Co-0238">Co-0238</option>
                  <option value="Co-92005">Co-92005</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#334155' }}>Planting Date</label>
                <input
                  type="date"
                  value={plantingDate}
                  onChange={(e) => setPlantingDate(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '14px',
                background: '#40916c',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(64, 145, 108, 0.3)'
              }}
            >
              Complete Registration & Launch
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
