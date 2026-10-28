import { Personnel, Vehicle, RationState, ExpenseTransaction } from '../utils/commandLogic';

export interface WeaponItem {
  id: string;
  serialNo: string;
  type: 'BD-08 Rifle' | 'PKM LMG' | 'RPG-7 Launcher' | '60mm Mortar' | '81mm Mortar' | '12.7mm HMG' | '9mm Pistol';
  platoon: string;
  assignedTo: string;
  status: 'In Armory' | 'Issued on Patrol' | 'In Maintenance' | 'Camp Defense Post';
  condition: 'Serviceable' | 'Inspection Due' | 'Damaged';
  lastCleanedDate: string;
  zeroed: boolean;
}

export interface AmmunitionStock {
  caliber: string;
  name: string;
  firstLineRounds: number;
  secondLineReserve: number;
  totalRounds: number;
  criticalThreshold: number;
  unit: string;
}

export interface DutyShift {
  id: string;
  shiftName: string;
  postName: string;
  personnelName: string;
  armyNo: string;
  rank: string;
  weapon: string;
  status: 'On Duty' | 'Relieved' | 'Upcoming';
  supervisor: string;
}

export interface ActivePatrol {
  id: string;
  callsign: string;
  missionType: 'Route Recon' | 'Market Security & CIMIC' | 'Logistics Convoy Escort' | 'Area Domination Foot Patrol' | 'QRT Standby';
  commander: string;
  strength: number;
  vehicles: string[];
  departureTime: string;
  expectedReturn: string;
  locationName: string;
  lat: number;
  lng: number;
  status: 'Active Moving' | 'Halted / Checkpoint' | 'Static Security' | 'Returning' | 'Incident / Duress';
  speedKmH: number;
  lastCommsTime: string;
  commsStatus: 'Green (VHF/HF Strong)' | 'Amber (Intermittent)' | 'Red (No Comms)';
  sitrep: string;
  waypoints: { name: string; lat: number; lng: number; passed: boolean }[];
}

export interface LegalDisciplineCase {
  id: string;
  caseNumber: string;
  dateLogged: string;
  accusedPersonnel: string;
  rank: string;
  armyNo: string;
  category: 'SEA Zero-Tolerance' | 'Unintentional Discharge' | 'Equipment / Kit Loss' | 'Curfew / Out of Bounds' | 'Disobedience of Orders' | 'Civilian Dispute';
  description: string;
  investigatingOfficer: string;
  status: 'Preliminary Inquiry' | 'Court of Inquiry' | 'Summary Trial' | 'Disposed / Closed' | 'Referred to Battalion HQ';
  punishmentOrFinding: string;
  documents: { name: string; size: string; date: string }[];
  confidential: boolean;
}

export interface LeaveRecord {
  id: string;
  armyNo: string;
  name: string;
  rank: string;
  platoon: string;
  leaveType: 'R&R (21 Days)' | 'Annual Leave' | 'Compassionate Leave' | 'Medical Evacuation Leave';
  startDate: string;
  endDate: string;
  daysRemaining: number;
  flightDetails: string;
  handoverTo: string;
  approvalStatus: 'Approved by Commander' | 'Pending Recommendation' | 'Completed';
  contactPhone: string;
}

export interface MedicalRecord {
  id: string;
  armyNo: string;
  name: string;
  rank: string;
  bloodGroup: string;
  medicalCategory: 'FE (Fit Forward)' | 'Temporary Low Med' | 'Level II Hospitalized';
  doxycyclineTakenToday: boolean;
  yellowFeverValid: boolean;
  choleraValid: boolean;
  recentDiagnosis: string;
  allergies: string;
  medevacCategory: 'None' | 'Cat A (Immediate 2hr)' | 'Cat B (Priority 4hr)' | 'Cat C (Routine)';
  lastVitalsCheck: string;
}

export interface VehicleJobCard {
  id: string;
  jobCardNo: string;
  vehicleCallsign: string;
  unNumber: string;
  defectReported: string;
  partsReplaced: string[];
  technician: string;
  dateStarted: string;
  dateCompleted?: string;
  status: 'Under Repair' | 'Awaiting Spares' | 'Completed & Tested';
  mileageAtService: number;
}

export interface InventoryAsset {
  id: string;
  itemCode: string;
  name: string;
  category: 'Power & Generators' | 'Water Purification & RO' | 'Tents & Camp Accommodation' | 'Camp Fortification & Defense' | 'Catering & Field Kitchen' | 'Communications & IT';
  quantity: number;
  condition: 'Serviceable (UN COE Ready)' | 'Requires Maintenance' | 'Unserviceable / Write-Off';
  location: string;
  serialOrChassisNo: string;
  coeInspected: boolean;
  remarks: string;
}

