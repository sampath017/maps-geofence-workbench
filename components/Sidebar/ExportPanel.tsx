'use client';

import React, { useState } from 'react';
import { Coordinate, WaypointMarker, ExportFormat } from '@/lib/types';
import {
  buildPythonSnippet,
  buildRoundTripJSON,
  buildGeoJSON,
  buildCSV,
  buildCurlCommand,
} from '@/lib/export';
import { Code, Copy, Check, Download, Send, CheckCircle2, Loader2 } from 'lucide-react';

interface ExportPanelProps {
  path: Coordinate[];
  markers: WaypointMarker[];
}

export default function ExportPanel({ path, markers }: ExportPanelProps) {
  const [activeFormat, setActiveFormat] = useState<ExportFormat>('python');
  const [copied, setCopied] = useState(false);
  const [isSendingWebhook, setIsSendingWebhook] = useState(false);
  const [webhookResponse, setWebhookResponse] = useState<string | null>(null);

  const getCodeContent = () => {
    switch (activeFormat) {
      case 'python':
        return buildPythonSnippet(path, markers);
      case 'json':
        return buildRoundTripJSON(path, markers);
      case 'geojson':
        return buildGeoJSON(path, markers);
      case 'csv':
        return buildCSV(path);
      case 'curl':
        return buildCurlCommand(path, markers);
      default:
        return '';
    }
  };

  const code = getCodeContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extensions: Record<ExportFormat, string> = {
      python: 'py',
      json: 'json',
      geojson: 'geojson',
      csv: 'csv',
      curl: 'sh',
    };

    const mimeTypes: Record<ExportFormat, string> = {
      python: 'text/x-python',
      json: 'application/json',
      geojson: 'application/geo+json',
      csv: 'text/csv',
      curl: 'text/plain',
    };

    const blob = new Blob([code], { type: mimeTypes[activeFormat] });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jarvis_route_${Date.now()}.${extensions[activeFormat]}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSendToWebhook = async () => {
    setIsSendingWebhook(true);
    setWebhookResponse(null);
    try {
      const res = await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: buildRoundTripJSON(path, markers),
      });
      const data = await res.json();
      setWebhookResponse(data.message || 'Payload dispatched successfully');
    } catch (err: any) {
      setWebhookResponse(`Dispatch error: ${err.message}`);
    } finally {
      setIsSendingWebhook(false);
      setTimeout(() => setWebhookResponse(null), 4000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-[10px] uppercase tracking-widest text-text-dim flex items-center gap-1.5">
            <Code className="w-3 h-3 text-amber" />
            Telemetry &amp; Code Serialization
          </span>
          <span className="font-mono text-[10px] text-text-muted">Multi-Target</span>
        </div>
        <p className="text-xs text-text-dim">
          Export full trajectory arrays and waypoint coordinates for simulation and automation pipelines.
        </p>
      </div>

      {/* Format Selector Pills */}
      <div className="flex flex-wrap gap-1 p-1 rounded-md bg-background border border-border">
        {(['python', 'json', 'geojson', 'csv', 'curl'] as ExportFormat[]).map((fmt) => (
          <button
            key={fmt}
            onClick={() => setActiveFormat(fmt)}
            className={`flex-1 min-w-[54px] py-1 text-center font-mono text-[11px] uppercase rounded transition-colors ${
              activeFormat === fmt
                ? 'bg-amber text-background font-bold shadow-sm'
                : 'text-text-dim hover:text-text hover:bg-panel-light'
            }`}
          >
            {fmt}
          </button>
        ))}
      </div>

      {/* Code Textarea Viewer */}
      <div className="relative">
        <textarea
          value={code}
          readOnly
          className="w-full h-[280px] bg-background border border-border rounded-md p-3 font-mono text-xs text-text leading-relaxed resize-none focus:outline-none focus:border-border-focus"
          spellCheck={false}
        />
        <div className="absolute top-2 right-2 flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono bg-panel/80 hover:bg-panel border border-border hover:border-amber text-text hover:text-amber transition-colors backdrop-blur-sm shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald" />
                <span className="text-emerald font-semibold">Copied ✓</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="p-1 rounded text-[11px] bg-panel/80 hover:bg-panel border border-border hover:border-cyan text-text-dim hover:text-cyan transition-colors backdrop-blur-sm shadow-sm"
            title="Download File"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={handleSendToWebhook}
          disabled={isSendingWebhook || path.length === 0}
          className="w-full flex items-center justify-center gap-2 py-2 rounded text-xs font-semibold bg-emerald/15 hover:bg-emerald hover:text-background text-emerald border border-emerald/40 transition-all disabled:opacity-50"
        >
          {isSendingWebhook ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>Dispatch to Telemetry Webhook (`/api/telemetry`)</span>
        </button>

        {webhookResponse && (
          <div className="p-2.5 rounded bg-emerald/10 border border-emerald/30 text-[11px] font-mono text-emerald flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{webhookResponse}</span>
          </div>
        )}
      </div>
    </div>
  );
}
