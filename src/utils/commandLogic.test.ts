import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateManpowerSummary,
  calculateRationDOS,
  calculateFleetReadiness,
  calculateRollingMoney,
  filterPersonnel,
} from './commandLogic.ts';
import type {
  Personnel,
  Vehicle,
  RationState,
  ExpenseTransaction,
} from './commandLogic.ts';

const mockPersonnel: Personnel[] = [
  {
    id: 'p-1',
    armyNo: 'BA-7891',
    unId: 'UN-CAR-4501',
    rank: 'Major',
    name: 'Fakrul Islam',
    platoon: 'Coy HQ',
    role: 'Company Commander',
    status: 'Present',
    weaponIssued: 'BD-08 Rifle #88123',
    bloodGroup: 'B+',
    medicalCategory: 'FE (Fit Forward)',
    malariaProphylaxisTaken: true,
    nokName: 'Nasrin Sultana',
    nokPhone: '+8801711000000',
  },
  {
    id: 'p-2',
    armyNo: 'BA-8240',
    unId: 'UN-CAR-4502',
    rank: 'Lieutenant',
    name: 'Tariq Rahman',
    platoon: '1 Platoon',
    role: '1 Platoon Commander',
    status: 'On Patrol',
    weaponIssued: 'BD-08 Rifle #88124',
    bloodGroup: 'O+',
    medicalCategory: 'FE (Fit Forward)',
    malariaProphylaxisTaken: true,
    nokName: 'Shaila Rahman',
    nokPhone: '+8801711000001',
  },
  {
    id: 'p-3',
    armyNo: 'JCO-3421',
    unId: 'UN-CAR-4503',
    rank: 'Senior Warrant Officer',
    name: 'Matiur Rahman',
    platoon: 'Coy HQ',
    role: 'Company Senior Warrant Officer (SWO)',
    status: 'Duty Post',
    weaponIssued: 'BD-08 Rifle #88125',
    bloodGroup: 'A+',
    medicalCategory: 'FE (Fit Forward)',
    malariaProphylaxisTaken: true,
    nokName: 'Fatema Begum',
    nokPhone: '+8801711000002',
  },
  {
    id: 'p-4',
    armyNo: 'OR-9912',
    unId: 'UN-CAR-4504',
    rank: 'Private',
    name: 'Rafiqul Islam',
    platoon: '2 Platoon',
    role: 'Rifleman',
    status: 'Leave / R&R',
    weaponIssued: 'Armory Storage',
    bloodGroup: 'AB+',
    medicalCategory: 'FE (Fit Forward)',
    malariaProphylaxisTaken: false,
    nokName: 'Salma Khatun',
    nokPhone: '+8801711000003',
  },
  {
    id: 'p-5',
    armyNo: 'OR-9915',
    unId: 'UN-CAR-4505',
    rank: 'Private',
    name: 'Kamal Hossain',
    platoon: '3 Platoon',
    role: 'LMG Gunner',
    status: 'Sick Bay / Hospital',
    weaponIssued: 'Armory Storage',
    bloodGroup: 'O-',
    medicalCategory: 'Level II Hospitalized',
    malariaProphylaxisTaken: true,
    nokName: 'Rokeya Hossain',
    nokPhone: '+8801711000004',
  },
];

test('calculateManpowerSummary computes accurate strength and readiness', () => {
  const summary = calculateManpowerSummary(mockPersonnel);
  assert.equal(summary.totalPosted, 5);
  assert.equal(summary.present, 1);
  assert.equal(summary.onPatrol, 1);
  assert.equal(summary.onDuty, 1);
  assert.equal(summary.onLeave, 1);
  assert.equal(summary.sick, 1);
  assert.equal(summary.effectiveFightingStrength, 3);
  assert.equal(summary.operationalReadinessPercent, 60);
});

test('calculateRationDOS computes days of supply accurately and sets correct alert level', () => {
  const ration: RationState = {
    dryRationKg: 1200,
    mrePacks: 200,
    bottledWaterLiters: 4500,
    freshVegetablesKg: 150,
    meatFrozenKg: 200,
    cookingGasCylinders: 12,
  };
  const dos = calculateRationDOS(ration, 100);
  assert.equal(dos.dryRationDOS, 10);
  assert.equal(dos.mreDOS, 2);
  assert.equal(dos.waterDOS, 10);
  assert.equal(dos.minDOS, 2);
  assert.equal(dos.alertLevel, 'Critical');

  const wellStocked: RationState = {
    dryRationKg: 3600,
    mrePacks: 1500,
    bottledWaterLiters: 9000,
    freshVegetablesKg: 400,
    meatFrozenKg: 400,
    cookingGasCylinders: 20,
  };
  const dosSafe = calculateRationDOS(wellStocked, 100);
  assert.equal(dosSafe.minDOS, 15);
  assert.equal(dosSafe.alertLevel, 'Safe');
});