export const INITIAL_PERSONNEL: Personnel[] = [
  {
    id: 'p-1',
    armyNo: 'BA-7891',
    unId: 'UN-CAR-4501',
    rank: 'Major',
    name: 'Fakrul Islam',
    platoon: 'Coy HQ',
    role: 'Company Commander',
    status: 'Present',
    weaponIssued: 'BD-08 Rifle #88123 & 9mm Browning #092',
    bloodGroup: 'B+',
    medicalCategory: 'FE (Fit Forward)',
    malariaProphylaxisTaken: true,
    nokName: 'Nasrin Sultana (Wife)',
    nokPhone: '+8801711000000',
  },
  {
    id: 'p-2',
    armyNo: 'BA-8240',
    unId: 'UN-CAR-4502',
    rank: 'Lieutenant',
    name: 'Tariq Rahman',
    platoon: '1 Platoon',
    role: '1 Platoon Commander / Patrol Comd',
    status: 'On Patrol',
    weaponIssued: 'BD-08 Rifle #88124',
    bloodGroup: 'O+',
    medicalCategory: 'FE (Fit Forward)',
    malariaProphylaxisTaken: true,
    nokName: 'Shaila Rahman (Mother)',
    nokPhone: '+8801711000001',
  },
  {
    id: 'p-3',
    armyNo: 'BA-8315',
    unId: 'UN-CAR-4503',
    rank: 'Lieutenant',
    name: 'Farhan Ashraf',
    platoon: '2 Platoon',
    role: '2 Platoon Commander',
    status: 'Present',
    weaponIssued: 'BD-08 Rifle #88125',
    bloodGroup: 'A+',
    medicalCategory: 'FE (Fit Forward)',
    malariaProphylaxisTaken: true,
    nokName: 'Nusrat Ashraf (Sister)',
    nokPhone: '+8801711000002',
  },
  {
    id: 'p-4',
    armyNo: 'BA-8422',
    unId: 'UN-CAR-4504',
    rank: 'Lieutenant',
    name: 'Tanvir Hossain',
    platoon: '3 Platoon',
    role: '3 Platoon Commander',
    status: 'Present',
    weaponIssued: 'BD-08 Rifle #88126',
    bloodGroup: 'AB+',
    medicalCategory: 'FE (Fit Forward)',
    malariaProphylaxisTaken: true,
    nokName: 'Kabir Hossain (Father)',
    nokPhone: '+8801711000003',
  },
  {
    id: 'p-5',
    armyNo: 'JCO-3421',
    unId: 'UN-CAR-4505',
    rank: 'Senior Warrant Officer',
    name: 'Matiur Rahman',
    platoon: 'Coy HQ',
    role: 'Company Senior Warrant Officer (SWO)',
    status: 'Duty Post',
    weaponIssued: 'BD-08 Rifle #88127',
    bloodGroup: 'A+',
    medicalCategory: 'FE (Fit Forward)',
    malariaProphylaxisTaken: true,
    nokName: 'Fatema Begum (Wife)',
    nokPhone: '+8801711000004',
  },
  {
    id: 'p-6',
    armyNo: 'JCO-3680',
    unId: 'UN-CAR-4506',
    rank: 'Warrant Officer',
    name: 'Anisul Haque',
    platoon: 'Support Weapons Platoon',
    role: 'Support Wpns Platoon Warrant Officer (WO)',
    status: 'Present',
    weaponIssued: 'BD-08 Rifle #88128',
    bloodGroup: 'O+',
    medicalCategory: 'FE (Fit Forward)',
    malariaProphylaxisTaken: true,
    nokName: 'Salma Haque (Wife)',
    nokPhone: '+8801711000005',
  },
  {
    id: 'p-7',
    armyNo: 'NCO-5510',
    unId: 'UN-CAR-4507',
    rank: 'Sergeant',
    name: 'Kabir Ahmed',
    platoon: 'Coy HQ',
    role: 'Company Quartermaster Sergeant (CQMS)',
    status: 'Present',
    weaponIssued: 'BD-08 Rifle #88129',
    bloodGroup: 'B+',
    medicalCategory: 'FE (Fit Forward)',
    malariaProphylaxisTaken: true,
    nokName: 'Rina Ahmed (Wife)',
    nokPhone: '+8801711000006',
  },
  {
    id: 'p-8',
    armyNo: 'NCO-5542',
    unId: 'UN-CAR-4508',
    rank: 'Sergeant',
    name: 'Mahbub Alam',
    platoon: '1 Platoon',
    role: 'Platoon Sergeant',
    status: 'On Patrol',
    weaponIssued: 'BD-08 Rifle #88130',
    bloodGroup: 'O-',
    medicalCategory: 'FE (Fit Forward)',
    malariaProphylaxisTaken: true,
    nokName: 'Rehana Alam (Wife)',
    nokPhone: '+8801711000007',
  },
  {
    id: 'p-9',
    armyNo: 'NCO-5612',
    unId: 'UN-CAR-4509',
    rank: 'Sergeant',
    name: 'Selim Reza',
    platoon: 'Coy HQ',
    role: 'Motor Transport Sergeant (MT / Workshop)',
    status: 'Present',
    weaponIssued: 'BD-08 Rifle #88131',
    bloodGroup: 'AB-',
    medicalCategory: 'FE (Fit Forward)',
    malariaProphylaxisTaken: true,
    nokName: 'Jahanara Reza (Wife)',
    nokPhone: '+8801711000008',
  },
  {
    id: 'p-10',
    armyNo: 'NCO-5701',
    unId: 'UN-CAR-4510',
    rank: 'Sergeant',
    name: 'Dr. (Asst) Golam Mostafa',
    platoon: 'Coy HQ',
    role: 'Nursing Medical Sergeant',
    status: 'Duty Post',
    weaponIssued: 'BD-08 Rifle #88132',
    bloodGroup: 'O+',
    medicalCategory: 'FE (Fit Forward)',
    malariaProphylaxisTaken: true,
    nokName: 'Nazma Mostafa (Wife)',
    nokPhone: '+8801711000009',
  },
  {
    id: 'p-11',
    armyNo: 'OR-8820',
    unId: 'UN-CAR-4511',
    rank: 'Corporal',
    name: 'Saidur Rahman',
    platoon: '1 Platoon',
    role: 'Section 2IC / BTR Gunner',
    status: 'On Patrol',
    weaponIssued: '12.7mm HMG & BD-08 Rifle #88133',
    bloodGroup: 'A+',
    medicalCategory: 'FE (Fit Forward)',
    malariaProphylaxisTaken: true,
    nokName: 'Moriom Begum (Mother)',
    nokPhone: '+8801711000010',
  },
  {
    id: 'p-12',
    armyNo: 'OR-8941',
    unId: 'UN-CAR-4512',
    rank: 'Private',
    name: 'Kamal Hossain',
    platoon: '2 Platoon',
    role: 'LMG Gunner',
    status: 'Sick Bay / Hospital',
    weaponIssued: 'Armory Storage',
    bloodGroup: 'O-',
    medicalCategory: 'Level II Hospitalized',
    malariaProphylaxisTaken: true,
    nokName: 'Rokeya Hossain (Wife)',
    nokPhone: '+8801711000011',
  },
  {
    id: 'p-13',
    armyNo: 'OR-9104',
    unId: 'UN-CAR-4513',
    rank: 'Private',
    name: 'Abdur Rashid',
    platoon: '3 Platoon',
    role: 'Rifleman / Sentry',
    status: 'Duty Post',
    weaponIssued: 'BD-08 Rifle #88135',
    bloodGroup: 'B+',
    medicalCategory: 'FE (Fit Forward)',
    malariaProphylaxisTaken: true,
    nokName: 'Amina Khatun (Mother)',
    nokPhone: '+8801711000012',
  },
  {
    id: 'p-14',
    armyNo: 'OR-9233',
    unId: 'UN-CAR-4514',
    rank: 'Private',
    name: 'Rafiqul Islam',
    platoon: '2 Platoon',
    role: 'Mortar Crew No 1',
    status: 'Leave / R&R',
    weaponIssued: 'Armory Storage',
    bloodGroup: 'AB+',
    medicalCategory: 'FE (Fit Forward)',
    malariaProphylaxisTaken: false,
    nokName: 'Salma Khatun (Wife)',
    nokPhone: '+8801711000013',
  },
  {
    id: 'p-15',
    armyNo: 'OR-9388',
    unId: 'UN-CAR-4515',
    rank: 'Private',
    name: 'Moniruzzaman Monir',
    platoon: 'Coy HQ',
    role: 'Commander Driver',
    status: 'Present',
    weaponIssued: 'BD-08 Rifle #88137',
    bloodGroup: 'O+',
    medicalCategory: 'FE (Fit Forward)',
    malariaProphylaxisTaken: true,
    nokName: 'Nasima Begum (Wife)',
    nokPhone: '+8801711000014',
  },
];

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'v-1',
    callsign: 'BA-1100101',
    unNumber: 'UN-3401',
    type: 'BTR-80 APC',
    platoon: '1 Platoon',
    driver: 'Sgt Mahbub Alam',
    commander: 'Lt Tariq Rahman',
    status: 'On-Road (Mission Ready)',
    fuelPercent: 88,
    fuelType: 'Diesel',
    mileageKm: 12450,
    lastServiceDate: '2026-10-01',
    nextServiceKm: 13500,
    currentLocation: 'En route Bambari to Ippy (MSR2)',
    faults: [],
  },
  {
    id: 'v-2',
    callsign: 'BA-1100102',
    unNumber: 'UN-3402',
    type: 'BTR-80 APC',
    platoon: '2 Platoon',
    driver: 'Cpl Selim',
    commander: 'Lt Farhan Ashraf',
    status: 'On-Road (Mission Ready)',
    fuelPercent: 75,
    fuelType: 'Diesel',
    mileageKm: 11800,
    lastServiceDate: '2026-10-05',
    nextServiceKm: 13000,
    currentLocation: 'Bambari COB Main Motor Pool',
    faults: [],
  },
  {
    id: 'v-3',
    callsign: 'BA-1100103',
    unNumber: 'UN-3403',
    type: 'BTR-80 APC',
    platoon: '3 Platoon',
    driver: 'L Cpl Belal',
    commander: 'Lt Tanvir Hossain',
    status: 'Amber (Maintenance Due)',
    fuelPercent: 62,
    fuelType: 'Diesel',
    mileageKm: 14920,
    lastServiceDate: '2026-09-12',
    nextServiceKm: 15000,
    currentLocation: 'Bambari Workshop Bay 2',
    faults: ['Brake shoe adjustment due', 'Right headlamp bulb blown'],
  },
  {
    id: 'v-4',
    callsign: 'BA-1100104',
    unNumber: 'UN-3404',
    type: 'Armored Patrol Vehicle',
    platoon: '1 Platoon',
    driver: 'Pvt Jahangir',
    commander: 'WO Anisul Haque',
    status: 'On-Road (Mission Ready)',
    fuelPercent: 92,
    fuelType: 'Diesel',
    mileageKm: 9340,
    lastServiceDate: '2026-10-08',
    nextServiceKm: 11000,
    currentLocation: 'Bria FOB Patrol Base',
    faults: [],
  },
  {
    id: 'v-5',
    callsign: 'BA-1100105',
    unNumber: 'UN-3405',
    type: '4x4 Land Cruiser',
    platoon: 'Coy HQ',
    driver: 'Pvt Moniruzzaman',
    commander: 'Maj Fakrul Islam',
    status: 'On-Road (Mission Ready)',
    fuelPercent: 95,
    fuelType: 'Diesel',
    mileageKm: 7800,
    lastServiceDate: '2026-10-12',
    nextServiceKm: 10000,
    currentLocation: 'Bambari COB Tactical Command Post',
    faults: [],
  },
  {
    id: 'v-6',
    callsign: 'BA-1100106',
    unNumber: 'UN-3406',
    type: '4x4 Land Cruiser',
    platoon: 'Coy HQ',
    driver: 'Pvt Mizanur',
    commander: 'SWO Matiur Rahman',
    status: 'On-Road (Mission Ready)',
    fuelPercent: 80,
    fuelType: 'Diesel',
    mileageKm: 10450,
    lastServiceDate: '2026-09-28',
    nextServiceKm: 12000,
    currentLocation: 'Escort Convoy Sibut - Bambari',
    faults: [],
  },
  {
    id: 'v-7',
    callsign: 'BA-1100107',
    unNumber: 'UN-3407',
    type: 'Logistics Truck',
    platoon: 'Coy HQ / QM',
    driver: 'Pvt Akram',
    commander: 'Sgt Kabir Ahmed',
    status: 'On-Road (Mission Ready)',
    fuelPercent: 70,
    fuelType: 'Diesel',
    mileageKm: 18200,
    lastServiceDate: '2026-09-18',
    nextServiceKm: 20000,
    currentLocation: 'Bambari Supply Depo',
    faults: [],
  },
  {
    id: 'v-8',
    callsign: 'BA-1100108',
    unNumber: 'UN-3408',
    type: 'Ambulance',
    platoon: 'Medical Det',
    driver: 'Pvt Joynal',
    commander: 'Sgt Dr. Golam Mostafa',
    status: 'On-Road (Mission Ready)',
    fuelPercent: 100,
    fuelType: 'Diesel',
    mileageKm: 6500,
    lastServiceDate: '2026-10-14',
    nextServiceKm: 8500,
    currentLocation: 'Level I Sick Bay Bambari',
    faults: [],
  },
  {
    id: 'v-9',
    callsign: 'BA-1100109',
    unNumber: 'UN-3409',
    type: 'Water Bowser',
    platoon: 'Coy HQ',
    driver: 'Pvt Shafiul',
    commander: 'Cpl Reza',
    status: 'On-Road (Mission Ready)',
    fuelPercent: 85,
    fuelType: 'Diesel',
    mileageKm: 13200,
    lastServiceDate: '2026-10-02',
    nextServiceKm: 15000,
    currentLocation: 'Ouaka River Water Point Bambari',
    faults: [],
  },
  {
    id: 'v-10',
    callsign: 'BA-1100110',
    unNumber: 'UN-3410',
    type: '4x4 Land Cruiser',
    platoon: 'Coy HQ',
    driver: 'Pvt Sohel',
    commander: 'Sgt Selim Reza',
    status: 'Off-Road (Deadlined)',
    fuelPercent: 35,
    fuelType: 'Diesel',
    mileageKm: 21400,
    lastServiceDate: '2026-08-14',
    nextServiceKm: 21000,
    currentLocation: 'Bambari EME Workshop Bay 1',
    faults: ['Alternator short circuit', 'Awaiting alternator assembly from Bangui UN Logistics Base'],
  },
];

