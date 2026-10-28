import React, { useState } from 'react';
import { DutyShift } from '../data/mockData';
import {
  ShieldAlert,
  Clock,
  UserCheck,
  ArrowLeftRight,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Sliders,
  RotateCcw,
} from 'lucide-react';

interface ShiftTimingTemplate {
  id: string;
  label: string;
  val: string;
  durationNote?: string;
}

const DEFAULT_SHIFT_TEMPLATES: ShiftTimingTemplate[] = [
  { id: 't-1', label: '0000 - 0600 (Night - 6h)', val: '0000 - 0600', durationNote: '6 Hours' },
  { id: 't-2', label: '0600 - 1200 (Morning - 6h)', val: '0600 - 1200', durationNote: '6 Hours' },
  { id: 't-3', label: '1200 - 1800 (Afternoon - 6h)', val: '1200 - 1800', durationNote: '6 Hours' },
  { id: 't-4', label: '1800 - 2400 (Vigil - 6h)', val: '1800 - 2400', durationNote: '6 Hours' },
];

const PRESET_SCHEMES = [
  {
    name: 'Standard 6-Hour Watches (4 Shifts / 24h)',
    shifts: [
      { id: 's-6-1', label: '0000 - 0600 (Night - 6h)', val: '0000 - 0600', durationNote: '6 Hours' },
      { id: 's-6-2', label: '0600 - 1200 (Morning - 6h)', val: '0600 - 1200', durationNote: '6 Hours' },
      { id: 's-6-3', label: '1200 - 1800 (Afternoon - 6h)', val: '1200 - 1800', durationNote: '6 Hours' },
      { id: 's-6-4', label: '1800 - 2400 (Vigil - 6h)', val: '1800 - 2400', durationNote: '6 Hours' },
    ],
  },
  {
    name: 'Tactical 4-Hour Shifts (6 Shifts / 24h)',
    shifts: [
      { id: 's-4-1', label: '0000 - 0400 (Night - 4h)', val: '0000 - 0400', durationNote: '4 Hours' },
      { id: 's-4-2', label: '0400 - 0800 (Dawn - 4h)', val: '0400 - 0800', durationNote: '4 Hours' },
      { id: 's-4-3', label: '0800 - 1200 (Morning - 4h)', val: '0800 - 1200', durationNote: '4 Hours' },
      { id: 's-4-4', label: '1200 - 1600 (Afternoon - 4h)', val: '1200 - 1600', durationNote: '4 Hours' },
      { id: 's-4-5', label: '1600 - 2000 (Dusk - 4h)', val: '1600 - 2000', durationNote: '4 Hours' },
      { id: 's-4-6', label: '2000 - 2400 (Vigil - 4h)', val: '2000 - 2400', durationNote: '4 Hours' },
    ],
  },
  {
    name: 'High-Alert 2-Hour Staggered Night Watches (2h Shifts)',
    shifts: [
      { id: 's-2-1', label: '0000 - 0200 (Staggered 1 - 2h)', val: '0000 - 0200', durationNote: '2 Hours' },
      { id: 's-2-2', label: '0200 - 0400 (Staggered 2 - 2h)', val: '0200 - 0400', durationNote: '2 Hours' },
      { id: 's-2-3', label: '0400 - 0600 (Dawn Stand-to - 2h)', val: '0400 - 0600', durationNote: '2 Hours' },
      { id: 's-2-4', label: '0600 - 1200 (Day Watch 1 - 6h)', val: '0600 - 1200', durationNote: '6 Hours' },
      { id: 's-2-5', label: '1200 - 1800 (Day Watch 2 - 6h)', val: '1200 - 1800', durationNote: '6 Hours' },
      { id: 's-2-6', label: '1800 - 2400 (Evening Vigil - 6h)', val: '1800 - 2400', durationNote: '6 Hours' },
    ],
  },
];

interface DutyRosterModuleProps {
  roster: DutyShift[];
  onUpdateShift: (updated: DutyShift) => void;
  onAddShift: (newShift: DutyShift) => void;
  onDeleteShift?: (id: string) => void;
  activeRole: string;
  canEdit?: boolean;
  isCommander?: boolean;
  isAuthorizedEditor?: boolean;
}

