import React, { useState, useEffect, useRef } from 'react';
import { ActivePatrol } from '../data/mockData';
import { broadcastDeviceTelemetry, LiveTelemetryUpdate } from '../firebase/tacticalSync';
import { Radio, MapPin, Compass, AlertCircle, CheckCircle2, Navigation, StopCircle, RefreshCw } from 'lucide-react';

interface DevicePatrolTrackerProps {
  patrols: ActivePatrol[];
  userEmail: string;
  selectedPatrolId?: string;
  onLocationUpdated?: (lat: number, lng: number) => void;
}

export const DevicePatrolTracker: React.FC<DevicePatrolTrackerProps> = ({
  patrols,
  userEmail,
  selectedPatrolId,
  onLocationUpdated,
}) => {
  const [activePatrolId, setActivePatrolId] = useState<string>(selectedPatrolId || patrols[0]?.id || '');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [lastFix, setLastFix] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
    speedKmH: number;
    heading: number;
    timestamp: string;
  } | null>(null);

  const watchIdRef = useRef<number | null>(null);

  // Sync selectedPatrolId from props if provided
  useEffect(() => {
    if (selectedPatrolId) {
      setActivePatrolId(selectedPatrolId);
    }
  }, [selectedPatrolId]);

  // Check initial permission state if supported
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setPermissionState('unsupported');
      setGeoError('Geolocation service is not supported on this device/browser.');
      return;
    }

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((result) => {
          setPermissionState(result.state as 'prompt' | 'granted' | 'denied');
          result.onchange = () => {
            setPermissionState(result.state as 'prompt' | 'granted' | 'denied');
          };
        })
        .catch(() => {
          // Permissions API query not supported for geolocation in some browsers
        });
    }
  }, []);

  const currentPatrol = patrols.find((p) => p.id === activePatrolId) || patrols[0];

  const handleStartTransmission = () => {
    if (!('geolocation' in navigator)) {
      setGeoError('Device geolocation is not available.');
      return;
    }

    setGeoError(null);
    setIsTransmitting(true);

    const onPositionSuccess = (pos: GeolocationPosition) => {
      const lat = Number(pos.coords.latitude.toFixed(6));
      const lng = Number(pos.coords.longitude.toFixed(6));
      const accuracy = Math.round(pos.coords.accuracy || 5);
      const speedKmH = pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : (currentPatrol?.speedKmH || 35);
      const heading = pos.coords.heading ? Math.round(pos.coords.heading) : 0;
      const timeStr = new Date().toLocaleTimeString();

      setLastFix({
        lat,
        lng,
        accuracy,
        speedKmH,
        heading,
        timestamp: timeStr,
      });

      if (onLocationUpdated) {
        onLocationUpdated(lat, lng);
      }

      if (currentPatrol) {
        const telemetry: LiveTelemetryUpdate = {
          patrolId: currentPatrol.id,
          callsign: currentPatrol.callsign,
          commanderName: currentPatrol.commander,
          lat,
          lng,
          accuracy,
          speedKmH,
          heading,
          isTransmitting: true,
          updatedAt: new Date().toISOString(),
        };

        broadcastDeviceTelemetry(telemetry, patrols, userEmail).catch((err) => {
          console.warn('Telemetry broadcast notice:', err);
        });
      }
    };

    const onPositionError = (err: GeolocationPositionError) => {
      let msg = 'Failed to retrieve device location.';
      if (err.code === err.PERMISSION_DENIED) {
        msg = 'Location access permission was denied. Please allow location access in your device/browser settings.';
        setPermissionState('denied');
      } else if (err.code === err.POSITION_UNAVAILABLE) {
        msg = 'Device GPS position is temporarily unavailable. Ensure GPS/Location is toggled ON.';
      } else if (err.code === err.TIMEOUT) {
        msg = 'GPS satellite fix timed out. Retrying...';
      }
      setGeoError(msg);
      setIsTransmitting(false);
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };

    // First request immediate position to trigger browser prompt
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPermissionState('granted');
        onPositionSuccess(pos);

        // Then start continuous high-accuracy watch
        const id = navigator.geolocation.watchPosition(onPositionSuccess, onPositionError, {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 3000,
        });
        watchIdRef.current = id;
      },
      onPositionError,
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const handleStopTransmission = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTransmitting(false);

    if (currentPatrol) {
      const telemetry: LiveTelemetryUpdate = {
        patrolId: currentPatrol.id,
        callsign: currentPatrol.callsign,
        commanderName: currentPatrol.commander,
        lat: lastFix ? lastFix.lat : currentPatrol.lat,
        lng: lastFix ? lastFix.lng : currentPatrol.lng,
        accuracy: lastFix ? lastFix.accuracy : 5,
        speedKmH: 0,
        heading: 0,
        isTransmitting: false,
        updatedAt: new Date().toISOString(),
      };
      broadcastDeviceTelemetry(telemetry, patrols, userEmail).catch(console.warn);
    }
  };

  // Clean up watcher on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg text-xs space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${isTransmitting ? 'bg-emerald-500/20 text-emerald-400 animate-pulse' : 'bg-sky-500/20 text-sky-400'}`}>
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              PATROL COMMANDER DEVICE GPS BROADCASTER
              {isTransmitting && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
                  ● LIVE BROADCASTING
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400">
              Streams your phone/tablet location live to TOC & all company devices
            </p>
          </div>
        </div>

        {/* Patrol Selector */}
        <div className="flex items-center gap-2">
          <label className="text-[11px] text-slate-400 font-mono">Assigned Patrol:</label>
          <select
            value={activePatrolId}
            onChange={(e) => setActivePatrolId(e.target.value)}
            disabled={isTransmitting}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono text-xs focus:border-sky-500 outline-none"
          >
            {patrols.map((p) => (
              <option key={p.id} value={p.id}>
                {p.callsign} ({p.missionType}) - {p.commander}
              </option>
            ))}
          </select>
        </div>
      </div>

      {geoError && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <div className="space-y-1">
            <p className="font-semibold text-xs">{geoError}</p>
            <p className="text-[11px] text-rose-400/80">
              To broadcast from mobile or laptop, tap the site settings lock icon in your browser address bar and switch 'Location' to Allow.
            </p>
          </div>
        </div>
      )}

      {/* Broadcaster Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-300">
              Transmitting as: <strong className="text-white">{currentPatrol?.callsign}</strong>
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">Commander: {currentPatrol?.commander}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isTransmitting
              ? 'GPS fix is updating automatically every few seconds and syncing across all devices.'
              : 'Press below to seek browser GPS access and start live positioning for this patrol.'}
          </p>
        </div>

        <div>
          {isTransmitting ? (
            <button
              onClick={handleStopTransmission}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg shadow-rose-900/30 transition active:scale-95"
            >
              <StopCircle className="w-4 h-4" />
              <span>Stop GPS Broadcast</span>
            </button>
          ) : (
            <button
              onClick={handleStartTransmission}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-900/30 transition active:scale-95"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Broadcast Device GPS (Live)</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Telemetry Readout */}
      {lastFix && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
          <div className="p-2.5 rounded-lg bg-slate-800/90 border border-slate-700">
            <span className="text-slate-400 block text-[10px]">DEVICE LATITUDE</span>
            <span className="text-white font-bold text-xs">{lastFix.lat.toFixed(5)}°</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/90 border border-slate-700">
            <span className="text-slate-400 block text-[10px]">DEVICE LONGITUDE</span>
            <span className="text-white font-bold text-xs">{lastFix.lng.toFixed(5)}°</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/90 border border-slate-700">
            <span className="text-slate-400 block text-[10px]">GPS ACCURACY</span>
            <span className="text-emerald-400 font-bold text-xs">±{lastFix.accuracy} meters</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/90 border border-slate-700">
            <span className="text-slate-400 block text-[10px]">LAST TOC SYNC</span>
            <span className="text-sky-400 font-bold text-xs">{lastFix.timestamp}</span>
          </div>
        </div>
      )}
    </div>
  );
};