export const INITIAL_WEAPONS: WeaponItem[] = [
  { id: 'w-1', serialNo: 'BD08-88123', type: 'BD-08 Rifle', platoon: 'Coy HQ', assignedTo: 'Maj Fakrul Islam', status: 'Issued on Patrol', condition: 'Serviceable', lastCleanedDate: '2026-10-15', zeroed: true },
  { id: 'w-2', serialNo: 'BD08-88124', type: 'BD-08 Rifle', platoon: '1 Platoon', assignedTo: 'Lt Tariq Rahman', status: 'Issued on Patrol', condition: 'Serviceable', lastCleanedDate: '2026-10-14', zeroed: true },
  { id: 'w-3', serialNo: 'BD08-88125', type: 'BD-08 Rifle', platoon: '2 Platoon', assignedTo: 'Lt Farhan Ashraf', status: 'In Armory', condition: 'Serviceable', lastCleanedDate: '2026-10-12', zeroed: true },
  { id: 'w-4', serialNo: 'BD08-88127', type: 'BD-08 Rifle', platoon: 'Coy HQ', assignedTo: 'SWO Matiur Rahman', status: 'Camp Defense Post', condition: 'Serviceable', lastCleanedDate: '2026-10-13', zeroed: true },
  { id: 'w-5', serialNo: 'PKM-4401', type: 'PKM LMG', platoon: '1 Platoon', assignedTo: 'Cpl Saidur Rahman', status: 'Issued on Patrol', condition: 'Serviceable', lastCleanedDate: '2026-10-14', zeroed: true },
  { id: 'w-6', serialNo: 'PKM-4402', type: 'PKM LMG', platoon: '2 Platoon', assignedTo: 'Pvt Kamal Hossain', status: 'In Armory', condition: 'Serviceable', lastCleanedDate: '2026-10-10', zeroed: true },
  { id: 'w-7', serialNo: 'RPG-701', type: 'RPG-7 Launcher', platoon: 'Support Weapons Platoon', assignedTo: 'L Cpl Karim', status: 'In Armory', condition: 'Serviceable', lastCleanedDate: '2026-10-09', zeroed: true },
  { id: 'w-8', serialNo: 'MORT-60-01', type: '60mm Mortar', platoon: 'Support Weapons Platoon', assignedTo: 'WO Anisul Haque', status: 'Camp Defense Post', condition: 'Serviceable', lastCleanedDate: '2026-10-11', zeroed: true },
  { id: 'w-9', serialNo: 'HMG-127-01', type: '12.7mm HMG', platoon: '1 Platoon', assignedTo: 'Mounted on UN-3401 (BTR-80)', status: 'Issued on Patrol', condition: 'Serviceable', lastCleanedDate: '2026-10-14', zeroed: true },
  { id: 'w-10', serialNo: 'PIST-9MM-092', type: '9mm Pistol', platoon: 'Coy HQ', assignedTo: 'Maj Fakrul Islam', status: 'Issued on Patrol', condition: 'Serviceable', lastCleanedDate: '2026-10-15', zeroed: true },
];

