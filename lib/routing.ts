import { Coordinate } from './types';

export interface RouteFetchResult {
  path: Coordinate[];
  distanceMeters: number;
  durationSeconds: number;
}

/**
 * Fetch a real, road-following driving route between two points.
 * First tries internal Next.js API proxy, then falls back directly to OSRM demo server.
 */
export async function fetchRoadRoute(
  origin: { lat: number; lon: number },
  destination: { lat: number; lon: number }
): Promise<RouteFetchResult> {
  const apiUrl = `/api/route?originLat=${origin.lat}&originLon=${origin.lon}&destLat=${destination.lat}&destLon=${destination.lon}`;

  try {
    const res = await fetch(apiUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.path && data.path.length) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Internal route API proxy failed, trying direct OSRM endpoint...', err);
  }

  // Fallback direct request
  const directUrl = `https://router.project-osrm.org/route/v1/driving/${origin.lon},${origin.lat};${destination.lon},${destination.lat}?overview=full&geometries=geojson`;
  const fallbackRes = await fetch(directUrl);
  if (!fallbackRes.ok) {
    throw new Error(`OSRM request failed with status (${fallbackRes.status})`);
  }

  const fallbackData = await fallbackRes.json();
  if (!fallbackData.routes || !fallbackData.routes.length) {
    throw new Error('OSRM returned no route for these points');
  }

  const route = fallbackData.routes[0];
  const path: Coordinate[] = route.geometry.coordinates.map(([lon, lat]: [number, number]) => [lat, lon]);

  return {
    path,
    distanceMeters: route.distance,
    durationSeconds: route.duration,
  };
}
