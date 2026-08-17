'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Coordinate, WaypointMarker, GeofenceZone } from '@/lib/types';
import { TILE_LAYERS } from '@/lib/mapConfig';
import { Compass } from 'lucide-react';

const DynamicMapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center w-full h-full bg-background text-text-dim">
      <div className="relative flex items-center justify-center w-16 h-16 mb-4 rounded-full border border-border bg-panel">
        <Compass className="w-8 h-8 text-amber animate-spin" />
        <div className="absolute inset-0 rounded-full border border-amber/30 animate-ping" />
      </div>
      <p className="font-mono text-xs uppercase tracking-widest text-text">
        Initializing Spatial Canvas…
      </p>
      <p className="font-mono text-[11px] text-text-muted mt-1">
        Loading Map Tiles &amp; Geoman Tooling
      </p>
    </div>
  ),
});

interface MapContainerProps {
  path: Coordinate[];
  markers: WaypointMarker[];
  geofences?: GeofenceZone[];
  onDataChange: (newPath: Coordinate[], newMarkers: WaypointMarker[]) => void;
  selectedTileLayer?: keyof typeof TILE_LAYERS;
  focusCoord?: Coordinate | null;
  fitBoundsTrigger?: number;
}

export default function MapContainer(props: MapContainerProps) {
  return <DynamicMapView {...props} />;
}
