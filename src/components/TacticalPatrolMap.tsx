import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { ActivePatrol } from '../data/mockData';
import { Radio, AlertTriangle, Shield, Compass, MapPin, Plus, ExternalLink, RefreshCw, Send, CheckCircle2 } from 'lucide-react';
import { DevicePatrolTracker } from './DevicePatrolTracker';

import { getDeviceLocalDateTime } from '../utils/localDateTime';

interface TacticalPatrolMapProps {
  patrols: ActivePatrol[];
  onUpdatePatrol: (updated: ActivePatrol) => void;
  onAddPatrol: (newPatrol: ActivePatrol) => void;
  onTriggerSOS: (patrol: ActivePatrol) => void;
  activeRole: string;
  userEmail?: string;
}

export const TacticalPatrolMap: React.FC<TacticalPatrolMapProps> = ({
  patrols,
  onUpdatePatrol,
  onAddPatrol,
  onTriggerSOS,
  activeRole,
  userEmail = 'captainfakrul@gmail.com',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const polylineRef = useRef<{ [key: string]: L.Polyline }>({});

  const [selectedPatrol, setSelectedPatrol] = useState<ActivePatrol | null>(patrols[0] || null);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showSitrepModal, setShowSitrepModal] = useState(false);
  const [sitrepText, setSitrepText] = useState('');
  const [mapStyle, setMapStyle] = useState<'tactical' | 'satellite' | 'terrain'>('tactical');
  const [isSimulatingLiveTelemetry, setIsSimulatingLiveTelemetry] = useState(true);

  // New Patrol Form State
  const [newCallsign, setNewCallsign] = useState('');
  const [newMissionType, setNewMissionType] = useState<ActivePatrol['missionType']>('Route Recon');
  const [newCommander, setNewCommander] = useState('');
  const [newStrength, setNewStrength] = useState(16);
  const [newVehicles, setNewVehicles] = useState('UN-3401 (BTR-80)');
  const [newDestination, setNewDestination] = useState('Ippy Sector Checkpoint');
  const [newLat, setNewLat] = useState('5.840');
  const [newLng, setNewLng] = useState('20.800');

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Check if map already initialized
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [5.768, 20.665], // Bambari, CAR
        zoom: 10,
        zoomControl: true,
      });

      // OpenStreetMap Base Layer
      const baseTile = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; OpenStreetMap contributors • MINUSCA CAR AO',
          maxZoom: 18,
        }
      );
      baseTile.addTo(map);

      // Sector West MINUSCA Base Marker
      const hqIcon = L.divIcon({
        className: 'custom-hq-marker',
        html: `
          <div style="background-color: #0284c7; border: 2px solid #ffffff; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(2,132,199,0.8); color: white; font-weight: bold; font-size: 11px; font-family: monospace;">
            COB
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      L.marker([5.768, 20.665], { icon: hqIcon })
        .addTo(map)
        .bindPopup(`
          <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; padding: 4px;">
            <strong style="color: #0284c7;">MINUSCA BAMBARI COB</strong><br/>
            <span>Mechanized Company-2 Operating Base (BANBAT-13)</span><br/>
            <span style="font-size: 10px; color: #64748b;">Coordinates: 05°46'N, 020°39'E</span>
          </div>
        `);

      mapInstanceRef.current = map;
    }

    return () => {
      // Map cleanup if needed
    };
  }, []);

  // Sync Map markers and polylines with patrols
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    patrols.forEach((patrol) => {
      const isDuress = patrol.status === 'Incident / Duress';
      const markerColor = isDuress ? '#ef4444' : patrol.status === 'Active Moving' ? '#0284c7' : '#10b981';

      const customIcon = L.divIcon({
        className: `patrol-icon-${patrol.id}`,
        html: `
          <div style="position: relative;">
            <div style="background: ${markerColor}; border: 2px solid #ffffff; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px ${markerColor}; color: white; font-weight: 800; font-size: 10px; font-family: monospace;">
              ${patrol.callsign.substring(0, 3)}
            </div>
            ${
              isDuress
                ? `<div style="position: absolute; top: -6px; right: -6px; width: 14px; height: 14px; background: #dc2626; border-radius: 50%; border: 2px solid white; animation: ping 1s infinite;"></div>`
                : ''
            }
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      if (markersRef.current[patrol.id]) {
        markersRef.current[patrol.id].setLatLng([patrol.lat, patrol.lng]);
        markersRef.current[patrol.id].setIcon(customIcon);
      } else {
        const marker = L.marker([patrol.lat, patrol.lng], { icon: customIcon })
          .addTo(map)
          .on('click', () => {
            setSelectedPatrol(patrol);
          });
        markersRef.current[patrol.id] = marker;
      }

      // Draw breadcrumbs or route waypoints
      if (patrol.waypoints && patrol.waypoints.length > 1) {
        const lineCoords: [number, number][] = patrol.waypoints.map((w) => [w.lat, w.lng]);
        if (polylineRef.current[patrol.id]) {
          polylineRef.current[patrol.id].setLatLngs(lineCoords);
        } else {
          const polyline = L.polyline(lineCoords, {
            color: isDuress ? '#ef4444' : '#38bdf8',
            weight: 3,
            dashArray: '6, 6',
            opacity: 0.8,
          }).addTo(map);
          polylineRef.current[patrol.id] = polyline;
        }
      }
    });
  }, [patrols]);

  // Simulated live telemetry movement along CAR roads
  useEffect(() => {
    if (!isSimulatingLiveTelemetry) return;

    const interval = setInterval(() => {
      patrols.forEach((p) => {
        if (p.status === 'Active Moving') {
          // Slight micro-jitter or forward movement
          const dLat = (Math.random() - 0.48) * 0.001;
          const dLng = (Math.random() - 0.45) * 0.0012;
          const updated: ActivePatrol = {
            ...p,
            lat: Number((p.lat + dLat).toFixed(4)),
            lng: Number((p.lng + dLng).toFixed(4)),
            speedKmH: Math.max(25, Math.min(55, Math.round(p.speedKmH + (Math.random() * 4 - 2)))),
            lastCommsTime: 'Just now (Telemetry Live)',
          };
          onUpdatePatrol(updated);
        }
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [isSimulatingLiveTelemetry, patrols, onUpdatePatrol]);

  // Center on patrol
  const handleFlyTo = (patrol: ActivePatrol) => {
    setSelectedPatrol(patrol);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([patrol.lat, patrol.lng], 12, { duration: 1.2 });
    }
  };

  const handleOpenGoogleMaps = (patrol: ActivePatrol) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${patrol.lat},${patrol.lng}`;
    window.open(url, '_blank');
  };

  const handleSaveSitrep = () => {
    if (!selectedPatrol || !sitrepText.trim()) return;
    const { dateTime } = getDeviceLocalDateTime();
    const updated: ActivePatrol = {
      ...selectedPatrol,
      sitrep: `${sitrepText.trim()} [Logged on ${dateTime} LT]`,
      lastCommsTime: 'Just now',
    };
    onUpdatePatrol(updated);
    setSelectedPatrol(updated);
    setSitrepText('');
    setShowSitrepModal(false);
  };

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCallsign.trim() || !newCommander.trim()) return;

    const lat = parseFloat(newLat) || 5.768;
    const lng = parseFloat(newLng) || 20.665;
    const nowTime = getDeviceLocalDateTime();
    const returnTime = getDeviceLocalDateTime(new Date(Date.now() + 6 * 3600000));

    const newPat: ActivePatrol = {
      id: `pat-${Date.now()}`,
      callsign: newCallsign.trim().toUpperCase(),
      missionType: newMissionType,
      commander: newCommander.trim(),
      strength: Number(newStrength),
      vehicles: [newVehicles],
      departureTime: nowTime.isoLocal,
      expectedReturn: returnTime.isoLocal,
      locationName: newDestination.trim(),
      lat,
      lng,
      status: 'Active Moving',
      speedKmH: 35,
      lastCommsTime: 'Just dispatched',
      commsStatus: 'Green (VHF/HF Strong)',
      sitrep: `Patrol dispatched on ${newMissionType} towards ${newDestination}. Orders issued by ${activeRole}.`,
      waypoints: [
        { name: 'Bambari COB Gate', lat: 5.768, lng: 20.665, passed: true },
        { name: newDestination.trim(), lat, lng, passed: false },
      ],
    };

    onAddPatrol(newPat);
    setShowDispatchModal(false);
    setSelectedPatrol(newPat);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 11);
    }
  };

  return (
    <div className="space-y-4">
      {/* Tactical Map Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-sky-500/20 text-sky-400 rounded-lg">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide">
                OPERATIONAL TEAMS & PATROL TRACKING
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                BANBAT-13, MINUSCA • SECTOR WEST
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live GPS telemetries, MSR security routes, waypoint verification & duress beacon monitoring
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Live Telemetry toggle */}
          <button
            onClick={() => setIsSimulatingLiveTelemetry(!isSimulatingLiveTelemetry)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition ${
              isSimulatingLiveTelemetry
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingLiveTelemetry ? 'animate-spin' : ''}`} />
            <span>LIVE GPS {isSimulatingLiveTelemetry ? 'ACTIVE' : 'PAUSED'}</span>
          </button>

          {/* Dispatch Button */}
          <button
            onClick={() => setShowDispatchModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Dispatch Patrol</span>
          </button>
        </div>
      </div>

      {/* Live Device GPS Broadcaster for Patrol Commanders */}
      <DevicePatrolTracker
        patrols={patrols}
        userEmail={userEmail}
        selectedPatrolId={selectedPatrol?.id}
        onLocationUpdated={(lat, lng) => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.panTo([lat, lng]);
          }
        }}
      />

      {/* Main Grid: Map & Patrol Detail Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map View Container */}
        <div className="lg:col-span-2 relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl flex flex-col min-h-[350px] md:min-h-[520px]">
          {/* Top In-Map HUD Bar */}
          <div className="absolute top-2.5 left-2.5 right-2.5 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            <div className="bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-200 pointer-events-auto shadow-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-[11px]">MINUSCA SECTOR WEST</span>
              <span className="text-slate-500">|</span>
              <span className="text-sky-400 text-[11px]">{patrols.length} TEAMS</span>
            </div>

            <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-lg p-0.5 pointer-events-auto">
              <button
                onClick={() => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([5.768, 20.665], 11);
                  }
                }}
                className="px-2 py-0.5 text-[10px] font-mono text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
                title="Reset to Bambari COB"
              >
                BAMBARI
              </button>
              <button
                onClick={() => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([6.542, 21.986], 11);
                  }
                }}
                className="px-2 py-0.5 text-[10px] font-mono text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
                title="View Bria FOB"
              >
                BRIA
              </button>
              <button
                onClick={() => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([4.361, 18.555], 10);
                  }
                }}
                className="px-2 py-0.5 text-[10px] font-mono text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
                title="View Bangui MINUSCA HQ"
              >
                BANGUI
              </button>
            </div>
          </div>

          {/* Leaflet Map DOM Node */}
          <div ref={mapContainerRef} className="w-full h-full flex-1 z-0 min-h-[320px] md:min-h-[460px]" />

          {/* Bottom In-Map Quick Patrol Carousel */}
          <div className="bg-slate-900/95 border-t border-slate-800 p-2.5 flex items-center gap-2 overflow-x-auto scrollbar-thin">
            <span className="text-[11px] font-mono font-bold text-slate-400 shrink-0 px-2">
              ACTIVE UNITS:
            </span>
            {patrols.map((p) => {
              const isSelected = selectedPatrol?.id === p.id;
              const isDuress = p.status === 'Incident / Duress';
              return (
                <button
                  key={p.id}
                  onClick={() => handleFlyTo(p)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-left shrink-0 transition ${
                    isSelected
                      ? 'bg-sky-500/20 border-sky-400 text-white shadow-md'
                      : isDuress
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                      : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isDuress
                        ? 'bg-rose-500'
                        : p.status === 'Active Moving'
                        ? 'bg-sky-400'
                        : 'bg-emerald-400'
                    }`}
                  />
                  <div>
                    <div className="text-xs font-bold leading-tight flex items-center gap-1">
                      <span>{p.callsign}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({p.strength} men)</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                      {p.locationName}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Patrol Detail & SITREP Hub */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4">
          {selectedPatrol ? (
            <div className="space-y-4">
              {/* Callsign and Status */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white font-mono">{selectedPatrol.callsign}</h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        selectedPatrol.status === 'Incident / Duress'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                          : selectedPatrol.status === 'Active Moving'
                          ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}
                    >
                      {selectedPatrol.status}
                    </span>
                  </div>
                  <p className="text-xs text-sky-400 font-medium mt-0.5">
                    {selectedPatrol.missionType} • {selectedPatrol.strength} Peacekeepers
                  </p>
                </div>

                <button
                  onClick={() => handleOpenGoogleMaps(selectedPatrol)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 border border-slate-700 transition"
                  title="Open live coordinates on Google Maps"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                  <span>Google Map</span>
                </button>
              </div>

              {/* Vital Telemetry Card */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
                  <div className="text-slate-400 text-[10px]">PATROL COMMANDER</div>
                  <div className="font-bold text-white truncate mt-0.5">{selectedPatrol.commander}</div>
                </div>

                <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
                  <div className="text-slate-400 text-[10px]">CURRENT SPEED</div>
                  <div className="font-bold text-emerald-400 mt-0.5">{selectedPatrol.speedKmH} km/h</div>
                </div>

                <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
                  <div className="text-slate-400 text-[10px]">GPS COORDINATES</div>
                  <div className="font-bold text-sky-300 mt-0.5">
                    {selectedPatrol.lat.toFixed(4)}°N, {selectedPatrol.lng.toFixed(4)}°E
                  </div>
                </div>

                <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
                  <div className="text-slate-400 text-[10px]">COMMS CHECK</div>
                  <div className="font-bold text-white mt-0.5 truncate">{selectedPatrol.lastCommsTime}</div>
                </div>
              </div>

              {/* Vehicles Assigned */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Vehicles Assigned
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPatrol.vehicles.map((v, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded bg-slate-800 text-xs font-mono text-slate-200 border border-slate-700"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              {/* Waypoint Progress */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Waypoints & Route Progress
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 text-xs font-mono">
                  {selectedPatrol.waypoints.map((wp, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-2 rounded border ${
                        wp.passed
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-slate-800/40 border-slate-700/60 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2
                          className={`w-3.5 h-3.5 ${wp.passed ? 'text-emerald-400' : 'text-slate-500'}`}
                        />
                        <span>{wp.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {wp.lat.toFixed(3)}°N, {wp.lng.toFixed(3)}°E
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Situation Report (SITREP) */}
              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-sky-400 uppercase">
                    CURRENT SITUATION REPORT (SITREP)
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{selectedPatrol.sitrep}</p>
              </div>

              {/* Action Buttons: Log Sitrep & Duress Trigger */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => setShowSitrepModal(true)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition"
                >
                  <Send className="w-3.5 h-3.5 text-sky-400" />
                  <span>Update SITREP</span>
                </button>

                <button
                  onClick={() => onTriggerSOS(selectedPatrol)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg transition active:scale-95"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>DURESS / SOS BEACON</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Select a patrol on the map to inspect live telemetry and SITREPs.
            </div>
          )}
        </div>
      </div>

      {/* Dispatch Patrol Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-xl border border-sky-500/40 bg-slate-900 p-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  DISPATCH OPERATIONAL TEAM / PATROL
                </h3>
              </div>
              <button
                onClick={() => setShowDispatchModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDispatchSubmit} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Patrol Callsign *</label>
                  <input
                    type="text"
                    value={newCallsign}
                    onChange={(e) => setNewCallsign(e.target.value)}
                    placeholder="e.g. PATROL FALCON 3"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Mission Type *</label>
                  <select
                    value={newMissionType}
                    onChange={(e) => setNewMissionType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                  >
                    <option value="Route Recon">Route Recon (MSR)</option>
                    <option value="Market Security & CIMIC">Market Security & CIMIC</option>
                    <option value="Logistics Convoy Escort">Logistics Convoy Escort</option>
                    <option value="Area Domination Foot Patrol">Area Domination Foot Patrol</option>
                    <option value="QRT Standby">Quick Reaction Team (QRT)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Patrol Commander (Rank & Name) *</label>
                  <input
                    type="text"
                    value={newCommander}
                    onChange={(e) => setNewCommander(e.target.value)}
                    placeholder="e.g. Lt. Tariq Rahman"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Personnel Strength *</label>
                  <input
                    type="number"
                    value={newStrength}
                    onChange={(e) => setNewStrength(Number(e.target.value))}
                    min={4}
                    max={36}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Assigned Vehicles</label>
                <input
                  type="text"
                  value={newVehicles}
                  onChange={(e) => setNewVehicles(e.target.value)}
                  placeholder="e.g. UN-3401 (BTR-80), UN-3405 (Land Cruiser)"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-slate-400 mb-1 font-medium">Destination / Sector</label>
                  <input
                    type="text"
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value)}
                    placeholder="Ngakobo / Ippy"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Start Lat (°N)</label>
                  <input
                    type="text"
                    value={newLat}
                    onChange={(e) => setNewLat(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Start Lng (°E)</label>
                  <input
                    type="text"
                    value={newLng}
                    onChange={(e) => setNewLng(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold shadow"
                >
                  Authorize & Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update SITREP Modal */}
      {showSitrepModal && selectedPatrol && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-sky-500/40 bg-slate-900 p-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                TRANSMIT SITREP: {selectedPatrol.callsign}
              </h3>
              <button onClick={() => setShowSitrepModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="mt-3 space-y-3 text-xs">
              <p className="text-slate-400">
                Enter current operational report, road condition, civilian interactions or security observations:
              </p>
              <textarea
                value={sitrepText}
                onChange={(e) => setSitrepText(e.target.value)}
                rows={4}
                placeholder="e.g. Checkpoint Alpha cleared. Civilian traffic flowing peacefully. No hostile armed presence detected."
                className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowSitrepModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSitrep}
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold"
                >
                  Broadcast to TOC
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
