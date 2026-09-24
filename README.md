# 🌾 AI-Powered Irrigation Advisory System for Sugarcane

> **Use Case KJS-AGR-01**: An integrated decision-support platform for sugarcane farmers in India, combining IoT telemetry, microclimate weather forecasts, and AI-driven irrigation & fertigation recommendations.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher

---

### Step 1: Install All Dependencies

Run the following command from the root directory to install packages for root, Express server, and Vite client:

```bash
npm run install:all
```

Or install individually:

```bash
# 1. Install root orchestrator
npm install

# 2. Install Express Backend dependencies
cd server && npm install

# 3. Install React Client dependencies
cd ../client && npm install
```

---

### Step 2: Start the Application

You can launch both the Express API Server (Port 5001) and Vite React Client (Port 3000) simultaneously with one command from the project root:

```bash
npm run dev
```

Alternatively, run them in separate terminal windows:

#### Terminal 1: Backend Server (Port 5001)
```bash
cd server
npm start
```
*Health Check*: [http://localhost:5001/api/health](http://localhost:5001/api/health)

#### Terminal 2: React Frontend (Port 3000)
```bash
cd client
npm run dev
```
*App URL*: [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Project Architecture & Folder Structure

```
agriculturre/
├── package.json                 # Root concurrency orchestrator
├── README.md                    # Comprehensive documentation & architecture guide
│
├── server/                      # Express Node.js Backend API
│   ├── package.json
│   └── src/
│       └── server.js            # Express API endpoints & rule-based AI engine
│
└── client/                      # Vite React Frontend
    ├── package.json
    ├── vite.config.js           # Vite config with /api proxy target (port 5001)
    ├── index.html               # Main HTML entry with Google Fonts (Outfit & Plus Jakarta)
    └── src/
        ├── index.css            # Agro-themed design system tokens & glassmorphism
        ├── main.jsx             # React DOM root entry
        ├── App.jsx              # Router & authentication wrapper
        ├── context/
        │   └── AppContext.jsx   # Global state, active plot switcher & translations
        ├── services/
        │   └── api.js           # REST API fetch client with offline simulation fallback
        ├── utils/
        │   ├── storage.js       # LocalStorage wrapper & seed demo data generator
        │   └── translations.js  # Multilingual dictionary (English, Hindi, Kannada, Marathi)
        ├── components/
        │   ├── Sidebar.jsx      # Left navigation bar with unread alert badge
        │   └── Header.jsx       # Plot selector dropdown, crop age & language switcher
        └── pages/
            ├── Login.jsx            # 1. Farmer Login & Registration
            ├── Dashboard.jsx        # 2. Field Overview & AI Advisory Card
            ├── IrrigationSensors.jsx# 3. 30-Day IoT Telemetry Charts & Manual Log CRUD
            ├── FertigationYield.jsx # 4. Stage N-P-K Doses, Yield Model & Pump Window
            ├── AlertsReports.jsx    # 5. Alert Feed, CSV Exporter & Printable Report
            └── SettingsProfile.jsx  # 6. Profile, Add Plots & Re-seed Data
```

---

## 🔌 Future Extension Architecture (Production Roadmap)

This project is structured as a full-featured prototype for college / coursework demonstration. In a production deployment, the following components will replace mock modules:

### 1. 🤖 Real ML / AI Model Integration
- **Current Prototype**: Rule-based decision logic combined with FAO-56 crop evapotranspiration calculations in `server/src/server.js` and `client/src/services/api.js`.
- **Production Integration**: 
  - Deploy a Python microservice (FastAPI / Flask) hosting a PyTorch or XGBoost model trained on historical soil moisture sensors, satellite NDVI (Sentinel-2 / Landsat-9), and microclimate weather data.
  - The Express backend calls the Python ML endpoint via `POST /api/v1/predict-water-stress`.

### 2. 📡 Real IoT Telemetry Broker
- **Current Prototype**: Time-series telemetry saved into browser `localStorage` under `"sensorReadings"`.
- **Production Integration**:
  - Deploy an **AWS IoT Core** or **ThingsBoard** MQTT broker.
  - LoRaWAN / GSM soil sensors (Capacitive Moisture V1.2, DS18B20 Temp, Rain Gauge) broadcast MQTT telemetry JSON packets to the broker topic `telemetry/sugarcane/{plotId}`.
  - The Node backend subscribes via `mqtt.connect()` and ingests live telemetry into a time-series database.

### 3. 🗄️ Real Relational / Geospatial Database
- **Current Prototype**: Client-side persistence in `localStorage` managed via `src/utils/storage.js`.
- **Production Integration**:
  - Replace `localStorage` with **PostgreSQL + PostGIS** (or MongoDB with geospatial indexes).
  - Store plot boundary polygons (GeoJSON), historical telemetry in TimescaleDB hyper-tables, and farmer OAuth2 credentials.

---

## 🌐 Multilingual Support

The application includes translations for major sugarcane growing belts in India:
- **English** (`en`)
- **Hindi** (`hi`) - हिंदी
- **Kannada** (`kn`) - ಕನ್ನಡ
- **Marathi** (`mr`) - मराठी

Switch languages instantly using the globe selector in the header bar or in **Settings & Profile**.

---

## 📄 License & Coursework Attribution
Developed for college AI Use-Case Project (**KJS-AGR-01: Sugarcane AI Irrigation Advisory Platform**).
