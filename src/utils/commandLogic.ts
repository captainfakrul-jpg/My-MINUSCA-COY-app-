/**
 * Pure business logic for MINUSCA Peacekeeping Infantry Company Command System
 */

export interface Personnel {
  id: string;
  armyNo: string;
  unId: string;
  rank:
    | 'Major'
    | 'Captain'
    | 'Lieutenant'
    | 'Senior Warrant Officer'
    | 'Warrant Officer'
    | 'Sergeant'
    | 'Corporal'
    | 'Lance Corporal'
    | 'Private'
    | 'Maj'
    | 'Capt'
    | 'Lt'
    | 'SWO'
    | 'WO'
    | 'Sgt'
    | 'Cpl'
    | 'L Cpl'
    | 'Pvt'
    | string;
  name: string;
  platoon: 'Coy HQ' | '1 Platoon' | '2 Platoon' | '3 Platoon' | 'Support Weapons Platoon';
  role: string;
  status: 'Present' | 'On Patrol' | 'Duty Post' | 'Leave / R&R' | 'Sick Bay / Hospital' | 'Detached Sector HQ';
  weaponIssued: string;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  medicalCategory: 'FE (Fit Forward)' | 'Temporary Low Med' | 'Level II Hospitalized';
  malariaProphylaxisTaken: boolean;
  nokName: string;
  nokPhone: string;
}

export const ARMY_RANKS: { fullName: string; abbr: string }[] = [
  { fullName: 'Major', abbr: 'Maj' },
  { fullName: 'Captain', abbr: 'Capt' },
  { fullName: 'Lieutenant', abbr: 'Lt' },
  { fullName: 'Senior Warrant Officer', abbr: 'SWO' },
  { fullName: 'Warrant Officer', abbr: 'WO' },
  { fullName: 'Sergeant', abbr: 'Sgt' },
  { fullName: 'Corporal', abbr: 'Cpl' },
  { fullName: 'Lance Corporal', abbr: 'L Cpl' },
  { fullName: 'Private', abbr: 'Pvt' },
];

export const getRankAbbr = (rank: string): string => {
  const norm = rank.trim().toLowerCase();
  if (norm.includes('senior warrant') || norm === 'swo' || norm.includes('subedar major') || norm === 'subedar') return 'SWO';
  if (norm.includes('warrant officer') || norm === 'wo' || norm.includes('naib subedar')) return 'WO';
  if (norm.includes('sergeant') || norm === 'sgt' || norm.includes('havildar')) return 'Sgt';
  if ((norm.includes('corporal') && !norm.includes('lance')) || norm === 'cpl' || (norm.includes('naik') && !norm.includes('lance'))) return 'Cpl';
  if (norm.includes('lance corporal') || norm === 'l cpl' || norm === 'l/cpl' || norm.includes('lance naik')) return 'L Cpl';
  if (norm.includes('private') || norm === 'pvt' || norm.includes('soldier') || norm.includes('sainik')) return 'Pvt';
  if (norm.includes('major') || norm === 'maj') return 'Maj';
  if (norm.includes('captain') || norm === 'capt') return 'Capt';
  if (norm.includes('lieutenant') || norm === 'lt') return 'Lt';
  return rank;
};

export interface Vehicle {
  id: string;
  callsign: string;
  unNumber: string;
  type:
    | 'BTR-80 APC'
    | 'Armored Patrol Vehicle'
    | 'Toyota Landcruiser Hardtop Jeep'
    | 'Toyota Pick Up'
    | '3 Ton'
    | 'Light Armored Vehicles'
    | 'Engr Plant Vehicle'
    | '4x4 Land Cruiser'
    | 'Logistics Truck'
    | 'Water Bowser'
    | 'Ambulance'
    | string;
  platoon: string;
  driver: string;
  commander: string;
  status: 'On-Road (Mission Ready)' | 'Amber (Maintenance Due)' | 'Off-Road (Deadlined)';
  fuelPercent: number;
  fuelType: 'Diesel' | 'Petrol';
  mileageKm: number;
  lastServiceDate: string;
  nextServiceKm: number;
  currentLocation: string;
  faults: string[];
}

export interface RationState {
  dryRationKg: number;
  mrePacks: number;
  bottledWaterLiters: number;
  freshVegetablesKg: number;
  meatFrozenKg: number;
  cookingGasCylinders: number;
}

export interface ExpenseTransaction {
  id: string;
  date: string;
  description: string;
  category: 'Camp Fortification' | 'Vehicle Spares' | 'Emergency Medical' | 'CIMIC / Goodwill' | 'Water / Generator Fuel' | 'Stationery / Admin' | 'Any Other';
  amountUSD: number;
  approvedBy: string;
  currency: 'USD' | 'XAF';
  status: 'Approved' | 'Pending Commander Sign-off';
}

/**
 * Calculates manpower metrics
 */
