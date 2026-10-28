import React, { useState, useMemo } from 'react';
import { WeaponItem, AmmunitionStock } from '../data/mockData';
import { Personnel } from '../utils/commandLogic';
import {
  Crosshair,
  Shield,
  Box,
  AlertTriangle,
  CheckCircle,
  Plus,
  Radio,
  Zap,
  ArrowLeftRight,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  UserPlus,
  UserCheck,
  Users,
  RotateCcw,
} from 'lucide-react';

export interface UNEquipmentItem {
  id: string;
  name: string;
  qtyTotal: number;
  issued: number;
  inArmory: number;
  condition: string;
  serials: string;
}

interface WeaponsModuleProps {
  weapons: WeaponItem[];
  ammunition: AmmunitionStock[];
  personnel?: Personnel[];
  onUpdateWeapon: (updated: WeaponItem) => void;
  onUpdateAmmunition: (updated: AmmunitionStock[]) => void;
  onAddWeapon: (newWeapon: WeaponItem) => void;
  onDeleteWeapon?: (id: string) => void;
  activeRole: string;
  canEdit?: boolean;
  isCommander?: boolean;
  isAuthorizedEditor?: boolean;
}

export const WeaponsModule: React.FC<WeaponsModuleProps> = ({
  weapons,
  ammunition,
  personnel = [],
  onUpdateWeapon,
  onUpdateAmmunition,
  onAddWeapon,
  onDeleteWeapon,
  activeRole,
  canEdit = true,
  isCommander = false,
  isAuthorizedEditor = false,
}) => {
  const [activeTab, setActiveTab] = useState<'weapons' | 'ammunition' | 'unEquipment'>('weapons');
  const [selectedWeapon, setSelectedWeapon] = useState<WeaponItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExpenditureModal, setShowExpenditureModal] = useState(false);
  const [showExchangeModal, setShowExchangeModal] = useState(false);

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatoonFilter, setSelectedPlatoonFilter] = useState('ALL');

  // Inline editing of assigned soldier
  const [editingWeaponId, setEditingWeaponId] = useState<string | null>(null);
  const [editingAssignedValue, setEditingAssignedValue] = useState('');

  // Full Weapon Editing modal state
  const [editingFullWeapon, setEditingFullWeapon] = useState<WeaponItem | null>(null);

  // Ammunition Registration State
  const [showAddAmmoModal, setShowAddAmmoModal] = useState(false);
  const [newAmmoCaliber, setNewAmmoCaliber] = useState('');
  const [newAmmoName, setNewAmmoName] = useState('');
  const [newAmmoFirstLine, setNewAmmoFirstLine] = useState<number>(500);
  const [newAmmoSecondLine, setNewAmmoSecondLine] = useState<number>(2500);
  const [newAmmoThreshold, setNewAmmoThreshold] = useState<number>(1000);
  const [newAmmoUnit, setNewAmmoUnit] = useState('rounds');

  // Ammunition Editing State
  const [editingAmmo, setEditingAmmo] = useState<AmmunitionStock | null>(null);
  const [editAmmoCaliber, setEditAmmoCaliber] = useState('');
  const [editAmmoName, setEditAmmoName] = useState('');
  const [editAmmoFirstLine, setEditAmmoFirstLine] = useState<number>(0);
  const [editAmmoSecondLine, setEditAmmoSecondLine] = useState<number>(0);
  const [editAmmoThreshold, setEditAmmoThreshold] = useState<number>(0);
  const [editAmmoUnit, setEditAmmoUnit] = useState('rounds');

  // Exchange / Reassignment Modal state
  const [exchangeSourceWeaponId, setExchangeSourceWeaponId] = useState<string>('');
  const [exchangeMode, setExchangeMode] = useState<'reassign' | 'swap' | 'clear'>('reassign');
  const [exchangeTargetPerson, setExchangeTargetPerson] = useState('');
  const [exchangeTargetWeaponId, setExchangeTargetWeaponId] = useState('');

  // Expenditure form
  const [expendCaliber, setExpendCaliber] = useState(ammunition[0]?.caliber || '');
  const [expendRounds, setExpendRounds] = useState(100);
  const [expendReason, setExpendReason] = useState('Sector MSR Security Escalation / Warning Shots');

  // Add weapon form
  const [newSerial, setNewSerial] = useState('');
  const [newType, setNewType] = useState<WeaponItem['type']>('BD-08 Rifle');
  const [newPlatoon, setNewPlatoon] = useState('1 Platoon');
  const [newAssigned, setNewAssigned] = useState('Armory Reserve');

  // UN Specialized Equipment State
  const [unEquipmentList, setUnEquipmentList] = useState<UNEquipmentItem[]>([
    { id: 'eq-1', name: 'Night Vision Goggles (PVS-14 Gen 3)', qtyTotal: 24, issued: 16, inArmory: 8, condition: '100% Operational', serials: 'PVS-CAR-01 to 24' },
    { id: 'eq-2', name: 'Thermal Imaging Weapon Sights', qtyTotal: 4, issued: 2, inArmory: 2, condition: 'Calibrated & Zeroed', serials: 'THM-CAR-101 to 104' },
    { id: 'eq-3', name: 'Barrett 2050 HF Tactical Radios', qtyTotal: 6, issued: 4, inArmory: 2, condition: 'Secure Link Verified', serials: 'BRT-HF-8801 to 8806' },
    { id: 'eq-4', name: 'Motorola DP4801e VHF Handhelds', qtyTotal: 36, issued: 28, inArmory: 8, condition: 'All Channels Loaded', serials: 'MOT-VHF-01 to 36' },
    { id: 'eq-5', name: 'Level IV Ballistic Plates & UN Helmets', qtyTotal: 125, issued: 125, inArmory: 0, condition: 'Issued to All Men', serials: 'Full Contingent Sets' },
    { id: 'eq-6', name: 'Vallon Mine & IED Detectors (VMR3)', qtyTotal: 4, issued: 2, inArmory: 2, condition: 'Field Tested', serials: 'VLN-01 to 04' },
  ]);
  const [editingEquipment, setEditingEquipment] = useState<UNEquipmentItem | null>(null);
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false);
  const [newEqName, setNewEqName] = useState('');
  const [newEqTotal, setNewEqTotal] = useState(10);
  const [newEqIssued, setNewEqIssued] = useState(5);
  const [newEqInArmory, setNewEqInArmory] = useState(5);
  const [newEqCondition, setNewEqCondition] = useState('Serviceable');
  const [newEqSerials, setNewEqSerials] = useState('CAR-EQ-01 to 10');

  // Filtered weapons list
  const filteredWeapons = useMemo(() => {
    return weapons.filter((w) => {
      const matchesSearch =
        searchQuery === '' ||
        w.serialNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.platoon.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPlatoon =
        selectedPlatoonFilter === 'ALL' ||
        (selectedPlatoonFilter === 'Support Weapons Platoon'
          ? w.platoon === 'Support Weapons Platoon' || w.platoon === 'Cbt Support Pl'
          : w.platoon === selectedPlatoonFilter);

      return matchesSearch && matchesPlatoon;
    });
  }, [weapons, searchQuery, selectedPlatoonFilter]);

  const handleStatusChange = (weapon: WeaponItem, newStatus: WeaponItem['status']) => {
    const updated: WeaponItem = { ...weapon, status: newStatus };
    onUpdateWeapon(updated);
    if (selectedWeapon?.id === weapon.id) setSelectedWeapon(updated);
  };

  // Erase / Clear assigned soldier name (Return weapon to armory)
  const handleClearAssignedSoldier = (weapon: WeaponItem) => {
    const updated: WeaponItem = {
      ...weapon,
      assignedTo: 'Armory Reserve',
      status: 'In Armory',
    };
    onUpdateWeapon(updated);
    if (selectedWeapon?.id === weapon.id) setSelectedWeapon(updated);
  };

  // Start inline editing of assigned soldier
  const handleStartEditAssigned = (weapon: WeaponItem) => {
    setEditingWeaponId(weapon.id);
    setEditingAssignedValue(weapon.assignedTo === 'Armory Reserve' ? '' : weapon.assignedTo);
  };

  // Save inline editing of assigned soldier
  const handleSaveAssigned = (weaponId: string) => {
    const w = weapons.find((item) => item.id === weaponId);
    if (w) {
      const val = editingAssignedValue.trim();
      const updated: WeaponItem = {
        ...w,
        assignedTo: val || 'Armory Reserve',
        status: val ? (w.status === 'In Armory' ? 'Issued on Patrol' : w.status) : 'In Armory',
      };
      onUpdateWeapon(updated);
      if (selectedWeapon?.id === weaponId) setSelectedWeapon(updated);
    }
    setEditingWeaponId(null);
  };

  // Delete weapon
  const handleDeleteWeapon = (weaponId: string) => {
    if (onDeleteWeapon) {
      onDeleteWeapon(weaponId);
    }
    if (selectedWeapon?.id === weaponId) {
      setSelectedWeapon(null);
    }
  };

  // Open exchange modal for a specific weapon
  const handleOpenExchangeModal = (weapon: WeaponItem) => {
    setExchangeSourceWeaponId(weapon.id);
    setExchangeMode('reassign');
    setExchangeTargetPerson('');
    setExchangeTargetWeaponId('');
    setShowExchangeModal(true);
  };

  // Execute exchange or reassignment
  const handleExecuteExchange = (e: React.FormEvent) => {
    e.preventDefault();
    const sourceWeapon = weapons.find((w) => w.id === exchangeSourceWeaponId);
    if (!sourceWeapon) return;

    if (exchangeMode === 'swap') {
      const targetWeapon = weapons.find((w) => w.id === exchangeTargetWeaponId);
      if (targetWeapon) {
        // Swap assigned soldiers
        const updatedSource: WeaponItem = {
          ...sourceWeapon,
          assignedTo: targetWeapon.assignedTo,
        };
        const updatedTarget: WeaponItem = {
          ...targetWeapon,
          assignedTo: sourceWeapon.assignedTo,
        };
        onUpdateWeapon(updatedSource);
        onUpdateWeapon(updatedTarget);
      }
    } else if (exchangeMode === 'reassign') {
      const targetName = exchangeTargetPerson.trim();
      if (targetName) {
        const updatedSource: WeaponItem = {
          ...sourceWeapon,
          assignedTo: targetName,
          status: sourceWeapon.status === 'In Armory' ? 'Issued on Patrol' : sourceWeapon.status,
        };
        onUpdateWeapon(updatedSource);
      }
    } else if (exchangeMode === 'clear') {
      handleClearAssignedSoldier(sourceWeapon);
    }

    setShowExchangeModal(false);
    setExchangeSourceWeaponId('');
    setExchangeTargetPerson('');
    setExchangeTargetWeaponId('');
  };

  const handleExpendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = ammunition.map((ammo) => {
      if (ammo.caliber === expendCaliber) {
        const deducted = Math.max(0, ammo.firstLineRounds - Number(expendRounds));
        return {
          ...ammo,
          firstLineRounds: deducted,
          totalRounds: deducted + ammo.secondLineReserve,
        };
      }
      return ammo;
    });

    onUpdateAmmunition(updated);
    setShowExpenditureModal(false);
  };

  const handleAddWeaponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSerial.trim()) return;

    const newWpn: WeaponItem = {
      id: `w-${Date.now()}`,
      serialNo: newSerial.trim().toUpperCase(),
      type: newType,
      platoon: newPlatoon,
      assignedTo: newAssigned.trim() || 'Armory Reserve',
      status: newAssigned.trim() && newAssigned !== 'Armory Reserve' ? 'Issued on Patrol' : 'In Armory',
      condition: 'Serviceable',
      lastCleanedDate: new Date().toISOString().substring(0, 10),
      zeroed: true,
    };

    onAddWeapon(newWpn);
    setShowAddModal(false);
    setNewSerial('');
    setNewAssigned('Armory Reserve');
  };

  // Register New Ammunition Stock
  const handleSaveNewAmmo = (e: React.FormEvent) => {
    e.preventDefault();
    const caliber = newAmmoCaliber.trim();
    if (!caliber) return;

    const firstLine = Number(newAmmoFirstLine) || 0;
    const secondLine = Number(newAmmoSecondLine) || 0;
    const total = firstLine + secondLine;

    const newStock: AmmunitionStock = {
      caliber,
      name: newAmmoName.trim() || caliber,
      firstLineRounds: firstLine,
      secondLineReserve: secondLine,
      totalRounds: total,
      criticalThreshold: Number(newAmmoThreshold) || 500,
      unit: newAmmoUnit.trim() || 'rounds',
    };

    const exists = ammunition.some((a) => a.caliber.toLowerCase() === caliber.toLowerCase());
    const updated = exists
      ? ammunition.map((a) => (a.caliber.toLowerCase() === caliber.toLowerCase() ? newStock : a))
      : [...ammunition, newStock];

    onUpdateAmmunition(updated);
    setShowAddAmmoModal(false);
  };

  // Start editing existing ammunition stock
  const handleStartEditAmmo = (ammo: AmmunitionStock) => {
    setEditingAmmo(ammo);
    setEditAmmoCaliber(ammo.caliber);
    setEditAmmoName(ammo.name);
    setEditAmmoFirstLine(ammo.firstLineRounds);
    setEditAmmoSecondLine(ammo.secondLineReserve);
    setEditAmmoThreshold(ammo.criticalThreshold);
    setEditAmmoUnit(ammo.unit);
  };

  // Save edited ammunition stock
  const handleSaveEditAmmo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAmmo) return;

    const firstLine = Number(editAmmoFirstLine) || 0;
    const secondLine = Number(editAmmoSecondLine) || 0;
    const total = firstLine + secondLine;

    const updated = ammunition.map((a) => {
      if (a.caliber === editingAmmo.caliber) {
        return {
          ...a,
          caliber: editAmmoCaliber.trim() || a.caliber,
          name: editAmmoName.trim() || a.name,
          firstLineRounds: firstLine,
          secondLineReserve: secondLine,
          totalRounds: total,
          criticalThreshold: Number(editAmmoThreshold) || 100,
          unit: editAmmoUnit.trim() || a.unit,
        };
      }
      return a;
    });

    onUpdateAmmunition(updated);
    setEditingAmmo(null);
  };

  // Delete ammunition stock
  const handleDeleteAmmo = (caliberToDelete: string) => {
    const updated = ammunition.filter((a) => a.caliber !== caliberToDelete);
    onUpdateAmmunition(updated);
    if (editingAmmo?.caliber === caliberToDelete) {
      setEditingAmmo(null);
    }
  };

  // Quick adjust ammunition counts
  const handleQuickAdjustAmmo = (caliber: string, line: 'first' | 'second', delta: number) => {
    const updated = ammunition.map((a) => {
      if (a.caliber === caliber) {
        const newFirst = line === 'first' ? Math.max(0, a.firstLineRounds + delta) : a.firstLineRounds;
        const newSecond = line === 'second' ? Math.max(0, a.secondLineReserve + delta) : a.secondLineReserve;
        return {
          ...a,
          firstLineRounds: newFirst,
          secondLineReserve: newSecond,
          totalRounds: newFirst + newSecond,
        };
      }
      return a;
    });
    onUpdateAmmunition(updated);
  };

  // Full Weapon Editing Handlers
  const handleStartEditFullWeapon = (weapon: WeaponItem) => {
    setEditingFullWeapon({ ...weapon });
  };

  const handleSaveFullWeapon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFullWeapon) return;
    onUpdateWeapon(editingFullWeapon);
    if (selectedWeapon?.id === editingFullWeapon.id) {
      setSelectedWeapon(editingFullWeapon);
    }
    setEditingFullWeapon(null);
  };

  // UN Equipment Handlers
  const handleSaveEditEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEquipment) return;
    setUnEquipmentList((prev) =>
      prev.map((eq) => (eq.id === editingEquipment.id ? editingEquipment : eq))
    );
    setEditingEquipment(null);
  };

  const handleDeleteEquipment = (id: string) => {
    setUnEquipmentList((prev) => prev.filter((eq) => eq.id !== id));
    if (editingEquipment?.id === id) {
      setEditingEquipment(null);
    }
  };

  const handleSaveNewEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEqName.trim()) return;
    const newEq: UNEquipmentItem = {
      id: `eq-${Date.now()}`,
      name: newEqName.trim(),
      qtyTotal: Number(newEqTotal) || 0,
      issued: Number(newEqIssued) || 0,
      inArmory: Number(newEqInArmory) || 0,
      condition: newEqCondition.trim() || 'Serviceable',
      serials: newEqSerials.trim() || 'N/A',
    };
    setUnEquipmentList((prev) => [...prev, newEq]);
    setShowAddEquipmentModal(false);
    setNewEqName('');
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-lg">
              <Crosshair className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                WEAPONS, AMMUNITION & EQUIPMENT STATE
              </h2>
              <p className="text-xs text-slate-400">
                Armory security custody, 1st & 2nd line combat reserves, and soldier weapon assignments
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Exchange Weapon Button */}
            <button
              onClick={() => {
                setExchangeSourceWeaponId(weapons[0]?.id || '');
                setShowExchangeModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-xs font-semibold border border-sky-500/40 transition"
              title="Exchange weapons between soldiers or reassign"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-sky-400" />
              <span>Exchange / Reassign Weapon</span>
            </button>

            {/* Log Ammunition Fired Button */}
            <button
              onClick={() => setShowExpenditureModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Log Ammunition Fired</span>
            </button>

            {/* + Register Ammo Button */}
            <button
              onClick={() => {
                setNewAmmoCaliber('');
                setNewAmmoName('');
                setNewAmmoFirstLine(500);
                setNewAmmoSecondLine(2500);
                setNewAmmoThreshold(1000);
                setNewAmmoUnit('rounds');
                setShowAddAmmoModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition active:scale-95 border border-emerald-500/40"
              title="Register new ammunition stock & caliber"
            >
              <Plus className="w-4 h-4" />
              <span>+ Register Ammo</span>
            </button>

            {/* Register Weapon Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Register Weapon</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 pt-4 text-xs font-mono">
          <button
            onClick={() => setActiveTab('weapons')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition ${
              activeTab === 'weapons'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            SMALL ARMS & HEAVY WEAPONS ({weapons.length})
          </button>
          <button
            onClick={() => setActiveTab('ammunition')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition ${
              activeTab === 'ammunition'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            AMMUNITION STOCK RESERVE ({ammunition.length} CALIBERS)
          </button>
          <button
            onClick={() => setActiveTab('unEquipment')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition ${
              activeTab === 'unEquipment'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            UN SPECIALIZED KIT (NVDs/VHF/MINE)
          </button>
        </div>
      </div>

      {/* WEAPONS TAB */}
      {activeTab === 'weapons' && (
        <div className="space-y-3">
          {/* Search & Platoon Filtering Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search serial number, soldier name, weapon type, platoon..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:border-sky-500 outline-none"
              />
            </div>

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
                  onClick={() => setSelectedPlatoonFilter(tab.key)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium whitespace-nowrap transition ${
                    selectedPlatoonFilter === tab.key
                      ? 'bg-sky-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Weapons Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-3 py-3">Serial Number</th>
                    <th className="px-3 py-3">Weapon Type</th>
                    <th className="px-3 py-3">Assigned Soldier / Post</th>
                    <th className="px-3 py-3">Platoon</th>
                    <th className="px-3 py-3">Custody Status</th>
                    <th className="px-3 py-3">Condition & Zero</th>
                    <th className="px-3 py-3 text-right">Armory & Delete Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-sans">
                  {filteredWeapons.map((w) => {
                    const isSelected = selectedWeapon?.id === w.id;
                    const isArmoryReserve = !w.assignedTo || w.assignedTo === 'Armory Reserve' || w.assignedTo === 'In Armory';

                    return (
                      <tr
                        key={w.id}
                        onClick={() => setSelectedWeapon(w)}
                        className={`cursor-pointer transition hover:bg-slate-800/50 ${
                          isSelected ? 'bg-sky-500/10' : ''
                        }`}
                      >
                        <td className="px-3 py-3 font-mono font-bold text-white">
                          <div>{w.serialNo}</div>
                          <div className="text-[10px] text-slate-400 font-normal">Zero: {w.zeroed ? '300m OK' : 'Pending'}</div>
                        </td>

                        <td className="px-3 py-3 text-slate-200">
                          <div className="font-semibold">{w.type}</div>
                          <div className="text-[10px] text-slate-400">Cleaned: {w.lastCleanedDate}</div>
                        </td>

                        {/* Assigned Soldier / Post Column with Delete & Exchange options */}
                        <td className="px-3 py-3">
                          {editingWeaponId === w.id ? (
                            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                value={editingAssignedValue}
                                onChange={(e) => setEditingAssignedValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveAssigned(w.id);
                                  if (e.key === 'Escape') setEditingWeaponId(null);
                                }}
                                autoFocus
                                placeholder="Enter soldier name..."
                                className="px-2 py-1 rounded bg-slate-800 border border-sky-500 text-white text-xs font-bold focus:outline-none w-44"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveAssigned(w.id)}
                                className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                                title="Save Soldier Name"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingWeaponId(null)}
                                className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300"
                                title="Cancel"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-2 group">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className={`font-medium ${
                                    isArmoryReserve ? 'text-slate-400 italic' : 'text-slate-100 font-bold'
                                  }`}
                                >
                                  {w.assignedTo}
                                </span>

                                {!isArmoryReserve && (
                                  /* Delete / Erase soldier name option */
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      handleClearAssignedSoldier(w);
                                    }}
                                    className="p-1 rounded text-rose-400 hover:text-white hover:bg-rose-600 transition"
                                    title={`Erase / Delete soldier assignment for ${w.serialNo} (Return to Armory)`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>

                              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                {/* Exchange / Reassign Weapon Button */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenExchangeModal(w)}
                                  className="p-1 rounded bg-slate-800 hover:bg-sky-600 text-slate-300 hover:text-white border border-slate-700 transition"
                                  title="Exchange or reassign weapon to another soldier"
                                >
                                  <ArrowLeftRight className="w-3 h-3" />
                                </button>

                                {/* Edit Assigned Soldier Name Button */}
                                <button
                                  type="button"
                                  onClick={() => handleStartEditAssigned(w)}
                                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-sky-300 border border-slate-700 transition"
                                  title="Edit soldier name"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          )}
                        </td>

                        <td className="px-3 py-3 text-slate-300 font-mono text-[11px]">{w.platoon}</td>

                        <td className="px-3 py-3 font-mono">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              w.status === 'In Armory'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : w.status === 'Issued on Patrol'
                                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                : w.status === 'Camp Defense Post'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {w.status}
                          </span>
                        </td>

                        <td className="px-3 py-3 font-mono text-[11px]">
                          <span className="text-emerald-400">{w.condition}</span>
                          {w.zeroed && <span className="text-slate-500"> • 300m Zeroed</span>}
                        </td>

                        {/* Actions column: Status toggle + Edit + Delete Weapon options */}
                        <td className="px-3 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={w.status}
                              onChange={(e) =>
                                handleStatusChange(w, e.target.value as WeaponItem['status'])
                              }
                              className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200 text-[11px] outline-none"
                            >
                              <option value="In Armory">In Armory</option>
                              <option value="Issued on Patrol">Issue to Patrol</option>
                              <option value="Camp Defense Post">Camp Defense</option>
                              <option value="In Maintenance">Maintenance</option>
                            </select>

                            {/* Full Edit Weapon button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleStartEditFullWeapon(w);
                              }}
                              className="p-1 rounded bg-sky-500/10 hover:bg-sky-600 text-sky-400 hover:text-white border border-sky-500/30 transition"
                              title={`Edit complete specifications and assignment for ${w.serialNo}`}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Weapon button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleDeleteWeapon(w.id);
                              }}
                              className="p-1 rounded bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 transition"
                              title={`Delete weapon ${w.serialNo} from inventory`}
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

          {/* Selected Weapon Dossier Drawer */}
          {selectedWeapon && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Crosshair className="w-4 h-4 text-sky-400" />
                  <h3 className="font-bold text-white text-sm">
                    WEAPON DOSSIER: {selectedWeapon.type} ({selectedWeapon.serialNo})
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenExchangeModal(selectedWeapon)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-sky-500/10 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-500/30 text-xs font-semibold transition"
                    title="Exchange weapon with another soldier"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    <span>Exchange Weapon</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleClearAssignedSoldier(selectedWeapon)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/30 text-xs font-semibold transition"
                    title="Erase soldier name"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Return to Armory</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteWeapon(selectedWeapon.id)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 text-xs font-semibold transition"
                    title="Delete weapon"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Weapon</span>
                  </button>

                  <button
                    onClick={() => setSelectedWeapon(null)}
                    className="text-slate-400 hover:text-white px-2 py-0.5 rounded"
                  >
                    ✕ Close
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
                <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
                  <span className="text-slate-400 text-[10px] block">CURRENT ASSIGNED SOLDIER</span>
                  <span className="text-white font-bold block">{selectedWeapon.assignedTo}</span>
                  <span className="text-sky-300 text-[11px]">{selectedWeapon.platoon}</span>
                </div>

                <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
                  <span className="text-slate-400 text-[10px] block">CUSTODY STATUS</span>
                  <span className="text-white font-bold block">{selectedWeapon.status}</span>
                  <span className="text-emerald-400 text-[11px]">{selectedWeapon.condition}</span>
                </div>

                <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
                  <span className="text-slate-400 text-[10px] block">MAINTENANCE / ZEROING</span>
                  <span className="text-white font-bold block">{selectedWeapon.zeroed ? 'Zeroed at 300m' : 'Zeroing Due'}</span>
                  <span className="text-slate-300 text-[11px]">Last Cleaned: {selectedWeapon.lastCleanedDate}</span>
                </div>

                <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
                  <span className="text-slate-400 text-[10px] block">STANDARD AMMUNITION</span>
                  <span className="text-sky-300 font-bold block">
                    {selectedWeapon.type.includes('BD-08')
                      ? '7.62x39mm (120 rds 1st line)'
                      : selectedWeapon.type.includes('PKM')
                      ? '7.62x54R (600 rds belts)'
                      : selectedWeapon.type.includes('RPG-7')
                      ? 'PG-7V Heat Rockets'
                      : 'Standard Issue UN'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* AMMUNITION TAB */}
      {activeTab === 'ammunition' && (
        <div className="space-y-3">
          {/* Ammunition Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs">
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white font-mono uppercase tracking-wide">
                Ammunition Stocks & Combat Reserve State ({ammunition.length} Calibers)
              </span>
            </div>
            <button
              onClick={() => {
                setNewAmmoCaliber('');
                setNewAmmoName('');
                setNewAmmoFirstLine(500);
                setNewAmmoSecondLine(2500);
                setNewAmmoThreshold(1000);
                setNewAmmoUnit('rounds');
                setShowAddAmmoModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Register Ammo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ammunition.map((ammo) => {
              const isCritical = ammo.totalRounds <= ammo.criticalThreshold;
              const percentOfThreshold = Math.min(100, Math.round((ammo.totalRounds / (ammo.criticalThreshold * 3)) * 100));

              return (
                <div
                  key={ammo.caliber}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 shadow-lg flex flex-col justify-between space-y-3 transition"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-sm font-mono truncate">{ammo.caliber}</h3>
                        <p className="text-xs text-slate-400 truncate">{ammo.name}</p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Edit Button for Ammo Card */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEditAmmo(ammo);
                          }}
                          className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-sky-500/10 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-500/30 transition shadow-sm"
                          title={`Edit ${ammo.caliber} stock reserves & thresholds`}
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>

                        {isCritical ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                            LOW
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                            AMPLE
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stock Bar */}
                    <div className="mt-3 space-y-1 font-mono text-xs">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Total Reserve:</span>
                        <span className="font-bold text-white">
                          {ammo.totalRounds.toLocaleString()} {ammo.unit}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${isCritical ? 'bg-rose-500' : 'bg-sky-500'}`}
                          style={{ width: `${percentOfThreshold}%` }}
                        />
                      </div>
                    </div>

                    {/* Editable breakdown with Quick Adjustment Controls */}
                    <div className="grid grid-cols-2 gap-2 mt-3 text-xs font-mono">
                      <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-[10px]">1ST LINE (POUCHES)</span>
                          </div>
                          <span className="font-bold text-sky-300 text-sm block mt-0.5">
                            {ammo.firstLineRounds.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-2 pt-1 border-t border-slate-700/50">
                          <button
                            type="button"
                            onClick={() => handleQuickAdjustAmmo(ammo.caliber, 'first', -50)}
                            className="px-1.5 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-[10px] font-bold"
                            title="Deduct 50 rounds"
                          >
                            -50
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAdjustAmmo(ammo.caliber, 'first', 50)}
                            className="px-1.5 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-[10px] font-bold"
                            title="Add 50 rounds"
                          >
                            +50
                          </button>
                        </div>
                      </div>

                      <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-[10px]">2ND LINE (BUNKER)</span>
                          </div>
                          <span className="font-bold text-emerald-400 text-sm block mt-0.5">
                            {ammo.secondLineReserve.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-2 pt-1 border-t border-slate-700/50">
                          <button
                            type="button"
                            onClick={() => handleQuickAdjustAmmo(ammo.caliber, 'second', -100)}
                            className="px-1.5 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-[10px] font-bold"
                            title="Deduct 100 rounds from bunker reserve"
                          >
                            -100
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAdjustAmmo(ammo.caliber, 'second', 100)}
                            className="px-1.5 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-[10px] font-bold"
                            title="Add 100 rounds to bunker reserve"
                          >
                            +100
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer actions for Ammo card */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
                    <span className="text-[10px] text-slate-400">
                      Safety Min: <strong className="text-slate-200">{ammo.criticalThreshold.toLocaleString()}</strong> {ammo.unit}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStartEditAmmo(ammo)}
                        className="text-sky-400 hover:text-sky-300 text-[11px] font-semibold flex items-center gap-0.5"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit Stock</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAmmo(ammo.caliber)}
                        className="p-1 rounded text-rose-400 hover:text-white hover:bg-rose-600 transition"
                        title={`Delete ${ammo.caliber}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* UN SPECIALIZED EQUIPMENT TAB */}
      {activeTab === 'unEquipment' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs">
            <span className="font-mono text-slate-300 font-bold">
              UN CONTINGENT SPECIALIZED EQUIPMENT & OPTICS ({unEquipmentList.length} CATEGORIES)
            </span>
            <button
              onClick={() => {
                setNewEqName('');
                setNewEqTotal(10);
                setNewEqIssued(5);
                setNewEqInArmory(5);
                setNewEqCondition('100% Serviceable');
                setNewEqSerials('CAR-EQ-01 to 10');
                setShowAddEquipmentModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold transition active:scale-95 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Register Equipment</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unEquipmentList.map((eq) => (
              <div
                key={eq.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 shadow-lg space-y-2 text-xs flex flex-col justify-between transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-white text-sm flex-1">{eq.name}</h4>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingEquipment(eq)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-sky-500/10 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-500/30 transition shadow-sm"
                        title="Edit equipment item"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold">
                        {eq.qtyTotal} Total
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 font-mono pt-2">
                    <div className="bg-slate-800/70 p-2 rounded-lg border border-slate-700/60">
                      <span className="text-slate-400 text-[10px] block">ISSUED PATROLS</span>
                      <span className="font-bold text-sky-300 text-sm">{eq.issued} Units</span>
                    </div>
                    <div className="bg-slate-800/70 p-2 rounded-lg border border-slate-700/60">
                      <span className="text-slate-400 text-[10px] block">IN ARMORY</span>
                      <span className="font-bold text-emerald-400 text-sm">{eq.inArmory} Units</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-300 font-mono mt-2">
                    Condition: <span className="text-emerald-400 font-bold">{eq.condition}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                    Serials: {eq.serials}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingEquipment(eq)}
                    className="text-sky-400 hover:text-sky-300 text-[11px] font-semibold flex items-center gap-0.5"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit Equipment</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteEquipment(eq.id)}
                    className="p-1 rounded text-rose-400 hover:text-white hover:bg-rose-600 transition"
                    title={`Delete ${eq.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exchange / Reassign Weapon Modal */}
      {showExchangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-sky-500/40 bg-slate-900 p-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  EXCHANGE / REASSIGN WEAPON BETWEEN SOLDIERS
                </h3>
              </div>
              <button
                onClick={() => setShowExchangeModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteExchange} className="mt-4 space-y-4 text-xs">
              {/* Select Source Weapon */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  1. Select Weapon to Exchange / Reassign:
                </label>
                <select
                  value={exchangeSourceWeaponId}
                  onChange={(e) => setExchangeSourceWeaponId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                  required
                >
                  <option value="">-- Choose Weapon --</option>
                  {weapons.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.serialNo} ({w.type}) — Assigned to: {w.assignedTo} [{w.platoon}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Type */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  2. Choose Operation:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setExchangeMode('reassign')}
                    className={`p-2 rounded-lg border text-left text-xs transition ${
                      exchangeMode === 'reassign'
                        ? 'bg-sky-600/30 border-sky-500 text-white font-bold'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1">
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Reassign</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">To new / existing soldier</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExchangeMode('swap')}
                    className={`p-2 rounded-lg border text-left text-xs transition ${
                      exchangeMode === 'swap'
                        ? 'bg-sky-600/30 border-sky-500 text-white font-bold'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1">
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      <span>Swap 2 Weapons</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Exchange between 2 men</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExchangeMode('clear')}
                    className={`p-2 rounded-lg border text-left text-xs transition ${
                      exchangeMode === 'clear'
                        ? 'bg-rose-600/30 border-rose-500 text-white font-bold'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1">
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Erase Name</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Return to Armory</div>
                  </button>
                </div>
              </div>

              {/* Mode-specific Fields */}
              {exchangeMode === 'reassign' && (
                <div className="space-y-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/60">
                  <div>
                    <label className="block text-slate-300 mb-1">
                      Select Incoming / Existing Soldier from Roster:
                    </label>
                    <select
                      value={exchangeTargetPerson}
                      onChange={(e) => setExchangeTargetPerson(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                    >
                      <option value="">-- Choose soldier from company roster --</option>
                      {personnel.map((p) => (
                        <option key={p.id} value={`${p.rank} ${p.name} (${p.armyNo})`}>
                          {p.rank} {p.name} ({p.armyNo}) — {p.platoon} ({p.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">
                      Or type replacement soldier name directly:
                    </label>
                    <input
                      type="text"
                      value={exchangeTargetPerson}
                      onChange={(e) => setExchangeTargetPerson(e.target.value)}
                      placeholder="e.g. Soldier Kabir / Pte Alim"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                    />
                  </div>
                </div>
              )}

              {exchangeMode === 'swap' && (
                <div className="space-y-2 p-3 bg-slate-800/50 rounded-lg border border-slate-700/60">
                  <label className="block text-slate-300 font-medium mb-1">
                    Select Second Weapon to Swap With:
                  </label>
                  <select
                    value={exchangeTargetWeaponId}
                    onChange={(e) => setExchangeTargetWeaponId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                    required
                  >
                    <option value="">-- Choose Target Weapon --</option>
                    {weapons
                      .filter((w) => w.id !== exchangeSourceWeaponId)
                      .map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.serialNo} ({w.type}) — Currently held by: {w.assignedTo} [{w.platoon}]
                        </option>
                      ))}
                  </select>
                  <p className="text-[11px] text-sky-400/90 pt-1">
                    * The assigned soldiers for both weapons will be swapped instantaneously across all company devices.
                  </p>
                </div>
              )}

              {exchangeMode === 'clear' && (
                <div className="p-3 bg-rose-500/10 rounded-lg border border-rose-500/30 text-rose-300">
                  <p className="font-bold">Erase Previous Soldier's Name:</p>
                  <p className="text-[11px] mt-1 text-slate-300">
                    This will clear the previous soldier name, delete the personal assignment, and return this weapon to Armory Reserve with status "In Armory".
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowExchangeModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold"
                >
                  {exchangeMode === 'swap'
                    ? 'Confirm Weapon Swap'
                    : exchangeMode === 'reassign'
                    ? 'Reassign to Soldier'
                    : 'Confirm Erase & Return'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Fired Ammunition Modal */}
      {showExpenditureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-amber-500/40 bg-slate-900 p-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                RECORD AMMUNITION FIRING / EXPENDITURE
              </h3>
              <button onClick={() => setShowExpenditureModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleExpendSubmit} className="mt-3 space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Ammunition Caliber *</label>
                <select
                  value={expendCaliber}
                  onChange={(e) => setExpendCaliber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-amber-500 outline-none"
                >
                  {ammunition.map((a) => (
                    <option key={a.caliber} value={a.caliber}>
                      {a.caliber} ({a.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Rounds Expended *</label>
                <input
                  type="number"
                  value={expendRounds}
                  onChange={(e) => setExpendRounds(Number(e.target.value))}
                  min={1}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Operational Reason / Incident Reference *</label>
                <input
                  type="text"
                  value={expendReason}
                  onChange={(e) => setExpendReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowExpenditureModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold"
                >
                  Confirm & Deduct Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Weapon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-sky-500/40 bg-slate-900 p-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                REGISTER WEAPON TO ARMORY
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddWeaponSubmit} className="mt-3 space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Butt / Serial Number *</label>
                <input
                  type="text"
                  value={newSerial}
                  onChange={(e) => setNewSerial(e.target.value)}
                  placeholder="e.g. BD08-88150"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Weapon Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                >
                  <option value="BD-08 Rifle">BD-08 Assault Rifle (7.62x39mm)</option>
                  <option value="PKM LMG">PKM Light Machine Gun (7.62x54R)</option>
                  <option value="RPG-7 Launcher">RPG-7 Anti-Tank Rocket Launcher</option>
                  <option value="60mm Mortar">60mm Commando Mortar</option>
                  <option value="81mm Mortar">81mm Long Range Mortar</option>
                  <option value="12.7mm HMG">12.7mm Heavy Machine Gun</option>
                  <option value="9mm Pistol">9mm Browning Pistol</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Platoon</label>
                  <select
                    value={newPlatoon}
                    onChange={(e) => setNewPlatoon(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                  >
                    <option value="Coy HQ">Company HQ</option>
                    <option value="1 Platoon">1 Platoon</option>
                    <option value="2 Platoon">2 Platoon</option>
                    <option value="3 Platoon">3 Platoon</option>
                    <option value="Support Weapons Platoon">Cbt Support Pl</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Assigned Soldier</label>
                  <input
                    type="text"
                    value={newAssigned}
                    onChange={(e) => setNewAssigned(e.target.value)}
                    placeholder="e.g. Soldier Kabir / Armory Reserve"
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
                  Save to Armory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register New Ammunition Stock Modal (+ Register Ammo) */}
      {showAddAmmoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-emerald-500/50 bg-slate-900 p-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  REGISTER NEW AMMUNITION CALIBER & STOCK
                </h3>
              </div>
              <button onClick={() => setShowAddAmmoModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewAmmo} className="mt-3 space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Caliber Designation *</label>
                <input
                  type="text"
                  value={newAmmoCaliber}
                  onChange={(e) => setNewAmmoCaliber(e.target.value)}
                  placeholder="e.g. 14.5x114mm API / 81mm Mortar / 7.62x54R"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Ammunition Description / Weapon System</label>
                <input
                  type="text"
                  value={newAmmoName}
                  onChange={(e) => setNewAmmoName(e.target.value)}
                  placeholder="e.g. BTR-70 Armored Vehicle Heavy Machine Gun"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <label className="block text-slate-400 mb-1">1st Line (Pouches / Ready)</label>
                  <input
                    type="number"
                    value={newAmmoFirstLine}
                    onChange={(e) => setNewAmmoFirstLine(Number(e.target.value))}
                    min={0}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-emerald-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">2nd Line (Armory Bunker)</label>
                  <input
                    type="number"
                    value={newAmmoSecondLine}
                    onChange={(e) => setNewAmmoSecondLine(Number(e.target.value))}
                    min={0}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-emerald-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <label className="block text-slate-400 mb-1">Critical Safety Min</label>
                  <input
                    type="number"
                    value={newAmmoThreshold}
                    onChange={(e) => setNewAmmoThreshold(Number(e.target.value))}
                    min={1}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-emerald-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Unit of Measure</label>
                  <select
                    value={newAmmoUnit}
                    onChange={(e) => setNewAmmoUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-emerald-500 outline-none"
                  >
                    <option value="rounds">rounds</option>
                    <option value="belts">belts</option>
                    <option value="bombs">bombs</option>
                    <option value="rockets">rockets</option>
                    <option value="canisters">canisters</option>
                  </select>
                </div>
              </div>

              <div className="p-2.5 bg-slate-800/60 rounded-lg text-slate-300 font-mono text-[11px] flex justify-between">
                <span>Calculated Total Reserve:</span>
                <span className="font-bold text-emerald-400">
                  {((Number(newAmmoFirstLine) || 0) + (Number(newAmmoSecondLine) || 0)).toLocaleString()} {newAmmoUnit}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddAmmoModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Save Ammunition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Ammunition Stock Modal */}
      {editingAmmo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-sky-500/50 bg-slate-900 p-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  EDIT AMMUNITION STOCK: {editingAmmo.caliber}
                </h3>
              </div>
              <button onClick={() => setEditingAmmo(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditAmmo} className="mt-3 space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Caliber Designation *</label>
                <input
                  type="text"
                  value={editAmmoCaliber}
                  onChange={(e) => setEditAmmoCaliber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description / Weapon System</label>
                <input
                  type="text"
                  value={editAmmoName}
                  onChange={(e) => setEditAmmoName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <label className="block text-slate-400 mb-1">1st Line (Pouches / Ready)</label>
                  <input
                    type="number"
                    value={editAmmoFirstLine}
                    onChange={(e) => setEditAmmoFirstLine(Number(e.target.value))}
                    min={0}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">2nd Line (Armory Bunker)</label>
                  <input
                    type="number"
                    value={editAmmoSecondLine}
                    onChange={(e) => setEditAmmoSecondLine(Number(e.target.value))}
                    min={0}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <label className="block text-slate-400 mb-1">Critical Safety Min</label>
                  <input
                    type="number"
                    value={editAmmoThreshold}
                    onChange={(e) => setEditAmmoThreshold(Number(e.target.value))}
                    min={1}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Unit of Measure</label>
                  <select
                    value={editAmmoUnit}
                    onChange={(e) => setEditAmmoUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                  >
                    <option value="rounds">rounds</option>
                    <option value="belts">belts</option>
                    <option value="bombs">bombs</option>
                    <option value="rockets">rockets</option>
                    <option value="canisters">canisters</option>
                  </select>
                </div>
              </div>

              <div className="p-2.5 bg-slate-800/60 rounded-lg text-slate-300 font-mono text-[11px] flex justify-between">
                <span>Updated Total Reserve:</span>
                <span className="font-bold text-sky-300">
                  {((Number(editAmmoFirstLine) || 0) + (Number(editAmmoSecondLine) || 0)).toLocaleString()} {editAmmoUnit}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleDeleteAmmo(editingAmmo.caliber)}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Caliber</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingAmmo(null)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Weapon Editing Modal */}
      {editingFullWeapon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-sky-500/50 bg-slate-900 p-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  EDIT WEAPON SPECIFICATIONS: {editingFullWeapon.serialNo}
                </h3>
              </div>
              <button onClick={() => setEditingFullWeapon(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFullWeapon} className="mt-3 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Butt / Serial No *</label>
                  <input
                    type="text"
                    value={editingFullWeapon.serialNo}
                    onChange={(e) =>
                      setEditingFullWeapon({ ...editingFullWeapon, serialNo: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Weapon Type</label>
                  <select
                    value={editingFullWeapon.type}
                    onChange={(e) =>
                      setEditingFullWeapon({ ...editingFullWeapon, type: e.target.value as WeaponItem['type'] })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                  >
                    <option value="BD-08 Rifle">BD-08 Assault Rifle (7.62x39mm)</option>
                    <option value="PKM LMG">PKM Light Machine Gun (7.62x54R)</option>
                    <option value="RPG-7 Launcher">RPG-7 Anti-Tank Rocket Launcher</option>
                    <option value="60mm Mortar">60mm Commando Mortar</option>
                    <option value="81mm Mortar">81mm Long Range Mortar</option>
                    <option value="12.7mm HMG">12.7mm Heavy Machine Gun</option>
                    <option value="9mm Pistol">9mm Browning Pistol</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Platoon Assignment</label>
                  <select
                    value={editingFullWeapon.platoon}
                    onChange={(e) =>
                      setEditingFullWeapon({ ...editingFullWeapon, platoon: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                  >
                    <option value="Coy HQ">Company HQ</option>
                    <option value="1 Platoon">1 Platoon</option>
                    <option value="2 Platoon">2 Platoon</option>
                    <option value="3 Platoon">3 Platoon</option>
                    <option value="Support Weapons Platoon">Cbt Support Pl</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Custody Status</label>
                  <select
                    value={editingFullWeapon.status}
                    onChange={(e) =>
                      setEditingFullWeapon({ ...editingFullWeapon, status: e.target.value as WeaponItem['status'] })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                  >
                    <option value="In Armory">In Armory</option>
                    <option value="Issued on Patrol">Issued on Patrol</option>
                    <option value="Camp Defense Post">Camp Defense Post</option>
                    <option value="In Maintenance">In Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Assigned Soldier / Post</label>
                <div className="space-y-1.5">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        setEditingFullWeapon({ ...editingFullWeapon, assignedTo: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs focus:border-sky-500 outline-none"
                  >
                    <option value="">-- Or choose soldier from company roster --</option>
                    <option value="Armory Reserve">Armory Reserve (Unassigned)</option>
                    {personnel.map((p) => (
                      <option key={p.id} value={`${p.rank} ${p.name} (${p.armyNo})`}>
                        {p.rank} {p.name} ({p.armyNo}) — {p.platoon}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={editingFullWeapon.assignedTo}
                    onChange={(e) =>
                      setEditingFullWeapon({ ...editingFullWeapon, assignedTo: e.target.value })
                    }
                    placeholder="e.g. Soldier Kabir / Armory Reserve"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Service Condition</label>
                  <select
                    value={editingFullWeapon.condition}
                    onChange={(e) =>
                      setEditingFullWeapon({
                        ...editingFullWeapon,
                        condition: e.target.value as WeaponItem['condition'],
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                  >
                    <option value="Serviceable">Serviceable (Combat Ready)</option>
                    <option value="Inspection Due">Inspection Due</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Last Cleaned Date</label>
                  <input
                    type="date"
                    value={editingFullWeapon.lastCleanedDate}
                    onChange={(e) =>
                      setEditingFullWeapon({ ...editingFullWeapon, lastCleanedDate: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="zeroed-checkbox"
                  checked={editingFullWeapon.zeroed}
                  onChange={(e) =>
                    setEditingFullWeapon({ ...editingFullWeapon, zeroed: e.target.checked })
                  }
                  className="rounded bg-slate-800 border-slate-700 text-sky-500 focus:ring-0"
                />
                <label htmlFor="zeroed-checkbox" className="text-slate-300 font-medium">
                  Battalion Standard Zeroed (300m Zero Complete)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingFullWeapon(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold"
                >
                  Save Weapon Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit UN Specialized Equipment Modal */}
      {editingEquipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-sky-500/50 bg-slate-900 p-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  EDIT UN EQUIPMENT: {editingEquipment.name}
                </h3>
              </div>
              <button onClick={() => setEditingEquipment(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditEquipment} className="mt-3 space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Equipment Name *</label>
                <input
                  type="text"
                  value={editingEquipment.name}
                  onChange={(e) =>
                    setEditingEquipment({ ...editingEquipment, name: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2 font-mono">
                <div>
                  <label className="block text-slate-400 mb-1">Total Qty</label>
                  <input
                    type="number"
                    value={editingEquipment.qtyTotal}
                    onChange={(e) =>
                      setEditingEquipment({ ...editingEquipment, qtyTotal: Number(e.target.value) })
                    }
                    min={0}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Issued</label>
                  <input
                    type="number"
                    value={editingEquipment.issued}
                    onChange={(e) =>
                      setEditingEquipment({ ...editingEquipment, issued: Number(e.target.value) })
                    }
                    min={0}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">In Armory</label>
                  <input
                    type="number"
                    value={editingEquipment.inArmory}
                    onChange={(e) =>
                      setEditingEquipment({ ...editingEquipment, inArmory: Number(e.target.value) })
                    }
                    min={0}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Operational Condition</label>
                <input
                  type="text"
                  value={editingEquipment.condition}
                  onChange={(e) =>
                    setEditingEquipment({ ...editingEquipment, condition: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Serial Numbers / Batch Info</label>
                <input
                  type="text"
                  value={editingEquipment.serials}
                  onChange={(e) =>
                    setEditingEquipment({ ...editingEquipment, serials: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleDeleteEquipment(editingEquipment.id)}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingEquipment(null)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register UN Specialized Equipment Modal */}
      {showAddEquipmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-sky-500/50 bg-slate-900 p-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  REGISTER NEW UN SPECIALIZED EQUIPMENT
                </h3>
              </div>
              <button onClick={() => setShowAddEquipmentModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewEquipment} className="mt-3 space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Equipment Name *</label>
                <input
                  type="text"
                  value={newEqName}
                  onChange={(e) => setNewEqName(e.target.value)}
                  placeholder="e.g. Drone Jammer / Drone Detector"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2 font-mono">
                <div>
                  <label className="block text-slate-400 mb-1">Total Qty</label>
                  <input
                    type="number"
                    value={newEqTotal}
                    onChange={(e) => setNewEqTotal(Number(e.target.value))}
                    min={0}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Issued</label>
                  <input
                    type="number"
                    value={newEqIssued}
                    onChange={(e) => setNewEqIssued(Number(e.target.value))}
                    min={0}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">In Armory</label>
                  <input
                    type="number"
                    value={newEqInArmory}
                    onChange={(e) => setNewEqInArmory(Number(e.target.value))}
                    min={0}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Operational Condition</label>
                <input
                  type="text"
                  value={newEqCondition}
                  onChange={(e) => setNewEqCondition(e.target.value)}
                  placeholder="e.g. 100% Operational / Serviceable"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Serial Numbers / Batch Info</label>
                <input
                  type="text"
                  value={newEqSerials}
                  onChange={(e) => setNewEqSerials(e.target.value)}
                  placeholder="e.g. UN-DJ-01 to 04"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddEquipmentModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold"
                >
                  Register Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
