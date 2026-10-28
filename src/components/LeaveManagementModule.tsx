import React, { useState } from 'react';
import { LeaveRecord } from '../data/mockData';
import { Plane, Calendar, UserCheck, Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface LeaveManagementModuleProps {
  leaves: LeaveRecord[];
  onUpdateLeave: (updated: LeaveRecord) => void;
  onAddLeave: (newLeave: LeaveRecord) => void;
  activeRole: string;
}

export const LeaveManagementModule: React.FC<LeaveManagementModuleProps> = ({
  leaves,
  onUpdateLeave,
  onAddLeave,
  activeRole,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRecord | null>(null);

  // New leave form
  const [newName, setNewName] = useState('');
  const [newArmyNo, setNewArmyNo] = useState('');
  const [newRank, setNewRank] = useState('Private');
  const [newPlatoon, setNewPlatoon] = useState('1 Platoon');
  const [newLeaveType, setNewLeaveType] = useState<LeaveRecord['leaveType']>('R&R (21 Days)');
  const [newStartDate, setNewStartDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [newEndDate, setNewEndDate] = useState(() => new Date(Date.now() + 21 * 86400000).toISOString().substring(0, 10));
  const [newHandover, setNewHandover] = useState('');
  const [newFlight, setNewFlight] = useState('UNHAS Shuttle Bangui -> Entebbe');

  const currentlyAway = leaves.filter((l) => l.approvalStatus === 'Approved by Commander' && l.daysRemaining > 0);
  const pendingApproval = leaves.filter((l) => l.approvalStatus === 'Pending Recommendation');

  const handleApprove = (leave: LeaveRecord) => {
    onUpdateLeave({
      ...leave,
      approvalStatus: 'Approved by Commander',
    });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newArmyNo.trim()) return;

    const newRec: LeaveRecord = {
      id: `l-${Date.now()}`,
      name: newName.trim(),
      armyNo: newArmyNo.trim().toUpperCase(),
      rank: newRank,
      platoon: newPlatoon,
      leaveType: newLeaveType,
      startDate: newStartDate,
      endDate: newEndDate,
      daysRemaining: 21,
      flightDetails: newFlight.trim(),
      handoverTo: newHandover.trim() || 'Platoon 2IC',
      approvalStatus: activeRole.includes('Commander') ? 'Approved by Commander' : 'Pending Recommendation',
      contactPhone: '+8801700000000',
    };

    onAddLeave(newRec);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-lg">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                PERSONNEL LEAVE & R&amp;R ROTATION
              </h2>
              <p className="text-xs text-slate-400">
                UN Peacekeeping 6-Month R&amp;R Cycle, UNHAS Flight Slots & Handover Coverage
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Apply for R&amp;R Leave</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs font-mono">
          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 text-center">
            <span className="text-slate-400 text-[10px] block">CURRENTLY AWAY (R&amp;R)</span>
            <span className="text-2xl font-black text-purple-400">{currentlyAway.length}</span>
            <span className="text-[10px] text-slate-400 block">Personnel on Rotation</span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 text-center">
            <span className="text-slate-400 text-[10px] block">PENDING COMMANDER APPROVAL</span>
            <span className="text-2xl font-black text-amber-400">{pendingApproval.length}</span>
            <span className="text-[10px] text-amber-400/80 block">Awaiting Authorization</span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 text-center">
            <span className="text-slate-400 text-[10px] block">NEXT BATCH FLIGHT</span>
            <span className="text-2xl font-black text-sky-400">01 NOV 2026</span>
            <span className="text-[10px] text-sky-400/80 block">UNHAS Flight Slot #114</span>
          </div>
        </div>
      </div>

      {/* Leave Roster Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-3 py-3">Soldier / Army No</th>
                <th className="px-3 py-3">Platoon</th>
                <th className="px-3 py-3">Leave Type</th>
                <th className="px-3 py-3">Dates & Days Left</th>
                <th className="px-3 py-3">UNHAS Air Shuttle</th>
                <th className="px-3 py-3">Handover Designated</th>
                <th className="px-3 py-3">Approval Status</th>
                <th className="px-3 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-sans">
              {leaves.map((l) => {
                const isApproved = l.approvalStatus === 'Approved by Commander';

                return (
                  <tr key={l.id} className="hover:bg-slate-800/50 transition">
                    <td className="px-3 py-3 font-mono">
                      <div className="font-bold text-white flex items-center gap-1">
                        <span>{l.rank}</span>
                        <span>{l.name}</span>
                      </div>
                      <div className="text-[10px] text-sky-400">{l.armyNo}</div>
                    </td>

                    <td className="px-3 py-3 text-slate-400">{l.platoon}</td>

                    <td className="px-3 py-3 font-mono text-purple-300 font-medium">
                      {l.leaveType}
                    </td>

                    <td className="px-3 py-3 font-mono">
                      <div className="text-slate-200">
                        {l.startDate} to {l.endDate}
                      </div>
                      <div className="text-[10px] text-emerald-400">
                        {l.daysRemaining} days remaining
                      </div>
                    </td>

                    <td className="px-3 py-3 text-slate-300 text-[11px] truncate max-w-[140px]">
                      {l.flightDetails}
                    </td>

                    <td className="px-3 py-3 text-slate-400 text-[11px]">
                      {l.handoverTo}
                    </td>

                    <td className="px-3 py-3 font-mono">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isApproved
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {l.approvalStatus}
                      </span>
                    </td>

                    <td className="px-3 py-3 text-right">
                      {!isApproved && (
                        <button
                          onClick={() => handleApprove(l)}
                          className="px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold"
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Leave Request Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-sky-500/40 bg-slate-900 p-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                SUBMIT R&amp;R LEAVE APPLICATION
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-3 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Soldier Name *</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Lt. Tariq Rahman"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Army Number *</label>
                  <input
                    type="text"
                    value={newArmyNo}
                    onChange={(e) => setNewArmyNo(e.target.value)}
                    placeholder="e.g. BA-8240"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Leave Category</label>
                  <select
                    value={newLeaveType}
                    onChange={(e) => setNewLeaveType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                  >
                    <option value="R&R (21 Days)">R&amp;R (21 Days Mandatory)</option>
                    <option value="Annual Leave">Annual Leave</option>
                    <option value="Compassionate Leave">Compassionate Leave</option>
                    <option value="Medical Evacuation Leave">Medical Evacuation Leave</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Platoon</label>
                  <select
                    value={newPlatoon}
                    onChange={(e) => setNewPlatoon(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                  >
                    <option value="Coy HQ">Coy HQ</option>
                    <option value="1 Platoon">1 Platoon</option>
                    <option value="2 Platoon">2 Platoon</option>
                    <option value="3 Platoon">3 Platoon</option>
                    <option value="Support Weapons Platoon">Support Weapons Platoon</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">End Date</label>
                  <input
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Designated Relief / Handover Officer/NCO *</label>
                <input
                  type="text"
                  value={newHandover}
                  onChange={(e) => setNewHandover(e.target.value)}
                  placeholder="e.g. Lt. Farhan Ashraf will assume duties"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
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
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
