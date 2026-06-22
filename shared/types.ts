export type UserRole = 'admin' | 'tenant';

export interface LoginRequest {
  username: string;
  password: string;
  role: UserRole;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  tenantId?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface OverviewData {
  todayTotal: number;
  peakHour: string;
  peakCount: number;
  busiestFloor: string;
  busiestFloorCount: number;
  comparedYesterday: number;
}

export type DensityLevel = 1 | 2 | 3 | 4 | 5;

export interface ZoneHeatData {
  zoneId: string;
  zoneName: string;
  floor: number;
  x: number;
  y: number;
  width: number;
  height: number;
  count: number;
  densityLevel: DensityLevel;
}

export interface HourlyData {
  hour: number;
  count: number;
}

export interface EntranceData {
  entranceId: string;
  name: string;
  floor: number;
  hourlyData: HourlyData[];
  total: number;
}

export interface TrendData {
  date: string;
  hourlyData: HourlyData[];
}

export type DataSource = 'camera' | 'wifi';
export type UploadStatus = 'processing' | 'success' | 'failed';

export interface UploadRecord {
  id: string;
  fileName: string;
  uploadTime: string;
  source: DataSource;
  status: UploadStatus;
  recordCount: number;
}

export interface ZoneChange {
  zoneId: string;
  zoneName: string;
  diffCount: number;
  diffPercent: number;
}

export interface ComparePeriod {
  label: string;
  heatData: ZoneHeatData[];
  totalCount: number;
}

export interface CompareResult {
  periodA: ComparePeriod;
  periodB: ComparePeriod;
  changes: ZoneChange[];
}

export interface TenantNearbyZone {
  zoneId: string;
  zoneName: string;
  count: number;
  densityLevel: DensityLevel;
}

export interface TenantData {
  tenantId: string;
  shopName: string;
  floor: number;
  position: { x: number; y: number };
  nearbyZones: TenantNearbyZone[];
  hourlyTrend: HourlyData[];
}

export interface Zone {
  id: string;
  name: string;
  floor: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Entrance {
  id: string;
  name: string;
  floor: number;
}

export interface Tenant {
  id: string;
  shopName: string;
  floor: number;
  positionX: number;
  positionY: number;
}

export interface TrafficRecord {
  id: string;
  zoneId: string;
  date: string;
  hour: number;
  count: number;
  source: DataSource;
}