export const INITIAL_AMMUNITION: AmmunitionStock[] = [
  { caliber: '7.62x39mm Ball', name: 'Rifle 7.62mm Standard Ball', firstLineRounds: 15000, secondLineReserve: 32000, totalRounds: 47000, criticalThreshold: 10000, unit: 'Rounds' },
  { caliber: '7.62x54R Linked', name: 'PKM Machine Gun Linked Belt', firstLineRounds: 6000, secondLineReserve: 14000, totalRounds: 20000, criticalThreshold: 5000, unit: 'Rounds' },
  { caliber: '12.7x108mm AP', name: 'HMG BTR-Mounted Armor Piercing', firstLineRounds: 1200, secondLineReserve: 3800, totalRounds: 5000, criticalThreshold: 1500, unit: 'Rounds' },
  { caliber: '9x19mm Parabellum', name: 'Pistol Ball Round', firstLineRounds: 600, secondLineReserve: 1900, totalRounds: 2500, criticalThreshold: 500, unit: 'Rounds' },
  { caliber: '60mm Mortar HE', name: 'High Explosive Mortar Bombs', firstLineRounds: 36, secondLineReserve: 160, totalRounds: 196, criticalThreshold: 50, unit: 'Bombs' },
  { caliber: 'RPG-7 PG-7V', name: 'Heat Anti-Tank Rockets', firstLineRounds: 12, secondLineReserve: 48, totalRounds: 60, criticalThreshold: 15, unit: 'Rockets' },
  { caliber: 'Smoke & Signal Flares', name: 'Illumination & Smoke Grenades', firstLineRounds: 24, secondLineReserve: 80, totalRounds: 104, criticalThreshold: 20, unit: 'Canisters' },
];

