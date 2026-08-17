'use client';

import React from 'react';
import { ActiveTab, Coordinate, WaypointMarker, RoutePreset, TelemetryStats } from '@/lib/types';
import TelemetryStatsPanel from './TelemetryStats';
import RoutePresetsPanel from './RoutePresets';
import WaypointTable from './WaypointTable';
import GeofencePanel from './GeofencePanel';
import ExportPanel from './ExportPanel';
import { Activity, Sparkles, MapPin, ShieldCheck, Code2, PanelRightOpen } from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  stats: TelemetryStats;
  onSpeedChange: (speed: number) => void;
  markers: WaypointMarker[];
  path: Coordinate[];
  onSelectPreset: (preset: RoutePreset) => void;
  onFetchCustomRoute: (
    origin: { lat: number; lon: number; label: string },
    destination: { lat: number; lon: number; label: string }
  ) => void;
  isLoadingRoute: boolean;
  onFocusCoord: (coord: Coordinate) => void;
  onDeleteMarker: (index: number) => void;
  onAddMarker: (marker: WaypointMarker) => void;
  onUpdateRadius: (index: number, radius: number) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({
  activeTab,
  onTabChange,
  stats,
  onSpeedChange,
  markers,
  path,
  onSelectPreset,
  onFetchCustomRoute,
  isLoadingRoute,
  onFocusCoord,
  onDeleteMarker,
  onAddMarker,
  onUpdateRadius,
  isOpen = true,
  onToggle,
}: SidebarProps) {
  const tabs: { id: ActiveTab; label: string; icon: any }[] = [
    { id: 'telemetry', label: 'Telemetry', icon: Activity },
    { id: 'waypoints', label: 'Waypoints', icon: MapPin },
    { id: 'presets', label: 'Presets', icon: Sparkles },
    { id: 'geofence', label: 'Geofence', icon: ShieldCheck },
    { id: 'export', label: 'Export', icon: Code2 },
  ];

  return (
    <>
      {/* Main Sidebar Panel with Smooth Width & Slide Transition */}
      <aside
        className={`flex-shrink-0 border-l border-border bg-panel flex flex-col h-full shadow-2xl z-10 transition-all duration-300 ease-in-out ${
          isOpen
            ? 'w-full lg:w-[420px] opacity-100 translate-x-0'
            : 'w-0 border-l-0 opacity-0 pointer-events-none translate-x-full overflow-hidden'
        }`}
      >
        {/* Top Tab Bar */}
        <div className="flex items-center justify-between border-b border-border bg-panel-light/70 flex-shrink-0">
          <div className="flex items-center overflow-x-auto scrollbar-none flex-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
                    isActive
                      ? 'border-amber text-amber bg-background/50 font-bold'
                      : 'border-transparent text-text-dim hover:text-text hover:bg-panel-hover'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber' : 'text-text-muted'}`} />
                  <span>{tab.label}</span>
                  {tab.id === 'waypoints' && markers.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-emerald/20 text-emerald font-mono">
                      {markers.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Panel Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'telemetry' && (
            <TelemetryStatsPanel stats={stats} onSpeedChange={onSpeedChange} />
          )}

          {activeTab === 'presets' && (
            <RoutePresetsPanel
              onSelectPreset={onSelectPreset}
              onFetchCustomRoute={onFetchCustomRoute}
              isLoading={isLoadingRoute}
            />
          )}

          {activeTab === 'waypoints' && (
            <WaypointTable
              markers={markers}
              onFocusCoord={onFocusCoord}
              onDeleteMarker={onDeleteMarker}
              onAddMarker={onAddMarker}
              onUpdateRadius={onUpdateRadius}
            />
          )}

          {activeTab === 'geofence' && <GeofencePanel path={path} markers={markers} />}

          {activeTab === 'export' && <ExportPanel path={path} markers={markers} />}
        </div>
      </aside>
    </>
  );
}
