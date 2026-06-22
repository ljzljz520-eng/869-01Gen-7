import { useState } from 'react';
import type { ZoneHeatData, DensityLevel } from '../../shared/types';

const densityColors: Record<DensityLevel, string> = {
  1: 'rgba(14, 165, 233, 0.55)',
  2: 'rgba(34, 197, 94, 0.6)',
  3: 'rgba(234, 179, 8, 0.65)',
  4: 'rgba(249, 115, 22, 0.7)',
  5: 'rgba(239, 68, 68, 0.75)'
};

const densityLabels: Record<DensityLevel, string> = {
  1: '畅通',
  2: '较少',
  3: '适中',
  4: '拥挤',
  5: '非常拥挤'
};

interface Props {
  data: ZoneHeatData[];
  floor: number;
  highlightShop?: { x: number; y: number; name: string };
}

export default function HeatmapFloor({ data, floor, highlightShop }: Props) {
  const [hovered, setHovered] = useState<ZoneHeatData | null>(null);

  return (
    <div className="relative w-full aspect-[16/10] rounded-xl bg-primary-900/60 border border-primary-700/50 overflow-hidden">
      <svg viewBox="0 0 100 62" className="w-full h-full">
        <defs>
          <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M 5 0 L 0 0 0 5" fill="none" stroke="rgba(0,212,255,0.08)" strokeWidth="0.2" />
          </pattern>
        </defs>
        <rect width="100" height="62" fill="url(#grid)" />

        <rect x="2" y="2" width="96" height="58" fill="none" stroke="rgba(0,212,255,0.2)" strokeWidth="0.3" rx="1" />

        {data.map((zone) => (
          <g
            key={zone.zoneId}
            className="heat-zone cursor-pointer"
            onMouseEnter={() => setHovered(zone)}
            onMouseLeave={() => setHovered(null)}
          >
            <rect
              x={zone.x}
              y={zone.y}
              width={zone.width}
              height={zone.height}
              fill={densityColors[zone.densityLevel]}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="0.3"
              rx="0.5"
              style={{
                filter: `drop-shadow(0 0 ${zone.densityLevel * 0.3}px ${zone.densityLevel >= 4 ? 'rgba(239,68,68,0.4)' : 'rgba(0,212,255,0.3)'})`
              }}
            />
            <text
              x={zone.x + zone.width / 2}
              y={zone.y + zone.height / 2 + 0.8}
              textAnchor="middle"
              fill="white"
              fontSize="1.8"
              fontWeight="500"
              style={{ pointerEvents: 'none' }}
            >
              {zone.zoneName.length > 6 ? zone.zoneName.substring(0, 5) + '…' : zone.zoneName}
            </text>
          </g>
        ))}

        {highlightShop && (
          <g>
            <circle
              cx={highlightShop.x}
              cy={highlightShop.y}
              r="3"
              fill="none"
              stroke="#00d4ff"
              strokeWidth="0.4"
              className="animate-pulse-slow"
              opacity="0.8"
            />
            <circle
              cx={highlightShop.x}
              cy={highlightShop.y}
              r="1.5"
              fill="#00d4ff"
            />
            <text
              x={highlightShop.x}
              y={highlightShop.y - 4}
              textAnchor="middle"
              fill="#00d4ff"
              fontSize="2"
              fontWeight="600"
            >
              📍 {highlightShop.name}
            </text>
          </g>
        )}

        <text x="50" y="60" textAnchor="middle" fill="rgba(0,212,255,0.6)" fontSize="2.5" fontWeight="600">
          {floor}F 楼层平面图
        </text>
      </svg>

      {hovered && (
        <div className="absolute top-3 right-3 glass rounded-lg px-4 py-2 text-sm pointer-events-none">
          <div className="font-semibold text-primary-50 text-glow">{hovered.zoneName}</div>
          <div className="text-xs text-slate-300 mt-1">
            当前人数: <span className="font-mono text-primary-400">{hovered.count}</span>
          </div>
          <div className="text-xs text-slate-300">
            拥挤程度: <span className="font-semibold">{densityLabels[hovered.densityLevel]}</span>
          </div>
        </div>
      )}

      <div className="absolute bottom-3 left-3 flex gap-2 items-center text-xs text-slate-400">
        <span className="mr-1">拥挤度:</span>
        {[1, 2, 3, 4, 5].map((level) => (
          <div key={level} className="flex items-center gap-1">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: densityColors[level as DensityLevel] }}
            />
            <span>{densityLabels[level as DensityLevel]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
