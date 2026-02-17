
export enum UserRole {
  PROD = 'Productor',
  ASESOR = 'Asesor Agronómico',
  CONT = 'Contratista',
  OPER = 'Operario',
  EST = 'Estudiante',
  OTRO = 'Otro'
}

export interface SurveyResponse {
  id: string;
  timestamp: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  nps: number;
  interestedInInfo: boolean;
  selectedProducts: string[];
  synced?: boolean;
  deviceId?: string;
  sectorName?: string; // New: identify where the survey was taken
}

export interface AppConfig {
  adminPin: string;
  availableProducts: string[];
  standId: string;
  sectorName: string; // New: configurable per device
}

export interface DashboardStats {
  totalResponses: number;
  averageNps: number;
  roleDistribution: Record<string, number>;
  interestRate: number;
  pendingSync: number;
}
