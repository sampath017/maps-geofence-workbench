'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

import { Coordinate, WaypointMarker, GeofenceZone } from '@/lib/types';
import { MAP_CENTER, MAP_ZOOM, TILE_LAYERS } from '@/lib/mapConfig';
import { Plus, Minus, LocateFixed, Loader2 } from 'lucide-react';

interface CustomMarkerLayer extends L.Marker {
  _customLabel?: string;
  _customId?: string;
  _customRadius?: number;
}

interface MapViewProps {
  path: Coordinate[];
  markers: WaypointMarker[];
  geofences?: GeofenceZone[];
  onDataChange: (newPath: Coordinate[], newMarkers: WaypointMarker[]) => void;
  selectedTileLayer?: keyof typeof TILE_LAYERS;
  focusCoord?: Coordinate | null;
  fitBoundsTrigger?: number;
}

export default function MapView({
  path,
  markers,
  geofences = [],
  onDataChange,
  selectedTileLayer = 'gmapRoad',
  focusCoord,
  fitBoundsTrigger,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const geofenceGroupRef = useRef<L.FeatureGroup | null>(null);
  const userLocationLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markerCounterRef = useRef<number>(0);
  const isInternalUpdateRef = useRef<boolean>(false);
  const lastRenderedKeyRef = useRef<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Helper to create custom HTML DivIcon pins (Google Maps / Cyber hybrid style)
  const createMarkerIcon = useCallback((type: 'default' | 'origin' | 'dest' = 'default') => {
    let pinClass = 'waypoint-pin-inner';
    if (type === 'origin') pinClass += ' origin-pin-inner';
    if (type === 'dest') pinClass += ' dest-pin-inner';

    return L.divIcon({
      className: 'waypoint-pin',
      html: `
        <div class="waypoint-pin-pulse"></div>
        <div class="${pinClass}"></div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      tooltipAnchor: [0, -14],
    });
  }, []);

  // Collect all path coordinates and markers from drawnItems featureGroup
  const syncLayersToState = useCallback(() => {
    if (!drawnItemsRef.current) return;

    const pathPoints: Coordinate[] = [];
    const markerPoints: WaypointMarker[] = [];

    drawnItemsRef.current.eachLayer((layer: any) => {
      if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
        const latLngs = layer.getLatLngs() as L.LatLng[];
        latLngs.forEach((ll) => {
          pathPoints.push([+ll.lat.toFixed(6), +ll.lng.toFixed(6)]);
        });
      } else if (layer instanceof L.Marker) {
        const mLayer = layer as CustomMarkerLayer;
        const ll = mLayer.getLatLng();
        markerPoints.push({
          id: mLayer._customId || `marker-${Math.random().toString(36).substring(2, 9)}`,
          lat: +ll.lat.toFixed(6),
          lon: +ll.lng.toFixed(6),
          label: mLayer._customLabel || 'Waypoint',
          radiusMeters: mLayer._customRadius || 100,
        });
      }
    });

    isInternalUpdateRef.current = true;
    lastRenderedKeyRef.current = `${pathPoints.length}-${markerPoints.length}`;
    onDataChange(pathPoints, markerPoints);
    setTimeout(() => {
      isInternalUpdateRef.current = false;
    }, 100);
  }, [onDataChange]);

  const wireLayerEvents = useCallback(
    (layer: any) => {
      layer.on('pm:edit', syncLayersToState);
      layer.on('pm:dragend', syncLayersToState);
      layer.on('pm:markerdragend', syncLayersToState);
      layer.on('pm:vertexadded', syncLayersToState);
      layer.on('pm:vertexremoved', syncLayersToState);
    },
    [syncLayersToState]
  );

  // Initialize Map on mount with natural Google Maps physics & high zoom
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false, // We provide sleek Google Maps style floating zoom controls
      attributionControl: false,
      preferCanvas: true,
      minZoom: 2,
      maxZoom: 22,
      zoomSnap: 0.25, // Silky smooth fractional zoom
      zoomDelta: 0.75, // Natural zoom jump for buttons
      wheelPxPerZoomLevel: 90, // Google Maps style smooth wheel scroll
      wheelDebounceTime: 30,
      zoomAnimation: true,
      zoomAnimationThreshold: 10,
      fadeAnimation: true,
      markerZoomAnimation: true,
      inertia: true,
      inertiaDeceleration: 3000,
      inertiaMaxSpeed: 2500,
      easeLinearity: 0.2,
      worldCopyJump: true,
    }).setView(MAP_CENTER, MAP_ZOOM);

    const tileConfig = TILE_LAYERS[selectedTileLayer] || TILE_LAYERS.gmapRoad;
    const tileLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      subdomains: tileConfig.subdomains,
      maxZoom: tileConfig.maxZoom || 22,
      maxNativeZoom: tileConfig.maxNativeZoom || 22,
      tileSize: tileConfig.tileSize || 256,
      zoomOffset: tileConfig.zoomOffset ?? 0,
      updateWhenZooming: false,
      updateWhenIdle: false,
      keepBuffer: 6,
      crossOrigin: true,
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    const drawnItems = L.featureGroup().addTo(map);
    drawnItemsRef.current = drawnItems;

    const geofenceGroup = L.featureGroup().addTo(map);
    geofenceGroupRef.current = geofenceGroup;

    // Geoman controls — only essential route & marker tooling
    map.pm.addControls({
      position: 'topright',
      drawMarker: true,
      drawPolyline: true,
      drawCircleMarker: false,
      drawRectangle: false,
      drawPolygon: false,
      drawCircle: false,
      drawText: false,
      editMode: true,
      dragMode: true,
      cutPolygon: false,
      removalMode: true,
      rotateMode: false,
    });

    map.pm.setPathOptions({ color: '#ff8a34', weight: 4, opacity: 0.95 });
    map.pm.setGlobalOptions({
      pathOptions: { color: '#ff8a34', weight: 4, opacity: 0.95 },
    });

    map.on('pm:create', (e: any) => {
      const layer = e.layer;
      drawnItems.addLayer(layer);

      if (e.shape === 'Marker') {
        markerCounterRef.current += 1;
        layer.setIcon(createMarkerIcon('default'));
        const label =
          window.prompt('Label for this waypoint / geofence marker:', `Waypoint ${markerCounterRef.current}`) ||
          `Waypoint ${markerCounterRef.current}`;
        layer._customLabel = label;
        layer._customId = `marker-${Date.now()}-${markerCounterRef.current}`;
        layer.bindTooltip(label, { permanent: false, direction: 'top' });
      }

      wireLayerEvents(layer);
      syncLayersToState();
    });

    map.on('pm:remove', () => {
      syncLayersToState();
    });

    mapInstanceRef.current = map;

    // ResizeObserver to immediately resize Leaflet map when sidebar collapses/expands
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize({ animate: false });
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [createMarkerIcon, syncLayersToState, wireLayerEvents]);

  // Smoothly swap tile layers when selectedTileLayer changes without map remount
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const tileConfig = TILE_LAYERS[selectedTileLayer] || TILE_LAYERS.gmapRoad;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    map.setMaxZoom(tileConfig.maxZoom || 20);

    const newTileLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      subdomains: tileConfig.subdomains,
      maxZoom: tileConfig.maxZoom || 20,
      maxNativeZoom: tileConfig.maxNativeZoom || 20,
      tileSize: tileConfig.tileSize || 256,
      zoomOffset: tileConfig.zoomOffset ?? 0,
      updateWhenZooming: false,
      updateWhenIdle: false,
      keepBuffer: 6,
      crossOrigin: true,
    }).addTo(map);

    tileLayerRef.current = newTileLayer;
    newTileLayer.bringToBack();
  }, [selectedTileLayer]);

  // Sync external incoming props (e.g. from Seed route load or Import) into Leaflet
  useEffect(() => {
    if (!mapInstanceRef.current || !drawnItemsRef.current) return;
    if (isInternalUpdateRef.current) return;

    const dataKey = `${path.length}-${markers.length}-${path[0]?.[0] || ''}`;
    if (dataKey === lastRenderedKeyRef.current && path.length > 0) return;
    lastRenderedKeyRef.current = dataKey;

    const map = mapInstanceRef.current;
    const drawnItems = drawnItemsRef.current;

    drawnItems.clearLayers();

    // Render polyline path
    if (path && path.length > 0) {
      const polyline = L.polyline(path, {
        color: '#ff8a34',
        weight: 4.5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      });
      drawnItems.addLayer(polyline);
      wireLayerEvents(polyline);
    }

    // Render markers
    if (markers && markers.length > 0) {
      markers.forEach((m, idx) => {
        let pinType: 'default' | 'origin' | 'dest' = 'default';
        if (idx === 0 && markers.length > 1) pinType = 'origin';
        else if (idx === markers.length - 1 && markers.length > 1) pinType = 'dest';

        const mk = L.marker([m.lat, m.lon], {
          icon: createMarkerIcon(pinType),
          draggable: true,
        }) as CustomMarkerLayer;
        mk._customLabel = m.label;
        mk._customId = m.id || `marker-${idx}`;
        mk._customRadius = m.radiusMeters || 100;
        mk.bindTooltip(m.label, { permanent: false, direction: 'top' });
        wireLayerEvents(mk);
        drawnItems.addLayer(mk);
      });
    }

    // Only auto-fit bounds on initial fresh route population, NOT on every small user edit
    if (drawnItems.getLayers().length > 0 && path.length > 0) {
      try {
        const bounds = drawnItems.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16, animate: true, duration: 0.8 });
        }
      } catch (err) {
        console.warn('Bounds fit skipped:', err);
      }
    }
  }, [path, markers, createMarkerIcon, wireLayerEvents]);

  // Handle explicit fitBoundsTrigger button click
  useEffect(() => {
    if (!mapInstanceRef.current || !drawnItemsRef.current || !fitBoundsTrigger) return;
    try {
      const bounds = drawnItemsRef.current.getBounds();
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, {
          padding: [60, 60],
          maxZoom: 17,
          animate: true,
          duration: 0.7,
        });
      }
    } catch (err) {
      console.warn('Could not fit bounds:', err);
    }
  }, [fitBoundsTrigger]);

  // Render Geofence radius circles
  useEffect(() => {
    if (!geofenceGroupRef.current) return;
    const geofenceGroup = geofenceGroupRef.current;
    geofenceGroup.clearLayers();

    markers.forEach((m) => {
      if (m.radiusMeters && m.radiusMeters > 0) {
        const circle = L.circle([m.lat, m.lon], {
          radius: m.radiusMeters,
          color: '#4fd1c5',
          fillColor: '#4fd1c5',
          fillOpacity: 0.12,
          weight: 1.5,
          dashArray: '4, 6',
        });
        circle.bindTooltip(`${m.label} (${m.radiusMeters}m radius)`, {
          permanent: false,
          direction: 'center',
        });
        geofenceGroup.addLayer(circle);
      }
    });

    geofences.forEach((g) => {
      const circle = L.circle(g.center, {
        radius: g.radiusMeters,
        color: g.color || '#ff8a34',
        fillColor: g.color || '#ff8a34',
        fillOpacity: 0.15,
        weight: 2,
        dashArray: '6, 6',
      });
      circle.bindTooltip(`${g.name} (${g.radiusMeters}m)`, {
        permanent: false,
        direction: 'center',
      });
      geofenceGroup.addLayer(circle);
    });
  }, [markers, geofences]);

  // Handle focusCoord pan
  useEffect(() => {
    if (!mapInstanceRef.current || !focusCoord) return;
    mapInstanceRef.current.flyTo(focusCoord, 17, { animate: true, duration: 1.0 });
  }, [focusCoord]);

  // Google Maps Style Floating Control Handlers
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn(1, { animate: true });
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut(1, { animate: true });
    }
  };

  // Google Maps Style My Location Handler
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude, accuracy } = pos.coords;
        const latLng: Coordinate = [latitude, longitude];

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo(latLng, 17, { animate: true, duration: 1.2 });

          // Render pulsing blue Google Maps user location dot & accuracy ring
          if (userLocationLayerRef.current) {
            userLocationLayerRef.current.clearLayers();
          } else {
            userLocationLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
          }

          const userDot = L.divIcon({
            className: 'user-location-pin',
            html: `
              <div class="relative flex items-center justify-center w-8 h-8">
                <div class="absolute w-8 h-8 rounded-full bg-cyan/30 animate-ping"></div>
                <div class="w-4 h-4 rounded-full bg-cyan border-2 border-background shadow-[0_0_12px_#4fd1c5]"></div>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          const marker = L.marker([latitude, longitude], { icon: userDot });
          marker.bindTooltip('Current Location (You)', { permanent: false, direction: 'top' });
          userLocationLayerRef.current.addLayer(marker);

          if (accuracy && accuracy < 1000) {
            const accCircle = L.circle([latitude, longitude], {
              radius: accuracy,
              color: '#4fd1c5',
              fillColor: '#4fd1c5',
              fillOpacity: 0.08,
              weight: 1,
              dashArray: '3, 5',
            });
            userLocationLayerRef.current.addLayer(accCircle);
          }
        }
      },
      (err) => {
        setIsLocating(false);
        alert(`Could not fetch location: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="relative w-full h-full select-none">
      <div id="map" ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Google Maps Style Zoom & Navigation Controls */}
      <div className="absolute right-4 bottom-6 z-[400] flex flex-col items-center gap-2">
        {/* My Current Location button (Google Maps style) */}
        <button
          onClick={handleCurrentLocation}
          disabled={isLocating}
          className="w-10 h-10 rounded-lg bg-panel/90 hover:bg-panel text-text hover:text-cyan border border-border hover:border-cyan/50 shadow-xl backdrop-blur-md flex items-center justify-center transition-all duration-150 active:scale-95 group disabled:opacity-50"
          title="Go to Current Location (GPS)"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 text-cyan animate-spin" />
          ) : (
            <LocateFixed className="w-4 h-4 group-hover:scale-110 text-cyan transition-transform" />
          )}
        </button>

        {/* Zoom In / Zoom Out Stack */}
        <div className="flex flex-col rounded-lg bg-panel/90 border border-border shadow-xl backdrop-blur-md overflow-hidden">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 text-text hover:text-cyan hover:bg-panel-hover flex items-center justify-center border-b border-border/70 transition-colors active:scale-95"
            title="Zoom In (+)"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 text-text hover:text-cyan hover:bg-panel-hover flex items-center justify-center transition-colors active:scale-95"
            title="Zoom Out (−)"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