export const INITIAL_DUTY_ROSTER: DutyShift[] = [
  { id: 'd-1', shiftName: '0000 - 0600 hrs (Night Watch)', postName: 'Post Alpha: Main Camp Entrance (Morro Gate)', personnelName: 'Pvt Abdur Rashid', armyNo: 'OR-9104', rank: 'Private', weapon: 'BD-08 Rifle + NVD PVS-14', status: 'Relieved', supervisor: 'SWO Matiur' },
  { id: 'd-2', shiftName: '0600 - 1200 hrs (Morning Watch)', postName: 'Post Alpha: Main Camp Entrance (Morro Gate)', personnelName: 'L Cpl Karim', armyNo: 'OR-8930', rank: 'Lance Corporal', weapon: 'BD-08 Rifle', status: 'Relieved', supervisor: 'SWO Matiur' },
  { id: 'd-3', shiftName: '1200 - 1800 hrs (Afternoon Watch)', postName: 'Post Alpha: Main Camp Entrance (Morro Gate)', personnelName: 'Pvt Jahangir Alam', armyNo: 'OR-9150', rank: 'Private', weapon: 'BD-08 Rifle', status: 'On Duty', supervisor: 'SWO Matiur' },
  { id: 'd-4', shiftName: '1800 - 2400 hrs (Evening Vigil)', postName: 'Post Alpha: Main Camp Entrance (Morro Gate)', personnelName: 'Pvt Sohel Rana', armyNo: 'OR-9402', rank: 'Private', weapon: 'BD-08 Rifle + NVD PVS-14', status: 'Upcoming', supervisor: 'SWO Matiur' },

  { id: 'd-5', shiftName: '1200 - 1800 hrs (Afternoon Watch)', postName: 'Post Bravo: North Perimeter Watchtower', personnelName: 'Pvt Shafiqul Islam', armyNo: 'OR-9221', rank: 'Private', weapon: 'PKM LMG #4402', status: 'On Duty', supervisor: 'Sgt Kabir' },
  { id: 'd-6', shiftName: '1200 - 1800 hrs (Afternoon Watch)', postName: 'Post Charlie: Bunker & Armory Vault', personnelName: 'L Cpl Belal', armyNo: 'OR-8990', rank: 'Lance Corporal', weapon: 'BD-08 Rifle', status: 'On Duty', supervisor: 'Sgt Kabir' },
  { id: 'd-7', shiftName: '1200 - 1800 hrs (Afternoon Watch)', postName: 'TOC Operations Room Duty Officer', personnelName: 'Lt Farhan Ashraf', armyNo: 'BA-8315', rank: 'Lieutenant', weapon: 'BD-08 Rifle & Motorola HF', status: 'On Duty', supervisor: 'Maj Fakrul' },
  { id: 'd-8', shiftName: '1200 - 1800 hrs (Afternoon Watch)', postName: 'QRT Quick Reaction Section Commander', personnelName: 'Sgt Selim Reza', armyNo: 'NCO-5612', rank: 'Sergeant', weapon: 'BD-08 Rifle + BTR-80 #UN-3402', status: 'On Duty', supervisor: 'Maj Fakrul' },
];

export const INITIAL_PATROLS: ActivePatrol[] = [
  {
    id: 'pat-1',
    callsign: 'EAGLE 1',
    missionType: 'Route Recon',
    commander: 'Lt Tariq Rahman (BA-8240)',
    strength: 18,
    vehicles: ['UN-3401 (BTR-80)', 'UN-3405 (Land Cruiser)'],
    departureTime: '2026-10-17 07:30',
    expectedReturn: '2026-10-17 17:00',
    locationName: 'MSR2 Km 38 (Between Bambari & Ippy)',
    lat: 5.758,
    lng: 20.675,
    status: 'Active Moving',
    speedKmH: 38,
    lastCommsTime: '3 mins ago (13:42)',
    commsStatus: 'Green (VHF/HF Strong)',
    sitrep: 'Conducting route security along MSR2. Local village elders at Ngakobo reported no presence of anti-balaka or UPC elements. Road passable for heavy BTRs.',
    waypoints: [
      { name: 'Bambari COB Gate', lat: 5.768, lng: 20.665, passed: true },
      { name: 'Ouaka River Bridge', lat: 5.755, lng: 20.680, passed: true },
      { name: 'Ngakobo IDP Camp', lat: 5.720, lng: 20.730, passed: true },
      { name: 'Ippy Junction Waypoint 4', lat: 5.680, lng: 20.810, passed: false },
      { name: 'Return to Base', lat: 5.768, lng: 20.665, passed: false },
    ],
  },
  {
    id: 'pat-2',
    callsign: 'COBRA 2',
    missionType: 'Market Security & CIMIC',
    commander: 'WO Anisul Haque',
    strength: 14,
    vehicles: ['UN-3404 (Armored Patrol)'],
    departureTime: '2026-10-17 09:00',
    expectedReturn: '2026-10-17 15:30',
    locationName: 'Bambari Central Market & Hospital Perimeter',
    lat: 5.772,
    lng: 20.655,
    status: 'Static Security',
    speedKmH: 0,
    lastCommsTime: '7 mins ago (13:38)',
    commsStatus: 'Green (VHF/HF Strong)',
    sitrep: 'Static presence maintained outside Saint Joseph Cathedral and central open market. High civilian confidence. Distributed 200L clean drinking water from water bowser.',
    waypoints: [
      { name: 'Bambari Base', lat: 5.768, lng: 20.665, passed: true },
      { name: 'Market Central Square', lat: 5.772, lng: 20.655, passed: true },
      { name: 'Prefecture Office Checkpoint', lat: 5.775, lng: 20.648, passed: false },
    ],
  },
  {
    id: 'pat-3',
    callsign: 'CONVOY VIPER',
    missionType: 'Logistics Convoy Escort',
    commander: 'SWO Matiur Rahman',
    strength: 24,
    vehicles: ['UN-3406 (Land Cruiser)', 'UN-3407 (Logistics Truck)', 'UN-3409 (Bowser)'],
    departureTime: '2026-10-17 06:00',
    expectedReturn: '2026-10-17 18:30',
    locationName: 'MSR1 near Grimari (heading east towards Bambari)',
    lat: 5.733,
    lng: 19.983,
    status: 'Active Moving',
    speedKmH: 48,
    lastCommsTime: '11 mins ago (13:34)',
    commsStatus: 'Green (VHF/HF Strong)',
    sitrep: 'Escorting UN World Food Programme (WFP) grain trucks and company fresh rations from Sibut warehouse. Road condition dry, convoy moving steadily without disruption.',
    waypoints: [
      { name: 'Sibut Junction', lat: 5.730, lng: 19.080, passed: true },
      { name: 'Grimari Checkpoint', lat: 5.733, lng: 19.983, passed: true },
      { name: 'Bambari Western Checkpoint', lat: 5.760, lng: 20.640, passed: false },
    ],
  },
  {
    id: 'pat-4',
    callsign: 'QRT STANDBY',
    missionType: 'QRT Standby',
    commander: 'Lt. Farhan Ashraf',
    strength: 16,
    vehicles: ['UN-3402 (BTR-80 APC)'],
    departureTime: '2026-10-17 00:00',
    expectedReturn: '2026-10-17 23:59',
    locationName: 'Bambari COB Readiness Bay 1',
    lat: 5.768,
    lng: 20.665,
    status: 'Static Security',
    speedKmH: 0,
    lastCommsTime: '1 min ago (13:44)',
    commsStatus: 'Green (VHF/HF Strong)',
    sitrep: 'Quick Reaction Team mounted on BTR-80 in 5-minute standby posture. Weapons primed, engines pre-heated, comms linked to Sector West TOC.',
    waypoints: [
      { name: 'Bambari COB Staging Area', lat: 5.768, lng: 20.665, passed: true },
    ],
  },
];

