import React, { useState, useMemo, useRef } from 'react';
import { Personnel, calculateManpowerSummary, filterPersonnel } from '../utils/commandLogic';
import { Users, UserPlus, Search, Shield, FileText, CheckCircle, Clock, AlertCircle, Phone, Heart, Copy, ClipboardPaste, RotateCcw, Edit2, Check, X, Trash2, ArrowLeftRight } from 'lucide-react';
import { getDeviceLocalDateTime } from '../utils/localDateTime';

interface ManpowerModuleProps {
  personnel: Personnel[];
  onUpdatePersonnel: (updated: Personnel) => void;
  onAddPersonnel: (newPerson: Personnel) => void;
  onDeletePersonnel?: (id: string) => void;
  activeRole: string;
}

export const ManpowerModule: React.FC<ManpowerModuleProps> = ({
  personnel,
  onUpdatePersonnel,
  onAddPersonnel,
  onDeletePersonnel,
  activeRole,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatoon, setSelectedPlatoon] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSitrepModal, setShowSitrepModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Personnel | null>(null);

  // Parade State Text State & Ref (for direct editing, copying and pasting)
  const [paradeStateText, setParadeStateText] = useState<string>('');
  const [copySuccessToast, setCopySuccessToast] = useState(false);
  const paradePreRef = useRef<HTMLPreElement>(null);

  // Overrides parsed from Parade State or manually edited on the cards
  const [metricOverrides, setMetricOverrides] = useState<{
    authorized: number;
    posted: number;
    absent: number;
    present: number;
    onPatrol: number;
    onDuty: number;
    fightingStrength: number;
    readinessPercent: number;
    onLeave: number;
    sick: number;
    detached: number;
  }>({
    authorized: 142,
    posted: 141,
    absent: 1,
    present: 100,
    onPatrol: 3,
    onDuty: 3,
    fightingStrength: 13,
    readinessPercent: 87,
    onLeave: 1,
    sick: 1,
    detached: 0,
  });

  // State for which metric card is being edited inline
  const [editingCardKey, setEditingCardKey] = useState<string | null>(null);
  const [editingCardValue, setEditingCardValue] = useState<string>('');

  // Editable personnel name in list
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState<string>('');

  // Editable weapon and weapon exchange state
  const [editingWeaponPersonId, setEditingWeaponPersonId] = useState<string | null>(null);
  const [editingWeaponValue, setEditingWeaponValue] = useState<string>('');
  const [showWeaponSwapModal, setShowWeaponSwapModal] = useState<boolean>(false);
  const [swapSourcePerson, setSwapSourcePerson] = useState<Personnel | null>(null);
  const [swapTargetPersonId, setSwapTargetPersonId] = useState<string>('');

  // Function to parse Parade State text and auto-update the metric card values
  const parseAndApplyParadeText = (text: string) => {
    const lines = text.split('\n');
    const updates: Partial<typeof metricOverrides> = {};

    for (const line of lines) {
      const l = line.trim();
      const authMatch = l.match(/Authorized:\s*(\d+)/i);
      if (authMatch) updates.authorized = parseInt(authMatch[1], 10);

      const postedMatch = l.match(/Posted Strength:\s*(\d+)/i);
      if (postedMatch) updates.posted = parseInt(postedMatch[1], 10);

      const absentMatch = l.match(/(?:Absent|Deficiency):\s*(\d+)/i);
      if (absentMatch) updates.absent = parseInt(absentMatch[1], 10);

      const presentMatch = l.match(/Present at (?:Company Camp Location|Camp Base|Camp Location|Camp):\s*(\d+)/i);
      if (presentMatch) updates.present = parseInt(presentMatch[1], 10);

      const patrolMatch = l.match(/Operational(?:\/Patrols\/TOB|\s*Patrols|\s*\(MSR\))?:\s*(\d+)/i);
      if (patrolMatch) updates.onPatrol = parseInt(patrolMatch[1], 10);

      const dutyMatch = l.match(/Guard\s*(?:\/|\s)\s*Camp Defense(?: Post)?:\s*(\d+)/i);
      if (dutyMatch) updates.onDuty = parseInt(dutyMatch[1], 10);

      const fightingMatch = l.match(/Effective Fighting Strength:\s*(\d+)(?:\s*\(\s*(\d+)%?\s*\))?/i);
      if (fightingMatch) {
        updates.fightingStrength = parseInt(fightingMatch[1], 10);
        if (fightingMatch[2]) updates.readinessPercent = parseInt(fightingMatch[2], 10);
      }

      const leaveMatch = l.match(/Leave\s*(?:\/|\s)\s*R&R(?: Rotation)?:\s*(\d+)/i);
      if (leaveMatch) updates.onLeave = parseInt(leaveMatch[1], 10);

      const sickMatch = l.match(/Sick Bay(?:\s*\/\s*Level II Hospital)?:\s*(\d+)/i);
      if (sickMatch) updates.sick = parseInt(sickMatch[1], 10);

      const detachedMatch = l.match(/Detached (?:to HQ|Sector HQ):\s*(\d+)/i);
      if (detachedMatch) updates.detached = parseInt(detachedMatch[1], 10);
    }

    if (Object.keys(updates).length > 0) {
      setMetricOverrides((prev) => ({
        ...prev,
        ...updates,
      }));
    }
  };

  // Generate Military Daily Parade State matching current metrics
  const getTemplateParadeText = (overrides = metricOverrides) => {
    const { date, time } = getDeviceLocalDateTime();
    const auth = overrides.authorized;
    const posted = overrides.posted;
    const absent = overrides.absent;
    const present = overrides.present;
    const patrol = overrides.onPatrol;
    const duty = overrides.onDuty;
    const fight = overrides.fightingStrength;
    const ready = overrides.readinessPercent;
    const leave = overrides.onLeave;
    const sick = overrides.sick;
    const detached = overrides.detached;

    return `=== BANBAT-13, MINUSCA ===
MECHANIZED COMPANY-2 DAILY PARADE STATE & STRENGTH RETURN
LOCATION: BOUAR, CAR (SECTOR WEST)
DATE: ${date} | TIME: ${time} LT (DEVICE LOCAL TIME)

1. ESTABLISHMENT:
   Authorized: ${auth}
   Posted Strength: ${posted}
   Absent: ${absent}

2. DISPOSITION & EMPLOYMENT:
   - Present at Company Camp Location: ${present}
   - Operational/Patrols/TOB: ${patrol}
   - Guard / Camp Defense Post: ${duty}
   - Effective Fighting Strength: ${fight} (${ready}%)
   - Leave / R&R Rotation: ${leave}
   - Sick Bay / Level II Hospital: ${sick}
   - Detached to HQ: ${detached}

3. SUB-UNIT BREAKDOWN:
   - Coy HQ: 20
   - 1 Platoon: 34
   - 2 Platoon: 34
   - 3 Platoon: 34
   - Cbt Support Pl: 20

CERTIFIED BY:
Maj Fakrul Islam,
Company Commander, Mechanized Company-2
BANBAT-13, MINUSCA Peacekeeping Contingent`;
  };

  const handleOpenParadeModal = () => {
    if (!paradeStateText) {
      setParadeStateText(getTemplateParadeText());
    }
    setShowSitrepModal(true);
  };

  const handleCopyToClipboard = async () => {
    const textToCopy = paradePreRef.current?.innerText || paradeStateText || getTemplateParadeText();
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopySuccessToast(true);
      setTimeout(() => setCopySuccessToast(false), 2500);
    } catch (_err) {
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccessToast(true);
      setTimeout(() => setCopySuccessToast(false), 2500);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setParadeStateText(text);
        if (paradePreRef.current) {
          paradePreRef.current.innerText = text;
        }
        parseAndApplyParadeText(text);
      }
    } catch (_err) {
      const manual = prompt('Paste your updated Parade State text here:');
      if (manual) {
        setParadeStateText(manual);
        if (paradePreRef.current) {
          paradePreRef.current.innerText = manual;
        }
        parseAndApplyParadeText(manual);
      }
    }
  };

  const handleUpdateTimestamp = () => {
    const { date, time } = getDeviceLocalDateTime();
    const current = paradePreRef.current?.innerText || paradeStateText || getTemplateParadeText();
    const updated = current.replace(/DATE:.*\|.*TIME:.*LT.*(\r?\n|$)/i, `DATE: ${date} | TIME: ${time} LT (DEVICE LOCAL TIME)\n`);
    setParadeStateText(updated);
    if (paradePreRef.current) {
      paradePreRef.current.innerText = updated;
    }
  };

  const handleResetTemplate = () => {
    const fresh = getTemplateParadeText();
    setParadeStateText(fresh);
    if (paradePreRef.current) {
      paradePreRef.current.innerText = fresh;
    }
  };

  // Card metric inline edit handlers
  const handleStartEditMetric = (key: string, val: number) => {
    setEditingCardKey(key);
    setEditingCardValue(String(val));
  };

  const handleSaveMetric = (key: keyof typeof metricOverrides) => {
    const num = parseInt(editingCardValue, 10);
    if (!isNaN(num)) {
      const updated = {
        ...metricOverrides,
        [key]: num,
      };
      if (key === 'authorized' || key === 'posted') {
        const auth = key === 'authorized' ? num : updated.authorized;
        const post = key === 'posted' ? num : updated.posted;
        updated.absent = Math.max(0, auth - post);
      }
      setMetricOverrides(updated);
      const newText = getTemplateParadeText(updated);
      setParadeStateText(newText);
      if (paradePreRef.current) {
        paradePreRef.current.innerText = newText;
      }
    }
    setEditingCardKey(null);
  };

  // Name editing handlers
  const handleStartEditName = (person: Personnel) => {
    setEditingPersonId(person.id);
    setEditingNameValue(person.name);
  };

  const handleSaveName = (personId: string) => {
    if (editingNameValue.trim()) {
      const p = personnel.find((item) => item.id === personId);
      if (p) {
        const updated = { ...p, name: editingNameValue.trim() };
        onUpdatePersonnel(updated);
        if (selectedPerson?.id === personId) {
          setSelectedPerson(updated);
        }
      }
    }
    setEditingPersonId(null);
  };

  const handleDeletePerson = (personId: string) => {
    if (onDeletePersonnel) {
      onDeletePersonnel(personId);
    }
    if (selectedPerson?.id === personId) {
      setSelectedPerson(null);
    }
    setMetricOverrides((prev) => {
      const newPosted = Math.max(0, prev.posted - 1);
      const newAbsent = Math.max(0, prev.authorized - newPosted);
      return {
        ...prev,
        posted: newPosted,
        absent: newAbsent,
      };
    });
  };

  // Weapon editing & exchange handlers
  const handleStartEditWeapon = (person: Personnel) => {
    setEditingWeaponPersonId(person.id);
    setEditingWeaponValue(person.weaponIssued || '');
  };

  const handleSaveWeapon = (personId: string) => {
    const p = personnel.find((item) => item.id === personId);
    if (p) {
      const updated = { ...p, weaponIssued: editingWeaponValue.trim() || 'Unassigned / Armory' };
      onUpdatePersonnel(updated);
      if (selectedPerson?.id === personId) {
        setSelectedPerson(updated);
      }
    }
    setEditingWeaponPersonId(null);
  };

  const handleClearWeapon = (person: Personnel) => {
    const updated = { ...person, weaponIssued: 'Unassigned / Armory' };
    onUpdatePersonnel(updated);
    if (selectedPerson?.id === person.id) {
      setSelectedPerson(updated);
    }
  };

  const handleSwapWeaponsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!swapSourcePerson || !swapTargetPersonId) return;
    const targetPerson = personnel.find((p) => p.id === swapTargetPersonId);
    if (!targetPerson) return;

    // Swap weapons between both soldiers
    const updatedSource = { ...swapSourcePerson, weaponIssued: targetPerson.weaponIssued };
    const updatedTarget = { ...targetPerson, weaponIssued: swapSourcePerson.weaponIssued };
    onUpdatePersonnel(updatedSource);
    onUpdatePersonnel(updatedTarget);
    if (selectedPerson?.id === swapSourcePerson.id) setSelectedPerson(updatedSource);
    if (selectedPerson?.id === targetPerson.id) setSelectedPerson(updatedTarget);

    setShowWeaponSwapModal(false);
    setSwapSourcePerson(null);
    setSwapTargetPersonId('');
  };

  // Synchronized summary state derived from metricOverrides
  const summary = useMemo(() => {
    return {
      totalAuthorized: metricOverrides.authorized,
      totalPosted: metricOverrides.posted,
      absent: metricOverrides.absent,
      present: metricOverrides.present,
      onPatrol: metricOverrides.onPatrol,
      onDuty: metricOverrides.onDuty,
      onLeave: metricOverrides.onLeave,
      sick: metricOverrides.sick,
      detached: metricOverrides.detached,
      effectiveFightingStrength: metricOverrides.fightingStrength,
      operationalReadinessPercent: metricOverrides.readinessPercent,
    };
  }, [metricOverrides]);

  // Filtered personnel list for the table
  const filteredList = useMemo(() => {
    return filterPersonnel(personnel, searchQuery, selectedPlatoon, selectedStatus);
  }, [personnel, searchQuery, selectedPlatoon, selectedStatus]);

  const handleStatusChange = (person: Personnel, newStatus: Personnel['status']) => {
    onUpdatePersonnel({
      ...person,
      status: newStatus,
    });
  };

  // Add Personnel form state
  const [newArmyNo, setNewArmyNo] = useState('');
  const [newUnId, setNewUnId] = useState('');
  const [newName, setNewName] = useState('');
  const [newRank, setNewRank] = useState<Personnel['rank']>('Private');
  const [newPlatoon, setNewPlatoon] = useState<Personnel['platoon']>('1 Platoon');
  const [newRole, setNewRole] = useState('Rifleman');
  const [newBloodGroup, setNewBloodGroup] = useState<Personnel['bloodGroup']>('O+');
  const [newNokName, setNewNokName] = useState('');
  const [newWeaponIssued, setNewWeaponIssued] = useState('BD-08 Rifle (7.62mm)');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArmyNo || !newName) return;
    const newPerson: Personnel = {
      id: `pers-${Date.now()}`,
      armyNo: newArmyNo,
      unId: newUnId || `PKF-BGD-${Math.floor(10000 + Math.random() * 90000)}`,
      rank: newRank,
      name: newName,
      platoon: newPlatoon,
      role: newRole || 'Rifleman',
      status: 'Present',
      weaponIssued: newWeaponIssued.trim() || 'BD-08 Rifle (7.62mm)',
      bloodGroup: newBloodGroup,
      medicalCategory: 'FE (Fit Forward)',
      malariaProphylaxisTaken: true,
      nokName: newNokName || 'Not recorded',
      nokPhone: '+880-1700-000000',
    };
    onAddPersonnel(newPerson);
    setMetricOverrides((prev) => {
      const newPosted = prev.posted + 1;
      const newAbsent = Math.max(0, prev.authorized - newPosted);
      return {
        ...prev,
        posted: newPosted,
        absent: newAbsent,
      };
    });
    setNewArmyNo('');
    setNewUnId('');
    setNewName('');
    setNewRole('Rifleman');
    setNewNokName('');
    setNewWeaponIssued('BD-08 Rifle (7.62mm)');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner and Summary Stats */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                COMPANY MANPOWER STATE
              </h2>
              <p className="text-xs text-slate-400">
                Authorized Establishment: {summary.totalAuthorized} • Effective Combat Readiness: {summary.operationalReadinessPercent}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenParadeModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              title="Generate Daily Parade State"
            >
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              <span>Parade State</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow transition active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Personnel</span>
            </button>
          </div>
        </div>

        {/* Tactical Metric Cards - All 7 divs directly editable and synced to Parade State */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-4 text-xs">
          {/* Card 1: POSTED TOTAL */}
          <div
            className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60 text-center relative group hover:border-sky-500/60 transition cursor-pointer"
            title="Click to edit Posted Total"
            onClick={() => {
              if (editingCardKey !== 'posted') handleStartEditMetric('posted', metricOverrides.posted);
            }}
          >
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono mb-0.5">
              <span>POSTED TOTAL</span>
              <Edit2 className="w-2.5 h-2.5 text-slate-500 group-hover:text-sky-400 transition" />
            </div>
            {editingCardKey === 'posted' ? (
              <div className="flex items-center justify-center gap-1 my-1" onClick={(e) => e.stopPropagation()}>
                <input
                  type="number"
                  value={editingCardValue}
                  onChange={(e) => setEditingCardValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveMetric('posted');
                    if (e.key === 'Escape') setEditingCardKey(null);
                  }}
                  autoFocus
                  className="w-16 text-center font-mono font-bold text-white bg-slate-900 border border-sky-500 rounded px-1 py-0.5 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleSaveMetric('posted')}
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
              <span className="text-xl font-black text-white font-mono block my-0.5">{metricOverrides.posted}</span>
            )}
            <span className="text-[10px] text-slate-500 block font-mono">Auth: {metricOverrides.authorized}</span>
          </div>

          {/* Card 2: PRESENT BASE */}
          <div
            className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60 text-center relative group hover:border-emerald-500/60 transition cursor-pointer"
            title="Click to edit Present Base"
            onClick={() => {
              if (editingCardKey !== 'present') handleStartEditMetric('present', metricOverrides.present);
            }}
          >
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono mb-0.5">
              <span>PRESENT BASE</span>
              <Edit2 className="w-2.5 h-2.5 text-slate-500 group-hover:text-emerald-400 transition" />
            </div>
            {editingCardKey === 'present' ? (
              <div className="flex items-center justify-center gap-1 my-1" onClick={(e) => e.stopPropagation()}>
                <input
                  type="number"
                  value={editingCardValue}
                  onChange={(e) => setEditingCardValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveMetric('present');
                    if (e.key === 'Escape') setEditingCardKey(null);
                  }}
                  autoFocus
                  className="w-16 text-center font-mono font-bold text-emerald-400 bg-slate-900 border border-emerald-500 rounded px-1 py-0.5 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleSaveMetric('present')}
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
              <span className="text-xl font-black text-emerald-400 font-mono block my-0.5">{metricOverrides.present}</span>
            )}
            <span className="text-[10px] text-emerald-400/80 block">In Camp</span>
          </div>

          {/* Card 3: ON PATROL */}
          <div
            className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60 text-center relative group hover:border-sky-500/60 transition cursor-pointer"
            title="Click to edit On Patrol"
            onClick={() => {
              if (editingCardKey !== 'onPatrol') handleStartEditMetric('onPatrol', metricOverrides.onPatrol);
            }}
          >
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono mb-0.5">
              <span>ON PATROL</span>
              <Edit2 className="w-2.5 h-2.5 text-slate-500 group-hover:text-sky-400 transition" />
            </div>
            {editingCardKey === 'onPatrol' ? (
              <div className="flex items-center justify-center gap-1 my-1" onClick={(e) => e.stopPropagation()}>
                <input
                  type="number"
                  value={editingCardValue}
                  onChange={(e) => setEditingCardValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveMetric('onPatrol');
                    if (e.key === 'Escape') setEditingCardKey(null);
                  }}
                  autoFocus
                  className="w-16 text-center font-mono font-bold text-sky-400 bg-slate-900 border border-sky-500 rounded px-1 py-0.5 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleSaveMetric('onPatrol')}
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
              <span className="text-xl font-black text-sky-400 font-mono block my-0.5">{metricOverrides.onPatrol}</span>
            )}
            <span className="text-[10px] text-sky-400/80 block">MSR Sector</span>
          </div>

          {/* Card 4: DUTY POST */}
          <div
            className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60 text-center relative group hover:border-amber-500/60 transition cursor-pointer"
            title="Click to edit Duty Post"
            onClick={() => {
              if (editingCardKey !== 'onDuty') handleStartEditMetric('onDuty', metricOverrides.onDuty);
            }}
          >
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono mb-0.5">
              <span>DUTY POST</span>
              <Edit2 className="w-2.5 h-2.5 text-slate-500 group-hover:text-amber-400 transition" />
            </div>
            {editingCardKey === 'onDuty' ? (
              <div className="flex items-center justify-center gap-1 my-1" onClick={(e) => e.stopPropagation()}>
                <input
                  type="number"
                  value={editingCardValue}
                  onChange={(e) => setEditingCardValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveMetric('onDuty');
                    if (e.key === 'Escape') setEditingCardKey(null);
                  }}
                  autoFocus
                  className="w-16 text-center font-mono font-bold text-amber-400 bg-slate-900 border border-amber-500 rounded px-1 py-0.5 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleSaveMetric('onDuty')}
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
              <span className="text-xl font-black text-amber-400 font-mono block my-0.5">{metricOverrides.onDuty}</span>
            )}
            <span className="text-[10px] text-amber-400/80 block">Gate & Towers</span>
          </div>

          {/* Card 5: LEAVE / R&R */}
          <div
            className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60 text-center relative group hover:border-purple-500/60 transition cursor-pointer"
            title="Click to edit Leave / R&R"
            onClick={() => {
              if (editingCardKey !== 'onLeave') handleStartEditMetric('onLeave', metricOverrides.onLeave);
            }}
          >
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono mb-0.5">
              <span>LEAVE / R&R</span>
              <Edit2 className="w-2.5 h-2.5 text-slate-500 group-hover:text-purple-400 transition" />
            </div>
            {editingCardKey === 'onLeave' ? (
              <div className="flex items-center justify-center gap-1 my-1" onClick={(e) => e.stopPropagation()}>
                <input
                  type="number"
                  value={editingCardValue}
                  onChange={(e) => setEditingCardValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveMetric('onLeave');
                    if (e.key === 'Escape') setEditingCardKey(null);
                  }}
                  autoFocus
                  className="w-16 text-center font-mono font-bold text-purple-400 bg-slate-900 border border-purple-500 rounded px-1 py-0.5 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleSaveMetric('onLeave')}
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
              <span className="text-xl font-black text-purple-400 font-mono block my-0.5">{metricOverrides.onLeave}</span>
            )}
            <span className="text-[10px] text-purple-400/80 block">Rotation</span>
          </div>

          {/* Card 6: SICK BAY */}
          <div
            className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60 text-center relative group hover:border-rose-500/60 transition cursor-pointer"
            title="Click to edit Sick Bay"
            onClick={() => {
              if (editingCardKey !== 'sick') handleStartEditMetric('sick', metricOverrides.sick);
            }}
          >
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono mb-0.5">
              <span>SICK BAY</span>
              <Edit2 className="w-2.5 h-2.5 text-slate-500 group-hover:text-rose-400 transition" />
            </div>
            {editingCardKey === 'sick' ? (
              <div className="flex items-center justify-center gap-1 my-1" onClick={(e) => e.stopPropagation()}>
                <input
                  type="number"
                  value={editingCardValue}
                  onChange={(e) => setEditingCardValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveMetric('sick');
                    if (e.key === 'Escape') setEditingCardKey(null);
                  }}
                  autoFocus
                  className="w-16 text-center font-mono font-bold text-rose-400 bg-slate-900 border border-rose-500 rounded px-1 py-0.5 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleSaveMetric('sick')}
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
              <span className="text-xl font-black text-rose-400 font-mono block my-0.5">{metricOverrides.sick}</span>
            )}
            <span className="text-[10px] text-rose-400/80 block">Hospitalized</span>
          </div>

          {/* Card 7: COMBAT FIT */}
          <div
            className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60 text-center col-span-2 sm:col-span-1 relative group hover:border-cyan-500/60 transition cursor-pointer"
            title="Click to edit Combat Fit / Effective Strength"
            onClick={() => {
              if (editingCardKey !== 'fightingStrength') handleStartEditMetric('fightingStrength', metricOverrides.fightingStrength);
            }}
          >
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono mb-0.5">
              <span>COMBAT FIT</span>
              <Edit2 className="w-2.5 h-2.5 text-slate-500 group-hover:text-cyan-400 transition" />
            </div>
            {editingCardKey === 'fightingStrength' ? (
              <div className="flex items-center justify-center gap-1 my-1" onClick={(e) => e.stopPropagation()}>
                <input
                  type="number"
                  value={editingCardValue}
                  onChange={(e) => setEditingCardValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveMetric('fightingStrength');
                    if (e.key === 'Escape') setEditingCardKey(null);
                  }}
                  autoFocus
                  className="w-16 text-center font-mono font-bold text-cyan-400 bg-slate-900 border border-cyan-500 rounded px-1 py-0.5 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleSaveMetric('fightingStrength')}
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
              <span className="text-xl font-black text-cyan-400 font-mono block my-0.5">
                {metricOverrides.fightingStrength}
              </span>
            )}
            <span className="text-[10px] text-cyan-400/80 block">{metricOverrides.readinessPercent}% Ready</span>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, army no, UN ID, appointment..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:border-sky-500 outline-none"
          />
        </div>

        {/* Platoon Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin">
          {[
            { key: 'ALL', label: 'All Platoons' },
            { key: 'Coy HQ', label: 'Coy HQ' },
            { key: '1 Platoon', label: '1 Pl' },
            { key: '2 Platoon', label: '2 Pl' },
            { key: '3 Platoon', label: '3 Pl' },
            { key: 'Support Weapons Platoon', label: 'Cbt Support Pl' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedPlatoon(tab.key)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium whitespace-nowrap transition ${
                selectedPlatoon === tab.key
                  ? 'bg-sky-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 outline-none"
        >
          <option value="ALL">All States</option>
          <option value="Present">Present</option>
          <option value="On Patrol">On Patrol</option>
          <option value="Duty Post">Duty Post</option>
          <option value="Leave / R&R">Leave / R&R</option>
          <option value="Sick Bay / Hospital">Sick Bay</option>
        </select>
      </div>

      {/* Personnel Table / Card Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-3 py-3">Soldier / UN ID</th>
                <th className="px-3 py-3">Rank & Name</th>
                <th className="px-3 py-3">Platoon & Role</th>
                <th className="px-3 py-3">Current State</th>
                <th className="px-3 py-3">Weapon Issued</th>
                <th className="px-3 py-3">Blood / Med Cat</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-sans">
              {filteredList.map((person) => {
                const isSelected = selectedPerson?.id === person.id;
                return (
                  <tr
                    key={person.id}
                    onClick={() => setSelectedPerson(person)}
                    className={`cursor-pointer transition hover:bg-slate-800/50 ${
                      isSelected ? 'bg-sky-500/10' : ''
                    }`}
                  >
                    <td className="px-3 py-3 font-mono">
                      <div className="font-bold text-white">{person.armyNo}</div>
                      <div className="text-[10px] text-sky-400">{person.unId}</div>
                    </td>

                    <td className="px-3 py-3">
                      {editingPersonId === person.id ? (
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                            {person.rank}
                          </span>
                          <input
                            type="text"
                            value={editingNameValue}
                            onChange={(e) => setEditingNameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveName(person.id);
                              if (e.key === 'Escape') setEditingPersonId(null);
                            }}
                            autoFocus
                            className="px-2 py-0.5 rounded bg-slate-800 border border-sky-500 text-white text-xs font-bold focus:outline-none w-36"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveName(person.id)}
                            className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                            title="Save Name"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingPersonId(null)}
                            className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300"
                            title="Cancel"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="font-bold text-white flex items-center justify-between group">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                              {person.rank}
                            </span>
                            <span className="hover:text-sky-300 transition" onClick={() => handleStartEditName(person)} title="Click to edit name">
                              {person.name}
                            </span>
                            {/* Erase option beside every name */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleDeletePerson(person.id);
                              }}
                              className="p-1 rounded text-rose-400 hover:text-white hover:bg-rose-600 transition"
                              title={`Instantly erase ${person.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleStartEditName(person);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-sky-300 rounded hover:bg-slate-800 transition"
                            title="Edit soldier name"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="px-3 py-3">
                      <div className="text-slate-200">{person.role}</div>
                      <div className="text-[11px] text-slate-400">{person.platoon}</div>
                    </td>

                    <td className="px-3 py-3 font-mono">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          person.status === 'Present'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : person.status === 'On Patrol'
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            : person.status === 'Duty Post'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : person.status === 'Leave / R&R'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {person.status}
                      </span>
                    </td>

                    <td className="px-3 py-3 font-mono text-[11px]">
                      {editingWeaponPersonId === person.id ? (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editingWeaponValue}
                            onChange={(e) => setEditingWeaponValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveWeapon(person.id);
                              if (e.key === 'Escape') setEditingWeaponPersonId(null);
                            }}
                            autoFocus
                            placeholder="Weapon issued..."
                            className="px-2 py-0.5 rounded bg-slate-800 border border-sky-500 text-white text-xs font-mono w-36 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveWeapon(person.id)}
                            className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                            title="Save weapon"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingWeaponPersonId(null)}
                            className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300"
                            title="Cancel"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-1 group">
                          <span
                            className={`${
                              person.weaponIssued?.includes('Unassigned') ? 'text-slate-500 italic' : 'text-slate-200'
                            }`}
                          >
                            {person.weaponIssued}
                          </span>

                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                            {/* Exchange Weapon Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setSwapSourcePerson(person);
                                setSwapTargetPersonId('');
                                setShowWeaponSwapModal(true);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-sky-300 hover:bg-slate-800 transition"
                              title="Exchange weapon with another soldier"
                            >
                              <ArrowLeftRight className="w-3 h-3" />
                            </button>

                            {/* Edit Weapon Button */}
                            <button
                              type="button"
                              onClick={() => handleStartEditWeapon(person)}
                              className="p-1 rounded text-slate-400 hover:text-sky-300 hover:bg-slate-800 transition"
                              title="Edit weapon issued"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>

                            {/* Clear Weapon Button */}
                            {person.weaponIssued && !person.weaponIssued.includes('Unassigned') && (
                              <button
                                type="button"
                                onClick={() => handleClearWeapon(person)}
                                className="p-1 rounded text-rose-400 hover:text-white hover:bg-rose-600 transition"
                                title="Unassign weapon (Return to Armory)"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </td>

                    <td className="px-3 py-3 font-mono text-[11px]">
                      <span className="font-bold text-rose-400">{person.bloodGroup}</span>
                      <span className="text-slate-500"> • </span>
                      <span
                        className={
                          person.medicalCategory.includes('FE')
                            ? 'text-emerald-400'
                            : 'text-amber-400'
                        }
                      >
                        {person.medicalCategory.replace(' (Fit Forward)', '')}
                      </span>
                    </td>

                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {/* Quick State Toggle Selector */}
                        <select
                          value={person.status}
                          onChange={(e) =>
                            handleStatusChange(person, e.target.value as Personnel['status'])
                          }
                          className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200 text-[11px] outline-none"
                        >
                          <option value="Present">Present</option>
                          <option value="On Patrol">On Patrol</option>
                          <option value="Duty Post">Duty Post</option>
                          <option value="Leave / R&R">Leave</option>
                          <option value="Sick Bay / Hospital">Sick Bay</option>
                        </select>

                        {/* Edit Name Button */}
                        <button
                          type="button"
                          onClick={() => handleStartEditName(person)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-sky-300 border border-slate-700 transition"
                          title={`Edit name for ${person.name}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Soldier Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleDeletePerson(person.id);
                          }}
                          className="p-1 rounded bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 transition"
                          title={`Instantly erase ${person.name} from list`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Person Detailed Inspection Drawer */}
      {selectedPerson && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl text-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-sky-400" />
              <h3 className="font-bold text-white text-sm">
                DOSSIER: {selectedPerson.rank} {selectedPerson.name} ({selectedPerson.armyNo})
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSwapSourcePerson(selectedPerson);
                  setSwapTargetPersonId('');
                  setShowWeaponSwapModal(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-sky-500/10 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-500/30 text-xs font-semibold transition"
                title="Exchange weapon with another soldier"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Exchange Weapon</span>
              </button>

              <button
                type="button"
                onClick={() => handleDeletePerson(selectedPerson.id)}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 text-xs font-semibold transition"
                title="Instantly erase from list"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Erase Soldier</span>
              </button>

              <button
                onClick={() => setSelectedPerson(null)}
                className="text-slate-400 hover:text-white px-2 py-0.5 rounded"
              >
                ✕ Close
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
            <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 text-[10px] block">UN ID & APPOINTMENT</span>
              <span className="text-white font-bold block">{selectedPerson.unId}</span>
              <span className="text-sky-300 text-[11px]">{selectedPerson.role}</span>
            </div>

            <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 text-[10px] block">ASSIGNED WEAPON</span>
              <span className="text-white font-bold block truncate">{selectedPerson.weaponIssued}</span>
              <span className="text-sky-400 text-[10px]">Platoon: {selectedPerson.platoon}</span>
            </div>

            <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 text-[10px] block">NEXT OF KIN (EMERGENCY)</span>
              <span className="text-white font-bold block">{selectedPerson.nokName}</span>
              <span className="text-slate-300 text-[11px] flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-sky-400" /> {selectedPerson.nokPhone}
              </span>
            </div>

            <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 text-[10px] block">HEALTH STATUS (CAR)</span>
              <span className="text-white font-bold block">Blood: {selectedPerson.bloodGroup}</span>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
                <Heart className="w-3 h-3 text-rose-400" />
                Malaria: {selectedPerson.malariaProphylaxisTaken ? 'Compliant' : 'Missing Dose'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Add Personnel Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-xl border border-sky-500/40 bg-slate-900 p-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                ENROLL CONTINGENT PERSONNEL
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Army / Military Number *</label>
                  <input
                    type="text"
                    value={newArmyNo}
                    onChange={(e) => setNewArmyNo(e.target.value)}
                    placeholder="e.g. BA-8306 / No-1234567"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">UN Peacekeeper ID</label>
                  <input
                    type="text"
                    value={newUnId}
                    onChange={(e) => setNewUnId(e.target.value)}
                    placeholder="e.g. PKF-BGD-12345"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Mehedi Hasan"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Military Rank *</label>
                  <select
                    value={newRank}
                    onChange={(e) => setNewRank(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                  >
                    <option value="Major">Major (Maj)</option>
                    <option value="Captain">Captain (Capt)</option>
                    <option value="Lieutenant">Lieutenant (Lt)</option>
                    <option value="Senior Warrant Officer">Senior Warrant Officer (SWO)</option>
                    <option value="Warrant Officer">Warrant Officer (WO)</option>
                    <option value="Sergeant">Sergeant (Sgt)</option>
                    <option value="Corporal">Corporal (Cpl)</option>
                    <option value="Lance Corporal">Lance Corporal (L Cpl)</option>
                    <option value="Private">Private (Pvt)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Platoon</label>
                  <select
                    value={newPlatoon}
                    onChange={(e) => setNewPlatoon(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                  >
                    <option value="Coy HQ">Company HQ</option>
                    <option value="1 Platoon">1 Platoon</option>
                    <option value="2 Platoon">2 Platoon</option>
                    <option value="3 Platoon">3 Platoon</option>
                    <option value="Support Weapons Platoon">Support Weapons Platoon</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Appointment / Role</label>
                  <input
                    type="text"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="e.g. Rifleman / Mortar Crew"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Blood Group</label>
                  <select
                    value={newBloodGroup}
                    onChange={(e) => setNewBloodGroup(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-400 mb-1">Next of Kin Name & Relation</label>
                  <input
                    type="text"
                    value={newNokName}
                    onChange={(e) => setNewNokName(e.target.value)}
                    placeholder="e.g. Salma Khatun (Wife)"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Weapon Issued to Soldier</label>
                <input
                  type="text"
                  value={newWeaponIssued}
                  onChange={(e) => setNewWeaponIssued(e.target.value)}
                  placeholder="e.g. BD-08 Rifle (7.62mm) #88120"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                />
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
                  Enroll to Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Swap / Exchange Weapons Between Personnel Modal */}
      {showWeaponSwapModal && swapSourcePerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-sky-500/40 bg-slate-900 p-5 shadow-2xl text-slate-100 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  EXCHANGE WEAPONS BETWEEN PERSONNEL
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowWeaponSwapModal(false);
                  setSwapSourcePerson(null);
                }}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSwapWeaponsSubmit} className="mt-4 space-y-4">
              <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60 space-y-1">
                <span className="text-slate-400 text-[10px] block">CURRENT SOLDIER & WEAPON:</span>
                <div className="font-bold text-white text-sm">
                  {swapSourcePerson.rank} {swapSourcePerson.name} ({swapSourcePerson.armyNo})
                </div>
                <div className="font-mono text-sky-300 text-xs">
                  Weapon: {swapSourcePerson.weaponIssued}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Exchange Weapon With Soldier:
                </label>
                <select
                  value={swapTargetPersonId}
                  onChange={(e) => setSwapTargetPersonId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                  required
                >
                  <option value="">-- Choose soldier to swap weapons with --</option>
                  {personnel
                    .filter((p) => p.id !== swapSourcePerson.id)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.rank} {p.name} ({p.armyNo}) — Has: {p.weaponIssued}
                      </option>
                    ))}
                </select>
              </div>

              <div className="p-3 bg-sky-500/10 rounded-lg border border-sky-500/20 text-sky-200 text-[11px]">
                Upon confirmation, both soldiers will exchange weapons in the company records and synchronize instantaneously across all connected devices.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowWeaponSwapModal(false);
                    setSwapSourcePerson(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold"
                >
                  Confirm Weapon Exchange
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Military Daily Parade State Modal */}
      {showSitrepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-sky-500/40 bg-slate-900 p-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                DAILY PARADE STATE & STRENGTH RETURN (PART II)
              </h3>
              <button onClick={() => setShowSitrepModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="mt-3 space-y-3 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-400 font-mono">
                <span className="text-slate-300">Directly editable — click inside to edit or paste:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleUpdateTimestamp}
                    className="hover:text-sky-300 text-sky-400 flex items-center gap-1 transition text-[11px]"
                    title="Refresh to current device date and time"
                  >
                    <Clock className="w-3 h-3" />
                    <span>Update Time</span>
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={handleResetTemplate}
                    className="hover:text-slate-200 text-slate-400 flex items-center gap-1 transition text-[11px]"
                    title="Reset to default template"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              <pre
                ref={paradePreRef}
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => {
                  const text = e.currentTarget.innerText;
                  setParadeStateText(text);
                  parseAndApplyParadeText(text);
                }}
                onPaste={() => {
                  setTimeout(() => {
                    if (paradePreRef.current) {
                      const text = paradePreRef.current.innerText;
                      setParadeStateText(text);
                      parseAndApplyParadeText(text);
                    }
                  }, 50);
                }}
                className="p-3 bg-slate-950 rounded-lg border border-slate-700/80 font-mono text-[11px] text-slate-200 whitespace-pre-wrap max-h-72 overflow-y-auto focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 selection:bg-sky-600/40 cursor-text leading-relaxed"
              >
                {paradeStateText || getTemplateParadeText()}
              </pre>

              <div className="flex flex-wrap justify-between items-center gap-2 pt-2 border-t border-slate-800">
                <div className="text-[11px] text-slate-400 font-mono">
                  {copySuccessToast ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Copied to clipboard!
                    </span>
                  ) : (
                    <span>Location: BOUAR, CAR (Sector West)</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handlePasteFromClipboard}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                    title="Paste updated text from clipboard"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5 text-amber-400" />
                    <span>Paste Clipboard</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyToClipboard}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow transition active:scale-95"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copySuccessToast ? 'Copied!' : 'Copy to Clipboard'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSitrepModal(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
