import { trafficRecords, zones, entrances, tenants, uploadRecords, users, userPasswords, getTodayStr, getYesterdayStr } from '../data/mockData';
import type {
  OverviewData, ZoneHeatData, EntranceData, TrendData,
  UploadRecord as UploadRecordType, CompareResult, TenantData,
  HourlyData, DensityLevel, LoginResponse, LoginRequest
} from '../../shared/types';

function getDensityLevel(count: number): DensityLevel {
  if (count < 30) return 1;
  if (count < 60) return 2;
  if (count < 100) return 3;
  if (count < 150) return 4;
  return 5;
}

function aggregateZoneCount(zoneId: string, date: string, endHour?: number): number {
  const records = trafficRecords.filter(r =>
    r.zoneId === zoneId && r.date === date && (endHour === undefined || r.hour <= endHour)
  );
  return records.reduce((sum, r) => sum + r.count, 0);
}

function aggregateZoneHourly(zoneId: string, date: string): HourlyData[] {
  const result: HourlyData[] = [];
  for (let h = 0; h < 24; h++) {
    const records = trafficRecords.filter(r => r.zoneId === zoneId && r.date === date && r.hour === h);
    result.push({ hour: h, count: records.reduce((sum, r) => sum + r.count, 0) });
  }
  return result;
}

export function authenticate(req: LoginRequest): LoginResponse | null {
  const user = users.find(u => u.username === req.username && u.role === req.role);
  if (!user) return null;
  const password = userPasswords[req.username];
  if (password !== req.password) return null;
  return {
    token: `mock-token-${user.id}-${Date.now()}`,
    user
  };
}

export function getOverviewData(): OverviewData {
  const today = getTodayStr();
  const yesterday = getYesterdayStr();
  const currentHour = new Date().getHours();

  let todayTotal = 0;
  let peakHour = 0;
  let peakCount = 0;
  const floorCounts: Record<number, number> = {};
  const yesterdayTotal = 0;

  const hourlyTotals: number[] = new Array(24).fill(0);

  zones.forEach(zone => {
    const zoneTotal = aggregateZoneCount(zone.id, today, currentHour);
    todayTotal += zoneTotal;
    floorCounts[zone.floor] = (floorCounts[zone.floor] || 0) + zoneTotal;

    const hourly = aggregateZoneHourly(zone.id, today);
    hourly.forEach(h => {
      hourlyTotals[h.hour] += h.count;
    });
  });

  for (let h = 0; h <= currentHour; h++) {
    if (hourlyTotals[h] > peakCount) {
      peakCount = hourlyTotals[h];
      peakHour = h;
    }
  }

  let busiestFloor = 1;
  let busiestCount = 0;
  Object.entries(floorCounts).forEach(([floor, count]) => {
    if (count > busiestCount) {
      busiestCount = count;
      busiestFloor = parseInt(floor);
    }
  });

  let yTotal = 0;
  zones.forEach(zone => {
    yTotal += aggregateZoneCount(zone.id, yesterday, currentHour);
  });

  const comparedYesterday = yTotal > 0 ? Math.round(((todayTotal - yTotal) / yTotal) * 100) : 0;

  return {
    todayTotal,
    peakHour: `${peakHour.toString().padStart(2, '0')}:00`,
    peakCount,
    busiestFloor: `${busiestFloor}F`,
    busiestFloorCount: busiestCount,
    comparedYesterday
  };
}

export function getHeatmapData(floor: number): ZoneHeatData[] {
  const today = getTodayStr();
  const currentHour = new Date().getHours();

  const floorZones = zones.filter(z => z.floor === floor);
  return floorZones.map(zone => {
    const count = aggregateZoneCount(zone.id, today, currentHour);
    return {
      zoneId: zone.id,
      zoneName: zone.name,
      floor: zone.floor,
      x: zone.x,
      y: zone.y,
      width: zone.width,
      height: zone.height,
      count,
      densityLevel: getDensityLevel(count)
    };
  });
}

export function getEntrancesData(): EntranceData[] {
  const today = getTodayStr();
  const currentHour = new Date().getHours();

  return entrances.map(entrance => {
    const relatedZones = zones.filter(z => z.floor === entrance.floor).slice(0, 3);
    const hourlyData: HourlyData[] = [];

    for (let h = 0; h < 24; h++) {
      let count = 0;
      relatedZones.forEach(zone => {
        count += aggregateZoneCount(zone.id, today, h) - aggregateZoneCount(zone.id, today, h - 1);
      });
      hourlyData.push({ hour: h, count: Math.max(0, Math.round(count / 3)) });
    }

    const total = hourlyData
      .filter(h => h.hour <= currentHour)
      .reduce((sum, h) => sum + h.count, 0);

    return {
      entranceId: entrance.id,
      name: entrance.name,
      floor: entrance.floor,
      hourlyData,
      total
    };
  });
}

