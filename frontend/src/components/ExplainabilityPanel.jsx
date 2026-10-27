import React, { useState } from 'react';
import { 
  Droplet, 
  Zap, 
  Thermometer, 
  Wifi, 
  Shield, 
  Layers, 
  Coins, 
  AlertTriangle, 
  Info,
  CheckCircle2
} from 'lucide-react';

export default function ExplainabilityPanel({ site }) {
  const [activeDomain, setActiveDomain] = useState('water');

  if (!site) return null;

  const domains = [
    {
      id: 'water',
      label: '💧 Water',
      score: site.water_score,
      sub_metrics: site.water_assessment?.sub_metrics || [],
      summary: site.water_assessment?.summary || '',
      color: '#074ce0',
      standard: 'CGWB & BIS 10500 Guidelines (7 Models)',
    },
    {
      id: 'power',
      label: '⚡ Power',
      score: site.power_score,
      sub_metrics: site.power_assessment?.sub_metrics || [],
      summary: site.power_assessment?.summary || '',
      color: '#d97706',
      standard: 'CEA Grid Transmission Criteria',
    },
    {
      id: 'climate',
      label: '🌡️ Climate',
      score: site.climate_score,
      sub_metrics: site.climate_assessment?.sub_metrics || [],
      summary: site.climate_assessment?.summary || '',
      color: '#4f46e5',
      standard: 'ASHRAE TC 9.9 & IMD Normals',
    },
    {
      id: 'connectivity',
      label: '🌐 Fiber & CLS',
      score: site.connectivity_score,
      sub_metrics: site.connectivity_assessment?.sub_metrics || [],
      summary: site.connectivity_assessment?.summary || '',
      color: '#059669',
      standard: 'NIXI Peering & Subsea Route Density',
    },
    {
      id: 'disaster',
      label: '🌊 Disaster Risk',
      score: site.disaster_score,
      sub_metrics: site.disaster_assessment?.sub_metrics || [],
      summary: site.disaster_assessment?.summary || '',
      color: '#e11d48',
      standard: 'IS 1893:2016 Seismic & NDMA Wind Hazard',
    },
    {
      id: 'land',
      label: '🏗️ Land & Civil',
      score: site.land_score,
      sub_metrics: site.land_assessment?.sub_metrics || [],
      summary: site.land_assessment?.summary || '',
      color: '#7c3aed',
      standard: 'State Industrial Master Plan & IS 1904 SBC',
    },
    {
      id: 'economics',
      label: '💰 Economics & Policy',
      score: site.economics_score,
      sub_metrics: site.economics_assessment?.sub_metrics || [],
      summary: site.economics_assessment?.summary || '',
      color: '#0891b2',
      standard: 'State SERC Tariff & Data Centre Policies',
    },
  ];

  const currentDomain = domains.find(d => d.id === activeDomain) || domains[0];

  const getScoreColor = (score, isFlagged) => {
    if (isFlagged || score < 50) return '#e11d48'; // Red
    if (score < 75) return '#d97706'; // Amber
    return '#059669'; // Emerald
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#dde0e6] shadow-sm">
      
      {/* Header and Domain Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-[#dde0e6]">
        <div>
          <h3 className="text-lg font-bold font-display text-[#16191f] flex items-center gap-2">
            <Info className="w-5 h-5 text-[#074ce0]" />
            Deterministic Granular Explainability (7 Domains • 31 Sub-Metrics)
          </h3>
          <p className="text-xs text-[#454c58] mt-0.5">
            Zero black-box logic. Every sub-score is mathematically grounded in verified standards.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-1 bg-[#f3f4f6] p-1 rounded-xl border border-[#dde0e6]">
          {domains.map((dom) => {
            const active = activeDomain === dom.id;
            return (
              <button
                key={dom.id}
                onClick={() => setActiveDomain(dom.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  active 
                    ? 'bg-white text-[#16191f] font-bold shadow-sm border border-[#dde0e6]' 
                    : 'text-[#454c58] hover:text-[#16191f]'
                }`}
              >
                <span>{dom.label}</span>
                <span 
                  className="text-[10px] px-1.5 py-0.2 rounded font-bold"
                  style={{ color: dom.color, backgroundColor: `${dom.color}15` }}
                >
                  {(dom.score || 0).toFixed(0)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Domain Header Banner */}
      <div className="mb-4 p-3.5 rounded-xl bg-[#f3f4f6] border border-[#dde0e6] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div 
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: currentDomain.color }}
          />
          <span className="text-xs font-mono text-[#454c58]">
            Standard: <strong className="text-[#16191f] font-sans">{currentDomain.standard}</strong>
          </span>
        </div>
        <div className="text-xs font-mono text-[#454c58]">
          Domain Sub-Score: <strong style={{ color: currentDomain.color }}>{(currentDomain.score || 0).toFixed(1)}/100</strong>
        </div>
      </div>

      {/* Granular Sub-Metrics Grid */}
      <div className="space-y-3">
        {currentDomain.sub_metrics.map((metric, idx) => {
          const isFlagged = metric.flagged || false;
          const score = metric.score || 0;
          const scoreColor = getScoreColor(score, isFlagged);
          const weightPct = ((metric.weight || 0) * 100).toFixed(0);

          return (
            <div 
              key={metric.key || idx}
              className={`p-4 rounded-xl border transition-all ${
                isFlagged 
                  ? 'bg-rose-50/50 border-rose-200' 
                  : 'bg-white border-[#dde0e6] hover:border-[#074ce0]/40 shadow-sm'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-bold font-display text-[#16191f]">
                    {metric.name}
                  </span>
                  <span className="text-[10px] font-mono bg-[#f3f4f6] text-[#454c58] px-2 py-0.5 rounded border border-[#dde0e6]">
                    wt: {weightPct}%
                  </span>
                  {isFlagged && (
                    <span className="flex items-center gap-1 text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      CRITICAL RISK FLAG
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 font-mono">
                  <span className="text-xs text-[#454c58]">
                    Contribution: <strong className="text-[#16191f]">{(metric.weighted_score || 0).toFixed(1)} pts</strong>
                  </span>
                  <span 
                    className="text-base font-bold"
                    style={{ color: scoreColor }}
                  >
                    {score.toFixed(1)}
                    <span className="text-xs text-[#454c58] font-normal">/100</span>
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#f3f4f6] rounded-full h-1.5 mb-2 overflow-hidden border border-[#dde0e6]">
                <div 
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(100, Math.max(0, score))}%`,
                    backgroundColor: scoreColor,
                  }}
                />
              </div>

              {/* Details and category badge */}
              <div className="flex flex-wrap items-start justify-between gap-2 text-xs">
                <span className="text-[#454c58] flex-1">
                  {metric.details}
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#f3f4f6] text-[#16191f] border border-[#dde0e6] shrink-0 font-medium">
                  {metric.category}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Note */}
      {currentDomain.summary && (
        <div className="mt-4 p-3 rounded-xl bg-[#f3f4f6] border border-[#dde0e6] text-xs font-mono text-[#454c58]">
          <strong className="text-[#074ce0]">Engine Verdict:</strong> {currentDomain.summary}
        </div>
      )}

    </div>
  );
}
