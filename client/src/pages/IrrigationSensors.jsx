import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { storageApi } from '../utils/storage';
import { apiService } from '../services/api';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { 
  Droplet, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Clock, 
  Activity, 
  CheckCircle,
  Filter,
  Save,
  X
} from 'lucide-react';

export default function IrrigationSensors() {
  const { activePlot, activePlotId, t } = useApp();

  const [sensorHistory, setSensorHistory] = useState([]);
  const [irrigationLogs, setIrrigationLogs] = useState([]);
  const [timeRange, setTimeRange] = useState(14); // 7, 14, 30 days
  const [recommendation, setRecommendation] = useState(null);

  // Modal / Form state for Adding/Editing Irrigation Log
  const [showLogModal, setShowLogModal] = useState(false);
  const [editingLogId, setEditingLogId] = useState(null);
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logDuration, setLogDuration] = useState('2.5');
  const [logWater, setLogWater] = useState('25000');
  const [logSource, setLogSource] = useState('manual');
  const [logNotes, setLogNotes] = useState('');

  // Modal for manual sensor entry
  const [showSensorModal, setShowSensorModal] = useState(false);
  const [newMoisture, setNewMoisture] = useState('38.0');
  const [newTemp, setNewTemp] = useState('27.0');
  const [newHumidity, setNewHumidity] = useState('65.0');
  const [newRainfall, setNewRainfall] = useState('0.0');

  useEffect(() => {
    if (!activePlotId) return;

    loadData();
  }, [activePlotId, timeRange]);

  const loadData = async () => {
    // Load Sensor Telemetry
    const allSensors = storageApi.getSensorReadings(activePlotId);
    const sliced = allSensors.slice(-timeRange);
    setSensorHistory(sliced);

    // Load Irrigation Logs
    const logs = storageApi.getIrrigationLogs(activePlotId);
    setIrrigationLogs(logs);

    // Fetch Recommendation
    const latestReading = allSensors.length > 0 ? allSensors[allSensors.length - 1] : null;
    const rec = await apiService.getRecommendation(
      activePlotId, 
      latestReading ? latestReading.soilMoisture : 32,
      120,
      activePlot ? activePlot.soilType : 'Black Cotton Soil'
    );
    setRecommendation(rec);
  };

  // Handle Add or Update Irrigation Log
  const handleSaveLog = (e) => {
    e.preventDefault();

    if (editingLogId) {
      storageApi.updateIrrigationLog(editingLogId, {
        date: logDate,
        durationHours: parseFloat(logDuration),
        waterQuantity: parseFloat(logWater),
        source: logSource,
        notes: logNotes
      });
    } else {
      storageApi.addIrrigationLog({
        plotId: activePlotId,
        date: logDate,
        durationHours: parseFloat(logDuration),
        waterQuantity: parseFloat(logWater),
        source: logSource,
        notes: logNotes
      });
    }

    closeLogModal();
    loadData();
  };

  // Open Log Modal for Edit
  const openEditLog = (log) => {
    setEditingLogId(log.id);
    setLogDate(log.date);
    setLogDuration(log.durationHours.toString());
    setLogWater(log.waterQuantity.toString());
    setLogSource(log.source);
    setLogNotes(log.notes || '');
    setShowLogModal(true);
  };

  // Delete Log
  const handleDeleteLog = (logId) => {
    if (window.confirm('Are you sure you want to delete this irrigation record?')) {
      storageApi.deleteIrrigationLog(logId);
      loadData();
    }
  };

  const closeLogModal = () => {
    setShowLogModal(false);
    setEditingLogId(null);
    setLogDate(new Date().toISOString().split('T')[0]);
    setLogDuration('2.5');
    setLogWater('25000');
    setLogSource('manual');
    setLogNotes('');
  };

  // Handle Add Sensor Reading
  const handleSaveSensor = (e) => {
    e.preventDefault();

    storageApi.addSensorReading({
      plotId: activePlotId,
      soilMoisture: parseFloat(newMoisture),
      soilTemp: parseFloat(newTemp),
      humidity: parseFloat(newHumidity),
      rainfall: parseFloat(newRainfall),
      ndvi: 0.75
    });

    setShowSensorModal(false);
    loadData();
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Header & Quick Recommendation Countdown */}
      <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)', borderLeft: '6px solid #40916c' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#2d6a4f', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              RECOMMENDED NEXT IRRIGATION SCHEDULE
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>
              {recommendation?.recommendedDate || 'Tomorrow Morning at 6:00 AM'}
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#475569', marginTop: '2px' }}>
              Target Duration: <strong style={{ color: '#1b4332' }}>{recommendation?.recommendedDurationHours || 2.5} Hours</strong> ({recommendation?.recommendedWaterLitersPerAcre?.toLocaleString()} Liters / Acre)
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowSensorModal(true)}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#334155',
                padding: '10px 16px',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Activity size={16} /> + Log Sensor Manual Test
            </button>

            <button
              onClick={() => setShowLogModal(true)}
              style={{
                background: '#2d6a4f',
                color: '#ffffff',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(45, 106, 79, 0.25)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Plus size={16} /> {t('addIrrigationEntry')}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Sensor Readings Trend Chart (Recharts) */}
      <div className="glass-card" style={{ padding: '24px', borderRadius: '20px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>{t('sensorHistory')}</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Root zone Volumetric Moisture (%) vs Rainfall (mm)</p>
          </div>

          {/* Time range selector */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
            {[7, 14, 30].map(days => (
              <button
                key={days}
                onClick={() => setTimeRange(days)}
                style={{
                  padding: '6px 14px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  background: timeRange === days ? '#ffffff' : 'transparent',
                  color: timeRange === days ? '#1b4332' : '#64748b',
                  boxShadow: timeRange === days ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Last {days} Days
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Composed Chart */}
        <div style={{ width: '100%', height: '320px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={sensorHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis yAxisId="left" domain={[10, 80]} label={{ value: 'Moisture (%)', angle: -90, position: 'insideLeft', style: { fontSize: '11px', fill: '#2d6a4f' } }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 40]} label={{ value: 'Rainfall (mm)', angle: 90, position: 'insideRight', style: { fontSize: '11px', fill: '#0284c7' } }} />
              <Tooltip contentStyle={{ background: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: 'none' }} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar yAxisId="right" dataKey="rainfall" name="Rainfall (mm)" fill="#38bdf8" radius={[4, 4, 0, 0]} barSize={16} />
              <Line yAxisId="left" type="monotone" dataKey="soilMoisture" name="Soil Moisture (%)" stroke="#2d6a4f" strokeWidth={3} dot={{ r: 4, fill: '#52b788' }} activeDot={{ r: 7 }} />
              <Line yAxisId="left" type="monotone" dataKey="soilTemp" name="Soil Temp (°C)" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Manual Irrigation Log CRUD Table */}
      <div className="glass-card" style={{ padding: '24px', borderRadius: '20px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>{t('manualLog')}</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Persisted in browser localStorage under "irrigationLogs"</p>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px' }}>Date</th>
                <th style={{ padding: '12px 16px' }}>Duration (Hours)</th>
                <th style={{ padding: '12px 16px' }}>Water Applied (L)</th>
                <th style={{ padding: '12px 16px' }}>Source / Method</th>
                <th style={{ padding: '12px 16px' }}>Agronomic Notes</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {irrigationLogs.length > 0 ? (
                irrigationLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '600', color: '#0f172a' }}>{log.date}</td>
                    <td style={{ padding: '12px 16px' }}>⏱️ {log.durationHours} hrs</td>
                    <td style={{ padding: '12px 16px', fontWeight: '600', color: '#0284c7' }}>
                      💧 {log.waterQuantity.toLocaleString()} L
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ 
                        background: log.source === 'recommended' ? '#d8f3dc' : '#f1f5f9', 
                        color: log.source === 'recommended' ? '#1b4332' : '#475569',
                        padding: '4px 8px', 
                        borderRadius: '6px', 
                        fontSize: '0.75rem', 
                        fontWeight: '700' 
                      }}>
                        {log.source === 'recommended' ? '🤖 AI Recommended' : '👤 Manual Log'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{log.notes || 'Routine irrigation'}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => openEditLog(log)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#40916c', marginRight: '10px' }}
                        title="Edit Entry"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e11d48' }}
                        title="Delete Entry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                    No irrigation logs found for this plot. Click "+ Add Irrigation Entry" to log your first run.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* MODAL: ADD / EDIT IRRIGATION LOG */}
      {showLogModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '28px', borderRadius: '20px', background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>
                {editingLogId ? 'Edit Irrigation Record' : 'Add Manual Irrigation Record'}
              </h3>
              <button onClick={closeLogModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveLog}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>Irrigation Date</label>
                <input
                  type="date"
                  required
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>Duration (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="24"
                    required
                    value={logDuration}
                    onChange={(e) => setLogDuration(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>Water Applied (Liters)</label>
                  <input
                    type="number"
                    step="500"
                    required
                    value={logWater}
                    onChange={(e) => setLogWater(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>Source / Type</label>
                <select
                  value={logSource}
                  onChange={(e) => setLogSource(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                >
                  <option value="manual">Manual Entry / Furrow</option>
                  <option value="recommended">AI Recommended Drip Run</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>Agronomic Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Added Soluble Potash during second half"
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#2d6a4f',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Save Irrigation Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD MANUAL SENSOR READING */}
      {showSensorModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '28px', borderRadius: '20px', background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Log Manual Sensor Test</h3>
              <button onClick={() => setShowSensorModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveSensor}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>Soil Moisture (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newMoisture}
                    onChange={(e) => setNewMoisture(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>Soil Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newTemp}
                    onChange={(e) => setNewTemp(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>Humidity (%)</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={newHumidity}
                    onChange={(e) => setNewHumidity(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>Rainfall Today (mm)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newRainfall}
                    onChange={(e) => setNewRainfall(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#40916c',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Log Telemetry Entry
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
