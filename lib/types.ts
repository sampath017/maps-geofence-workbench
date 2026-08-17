export type Coordinate = [number, number]; // [lat, lon]

export interface WaypointMarker {
  id?: string;
  lat: number;
  lon: number;
  label: string;
  radiusMeters?: number;
}

export interface RouteData {
  path: Coordinate[];
  markers: WaypointMarker[];
  distanceMeters?: number;
  durationSeconds?: number;
}

export interface RoutePreset {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  origin: {
    lat: number;
    lon: number;
    label: string;
  };
  destination: {
    lat: number;
    lon: number;
    label: string;
  };
  badge?: string;
}

export interface GeofenceZone {
  id: string;
  name: string;
  center: Coordinate;
  radiusMeters: number;
  color?: string;
}

export interface TelemetryStats {
  pointCount: number;
  markerCount: number;
  distanceKm: number;
  distanceMiles: number;
  durationMin: number;
  speedKmh: number;
  energyWh: number;
}

export type ExportFormat = 'python' | 'json' | 'geojson' | 'csv' | 'curl';
export type ActiveTab = 'telemetry' | 'presets' | 'waypoints' | 'geofence' | 'export';
