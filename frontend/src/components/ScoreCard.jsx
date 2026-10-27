import React from 'react';
import { 
  Droplet, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  MapPin, 
  Gauge,
  Thermometer,
  Wifi,
  Shield,
  Layers,
  Coins
} from 'lucide-react';

export default function ScoreCard({ site }) {
  if (!site) {
    return (
      <div className="bg-white p-6 rounded-2xl flex items-center justify-center text-[#454c58] min-h-[300px] border border-[#dde0e6] shadow-sm">
        Select a site from the map or hub switcher to view composite intelligence
      </div>
    );
  }

  const compositeScore = site.composite_score || 0;
  const tierColor = site.tier_color || '#10B981';
  const tier = site.tier || 'VIABLE / RECOMMENDED';

  const renderTierIcon = () => {
    if (compositeScore >= 75.0) {
      return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    } else if (compositeScore >= 50.0) {
      return <AlertTriangle className="w-4 h-4 text-amber-600" />;
    } else {
      return <XCircle className="w-4 h-4 text-rose-600" />;
    }
  };

  const domainCards = [
    {
      name: "Water Subsystem",
      score: site.water_score || 0,
      weight: "20%",
      icon: <Droplet className="w-4 h-4 text-[#074ce0]" />,
      subtext: "7 Models (CGWB / BIS 10500)",
    },
    {
      name: "Power & Grid",
      score: site.power_score || 0,
      weight: "25%",
      icon: <Zap className="w-4 h-4 text-amber-500" />,
      subtext: "EHV Grid (CEA Standards)",
    },
    {
      name: "Climate & Cooling",
      score: site.climate_score || 0,
      weight: "15%",
      icon: <Thermometer className="w-4 h-4 text-indigo-600" />,
      subtext: "Wet-Bulb & ASHRAE TC 9.9",
    },
    {
      name: "Connectivity & CLS",
      score: site.connectivity_score || 0,
      weight: "15%",
      icon: <Wifi className="w-4 h-4 text-emerald-600" />,
      subtext: "Subsea CLS & NIXI Peering",
    },
    {
      name: "Disaster Resilience",
      score: site.disaster_score || 0,
      weight: "10%",
      icon: <Shield className="w-4 h-4 text-rose-600" />,
      subtext: "IS 1893 Seismic & Flood HFL",
    },
    {
      name: "Land & Civil",
      score: site.land_score || 0,
      weight: "8%",
      icon: <Layers className="w-4 h-4 text-purple-600" />,
      subtext: "Zoning & Soil SBC (kN/m²)",
    },
    {
      name: "Economics & Policy",
      score: site.economics_score || 0,
      weight: "7%",
      icon: <Coins className="w-4 h-4 text-cyan-600" />,
      subtext: "SERC Tariff & State Incentives",
    },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#dde0e6] shadow-sm flex flex-col justify-between h-full">
      
      {/* Header with Site Name and Badge */}
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#454c58] font-mono mb-1">
              <MapPin className="w-3.5 h-3.5 text-[#074ce0]" />
              <span>{site.district}, {site.state}</span>
              <span className="text-slate-300">•</span>
              <span>Elev: {site.elevation_m}m</span>
              <span className="text-slate-300">•</span>
              <span className="text-[#074ce0] font-semibold">{site.proposed_it_load_mw} MW Load</span>
            </div>
            <h2 className="text-2xl font-bold font-display text-[#16191f] tracking-tight">
              {site.site_name}
            </h2>
          </div>

          {/* Status Badge */}
          <div 
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              compositeScore >= 75 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : compositeScore >= 50 
                ? 'bg-amber-50 text-amber-800 border-amber-200' 
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {renderTierIcon()}
            <span>{tier}</span>
          </div>
        </div>

        {/* Central Composite Gauge Hero Box */}
        <div className="p-4 rounded-xl bg-[#f3f4f6] border border-[#dde0e6] flex items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white border border-[#dde0e6] flex items-center justify-center text-[#074ce0] shadow-sm">
              <Gauge className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#454c58] font-bold">
                Composite 7-Domain Site Score
              </div>
              <div className="text-xs text-[#454c58]">
                Normalized multi-criteria physical synthesis
              </div>
            </div>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-4xl sm:text-5xl font-black font-display text-[#16191f] tracking-tight">
              {compositeScore.toFixed(1)}
            </span>
            <span className="text-[#454c58] font-mono text-xs">/100</span>
          </div>
        </div>
      </div>

      {/* 7-Domain Breakdown Matrix */}
      <div>
        <div className="text-xs font-mono uppercase tracking-wider text-[#454c58] font-bold mb-2.5 flex items-center justify-between">
          <span>7 Infrastructure Dimensions</span>
          <span className="text-[11px] text-[#454c58] font-normal">Weights: 100%</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {domainCards.map((domain, idx) => (
            <div 
              key={idx}
              className="p-2.5 rounded-xl bg-white border border-[#dde0e6] hover:border-[#074ce0]/50 transition-colors flex items-center justify-between gap-2 shadow-sm"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-lg bg-[#f3f4f6] text-[#16191f]">
                  {domain.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#16191f] truncate font-display">
                    {domain.name}
                  </div>
                  <div className="text-[10px] text-[#454c58] truncate font-mono">
                    {domain.subtext}
                  </div>
                </div>
              </div>

              <div className="text-right flex-shrink-0 font-mono">
                <div className="text-sm font-bold text-[#16191f]">
                  {domain.score.toFixed(1)}
                </div>
                <div className="text-[10px] text-[#454c58]">
                  wt: {domain.weight}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-[#dde0e6] flex items-center justify-between text-[11px] text-[#454c58] font-mono">
        <span>Deterministic Engineering Assessment</span>
        <span className="text-[#074ce0] font-semibold">Zero Guessing Policy</span>
      </div>

    </div>
  );
}
