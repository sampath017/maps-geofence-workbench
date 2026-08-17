import { Coordinate, RoutePreset } from './types';

// Sholinganallur / OMR corridor — matches the Jarvis telemetry doc's test area
export const MAP_CENTER: Coordinate = [12.885, 80.2255];
export const MAP_ZOOM = 13;

export const TILE_LAYERS = {
  gmapRoad: {
    id: 'gmapRoad',
    name: 'Google Maps (Roadmap)',
    // scale=2 requests 2x High-DPI / Retina tiles with razor sharp text and vector road geometry
    url: 'https://mt{s}.google.com/vt/lyrs=m&scale=2&hl=en&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps',
    subdomains: '0123',
    maxZoom: 21,
    maxNativeZoom: 21,
    tileSize: 512,
    zoomOffset: -1,
  },
  gmapHybrid: {
    id: 'gmapHybrid',
    name: 'Google Maps (Satellite + Labels)',
    // High-res satellite photography with razor-sharp road labels (max native zoom 20)
    url: 'https://mt{s}.google.com/vt/lyrs=y&scale=2&hl=en&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps Imagery',
    subdomains: '0123',
    maxZoom: 20,
    maxNativeZoom: 20,
    tileSize: 512,
    zoomOffset: -1,
  },
  gmapSatellite: {
    id: 'gmapSatellite',
    name: 'Google Maps (Satellite)',
    url: 'https://mt{s}.google.com/vt/lyrs=s&scale=2&hl=en&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps Imagery',
    subdomains: '0123',
    maxZoom: 20,
    maxNativeZoom: 20,
    tileSize: 512,
    zoomOffset: -1,
  },
  dark: {
    id: 'dark',
    name: 'CartoDB Dark (Night HUD)',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 20,
    maxNativeZoom: 20,
    tileSize: 512,
    zoomOffset: -1,
  },
  osm: {
    id: 'osm',
    name: 'OpenStreetMap Standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    subdomains: 'abc',
    maxZoom: 19,
    maxNativeZoom: 19,
    tileSize: 256,
    zoomOffset: 0,
  },
};

export const ROUTE_PRESETS: RoutePreset[] = [
  {
    id: 'omr-ecr-mayajaal',
    name: 'OMR (Navalur) → Mayajaal ECR',
    subtitle: 'Original Jarvis Seed Route',
    description: 'Cross-corridor connector linking Navalur OMR junction to Mayajaal Multiplex on East Coast Road (ECR).',
    badge: 'Seed Route',
    origin: {
      lat: 12.8373166,
      lon: 80.2255465,
      label: 'Origin — OMR (Navalur)',
    },
    destination: {
      lat: 12.8480369,
      lon: 80.2398575,
      label: 'Destination — Mayajaal Multiplex, Kanathur',
    },
  },
  {
    id: 'tidel-siruseri-omr',
    name: 'TIDEL Park → Siruseri SIPCOT',
    subtitle: 'Full OMR IT Expressway',
    description: 'Major arterial corridor extending 18km south along Rajiv Gandhi Salai through Sholinganallur.',
    badge: 'IT Corridor',
    origin: {
      lat: 12.9892,
      lon: 80.2498,
      label: 'Origin — TIDEL Park (Taramani)',
    },
    destination: {
      lat: 12.8274,
      lon: 80.2241,
      label: 'Destination — Siruseri SIPCOT IT Park',
    },
  },
  {
    id: 'airport-guindy',
    name: 'Chennai Airport → Guindy Kathipara',
    subtitle: 'Grand Southern Trunk Highway',
    description: 'High-speed urban transit leg passing Chennai International Airport through Meenambakkam to Kathipara.',
    badge: 'Highway',
    origin: {
      lat: 12.9815,
      lon: 80.1636,
      label: 'Origin — Chennai Intl Airport (MAA)',
    },
    destination: {
      lat: 13.0067,
      lon: 80.2025,
      label: 'Destination — Kathipara Junction',
    },
  },
  {
    id: 'marina-besantnagar',
    name: 'Marina Beach → Besant Nagar',
    subtitle: 'Coastal Scenic Drive',
    description: 'Famous coastal stretch past Santhome Cathedral, Adyar River Bridge to Elliot’s Beach.',
    badge: 'Coastal',
    origin: {
      lat: 13.0418,
      lon: 80.2824,
      label: 'Origin — Marina Lighthouse',
    },
    destination: {
      lat: 12.9998,
      lon: 80.2713,
      label: 'Destination — Elliot’s Beach (Besant Nagar)',
    },
  },
];

export const DEFAULT_SPEED_KMH = 30;
export const DEFAULT_WH_PER_KM = 28; // Standard telemetry metric for electric 2-wheeler / urban sim
