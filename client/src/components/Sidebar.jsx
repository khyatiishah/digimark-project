import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Sprout, 
  LayoutDashboard, 
  Droplet, 
  FlaskConical, 
  Bell, 
  Settings, 
  LogOut,
  ChevronRight
} from 'lucide-react';

export default function Sidebar() {
  const { farmer, logoutFarmer, t, alerts } = useApp();

  const unreadAlertsCount = alerts ? alerts.filter(a => !a.read).length : 0;

  const navItems = [
    { path: '/dashboard', label: t('navDashboard'), icon: LayoutDashboard },
    { path: '/sensors', label: t('navSensors'), icon: Droplet },
    { path: '/fertigation', label: t('navFertigation'), icon: FlaskConical },
    { 
      path: '/alerts', 
      label: t('navAlerts'), 
      icon: Bell,
      badge: unreadAlertsCount > 0 ? unreadAlertsCount : null
    },
    { path: '/settings', label: t('navSettings'), icon: Settings },
  ];

  return (
    <aside className="sidebar-wrapper no-print">
      {/* Brand Header */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ background: '#52b788', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sprout size={24} color="#081c15" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.15rem', color: '#ffffff', fontWeight: '700', lineHeight: 1.2 }}>Sugarcane AI</h2>
          <p style={{ fontSize: '0.72rem', color: '#95d5b2', letterSpacing: '0.5px' }}>IRRIGATION ADVISORY</p>
        </div>
      </div>

      {/* Farmer Profile Card */}
      {farmer && (
        <div style={{ margin: '16px 16px 8px 16px', padding: '12px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#2d6a4f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: '700' }}>
              {farmer.name ? farmer.name.charAt(0) : 'F'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: '#ffffff', fontWeight: '600', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{farmer.name}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>📍 {farmer.village}, {farmer.district}</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav style={{ padding: '16px 12px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '10px',
                color: isActive ? '#ffffff' : '#94a3b8',
                backgroundColor: isActive ? '#2d6a4f' : 'transparent',
                fontWeight: isActive ? '600' : '500',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                fontSize: '0.9rem'
              })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {item.badge && (
                  <span style={{ background: '#e11d48', color: '#fff', borderRadius: '99px', padding: '2px 8px', fontSize: '0.72rem', fontWeight: '700' }}>
                    {item.badge}
                  </span>
                )}
                <ChevronRight size={14} opacity={0.5} />
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* System Status / Logout Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '0.75rem', color: '#95d5b2' }}>
          <span className="live-dot"></span>
          <span>IoT Gateway Online (Port 5001)</span>
        </div>
        <button
          onClick={logoutFarmer}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px',
            background: 'rgba(239, 68, 68, 0.12)',
            color: '#f87171',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.82rem',
            fontWeight: '600'
          }}
        >
          <LogOut size={16} />
          <span>{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
}
