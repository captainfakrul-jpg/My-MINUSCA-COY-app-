import React, { useState } from 'react';
import { InventoryAsset } from '../data/mockData';
import { Boxes, ShieldCheck, CheckCircle2, AlertTriangle, Plus, Search, Tag, Eye } from 'lucide-react';

interface InventoryModuleProps {
  assets: InventoryAsset[];
  onUpdateAsset: (updated: InventoryAsset) => void;
  onAddAsset: (newAsset: InventoryAsset) => void;
  activeRole: string;
}

export const InventoryModule: React.FC<InventoryModuleProps> = ({
  assets,
  onUpdateAsset,
  onAddAsset,
  activeRole,
}) => {
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<InventoryAsset | null>(null);

  // Add Asset form
  const [newItemCode, setNewItemCode] = useState(`COE-EQ-0${assets.length + 1}`);
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState<InventoryAsset['category']>('Power & Generators');
  const [newQty, setNewQty] = useState(1);
  const [newLoc, setNewLoc] = useState('Bambari Base Main Store');
  const [newSerial, setNewSerial] = useState('');

  const coeCompliantCount = assets.filter((a) => a.coeInspected).length;
  const coeReadinessRate = Math.round((coeCompliantCount / Math.max(1, assets.length)) * 100);

  const filteredAssets = assets.filter((a) => {
    const matchesCat = selectedCat === 'ALL' || a.category === selectedCat;
    const matchesQuery =
      !searchQuery ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.serialOrChassisNo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleToggleCoe = (asset: InventoryAsset) => {
    onUpdateAsset({
      ...asset,
      coeInspected: !asset.coeInspected,
    });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newAst: InventoryAsset = {
      id: `inv-${Date.now()}`,
      itemCode: newItemCode.trim().toUpperCase(),
      name: newName.trim(),
      category: newCat,
      quantity: Number(newQty),
      condition: 'Serviceable (UN COE Ready)',
      location: newLoc.trim(),
      serialOrChassisNo: newSerial.trim() || 'SN-VERIFIED',
      coeInspected: true,
      remarks: `Registered by ${activeRole}`,
    };

    onAddAsset(newAst);
    setShowAddModal(false);
    setNewName('');
    setNewSerial('');
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-lg">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  COMPANY ASSETS & UN COE INVENTORY
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  UN REIMBURSEMENT RATE: {coeReadinessRate}%
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Contingent Owned Equipment (COE) Inspection Ready • Generators, RO Plant, Tents & Defense Barriers
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Asset Item</span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 text-xs font-mono">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search COE code, equipment name, serial..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin">
            {[
              'ALL',
              'Power & Generators',
              'Water Purification & RO',
              'Tents & Camp Accommodation',
              'Camp Fortification & Defense',
              'Catering & Field Kitchen',
              'Communications & IT',
            ].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-2.5 py-1 rounded text-[11px] whitespace-nowrap transition ${
                  selectedCat === cat
                    ? 'bg-sky-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'ALL' ? 'All Assets' : cat.split(' & ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssets.map((asset) => {
          const isInspected = asset.coeInspected;
          const isSelected = selectedAsset?.id === asset.id;

          return (
            <div
              key={asset.id}
              onClick={() => setSelectedAsset(asset)}
              className={`bg-slate-900 border rounded-xl p-4 shadow-lg flex flex-col justify-between space-y-3 cursor-pointer transition ${
                isSelected
                  ? 'border-sky-500 ring-1 ring-sky-500'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-xs font-mono font-bold text-sky-400">{asset.itemCode}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      isInspected
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {isInspected ? 'UN COE PASS' : 'AUDIT PENDING'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mt-1 leading-snug">{asset.name}</h3>
                <span className="text-[11px] font-mono text-purple-400 block mt-0.5">
                  {asset.category}
                </span>

                <div className="mt-3 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-xs font-mono space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Quantity:</span>
                    <span className="font-bold text-white">{asset.quantity} Units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Condition:</span>
                    <span className="text-emerald-400">{asset.condition.split(' ')[0]}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Serial/Chassis:</span>
                    <span className="text-slate-300 truncate max-w-[150px]">{asset.serialOrChassisNo}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Location:</span>
                    <span className="text-sky-300 truncate max-w-[150px]">{asset.location}</span>
                  </div>
                </div>

                {asset.remarks && (
                  <p className="mt-2 text-[11px] text-slate-400 leading-relaxed font-sans">
                    {asset.remarks}
                  </p>
                )}
              </div>

              {/* Action */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-mono">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleCoe(asset);
                  }}
                  className={`px-2.5 py-1 rounded border flex items-center gap-1.5 transition ${
                    isInspected
                      ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white font-bold'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isInspected ? 'Revoke Audit' : 'Pass COE Inspection'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-sky-500/40 bg-slate-900 p-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                REGISTER UN COE ASSET ITEM
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-3 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Item / COE Code</label>
                  <input
                    type="text"
                    value={newItemCode}
                    onChange={(e) => setNewItemCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={newQty}
                    onChange={(e) => setNewQty(Number(e.target.value))}
                    min={1}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Asset Description / Equipment Name *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Caterpillar 150 kVA Generator"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Category</label>
                <select
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                >
                  <option value="Power & Generators">Power & Generators</option>
                  <option value="Water Purification & RO">Water Purification & RO</option>
                  <option value="Tents & Camp Accommodation">Tents & Camp Accommodation</option>
                  <option value="Camp Fortification & Defense">Camp Fortification & Defense</option>
                  <option value="Catering & Field Kitchen">Catering & Field Kitchen</option>
                  <option value="Communications & IT">Communications & IT</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Serial / Chassis Number</label>
                  <input
                    type="text"
                    value={newSerial}
                    onChange={(e) => setNewSerial(e.target.value)}
                    placeholder="e.g. CAT-99201"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Camp Location</label>
                  <input
                    type="text"
                    value={newLoc}
                    onChange={(e) => setNewLoc(e.target.value)}
                    placeholder="e.g. Living Area Bunker"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
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
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
