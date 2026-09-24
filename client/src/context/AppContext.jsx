import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageApi, initSeedData } from '../utils/storage';
import { translations } from '../utils/translations';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Ensure seed data exists on load
  useEffect(() => {
    initSeedData();
  }, []);

  const [farmerId, setFarmerId] = useState(() => storageApi.getActiveFarmerId());
  const [plotId, setPlotId] = useState(() => storageApi.getActivePlotId());
  const [settings, setSettingsState] = useState(() => storageApi.getSettings());
  const [language, setLanguageState] = useState(() => settings.language || 'en');
  const [dataVersion, setDataVersion] = useState(0);

  // Sync state with storage when dataVersion or farmerId/plotId changes
  const farmer = storageApi.getFarmerById(farmerId);
  const plots = storageApi.getPlots(farmerId);
  const activePlot = storageApi.getPlotById(plotId) || (plots.length > 0 ? plots[0] : null);
  const alerts = storageApi.getAlerts(activePlot ? activePlot.id : null);

  const refreshData = () => {
    setDataVersion(prev => prev + 1);
  };

  const switchPlot = (newPlotId) => {
    storageApi.setActivePlotId(newPlotId);
    setPlotId(newPlotId);
    refreshData();
  };

  const setLanguage = (langCode) => {
    setLanguageState(langCode);
    storageApi.saveSettings({ language: langCode });
  };

  const updateSettings = (newSettings) => {
    const updated = storageApi.saveSettings(newSettings);
    setSettingsState(updated);
    if (newSettings.language) {
      setLanguageState(newSettings.language);
    }
    refreshData();
  };

  const loginFarmer = (fId) => {
    storageApi.setActiveFarmerId(fId);
    setFarmerId(fId);
    const farmerPlots = storageApi.getPlots(fId);
    if (farmerPlots.length > 0) {
      storageApi.setActivePlotId(farmerPlots[0].id);
      setPlotId(farmerPlots[0].id);
    }
    refreshData();
  };

  const logoutFarmer = () => {
    setFarmerId(null);
    setPlotId(null);
  };

  // Translation lookup helper
  const t = (key) => {
    const dict = translations[language] || translations.en;
    return dict[key] || translations.en[key] || key;
  };

  return (
    <AppContext.Provider value={{
      farmer,
      farmerId,
      plots,
      activePlot,
      activePlotId: activePlot ? activePlot.id : null,
      switchPlot,
      language,
      setLanguage,
      t,
      settings,
      updateSettings,
      alerts,
      loginFarmer,
      logoutFarmer,
      refreshData
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