export function getTrendData(days: number): TrendData[] {
  const result: TrendData[] = [];
  const today = new Date();

  for (let d = days - 1; d >= 0; d--) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().split('T')[0];

    const hourlyData: HourlyData[] = [];
    for (let h = 0; h < 24; h++) {
      let count = 0;
      zones.forEach(zone => {
        count += trafficRecords
          .filter(r => r.zoneId === zone.id && r.date === dateStr && r.hour === h)
          .reduce((sum, r) => sum + r.count, 0);
      });
      hourlyData.push({ hour: h, count });
    }

    result.push({ date: dateStr, hourlyData });
  }

  return result;
}

export function getUploadRecords(): UploadRecordType[] {
  return [...uploadRecords].sort((a, b) =>
    new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime()
  );
}

export function addUploadRecord(record: Omit<UploadRecordType, 'id'>): UploadRecordType {
  const newRecord: UploadRecordType = {
    ...record,
    id: `upload-${Date.now()}`
  };
  uploadRecords.push(newRecord);
  return newRecord;
}

export function getCompareData(fromA: string, toA: string, fromB: string, toB: string): CompareResult {
  function aggregatePeriod(from: string, to: string): { heatData: ZoneHeatData[]; totalCount: number } {
    const startDate = new Date(from);
    const endDate = new Date(to);
    const dates: string[] = [];
    const d = new Date(startDate);
    while (d <= endDate) {
      dates.push(d.toISOString().split('T')[0]);
      d.setDate(d.getDate() + 1);
    }

    const heatData: ZoneHeatData[] = zones.map(zone => {
      let count = 0;
      dates.forEach(dateStr => {
        count += aggregateZoneCount(zone.id, dateStr);
      });
      count = Math.round(count / dates.length);
      return {
        zoneId: zone.id,
        zoneName: zone.name,
        floor: zone.floor,
        x: zone.x,
        y: zone.y,
        width: zone.width,
        height: zone.height,
        count,
        densityLevel: getDensityLevel(count)
      };
    });

    const totalCount = heatData.reduce((sum, z) => sum + z.count, 0);
    return { heatData, totalCount };
  }

  const periodA = aggregatePeriod(fromA, toA);
  const periodB = aggregatePeriod(fromB, toB);

  const changes = periodA.heatData.map(zoneA => {
    const zoneB = periodB.heatData.find(z => z.zoneId === zoneA.zoneId);
    const countB = zoneB?.count || 0;
    const diffCount = countB - zoneA.count;
    const diffPercent = zoneA.count > 0 ? Math.round((diffCount / zoneA.count) * 100) : 0;
    return {
      zoneId: zoneA.zoneId,
      zoneName: zoneA.zoneName,
      diffCount,
      diffPercent
    };
  });

  return {
    periodA: { label: `${fromA} ~ ${toA}`, ...periodA },
    periodB: { label: `${fromB} ~ ${toB}`, ...periodB },
    changes
  };
}

export function getTenantData(tenantId: string): TenantData | null {
  const tenant = tenants.find(t => t.id === tenantId);
  if (!tenant) return null;

  const today = getTodayStr();
  const currentHour = new Date().getHours();

  const floorZones = zones.filter(z => z.floor === tenant.floor);

  function distance(zx: number, zy: number): number {
    return Math.sqrt(Math.pow(zx - tenant.positionX, 2) + Math.pow(zy - tenant.positionY, 2));
  }

  const sortedZones = [...floorZones].sort((a, b) =>
    distance(a.x + a.width / 2, a.y + a.height / 2) - distance(b.x + b.width / 2, b.y + b.height / 2)
  );

  const nearbyZones = sortedZones.slice(0, 5).map(zone => {
    const count = aggregateZoneCount(zone.id, today, currentHour);
    return {
      zoneId: zone.id,
      zoneName: zone.name,
      count,
      densityLevel: getDensityLevel(count)
    };
  });

  const hourlyTrend: HourlyData[] = [];
  for (let h = 0; h < 24; h++) {
    let count = 0;
    sortedZones.slice(0, 3).forEach(zone => {
      const records = trafficRecords.filter(r =>
        r.zoneId === zone.id && r.date === today && r.hour === h
      );
      count += records.reduce((sum, r) => sum + r.count, 0);
    });
    hourlyTrend.push({ hour: h, count: Math.round(count / 3) });
  }

  return {
    tenantId: tenant.id,
    shopName: tenant.shopName,
    floor: tenant.floor,
    position: { x: tenant.positionX, y: tenant.positionY },
    nearbyZones,
    hourlyTrend
  };
}
