'use client';

import React, { useState } from 'react';
import { WaypointMarker, Coordinate } from '@/lib/types';
import { MapPin, Trash2, Crosshair, Copy, Check, Plus, Search } from 'lucide-react';

interface WaypointTableProps {
  markers: WaypointMarker[];
  onFocusCoord: (coord: Coordinate) => void;
  onDeleteMarker: (index: number) => void;
  onAddMarker: (marker: WaypointMarker) => void;
  onUpdateRadius: (index: number, radius: number) => void;
}

export default function WaypointTable({
  markers,
  onFocusCoord,
  onDeleteMarker,
  onAddMarker,
  onUpdateRadius,
}: WaypointTableProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newLat, setNewLat] = useState('');
  const [newLon, setNewLon] = useState('');
  const [newRadius, setNewRadius] = useState('100');

  const copyCoord = (lat: number, lon: number, idx: number) => {
    navigator.clipboard.writeText(`[${lat}, ${lon}]`);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(newLat);
    const lon = parseFloat(newLon);
    const rad = parseInt(newRadius, 10) || 100;

    if (isNaN(lat) || isNaN(lon)) {
      alert('Enter valid latitude and longitude numbers');
      return;
    }

    onAddMarker({
      id: `custom-marker-${Date.now()}`,
      lat,
      lon,
      label: newLabel.trim() || `Waypoint ${markers.length + 1}`,
      radiusMeters: rad,
    });

    setNewLabel('');
    setNewLat('');
    setNewLon('');
  };

  const filteredMarkers = markers.filter(
    (m) =>
      m.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.lat.toString().includes(searchQuery) ||
      m.lon.toString().includes(searchQuery)
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-text-dim flex items-center gap-1.5">
          <MapPin className="w-3 h-3 text-emerald" />
          Waypoint Registry ({markers.length})
        </span>
      </div>

      {/* Search Filter */}
      {markers.length > 3 && (
        <div className="relative">
          <input
            type="text"
            placeholder="Search waypoints…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-panel-light border border-border rounded pl-8 pr-3 py-1.5 text-xs text-text placeholder:text-text-muted focus:outline-none focus:border-cyan font-mono"
          />
          <Search className="w-3.5 h-3.5 text-text-dim absolute left-2.5 top-2.5" />
        </div>
      )}

      {/* Waypoints List */}
      {markers.length === 0 ? (
        <div className="p-6 rounded-md bg-panel-light border border-border text-center">
          <MapPin className="w-6 h-6 text-text-muted mx-auto mb-2" />
          <p className="text-xs text-text-dim font-medium">No waypoints on map yet</p>
          <p className="text-[11px] text-text-muted mt-1">
            Draw a marker on the map using Geoman or add one below.
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          {filteredMarkers.map((m, idx) => (
            <div
              key={m.id || idx}
              className="p-3 rounded-md bg-panel-light border border-border hover:border-text-dim/50 transition-colors space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-5 h-5 rounded-full bg-cyan/15 text-cyan border border-cyan/30 flex items-center justify-center text-[10px] font-mono font-bold flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-text truncate" title={m.label}>
                    {m.label}
                  </span>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => onFocusCoord([m.lat, m.lon])}
                    className="p-1 rounded hover:bg-panel-hover text-text-dim hover:text-cyan transition-colors"
                    title="Focus on Map"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => copyCoord(m.lat, m.lon, idx)}
                    className="p-1 rounded hover:bg-panel-hover text-text-dim hover:text-amber transition-colors"
                    title="Copy Lat/Lon"
                  >
                    {copiedIdx === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => onDeleteMarker(idx)}
                    className="p-1 rounded hover:bg-crimson/15 text-text-dim hover:text-crimson transition-colors"
                    title="Delete Waypoint"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Coordinates and Radius selector */}
              <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-text-dim border-t border-border/50">
                <span>
                  {m.lat.toFixed(5)}, {m.lon.toFixed(5)}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-text-muted">Radius:</span>
                  <select
                    value={m.radiusMeters || 100}
                    onChange={(e) => onUpdateRadius(idx, parseInt(e.target.value, 10))}
                    className="bg-background border border-border rounded px-1.5 py-0.5 text-[10px] text-cyan cursor-pointer focus:outline-none"
                  >
                    <option value="50">50m</option>
                    <option value="100">100m</option>
                    <option value="250">250m</option>
                    <option value="500">500m</option>
                    <option value="1000">1km</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Manual Waypoint Creator */}
      <div className="p-3 rounded-md bg-panel-light border border-border space-y-2.5">
        <span className="text-xs font-semibold text-text flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5 text-cyan" />
          Add Custom GPS Pin
        </span>
        <form onSubmit={handleAdd} className="space-y-2">
          <input
            type="text"
            placeholder="Label (e.g. Navallur Gate 2)"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="w-full bg-background border border-border rounded px-2.5 py-1 text-xs text-text focus:outline-none focus:border-cyan"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Latitude (e.g. 12.8373)"
              value={newLat}
              onChange={(e) => setNewLat(e.target.value)}
              className="bg-background border border-border rounded px-2 py-1 text-xs font-mono text-text focus:outline-none focus:border-cyan"
            />
            <input
              type="text"
              placeholder="Longitude (e.g. 80.2255)"
              value={newLon}
              onChange={(e) => setNewLon(e.target.value)}
              className="bg-background border border-border rounded px-2 py-1 text-xs font-mono text-text focus:outline-none focus:border-cyan"
            />
          </div>
          <button
            type="submit"
            className="w-full py-1.5 rounded text-xs font-semibold bg-emerald/15 hover:bg-emerald hover:text-background text-emerald border border-emerald/40 transition-colors"
          >
            Add Waypoint to Map
          </button>
        </form>
      </div>
    </div>
  );
}