test('calculateFleetReadiness accurately calculates on-road percentage and fuel average', () => {
  const vehicles: Vehicle[] = [
    {
      id: 'v-1',
      callsign: 'UN-BTR-01',
      unNumber: 'UN-3401',
      type: 'BTR-80 APC',
      platoon: '1 Platoon',
      driver: 'Sgt Kabir',
      commander: 'Lt Tariq',
      status: 'On-Road (Mission Ready)',
      fuelPercent: 80,
      fuelType: 'Diesel',
      mileageKm: 12450,
      lastServiceDate: '2026-10-01',
      nextServiceKm: 13000,
      currentLocation: 'Bambari Base',
      faults: [],
    },
    {
      id: 'v-2',
      callsign: 'UN-BTR-02',
      unNumber: 'UN-3402',
      type: 'BTR-80 APC',
      platoon: '2 Platoon',
      driver: 'Cpl Selim',
      commander: 'Lt Farhan',
      status: 'Amber (Maintenance Due)',
      fuelPercent: 60,
      fuelType: 'Diesel',
      mileageKm: 14900,
      lastServiceDate: '2026-09-15',
      nextServiceKm: 15000,
      currentLocation: 'Bambari Workshop',
      faults: ['Brake shoe adjustment due'],
    },
    {
      id: 'v-3',
      callsign: 'UN-PATROL-01',
      unNumber: 'UN-3405',
      type: '4x4 Land Cruiser',
      platoon: 'Coy HQ',
      driver: 'Pvt Mizan',
      commander: 'Maj Fakrul',
      status: 'On-Road (Mission Ready)',
      fuelPercent: 100,
      fuelType: 'Diesel',
      mileageKm: 8200,
      lastServiceDate: '2026-10-10',
      nextServiceKm: 10000,
      currentLocation: 'Bambari Base',
      faults: [],
    },
    {
      id: 'v-4',
      callsign: 'UN-AMB-01',
      unNumber: 'UN-3408',
      type: 'Ambulance',
      platoon: 'Medical Det',
      driver: 'Pvt Joynal',
      commander: 'Nursing WO',
      status: 'Off-Road (Deadlined)',
      fuelPercent: 40,
      fuelType: 'Diesel',
      mileageKm: 19400,
      lastServiceDate: '2026-08-20',
      nextServiceKm: 19500,
      currentLocation: 'Level II Hospital Bangui',
      faults: ['Clutch plate worn out'],
    },
  ];

  const fleet = calculateFleetReadiness(vehicles);
  assert.equal(fleet.total, 4);
  assert.equal(fleet.onRoad, 2);
  assert.equal(fleet.amber, 1);
  assert.equal(fleet.offRoad, 1);
  assert.equal(fleet.readinessPercent, 50);
  assert.equal(fleet.avgFuel, 70);
});

test('calculateRollingMoney calculates balance and converted XAF correctly', () => {
  const transactions: ExpenseTransaction[] = [
    {
      id: 'tx-1',
      date: '2026-10-05',
      description: '500 sandbags from Bambari local supplier',
      category: 'Camp Fortification',
      amountUSD: 400,
      approvedBy: 'Maj Fakrul',
      currency: 'USD',
      status: 'Approved',
    },
    {
      id: 'tx-2',
      date: '2026-10-10',
      description: 'Emergency tire vulcanizing for BTR-02',
      category: 'Vehicle Spares',
      amountUSD: 150,
      approvedBy: 'Maj Fakrul',
      currency: 'USD',
      status: 'Approved',
    },
    {
      id: 'tx-3',
      date: '2026-10-15',
      description: 'Local French-Sango interpreter stipend',
      category: 'CIMIC / Goodwill',
      amountUSD: 200,
      approvedBy: 'Pending',
      currency: 'USD',
      status: 'Pending Commander Sign-off',
    },
  ];

  const fin = calculateRollingMoney(5000, transactions);
  assert.equal(fin.allocatedUSD, 5000);
  assert.equal(fin.totalSpentUSD, 550);
  assert.equal(fin.balanceUSD, 4450);
  assert.equal(fin.pendingApprovalUSD, 200);
  assert.equal(fin.categoryTotals['Camp Fortification'], 400);
  assert.equal(fin.categoryTotals['Vehicle Spares'], 150);
  assert.equal(fin.balanceXAF, 4450 * 610);
});

test('filterPersonnel searches name, rank, army number and respects platoon filter', () => {
  const filtered = filterPersonnel(mockPersonnel, 'tariq', 'ALL', 'ALL');
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].name, 'Tariq Rahman');

  const filteredPlatoon = filterPersonnel(mockPersonnel, '', 'Coy HQ', 'ALL');
  assert.equal(filteredPlatoon.length, 2);

  const filteredStatus = filterPersonnel(mockPersonnel, '', 'ALL', 'On Patrol');
  assert.equal(filteredStatus.length, 1);
  assert.equal(filteredStatus[0].name, 'Tariq Rahman');
});