export const INITIAL_RATION: RationState = {
  dryRationKg: 4200, // For 125 men -> 150 kg/day -> 28 Days of Supply
  mrePacks: 1850, // 1850 packs -> ~15 DOS
  bottledWaterLiters: 9800, // For 125 men -> 562 L/day -> 17.4 DOS
  freshVegetablesKg: 480,
  meatFrozenKg: 620,
  cookingGasCylinders: 24,
};

export const INITIAL_LEGAL_CASES: LegalDisciplineCase[] = [
  {
    id: 'leg-1',
    caseNumber: 'DISC-CAR-2026-001',
    dateLogged: '2026-09-22',
    accusedPersonnel: 'Pvt Tariqul Islam',
    rank: 'Private',
    armyNo: 'OR-9114',
    category: 'Curfew / Out of Bounds',
    description: 'Found outside the designated camp perimeter boundary after 2100 hrs without operational duty slip or buddy pair near Bambari northern market.',
    investigatingOfficer: 'SWO Matiur Rahman',
    status: 'Disposed / Closed',
    punishmentOrFinding: 'Summary Trial by Company Commander under Army Act Sec 38. Awarded 14 days rigorous confinement to camp lines and severe reprimand.',
    documents: [
      { name: 'Charge_Sheet_Signed.pdf', size: '240 KB', date: '2026-09-23' },
      { name: 'Sentry_Statement_PostAlpha.pdf', size: '180 KB', date: '2026-09-23' },
      { name: 'Summary_Trial_Record_MajFakrul.pdf', size: '510 KB', date: '2026-09-25' },
    ],
    confidential: false,
  },
  {
    id: 'leg-2',
    caseNumber: 'DISC-CAR-2026-002',
    dateLogged: '2026-10-02',
    accusedPersonnel: 'L Cpl Rafiqul Hasan',
    rank: 'Lance Corporal',
    armyNo: 'OR-8922',
    category: 'Unintentional Discharge',
    description: 'Accidental discharge of single 7.62mm round into standard weapon clearing sand barrel during post-patrol unloading drill. No injuries occurred.',
    investigatingOfficer: 'Lt Farhan Ashraf',
    status: 'Disposed / Closed',
    punishmentOrFinding: 'Court of Inquiry confirmed faulty sear trigger spring combined with minor negligence. Weapon sent for armorer overhaul. Awarded 7 days forfeiture of pay.',
    documents: [
      { name: 'COI_Convening_Order.pdf', size: '190 KB', date: '2026-10-03' },
      { name: 'Technical_Inspection_Report_Armorer.pdf', size: '320 KB', date: '2026-10-04' },
      { name: 'Commander_Final_Order.pdf', size: '280 KB', date: '2026-10-06' },
    ],
    confidential: false,
  },
  {
    id: 'leg-3',
    caseNumber: 'DISC-CAR-2026-003',
    dateLogged: '2026-10-11',
    accusedPersonnel: 'Pvt Nazmul Huda',
    rank: 'Private',
    armyNo: 'OR-9340',
    category: 'Equipment / Kit Loss',
    description: 'Reported missing 1x Motorola VHF tactical radio rechargeable battery pack following joint patrol escort along MSR2.',
    investigatingOfficer: 'WO Anisul Haque',
    status: 'Summary Trial',
    punishmentOrFinding: 'Under Summary Trial proceeding. Loss evaluated at $65 USD UN replacement rate. Awaiting final commander deduction confirmation.',
    documents: [
      { name: 'Loss_Report_Part_I.pdf', size: '150 KB', date: '2026-10-12' },
      { name: 'CQMS_Store_Verification.pdf', size: '210 KB', date: '2026-10-13' },
    ],
    confidential: false,
  },
  {
    id: 'leg-4',
    caseNumber: 'DISC-CAR-2026-004',
    dateLogged: '2026-10-14',
    accusedPersonnel: 'Company Contingent General Audit',
    rank: 'All Personnel',
    armyNo: 'UNIT-WIDE',
    category: 'SEA Zero-Tolerance',
    description: 'Quarterly UN MINUSCA Conduct & Discipline Team (CDT) compliance inspection and SEA preventative briefing assessment for 125 personnel.',
    investigatingOfficer: 'Maj Fakrul Islam (Coy Comd)',
    status: 'Disposed / Closed',
    punishmentOrFinding: '100% compliant. Zero SEA complaints, zero fraternization breaches. Full signed compliance declarations filed with Sector West HQ.',
    documents: [
      { name: 'UN_CDT_Compliance_Audit_Pass.pdf', size: '890 KB', date: '2026-10-15' },
      { name: 'SEA_Zero_Tolerance_Roster_Signed.pdf', size: '1.2 MB', date: '2026-10-15' },
    ],
    confidential: false,
  },
];

