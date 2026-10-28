import React, { useState } from 'react';
import { MedicalRecord } from '../data/mockData';
import {
  HeartPulse,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  RotateCcw,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { getDeviceLocalDateTime } from '../utils/localDateTime';
import { MedicalStatsOverride } from '../firebase/tacticalSync';

interface MedicalModuleProps {
  records: MedicalRecord[];
  onUpdateRecord: (updated: MedicalRecord) => void;
  onAddRecord: (newRecord: MedicalRecord) => void;
  onDeleteRecord?: (id: string) => void;
  activeRole: string;
  canEdit?: boolean;
  isCommander?: boolean;
  isAuthorizedEditor?: boolean;
  medicalStatsOverride?: MedicalStatsOverride;
  onUpdateMedicalStats?: (override: MedicalStatsOverride) => void;
}

export const MedicalModule: React.FC<MedicalModuleProps> = ({
  records,
  onUpdateRecord,
  onAddRecord,
  onDeleteRecord,
  activeRole,
  canEdit = true,
  isCommander = false,
  isAuthorizedEditor = false,
  medicalStatsOverride,
  onUpdateMedicalStats,
}) => {
  const [bloodFilter, setBloodFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<MedicalRecord | null>(null);

  // Editable Stat Cards Modal State
  const [editingStatType, setEditingStatType] = useState<'malaria' | 'sickState' | 'oNegative' | null>(null);
  const [statValueInput, setStatValueInput] = useState('');
  const [statNoteInput, setStatNoteInput] = useState('');

  // New Medical Record form states
  const [newArmyNo, setNewArmyNo] = useState('');
  const [newName, setNewName] = useState('');
  const [newRank, setNewRank] = useState('Private');
  const [newBloodGroup, setNewBloodGroup] = useState('O+');
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [newAllergies, setNewAllergies] = useState('None');
  const [newMedCat, setNewMedCat] = useState<MedicalRecord['medicalCategory']>('FE (Fit Forward)');

  // Auto-calculated defaults
  const compliantCount = records.filter((r) => r.doxycyclineTakenToday).length;
  const complianceRate = Math.round((compliantCount / Math.max(1, records.length)) * 100);
  const inHospitalCount = records.filter((r) => r.medicalCategory !== 'FE (Fit Forward)').length;
  const oNegativeDonors = records.filter((r) => r.bloodGroup === 'O-');

  // Display values with override priority
  const displayMalariaRate = medicalStatsOverride?.malariaCompliance ?? `${complianceRate}%`;
  const displayMalariaNote =
    medicalStatsOverride?.malariaNote ?? `${compliantCount}/${records.length} Doses Taken`;

  const displaySickCount = medicalStatsOverride?.sickStateCount ?? String(inHospitalCount);
  const displaySickNote = medicalStatsOverride?.sickStateNote ?? 'Under Medical Care';

  const displayONegativeCount =
    medicalStatsOverride?.oNegativeDonorsCount ?? String(oNegativeDonors.length);
  const displayONegativeNote =
    medicalStatsOverride?.oNegativeNote ?? 'Emergency Transfusion';

  const filteredRecords = records.filter((r) => {
    if (bloodFilter === 'ALL') return true;
    return r.bloodGroup === bloodFilter;
  });

  const handleToggleMalaria = (record: MedicalRecord) => {
    onUpdateRecord({
      ...record,
      doxycyclineTakenToday: !record.doxycyclineTakenToday,
    });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArmyNo.trim() || !newName.trim()) return;

    const newRec: MedicalRecord = {
      id: `med-${Date.now()}`,
      armyNo: newArmyNo.trim().toUpperCase(),
      name: newName.trim(),
      rank: newRank,
      bloodGroup: newBloodGroup,
      medicalCategory: newMedCat,
      doxycyclineTakenToday: true,
      yellowFeverValid: true,
      choleraValid: true,
      recentDiagnosis: newDiagnosis.trim() || 'Routine Field Physical (Fit)',
      allergies: newAllergies.trim() || 'None',
      medevacCategory: 'None',
      lastVitalsCheck: getDeviceLocalDateTime().date,
    };

    onAddRecord(newRec);
    setNewArmyNo('');
    setNewName('');
    setNewDiagnosis('');
    setNewAllergies('None');
    setShowAddModal(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    onUpdateRecord(editingRecord);
    setEditingRecord(null);
  };

  const handleConfirmDelete = () => {
    if (recordToDelete && onDeleteRecord) {
      onDeleteRecord(recordToDelete.id);
      setRecordToDelete(null);
    }
  };

  const handleOpenStatEdit = (type: 'malaria' | 'sickState' | 'oNegative') => {
    setEditingStatType(type);
    if (type === 'malaria') {
      setStatValueInput(displayMalariaRate);
      setStatNoteInput(displayMalariaNote);
    } else if (type === 'sickState') {
      setStatValueInput(displaySickCount);
      setStatNoteInput(displaySickNote);
    } else if (type === 'oNegative') {
      setStatValueInput(displayONegativeCount);
      setStatNoteInput(displayONegativeNote);
    }
  };

  const handleSaveStatEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStatType || !onUpdateMedicalStats) return;

    const nextOverride: MedicalStatsOverride = {
      ...(medicalStatsOverride || {}),
    };

    if (editingStatType === 'malaria') {
      nextOverride.malariaCompliance = statValueInput.trim();
      nextOverride.malariaNote = statNoteInput.trim();
    } else if (editingStatType === 'sickState') {
      nextOverride.sickStateCount = statValueInput.trim();
      nextOverride.sickStateNote = statNoteInput.trim();
    } else if (editingStatType === 'oNegative') {
      nextOverride.oNegativeDonorsCount = statValueInput.trim();
      nextOverride.oNegativeNote = statNoteInput.trim();
    }

    onUpdateMedicalStats(nextOverride);
    setEditingStatType(null);
  };

  const handleResetStatOverride = () => {
    if (!editingStatType || !onUpdateMedicalStats) return;

    const nextOverride: MedicalStatsOverride = {
      ...(medicalStatsOverride || {}),
    };

    if (editingStatType === 'malaria') {
      delete nextOverride.malariaCompliance;
      delete nextOverride.malariaNote;
    } else if (editingStatType === 'sickState') {
      delete nextOverride.sickStateCount;
      delete nextOverride.sickStateNote;
    } else if (editingStatType === 'oNegative') {
      delete nextOverride.oNegativeDonorsCount;
      delete nextOverride.oNegativeNote;
    }

    onUpdateMedicalStats(nextOverride);
    setEditingStatType(null);
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                PERSONNEL MEDICAL RECORDS & HEALTH TRACKING
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Medical Entry</span>
            </button>
          </div>
        </div>

        {/* Health KPI Grid - Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs font-mono">
          {/* Card 1: MALARIA PROPHYLAXIS TODAY (Editable for Comd / Authorized) */}
          <div className="relative group bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 text-center hover:border-sky-500/50 transition">
            {canEdit && (
              <button
                onClick={() => handleOpenStatEdit('malaria')}
                title="Edit Malaria Prophylaxis State (Comd / Authorized)"
                className="absolute top-2 right-2 p-1 rounded bg-slate-700/80 hover:bg-sky-600 text-slate-300 hover:text-white transition shadow"
              >
                <Pencil className="w-3 h-3" />
              </button>
            )}
            <span className="text-slate-400 text-[10px] block">MALARIA PROPHYLAXIS TODAY</span>
            <span className="text-2xl font-black text-emerald-400">{displayMalariaRate}</span>
            <span className="text-[10px] text-slate-400 block">{displayMalariaNote}</span>
          </div>

          {/* Card 2: TOTAL SICK STATE (Named as requested, Editable for Comd / Authorized) */}
          <div className="relative group bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 text-center hover:border-rose-500/50 transition">
            {canEdit && (
              <button
                onClick={() => handleOpenStatEdit('sickState')}
                title="Edit Total Sick State (Comd / Authorized)"
                className="absolute top-2 right-2 p-1 rounded bg-slate-700/80 hover:bg-rose-600 text-slate-300 hover:text-white transition shadow"
              >
                <Pencil className="w-3 h-3" />
              </button>
            )}
            <span className="text-slate-400 text-[10px] block font-semibold text-rose-300">
              TOTAL SICK STATE
            </span>
            <span className="text-2xl font-black text-rose-400">{displaySickCount}</span>
            <span className="text-[10px] text-slate-400 block">{displaySickNote}</span>
          </div>

          {/* Card 3: UNIVERSAL O- DONORS (Editable for Comd / Authorized) */}
          <div className="relative group bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 text-center hover:border-sky-500/50 transition">
            {canEdit && (
              <button
                onClick={() => handleOpenStatEdit('oNegative')}
                title="Edit Universal O- Donors (Comd / Authorized)"
                className="absolute top-2 right-2 p-1 rounded bg-slate-700/80 hover:bg-sky-600 text-slate-300 hover:text-white transition shadow"
              >
                <Pencil className="w-3 h-3" />
              </button>
            )}
            <span className="text-slate-400 text-[10px] block">UNIVERSAL O- DONORS</span>
            <span className="text-2xl font-black text-sky-400">{displayONegativeCount}</span>
            <span className="text-[10px] text-sky-400/80 block">{displayONegativeNote}</span>
          </div>

          {/* Card 4: YELLOW FEVER / CHOLERA */}
          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 text-center">
            <span className="text-slate-400 text-[10px] block">YELLOW FEVER / CHOLERA</span>
            <span className="text-2xl font-black text-emerald-400">100%</span>
            <span className="text-[10px] text-emerald-400/80 block">WHO / UN Certified</span>
          </div>
        </div>
      </div>

      {/* Blood Group Filter Bar */}
      <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs font-mono overflow-x-auto scrollbar-thin">
        <span className="text-slate-400 text-[11px] px-2">BLOOD GROUP:</span>
        {['ALL', 'O-', 'O+', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
          <button
            key={bg}
            onClick={() => setBloodFilter(bg)}
            className={`px-2.5 py-1 rounded-lg transition ${
              bloodFilter === bg
                ? 'bg-rose-600 text-white font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {bg === 'ALL' ? 'All Groups' : bg}
          </button>
        ))}
      </div>

      {/* Medical Records Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-3 py-3">Soldier / Army No</th>
                <th className="px-3 py-3">Blood Group</th>
                <th className="px-3 py-3">Medical Fitness Cat</th>
                <th className="px-3 py-3">Malaria Doxy Dosing</th>
                <th className="px-3 py-3">Recent Diagnosis / Treatment</th>
                <th className="px-3 py-3">Allergies</th>
                <th className="px-3 py-3">Doxycycline Action</th>
                <th className="px-3 py-3 text-right">Actions (Comd / Auth)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-sans">
              {filteredRecords.map((m) => {
                const isFit = m.medicalCategory.includes('FE');

                return (
                  <tr key={m.id} className="hover:bg-slate-800/50 transition">
                    <td className="px-3 py-3 font-mono">
                      <div className="font-bold text-white flex items-center gap-1">
                        <span>{m.rank}</span>
                        <span>{m.name}</span>
                      </div>
                      <div className="text-[10px] text-sky-400">{m.armyNo}</div>
                    </td>

                    <td className="px-3 py-3 font-mono">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          m.bloodGroup === 'O-'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 ring-1 ring-rose-500/50'
                            : 'bg-slate-800 text-slate-200'
                        }`}
                      >
                        {m.bloodGroup}
                      </span>
                    </td>

                    <td className="px-3 py-3 font-mono">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isFit
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {m.medicalCategory}
                      </span>
                    </td>

                    <td className="px-3 py-3 font-mono">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.doxycyclineTakenToday
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {m.doxycyclineTakenToday ? 'Taken Today' : 'MISSED DOSE'}
                      </span>
                    </td>

                    <td className="px-3 py-3 text-slate-200">{m.recentDiagnosis}</td>

                    <td className="px-3 py-3 text-slate-400 font-mono text-[11px]">
                      {m.allergies}
                    </td>

                    <td className="px-3 py-3">
                      <button
                        onClick={() => handleToggleMalaria(m)}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold font-mono transition ${
                          m.doxycyclineTakenToday
                            ? 'bg-slate-800 text-slate-400 hover:text-white'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        {m.doxycyclineTakenToday ? 'Undo' : 'Mark Taken'}
                      </button>
                    </td>

                    {/* Actions column: Editable and Deletable ONLY for Commander and Authorized Account */}
                    <td className="px-3 py-3 text-right">
                      {canEdit ? (
                        <div className="flex items-center justify-end gap-1.5 font-mono">
                          <button
                            onClick={() => setEditingRecord(m)}
                            title="Edit Medical Record (Comd / Auth)"
                            className="flex items-center gap-1 px-2.5 py-1 rounded bg-sky-600/20 hover:bg-sky-600 text-sky-300 hover:text-white text-xs font-semibold transition"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => setRecordToDelete(m)}
                            title="Delete Medical Record (Comd / Auth)"
                            className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-semibold transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-500 text-[10px] font-mono">
                          <Lock className="w-3 h-3" />
                          <span>Protected</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Stat Card Modal (For Malaria Prophylaxis, Total Sick State, Universal O- Donors) */}
      {editingStatType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-sky-500/40 bg-slate-900 p-5 shadow-2xl text-slate-100 font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  {editingStatType === 'malaria' && 'EDIT MALARIA PROPHYLAXIS STATE'}
                  {editingStatType === 'sickState' && 'EDIT TOTAL SICK STATE'}
                  {editingStatType === 'oNegative' && 'EDIT UNIVERSAL O- DONORS STATE'}
                </h3>
              </div>
              <button
                onClick={() => setEditingStatType(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStatEdit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">
                  {editingStatType === 'malaria' && 'Compliance Rate / Percentage *'}
                  {editingStatType === 'sickState' && 'Total Sick Count *'}
                  {editingStatType === 'oNegative' && 'O- Donor Count *'}
                </label>
                <input
                  type="text"
                  value={statValueInput}
                  onChange={(e) => setStatValueInput(e.target.value)}
                  placeholder={
                    editingStatType === 'malaria'
                      ? 'e.g. 96%'
                      : editingStatType === 'sickState'
                      ? 'e.g. 2'
                      : 'e.g. 4'
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono text-sm focus:border-sky-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">
                  {editingStatType === 'malaria' && 'Dosing Progress / Subtitle Note *'}
                  {editingStatType === 'sickState' && 'Medical State Status / Remarks *'}
                  {editingStatType === 'oNegative' && 'Emergency Transfusion Remarks *'}
                </label>
                <input
                  type="text"
                  value={statNoteInput}
                  onChange={(e) => setStatNoteInput(e.target.value)}
                  placeholder={
                    editingStatType === 'malaria'
                      ? 'e.g. 120/125 Doses Taken'
                      : editingStatType === 'sickState'
                      ? 'e.g. 1 Hospitalized, 1 Light Duty'
                      : 'e.g. Emergency Transfusion Ready'
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono text-xs focus:border-sky-500 outline-none"
                  required
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleResetStatOverride}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-mono transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Auto</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingStatType(null)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold font-mono transition"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save & Sync</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Medical Record Modal (Comd / Authorized Account Only) */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-sky-500/40 bg-slate-900 p-5 shadow-2xl text-slate-100 font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  EDIT MEDICAL RECORD (COMD / AUTHORIZED)
                </h3>
              </div>
              <button
                onClick={() => setEditingRecord(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Soldier Name *</label>
                  <input
                    type="text"
                    value={editingRecord.name}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, name: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Army Number *</label>
                  <input
                    type="text"
                    value={editingRecord.armyNo}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        armyNo: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Rank</label>
                  <select
                    value={editingRecord.rank}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, rank: e.target.value })
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
                  <label className="block text-slate-400 mb-1 font-mono">Blood Group</label>
                  <select
                    value={editingRecord.bloodGroup}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, bloodGroup: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Doxy Dosing</label>
                  <select
                    value={editingRecord.doxycyclineTakenToday ? 'YES' : 'NO'}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        doxycyclineTakenToday: e.target.value === 'YES',
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                  >
                    <option value="YES">Taken Today</option>
                    <option value="NO">Missed Dose</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Medical Fitness Category</label>
                <select
                  value={editingRecord.medicalCategory}
                  onChange={(e) =>
                    setEditingRecord({
                      ...editingRecord,
                      medicalCategory: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                >
                  <option value="FE (Fit Forward)">FE (Fit Forward Echelon)</option>
                  <option value="Temporary Low Med">Temporary Low Med (Sick Bay)</option>
                  <option value="Level II Hospitalized">Level II Hospitalized</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">
                  Diagnosis & Treatment Given *
                </label>
                <input
                  type="text"
                  value={editingRecord.recentDiagnosis}
                  onChange={(e) =>
                    setEditingRecord({ ...editingRecord, recentDiagnosis: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Known Drug Allergies</label>
                <input
                  type="text"
                  value={editingRecord.allergies}
                  onChange={(e) =>
                    setEditingRecord({ ...editingRecord, allergies: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold font-mono transition"
                >
                  <Check className="w-4 h-4" />
                  <span>Update Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Comd / Authorized Account Only) */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-rose-500/50 bg-slate-900 p-5 shadow-2xl text-slate-100 font-sans">
            <div className="flex items-center gap-2.5 text-rose-400 pb-3 border-b border-slate-800">
              <Trash2 className="w-5 h-5 text-rose-500" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                CONFIRM RECORD DELETION
              </h3>
            </div>

            <div className="py-4 text-xs text-slate-300 space-y-2">
              <p>
                Are you sure you want to delete medical record for:
              </p>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono">
                <div className="font-bold text-white">
                  {recordToDelete.rank} {recordToDelete.name}
                </div>
                <div className="text-[11px] text-sky-400">
                  Army No: {recordToDelete.armyNo} • Blood: {recordToDelete.bloodGroup}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Diagnosis: {recordToDelete.recentDiagnosis}
                </div>
              </div>
              <p className="text-[11px] text-rose-400">
                This record will be immediately removed and deleted across all connected devices.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
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
                <span>Delete Record</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Medical Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-sky-500/40 bg-slate-900 p-5 shadow-2xl text-slate-100 font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                RECORD MEDICAL ENTRY
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-3 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Soldier Name *</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Soldier Joynal"
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
                    placeholder="e.g. OR-8941"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Blood Group</label>
                  <select
                    value={newBloodGroup}
                    onChange={(e) => setNewBloodGroup(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Medical Fitness Category</label>
                  <select
                    value={newMedCat}
                    onChange={(e) => setNewMedCat(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                  >
                    <option value="FE (Fit Forward)">FE (Fit Forward Echelon)</option>
                    <option value="Temporary Low Med">Temporary Low Med (Sick Bay)</option>
                    <option value="Level II Hospitalized">Level II Hospitalized</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Diagnosis & Treatment Given *</label>
                <input
                  type="text"
                  value={newDiagnosis}
                  onChange={(e) => setNewDiagnosis(e.target.value)}
                  placeholder="e.g. Heat cramps and fatigue - given 1L IV saline"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Known Drug Allergies</label>
                <input
                  type="text"
                  value={newAllergies}
                  onChange={(e) => setNewAllergies(e.target.value)}
                  placeholder="e.g. Penicillin / None"
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
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
