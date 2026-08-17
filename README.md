# Jarvis Route Editor & Geofence Workbench (Next.js)

An interactive, high-performance geospatial workbench built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Leaflet + Geoman** for visually crafting, editing, and verifying GPS trajectories and geofence zones on real Chennai corridors (OMR, ECR, GST).

---

## ⚡ Key Features

- **Dynamic Interactive Spatial Canvas**: Leaflet + Geoman integration for drawing, moving, editing polylines, adding custom waypoint pins, and manipulating vertex geometry in real-time.
- **CartoDB Dark HUD Aesthetic**: Modern dark mode UI with glassmorphism, glowing status badges, responsive controls, and multiple tile layer options (CartoDB Dark, CartoDB Positron, Satellite).
- **Live OSRM Routing Engine**: Built-in Next.js Route Handler (`/api/route`) that proxies OSRM routing requests to fetch real road-following polyline paths (no straight-line guessing).
- **Curated Corridors & Presets**:
  - **OMR (Navalur) → Mayajaal ECR** *(Original Seed Route)*
  - **TIDEL Park → Siruseri SIPCOT** *(Full OMR IT Corridor)*
  - **Chennai Airport → Guindy Kathipara** *(GST Highway transit)*
  - **Marina Beach → Besant Nagar** *(Coastal Scenic route)*
- **Live Telemetry Readout & Vehicle Speed Simulator**:
  - Real-time vertex & marker counters
  - Great-circle distance calculations (km & miles) via Turf.js
  - Ride duration estimates with configurable speed profiles (20 km/h Cycle, 30 km/h Urban, 50 km/h Arterial, 80 km/h Express)
  - Estimated battery energy consumption (Wh)
- **Geofence & Tier-2 Trigger Engine**:
  - Real-time Point-to-Path geofence inspector with customizable detection radii
  - Verification of `GEOFENCE_ENTER` & `GEOFENCE_EXIT` trigger thresholds
  - Waypoint visual radius bubbles rendered directly on canvas
- **Multi-Target Code & Data Serialization**:
  - **Python Literal**: Ready to drop directly into Jarvis telemetry and simulation scripts
  - **Round-Trip JSON**: Preserves waypoint metadata and coordinate precision
  - **GeoJSON**: Standard FeatureCollection (LineStrings & Points)
  - **CSV**: Index, Latitude, Longitude, Step Distance, Cumulative Distance
  - **cURL**: Ready for direct webhook integration
- **Flexible Data Ingestion**: Drag-and-drop file upload (`.json`, `.geojson`, `.txt`) or raw coordinate array pasting.
- **Direct Telemetry Dispatch Webhook**: Internal endpoint (`/api/telemetry`) to test API payloads.

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build

```bash
npm run build
npm run start
```

---

## 📂 Project Structure

```
maps-geofence-workbench/
├── app/
│   ├── layout.tsx             # Root HTML layout, metadata & dark styling
│   ├── page.tsx               # Master workbench workspace
│   ├── globals.css            # Tailwind directives + Leaflet / HUD overrides
│   └── api/
│       ├── route/route.ts     # OSRM road-routing server proxy
│       └── telemetry/route.ts # Telemetry receiver endpoint stub
├── components/
│   ├── Header.tsx             # Top navigation & action toolbar
│   ├── ImportModal.tsx        # File drag-and-drop & raw data parser
│   ├── Map/
│   │   ├── MapContainer.tsx   # Dynamic client-only Leaflet wrapper
│   │   └── MapView.tsx        # Leaflet + Geoman canvas & layer synchronization
│   └── Sidebar/
│       ├── Sidebar.tsx        # Multi-tab console controller
│       ├── TelemetryStats.tsx # Live metrics, speed slider & consumption meter
│       ├── RoutePresets.tsx   # Verified Chennai route loaders & coordinate router
│       ├── WaypointTable.tsx  # Interactive pin registry & focus controller
│       ├── GeofencePanel.tsx  # Turf.js geofence tester & collision visualizer
│       └── ExportPanel.tsx    # Python, JSON, GeoJSON, CSV export with copy/download
├── lib/
│   ├── types.ts               # TypeScript data models
│   ├── mapConfig.ts           # Map settings, tile configs & route presets
│   ├── geofence.ts            # Turf.js spatial math & bearing utilities
│   ├── routing.ts             # OSRM client router with failover
│   └── export.ts              # Code and payload serializers
├── tailwind.config.ts         # Custom cyber HUD color palette & tokens
├── postcss.config.mjs
├── tsconfig.json
├── next.config.mjs
└── package.json
```
