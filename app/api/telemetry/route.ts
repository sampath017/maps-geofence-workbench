import { NextRequest, NextResponse } from 'next/server';

/**
 * Direct ingestion endpoint for simulated telemetry or Jarvis Cloud Run dispatch.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate minimal structure
    if (!body || (!body.path && !body.waypoints)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload: expected path or waypoints array' },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();
    const waypointsCount = body.path ? body.path.length : (body.waypoints ? body.waypoints.length : 0);
    const markersCount = body.markers ? body.markers.length : 0;

    return NextResponse.json({
      success: true,
      message: 'Route telemetry payload successfully accepted by workbench bridge.',
      timestamp,
      summary: {
        waypointsReceived: waypointsCount,
        markersReceived: markersCount,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Malformed JSON' },
      { status: 400 }
    );
  }
}
