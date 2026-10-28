import React, { useState, useMemo } from 'react';
import { Vehicle, calculateFleetReadiness } from '../utils/commandLogic';
import { Truck, Fuel, Gauge, AlertTriangle, CheckCircle, Wrench, Plus, MapPin, Edit2, Check, X, Trash2 } from 'lucide-react';

interface VehicleModuleProps {
  vehicles: Vehicle[];
  onUpdateVehicle: (updated: Vehicle) => void;
  onAddVehicle: (newVehicle: Vehicle) => void;
  onDeleteVehicle?: (id: string) => void;
  onNavigateToMaintenance?: () => void;
  activeRole: string;
}

export const VehicleModule: React.FC<VehicleModuleProps> = ({
  vehicles,
  onUpdateVehicle,
  onAddVehicle,
  onDeleteVehicle,
  onNavigateToMaintenance,
  activeRole,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFaultModal, setShowFaultModal] = useState(false);
  const [faultText, setFaultText] = useState('');

  // Per-vehicle fault logging input state
  const [cardFaultInputs, setCardFaultInputs] = useState<Record<string, string>>({});

  // Overrides for the 5 Fleet KPI Cards
  const [metricOverrides, setMetricOverrides] = useState<{
    total?: number;
    onRoad?: number;
    amber?: number;
    offRoad?: number;
    readinessPercent?: number;
  }>({});
  const [editingCardKey, setEditingCardKey] = useState<string | null>(null);
  const [editingCardValue, setEditingCardValue] = useState<string>('');

  // Add Vehicle Form
  const [newCallsign, setNewCallsign] = useState('');
  const [newUnNumber, setNewUnNumber] = useState('');
  const [newType, setNewType] = useState<Vehicle['type']>('BTR-80 APC');
  const [newPlatoon, setNewPlatoon] = useState('1 Platoon');
  const [newDriver, setNewDriver] = useState('');
  const [newCommander, setNewCommander] = useState('');
  const [newFuel, setNewFuel] = useState(90);
  const [newMileage, setNewMileage] = useState(10000);
  const [newLocation, setNewLocation] = useState('Bambari COB');

  const computedFleet = useMemo(() => calculateFleetReadiness(vehicles), [vehicles]);
  const fleet = useMemo(() => {
    const total = metricOverrides.total !== undefined ? metricOverrides.total : computedFleet.total;
    const onRoad = metricOverrides.onRoad !== undefined ? metricOverrides.onRoad : computedFleet.onRoad;
    const amber = metricOverrides.amber !== undefined ? metricOverrides.amber : computedFleet.amber;
    const offRoad = metricOverrides.offRoad !== undefined ? metricOverrides.offRoad : computedFleet.offRoad;
    const readinessPercent = metricOverrides.readinessPercent !== undefined
      ? metricOverrides.readinessPercent
      : (total > 0 ? Math.round((onRoad / total) * 100) : computedFleet.readinessPercent);

    return {
      total,
      onRoad,
      amber,
      offRoad,
      readinessPercent,
      avgFuel: computedFleet.avgFuel,
    };
  }, [computedFleet, metricOverrides]);

  const handleStartEditMetric = (key: string, val: number) => {
    setEditingCardKey(key);
    setEditingCardValue(String(val));
  };

  const handleSaveMetric = (key: keyof typeof metricOverrides) => {
    const num = parseInt(editingCardValue, 10);
    if (!isNaN(num)) {
      setMetricOverrides((prev) => ({
        ...prev,
        [key]: num,
      }));
    }
    setEditingCardKey(null);
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    if (onDeleteVehicle) {
      onDeleteVehicle(vehicleId);
    }
    if (selectedVehicle?.id === vehicleId) {
      setSelectedVehicle(null);
    }
  };

  const handleLogCardFault = (vehicle: Vehicle) => {
    const text = cardFaultInputs[vehicle.id]?.trim();
    if (!text) return;
    const newFaults = [...vehicle.faults, `${text} (Logged by ${activeRole})`];
    const newStatus = vehicle.status === 'On-Road (Mission Ready)' ? 'Amber (Maintenance Due)' : vehicle.status;
    const updated: Vehicle = {
      ...vehicle,
      status: newStatus,
      faults: newFaults,
    };
    onUpdateVehicle(updated);
    if (selectedVehicle?.id === vehicle.id) {
      setSelectedVehicle(updated);
    }
    setCardFaultInputs((prev) => ({ ...prev, [vehicle.id]: '' }));
  };

  const handleRemoveFault = (vehicle: Vehicle, indexToRemove: number) => {
    const newFaults = vehicle.faults.filter((_, idx) => idx !== indexToRemove);
    const newStatus = newFaults.length === 0 && vehicle.status === 'Amber (Maintenance Due)'
      ? 'On-Road (Mission Ready)'
      : vehicle.status;
    const updated: Vehicle = {
      ...vehicle,
      status: newStatus,
      faults: newFaults,
    };
    onUpdateVehicle(updated);
    if (selectedVehicle?.id === vehicle.id) {
      setSelectedVehicle(updated);
    }
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (selectedStatus === 'ALL') return true;
      if (selectedStatus === 'On-Road') return v.status === 'On-Road (Mission Ready)';
      if (selectedStatus === 'Amber') return v.status === 'Amber (Maintenance Due)';
      if (selectedStatus === 'Off-Road') return v.status === 'Off-Road (Deadlined)';
      return true;
    });
  }, [vehicles, selectedStatus]);

  const handleRefuel = (vehicle: Vehicle) => {
    const updated: Vehicle = {
      ...vehicle,
      fuelPercent: 100,
    };
    onUpdateVehicle(updated);
    if (selectedVehicle?.id === vehicle.id) {
      setSelectedVehicle(updated);
    }
  };

  const handleStatusChange = (vehicle: Vehicle, newStatus: Vehicle['status']) => {
    const updated: Vehicle = {
      ...vehicle,
      status: newStatus,
    };
    onUpdateVehicle(updated);
    if (selectedVehicle?.id === vehicle.id) {
      setSelectedVehicle(updated);
    }
  };

  const handleAddFault = () => {
    if (!selectedVehicle || !faultText.trim()) return;
    const updated: Vehicle = {
      ...selectedVehicle,
      status: selectedVehicle.status === 'On-Road (Mission Ready)' ? 'Amber (Maintenance Due)' : selectedVehicle.status,
      faults: [...selectedVehicle.faults, `${faultText.trim()} (Logged by ${activeRole})`],
    };
    onUpdateVehicle(updated);
    setSelectedVehicle(updated);
    setFaultText('');
    setShowFaultModal(false);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnNumber.trim()) return;

    const baNumber = newUnNumber.trim().toUpperCase();

    const newVeh: Vehicle = {
      id: `v-${Date.now()}`,
      callsign: baNumber,
      unNumber: baNumber,
      type: newType,
      platoon: newPlatoon,
      driver: newDriver.trim() || 'Assigned Driver',
      commander: newCommander.trim() || 'Vehicle Commander',
      status: 'On-Road (Mission Ready)',
      fuelPercent: Number(newFuel),
      fuelType: 'Diesel',
      mileageKm: Number(newMileage),
      lastServiceDate: new Date().toISOString().substring(0, 10),
      nextServiceKm: Number(newMileage) + 1000,
      currentLocation: newLocation.trim(),
      faults: [],
    };

    onAddVehicle(newVeh);
    setShowAddModal(false);
    setNewCallsign('');
    setNewUnNumber('');
  };

  return (
    <div className="space-y-4">
      {/* Fleet Readiness Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-lg">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                COMPANY VEHICLE & MOBILITY STATE
              </h2>
              <p className="text-xs text-slate-400">
                Armored Personnel Carriers (BTR-80s), Patrol Vehicles & Support Fleet in CAR Sector
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToMaintenance && (
              <button
                onClick={onNavigateToMaintenance}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              >
                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                <span>Workshop Logs</span>
              </button>
            )}

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vehicle</span>
            </button>
          </div>
        </div>

        {/* Fleet KPI Grid - All 5 divs directly editable */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 text-xs font-mono">
          {/* Card 1: TOTAL FLEET */}
          <div
            className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 text-center relative group hover:border-sky-500/60 transition cursor-pointer"
            title="Click to edit Total Fleet"
            onClick={() => {
              if (editingCardKey !== 'total') handleStartEditMetric('total', fleet.total);
            }}
          >
            <div className="flex items-center justify-between text-slate-400 text-[10px] mb-0.5">
              <span>TOTAL FLEET</span>
              <Edit2 className="w-2.5 h-2.5 text-slate-500 group-hover:text-sky-400 transition" />
            </div>
            {editingCardKey === 'total' ? (
              <div className="flex items-center justify-center gap-1 my-1" onClick={(e) => e.stopPropagation()}>
                <input
                  type="number"
                  value={editingCardValue}
                  onChange={(e) => setEditingCardValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveMetric('total');
                    if (e.key === 'Escape') setEditingCardKey(null);
                  }}
                  autoFocus
                  className="w-16 text-center font-mono font-bold text-white bg-slate-900 border border-sky-500 rounded px-1 py-0.5 text-base outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleSaveMetric('total')}
                  className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                  title="Save"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCardKey(null)}
                  className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300"
                  title="Cancel"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <span className="text-2xl font-black text-white block my-0.5">{fleet.total}</span>
            )}
            <span className="text-[10px] text-slate-500 block">Vehicles</span>
          </div>

          {/* Card 2: ON-ROAD (MISSION READY) */}
          <div
            className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 text-center relative group hover:border-emerald-500/60 transition cursor-pointer"
            title="Click to edit On-Road Fleet"
            onClick={() => {
              if (editingCardKey !== 'onRoad') handleStartEditMetric('onRoad', fleet.onRoad);
            }}
          >
            <div className="flex items-center justify-between text-slate-400 text-[10px] mb-0.5">
              <span>ON-ROAD (MISSION READY)</span>
              <Edit2 className="w-2.5 h-2.5 text-slate-500 group-hover:text-emerald-400 transition" />
            </div>
            {editingCardKey === 'onRoad' ? (
              <div className="flex items-center justify-center gap-1 my-1" onClick={(e) => e.stopPropagation()}>
                <input
                  type="number"
                  value={editingCardValue}
                  onChange={(e) => setEditingCardValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveMetric('onRoad');
                    if (e.key === 'Escape') setEditingCardKey(null);
                  }}
                  autoFocus
                  className="w-16 text-center font-mono font-bold text-emerald-400 bg-slate-900 border border-emerald-500 rounded px-1 py-0.5 text-base outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleSaveMetric('onRoad')}
                  className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                  title="Save"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCardKey(null)}
                  className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300"
                  title="Cancel"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <span className="text-2xl font-black text-emerald-400 block my-0.5">{fleet.onRoad}</span>
            )}
            <span className="text-[10px] text-emerald-400/80 block">Operational</span>
          </div>

          {/* Card 3: AMBER (MAINT DUE) */}
          <div
            className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 text-center relative group hover:border-amber-500/60 transition cursor-pointer"
            title="Click to edit Amber Fleet"
            onClick={() => {
              if (editingCardKey !== 'amber') handleStartEditMetric('amber', fleet.amber);
            }}
          >
            <div className="flex items-center justify-between text-slate-400 text-[10px] mb-0.5">
              <span>AMBER (MAINT DUE)</span>
              <Edit2 className="w-2.5 h-2.5 text-slate-500 group-hover:text-amber-400 transition" />
            </div>
            {editingCardKey === 'amber' ? (
              <div className="flex items-center justify-center gap-1 my-1" onClick={(e) => e.stopPropagation()}>
                <input
                  type="number"
                  value={editingCardValue}
                  onChange={(e) => setEditingCardValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveMetric('amber');
                    if (e.key === 'Escape') setEditingCardKey(null);
                  }}
                  autoFocus
                  className="w-16 text-center font-mono font-bold text-amber-400 bg-slate-900 border border-amber-500 rounded px-1 py-0.5 text-base outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleSaveMetric('amber')}
                  className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                  title="Save"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCardKey(null)}
                  className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300"
                  title="Cancel"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <span className="text-2xl font-black text-amber-400 block my-0.5">{fleet.amber}</span>
            )}
            <span className="text-[10px] text-amber-400/80 block">Scheduled Service</span>
          </div>

          {/* Card 4: DEADLINED (OFF-ROAD) */}
          <div
            className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 text-center relative group hover:border-rose-500/60 transition cursor-pointer"
            title="Click to edit Deadlined Fleet"
            onClick={() => {
              if (editingCardKey !== 'offRoad') handleStartEditMetric('offRoad', fleet.offRoad);
            }}
          >
            <div className="flex items-center justify-between text-slate-400 text-[10px] mb-0.5">
              <span>DEADLINED (OFF-ROAD)</span>
              <Edit2 className="w-2.5 h-2.5 text-slate-500 group-hover:text-rose-400 transition" />
            </div>
            {editingCardKey === 'offRoad' ? (
              <div className="flex items-center justify-center gap-1 my-1" onClick={(e) => e.stopPropagation()}>
                <input
                  type="number"
                  value={editingCardValue}
                  onChange={(e) => setEditingCardValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveMetric('offRoad');
                    if (e.key === 'Escape') setEditingCardKey(null);
                  }}
                  autoFocus
                  className="w-16 text-center font-mono font-bold text-rose-400 bg-slate-900 border border-rose-500 rounded px-1 py-0.5 text-base outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleSaveMetric('offRoad')}
                  className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                  title="Save"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCardKey(null)}
                  className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300"
                  title="Cancel"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <span className="text-2xl font-black text-rose-400 block my-0.5">{fleet.offRoad}</span>
            )}
            <span className="text-[10px] text-rose-400/80 block">Workshop / Parts</span>
          </div>

          {/* Card 5: FLEET READINESS */}
          <div
            className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 text-center col-span-2 sm:col-span-1 relative group hover:border-sky-500/60 transition cursor-pointer"
            title="Click to edit Fleet Readiness"
            onClick={() => {
              if (editingCardKey !== 'readinessPercent') handleStartEditMetric('readinessPercent', fleet.readinessPercent);
            }}
          >
            <div className="flex items-center justify-between text-slate-400 text-[10px] mb-0.5">
              <span>FLEET READINESS</span>
              <Edit2 className="w-2.5 h-2.5 text-slate-500 group-hover:text-sky-400 transition" />
            </div>
            {editingCardKey === 'readinessPercent' ? (
              <div className="flex items-center justify-center gap-1 my-1" onClick={(e) => e.stopPropagation()}>
                <input
                  type="number"
                  value={editingCardValue}
                  onChange={(e) => setEditingCardValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveMetric('readinessPercent');
                    if (e.key === 'Escape') setEditingCardKey(null);
                  }}
                  autoFocus
                  className="w-16 text-center font-mono font-bold text-sky-400 bg-slate-900 border border-sky-500 rounded px-1 py-0.5 text-base outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleSaveMetric('readinessPercent')}
                  className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                  title="Save"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCardKey(null)}
                  className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300"
                  title="Cancel"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <span className="text-2xl font-black text-sky-400 block my-0.5">{fleet.readinessPercent}%</span>
            )}
            <span className="text-[10px] text-slate-400 block">Avg Fuel: {fleet.avgFuel}%</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-xl text-xs">
        <span className="text-slate-400 text-[11px] font-mono px-2">FILTER:</span>
        {[
          { label: 'All Fleet', val: 'ALL' },
          { label: 'On-Road Ready', val: 'On-Road' },
          { label: 'Amber Due', val: 'Amber' },
          { label: 'Off-Road Deadlined', val: 'Off-Road' },
        ].map((tab) => (
          <button
            key={tab.val}
            onClick={() => setSelectedStatus(tab.val)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              selectedStatus === tab.val
                ? 'bg-sky-600 text-white font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Vehicles Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredVehicles.map((vehicle) => {
          const isSelected = selectedVehicle?.id === vehicle.id;
          const isOffRoad = vehicle.status === 'Off-Road (Deadlined)';
          const isAmber = vehicle.status === 'Amber (Maintenance Due)';

          return (
            <div
              key={vehicle.id}
              onClick={() => setSelectedVehicle(vehicle)}
              className={`bg-slate-900 border rounded-xl p-4 shadow-lg cursor-pointer transition flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'border-sky-500 ring-1 ring-sky-500'
                  : isOffRoad
                  ? 'border-rose-500/40'
                  : isAmber
                  ? 'border-amber-500/40'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Card Header with delete option */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-white font-mono">{vehicle.callsign}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-sky-400 border border-slate-700">
                      {vehicle.unNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">{vehicle.type} • {vehicle.platoon}</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                      isOffRoad
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : isAmber
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}
                  >
                    {vehicle.status.split(' ')[0]}
                  </span>

                  {/* Delete option in case vehicle is taken back from company */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleDeleteVehicle(vehicle.id);
                    }}
                    className="p-1 rounded bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 transition"
                    title={`Delete ${vehicle.callsign} / Taken back from company`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Fuel & Mileage Meters */}
              <div className="space-y-2 text-xs font-mono">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span className="flex items-center gap-1">
                      <Fuel className="w-3.5 h-3.5 text-amber-400" />
                      Fuel Level ({vehicle.fuelType})
                    </span>
                    <span className="font-bold text-white">{vehicle.fuelPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        vehicle.fuelPercent > 50
                          ? 'bg-emerald-500'
                          : vehicle.fuelPercent > 25
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${vehicle.fuelPercent}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="bg-slate-800/60 p-2 rounded border border-slate-700/50">
                    <span className="text-slate-400 text-[10px] block">ODOMETER</span>
                    <span className="font-bold text-white">{vehicle.mileageKm.toLocaleString()} KM</span>
                  </div>

                  <div className="bg-slate-800/60 p-2 rounded border border-slate-700/50">
                    <span className="text-slate-400 text-[10px] block">NEXT SERVICE</span>
                    <span className="font-bold text-sky-300">{vehicle.nextServiceKm.toLocaleString()} KM</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] pt-1 truncate">
                  <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="truncate">{vehicle.currentLocation}</span>
                </div>
              </div>

              {/* Dedicated Issues / Defects Log Div inside the vehicle card */}
              <div
                className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 space-y-2 text-xs font-mono"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <AlertTriangle className={`w-3.5 h-3.5 ${vehicle.faults.length > 0 ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span>Defects & Issues Log ({vehicle.faults.length})</span>
                  </span>
                  {vehicle.faults.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {vehicle.faults.length} Active
                    </span>
                  )}
                </div>

                {/* List of logged defects with resolve button */}
                {vehicle.faults.length > 0 ? (
                  <div className="space-y-1 max-h-24 overflow-y-auto scrollbar-thin pr-0.5">
                    {vehicle.faults.map((fault, fIdx) => (
                      <div
                        key={fIdx}
                        className="flex items-center justify-between gap-1 text-[11px] p-1.5 rounded bg-slate-900 border border-slate-800 text-rose-300"
                      >
                        <span className="truncate">• {fault}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFault(vehicle, fIdx)}
                          className="text-slate-500 hover:text-emerald-400 p-0.5 rounded transition shrink-0"
                          title="Mark defect resolved"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500 italic">No defects reported. Vehicle fully mission ready.</p>
                )}

                {/* Direct inline logging field inside the div */}
                <div className="flex items-center gap-1.5 pt-1">
                  <input
                    type="text"
                    placeholder="Log defect (e.g. Brake wear, coolant leak...)"
                    value={cardFaultInputs[vehicle.id] || ''}
                    onChange={(e) => setCardFaultInputs((prev) => ({ ...prev, [vehicle.id]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleLogCardFault(vehicle);
                    }}
                    className="flex-1 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-[11px] focus:border-rose-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleLogCardFault(vehicle)}
                    className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold flex items-center gap-1 transition shrink-0"
                    title="Log defect to this vehicle"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Log</span>
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRefuel(vehicle);
                  }}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1"
                >
                  <Fuel className="w-3 h-3 text-amber-400" />
                  <span>Refuel 100%</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <select
                    value={vehicle.status}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleStatusChange(vehicle, e.target.value as Vehicle['status']);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200 text-[11px] outline-none"
                  >
                    <option value="On-Road (Mission Ready)">On-Road</option>
                    <option value="Amber (Maintenance Due)">Amber Due</option>
                    <option value="Off-Road (Deadlined)">Off-Road</option>
                  </select>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleDeleteVehicle(vehicle.id);
                    }}
                    className="p-1.5 rounded bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 transition"
                    title={`Delete ${vehicle.callsign} (Vehicle taken back)`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Vehicle Detail Drawer */}
      {selectedVehicle && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl text-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-bold text-white text-sm font-mono flex items-center gap-2">
              <Truck className="w-4 h-4 text-sky-400" />
              FLEET LOG: {selectedVehicle.callsign} ({selectedVehicle.unNumber}) - {selectedVehicle.type}
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleDeleteVehicle(selectedVehicle.id)}
                className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 text-xs font-semibold flex items-center gap-1 transition"
                title="Delete vehicle / Taken back from company"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Vehicle</span>
              </button>
              <button
                onClick={() => setShowFaultModal(true)}
                className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold"
              >
                + Log Defect
              </button>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="text-slate-400 hover:text-white px-2 py-0.5"
              >
                ✕ Close
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
            <div className="bg-slate-800/70 p-2.5 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 text-[10px] block">CREW ASSIGNMENT</span>
              <span className="text-white font-bold block">Comd: {selectedVehicle.commander}</span>
              <span className="text-slate-300 text-[11px]">Driver: {selectedVehicle.driver}</span>
            </div>

            <div className="bg-slate-800/70 p-2.5 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 text-[10px] block">LAST ROUTINE SERVICE</span>
              <span className="text-white font-bold block">{selectedVehicle.lastServiceDate}</span>
              <span className="text-slate-400 text-[11px]">Next: at {selectedVehicle.nextServiceKm} KM</span>
            </div>

            <div className="bg-slate-800/70 p-2.5 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 text-[10px] block">CURRENT DEPLOYMENT</span>
              <span className="text-sky-400 font-bold block">{selectedVehicle.currentLocation}</span>
              <span className="text-slate-400 text-[11px]">Platoon: {selectedVehicle.platoon}</span>
            </div>
          </div>
        </div>
      )}

      {/* Log Defect Modal */}
      {showFaultModal && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-rose-500/40 bg-slate-900 p-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                LOG MECHANICAL DEFECT: {selectedVehicle.callsign}
              </h3>
              <button onClick={() => setShowFaultModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="mt-3 space-y-3 text-xs">
              <textarea
                value={faultText}
                onChange={(e) => setFaultText(e.target.value)}
                rows={3}
                placeholder="e.g. Steering pull to right, radiator coolant seepage, or tire pressure loss..."
                className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-rose-500 outline-none"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowFaultModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddFault}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Submit to Workshop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-xl border border-sky-500/40 bg-slate-900 p-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                REGISTER VEHICLE TO CONTINGENT FLEET
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Vehicle BA Number *</label>
                <input
                  type="text"
                  value={newUnNumber}
                  onChange={(e) => setNewUnNumber(e.target.value)}
                  placeholder="e.g. BA-1111111"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Vehicle Platform Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                  >
                    <option value="BTR-80 APC">BTR-80 APC (Armored Personnel Carrier)</option>
                    <option value="Armored Patrol Vehicle">Armored Patrol Vehicle</option>
                    <option value="Toyota Landcruiser Hardtop Jeep">Toyota Landcruiser Hardtop Jeep</option>
                    <option value="Toyota Pick Up">Toyota Pick Up</option>
                    <option value="3 Ton">3 Ton</option>
                    <option value="Light Armored Vehicles">Light Armored Vehicles</option>
                    <option value="Engr Plant Vehicle">Engr Plant Vehicle</option>
                    <option value="4x4 Land Cruiser">4x4 Land Cruiser Hardtop</option>
                    <option value="Logistics Truck">Logistics Truck</option>
                    <option value="Water Bowser">Water Bowser</option>
                    <option value="Ambulance">Armored Ambulance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Assigned Platoon</label>
                  <input
                    type="text"
                    value={newPlatoon}
                    onChange={(e) => setNewPlatoon(e.target.value)}
                    placeholder="e.g. 1 Platoon"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Driver (Name & Rank)</label>
                  <input
                    type="text"
                    value={newDriver}
                    onChange={(e) => setNewDriver(e.target.value)}
                    placeholder="e.g. Pvt Mizan"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Vehicle Commander</label>
                  <input
                    type="text"
                    value={newCommander}
                    onChange={(e) => setNewCommander(e.target.value)}
                    placeholder="e.g. Lt. Tariq Rahman"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Fuel (%)</label>
                  <input
                    type="number"
                    value={newFuel}
                    onChange={(e) => setNewFuel(Number(e.target.value))}
                    min={0}
                    max={100}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Odometer (KM)</label>
                  <input
                    type="number"
                    value={newMileage}
                    onChange={(e) => setNewMileage(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Location</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Bambari Base"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold"
                >
                  Add to Fleet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
