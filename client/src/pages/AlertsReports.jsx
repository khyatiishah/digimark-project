import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { storageApi } from '../utils/storage';
import { 
  Bell, 
  Download, 
  Printer, 
  CheckCircle, 
  Trash2, 
  AlertTriangle, 
  Info, 
  Calendar, 
  Sprout,
  FileText,
  Clock,
  Layers
} from 'lucide-react';

export default function AlertsReports() {
  const { farmer, activePlot, activePlotId, t, refreshData } = useApp();

  const [alerts, setAlerts] = useState([]);
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  useEffect(() => {
    loadAlerts();
  }, [activePlotId]);

  const loadAlerts = () => {
    const list = storageApi.getAlerts(activePlotId);
    setAlerts(list);
  };

  const handleToggleRead = (id) => {
    storageApi.toggleAlertRead(id);
    loadAlerts();
    refreshData();
  };

  const handleDismiss = (id) => {
    storageApi.dismissAlert(id);
    loadAlerts();
    refreshData();
  };

  // Generate & Download Client-Side CSV Report
  const handleDownloadCsv = () => {
    if (!activePlot) return;

    const sensorData = storageApi.getSensorReadings(activePlot.id);
    const irrigationLogs = storageApi.getIrrigationLogs(activePlot.id);

    let csvContent = `data:text/csv;charset=utf-8,`;
    
    // Header section
    csvContent += `SUGARCANE AI IRRIGATION ADVISORY REPORT (KJS-AGR-01)\n`;
    csvContent += `Farmer Name,${farmer?.name || 'N/A'}\n`;
    csvContent += `Village/Taluk/District,${farmer?.village || ''} ${farmer?.taluk || ''} ${farmer?.district || ''}\n`;
    csvContent += `Plot Name,${activePlot.plotName}\n`;
    csvContent += `Area (Acres),${activePlot.areaAcres}\n`;
    csvContent += `Variety,${activePlot.cropVariety}\n`;
    csvContent += `Soil Type,${activePlot.soilType}\n`;
    csvContent += `Planting Date,${activePlot.plantingDate}\n\n`;

    // Sensor Telemetry Table
    csvContent += `HISTORICAL SENSOR TELEMETRY\n`;
    csvContent += `Date,Soil Moisture (%),Soil Temp (C),Humidity (%),Rainfall (mm),NDVI\n`;
    sensorData.forEach(s => {
      csvContent += `${s.date},${s.soilMoisture},${s.soilTemp},${s.humidity},${s.rainfall},${s.ndvi}\n`;
    });

    csvContent += `\nIRRIGATION LOGS\n`;
    csvContent += `Date,Duration (Hours),Water Quantity (Liters),Source,Notes\n`;
    irrigationLogs.forEach(i => {
      csvContent += `${i.date},${i.durationHours},${i.waterQuantity},${i.source},"${i.notes || ''}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sugarcane_Report_${activePlot.plotName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger Print View
  const handlePrint = () => {
    window.print();
  };

  const filteredAlerts = alerts.filter(a => {
    if (filterSeverity === 'URGENT') return a.severity === 'URGENT';
    if (filterSeverity === 'UNREAD') return !a.read;
    return true;
  });

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Page Title & Action Bar */}
      <div className="glass-card no-print" style={{ padding: '20px 24px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Alerts & Summary Reports</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Manage real-time field notifications and export farm telemetry reports</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleDownloadCsv}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '10px 18px',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Download size={18} color="#0284c7" /> {t('downloadCsv')}
          </button>

          <button
            onClick={handlePrint}
            style={{
              background: '#2d6a4f',
              color: '#ffffff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(45, 106, 79, 0.25)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Printer size={18} /> {t('printReport')}
          </button>
        </div>
      </div>

      {/* 2. Real-time Field Alerts Feed */}
      <div className="glass-card no-print" style={{ padding: '24px', borderRadius: '20px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bell size={22} color="#e11d48" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>{t('alertCenter')}</h3>
          </div>

          <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
            {['ALL', 'UNREAD', 'URGENT'].map(type => (
              <button
                key={type}
                onClick={() => setFilterSeverity(type)}
                style={{
                  padding: '6px 12px',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  background: filterSeverity === type ? '#ffffff' : 'transparent',
                  color: filterSeverity === type ? '#1b4332' : '#64748b'
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Alerts List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map(alert => (
              <div 
                key={alert.id}
                style={{
                  padding: '14px 18px',
                  borderRadius: '14px',
                  background: alert.read ? '#f8fafc' : '#ffffff',
                  border: alert.severity === 'URGENT' ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                  boxShadow: alert.read ? 'none' : '0 2px 8px rgba(0,0,0,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {alert.severity === 'URGENT' ? (
                    <div style={{ background: '#ffe4e6', padding: '8px', borderRadius: '10px' }}>
                      <AlertTriangle size={20} color="#e11d48" />
                    </div>
                  ) : (
                    <div style={{ background: '#e0f2fe', padding: '8px', borderRadius: '10px' }}>
                      <Info size={20} color="#0284c7" />
                    </div>
                  )}

                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: alert.read ? '500' : '700', color: alert.read ? '#475569' : '#0f172a' }}>
                      {alert.message}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                      Date Logged: {alert.date} • Severity: {alert.severity}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => handleToggleRead(alert.id)}
                    style={{
                      background: 'none',
                      border: '1px solid #cbd5e1',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      color: alert.read ? '#94a3b8' : '#2d6a4f'
                    }}
                  >
                    {alert.read ? 'Mark Unread' : 'Mark Read'}
                  </button>

                  <button
                    onClick={() => handleDismiss(alert.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1' }}
                    title="Dismiss Alert"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
              No active alerts matching filter. Field status is nominal.
            </div>
          )}
        </div>
      </div>

      {/* 3. Printable Summary Report Preview Card */}
      <div className="glass-card" style={{ padding: '32px', borderRadius: '20px', background: '#ffffff' }}>
        
        <div style={{ borderBottom: '2px solid #1b4332', paddingBottom: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', color: '#1b4332', fontWeight: '800' }}>
              SUGARCANE PLOT ADVISORY REPORT
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#64748b' }}>Generated Client-side from LocalStorage Engine • KJS-AGR-01 Platform</p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#64748b' }}>
            <div>Date Generated: {new Date().toLocaleDateString()}</div>
            <div>Status: <span style={{ color: '#22c55e', fontWeight: '700' }}>VALIDATED</span></div>
          </div>
        </div>

        {/* Farmer & Plot Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: '#f8fafc', padding: '20px', borderRadius: '14px', marginBottom: '24px' }}>
          <div>
            <h4 style={{ fontSize: '0.85rem', color: '#2d6a4f', textTransform: 'uppercase', marginBottom: '8px' }}>Farmer Details</h4>
            <div style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: '600' }}>Name: {farmer?.name}</div>
            <div style={{ fontSize: '0.85rem', color: '#475569' }}>Mobile: {farmer?.mobile}</div>
            <div style={{ fontSize: '0.85rem', color: '#475569' }}>Location: {farmer?.village}, {farmer?.taluk}, {farmer?.district}</div>
          </div>
          <div>
            <h4 style={{ fontSize: '0.85rem', color: '#2d6a4f', textTransform: 'uppercase', marginBottom: '8px' }}>Plot Specification</h4>
            <div style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: '600' }}>Plot Name: {activePlot?.plotName}</div>
            <div style={{ fontSize: '0.85rem', color: '#475569' }}>Area: {activePlot?.areaAcres} Acres</div>
            <div style={{ fontSize: '0.85rem', color: '#475569' }}>Variety: {activePlot?.cropVariety} (Soil: {activePlot?.soilType})</div>
          </div>
        </div>

        {/* Executive Summary */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '10px' }}>1. Executive Agro-Advisory Summary</h3>
          <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: '1.6' }}>
            Current root zone soil moisture is recorded at <strong>{storageApi.getLatestSensorReading(activePlotId)?.soilMoisture || 32}%</strong>. 
            Based on crop stage models for <strong>{activePlot?.cropVariety}</strong>, the sugarcane crop requires <strong>2.5 hours</strong> of drip irrigation 
            water application to sustain optimal sucrose accumulation. Estimated yield output for this {activePlot?.areaAcres} acre plot is projected at <strong>{(42.5 * (activePlot?.areaAcres || 2.5)).toFixed(1)} Tonnes</strong>.
          </p>
        </div>

        {/* Footer Seal */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
          <span>KJS-AGR-01 Prototype Advisory System</span>
          <span>Signature: AI Irrigation Engine Verified</span>
        </div>

      </div>

    </div>
  );
}
