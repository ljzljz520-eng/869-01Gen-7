import { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { Store, Users, TrendingUp, Clock, MapPin, Shield, EyeOff } from 'lucide-react';
import Navbar from '../components/Navbar';
import HeatmapFloor from '../components/HeatmapFloor';
import { api } from '../utils/api';
import type { TenantData, DensityLevel } from '../../shared/types';

const densityColors: Record<DensityLevel, string> = {
  1: 'bg-sky-500',
  2: 'bg-emerald-500',
  3: 'bg-yellow-500',
  4: 'bg-orange-500',
  5: 'bg-red-500'
};

const densityLabels: Record<DensityLevel, string> = {
  1: '畅通',
  2: '较少',
  3: '适中',
  4: '拥挤',
  5: '非常拥挤'
};

export default function TenantDashboard() {
  const [data, setData] = useState<TenantData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getTenantDashboard() as TenantData;
        setData(res);
      } catch (e: any) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const trendChart = data ? {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data.hourlyTrend.map(h => `${h.hour.toString().padStart(2, '0')}:00`),
      axisLine: { lineStyle: { color: 'rgba(0,212,255,0.3)' } },
      axisLabel: { color: '#94a3b8', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: 'rgba(0,212,255,0.3)' } },
      axisLabel: { color: '#94a3b8' },
      splitLine: { lineStyle: { color: 'rgba(0,212,255,0.08)' } }
    },
    series: [{
      type: 'bar',
      data: data.hourlyTrend.map(h => ({
        value: h.count,
        itemStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#00d4ff' },
              { offset: 1, color: 'rgba(0,212,255,0.15)' }
            ]
          },
          borderRadius: [4, 4, 0, 0]
        }
      })),
      barWidth: '55%'
    }]
  } : {};

  const peakHour = data?.hourlyTrend.reduce((max, h) => h.count > max.count ? h : max, { hour: 0, count: 0 });
  const totalNearby = data?.nearbyZones.reduce((sum, z) => sum + z.count, 0) || 0;

  return (
    <div className="min-h-screen bg-grid">
      <Navbar />
      <div className="p-6 max-w-[1400px] mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
              <Store className="text-primary-400" /> 商户客流看板
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {data ? `${data.shopName} · ${data.floor}F · 周边区域匿名汇总客流数据` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/5 px-3 py-2 rounded-lg border border-white/10">
            <Shield size={14} className="text-emerald-400" />
            <EyeOff size={14} />
            数据已匿名化处理，仅展示周边区域汇总
          </div>
        </div>

        <div className="grid grid-cols-4 gap-5 mb-6">
          <div className="card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20 bg-primary-500" />
            <div className="text-xs text-slate-400 uppercase tracking-wider">周边总客流</div>
            <div className="mt-2 text-3xl font-bold text-white font-mono">{totalNearby.toLocaleString()}</div>
            <div className="mt-1 text-sm text-primary-400 flex items-center gap-1">
              <Users size={14} /> 今日累计
            </div>
          </div>
          <div className="card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20 bg-amber-500" />
            <div className="text-xs text-slate-400 uppercase tracking-wider">高峰时段</div>
            <div className="mt-2 text-3xl font-bold text-white font-mono">
              {peakHour ? `${peakHour.hour.toString().padStart(2, '0')}:00` : '--'}
            </div>
            <div className="mt-1 text-sm text-amber-400 flex items-center gap-1">
              <Clock size={14} /> 峰值 {peakHour?.count || 0} 人
            </div>
          </div>
          <div className="card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20 bg-emerald-500" />
            <div className="text-xs text-slate-400 uppercase tracking-wider">监控区域数</div>
            <div className="mt-2 text-3xl font-bold text-white font-mono">{data?.nearbyZones.length || 0}</div>
            <div className="mt-1 text-sm text-emerald-400 flex items-center gap-1">
              <MapPin size={14} /> 店铺周围区域
            </div>
          </div>
          <div className="card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20 bg-rose-500" />
            <div className="text-xs text-slate-400 uppercase tracking-wider">最拥挤区域</div>
            <div className="mt-2 text-xl font-bold text-white truncate">
              {data?.nearbyZones.reduce((max, z) => z.count > max.count ? z : max, { zoneName: '--', count: 0 } as any).zoneName}
            </div>
            <div className="mt-1 text-sm text-rose-400 flex items-center gap-1">
              <TrendingUp size={14} /> 需关注客流高峰
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-7 card">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-primary-400" /> 店铺位置及周边热区
            </h2>
            {data && (
              <HeatmapFloor
                data={data.nearbyZones.map(z => ({
                  zoneId: z.zoneId,
                  zoneName: z.zoneName,
                  floor: data.floor,
                  x: (() => {
                    const idx = data.nearbyZones.findIndex(n => n.zoneId === z.zoneId);
                    const cols = 3;
                    return 15 + (idx % cols) * 25;
                  })(),
                  y: (() => {
                    const idx = data.nearbyZones.findIndex(n => n.zoneId === z.zoneId);
                    const cols = 3;
                    return 15 + Math.floor(idx / cols) * 22;
                  })(),
                  width: 22,
                  height: 18,
                  count: z.count,
                  densityLevel: z.densityLevel
                }))}
                floor={data.floor}
                highlightShop={{ x: 50, y: 40, name: data.shopName }}
              />
            )}

            <div className="mt-5 p-4 bg-primary-900/30 rounded-xl border border-primary-700/30">
              <div className="flex items-center gap-2 text-sm text-primary-300 mb-2">
                <Shield size={16} /> 隐私保护说明
              </div>
              <div className="text-xs text-slate-400 leading-relaxed">
                本平台严格遵守隐私保护法规，所有客流数据均为匿名化汇总统计。
                商户仅可查看店铺周边区域的聚合客流数据，无法获取任何个人身份信息、
                移动轨迹或其他可识别的个体数据。数据展示已做模糊化处理，确保无法反向识别个人。
              </div>
            </div>
          </div>

          <div className="col-span-5 space-y-5">
            <div className="card">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <MapPin size={18} className="text-primary-400" /> 周边区域客流详情
              </h2>
              <div className="space-y-3">
                {data?.nearbyZones.map(zone => (
                  <div key={zone.zoneId} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${densityColors[zone.densityLevel]}`} />
                        <span className="text-sm font-medium text-white">{zone.zoneName}</span>
                      </div>
                      <span className="text-sm font-mono font-bold text-primary-400">
                        {zone.count.toLocaleString()} 人
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="h-1.5 flex-1 rounded-full bg-primary-900/50 mr-3 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${densityColors[zone.densityLevel]}`}
                          style={{ width: `${Math.min((zone.count / 300) * 100, 100)}%` }}
                        />
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        zone.densityLevel >= 4 ? 'bg-red-500/15 text-red-400' :
                        zone.densityLevel >= 3 ? 'bg-amber-500/15 text-amber-400' :
                        'bg-emerald-500/15 text-emerald-400'
                      }`}>
                        {densityLabels[zone.densityLevel]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-primary-400" /> 今日时段客流分布
              </h2>
              <div className="h-64">
                <ReactECharts option={trendChart} style={{ height: '100%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
