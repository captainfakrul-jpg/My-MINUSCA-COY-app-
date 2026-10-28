import React, { useState } from 'react';
import { VehicleJobCard } from '../data/mockData';
import { Wrench, CheckCircle2, AlertTriangle, Plus, FileText, Clock, Shield } from 'lucide-react';
import { getDeviceLocalDateTime } from '../utils/localDateTime';

interface VehicleMaintenanceModuleProps {
  jobCards: VehicleJobCard[];
  onUpdateJobCard: (updated: VehicleJobCard) => void;
  onAddJobCard: (newCard: VehicleJobCard) => void;
  activeRole: string;
}

export const VehicleMaintenanceModule: React.FC<VehicleMaintenanceModuleProps> = ({
  jobCards,
  onUpdateJobCard,
  onAddJobCard,
  activeRole,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);

  // New Job card form
  const [newVehCallsign, setNewVehCallsign] = useState('THUNDER 3');
  const [newUnNo, setNewUnNo] = useState('UN-3403');
  const [newDefect, setNewDefect] = useState('');
  const [newTechnician, setNewTechnician] = useState('Havildar Selim Reza (MT NCO)');
  const [newParts, setNewParts] = useState('');
  const [newMileage, setNewMileage] = useState(14950);

  // First parade checklist state
  const [paradeChecks, setParadeChecks] = useState({
    engineOil: true,
    radiatorCoolant: true,
    tirePressure: true,
    brakeFluid: true,
    armorHatchLocks: true,
    radioCommsLink: true,
    fireExtinguisher: true,
    towCableRecovery: true,
  });

  const handleMarkComplete = (card: VehicleJobCard) => {
    onUpdateJobCard({
      ...card,
      status: 'Completed & Tested',
      dateCompleted: getDeviceLocalDateTime().date,
    });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDefect.trim()) return;

    const newCard: VehicleJobCard = {
      id: `jc-${Date.now()}`,
      jobCardNo: `JC-CAR-10${jobCards.length + 1}`,
      vehicleCallsign: newVehCallsign,
      unNumber: newUnNo,
      defectReported: newDefect.trim(),
      partsReplaced: newParts ? newParts.split(',').map((p) => p.trim()) : [],
      technician: newTechnician,
      dateStarted: getDeviceLocalDateTime().date,
      status: 'Under Repair',
      mileageAtService: Number(newMileage),
    };

    onAddJobCard(newCard);
    setShowAddModal(false);
    setNewDefect('');
    setNewParts('');
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                VEHICLE MAINTENANCE SCHEDULES & REPAIR LOGS
              </h2>
              <p className="text-xs text-slate-400">
                Workshop Job Cards, EME Overhaul Schedules & Daily Driver First Parade Inspections
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowChecklistModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Daily First Parade Check</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Open Job Card</span>
            </button>
          </div>
        </div>

        {/* Preventative Maintenance Tiers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs font-mono">
          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60">
            <span className="text-sky-400 font-bold block mb-1">TIER 1: DAILY PARADE</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Driver visual inspection: fluids, tires, winches, bullet-resistant glass, and hatch locks before engine start.
            </p>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60">
            <span className="text-amber-400 font-bold block mb-1">TIER 2: 5,000 KM SERVICE</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Engine oil change, oil/fuel filter renewal, brake drum adjustment, wheel hub greasing, suspension bushings.
            </p>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60">
            <span className="text-purple-400 font-bold block mb-1">TIER 3: 10,000 KM OVERHAUL</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Transmission fluid flush, differential gear inspection, injector calibration, electrical wiring and alternator testing.
            </p>
          </div>
        </div>
      </div>

      {/* Workshop Job Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobCards.map((card) => {
          const isDone = card.status === 'Completed & Tested';
          const isSpares = card.status === 'Awaiting Spares';

          return (
            <div
              key={card.id}
              className={`bg-slate-900 border rounded-xl p-4 shadow-lg flex flex-col justify-between space-y-3 ${
                isDone
                  ? 'border-emerald-500/40'
                  : isSpares
                  ? 'border-rose-500/40'
                  : 'border-amber-500/40'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-amber-400">{card.jobCardNo}</span>
                    <h3 className="text-base font-bold text-white font-mono mt-0.5">
                      {card.vehicleCallsign} ({card.unNumber})
                    </h3>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isSpares
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {card.status}
                  </span>
                </div>

                <div className="mt-3 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-xs">
                  <span className="text-[10px] text-slate-400 font-mono block">DEFECT REPORTED:</span>
                  <p className="text-slate-200 mt-0.5">{card.defectReported}</p>
                </div>

                {card.partsReplaced.length > 0 && (
                  <div className="mt-2 text-xs font-mono">
                    <span className="text-[10px] text-slate-400 block">PARTS REPLACED:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {card.partsReplaced.map((part, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700"
                        >
                          {part}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                  <div>Technician: <strong className="text-slate-200">{card.technician}</strong></div>
                  <div>Mileage: <strong className="text-white">{card.mileageAtService.toLocaleString()} KM</strong></div>
                  <div>Started: <strong className="text-slate-200">{card.dateStarted}</strong></div>
                  <div>Completed: <strong className="text-emerald-400">{card.dateCompleted || 'In Progress'}</strong></div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-2 border-t border-slate-800">
                {!isDone && (
                  <button
                    onClick={() => handleMarkComplete(card)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Road Test &amp; Sign-Off</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Daily First Parade Inspection Modal */}
      {showChecklistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-emerald-500/40 bg-slate-900 p-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                DAILY FIRST PARADE INSPECTION CHECKLIST
              </h3>
              <button onClick={() => setShowChecklistModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <p className="text-slate-400 text-[11px]">
                Standard UN Peacekeeping Driver Daily Pre-Mission Checklist:
              </p>

              {Object.entries(paradeChecks).map(([key, val]) => (
                <label
                  key={key}
                  className="flex items-center justify-between p-2 rounded bg-slate-800/80 border border-slate-700/60 cursor-pointer hover:bg-slate-800"
                >
                  <span className="font-mono text-slate-200">
                    {key.replace(/([A-Z])/g, ' $1').toUpperCase()}
                  </span>
                  <input
                    type="checkbox"
                    checked={val}
                    onChange={(e) =>
                      setParadeChecks({ ...paradeChecks, [key]: e.target.checked })
                    }
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                </label>
              ))}

              <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                <span className="text-[10px] text-emerald-400 font-mono">
                  Verified by MT Havildar &amp; 2IC
                </span>
                <button
                  onClick={() => setShowChecklistModal(false)}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Certify Parade Ready
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Open Job Card Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-amber-500/40 bg-slate-900 p-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                OPEN WORKSHOP REPAIR JOB CARD
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-3 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Vehicle Callsign</label>
                  <input
                    type="text"
                    value={newVehCallsign}
                    onChange={(e) => setNewVehCallsign(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-amber-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">UN Number</label>
                  <input
                    type="text"
                    value={newUnNo}
                    onChange={(e) => setNewUnNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-amber-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Defect Reported by Crew *</label>
                <textarea
                  value={newDefect}
                  onChange={(e) => setNewDefect(e.target.value)}
                  rows={2}
                  placeholder="e.g. Excessive smoke from exhaust, high coolant temperature on patrol"
                  className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Parts Required (comma-separated)</label>
                <input
                  type="text"
                  value={newParts}
                  onChange={(e) => setNewParts(e.target.value)}
                  placeholder="e.g. Fuel Filter, Thermostat, Hose clamp"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Assigned EME Mechanic</label>
                  <input
                    type="text"
                    value={newTechnician}
                    onChange={(e) => setNewTechnician(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Current Mileage (KM)</label>
                  <input
                    type="number"
                    value={newMileage}
                    onChange={(e) => setNewMileage(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold"
                >
                  Open Job Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
