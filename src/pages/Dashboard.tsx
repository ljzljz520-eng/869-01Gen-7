import { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  Users, TrendingUp, TrendingDown, MapPin, Clock,
  Building2, ChevronRight, Activity
} from 'lucide-react';
import Navbar from '../components/Navbar';
import HeatmapFloor from '../components/HeatmapFloor';
import { api } from '../utils/api';
import type { OverviewData, ZoneHeatData, EntranceData, TrendData } from '../../shared/types';

const StatCard = ({
  icon: Icon, label, value, sub, trend, color
}: {
  icon: any; label: string; value: string | number;
  sub?: string; trend?: number; color: string;
}) => (
  <div className="card relative overflow-hidden group hover:scale-[1.02] transition-all duration-300"
    style={{ animation: 'fadeInUp 0.5s ease-out both' }}
  >
    <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20 ${color}`} />
    <div className="flex items-start justify-between">
      <div>
        <div className="text-xs text-slate-400 uppercase tracking-wider">{label}</div>
        <div className="mt-2 text-3xl font-bold text-white font-mono">{value}</div>
        {sub && <div className="mt-1 text-sm text-slate-400">{sub}</div>}
        {trend !== undefined && (
          <div className={`mt-2 flex items-center gap-1 text-sm font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {trend >= 0 ? '+' : ''}{trend}% 较昨日
          </div>
        )}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} bg-opacity-20`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const [floor, setFloor] = useState(1);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [heatmap, setHeatmap] = useState<ZoneHeatData[]>([]);
  const [entrances, setEntrances] = useState<EntranceData[]>([]);
  const [trend, setTrend] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ov, hm, en, tr] = await Promise.all([
        api.getOverview() as Promise<OverviewData>,
        api.getHeatmap(floor) as Promise<ZoneHeatData[]>,
        api.getEntrances() as Promise<EntranceData[]>,
        api.getTrend(7) as Promise<TrendData[]>
      ]);
      setOverview(ov);
      setHeatmap(hm);
      setEntrances(en);
      setTrend(tr);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [floor]);

  const entranceChart = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: entrances.map(e => e.name.length > 6 ? e.name.substring(0, 5) + '…' : e.name),
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
      data: entrances.map(e => ({
        value: e.total,
        itemStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#00d4ff' },
              { offset: 1, color: 'rgba(0,212,255,0.2)' }
            ]
          },
          borderRadius: [6, 6, 0, 0]
        }
      })),
      barWidth: '50%'
    }]
  };

  const trendChart = {
    tooltip: { trigger: 'axis' },
    legend: {
      data: trend.map(t => t.date),
      textStyle: { color: '#94a3b8' },
      top: 0,
      right: 0
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`),
      axisLine: { lineStyle: { color: 'rgba(0,212,255,0.3)' } },
      axisLabel: { color: '#94a3b8', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: 'rgba(0,212,255,0.3)' } },
      axisLabel: { color: '#94a3b8' },
      splitLine: { lineStyle: { color: 'rgba(0,212,255,0.08)' } }
    },
    series: trend.map((t, idx) => ({
      name: t.date,
      type: 'line',
      smooth: true,
      showSymbol: false,
      data: t.hourlyData.map(h => h.count),
      lineStyle: {
        width: 2,
        color: idx === trend.length - 1 ? '#00d4ff' : `rgba(0,212,255,${0.15 + idx * 0.1})`
      },
      areaStyle: idx === trend.length - 1 ? {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(0,212,255,0.3)' },
            { offset: 1, color: 'rgba(0,212,255,0)' }
          ]
        }
      } : undefined
    }))
  };

  return (
    <div className="min-h-screen bg-grid">
      <Navbar />
      <div className="p-6 max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
              <Activity className="text-primary-400" />
              运营控制台
            </h1>
            <p className="text-sm text-slate-400 mt-1">实时监控商场客流热区分布情况</p>
          </div>
          <button onClick={loadData} className="btn-primary text-sm">
            刷新数据
          </button>
        </div>

        <div className="grid grid-cols-4 gap-5 mb-6">
          {overview && (
            <>
              <StatCard icon={Users} label="今日客流" value={overview.todayTotal.toLocaleString()}
                trend={overview.comparedYesterday} color="bg-primary-500" />
              <StatCard icon={Clock} label="峰值时段" value={overview.peakHour}
                sub={`峰值人数 ${overview.peakCount.toLocaleString()}`} color="bg-amber-500" />
              <StatCard icon={Building2} label="最拥挤楼层" value={overview.busiestFloor}
                sub={`客流 ${overview.busiestFloorCount.toLocaleString()} 人`} color="bg-rose-500" />
              <StatCard icon={MapPin} label="监控区域" value={heatmap.length}
                sub={`${floor}F 楼层`} color="bg-emerald-500" />
            </>
          )}
        </div>

        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-8 card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <MapPin size={18} className="text-primary-400" /> 楼层热区分布
              </h2>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(f => (
                  <button
                    key={f}
                    onClick={() => setFloor(f)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      floor === f
                        ? 'bg-primary-500 text-primary-900 shadow-lg shadow-primary-500/30'
                        : 'bg-white/5 text-slate-400 hover:text-primary-400 hover:bg-primary-500/10'
                    }`}
                  >
                    {f}F
                  </button>
                ))}
              </div>
            </div>
            <HeatmapFloor data={heatmap} floor={floor} />
          </div>

          <div className="col-span-4 space-y-5">
            <div className="card">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Building2 size={18} className="text-primary-400" /> 各入口客流统计
              </h2>
              <div className="h-64">
                <ReactECharts option={entranceChart} style={{ height: '100%' }} />
              </div>
            </div>

            <div className="card">
              <h2 className="font-semibold text-white mb-2 flex items-center gap-2">
                <MapPin size={18} className="text-primary-400" /> 热门区域 TOP5
              </h2>
              <div className="space-y-2">
                {[...heatmap]
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 5)
                  .map((zone, idx) => (
                    <div key={zone.zoneId} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        idx === 0 ? 'bg-amber-500 text-primary-900' :
                        idx === 1 ? 'bg-slate-400 text-primary-900' :
                        idx === 2 ? 'bg-orange-700 text-white' :
                        'bg-primary-700 text-primary-200'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">{zone.zoneName}</div>
                        <div className="h-1.5 rounded-full bg-primary-900/50 mt-1 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary-500 to-amber-400"
                            style={{ width: `${(zone.count / (heatmap[0]?.count || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-sm font-mono text-primary-400 w-16 text-right">
                        {zone.count}人
                        <ChevronRight size={14} className="inline ml-1 opacity-50" />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="col-span-12 card">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-primary-400" /> 近7日客流时段趋势
            </h2>
            <div className="h-72">
              <ReactECharts option={trendChart} style={{ height: '100%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
