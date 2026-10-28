import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './config';
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
} from '../data/mockData';
import { Personnel, Vehicle, RationState, ExpenseTransaction } from '../utils/commandLogic';

export interface CompanyConfig {
  primaryCommanderEmail: string;
  authorizedEditorEmail: string;
  updatedAt: string;
  updatedBy: string;
}

export interface MedicalStatsOverride {
  malariaCompliance?: string;
  malariaNote?: string;
  sickStateCount?: string;
  sickStateNote?: string;
  oNegativeDonorsCount?: string;
  oNegativeNote?: string;
}

export interface TacticalStatePayload {
  personnel: Personnel[];
  vehicles: Vehicle[];
  weapons: WeaponItem[];
  ammunition: AmmunitionStock[];
  dutyRoster: DutyShift[];
  patrols: ActivePatrol[];
  ration: RationState;
  legalCases: LegalDisciplineCase[];
  leaves: LeaveRecord[];
  transactions: ExpenseTransaction[];
  allocatedUSD: number;
  medicalRecords: MedicalRecord[];
  medicalStatsOverride?: MedicalStatsOverride;
  jobCards: VehicleJobCard[];
  inventory: InventoryAsset[];
  updatedAt?: string;
  updatedBy?: string;
}

export interface LiveTelemetryUpdate {
  patrolId: string;
  callsign: string;
  commanderName: string;
  lat: number;
  lng: number;
  accuracy: number;
  speedKmH: number;
  heading: number;
  isTransmitting: boolean;
  updatedAt: string;
}

const CONFIG_PATH = 'company_config/settings';
const STATE_PATH = 'tactical_states/main';

export const DEFAULT_COMMANDER_EMAIL = 'captainfakrul@gmail.com';

/**
 * Listen for company authorization configuration
 */
export function subscribeCompanyConfig(
  onUpdate: (config: CompanyConfig) => void,
  onError?: (err: unknown) => void
) {
  const configRef = doc(db, 'company_config', 'settings');
  return onSnapshot(
    configRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as CompanyConfig);
      } else {
        // Initial default config
        const initialConfig: CompanyConfig = {
          primaryCommanderEmail: DEFAULT_COMMANDER_EMAIL,
          authorizedEditorEmail: '',
          updatedAt: new Date().toISOString(),
          updatedBy: 'system',
        };
        setDoc(configRef, initialConfig).catch((err) => {
          console.warn('Initial config seeding notice:', err);
        });
        onUpdate(initialConfig);
      }
    },
    (error) => {
      console.warn('Config subscription fallback:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, CONFIG_PATH);
    }
  );
}

/**
 * Update authorized editor email
 */
export async function saveAuthorizedEditorEmail(
  newEditorEmail: string,
  updatedByEmail: string
): Promise<void> {
  const configRef = doc(db, 'company_config', 'settings');
  const payload: Partial<CompanyConfig> = {
    primaryCommanderEmail: DEFAULT_COMMANDER_EMAIL,
    authorizedEditorEmail: newEditorEmail.trim().toLowerCase(),
    updatedAt: new Date().toISOString(),
    updatedBy: updatedByEmail,
  };
  try {
    await setDoc(configRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, CONFIG_PATH);
  }
}

/**
 * Initial baseline tactical dataset
 */
export function getDefaultTacticalState(): TacticalStatePayload {
  return {
    personnel: INITIAL_PERSONNEL,
    vehicles: INITIAL_VEHICLES,
    weapons: INITIAL_WEAPONS,
    ammunition: INITIAL_AMMUNITION,
    dutyRoster: INITIAL_DUTY_ROSTER,
    patrols: INITIAL_PATROLS,
    ration: INITIAL_RATION,
    legalCases: INITIAL_LEGAL_CASES,
    leaves: INITIAL_LEAVES,
    transactions: INITIAL_TRANSACTIONS,
    allocatedUSD: 5000,
    medicalRecords: INITIAL_MEDICAL_RECORDS,
    jobCards: INITIAL_JOB_CARDS,
    inventory: INITIAL_INVENTORY,
    updatedAt: new Date().toISOString(),
    updatedBy: 'system',
  };
}

/**
 * Listen for real-time tactical state changes across all connected devices
 */
export function subscribeTacticalState(
  onUpdate: (state: TacticalStatePayload) => void,
  onError?: (err: unknown) => void
) {
  const stateRef = doc(db, 'tactical_states', 'main');
  return onSnapshot(
    stateRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as TacticalStatePayload;
        onUpdate(data);
      } else {
        // Seed default initial state to Firestore
        const defaultState = getDefaultTacticalState();
        setDoc(stateRef, defaultState).catch((err) => {
          console.warn('Initial tactical state seeding notice:', err);
        });
        onUpdate(defaultState);
      }
    },
    (error) => {
      console.warn('Tactical state subscription fallback:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, STATE_PATH);
    }
  );
}

/**
 * Save tactical state change to Firestore so all devices update instantaneously
 */
export async function saveTacticalStateUpdate(
  partialUpdate: Partial<TacticalStatePayload>,
  userEmail: string
): Promise<void> {
  const stateRef = doc(db, 'tactical_states', 'main');
  const payload = {
    ...partialUpdate,
    updatedAt: new Date().toISOString(),
    updatedBy: userEmail,
  };
  try {
    await setDoc(stateRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, STATE_PATH);
  }
}

/**
 * Broadcast live GPS telemetry from patrol commander device
 */
export async function broadcastDeviceTelemetry(
  telemetry: LiveTelemetryUpdate,
  currentPatrols: ActivePatrol[],
  userEmail: string
): Promise<void> {
  const telemetryDocRef = doc(db, 'patrol_telemetry', telemetry.patrolId);
  try {
    await setDoc(telemetryDocRef, telemetry, { merge: true });

    // Also update coordinate on the active patrol list so all map views update synchronously
    const updatedPatrols = currentPatrols.map((p) => {
      if (p.id === telemetry.patrolId) {
        return {
          ...p,
          lat: telemetry.lat,
          lng: telemetry.lng,
          speedKmH: telemetry.speedKmH,
          lastCommsTime: `Live GPS Fix (${new Date().toLocaleTimeString()})`,
          sitrep: telemetry.isTransmitting
            ? `[LIVE GPS BROADCAST] Accuracy: ±${Math.round(telemetry.accuracy)}m • Speed: ${telemetry.speedKmH} km/h • ${p.sitrep}`
            : p.sitrep,
        };
      }
      return p;
    });

    await saveTacticalStateUpdate({ patrols: updatedPatrols }, userEmail);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `patrol_telemetry/${telemetry.patrolId}`);
  }
}