export const INITIAL_LEAVES: LeaveRecord[] = [
  { id: 'l-1', armyNo: 'OR-9233', name: 'Rafiqul Islam', rank: 'Private', platoon: '2 Platoon', leaveType: 'R&R (21 Days)', startDate: '2026-10-05', endDate: '2026-10-26', daysRemaining: 10, flightDetails: 'UNHAS Flight Bangui -> Entebbe -> Dhaka', handoverTo: 'Pvt Abdur Rashid', approvalStatus: 'Approved by Commander', contactPhone: '+8801711223344' },
  { id: 'l-2', armyNo: 'NCO-5512', name: 'Kabirul Islam', rank: 'Sergeant', platoon: '1 Platoon', leaveType: 'R&R (21 Days)', startDate: '2026-10-10', endDate: '2026-10-31', daysRemaining: 15, flightDetails: 'UNHAS Flight Bangui -> Addis -> Dhaka', handoverTo: 'Sgt Mahbub Alam', approvalStatus: 'Approved by Commander', contactPhone: '+8801711223355' },
  { id: 'l-3', armyNo: 'OR-9055', name: 'Masud Rana', rank: 'Private', platoon: '3 Platoon', leaveType: 'Compassionate Leave', startDate: '2026-10-12', endDate: '2026-10-27', daysRemaining: 11, flightDetails: 'Emergency UN Medevac/Cargo Link', handoverTo: 'L Cpl Karim', approvalStatus: 'Approved by Commander', contactPhone: '+8801711223366' },
  { id: 'l-4', armyNo: 'BA-8240', name: 'Lt Tariq Rahman', rank: 'Lieutenant', platoon: '1 Platoon', leaveType: 'R&R (21 Days)', startDate: '2026-11-01', endDate: '2026-11-22', daysRemaining: 21, flightDetails: 'Scheduled UNHAS Flight Slot #114', handoverTo: 'Lt Farhan Ashraf', approvalStatus: 'Pending Recommendation', contactPhone: '+8801711223377' },
];

export const INITIAL_TRANSACTIONS: ExpenseTransaction[] = [
  { id: 'tx-1', date: '2026-10-02', description: 'Procurement of 600 heavy sandbags from Bambari local market for perimeter bunker revetment', category: 'Camp Fortification', amountUSD: 450, approvedBy: 'Maj Fakrul Islam', currency: 'USD', status: 'Approved' },
  { id: 'tx-2', date: '2026-10-05', description: 'Emergency hydraulic hose replacement and vulcanizing for BTR-80 (UN-3401)', category: 'Vehicle Spares', amountUSD: 220, approvedBy: 'Maj Fakrul Islam', currency: 'USD', status: 'Approved' },
  { id: 'tx-3', date: '2026-10-09', description: 'Emergency oral rehydration salts, IV saline drips & surgical tape from Bambari pharmacy', category: 'Emergency Medical', amountUSD: 180, approvedBy: 'Maj Fakrul Islam', currency: 'USD', status: 'Approved' },
  { id: 'tx-4', date: '2026-10-12', description: 'Stipend for 2x local Sango/French civilian interpreters during CIMIC market patrols', category: 'CIMIC / Goodwill', amountUSD: 250, approvedBy: 'Maj Fakrul Islam', currency: 'USD', status: 'Approved' },
  { id: 'tx-5', date: '2026-10-14', description: 'Emergency fuel procurement for water pump at Ouaka River water purification point', category: 'Water / Generator Fuel', amountUSD: 320, approvedBy: 'Maj Fakrul Islam', currency: 'USD', status: 'Approved' },
  { id: 'tx-6', date: '2026-10-16', description: 'Waterproof tarpaulins and timber poles for camp ammunition shade cover', category: 'Camp Fortification', amountUSD: 350, approvedBy: 'Pending Commander Sign-off', currency: 'USD', status: 'Pending Commander Sign-off' },
];

export const INITIAL_MEDICAL_RECORDS: MedicalRecord[] = [
  { id: 'med-1', armyNo: 'BA-7891', name: 'Maj Fakrul Islam', rank: 'Major', bloodGroup: 'B+', medicalCategory: 'FE (Fit Forward)', doxycyclineTakenToday: true, yellowFeverValid: true, choleraValid: true, recentDiagnosis: 'None / Fit', allergies: 'Penicillin (Mild rash)', medevacCategory: 'None', lastVitalsCheck: '2026-10-14' },
  { id: 'med-2', armyNo: 'OR-8941', name: 'Pvt Kamal Hossain', rank: 'Private', bloodGroup: 'O-', medicalCategory: 'Level II Hospitalized', doxycyclineTakenToday: true, yellowFeverValid: true, choleraValid: true, recentDiagnosis: 'Plasmodium Falciparum Malaria (Under IV Artesunate)', allergies: 'None known', medevacCategory: 'Cat B (Priority 4hr)', lastVitalsCheck: '2026-10-17 08:00' },
  { id: 'med-3', armyNo: 'OR-9104', name: 'Pvt Abdur Rashid', rank: 'Private', bloodGroup: 'B+', medicalCategory: 'FE (Fit Forward)', doxycyclineTakenToday: true, yellowFeverValid: true, choleraValid: true, recentDiagnosis: 'Acute heat fatigue (Treated with IV fluids)', allergies: 'Sulfa drugs', medevacCategory: 'None', lastVitalsCheck: '2026-10-16' },
  { id: 'med-4', armyNo: 'OR-9233', name: 'Pvt Rafiqul Islam', rank: 'Private', bloodGroup: 'AB+', medicalCategory: 'FE (Fit Forward)', doxycyclineTakenToday: false, yellowFeverValid: true, choleraValid: true, recentDiagnosis: 'On R&R Leave', allergies: 'None', medevacCategory: 'None', lastVitalsCheck: '2026-10-04' },
  { id: 'med-5', armyNo: 'NCO-5542', name: 'Sgt Mahbub Alam', rank: 'Sergeant', bloodGroup: 'O-', medicalCategory: 'FE (Fit Forward)', doxycyclineTakenToday: true, yellowFeverValid: true, choleraValid: true, recentDiagnosis: 'Mild lumbar muscle spasm (Topical gel applied)', allergies: 'None', medevacCategory: 'None', lastVitalsCheck: '2026-10-15' },
];

