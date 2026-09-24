import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';

import Sidebar from './components/Sidebar';
import Header from './components/Header';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import IrrigationSensors from './pages/IrrigationSensors';
import FertigationYield from './pages/FertigationYield';
import AlertsReports from './pages/AlertsReports';
import SettingsProfile from './pages/SettingsProfile';

function MainLayout() {
  const { farmer } = useApp();

  if (!farmer) {
    return <Login />;
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Right Main Body Content */}
      <div className="main-content">
        <Header />

        <main style={{ flexGrow: 1, overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/sensors" element={<IrrigationSensors />} />
            <Route path="/fertigation" element={<FertigationYield />} />
            <Route path="/alerts" element={<AlertsReports />} />
            <Route path="/settings" element={<SettingsProfile />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    </AppProvider>
  );
}