export function calculateManpowerSummary(personnel: Personnel[]) {
  const totalAuthorized = 125; // Standard UN Peacekeeping Rifle Company establishment
  const totalPosted = personnel.length;
  
  let present = 0;
  let onPatrol = 0;
  let onDuty = 0;
  let onLeave = 0;
  let sick = 0;
  let detached = 0;

  for (const p of personnel) {
    if (p.status === 'Present') present++;
    else if (p.status === 'On Patrol') onPatrol++;
    else if (p.status === 'Duty Post') onDuty++;
    else if (p.status === 'Leave / R&R') onLeave++;
    else if (p.status === 'Sick Bay / Hospital') sick++;
    else if (p.status === 'Detached Sector HQ') detached++;
  }

  const effectiveFightingStrength = present + onPatrol + onDuty;
  const operationalReadinessPercent = totalPosted > 0 
    ? Math.round((effectiveFightingStrength / totalPosted) * 100) 
    : 0;

  return {
    totalAuthorized,
    totalPosted,
    present,
    onPatrol,
    onDuty,
    onLeave,
    sick,
    detached,
    effectiveFightingStrength,
    operationalReadinessPercent,
  };
}

/**
 * Calculates Days of Supply (DOS) for rations and water
 * Standard UN ration scale: 1.2 kg dry ration / soldier / day, 1 MRE pack / soldier / day (field patrol), 4.5 L water / soldier / day
 */
export function calculateRationDOS(ration: RationState, effectivePersonnelCount: number) {
  const headcount = Math.max(1, effectivePersonnelCount);
  const dryRationDailyNeed = headcount * 1.2;
  const waterDailyNeed = headcount * 4.5;

  const dryRationDOS = Math.floor(ration.dryRationKg / dryRationDailyNeed);
  const mreDOS = Math.floor(ration.mrePacks / headcount);
  const waterDOS = Math.floor(ration.bottledWaterLiters / waterDailyNeed);

  const minDOS = Math.min(dryRationDOS, mreDOS, waterDOS);
  
  let alertLevel: 'Safe' | 'Warning' | 'Critical' = 'Safe';
  if (minDOS < 7) {
    alertLevel = 'Critical';
  } else if (minDOS < 15) {
    alertLevel = 'Warning';
  }

  return {
    dryRationDOS,
    mreDOS,
    waterDOS,
    minDOS,
    alertLevel,
  };
}

/**
 * Calculates Fleet readiness percentage
 */
export function calculateFleetReadiness(vehicles: Vehicle[]) {
  if (vehicles.length === 0) return { total: 0, onRoad: 0, amber: 0, offRoad: 0, readinessPercent: 0, avgFuel: 0 };

  const total = vehicles.length;
  let onRoad = 0;
  let amber = 0;
  let offRoad = 0;
  let totalFuel = 0;

  for (const v of vehicles) {
    totalFuel += v.fuelPercent;
    if (v.status === 'On-Road (Mission Ready)') onRoad++;
    else if (v.status === 'Amber (Maintenance Due)') amber++;
    else if (v.status === 'Off-Road (Deadlined)') offRoad++;
  }

  const readinessPercent = Math.round((onRoad / total) * 100);
  const avgFuel = Math.round(totalFuel / total);

  return {
    total,
    onRoad,
    amber,
    offRoad,
    readinessPercent,
    avgFuel,
  };
}

/**
 * Calculates Rolling Money balance and expenditure
 * Fixed conversion for CAR: 1 USD = 610 XAF (Central African CFA Franc)
 */
export const USD_TO_XAF_RATE = 610;

export function calculateRollingMoney(allocatedUSD: number, transactions: ExpenseTransaction[]) {
  let totalSpentUSD = 0;
  let pendingApprovalUSD = 0;
  const categoryTotals: Record<string, number> = {};

  for (const tx of transactions) {
    if (tx.status === 'Approved') {
      totalSpentUSD += tx.amountUSD;
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amountUSD;
    } else {
      pendingApprovalUSD += tx.amountUSD;
    }
  }

  const balanceUSD = allocatedUSD - totalSpentUSD;
  const balanceXAF = balanceUSD * USD_TO_XAF_RATE;
  const totalSpentXAF = totalSpentUSD * USD_TO_XAF_RATE;

  return {
    allocatedUSD,
    totalSpentUSD,
    totalSpentXAF,
    balanceUSD,
    balanceXAF,
    pendingApprovalUSD,
    categoryTotals,
  };
}

/**
 * Filter personnel helper
 */
export function filterPersonnel(
  list: Personnel[],
  query: string,
  platoon: string,
  statusFilter: string
) {
  const q = query.trim().toLowerCase();
  return list.filter((p) => {
    const matchesQuery =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.armyNo.toLowerCase().includes(q) ||
      p.unId.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q) ||
      p.rank.toLowerCase().includes(q);

    const matchesPlatoon =
      platoon === 'ALL' ||
      p.platoon === platoon ||
      ((platoon === 'Support Weapons Platoon' || platoon === 'Cbt Support Pl') &&
        (p.platoon === 'Support Weapons Platoon' || (p.platoon as string) === 'Cbt Support Pl'));
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;

    return matchesQuery && matchesPlatoon && matchesStatus;
  });
}