export const DutyRosterModule: React.FC<DutyRosterModuleProps> = ({
  roster,
  onUpdateShift,
  onAddShift,
  onDeleteShift,
  activeRole,
  canEdit = true,
  isCommander = false,
  isAuthorizedEditor = false,
}) => {
  const [selectedShiftFilter, setSelectedShiftFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [targetSwapShift, setTargetSwapShift] = useState<DutyShift | null>(null);
  const [replacementName, setReplacementName] = useState('');
  const [replacementArmyNo, setReplacementArmyNo] = useState('');

  // Edit Shift State
  const [editingShift, setEditingShift] = useState<DutyShift | null>(null);
  const [shiftToDelete, setShiftToDelete] = useState<DutyShift | null>(null);

  // Manage Shift Timing Templates Modal
  const [showTimingModal, setShowTimingModal] = useState(false);
  const [shiftTemplates, setShiftTemplates] = useState<ShiftTimingTemplate[]>(DEFAULT_SHIFT_TEMPLATES);
  const [newTimingLabel, setNewTimingLabel] = useState('');
  const [newTimingVal, setNewTimingVal] = useState('');
  const [newTimingDuration, setNewTimingDuration] = useState('4 Hours');

  // Add shift modal state
  const [newShiftName, setNewShiftName] = useState('1200 - 1800 hrs (Afternoon Watch)');
  const [customShiftTiming, setCustomShiftTiming] = useState('');
  const [isCustomShiftTiming, setIsCustomShiftTiming] = useState(false);
  const [newPostName, setNewPostName] = useState('Post Alpha: Main Camp Entrance (Morro Gate)');
  const [newPersonnelName, setNewPersonnelName] = useState('');
  const [newArmyNo, setNewArmyNo] = useState('');
  const [newRank, setNewRank] = useState('Private');
  const [newWeapon, setNewWeapon] = useState('BD-08 Rifle + NVD PVS-14');
  const [newSupervisor, setNewSupervisor] = useState('SWO Matiur');

  // Extract dynamic filters from both shiftTemplates and current active roster entries
  const rosterShiftValues = Array.from(new Set(roster.map((r) => r.shiftName)));
  const dynamicFilterTabs: { label: string; val: string }[] = [
    { label: 'All Shifts (24 Hrs)', val: 'ALL' },
    ...shiftTemplates.map((t) => ({ label: t.label, val: t.val })),
  ];

  // Add any roster shifts not already covered by templates
  rosterShiftValues.forEach((sn) => {
    const isCovered = dynamicFilterTabs.some(
      (tab) => tab.val !== 'ALL' && sn.toLowerCase().includes(tab.val.toLowerCase())
    );
    if (!isCovered) {
      dynamicFilterTabs.push({ label: sn, val: sn });
    }
  });

  const filteredRoster = roster.filter((r) => {
    if (selectedShiftFilter === 'ALL') return true;
    return r.shiftName.toLowerCase().includes(selectedShiftFilter.toLowerCase());
  });

  const handleStatusToggle = (shift: DutyShift) => {
    const nextStatus: DutyShift['status'] =
      shift.status === 'On Duty'
        ? 'Relieved'
        : shift.status === 'Relieved'
        ? 'Upcoming'
        : 'On Duty';

    onUpdateShift({
      ...shift,
      status: nextStatus,
    });
  };

  const handleSwapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSwapShift || !replacementName.trim()) return;

    onUpdateShift({
      ...targetSwapShift,
      personnelName: `${replacementName.trim()} (Swapped)`,
      armyNo: replacementArmyNo.trim() || targetSwapShift.armyNo,
    });

    setShowSwapModal(false);
    setTargetSwapShift(null);
    setReplacementName('');
    setReplacementArmyNo('');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShift) return;

    onUpdateShift(editingShift);
    setEditingShift(null);
  };

  const handleConfirmDelete = () => {
    if (shiftToDelete && onDeleteShift) {
      onDeleteShift(shiftToDelete.id);
      setShiftToDelete(null);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonnelName.trim() || !newArmyNo.trim()) return;

    const assignedTiming = isCustomShiftTiming && customShiftTiming.trim()
      ? customShiftTiming.trim()
      : newShiftName;

    const newShift: DutyShift = {
      id: `d-${Date.now()}`,
      shiftName: assignedTiming,
      postName: newPostName,
      personnelName: newPersonnelName.trim(),
      armyNo: newArmyNo.trim().toUpperCase(),
      rank: newRank,
      weapon: newWeapon,
      status: 'On Duty',
      supervisor: newSupervisor,
    };

    onAddShift(newShift);
    setShowAddModal(false);
    setNewPersonnelName('');
    setNewArmyNo('');
    setCustomShiftTiming('');
    setIsCustomShiftTiming(false);
  };

  const handleAddCustomTiming = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTimingLabel.trim()) return;

    const val = newTimingVal.trim() || newTimingLabel.trim().split(' ')[0] || newTimingLabel.trim();
    const newTemplate: ShiftTimingTemplate = {
      id: `timing-${Date.now()}`,
      label: newTimingLabel.trim(),
      val,
      durationNote: newTimingDuration.trim() || 'Custom',
    };

    setShiftTemplates([...shiftTemplates, newTemplate]);
    setNewTimingLabel('');
    setNewTimingVal('');
  };

  const handleApplyPresetScheme = (schemeIndex: number) => {
    setShiftTemplates(PRESET_SCHEMES[schemeIndex].shifts);
  };

  const handleDeleteTiming = (id: string) => {
    setShiftTemplates(shiftTemplates.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                CAMP DEFENSE & SECURITY DUTY ROSTER
              </h2>
              <p className="text-xs text-slate-400">
                24-Hour Watch Bill, Sentry Posts, TOC Operations & Quick Reaction Team (QRT)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Assign Sentry</span>
            </button>
          </div>
        </div>

        {/* Editable Shift Filter & Duty Timing Assignment Bar */}
        <div className="flex items-center justify-between gap-2 pt-4 text-xs font-mono overflow-x-auto scrollbar-thin">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-slate-400 text-[11px] shrink-0 font-bold">DUTY SHIFTS:</span>
            {dynamicFilterTabs.map((tab) => (
              <button
                key={tab.val}
                onClick={() => setSelectedShiftFilter(tab.val)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                  selectedShiftFilter === tab.val
                    ? 'bg-sky-600 text-white font-bold shadow'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Edit / Assign Duty Time Durations Button */}
          <button
            onClick={() => setShowTimingModal(true)}
            title="Configure shift durations (e.g. 2h, 4h, 6h, 8h, or custom timing)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 border border-slate-700/80 text-[11px] font-bold whitespace-nowrap transition ml-auto"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Edit Duty Timings</span>
          </button>
        </div>
      </div>

      {/* Roster Cards / Table Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRoster.map((shift) => {
          const isOnDuty = shift.status === 'On Duty';
          const isRelieved = shift.status === 'Relieved';

          return (
            <div
              key={shift.id}
              className={`bg-slate-900 border rounded-xl p-4 shadow-lg flex flex-col justify-between space-y-3 transition ${
                isOnDuty
                  ? 'border-emerald-500/50 shadow-emerald-950/20'
                  : isRelieved
                  ? 'border-slate-800 opacity-80'
                  : 'border-amber-500/40'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-400 shrink-0" />
                    <span className="text-xs font-mono font-bold text-white truncate max-w-[180px]">
                      {shift.shiftName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                        isOnDuty
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : isRelieved
                          ? 'bg-slate-800 text-slate-400 border border-slate-700'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      {shift.status}
                    </span>
                  </div>
                </div>

                <div className="mt-2.5">
                  <h4 className="text-sm font-bold text-sky-300">{shift.postName}</h4>
                </div>

                {/* Sentry Duty Details Container */}
                <div className="mt-2 bg-slate-800/70 p-2.5 rounded-lg border border-slate-700/60 text-xs font-mono space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sentry on Duty:</span>
                    <span className="font-bold text-white">
                      {shift.rank} {shift.personnelName}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Army No:</span>
                    <span className="text-sky-300">{shift.armyNo}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Weapon / Kit:</span>
                    <span className="text-slate-300 truncate max-w-[150px]">{shift.weapon}</span>
                  </div>
                  <div className="flex justify-between text-[11px] pt-1 border-t border-slate-700/50">
                    <span className="text-slate-400">Shift Timing:</span>
                    <span className="text-amber-300 font-semibold">{shift.shiftName}</span>
                  </div>
                </div>

                <div className="mt-2 text-[10px] font-mono text-slate-400">
                  Duty JCO / Supervisor: <strong className="text-slate-200">{shift.supervisor}</strong>
                </div>
              </div>

              {/* Action Buttons with Edit Duty Details Option */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-mono gap-1.5 flex-wrap">
                <button
                  onClick={() => handleStatusToggle(shift)}
                  className={`px-2.5 py-1 rounded border flex items-center gap-1.5 transition ${
                    isOnDuty
                      ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white font-bold'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{isOnDuty ? 'Relieved' : 'Post'}</span>
                </button>

                <div className="flex items-center gap-1 ml-auto">
                  {/* Edit Option for Duty Details */}
                  <button
                    onClick={() => setEditingShift(shift)}
                    title="Edit Duty Shift Details"
                    className="px-2 py-1 rounded bg-sky-600/20 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-500/30 flex items-center gap-1 transition"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => {
                      setTargetSwapShift(shift);
                      setShowSwapModal(true);
                    }}
                    title="Swap Sentry"
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 flex items-center gap-1 transition"
                  >
                    <ArrowLeftRight className="w-3 h-3 text-sky-400" />
                    <span>Swap</span>
                  </button>

                  {onDeleteShift && (
                    <button
                      onClick={() => setShiftToDelete(shift)}
                      title="Delete Shift Assignment"
                      className="p-1 rounded bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Duty Shift Details Modal */}
      {editingShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-sky-500/40 bg-slate-900 p-5 shadow-2xl text-slate-100 font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  EDIT SENTRY DUTY DETAILS
                </h3>
              </div>
              <button
                onClick={() => setEditingShift(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">
                  Duty Time / Shift Duration *
                </label>
                <div className="space-y-1.5">
                  <select
                    value={
                      shiftTemplates.some((t) => t.val === editingShift.shiftName)
                        ? editingShift.shiftName
                        : 'CUSTOM'
                    }
                    onChange={(e) => {
                      if (e.target.value !== 'CUSTOM') {
                        setEditingShift({ ...editingShift, shiftName: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                  >
                    {shiftTemplates.map((t) => (
                      <option key={t.id} value={t.val}>
                        {t.label}
                      </option>
                    ))}
                    <option value="CUSTOM">Custom Shift Duration / Time...</option>
                  </select>

                  <input
                    type="text"
                    value={editingShift.shiftName}
                    onChange={(e) =>
                      setEditingShift({ ...editingShift, shiftName: e.target.value })
                    }
                    placeholder="e.g. 0200 - 0400 hrs (Night Staggered Stand-to)"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                    required
                  />
                  <span className="text-[10px] text-slate-400 block font-mono">
                    You can enter any shift duration (e.g. 2 hours, 4 hours, 8 hours, 12 hours) or custom hours.
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Security Post Location *</label>
                <input
                  type="text"
                  value={editingShift.postName}
                  onChange={(e) =>
                    setEditingShift({ ...editingShift, postName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Sentry Name *</label>
                  <input
                    type="text"
                    value={editingShift.personnelName}
                    onChange={(e) =>
                      setEditingShift({ ...editingShift, personnelName: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Army Number *</label>
                  <input
                    type="text"
                    value={editingShift.armyNo}
                    onChange={(e) =>
                      setEditingShift({
                        ...editingShift,
                        armyNo: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Rank</label>
                  <select
                    value={editingShift.rank}
                    onChange={(e) =>
                      setEditingShift({ ...editingShift, rank: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                  >
                    {[
                      { full: 'Major', abbr: 'Maj' },
                      { full: 'Captain', abbr: 'Capt' },
                      { full: 'Lieutenant', abbr: 'Lt' },
                      { full: 'Senior Warrant Officer', abbr: 'SWO' },
                      { full: 'Warrant Officer', abbr: 'WO' },
                      { full: 'Sergeant', abbr: 'Sgt' },
                      { full: 'Corporal', abbr: 'Cpl' },
                      { full: 'Lance Corporal', abbr: 'L Cpl' },
                      { full: 'Private', abbr: 'Pvt' },
                    ].map((r) => (
                      <option key={r.full} value={r.full}>
                        {r.full} ({r.abbr})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Duty Status</label>
                  <select
                    value={editingShift.status}
                    onChange={(e) =>
                      setEditingShift({
                        ...editingShift,
                        status: e.target.value as DutyShift['status'],
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                  >
                    <option value="On Duty">On Duty</option>
                    <option value="Relieved">Relieved</option>
                    <option value="Upcoming">Upcoming</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Weapon & Kit Assigned</label>
                <input
                  type="text"
                  value={editingShift.weapon}
                  onChange={(e) =>
                    setEditingShift({ ...editingShift, weapon: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Duty JCO / Supervisor</label>
                <input
                  type="text"
                  value={editingShift.supervisor}
                  onChange={(e) =>
                    setEditingShift({ ...editingShift, supervisor: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingShift(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold font-mono transition"
                >
                  <Check className="w-4 h-4" />
                  <span>Update Duty Assignment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Duty Shift Timings & Durations Modal */}
      {showTimingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-sky-500/40 bg-slate-900 p-5 shadow-2xl text-slate-100 font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  MANAGE DUTY SHIFT TIMINGS & DURATIONS
                </h3>
              </div>
              <button
                onClick={() => setShowTimingModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Quick Preset Schemes */}
              <div>
                <label className="block text-slate-400 mb-1.5 font-mono">
                  Quick Shift Schemes:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {PRESET_SCHEMES.map((scheme, idx) => (
                    <button
                      key={scheme.name}
                      type="button"
                      onClick={() => handleApplyPresetScheme(idx)}
                      className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition text-slate-300 hover:text-white text-[11px] font-mono"
                    >
                      <div className="font-bold text-sky-300">{scheme.name.split(' (')[0]}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {scheme.shifts.length} Watches
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Configured Shift Durations List */}
              <div>
                <label className="block text-slate-400 mb-1.5 font-mono">
                  Active Configured Shift Slots:
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {shiftTemplates.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/70 font-mono text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-sky-400" />
                        <span className="text-white font-medium">{t.label}</span>
                        {t.durationNote && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-700 text-sky-300">
                            {t.durationNote}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteTiming(t.id)}
                        className="text-slate-400 hover:text-rose-400 p-1"
                        title="Remove Shift Timing"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Custom Duration / Shift Timing */}
              <form
                onSubmit={handleAddCustomTiming}
                className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2.5"
              >
                <span className="font-bold text-white font-mono text-xs block">
                  Add Custom Duty Shift Timing:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1 font-mono">
                      Shift Name & Hours *
                    </label>
                    <input
                      type="text"
                      value={newTimingLabel}
                      onChange={(e) => setNewTimingLabel(e.target.value)}
                      placeholder="e.g. 0200 - 0400 (Night Stand-to)"
                      className="w-full px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 text-white font-mono text-xs focus:border-sky-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1 font-mono">
                      Shift Duration Note
                    </label>
                    <input
                      type="text"
                      value={newTimingDuration}
                      onChange={(e) => setNewTimingDuration(e.target.value)}
                      placeholder="e.g. 2 Hours / 4 Hours"
                      className="w-full px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 text-white font-mono text-xs focus:border-sky-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="flex items-center gap-1 px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold font-mono text-xs transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Shift Timing</span>
                  </button>
                </div>
              </form>

              <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShiftTemplates(DEFAULT_SHIFT_TEMPLATES)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:text-white text-xs font-mono"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset to 6-Hour Defaults</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowTimingModal(false)}
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold font-mono text-xs"
                >
                  Apply & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {shiftToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-rose-500/50 bg-slate-900 p-5 shadow-2xl text-slate-100 font-sans">
            <div className="flex items-center gap-2.5 text-rose-400 pb-3 border-b border-slate-800">
              <Trash2 className="w-5 h-5 text-rose-500" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                CONFIRM DELETION
              </h3>
            </div>

            <div className="py-4 text-xs text-slate-300 space-y-2">
              <p>Are you sure you want to remove this sentry duty assignment?</p>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono">
                <div className="font-bold text-white">
                  {shiftToDelete.rank} {shiftToDelete.personnelName}
                </div>
                <div className="text-[11px] text-sky-400">{shiftToDelete.postName}</div>
                <div className="text-[10px] text-slate-400 mt-1">{shiftToDelete.shiftName}</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShiftToDelete(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold font-mono text-xs transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Assignment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Swap Duty Modal */}
      {showSwapModal && targetSwapShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-sky-500/40 bg-slate-900 p-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                SWAP SENTRY DUTY ASSIGNMENT
              </h3>
              <button onClick={() => setShowSwapModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSwapSubmit} className="mt-3 space-y-3 text-xs">
              <p className="text-slate-400">
                Replace <strong>{targetSwapShift.personnelName}</strong> on {targetSwapShift.postName} ({targetSwapShift.shiftName}):
              </p>

              <div>
                <label className="block text-slate-400 mb-1">Relief Soldier Name *</label>
                <input
                  type="text"
                  value={replacementName}
                  onChange={(e) => setReplacementName(e.target.value)}
                  placeholder="e.g. Soldier Mizanur Rahman"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Army Number</label>
                <input
                  type="text"
                  value={replacementArmyNo}
                  onChange={(e) => setReplacementArmyNo(e.target.value)}
                  placeholder="e.g. OR-9140"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSwapModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold"
                >
                  Confirm Swap
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Sentry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-sky-500/40 bg-slate-900 p-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                ASSIGN NEW SENTRY / POST
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-3 space-y-3 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-400 font-mono">Watch Shift / Duration</label>
                  <button
                    type="button"
                    onClick={() => setIsCustomShiftTiming(!isCustomShiftTiming)}
                    className="text-[10px] text-sky-400 hover:underline font-mono"
                  >
                    {isCustomShiftTiming ? 'Use Shift Template' : 'Type Custom Duration'}
                  </button>
                </div>

                {!isCustomShiftTiming ? (
                  <select
                    value={newShiftName}
                    onChange={(e) => setNewShiftName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                  >
                    {shiftTemplates.map((t) => (
                      <option key={t.id} value={t.label}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={customShiftTiming}
                    onChange={(e) => setCustomShiftTiming(e.target.value)}
                    placeholder="e.g. 0200 - 0400 hrs (Staggered Watch - 2h)"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                    required
                  />
                )}
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Security Post Name</label>
                <input
                  type="text"
                  value={newPostName}
                  onChange={(e) => setNewPostName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Soldier Name *</label>
                  <input
                    type="text"
                    value={newPersonnelName}
                    onChange={(e) => setNewPersonnelName(e.target.value)}
                    placeholder="e.g. Soldier Nazmul"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Army Number *</label>
                  <input
                    type="text"
                    value={newArmyNo}
                    onChange={(e) => setNewArmyNo(e.target.value)}
                    placeholder="e.g. OR-9320"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Weapon & Special Kit</label>
                <input
                  type="text"
                  value={newWeapon}
                  onChange={(e) => setNewWeapon(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Duty JCO / Supervisor</label>
                <input
                  type="text"
                  value={newSupervisor}
                  onChange={(e) => setNewSupervisor(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                />
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
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold font-mono"
                >
                  Save Duty Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
