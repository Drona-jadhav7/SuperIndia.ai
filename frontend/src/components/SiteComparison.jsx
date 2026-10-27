import React from 'react';
import { BarChart3, Trophy, ArrowRight, ShieldAlert } from 'lucide-react';

export default function SiteComparison({ sites = [], selectedSite = null, onSelectSite }) {
  if (!sites || sites.length === 0) return null;

  const sortedSites = [...sites].sort((a, b) => (b.composite_score || 0) - (a.composite_score || 0));
  const topSite = sortedSites[0];

  const getTierBadgeClass = (tierBadge) => {
    switch (tierBadge) {
      case 'VIABLE':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'CONDITIONAL':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'UNVIABLE':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#dde0e6] shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#dde0e6]">
        <div>
          <h3 className="text-lg font-bold font-display text-[#16191f] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#074ce0]" />
            National AI Infrastructure Multi-Site Audit Matrix (7 Domains)
          </h3>
          <p className="text-xs text-[#454c58] mt-0.5">
            Comparative evaluation across all strategic candidate hubs ranked by deterministic composite feasibility.
          </p>
        </div>

        {topSite && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
            <Trophy className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-900 font-medium">Top Ranked Hub:</span>
            <strong className="text-emerald-950 font-bold">{topSite.site_name}</strong>
            <span className="font-mono text-emerald-700 font-bold">({topSite.composite_score.toFixed(1)}/100)</span>
          </div>
        )}
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#dde0e6] text-[#454c58] font-mono text-[11px] uppercase tracking-wider bg-[#f3f4f6]">
              <th className="py-3 px-3">Rank</th>
              <th className="py-3 px-3">Candidate Hub</th>
              <th className="py-3 px-3">State</th>
              <th className="py-3 px-3">Composite</th>
              <th className="py-3 px-3">Tier</th>
              <th className="py-3 px-2 text-center text-[#074ce0]">Water</th>
              <th className="py-3 px-2 text-center text-amber-600">Power</th>
              <th className="py-3 px-2 text-center text-indigo-600">Climate</th>
              <th className="py-3 px-2 text-center text-emerald-600">Fiber</th>
              <th className="py-3 px-2 text-center text-rose-600">Risk</th>
              <th className="py-3 px-2 text-center text-purple-600">Land</th>
              <th className="py-3 px-2 text-center text-cyan-600">Econ</th>
              <th className="py-3 px-3 text-center">Flags</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#dde0e6] font-mono">
            {sortedSites.map((site, index) => {
              const isSelected = selectedSite && selectedSite.site_id === site.site_id;
              const rank = index + 1;
              const flagsCount = site.risk_flags ? site.risk_flags.length : 0;

              return (
                <tr 
                  key={site.site_id || index}
                  onClick={() => onSelectSite && onSelectSite(site)}
                  className={`cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-blue-50/60 text-[#16191f] font-medium' 
                      : 'hover:bg-[#f3f4f6] text-[#454c58]'
                  }`}
                >
                  {/* Rank */}
                  <td className="py-3 px-3 font-bold">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-mono ${
                      rank === 1 ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-[#f3f4f6] text-[#454c58] border border-[#dde0e6]'
                    }`}>
                      {rank}
                    </span>
                  </td>

                  {/* Hub Name */}
                  <td className="py-3 px-3">
                    <div className="font-bold text-[#16191f] font-display text-xs">
                      {site.site_name}
                    </div>
                    <div className="text-[10px] text-[#454c58]">
                      {site.district} • {site.proposed_it_load_mw}MW
                    </div>
                  </td>

                  {/* State */}
                  <td className="py-3 px-3 text-[11px] text-[#454c58] font-sans">
                    {site.state}
                  </td>

                  {/* Composite Score */}
                  <td className="py-3 px-3">
                    <span className="text-sm font-bold font-display text-[#16191f]">
                      {site.composite_score.toFixed(1)}
                    </span>
                  </td>

                  {/* Classification Tier */}
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getTierBadgeClass(site.tier_badge)}`}>
                      {site.tier_badge || 'VIABLE'}
                    </span>
                  </td>

                  {/* 7 Domain Sub-Scores */}
                  <td className="py-3 px-2 text-center text-[#16191f] font-semibold">
                    {(site.water_score || 0).toFixed(0)}
                  </td>
                  <td className="py-3 px-2 text-center text-[#16191f] font-semibold">
                    {(site.power_score || 0).toFixed(0)}
                  </td>
                  <td className="py-3 px-2 text-center text-[#16191f] font-semibold">
                    {(site.climate_score || 0).toFixed(0)}
                  </td>
                  <td className="py-3 px-2 text-center text-[#16191f] font-semibold">
                    {(site.connectivity_score || 0).toFixed(0)}
                  </td>
                  <td className="py-3 px-2 text-center text-[#16191f] font-semibold">
                    {(site.disaster_score || 0).toFixed(0)}
                  </td>
                  <td className="py-3 px-2 text-center text-[#16191f] font-semibold">
                    {(site.land_score || 0).toFixed(0)}
                  </td>
                  <td className="py-3 px-2 text-center text-[#16191f] font-semibold">
                    {(site.economics_score || 0).toFixed(0)}
                  </td>

                  {/* Risk Flags Count */}
                  <td className="py-3 px-3 text-center">
                    {flagsCount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                        <ShieldAlert className="w-3 h-3 text-rose-600" />
                        {flagsCount}
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-600 font-semibold">0</span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3 px-3 text-right">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectSite) onSelectSite(site);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#074ce0] hover:text-white text-[#16191f] border border-[#dde0e6] font-mono text-[10px] font-semibold transition-colors shadow-sm"
                    >
                      Inspect
                    </button>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
