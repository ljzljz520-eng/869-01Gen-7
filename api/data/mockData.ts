import type { Zone, Entrance, Tenant, TrafficRecord, User, UploadRecord } from '../../shared/types';

const zoneNamesByFloor: Record<number, string[]> = {
  1: ['主入口大厅', '化妆品区', '珠宝首饰区', '名表区', '咖啡馆', '服务台', '左侧通道', '右侧通道', '中庭'],
  2: ['女装时尚区', '女装精品区', '鞋履区', '箱包区', '配饰区', '休息区', '扶梯口A', '扶梯口B', '中央通道', '试衣间区'],
  3: ['男装区', '运动品牌区', '户外装备区', '休闲装区', '男士配件', '休息区', '扶梯口A', '扶梯口B', '中央通道'],
  4: ['儿童乐园', '童装区', '母婴室', '玩具区', '儿童教育', '休息区', '扶梯口A', '扶梯口B'],
  5: ['美食广场', '影院入口', 'KTV入口', '健身房', '书店', '餐饮区A', '餐饮区B', '休息区', '扶梯口']
};

export const zones: Zone[] = [];
Object.entries(zoneNamesByFloor).forEach(([floorStr, names]) => {
  const floor = parseInt(floorStr);
  const cols = Math.ceil(Math.sqrt(names.length));
  names.forEach((name, idx) => {
    const row = Math.floor(idx / cols);
    const col = idx % cols;
    zones.push({
      id: `zone-${floor}-${idx + 1}`,
      name,
      floor,
      x: 5 + col * 30,
      y: 5 + row * 28,
      width: 27,
      height: 25
    });
  });
});

export const entrances: Entrance[] = [
  { id: 'entrance-1-1', name: '1号门主入口', floor: 1 },
  { id: 'entrance-1-2', name: '2号门次入口', floor: 1 },
  { id: 'entrance-1-3', name: '地铁连接口', floor: 1 },
  { id: 'entrance-2-1', name: '2层连廊入口', floor: 2 },
  { id: 'entrance-2-2', name: '2层停车场入口', floor: 2 },
  { id: 'entrance-3-1', name: '3层停车场入口', floor: 3 },
  { id: 'entrance-5-1', name: '5层影院入口', floor: 5 }
];

export const tenants: Tenant[] = [
  { id: 'tenant-001', shopName: '优衣库', floor: 2, positionX: 45, positionY: 35 },
  { id: 'tenant-002', shopName: '星巴克', floor: 1, positionX: 75, positionY: 15 },
  { id: 'tenant-003', shopName: '海底捞', floor: 5, positionX: 55, positionY: 60 },
  { id: 'tenant-004', shopName: 'Nike', floor: 3, positionX: 35, positionY: 40 },
  { id: 'tenant-005', shopName: 'Apple Store', floor: 1, positionX: 25, positionY: 45 }
];

export const users: User[] = [
  { id: 'user-admin', username: 'admin', name: '商场运营管理员', role: 'admin' },
  { id: 'user-tenant-1', username: 'tenant1', name: '优衣库店长', role: 'tenant', tenantId: 'tenant-001' }
];

export const userPasswords: Record<string, string> = {
  admin: '123456',
  tenant1: '123456'
};

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function generateTrafficForZone(zoneId: string, floor: number, date: string, isHoliday: boolean): TrafficRecord[] {
  const records: TrafficRecord[] = [];
  const baseMultiplier = isHoliday ? 1.8 : 1;
  const floorMultiplier = [1.5, 1.2, 1.0, 0.8, 1.1][floor - 1] || 1;

  for (let hour = 0; hour < 24; hour++) {
    let hourFactor = 0;
    if (hour >= 10 && hour <= 12) hourFactor = 0.7;
    else if (hour >= 13 && hour <= 14) hourFactor = 0.8;
    else if (hour >= 15 && hour <= 17) hourFactor = 0.9;
    else if (hour >= 18 && hour <= 20) hourFactor = 1.2;
    else if (hour >= 21 && hour <= 22) hourFactor = 0.6;
    else if (hour >= 8 && hour <= 9) hourFactor = 0.3;
    else hourFactor = 0.05;

    const randomFactor = 0.7 + Math.random() * 0.6;
    const count = Math.round(50 * baseMultiplier * floorMultiplier * hourFactor * randomFactor);

    records.push({
      id: `${zoneId}-${date}-${hour}`,
      zoneId,
      date,
      hour,
      count,
      source: Math.random() > 0.5 ? 'camera' : 'wifi'
    });
  }
  return records;
}

export const trafficRecords: TrafficRecord[] = [];

const today = new Date();
for (let daysAgo = 13; daysAgo >= 0; daysAgo--) {
  const d = new Date(today);
  d.setDate(d.getDate() - daysAgo);
  const dateStr = formatDate(d);
  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
  const isHoliday = isWeekend || daysAgo === 7;

  zones.forEach(zone => {
    const records = generateTrafficForZone(zone.id, zone.floor, dateStr, isHoliday);
    trafficRecords.push(...records);
  });
}

export const uploadRecords: UploadRecord[] = [
  {
    id: 'upload-001',
    fileName: 'camera_data_20260620.csv',
    uploadTime: '2026-06-20 23:15:00',
    source: 'camera',
    status: 'success',
    recordCount: 2880
  },
  {
    id: 'upload-002',
    fileName: 'wifi_data_20260620.csv',
    uploadTime: '2026-06-20 23:20:00',
    source: 'wifi',
    status: 'success',
    recordCount: 2560
  },
  {
    id: 'upload-003',
    fileName: 'camera_data_20260621.csv',
    uploadTime: '2026-06-21 12:30:00',
    source: 'camera',
    status: 'success',
    recordCount: 1440
  }
];

export function getTodayStr(): string {
  return formatDate(today);
}

export function getYesterdayStr(): string {
  const d = new Date(today);
  d.setDate(d.getDate() - 1);
  return formatDate(d);
}
