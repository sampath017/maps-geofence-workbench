import { point, distance as turfDistance, bearing as turfBearing, booleanPointInPolygon, polygon } from '@turf/turf';
import { Coordinate } from './types';

/**
 * Great-circle distance between two [lat, lon] points, in meters.
 */
export function distanceMeters(a: Coordinate, b: Coordinate): number {
  if (!a || !b || a.length < 2 || b.length < 2) return 0;
  return turfDistance(point([a[1], a[0]]), point([b[1], b[0]]), { units: 'meters' });
}

/**
 * Total length of a [lat, lon][] path, in meters.
 */
export function routeLengthMeters(pathLatLon: Coordinate[]): number {
  if (!pathLatLon || pathLatLon.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < pathLatLon.length; i++) {
    total += distanceMeters(pathLatLon[i - 1], pathLatLon[i]);
  }
  return total;
}

/**
 * Whether a point falls inside a circular geofence.
 * Mirrors the Tier 2 GEOFENCE_ENTER checks in the Jarvis automation layer —
 * use this to sanity-check radii against real waypoints before shipping them.
 */
export function isWithinGeofence(
  pointLatLon: Coordinate,
  centerLatLon: Coordinate,
  radiusMeters: number
): boolean {
  return distanceMeters(pointLatLon, centerLatLon) <= radiusMeters;
}

/**
 * Scan all path points and return all points within the specified geofence zone.
 */
export function findPathPointsInGeofence(
  pathLatLon: Coordinate[],
  centerLatLon: Coordinate,
  radiusMeters: number
): { index: number; coordinate: Coordinate; distanceMeters: number }[] {
  const breached: { index: number; coordinate: Coordinate; distanceMeters: number }[] = [];
  pathLatLon.forEach((coord, idx) => {
    const dist = distanceMeters(coord, centerLatLon);
    if (dist <= radiusMeters) {
      breached.push({ index: idx, coordinate: coord, distanceMeters: Math.round(dist * 10) / 10 });
    }
  });
  return breached;
}

/**
 * Calculate initial compass bearing in degrees (0 - 360) from point A to point B.
 */
export function calculateBearing(a: Coordinate, b: Coordinate): number {
  const bAngle = turfBearing(point([a[1], a[0]]), point([b[1], b[0]]));
  return (bAngle + 360) % 360;
}

/**
 * Format meters to human readable distance (m or km).
 */
export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  }
  return `${Math.round(meters)} m`;
}
