import { useState, useEffect } from 'react';
import { GitCompare, Calendar, ArrowRight, TrendingUp, TrendingDown, Minus, Building2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import HeatmapFloor from '../components/HeatmapFloor';
import { api } from '../utils/api';
import type { CompareResult, ZoneHeatData } from '../../shared/types';

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const today = new Date();
const weekAgo = new Date(today);
weekAgo.setDate(today.getDate() - 7);
const twoWeeksAgo = new Date(today);
twoWeeksAgo.setDate(today.getDate() - 14);

const quickPresets = [
  { label: '本周 vs 上周', fromA: formatDate(weekAgo), toA: formatDate(today), fromB: formatDate(twoWeeksAgo), toB: formatDate(weekAgo) },
  { label: '节假日 vs 平日', fromA: '2026-05-01', toA: '2026-05-05', fromB: '2026-04-20', toB: '2026-04-24' },
  { label: '活动前后对比', fromA: '2026-06-10', toA: '2026-06-12', fromB: '2026-06-14', toB: '2026-06-16' },
];

export default function ComparePage() {
  const [floor, setFloor] = useState(1);
  const [fromA, setFromA] = useState(formatDate(weekAgo));
  const [toA, setToA] = useState(formatDate(today));
  const [fromB, setFromB] = useState(formatDate(twoWeeksAgo));
  const [toB, setToB] = useState(formatDate(weekAgo));
  const [result, setResult] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(false);

  const loadCompare = async () => {
    setLoading(true);
    try {
      const data = await api.getCompare({ fromA, toA, fromB, toB }) as CompareResult;
      setResult(data);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompare();
  }, []);

  const applyPreset = (p: typeof quickPresets[0]) => {
    setFromA(p.fromA); setToA(p.toA); setFromB(p.fromB); setToB(p.toB);
  };

  const heatA = result?.periodA.heatData.filter(z => z.floor === floor) || [];
  const heatB = result?.periodB.heatData.filter(z => z.floor === floor) || [];

  const topChanges = result?.changes
    .sort((a, b) => Math.abs(b.diffPercent) - Math.abs(a.diffPercent))
    .slice(0, 8) || [];

  return (
    <div className="min-h-screen bg-grid">
      <Navbar />
      <div className="p-6 max-w-[1600px] mx-auto">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <GitCompare className="text-primary-400" /> 热区对比分析
          </h1>
          <p className="text-sm text-slate-400 mt-1">对比节假日或活动前后的客流热区变化</p>
        </div>

        <div className="card mb-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex gap-2 mb-2">
              {quickPresets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => applyPreset(p)}
                  className="px-4 py-2 rounded-lg text-sm bg-white/5 text-slate-300 hover:bg-primary-500/15 hover:text-primary-400 border border-white/10 hover:border-primary-500/30 transition-all"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex items-end gap-3 flex-1 min-w-0">
              <div className="flex-1">
                <label className="block text-xs text-primary-300 mb-1.5 flex items-center gap-1">
                  <Calendar size={12} /> 对比时段 A（基准期）
                </label>
                <div className="flex gap-2">
                  <input type="date" value={fromA} onChange={e => setFromA(e.target.value)}
                    className="flex-1 bg-primary-900/50 border border-primary-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500/70" />
                  <span className="text-slate-500 self-center">至</span>
                  <input type="date" value={toA} onChange={e => setToA(e.target.value)}
                    className="flex-1 bg-primary-900/50 border border-primary-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500/70" />
                </div>
              </div>

              <ArrowRight size={24} className="text-primary-400 flex-shrink-0 mb-1" />

              <div className="flex-1">
                <label className="block text-xs text-primary-300 mb-1.5 flex items-center gap-1">
                  <Calendar size={12} /> 对比时段 B（对比期）
                </label>
                <div className="flex gap-2">
                  <input type="date" value={fromB} onChange={e => setFromB(e.target.value)}
                    className="flex-1 bg-primary-900/50 border border-primary-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500/70" />
                  <span className="text-slate-500 self-center">至</span>
                  <input type="date" value={toB} onChange={e => setToB(e.target.value)}
                    className="flex-1 bg-primary-900/50 border border-primary-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500/70" />
                </div>
              </div>

              <button onClick={loadCompare} disabled={loading} className="btn-primary flex-shrink-0 mb-0.5 disabled:opacity-50">
                {loading ? '加载中...' : '开始对比'}
              </button>
            </div>
          </div>
        </div>

        {result && (
          <div className="grid grid-cols-4 gap-5 mb-6">
            <div className="card">
              <div className="text-xs text-slate-400 uppercase tracking-wider">时段 A 总客流</div>
              <div className="mt-2 text-2xl font-bold text-white font-mono">{result.periodA.totalCount.toLocaleString()}</div>
              <div className="text-xs text-slate-500 mt-1">{result.periodA.label}</div>
            </div>
            <div className="card">
              <div className="text-xs text-slate-400 uppercase tracking-wider">时段 B 总客流</div>
              <div className="mt-2 text-2xl font-bold text-white font-mono">{result.periodB.totalCount.toLocaleString()}</div>
              <div className="text-xs text-slate-500 mt-1">{result.periodB.label}</div>
            </div>
            <div className="card">
              <div className="text-xs text-slate-400 uppercase tracking-wider">客流变化</div>
              <div className={`mt-2 text-2xl font-bold font-mono flex items-center gap-2 ${
                result.periodB.totalCount >= result.periodA.totalCount ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {result.periodB.totalCount >= result.periodA.totalCount ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                {result.periodB.totalCount >= result.periodA.totalCount ? '+' : ''}
                {(result.periodB.totalCount - result.periodA.totalCount).toLocaleString()}
              </div>
              <div className={`text-sm mt-1 ${
                result.periodB.totalCount >= result.periodA.totalCount ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {result.periodB.totalCount >= result.periodA.totalCount ? '+' : ''}
                {Math.round(((result.periodB.totalCount - result.periodA.totalCount) / result.periodA.totalCount) * 100)}%
              </div>
            </div>
            <div className="card">
              <div className="text-xs text-slate-400 uppercase tracking-wider">显著变化区域</div>
              <div className="mt-2 text-2xl font-bold text-primary-400 font-mono">
                {topChanges.filter(c => Math.abs(c.diffPercent) >= 20).length}
              </div>
              <div className="text-xs text-slate-500 mt-1">变化幅度 ≥ 20% 的区域数</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-8 space-y-5">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <Building2 size={18} className="text-primary-400" /> 楼层热区对比
                </h2>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(f => (
                    <button key={f} onClick={() => setFloor(f)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        floor === f ? 'bg-primary-500 text-primary-900' : 'bg-white/5 text-slate-400 hover:text-primary-400'
                      }`}>
                      {f}F
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <div className="text-sm text-slate-400 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary-400" />
                    时段 A：{result?.periodA.label}
                  </div>
                  <HeatmapFloor data={heatA} floor={floor} />
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    时段 B：{result?.periodB.label}
                  </div>
                  <HeatmapFloor data={heatB} floor={floor} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-4">
            <div className="card h-full">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <GitCompare size={18} className="text-primary-400" /> 区域变化排行
              </h2>
              <div className="space-y-2 max-h-[550px] overflow-y-auto scrollbar-thin pr-2">
                {topChanges.map((change, idx) => {
                  const isUp = change.diffPercent > 0;
                  const isFlat = Math.abs(change.diffPercent) < 5;
                  return (
                    <div key={change.zoneId} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                            idx < 3 ? 'bg-primary-500 text-primary-900' : 'bg-primary-800 text-primary-300'
                          }`}>{idx + 1}</span>
                          <span className="text-sm font-medium text-white">{change.zoneName}</span>
                        </div>
                        <div className={`flex items-center gap-1 text-sm font-mono font-semibold ${
                          isFlat ? 'text-slate-400' : isUp ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {isFlat ? <Minus size={14} /> : isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          {isUp ? '+' : ''}{change.diffPercent}%
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                        <span>变化量：{isUp ? '+' : ''}{change.diffCount.toLocaleString()} 人</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-primary-900/50 mt-2 overflow-hidden">
                        <div className={`h-full rounded-full ${
                          isUp ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-gradient-to-r from-red-600 to-red-400'
                        }`} style={{ width: `${Math.min(Math.abs(change.diffPercent), 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