export const INITIAL_JOB_CARDS: VehicleJobCard[] = [
  { id: 'jc-1', jobCardNo: 'JC-CAR-101', vehicleCallsign: 'BA-1100101', unNumber: 'UN-3401', defectReported: 'Hydraulic steering high-pressure hose weeping fluid', partsReplaced: ['Hydraulic Hose 3/8"', 'O-Ring kit', '15W40 Oil 5L'], technician: 'Sgt Selim Reza (MT)', dateStarted: '2026-10-05', dateCompleted: '2026-10-06', status: 'Completed & Tested', mileageAtService: 12400 },
  { id: 'jc-2', jobCardNo: 'JC-CAR-102', vehicleCallsign: 'BA-1100103', unNumber: 'UN-3403', defectReported: 'Brake drum overheating and brake shoe friction wear', partsReplaced: ['Brake shoes rear pair', 'Return springs'], technician: 'Cpl Kabir (EME)', dateStarted: '2026-10-14', status: 'Under Repair', mileageAtService: 14920 },
  { id: 'jc-3', jobCardNo: 'JC-CAR-103', vehicleCallsign: 'BA-1100110', unNumber: 'UN-3410', defectReported: 'Alternator failure - battery not charging, 0V stator output', partsReplaced: [], technician: 'Sgt Selim Reza (MT)', dateStarted: '2026-10-12', status: 'Awaiting Spares', mileageAtService: 21400 },
  { id: 'jc-4', jobCardNo: 'JC-CAR-104', vehicleCallsign: 'BA-1100105', unNumber: 'UN-3405', defectReported: 'Periodic 7,500km preventative maintenance service', partsReplaced: ['Engine Oil Shell Rimula 8L', 'Oil Filter', 'Fuel Filter', 'Air Pre-cleaner blowout'], technician: 'Pvt Akram (Mech)', dateStarted: '2026-10-11', dateCompleted: '2026-10-12', status: 'Completed & Tested', mileageAtService: 7800 },
];

export const INITIAL_INVENTORY: InventoryAsset[] = [
  { id: 'inv-1', itemCode: 'COE-GEN-01', name: 'Caterpillar 100 kVA Diesel Generator', category: 'Power & Generators', quantity: 2, condition: 'Serviceable (UN COE Ready)', location: 'Bambari Base Generator Bunker', serialOrChassisNo: 'CAT-C4-892110', coeInspected: true, remarks: 'Running 12h rotation. Output 400V/50Hz stable.' },
  { id: 'inv-2', itemCode: 'COE-GEN-02', name: 'Perkins 60 kVA Silent Backup Generator', category: 'Power & Generators', quantity: 1, condition: 'Serviceable (UN COE Ready)', location: 'TOC Operations Shelter', serialOrChassisNo: 'PRK-60K-45210', coeInspected: true, remarks: 'Automatic transfer switch operational.' },
  { id: 'inv-3', itemCode: 'COE-WAT-01', name: 'Reverse Osmosis (RO) Water Purification Plant 2000 L/hr', category: 'Water Purification & RO', quantity: 1, condition: 'Serviceable (UN COE Ready)', location: 'Ouaka River Treatment Base', serialOrChassisNo: 'RO-CAR-2000-04', coeInspected: true, remarks: 'TDS tested daily at 45 ppm. Chlorine dosing calibrated.' },
  { id: 'inv-4', itemCode: 'COE-TNT-01', name: 'Heavy Duty UN All-Weather Modular Billeting Tents with 24000 BTU AC', category: 'Tents & Camp Accommodation', quantity: 14, condition: 'Serviceable (UN COE Ready)', location: 'Company Living Lines', serialOrChassisNo: 'TNT-UN-500-MOD', coeInspected: true, remarks: 'All insulated double-fly roofs intact.' },
  { id: 'inv-5', itemCode: 'COE-DEF-01', name: 'HESCO Bastion Mil-1 Defense Barrier Units (Set of 100)', category: 'Camp Fortification & Defense', quantity: 5, condition: 'Serviceable (UN COE Ready)', location: 'Perimeter Wall & Guard Post Revetments', serialOrChassisNo: 'HSC-MIL1-SET', coeInspected: true, remarks: 'Filled with compacted river gravel.' },
  { id: 'inv-6', itemCode: 'COE-KIT-01', name: 'Commercial Field Kitchen Trailer with Kerosene Burners', category: 'Catering & Field Kitchen', quantity: 1, condition: 'Serviceable (UN COE Ready)', location: 'Central Cookhouse Bambari', serialOrChassisNo: 'FK-CAR-902', coeInspected: true, remarks: 'Clean and fully compliant with UN Food Safety Standards.' },
  { id: 'inv-7', itemCode: 'COE-COM-01', name: 'Barrett 2050 HF Tactical Base Station with Solar Power', category: 'Communications & IT', quantity: 2, condition: 'Serviceable (UN COE Ready)', location: 'TOC Signals Room', serialOrChassisNo: 'BRT-HF-2050-99', coeInspected: true, remarks: 'Maintains link to Sector West HQ 24/7.' },
];
