import { Coordinate, WaypointMarker } from './types';
import { distanceMeters } from './geofence';

/**
 * Native round-trip format — paste this back into the Import box to keep editing.
 */
export function buildRoundTripJSON(pathPoints: Coordinate[], markers: WaypointMarker[]): string {
  return JSON.stringify(
    {
      version: '1.0.0',
      generator: 'Jarvis Route Workbench',
      timestamp: new Date().toISOString(),
      path: pathPoints,
      markers: markers.map((m) => ({
        lat: m.lat,
        lon: m.lon,
        label: m.label,
        ...(m.radiusMeters ? { radiusMeters: m.radiusMeters } : {}),
      })),
    },
    null,
    2
  );
}

/**
 * Copy-pasteable Python literal, ready to drop into a Jarvis sim/telemetry script.
 */
export function buildPythonSnippet(pathPoints: Coordinate[], markers: WaypointMarker[]): string {
  let py = '"""\n';
  py += 'Jarvis Telemetry Simulation Path\n';
  py += `Generated: ${new Date().toISOString()}\n`;
  py += `Total Vertices: ${pathPoints.length} | Markers: ${markers.length}\n`;
  py += '"""\n\n';

  py += 'waypoints = [\n';
  pathPoints.forEach((p) => {
    py += `    (${p[0]}, ${p[1]}),\n`;
  });
  py += ']\n\n';

  py += 'markers = [\n';
  markers.forEach((m) => {
    py += `    {"lat": ${m.lat}, "lon": ${m.lon}, "label": ${JSON.stringify(m.label)}},\n`;
  });
  py += ']\n\n';

  py += '# Example telemetry step loop snippet:\n';
  py += 'def run_sim(waypoints, step_interval=1.0):\n';
  py += '    for idx, (lat, lon) in enumerate(waypoints):\n';
  py += '        print(f"[{idx+1}/{len(waypoints)}] Telemetry ping -> lat: {lat}, lon: {lon}")\n';

  return py;
}

/**
 * Standard GeoJSON FeatureCollection format.
 */
export function buildGeoJSON(pathPoints: Coordinate[], markers: WaypointMarker[]): string {
  const features: any[] = [];

  if (pathPoints.length > 1) {
    features.push({
      type: 'Feature',
      properties: {
        name: 'Jarvis Active Route',
        stroke: '#ff8a34',
        'stroke-width': 4,
      },
      geometry: {
        type: 'LineString',
        coordinates: pathPoints.map((p) => [p[1], p[0]]), // [lon, lat] for GeoJSON
      },
    });
  }

  markers.forEach((m) => {
    features.push({
      type: 'Feature',
      properties: {
        label: m.label,
        markerColor: '#4fd1c5',
        radiusMeters: m.radiusMeters,
      },
      geometry: {
        type: 'Point',
        coordinates: [m.lon, m.lat],
      },
    });
  });

  return JSON.stringify(
    {
      type: 'FeatureCollection',
      features,
    },
    null,
    2
  );
}

/**
 * CSV format for spreadsheet analysis or trajectory databases.
 */
export function buildCSV(pathPoints: Coordinate[]): string {
  let csv = 'index,latitude,longitude,step_distance_meters,cumulative_distance_meters\n';
  let cumulative = 0;

  pathPoints.forEach((p, idx) => {
    let stepDist = 0;
    if (idx > 0) {
      stepDist = distanceMeters(pathPoints[idx - 1], p);
      cumulative += stepDist;
    }
    csv += `${idx + 1},${p[0]},${p[1]},${stepDist.toFixed(2)},${cumulative.toFixed(2)}\n`;
  });

  return csv;
}

/**
 * cURL command to send to Jarvis Cloud Run or FastAPI endpoint.
 */
export function buildCurlCommand(pathPoints: Coordinate[], markers: WaypointMarker[]): string {
  const payload = {
    path: pathPoints,
    markers: markers.map((m) => ({ lat: m.lat, lon: m.lon, label: m.label })),
  };

  return `curl -X POST https://your-jarvis-backend.run.app/route \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(payload)}'`;
}
