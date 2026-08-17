'use client';

import React, { useState, useRef } from 'react';
import { Coordinate, WaypointMarker } from '@/lib/types';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (path: Coordinate[], markers: WaypointMarker[]) => void;
}

export default function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [rawText, setRawText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [detectedType, setDetectedType] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const parseData = (raw: string) => {
    setErrorMsg(null);
    setDetectedType(null);

    const trimmed = raw.trim();
    if (!trimmed) {
      setErrorMsg('Please paste JSON or GeoJSON content');
      return;
    }

    let parsed: any;
    try {
      parsed = JSON.parse(trimmed);
    } catch (e: any) {
      setErrorMsg(`JSON Parse Error: ${e.message}`);
      return;
    }

    let path: Coordinate[] = [];
    let markers: WaypointMarker[] = [];

    // 1. Plain Coordinate Array [[lat, lon], ...]
    if (Array.isArray(parsed) && parsed.length && Array.isArray(parsed[0])) {
      path = parsed.map((p) => [parseFloat(p[0]), parseFloat(p[1])]);
      setDetectedType(`Plain Coordinate Array (${path.length} pts)`);
    }
    // 2. Jarvis Native Round-Trip Format { path, markers }
    else if (parsed && parsed.path) {
      path = parsed.path.map((p: any) => [parseFloat(p[0]), parseFloat(p[1])]);
      if (parsed.markers && Array.isArray(parsed.markers)) {
        markers = parsed.markers.map((m: any, idx: number) => ({
          id: m.id || `imported-marker-${idx}`,
          lat: parseFloat(m.lat),
          lon: parseFloat(m.lon),
          label: m.label || `Waypoint ${idx + 1}`,
          radiusMeters: m.radiusMeters || 100,
        }));
      }
      setDetectedType(`Jarvis Workbench JSON (${path.length} path pts, ${markers.length} pins)`);
    }
    // 3. GeoJSON LineString
    else if (parsed && parsed.type === 'LineString' && parsed.coordinates) {
      path = parsed.coordinates.map((c: any) => [parseFloat(c[1]), parseFloat(c[0])]);
      setDetectedType(`GeoJSON LineString (${path.length} pts)`);
    }
    // 4. GeoJSON Feature
    else if (parsed && parsed.type === 'Feature' && parsed.geometry) {
      if (parsed.geometry.type === 'LineString') {
        path = parsed.geometry.coordinates.map((c: any) => [parseFloat(c[1]), parseFloat(c[0])]);
        setDetectedType(`GeoJSON Feature LineString (${path.length} pts)`);
      } else if (parsed.geometry.type === 'Point') {
        markers = [
          {
            id: `geo-point-1`,
            lat: parseFloat(parsed.geometry.coordinates[1]),
            lon: parseFloat(parsed.geometry.coordinates[0]),
            label: parsed.properties?.label || parsed.properties?.name || 'Point',
          },
        ];
        setDetectedType('GeoJSON Feature Point');
      }
    }
    // 5. GeoJSON FeatureCollection
    else if (parsed && parsed.type === 'FeatureCollection' && Array.isArray(parsed.features)) {
      let lineCount = 0;
      let pointCount = 0;
      parsed.features.forEach((f: any, idx: number) => {
        if (f.geometry?.type === 'LineString') {
          path = f.geometry.coordinates.map((c: any) => [parseFloat(c[1]), parseFloat(c[0])]);
          lineCount++;
        } else if (f.geometry?.type === 'Point') {
          markers.push({
            id: `feature-${idx}`,
            lat: parseFloat(f.geometry.coordinates[1]),
            lon: parseFloat(f.geometry.coordinates[0]),
            label: f.properties?.label || f.properties?.name || `Waypoint ${pointCount + 1}`,
            radiusMeters: f.properties?.radiusMeters || 100,
          });
          pointCount++;
        }
      });
      setDetectedType(`GeoJSON FeatureCollection (${path.length} path pts, ${markers.length} pins)`);
    } else {
      setErrorMsg('Unrecognized format. Expected [[lat, lon]], {path, markers}, or GeoJSON.');
      return;
    }

    onImport(path, markers);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setRawText(content);
      parseData(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-lg bg-panel border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-panel-light">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-amber" />
            <h2 className="text-sm font-semibold text-text">Import Trajectory or Geofence Data</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-text-dim hover:text-text hover:bg-panel transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          <p className="text-xs text-text-dim leading-relaxed">
            Paste round-trip JSON, plain coordinate arrays like{' '}
            <code className="text-text font-mono">[[lat, lon], ...]</code>, or GeoJSON features.
          </p>

          <textarea
            value={rawText}
            onChange={(e) => {
              setRawText(e.target.value);
              setErrorMsg(null);
            }}
            placeholder='[[12.8373, 80.2255], [12.8480, 80.2398]]'
            className="w-full h-44 bg-background border border-border rounded-md p-3 font-mono text-xs text-text leading-relaxed resize-none focus:outline-none focus:border-cyan"
            spellCheck={false}
          />

          {/* File Upload Dropzone Trigger */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json,.geojson,.txt"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono text-text-dim hover:text-text bg-panel-light hover:bg-panel-hover border border-border transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-cyan" />
              <span>Load file (.json / .geojson)</span>
            </button>

            {detectedType && (
              <span className="text-[11px] font-mono text-emerald flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {detectedType}
              </span>
            )}
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded bg-crimson/10 border border-crimson/30 text-xs font-mono text-crimson flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-border bg-panel-light">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded text-xs font-semibold text-text-dim hover:text-text transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => parseData(rawText)}
            className="px-4 py-1.5 rounded text-xs font-semibold bg-amber text-background hover:bg-amber-hover transition-colors font-sans shadow-hud-amber"
          >
            Load Onto Canvas
          </button>
        </div>
      </div>
    </div>
  );
}
