/**
 * MINUSCA Peacekeeper Commander
 * UN Peacekeeping Infantry Company Operations, Logistics & Real-Time Tracking Suite
 * Central African Republic Deployment
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase/config';
import {
  subscribeTacticalState,
  saveTacticalStateUpdate,
  subscribeCompanyConfig,
  CompanyConfig,
  DEFAULT_COMMANDER_EMAIL,
  MedicalStatsOverride,
} from './firebase/tacticalSync';
import { CompanyAccessControl } from './components/CompanyAccessControl';
import {
  INITIAL_PERSONNEL,
  INITIAL_VEHICLES,
  INITIAL_WEAPONS,
  INITIAL_AMMUNITION,
  INITIAL_DUTY_ROSTER,
  INITIAL_PATROLS,
  INITIAL_RATION,
  INITIAL_LEGAL_CASES,
  INITIAL_LEAVES,
  INITIAL_TRANSACTIONS,
  INITIAL_MEDICAL_RECORDS,
  INITIAL_JOB_CARDS,
  INITIAL_INVENTORY,
  ActivePatrol,
  DutyShift,
  LegalDisciplineCase,
  LeaveRecord,
  MedicalRecord,
  VehicleJobCard,
  InventoryAsset,
  WeaponItem,
  AmmunitionStock,
} from './data/mockData';
import { Personnel, Vehicle, RationState, ExpenseTransaction } from './utils/commandLogic';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { TacticalPatrolMap } from './components/TacticalPatrolMap';
import { ManpowerModule } from './components/ManpowerModule';
import { VehicleModule } from './components/VehicleModule';
import { WeaponsModule } from './components/WeaponsModule';
import { DutyRosterModule } from './components/DutyRosterModule';
import { RationsModule } from './components/RationsModule';
import { DisciplineLegalModule } from './components/DisciplineLegalModule';
import { LeaveManagementModule } from './components/LeaveManagementModule';
import { RollingMoneyModule } from './components/RollingMoneyModule';
import { MedicalModule } from './components/MedicalModule';
import { VehicleMaintenanceModule } from './components/VehicleMaintenanceModule';
import { InventoryModule } from './components/InventoryModule';

import { useDeviceLocationTime } from './hooks/useDeviceLocationTime';

import {
  MapPin,
  Users,
  Truck,
  Crosshair,
  ShieldAlert,
  Utensils,
  Scale,
  Plane,
  DollarSign,
  HeartPulse,
  Wrench,
  Boxes,
  Menu,
  X,
  Bell,
  Shield,
  Radio,
  AlertTriangle,
  ChevronRight,
  UserCheck,
  Compass,
  Clock,
} from 'lucide-react';

export type ModuleKey =
  | 'patrols'
  | 'manpower'
  | 'vehicles'
  | 'weapons'
  | 'roster'
  | 'rations'
  | 'discipline'
  | 'leaves'
  | 'money'
  | 'medical'
  | 'maintenance'
  | 'inventory';

export default function App() {
  // State for all 12 modules
  const [personnel, setPersonnel] = useState<Personnel[]>(INITIAL_PERSONNEL);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [weapons, setWeapons] = useState<WeaponItem[]>(INITIAL_WEAPONS);
  const [ammunition, setAmmunition] = useState<AmmunitionStock[]>(INITIAL_AMMUNITION);
  const [dutyRoster, setDutyRoster] = useState<DutyShift[]>(INITIAL_DUTY_ROSTER);
  const [patrols, setPatrols] = useState<ActivePatrol[]>(INITIAL_PATROLS);
  const [ration, setRation] = useState<RationState>(INITIAL_RATION);
  const [legalCases, setLegalCases] = useState<LegalDisciplineCase[]>(INITIAL_LEGAL_CASES);
  const [leaves, setLeaves] = useState<LeaveRecord[]>(INITIAL_LEAVES);
  const [transactions, setTransactions] = useState<ExpenseTransaction[]>(INITIAL_TRANSACTIONS);
  const [allocatedUSD, setAllocatedUSD] = useState<number>(5000);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>(INITIAL_MEDICAL_RECORDS);
  const [medicalStatsOverride, setMedicalStatsOverride] = useState<MedicalStatsOverride | undefined>(undefined);
  const [jobCards, setJobCards] = useState<VehicleJobCard[]>(INITIAL_JOB_CARDS);
  const [inventory, setInventory] = useState<InventoryAsset[]>(INITIAL_INVENTORY);

  // Active Navigation & Role
  const deviceTime = useDeviceLocationTime();
  const [activeModule, setActiveModule] = useState<ModuleKey>('patrols');
  const [activeRole, setActiveRole] = useState<'Maj Fakrul (Company Commander)' | 'Lt Tariq (Company 2IC)' | 'SWO Matiur (Senior Warrant Officer)' | 'Sgt Kabir (CQMS / NCO)'>('Maj Fakrul (Company Commander)');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [allModulesGridOpen, setAllModulesGridOpen] = useState(false);
  const [activeSosIncident, setActiveSosIncident] = useState<ActivePatrol | null>(null);

  // Authentication & Multi-Device Real-Time Cloud Sync
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [companyConfig, setCompanyConfig] = useState<CompanyConfig>({
    primaryCommanderEmail: DEFAULT_COMMANDER_EMAIL,
    authorizedEditorEmail: '',
    updatedAt: '',
    updatedBy: '',
  });
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Listen to auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  // Listen to company authorization configuration
  useEffect(() => {
    const unsub = subscribeCompanyConfig((cfg) => {
      setCompanyConfig(cfg);
    });
    return () => unsub();
  }, []);

  // Listen to real-time tactical state replication from Firestore
  useEffect(() => {
    const unsub = subscribeTacticalState((cloud) => {
      if (cloud.personnel) setPersonnel(cloud.personnel);
      if (cloud.vehicles) setVehicles(cloud.vehicles);
      if (cloud.weapons) setWeapons(cloud.weapons);
      if (cloud.ammunition) setAmmunition(cloud.ammunition);
      if (cloud.dutyRoster) setDutyRoster(cloud.dutyRoster);
      if (cloud.patrols) setPatrols(cloud.patrols);
      if (cloud.ration) setRation(cloud.ration);
      if (cloud.legalCases) setLegalCases(cloud.legalCases);
      if (cloud.leaves) setLeaves(cloud.leaves);
      if (cloud.transactions) setTransactions(cloud.transactions);
      if (cloud.allocatedUSD !== undefined) setAllocatedUSD(cloud.allocatedUSD);
      if (cloud.medicalRecords) setMedicalRecords(cloud.medicalRecords);
      if (cloud.medicalStatsOverride !== undefined) setMedicalStatsOverride(cloud.medicalStatsOverride);
      if (cloud.jobCards) setJobCards(cloud.jobCards);
      if (cloud.inventory) setInventory(cloud.inventory);
      setLastSyncTime(new Date().toLocaleTimeString());
    });
    return () => unsub();
  }, []);

  const activeUserEmail = currentUser?.email || DEFAULT_COMMANDER_EMAIL;

  const isCommander = Boolean(
    (currentUser?.email && currentUser.email.toLowerCase() === DEFAULT_COMMANDER_EMAIL.toLowerCase()) ||
    (!currentUser)
  );

  const isAuthorizedEditor = Boolean(
    currentUser?.email &&
    companyConfig.authorizedEditorEmail &&
    currentUser.email.toLowerCase() === companyConfig.authorizedEditorEmail.toLowerCase()
  );

  const canEdit = isCommander || isAuthorizedEditor;

  // Module items definition with new serial numbers (1 to 12)
  const modulesList: { key: ModuleKey; label: string; icon: React.ElementType; section: string; badge?: string }[] = [
    { key: 'patrols', label: '1. Patrols & Live Map', icon: Radio, section: 'OPERATIONS', badge: `${patrols.length} Active` },
    { key: 'roster', label: '2. Duty Roster', icon: ShieldAlert, section: 'OPERATIONS' },
    { key: 'manpower', label: '3. Manpower State', icon: Users, section: 'COMBAT LOGISTICS', badge: `${personnel.length} Men` },
    { key: 'vehicles', label: '4. Vehicle State', icon: Truck, section: 'COMBAT LOGISTICS', badge: `${vehicles.length} Units` },
    { key: 'weapons', label: '5. Weapons & Ammo', icon: Crosshair, section: 'COMBAT LOGISTICS' },
    { key: 'rations', label: '6. Ration & MRE', icon: Utensils, section: 'COMBAT LOGISTICS' },
    { key: 'discipline', label: '7. Discipline & Legal', icon: Scale, section: 'ADMIN & WELFARE', badge: 'SEA Safe' },
    { key: 'leaves', label: '8. Leave Management', icon: Plane, section: 'ADMIN & WELFARE' },
    { key: 'money', label: '9. Rolling Money State', icon: DollarSign, section: 'ADMIN & WELFARE', badge: '$3,580' },
    { key: 'medical', label: '10. Medical Records', icon: HeartPulse, section: 'HEALTH & SAFETY' },
    { key: 'maintenance', label: '11. Vehicle Maintenance', icon: Wrench, section: 'TECHNICAL & ASSETS' },
    { key: 'inventory', label: '12. Inventory Assets', icon: Boxes, section: 'TECHNICAL & ASSETS', badge: 'COE Ready' },
  ];

  // Handlers for state updates with real-time multi-device cloud propagation
  const handleUpdatePersonnel = (updated: Personnel) => {
    const next = personnel.map((p) => (p.id === updated.id ? updated : p));
    setPersonnel(next);
    saveTacticalStateUpdate({ personnel: next }, activeUserEmail).catch(console.warn);
  };

  const handleAddPersonnel = (newP: Personnel) => {
    const next = [newP, ...personnel];
    setPersonnel(next);
    saveTacticalStateUpdate({ personnel: next }, activeUserEmail).catch(console.warn);
  };

  const handleDeletePersonnel = (id: string) => {
    const next = personnel.filter((p) => p.id !== id);
    setPersonnel(next);
    saveTacticalStateUpdate({ personnel: next }, activeUserEmail).catch(console.warn);
  };

  const handleUpdateVehicle = (updated: Vehicle) => {
    const next = vehicles.map((v) => (v.id === updated.id ? updated : v));
    setVehicles(next);
    saveTacticalStateUpdate({ vehicles: next }, activeUserEmail).catch(console.warn);
  };

  const handleAddVehicle = (newV: Vehicle) => {
    const next = [newV, ...vehicles];
    setVehicles(next);
    saveTacticalStateUpdate({ vehicles: next }, activeUserEmail).catch(console.warn);
  };

  const handleDeleteVehicle = (id: string) => {
    const next = vehicles.filter((v) => v.id !== id);
    setVehicles(next);
    saveTacticalStateUpdate({ vehicles: next }, activeUserEmail).catch(console.warn);
  };

  const handleUpdateWeapon = (updated: WeaponItem) => {
    const next = weapons.map((w) => (w.id === updated.id ? updated : w));
    setWeapons(next);
    saveTacticalStateUpdate({ weapons: next }, activeUserEmail).catch(console.warn);
  };

  const handleAddWeapon = (newW: WeaponItem) => {
    const next = [newW, ...weapons];
    setWeapons(next);
    saveTacticalStateUpdate({ weapons: next }, activeUserEmail).catch(console.warn);
  };

  const handleDeleteWeapon = (id: string) => {
    const next = weapons.filter((w) => w.id !== id);
    setWeapons(next);
    saveTacticalStateUpdate({ weapons: next }, activeUserEmail).catch(console.warn);
  };

  const handleUpdateAmmunition = (updated: AmmunitionStock[]) => {
    setAmmunition(updated);
    saveTacticalStateUpdate({ ammunition: updated }, activeUserEmail).catch(console.warn);
  };

  const handleUpdateShift = (updated: DutyShift) => {
    const next = dutyRoster.map((s) => (s.id === updated.id ? updated : s));
    setDutyRoster(next);
    saveTacticalStateUpdate({ dutyRoster: next }, activeUserEmail).catch(console.warn);
  };

  const handleAddShift = (newS: DutyShift) => {
    const next = [newS, ...dutyRoster];
    setDutyRoster(next);
    saveTacticalStateUpdate({ dutyRoster: next }, activeUserEmail).catch(console.warn);
  };

  const handleDeleteShift = (id: string) => {
    const next = dutyRoster.filter((s) => s.id !== id);
    setDutyRoster(next);
    saveTacticalStateUpdate({ dutyRoster: next }, activeUserEmail).catch(console.warn);
  };

  const handleUpdatePatrol = (updated: ActivePatrol) => {
    const next = patrols.map((p) => (p.id === updated.id ? updated : p));
    setPatrols(next);
    saveTacticalStateUpdate({ patrols: next }, activeUserEmail).catch(console.warn);
  };

  const handleAddPatrol = (newP: ActivePatrol) => {
    const next = [newP, ...patrols];
    setPatrols(next);
    saveTacticalStateUpdate({ patrols: next }, activeUserEmail).catch(console.warn);
  };

  const handleTriggerSOS = (patrol: ActivePatrol) => {
    const updated: ActivePatrol = {
      ...patrol,
      status: 'Incident / Duress',
      sitrep: `*** FLASH DURESS BEACON ACTIVATED *** Patrol encountered hostile perimeter or vehicle breakdown at ${patrol.locationName}. QRT request initiated.`,
    };
    handleUpdatePatrol(updated);
    setActiveSosIncident(updated);
  };

  const handleDismissSOS = () => {
    if (activeSosIncident) {
      const cleared: ActivePatrol = {
        ...activeSosIncident,
        status: 'Active Moving',
        sitrep: 'Duress beacon stood down. Comms restored to normal green status.',
      };
      handleUpdatePatrol(cleared);
      setActiveSosIncident(null);
    }
  };

  const handleUpdateRation = (updated: RationState) => {
    setRation(updated);
    saveTacticalStateUpdate({ ration: updated }, activeUserEmail).catch(console.warn);
  };

  const handleUpdateCase = (updated: LegalDisciplineCase) => {
    const next = legalCases.map((c) => (c.id === updated.id ? updated : c));
    setLegalCases(next);
    saveTacticalStateUpdate({ legalCases: next }, activeUserEmail).catch(console.warn);
  };

  const handleAddCase = (newC: LegalDisciplineCase) => {
    const next = [newC, ...legalCases];
    setLegalCases(next);
    saveTacticalStateUpdate({ legalCases: next }, activeUserEmail).catch(console.warn);
  };

  const handleUpdateLeave = (updated: LeaveRecord) => {
    const next = leaves.map((l) => (l.id === updated.id ? updated : l));
    setLeaves(next);
    saveTacticalStateUpdate({ leaves: next }, activeUserEmail).catch(console.warn);
  };

  const handleAddLeave = (newL: LeaveRecord) => {
    const next = [newL, ...leaves];
    setLeaves(next);
    saveTacticalStateUpdate({ leaves: next }, activeUserEmail).catch(console.warn);
  };

  const handleAddTransaction = (newTx: ExpenseTransaction) => {
    const next = [newTx, ...transactions];
    setTransactions(next);
    saveTacticalStateUpdate({ transactions: next }, activeUserEmail).catch(console.warn);
  };

  const handleApproveTransaction = (id: string) => {
    const next: ExpenseTransaction[] = transactions.map((t) =>
      t.id === id ? { ...t, status: 'Approved' as const, approvedBy: activeRole } : t
    );
    setTransactions(next);
    saveTacticalStateUpdate({ transactions: next }, activeUserEmail).catch(console.warn);
  };

  const handleUpdateTransaction = (updatedTx: ExpenseTransaction) => {
    const next = transactions.map((t) => (t.id === updatedTx.id ? updatedTx : t));
    setTransactions(next);
    saveTacticalStateUpdate({ transactions: next }, activeUserEmail).catch(console.warn);
  };

  const handleDeleteTransaction = (id: string) => {
    const next = transactions.filter((t) => t.id !== id);
    setTransactions(next);
    saveTacticalStateUpdate({ transactions: next }, activeUserEmail).catch(console.warn);
  };

  const handleUpdateAllocatedUSD = (newTotal: number) => {
    setAllocatedUSD(newTotal);
    saveTacticalStateUpdate({ allocatedUSD: newTotal }, activeUserEmail).catch(console.warn);
  };

  const handleUpdateMedical = (updated: MedicalRecord) => {
    const next = medicalRecords.map((m) => (m.id === updated.id ? updated : m));
    setMedicalRecords(next);
    saveTacticalStateUpdate({ medicalRecords: next }, activeUserEmail).catch(console.warn);
  };

  const handleAddMedical = (newM: MedicalRecord) => {
    const next = [newM, ...medicalRecords];
    setMedicalRecords(next);
    saveTacticalStateUpdate({ medicalRecords: next }, activeUserEmail).catch(console.warn);
  };

  const handleDeleteMedical = (id: string) => {
    const next = medicalRecords.filter((m) => m.id !== id);
    setMedicalRecords(next);
    saveTacticalStateUpdate({ medicalRecords: next }, activeUserEmail).catch(console.warn);
  };

  const handleUpdateMedicalStats = (override: MedicalStatsOverride) => {
    setMedicalStatsOverride(override);
    saveTacticalStateUpdate({ medicalStatsOverride: override }, activeUserEmail).catch(console.warn);
  };

  const handleUpdateJobCard = (updated: VehicleJobCard) => {
    const next = jobCards.map((j) => (j.id === updated.id ? updated : j));
    setJobCards(next);
    saveTacticalStateUpdate({ jobCards: next }, activeUserEmail).catch(console.warn);
  };

  const handleAddJobCard = (newJ: VehicleJobCard) => {
    const next = [newJ, ...jobCards];
    setJobCards(next);
    saveTacticalStateUpdate({ jobCards: next }, activeUserEmail).catch(console.warn);
  };

  const handleUpdateAsset = (updated: InventoryAsset) => {
    const next = inventory.map((a) => (a.id === updated.id ? updated : a));
    setInventory(next);
    saveTacticalStateUpdate({ inventory: next }, activeUserEmail).catch(console.warn);
  };

  const handleAddAsset = (newA: InventoryAsset) => {
    const next = [newA, ...inventory];
    setInventory(next);
    saveTacticalStateUpdate({ inventory: next }, activeUserEmail).catch(console.warn);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white pb-20 md:pb-0">
      {/* Offline connectivity notification */}
      <OfflineIndicator />

      {/* FLASH DURESS / SOS EMERGENCY BANNER */}
      {activeSosIncident && (
        <div className="bg-rose-600 border-b border-rose-500 p-3 text-white flex items-center justify-between animate-pulse sticky top-0 z-50 shadow-2xl">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 shrink-0 animate-bounce" />
            <div>
              <span className="font-mono font-black text-sm uppercase block tracking-wider">
                FLASH DURESS BEACON TRIGGERED: {activeSosIncident.callsign}
              </span>
              <span className="text-xs text-rose-100">
                Location: {activeSosIncident.locationName} ({activeSosIncident.lat.toFixed(4)}°N, {activeSosIncident.lng.toFixed(4)}°E) • Standby QRT dispatched
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveModule('patrols')}
              className="px-3 py-1 bg-white text-rose-700 rounded-lg text-xs font-bold hover:bg-rose-50"
            >
              View on Map
            </button>
            <button
              onClick={handleDismissSOS}
              className="px-3 py-1 bg-rose-800 text-white rounded-lg text-xs font-semibold hover:bg-rose-900"
            >
              Stand Down
            </button>
          </div>
        </div>
      )}

      {/* Tactical Top Command Header */}
      <header className="bg-slate-900/95 backdrop-blur border-b border-slate-800 sticky top-0 z-40 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          {/* Mobile Drawer Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            aria-label="Toggle navigation drawer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* UN MINUSCA Logo & Contingent Title */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveModule('patrols')}>
            <img
              src="/company_logo.jpg"
              alt="BANBAT-13, MINUSCA Mechanized Company-2 Logo"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-amber-400 shadow-md ring-1 ring-sky-500/40 shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs sm:text-base font-black text-white tracking-tight sm:tracking-wide font-mono whitespace-nowrap">
                  BANBAT-13, MINUSCA
                </span>
                <span
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] sm:text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 whitespace-nowrap shadow-sm"
                  title={`Device Local Date & Time: ${deviceTime.formattedDateTime} (${deviceTime.timezone})${deviceTime.coords ? ` • Lat: ${deviceTime.coords.latitude.toFixed(3)}°, Lng: ${deviceTime.coords.longitude.toFixed(3)}°` : ''}`}
                >
                  <Clock className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{deviceTime.formattedDate}</span>
                  <span className="text-emerald-100">{deviceTime.formattedTime}</span>
                  <span className="text-[9px] text-emerald-400/80 font-semibold">LT</span>
                </span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-sky-300 font-mono font-semibold truncate max-w-[170px] sm:max-w-none">
                Mechanized Company-2
              </div>
            </div>
          </div>
        </div>

        {/* Central / Right Controls */}
        <div className="flex items-center gap-2">
          {/* All 12 Modules Quick Grid Button */}
          <button
            onClick={() => setAllModulesGridOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition"
            title="Open quick 12-module launcher grid"
          >
            <Boxes className="w-4 h-4 text-sky-400" />
            <span>All 12 Modules</span>
          </button>

          {/* Multi-Device Real-Time Cloud Sync & Role Authorization */}
          <CompanyAccessControl
            currentUser={currentUser}
            config={companyConfig}
            isCommander={isCommander}
            isAuthorizedEditor={isAuthorizedEditor}
            canEdit={canEdit}
            lastSyncTime={lastSyncTime}
          />

          {/* In-App PWA Install Prompt for Android phone */}
          <PWAInstallButton />
        </div>
      </header>

      {/* Main Body Shell */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Left Sidebar with 12 Modules */}
        <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-slate-900/50 p-3 space-y-4 overflow-y-auto">
          {/* Navigation Links Grouped */}
          <div className="space-y-4 text-xs font-mono">
            {['OPERATIONS', 'COMBAT LOGISTICS', 'ADMIN & WELFARE', 'HEALTH & SAFETY', 'TECHNICAL & ASSETS'].map((sec) => {
              const secItems = modulesList.filter((m) => m.section === sec);
              return (
                <div key={sec} className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 tracking-wider px-2">
                    {sec}
                  </div>
                  {secItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeModule === item.key;
                    return (
                      <button
                        key={item.key}
                        onClick={() => setActiveModule(item.key)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                          isActive
                            ? 'bg-sky-600 text-white font-bold shadow'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-sky-400'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isActive ? 'bg-sky-800 text-white' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Mobile Navigation Drawer Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm md:hidden flex">
            <div className="w-4/5 max-w-xs bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between space-y-4 overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <img src="/company_logo.jpg" alt="Company Logo" className="w-8 h-8 rounded-full object-cover border border-amber-400/80 shadow" />
                    <div>
                      <span className="font-bold text-white text-xs font-mono block">BANBAT-13, MINUSCA</span>
                      <span className="text-[10px] text-sky-400 font-mono block">Mechanized Company-2</span>
                    </div>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1 font-mono text-xs">
                  {modulesList.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeModule === item.key;
                    return (
                      <button
                        key={item.key}
                        onClick={() => {
                          setActiveModule(item.key);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition ${
                          isActive
                            ? 'bg-sky-600 text-white font-bold shadow'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-sky-400" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
                Maj Fakrul Islam • Mechanized Company-2 (BANBAT-13)
              </div>
            </div>

            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-3 sm:p-5 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeModule === 'patrols' && (
            <TacticalPatrolMap
              patrols={patrols}
              onUpdatePatrol={handleUpdatePatrol}
              onAddPatrol={handleAddPatrol}
              onTriggerSOS={handleTriggerSOS}
              activeRole={activeRole}
              userEmail={activeUserEmail}
            />
          )}

          {activeModule === 'manpower' && (
            <ManpowerModule
              personnel={personnel}
              onUpdatePersonnel={handleUpdatePersonnel}
              onAddPersonnel={handleAddPersonnel}
              onDeletePersonnel={handleDeletePersonnel}
              activeRole={activeRole}
            />
          )}

          {activeModule === 'vehicles' && (
            <VehicleModule
              vehicles={vehicles}
              onUpdateVehicle={handleUpdateVehicle}
              onAddVehicle={handleAddVehicle}
              onDeleteVehicle={handleDeleteVehicle}
              onNavigateToMaintenance={() => setActiveModule('maintenance')}
              activeRole={activeRole}
            />
          )}

          {activeModule === 'weapons' && (
            <WeaponsModule
              weapons={weapons}
              ammunition={ammunition}
              personnel={personnel}
              onUpdateWeapon={handleUpdateWeapon}
              onUpdateAmmunition={handleUpdateAmmunition}
              onAddWeapon={handleAddWeapon}
              onDeleteWeapon={handleDeleteWeapon}
              activeRole={activeRole}
              canEdit={canEdit}
              isCommander={isCommander}
              isAuthorizedEditor={isAuthorizedEditor}
            />
          )}

          {activeModule === 'roster' && (
            <DutyRosterModule
              roster={dutyRoster}
              onUpdateShift={handleUpdateShift}
              onAddShift={handleAddShift}
              onDeleteShift={handleDeleteShift}
              activeRole={activeRole}
              canEdit={canEdit}
              isCommander={isCommander}
              isAuthorizedEditor={isAuthorizedEditor}
            />
          )}

          {activeModule === 'rations' && (
            <RationsModule
              ration={ration}
              effectiveStrength={personnel.length}
              onUpdateRation={handleUpdateRation}
              activeRole={activeRole}
            />
          )}

          {activeModule === 'discipline' && (
            <DisciplineLegalModule
              cases={legalCases}
              onUpdateCase={handleUpdateCase}
              onAddCase={handleAddCase}
              activeRole={activeRole}
            />
          )}

          {activeModule === 'leaves' && (
            <LeaveManagementModule
              leaves={leaves}
              onUpdateLeave={handleUpdateLeave}
              onAddLeave={handleAddLeave}
              activeRole={activeRole}
            />
          )}

          {activeModule === 'money' && (
            <RollingMoneyModule
              transactions={transactions}
              allocatedUSD={allocatedUSD}
              onAddTransaction={handleAddTransaction}
              onUpdateTransaction={handleUpdateTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onApproveTransaction={handleApproveTransaction}
              onUpdateAllocatedUSD={handleUpdateAllocatedUSD}
              activeRole={activeRole}
              canEdit={canEdit}
              isCommander={isCommander}
              isAuthorizedEditor={isAuthorizedEditor}
            />
          )}

          {activeModule === 'medical' && (
            <MedicalModule
              records={medicalRecords}
              onUpdateRecord={handleUpdateMedical}
              onAddRecord={handleAddMedical}
              onDeleteRecord={handleDeleteMedical}
              activeRole={activeRole}
              canEdit={canEdit}
              isCommander={isCommander}
              isAuthorizedEditor={isAuthorizedEditor}
              medicalStatsOverride={medicalStatsOverride}
              onUpdateMedicalStats={handleUpdateMedicalStats}
            />
          )}

          {activeModule === 'maintenance' && (
            <VehicleMaintenanceModule
              jobCards={jobCards}
              onUpdateJobCard={handleUpdateJobCard}
              onAddJobCard={handleAddJobCard}
              activeRole={activeRole}
            />
          )}

          {activeModule === 'inventory' && (
            <InventoryModule
              assets={inventory}
              onUpdateAsset={handleUpdateAsset}
              onAddAsset={handleAddAsset}
              activeRole={activeRole}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Thumb Friendly on Android) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur border-t border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        {[
          { key: 'patrols', label: 'Patrols', icon: Radio },
          { key: 'roster', label: 'Roster', icon: ShieldAlert },
          { key: 'manpower', label: 'Manpower', icon: Users },
          { key: 'vehicles', label: 'Fleet', icon: Truck },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActiveModule(item.key as ModuleKey)}
              className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition ${
                isActive ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}

        {/* All Modules Launcher Button on Mobile */}
        <button
          onClick={() => setAllModulesGridOpen(true)}
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-slate-400 hover:text-white ${
            allModulesGridOpen ? 'text-sky-400' : ''
          }`}
        >
          <Boxes className="w-5 h-5 text-amber-400" />
          <span className="text-[10px] mt-0.5">12 Modules</span>
        </button>
      </nav>

      {/* All 12 Modules Quick Launcher Grid Modal */}
      {allModulesGridOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-sky-500/40 bg-slate-900 p-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  ALL 12 COMPANY COMMAND MODULES
                </h3>
              </div>
              <button
                onClick={() => setAllModulesGridOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
              {modulesList.map((m) => {
                const Icon = m.icon;
                const isActive = activeModule === m.key;

                return (
                  <button
                    key={m.key}
                    onClick={() => {
                      setActiveModule(m.key);
                      setAllModulesGridOpen(false);
                    }}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between space-y-2 ${
                      isActive
                        ? 'bg-sky-600/20 border-sky-500 shadow-md ring-1 ring-sky-500'
                        : 'bg-slate-800/70 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <Icon className="w-4 h-4 text-sky-400" />
                      </div>
                      {m.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-900 text-slate-300">
                          {m.badge}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white leading-tight font-mono">
                        {m.label}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {m.section}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400 font-mono">
              <span>BANBAT-13, MINUSCA • Mechanized Company-2 (Jan 2027)</span>
              <button
                onClick={() => setAllModulesGridOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700"
              >
                Close Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
