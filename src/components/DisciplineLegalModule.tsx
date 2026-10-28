import React, { useState } from 'react';
import { LegalDisciplineCase } from '../data/mockData';
import { Scale, Lock, ShieldCheck, FileCheck, Paperclip, AlertTriangle, Plus, Eye, Download } from 'lucide-react';
import { getDeviceLocalDateTime } from '../utils/localDateTime';

interface DisciplineLegalModuleProps {
  cases: LegalDisciplineCase[];
  onUpdateCase: (updated: LegalDisciplineCase) => void;
  onAddCase: (newCase: LegalDisciplineCase) => void;
  activeRole: string;
}

export const DisciplineLegalModule: React.FC<DisciplineLegalModuleProps> = ({
  cases,
  onUpdateCase,
  onAddCase,
  activeRole,
}) => {
  const [selectedCase, setSelectedCase] = useState<LegalDisciplineCase | null>(cases[0] || null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDocPreview, setSelectedDocPreview] = useState<string | null>(null);

  // New case form
  const [newCaseNumber, setNewCaseNumber] = useState(`DISC-CAR-2026-00${cases.length + 1}`);
  const [newAccused, setNewAccused] = useState('');
  const [newRank, setNewRank] = useState('Private');
  const [newArmyNo, setNewArmyNo] = useState('');
  const [newCategory, setNewCategory] = useState<LegalDisciplineCase['category']>('Disobedience of Orders');
  const [newDescription, setNewDescription] = useState('');
  const [newInvestigator, setNewInvestigator] = useState('SWO Matiur Rahman');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccused.trim() || !newDescription.trim()) return;

    const localDate = getDeviceLocalDateTime().date;
    const newCase: LegalDisciplineCase = {
      id: `leg-${Date.now()}`,
      caseNumber: newCaseNumber,
      dateLogged: localDate,
      accusedPersonnel: newAccused.trim(),
      rank: newRank,
      armyNo: newArmyNo.trim() || 'N/A',
      category: newCategory,
      description: newDescription.trim(),
      investigatingOfficer: newInvestigator.trim(),
      status: 'Preliminary Inquiry',
      punishmentOrFinding: 'Under active inquiry. Statements being recorded.',
      documents: [
        { name: 'Initial_Incident_Report.pdf', size: '180 KB', date: localDate },
      ],
      confidential: true,
    };

    onAddCase(newCase);
    setShowAddModal(false);
    setSelectedCase(newCase);
  };

  const handleStatusChange = (c: LegalDisciplineCase, newStatus: LegalDisciplineCase['status']) => {
    const updated = { ...c, status: newStatus };
    onUpdateCase(updated);
    if (selectedCase?.id === c.id) setSelectedCase(updated);
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  DISCIPLINE, LEGAL CASES & SEA COMPLIANCE
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> RESTRICTED
                </span>
              </div>
              <p className="text-xs text-slate-400">
                UN Zero-Tolerance Sexual Exploitation & Abuse (SEA), Summary Trials & Attached Case Records
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Log Legal Record</span>
          </button>
        </div>

        {/* UN SEA Zero Tolerance Compliance Box */}
        <div className="mt-4 p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="font-bold text-white block">UN MINUSCA SEA COMPLIANCE AUDIT: 100% CLEAR</span>
              <span className="text-[11px] text-slate-400">
                All 125 personnel signed zero-tolerance declaration. Daily curfew & out-of-bounds enforced.
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
            ACTIVE CERTIFIED
          </span>
        </div>
      </div>

      {/* Main Grid: Cases List & Selected Case Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Case List Column */}
        <div className="lg:col-span-1 space-y-2.5">
          {cases.map((c) => {
            const isSelected = selectedCase?.id === c.id;
            const isClosed = c.status === 'Disposed / Closed';

            return (
              <div
                key={c.id}
                onClick={() => setSelectedCase(c)}
                className={`p-3 rounded-xl border cursor-pointer transition ${
                  isSelected
                    ? 'bg-purple-500/10 border-purple-500 shadow-md'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-mono font-bold text-sky-400">{c.caseNumber}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      isClosed
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white mt-1">{c.accusedPersonnel}</h4>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Category: <span className="text-purple-300">{c.category}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-1">
                  Logged on {c.dateLogged} • {c.documents.length} Attachment(s)
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Case Detail Column */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-4">
          {selectedCase ? (
            <div className="space-y-4 text-xs">
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white font-mono">{selectedCase.caseNumber}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-purple-300 border border-slate-700">
                      {selectedCase.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Accused: <strong className="text-white">{selectedCase.rank} {selectedCase.accusedPersonnel}</strong> ({selectedCase.armyNo})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedCase.status}
                    onChange={(e) => handleStatusChange(selectedCase, e.target.value as any)}
                    className="px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono outline-none"
                  >
                    <option value="Preliminary Inquiry">Preliminary Inquiry</option>
                    <option value="Court of Inquiry">Court of Inquiry</option>
                    <option value="Summary Trial">Summary Trial</option>
                    <option value="Disposed / Closed">Disposed / Closed</option>
                    <option value="Referred to Battalion HQ">Referred to Battalion HQ</option>
                  </select>
                </div>
              </div>

              {/* Case Summary */}
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-1.5 font-sans">
                <span className="text-[11px] font-bold text-slate-400 uppercase block font-mono">
                  INCIDENT PARTICULARS & CHARGE SHEET:
                </span>
                <p className="text-slate-200 leading-relaxed">{selectedCase.description}</p>
                <div className="text-[11px] text-slate-400 pt-1 font-mono">
                  Investigating Officer: <strong className="text-sky-300">{selectedCase.investigatingOfficer}</strong>
                </div>
              </div>

              {/* Finding / Punishment */}
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-1.5">
                <span className="text-[11px] font-bold text-amber-400 uppercase block font-mono">
                  FINDINGS & DISCIPLINARY AWARD / DISPOSAL:
                </span>
                <p className="text-slate-200 leading-relaxed font-sans">{selectedCase.punishmentOrFinding}</p>
              </div>

              {/* Document Attachments */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono mb-2">
                  ATTACHED LEGAL DOCUMENTS & EVIDENCE ({selectedCase.documents.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono">
                  {selectedCase.documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-slate-600 transition"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileCheck className="w-4 h-4 text-purple-400 shrink-0" />
                        <div className="truncate">
                          <span className="text-white font-bold block truncate">{doc.name}</span>
                          <span className="text-[10px] text-slate-400">{doc.size} • {doc.date}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedDocPreview(doc.name)}
                        className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-sky-300 text-[11px] flex items-center gap-1 shrink-0 ml-2"
                        title="View Document"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Select a legal or disciplinary record to review proceedings.
            </div>
          )}
        </div>
      </div>

      {/* Simulated Document Viewer Modal */}
      {selectedDocPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-purple-500/40 bg-slate-900 p-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white font-mono truncate">{selectedDocPreview}</h3>
              </div>
              <button onClick={() => setSelectedDocPreview(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="my-4 p-4 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs space-y-2 text-slate-300">
              <div className="text-center pb-2 border-b border-slate-800 text-sky-400 font-bold">
                === UNITED NATIONS MINUSCA PEACEKEEPING LEGAL DOCUMENT ===
              </div>
              <p>DOCUMENT: {selectedDocPreview}</p>
              <p>CASE REF: {selectedCase?.caseNumber}</p>
              <p>SECURITY: RESTRICTED / COMMANDER EYES ONLY</p>
              <p className="text-slate-400 text-[11px] pt-2">
                Verified digital seal attached by Company Commander Maj Fakrul Islam. Filed with Sector West Legal Liaison Officer, MINUSCA Bangui.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedDocPreview(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Legal Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-purple-500/40 bg-slate-900 p-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                LOG DISCIPLINARY / LEGAL PROCEEDING
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-3 space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Case Number</label>
                <input
                  type="text"
                  value={newCaseNumber}
                  onChange={(e) => setNewCaseNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-purple-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Accused Soldier Name *</label>
                  <input
                    type="text"
                    value={newAccused}
                    onChange={(e) => setNewAccused(e.target.value)}
                    placeholder="e.g. Soldier Anisur"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-purple-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Army Number</label>
                  <input
                    type="text"
                    value={newArmyNo}
                    onChange={(e) => setNewArmyNo(e.target.value)}
                    placeholder="e.g. OR-9140"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-purple-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-purple-500 outline-none"
                >
                  <option value="SEA Zero-Tolerance">SEA Zero-Tolerance Breach</option>
                  <option value="Unintentional Discharge">Unintentional Discharge</option>
                  <option value="Equipment / Kit Loss">Equipment / Kit Loss</option>
                  <option value="Curfew / Out of Bounds">Curfew / Out of Bounds</option>
                  <option value="Disobedience of Orders">Disobedience of Orders</option>
                  <option value="Civilian Dispute">Civilian Dispute</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Incident Particulars & Allegations *</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                  placeholder="Detail exact time, location and circumstances..."
                  className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-purple-500 outline-none"
                  required
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
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Register Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
