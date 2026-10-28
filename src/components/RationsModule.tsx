import React, { useState, useMemo } from 'react';
import { RationState, calculateRationDOS } from '../utils/commandLogic';
import { Utensils, Droplets, Package, AlertTriangle, CheckCircle, Plus, RefreshCw, FileText } from 'lucide-react';

interface RationsModuleProps {
  ration: RationState;
  effectiveStrength: number;
  onUpdateRation: (updated: RationState) => void;
  activeRole: string;
}

export const RationsModule: React.FC<RationsModuleProps> = ({
  ration,
  effectiveStrength,
  onUpdateRation,
  activeRole,
}) => {
  const [showResupplyModal, setShowResupplyModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueMreQty, setIssueMreQty] = useState(36);
  const [issueWaterQty, setIssueWaterQty] = useState(150);
  const [issueReason, setIssueReason] = useState('Patrol Eagle 1 (MSR2 Recon 18 Pax)');

  // Resupply fields
  const [resupplyDryKg, setResupplyDryKg] = useState(1000);
  const [resupplyMre, setResupplyMre] = useState(500);
  const [resupplyWater, setResupplyWater] = useState(3000);

  const dos = useMemo(() => calculateRationDOS(ration, effectiveStrength), [ration, effectiveStrength]);

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: RationState = {
      ...ration,
      mrePacks: Math.max(0, ration.mrePacks - Number(issueMreQty)),
      bottledWaterLiters: Math.max(0, ration.bottledWaterLiters - Number(issueWaterQty)),
    };
    onUpdateRation(updated);
    setShowIssueModal(false);
  };

  const handleResupplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: RationState = {
      ...ration,
      dryRationKg: ration.dryRationKg + Number(resupplyDryKg),
      mrePacks: ration.mrePacks + Number(resupplyMre),
      bottledWaterLiters: ration.bottledWaterLiters + Number(resupplyWater),
    };
    onUpdateRation(updated);
    setShowResupplyModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-lg">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                COMPANY RATION, MRE & WATER STATE
              </h2>
              <p className="text-xs text-slate-400">
                UN Peacekeeping Ration Scale: 125 Personnel Contingent Establishment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowIssueModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              <Package className="w-3.5 h-3.5 text-amber-400" />
              <span>Issue to Patrol</span>
            </button>

            <button
              onClick={() => setShowResupplyModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Receive UN Resupply</span>
            </button>
          </div>
        </div>

        {/* Days of Supply (DOS) Health Gauge */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-4 text-xs font-mono">
          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 text-center">
            <span className="text-slate-400 text-[10px] block">CRITICAL DOS RATING</span>
            <span
              className={`text-2xl font-black ${
                dos.alertLevel === 'Critical'
                  ? 'text-rose-400'
                  : dos.alertLevel === 'Warning'
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {dos.minDOS} DAYS
            </span>
            <span className="text-[10px] text-slate-400 block">Status: {dos.alertLevel}</span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 text-center">
            <span className="text-slate-400 text-[10px] block">DRY RATION DOS</span>
            <span className="text-2xl font-black text-sky-400">{dos.dryRationDOS} DAYS</span>
            <span className="text-[10px] text-slate-400 block">{ration.dryRationKg.toLocaleString()} KG</span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 text-center">
            <span className="text-slate-400 text-[10px] block">UN MRE 24H PACKS</span>
            <span className="text-2xl font-black text-amber-400">{dos.mreDOS} DAYS</span>
            <span className="text-[10px] text-slate-400 block">{ration.mrePacks.toLocaleString()} PACKS</span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 text-center">
            <span className="text-slate-400 text-[10px] block">DRINKING WATER DOS</span>
            <span className="text-2xl font-black text-cyan-400">{dos.waterDOS} DAYS</span>
            <span className="text-[10px] text-slate-400 block">{ration.bottledWaterLiters.toLocaleString()} LITERS</span>
          </div>
        </div>
      </div>

      {/* Rations Inventory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Dry Combat Reserves */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Package className="w-4 h-4 text-sky-400" />
              DRY RATION COMMODITIES
            </h3>
            <span className="text-xs font-mono text-emerald-400">{dos.dryRationDOS} DOS</span>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between p-2 rounded bg-slate-800/60">
              <span className="text-slate-400">Rice (Basmati/Long Grain):</span>
              <span className="font-bold text-white">1,800 KG</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-800/60">
              <span className="text-slate-400">Flour / Atta:</span>
              <span className="font-bold text-white">950 KG</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-800/60">
              <span className="text-slate-400">Cooking Oil (Vegetable):</span>
              <span className="font-bold text-white">620 LITERS</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-800/60">
              <span className="text-slate-400">Lentils / Dal (Assorted):</span>
              <span className="font-bold text-white">450 KG</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-800/60">
              <span className="text-slate-400">Sugar & Salt Reserves:</span>
              <span className="font-bold text-white">380 KG</span>
            </div>
          </div>
        </div>

        {/* Card 2: Emergency MRE & Operational Packs */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Utensils className="w-4 h-4 text-amber-400" />
              MRE (MEAL READY TO EAT)
            </h3>
            <span className="text-xs font-mono text-amber-400">{dos.mreDOS} DOS</span>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between p-2 rounded bg-slate-800/60">
              <span className="text-slate-400">UN Standard Halal Packs:</span>
              <span className="font-bold text-white">1,400 Packs</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-800/60">
              <span className="text-slate-400">Vegetarian Ration Packs:</span>
              <span className="font-bold text-white">450 Packs</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-800/60">
              <span className="text-slate-400">Self-Heating Flameless Kits:</span>
              <span className="font-bold text-emerald-400">1,850 Units</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-800/60">
              <span className="text-slate-400">Emergency High-Energy Biscuits:</span>
              <span className="font-bold text-white">60 Cartons</span>
            </div>
            <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
              Authorized for deep patrols along MSR2 & escort missions beyond Bambari COB.
            </div>
          </div>
        </div>

        {/* Card 3: Potable Water & Fresh Perishables */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Droplets className="w-4 h-4 text-cyan-400" />
              WATER & FRESH RATIONS
            </h3>
            <span className="text-xs font-mono text-cyan-400">{dos.waterDOS} DOS</span>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between p-2 rounded bg-slate-800/60">
              <span className="text-slate-400">Mineral Bottled Water (Sealed):</span>
              <span className="font-bold text-white">{ration.bottledWaterLiters.toLocaleString()} L</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-800/60">
              <span className="text-slate-400">RO Plant Bladder Tank:</span>
              <span className="font-bold text-emerald-400">10,000 L</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-800/60">
              <span className="text-slate-400">Fresh Vegetables (Contractor):</span>
              <span className="font-bold text-white">{ration.freshVegetablesKg} KG</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-800/60">
              <span className="text-slate-400">Frozen Meat (Cold Room):</span>
              <span className="font-bold text-white">{ration.meatFrozenKg} KG</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-800/60">
              <span className="text-slate-400">LPG Cooking Gas Cylinders:</span>
              <span className="font-bold text-white">{ration.cookingGasCylinders} Cylinders</span>
            </div>
          </div>
        </div>
      </div>

      {/* Issue Ration Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-amber-500/40 bg-slate-900 p-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                ISSUE MRE & WATER TO DEPLOYING PATROL
              </h3>
              <button onClick={() => setShowIssueModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleIssueSubmit} className="mt-3 space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Patrol Callsign / Reason *</label>
                <input
                  type="text"
                  value={issueReason}
                  onChange={(e) => setIssueReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">MRE Packs Issued *</label>
                  <input
                    type="number"
                    value={issueMreQty}
                    onChange={(e) => setIssueMreQty(Number(e.target.value))}
                    min={1}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-amber-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Bottled Water (Liters) *</label>
                  <input
                    type="number"
                    value={issueWaterQty}
                    onChange={(e) => setIssueWaterQty(Number(e.target.value))}
                    min={1}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-amber-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold"
                >
                  Deduct & Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receive UN Resupply Modal */}
      {showResupplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-sky-500/40 bg-slate-900 p-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                RECEIVE UN BATTALION QM RESUPPLY
              </h3>
              <button onClick={() => setShowResupplyModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleResupplySubmit} className="mt-3 space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Dry Rations Received (KG)</label>
                <input
                  type="number"
                  value={resupplyDryKg}
                  onChange={(e) => setResupplyDryKg(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">MRE Packs Received</label>
                <input
                  type="number"
                  value={resupplyMre}
                  onChange={(e) => setResupplyMre(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Bottled Water Received (Liters)</label>
                <input
                  type="number"
                  value={resupplyWater}
                  onChange={(e) => setResupplyWater(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowResupplyModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold"
                >
                  Credit to Company Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
