'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from '@/components/Header';
import MapContainer from '@/components/Map/MapContainer';
import Sidebar from '@/components/Sidebar/Sidebar';
import ImportModal from '@/components/ImportModal';
import { Coordinate, WaypointMarker, ActiveTab, RoutePreset, TelemetryStats } from '@/lib/types';
import { ROUTE_PRESETS, TILE_LAYERS, DEFAULT_SPEED_KMH, DEFAULT_WH_PER_KM } from '@/lib/mapConfig';
import { routeLengthMeters } from '@/lib/geofence';
import { fetchRoadRoute } from '@/lib/routing';

export default function WorkbenchPage() {
  const [path, setPath] = useState<Coordinate[]>([]);
  const [markers, setMarkers] = useState<WaypointMarker[]>([]);
  const [selectedTile, setSelectedTile] = useState<keyof typeof TILE_LAYERS>('gmapRoad');
  const [activeTab, setActiveTab] = useState<ActiveTab>('telemetry');
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(false);
  const [speedKmh, setSpeedKmh] = useState<number>(DEFAULT_SPEED_KMH);
  const [focusCoord, setFocusCoord] = useState<Coordinate | null>(null);
  const [fitBoundsTrigger, setFitBoundsTrigger] = useState<number>(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Restore saved map landscape preference (e.g. Google Satellite) on mount
  useEffect(() => {
    try {
      const savedTile = localStorage.getItem('jarvis_workbench_tile');
      if (savedTile && savedTile in TILE_LAYERS) {
        setSelectedTile(savedTile as keyof typeof TILE_LAYERS);
      }
    } catch {
      // Ignore in restricted environments
    }
  }, []);

  // Save map landscape preference whenever user changes it
  const handleSelectTile = useCallback((tile: keyof typeof TILE_LAYERS) => {
    setSelectedTile(tile);
    try {
      localStorage.setItem('jarvis_workbench_tile', tile);
    } catch {
      // Ignore
    }
  }, []);

  // Compute live telemetry stats
  const stats: TelemetryStats = useMemo(() => {
    const distMeters = routeLengthMeters(path);
    const distKm = distMeters / 1000;
    const distMiles = distKm * 0.621371;
    const durationMin = distKm > 0 ? (distKm / speedKmh) * 60 : 0;
    const energyWh = distKm * DEFAULT_WH_PER_KM;

    return {
      pointCount: path.length,
      markerCount: markers.length,
      distanceKm: distKm,
      distanceMiles: distMiles,
      durationMin,
      speedKmh,
      energyWh,
    };
  }, [path, markers, speedKmh]);

  // Toggle sidebar
  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  // Trigger manual fit bounds
  const handleFitBounds = useCallback(() => {
    setFitBoundsTrigger((prev) => prev + 1);
  }, []);

  // Load Seed Route (Navalur OMR -> Mayajaal ECR)
  const handleLoadSeed = useCallback(async () => {
    const seed = ROUTE_PRESETS[0];
    setIsLoadingRoute(true);

    try {
      const { path: routePath } = await fetchRoadRoute(
        { lat: seed.origin.lat, lon: seed.origin.lon },
        { lat: seed.destination.lat, lon: seed.destination.lon }
      );

      const newMarkers: WaypointMarker[] = [
        {
          id: 'seed-origin',
          lat: seed.origin.lat,
          lon: seed.origin.lon,
          label: seed.origin.label,
          radiusMeters: 150,
        },
        {
          id: 'seed-dest',
          lat: seed.destination.lat,
          lon: seed.destination.lon,
          label: seed.destination.label,
          radiusMeters: 150,
        },
      ];

      setPath(routePath);
      setMarkers(newMarkers);
      setFitBoundsTrigger((prev) => prev + 1);
    } catch (err: any) {
      alert(`Could not fetch route from OSRM: ${err.message}`);
    } finally {
      setIsLoadingRoute(false);
    }
  }, []);

  // Load a selected Preset route
  const handleSelectPreset = useCallback(async (preset: RoutePreset) => {
    setIsLoadingRoute(true);
    try {
      const { path: routePath } = await fetchRoadRoute(
        { lat: preset.origin.lat, lon: preset.origin.lon },
        { lat: preset.destination.lat, lon: preset.destination.lon }
      );

      const newMarkers: WaypointMarker[] = [
        {
          id: `${preset.id}-origin`,
          lat: preset.origin.lat,
          lon: preset.origin.lon,
          label: preset.origin.label,
          radiusMeters: 150,
        },
        {
          id: `${preset.id}-dest`,
          lat: preset.destination.lat,
          lon: preset.destination.lon,
          label: preset.destination.label,
          radiusMeters: 150,
        },
      ];

      setPath(routePath);
      setMarkers(newMarkers);
      setActiveTab('telemetry');
      setFitBoundsTrigger((prev) => prev + 1);
    } catch (err: any) {
      alert(`Could not fetch route from OSRM: ${err.message}`);
    } finally {
      setIsLoadingRoute(false);
    }
  }, []);

  // Fetch custom route from origin to destination coordinates
  const handleFetchCustomRoute = useCallback(
    async (
      origin: { lat: number; lon: number; label: string },
      destination: { lat: number; lon: number; label: string }
    ) => {
      setIsLoadingRoute(true);
      try {
        const { path: routePath } = await fetchRoadRoute(
          { lat: origin.lat, lon: origin.lon },
          { lat: destination.lat, lon: destination.lon }
        );

        const newMarkers: WaypointMarker[] = [
          {
            id: `custom-origin-${Date.now()}`,
            lat: origin.lat,
            lon: origin.lon,
            label: origin.label,
            radiusMeters: 100,
          },
          {
            id: `custom-dest-${Date.now()}`,
            lat: destination.lat,
            lon: destination.lon,
            label: destination.label,
            radiusMeters: 100,
          },
        ];

        setPath(routePath);
        setMarkers(newMarkers);
        setActiveTab('telemetry');
        setFitBoundsTrigger((prev) => prev + 1);
      } catch (err: any) {
        alert(`Could not fetch custom route from OSRM: ${err.message}`);
      } finally {
        setIsLoadingRoute(false);
      }
    },
    []
  );

  // Clear canvas
  const handleClear = useCallback(() => {
    setPath([]);
    setMarkers([]);
    setFocusCoord(null);
  }, []);

  // Import payload
  const handleImport = useCallback((newPath: Coordinate[], newMarkers: WaypointMarker[]) => {
    if (newPath.length > 0) setPath(newPath);
    if (newMarkers.length > 0) setMarkers(newMarkers);
    setFitBoundsTrigger((prev) => prev + 1);
  }, []);

  // Sync data updates from MapView
  const handleDataChange = useCallback(
    (newPath: Coordinate[], newMarkers: WaypointMarker[]) => {
      setPath(newPath);
      setMarkers(newMarkers);
    },
    []
  );

  // Delete individual marker
  const handleDeleteMarker = useCallback((index: number) => {
    setMarkers((prev) => prev.filter((_, idx) => idx !== index));
  }, []);

  // Add individual marker
  const handleAddMarker = useCallback((marker: WaypointMarker) => {
    setMarkers((prev) => [...prev, marker]);
    setFocusCoord([marker.lat, marker.lon]);
  }, []);

  // Update marker radius
  const handleUpdateRadius = useCallback((index: number, radius: number) => {
    setMarkers((prev) =>
      prev.map((m, idx) => (idx === index ? { ...m, radiusMeters: radius } : m))
    );
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
      {/* Top Header */}
      <Header
        onLoadSeed={handleLoadSeed}
        isLoadingSeed={isLoadingRoute}
        onOpenImport={() => setIsImportOpen(true)}
        onClear={handleClear}
        onFitBounds={handleFitBounds}
        pointCount={stats.pointCount}
        markerCount={stats.markerCount}
        distanceKm={stats.distanceKm}
        selectedTile={selectedTile}
        onSelectTile={handleSelectTile}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={handleToggleSidebar}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden relative">
        {/* Map Canvas Area */}
        <div className="flex-1 relative h-full min-h-[300px]">
          <MapContainer
            path={path}
            markers={markers}
            onDataChange={handleDataChange}
            selectedTileLayer={selectedTile}
            focusCoord={focusCoord}
            fitBoundsTrigger={fitBoundsTrigger}
          />
        </div>

        {/* Control Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          stats={stats}
          onSpeedChange={setSpeedKmh}
          markers={markers}
          path={path}
          onSelectPreset={handleSelectPreset}
          onFetchCustomRoute={handleFetchCustomRoute}
          isLoadingRoute={isLoadingRoute}
          onFocusCoord={setFocusCoord}
          onDeleteMarker={handleDeleteMarker}
          onAddMarker={handleAddMarker}
          onUpdateRadius={handleUpdateRadius}
          isOpen={isSidebarOpen}
          onToggle={handleToggleSidebar}
        />
      </main>

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImport}
      />
    </div>
  );
}
