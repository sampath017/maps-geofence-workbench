import { NextRequest, NextResponse } from 'next/server';

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const originLat = searchParams.get('originLat');
  const originLon = searchParams.get('originLon');
  const destLat = searchParams.get('destLat');
  const destLon = searchParams.get('destLon');

  if (!originLat || !originLon || !destLat || !destLon) {
    return NextResponse.json(
      { error: 'Missing coordinates: originLat, originLon, destLat, and destLon are required' },
      { status: 400 }
    );
  }

  const url = `${OSRM_BASE}/${originLon},${originLat};${destLon},${destLat}?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'JarvisRouteWorkbench/1.0',
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `OSRM server error (${res.status})` },
        { status: res.status }
      );
    }

    const data = await res.json();
    if (!data.routes || !data.routes.length) {
      return NextResponse.json(
        { error: 'OSRM returned no route for these points' },
        { status: 404 }
      );
    }

    const route = data.routes[0];
    // Convert GeoJSON [lon, lat] to Leaflet [lat, lon]
    const path = route.geometry.coordinates.map(([lon, lat]: [number, number]) => [lat, lon]);

    return NextResponse.json({
      path,
      distanceMeters: route.distance,
      durationSeconds: route.duration,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Routing failed: ${error?.message || 'Network error'}` },
      { status: 500 }
    );
  }
}
