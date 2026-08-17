'use client';

import React from 'react';
import {
  Layers,
  UploadCloud,
  Trash2,
  Zap,
  Maximize2,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';
import { TILE_LAYERS } from '@/lib/mapConfig';

interface HeaderProps {
  onLoadSeed: () => void;
  isLoadingSeed: boolean;
  onOpenImport: () => void;
  onClear: () => void;
  onFitBounds: () => void;
  hasRoute?: boolean;
  pointCount?: number;
  markerCount?: number;
  distanceKm?: number;
  selectedTile: keyof typeof TILE_LAYERS;
  onSelectTile: (tile: keyof typeof TILE_LAYERS) => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function Header({
  onLoadSeed,
  isLoadingSeed,
  onOpenImport,
  onClear,
  onFitBounds,
  pointCount = 0,
  selectedTile,
  onSelectTile,
  isSidebarOpen,
  onToggleSidebar,
}: HeaderProps) {
  return (
    <header className="h-12 px-4 flex items-center justify-between gap-3 border-b border-border bg-panel z-20 select-none shrink-0 overflow-x-auto scrollbar-none">
      {/* Brand & Project Info */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="flex items-center justify-center w-7 h-7 rounded bg-amber/15 border border-amber/30 text-amber shadow-hud-amber">
          <Zap className="w-3.5 h-3.5" />
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-xs font-bold tracking-wide text-text whitespace-nowrap">
            Route Editor &amp; Geofence Workbench
          </h1>
          <span className="hidden xl:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-cyan/10 text-cyan border border-cyan/30">
            Chennai OMR
          </span>
        </div>
      </div>

      {/* Action Buttons & Controls */}
      <div className="flex items-center gap-1.5 ml-auto shrink-0">
        {/* Tile Layer Selector (Top source of truth) */}
        <div className="relative flex items-center">
          <select
            value={selectedTile}
            onChange={(e) => onSelectTile(e.target.value as keyof typeof TILE_LAYERS)}
            className="appearance-none bg-background/90 hover:bg-background border border-border hover:border-text-dim/50 rounded text-xs font-mono text-text px-2.5 py-1 pr-7 cursor-pointer transition-colors focus:outline-none focus:border-cyan"
            title="Switch Map Tile Layer"
          >
            <option value="gmapRoad">Google Maps (Roadmap)</option>
            <option value="gmapHybrid">Google Maps (Satellite + Labels)</option>
            <option value="gmapSatellite">Google Maps (Satellite)</option>
            <option value="dark">Carto Dark (Night HUD)</option>
            <option value="osm">OpenStreetMap</option>
          </select>
          <Layers className="w-3 h-3 text-text-dim absolute right-2 pointer-events-none" />
        </div>

        {/* Fit Bounds / Recenter */}
        {pointCount > 0 && (
          <button
            onClick={onFitBounds}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-text bg-panel-light hover:bg-panel-hover border border-border hover:border-text-dim/50 transition-colors"
            title="Fit Route to Screen"
          >
            <Maximize2 className="w-3 h-3 text-cyan" />
            <span className="hidden sm:inline">Fit</span>
          </button>
        )}

        {/* Load Seed Button */}
        <button
          onClick={onLoadSeed}
          disabled={isLoadingSeed}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-amber/15 text-amber border border-amber/40 hover:bg-amber hover:text-background transition-all duration-150 shadow-hud-amber disabled:opacity-50 disabled:cursor-not-allowed"
          title="Fetch road-following path for Navalur OMR -> Mayajaal ECR from OSRM"
        >
          <Zap className={`w-3 h-3 ${isLoadingSeed ? 'animate-spin' : ''}`} />
          <span>{isLoadingSeed ? 'Fetching…' : 'Seed Route'}</span>
        </button>

        {/* Import JSON/GeoJSON */}
        <button
          onClick={onOpenImport}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium text-text bg-panel-light hover:bg-panel-hover border border-border hover:border-text-dim/50 transition-colors"
          title="Import coordinates or GeoJSON"
        >
          <UploadCloud className="w-3 h-3 text-cyan" />
          <span className="hidden sm:inline">Import</span>
        </button>

        {/* Clear Canvas */}
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium text-text-dim hover:text-crimson bg-panel-light hover:bg-crimson/10 border border-border hover:border-crimson/30 transition-colors"
          title="Clear all path vertices and markers"
        >
          <Trash2 className="w-3 h-3" />
          <span className="hidden sm:inline">Clear</span>
        </button>

        {/* Single Sidebar Toggle Button (Icon-only) */}
        <button
          onClick={onToggleSidebar}
          className={`p-1.5 rounded border transition-colors ${
            isSidebarOpen
              ? 'text-amber bg-amber/10 border-amber/30 hover:bg-amber/20'
              : 'text-text-dim hover:text-text bg-panel-light hover:bg-panel-hover border-border'
          }`}
          title={isSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
          aria-label={isSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          {isSidebarOpen ? (
            <PanelRightClose className="w-4 h-4" />
          ) : (
            <PanelRightOpen className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
}
