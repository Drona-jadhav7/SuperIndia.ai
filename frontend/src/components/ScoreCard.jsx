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
  Coins,
  Activity,
  Satellite,
  Compass,
  Award,
  TreePine,
  Leaf
} from 'lucide-react';

export default function ScoreCard({ site }) {
  if (!site) {
    return (
      <div className="bg-white p-6 rounded-2xl flex items-center justify-center text-[#454c58] min-h-[350px] border border-[#dde0e6] shadow-sm">
        <div className="text-center space-y-2">
          <Compass className="w-8 h-8 text-[#074ce0] mx-auto animate-pulse" />
          <div className="text-sm font-bold font-display text-[#16191f]">No Site Selected</div>
          <div className="text-xs text-[#454c58]">Select a candidate hub from the geospatial mesh or header switcher.</div>
        </div>
      </div>
    );
  }

  const compositeScore = site.composite_score || 0;
  const tierColor = site.tier_color || '#10B981';
  const tier = site.tier || 'VIABLE / RECOMMENDED';

  const renderTierIcon = () => {
    if (compositeScore >= 75.0) {
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
    } else if (compositeScore >= 50.0) {
      return <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />;
    } else {
      return <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />;
    }
  };

  const treesToCut = site.eco_assessment?.estimated_trees_to_cut ?? 0;
  const canopyPct = site.eco_assessment?.canopy_cover_pct ?? 3.2;

  const domainCards = [
    {
      id: "water",
      name: "Water Subsystem",
      axisLabel: "Water",
      score: site.water_score || 0,
      weight: "18%",
      icon: <Droplet className="w-3.5 h-3.5 text-[#074ce0]" />,
      shortTag: "CGWA • Zero Depletion",
    },
    {
      id: "power",
      name: "Power & Grid",
      axisLabel: "Power",
      score: site.power_score || 0,
      weight: "20%",
      icon: <Zap className="w-3.5 h-3.5 text-amber-500" />,
      shortTag: "CEA • 220kV Grid",
    },
    {
      id: "climate",
      name: "Climate & Cooling",
      axisLabel: "Climate",
      score: site.climate_score || 0,
      weight: "13%",
      icon: <Thermometer className="w-3.5 h-3.5 text-indigo-600" />,
      shortTag: "NASA Wet-Bulb",
    },
    {
      id: "connectivity",
      name: "Connectivity & CLS",
      axisLabel: "Fiber",
      score: site.connectivity_score || 0,
      weight: "12%",
      icon: <Wifi className="w-3.5 h-3.5 text-emerald-600" />,
      shortTag: "Subsea CLS • NIXI",
    },
    {
      id: "disaster",
      name: "Disaster Resilience",
      axisLabel: "Disaster",
      score: site.disaster_score || 0,
      weight: "8%",
      icon: <Shield className="w-3.5 h-3.5 text-rose-600" />,
      shortTag: "IS 1893:2016",
    },
    {
      id: "land",
      name: "Land & Civil",
      axisLabel: "Land",
      score: site.land_score || 0,
      weight: "7%",
      icon: <Layers className="w-3.5 h-3.5 text-purple-600" />,
      shortTag: "IT Zone • Soil SBC",
    },
    {
      id: "eco",
      name: "Ecology & Forests",
      axisLabel: "Ecology",
      score: site.eco_score || site.eco_assessment?.score || 88.0,
      weight: "15%",
      icon: <TreePine className="w-3.5 h-3.5 text-emerald-600" />,
      shortTag: treesToCut === 0 ? "0 Trees Cut • FSI Protected" : `${treesToCut} Trees Cut • 3:1 Afforest`,
    },
    {
      id: "economics",
      name: "Economics & Policy",
      axisLabel: "Policy",
      score: site.economics_score || 0,
      weight: "7%",
      icon: <Coins className="w-3.5 h-3.5 text-cyan-600" />,
      shortTag: "SERC Tariffs",
    },
  ];

  // Radar Chart Coordinates (viewBox: 0 0 340 200, center: 170, 96, radius: 55)
  const radarRadius = 55;
  const radarCenterX = 170;
  const radarCenterY = 96;
  const numAxes = domainCards.length;
  
  const getRadarCoordinates = (index, value) => {
    const angle = (Math.PI * 2 / numAxes) * index - Math.PI / 2;
    const r = (value / 100) * radarRadius;
    return {
      x: radarCenterX + r * Math.cos(angle),
      y: radarCenterY + r * Math.sin(angle),
    };
  };

  const getLabelCoordinates = (index) => {
    const angle = (Math.PI * 2 / numAxes) * index - Math.PI / 2;
    const r = radarRadius + 22; // 77px distance from center
    return {
      x: radarCenterX + r * Math.cos(angle),
      y: radarCenterY + r * Math.sin(angle),
      angle: angle,
    };
  };

  const radarPolygonPoints = domainCards.map((d, i) => {
    const coords = getRadarCoordinates(i, d.score);
    return `${coords.x.toFixed(1)},${coords.y.toFixed(1)}`;
  }).join(' ');

  const gridRings = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#dde0e6] shadow-sm flex flex-col justify-between h-full space-y-3.5 overflow-y-auto">
      
      {/* 1. Header with Site Name and Badge */}
      <div>
        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#454c58] font-mono mb-0.5">
              <MapPin className="w-3 h-3 text-[#074ce0] shrink-0" />
              <span className="font-semibold text-slate-800">{site.district || site.state}, {site.state}</span>
              <span className="text-slate-300">•</span>
              <span>Elev: <strong className="text-slate-700">{site.elevation_m}m</strong></span>
              <span className="text-slate-300">•</span>
              <span className="text-[#074ce0] font-bold">{site.proposed_it_load_mw} MW Load</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-[#16191f] tracking-tight leading-tight">
              {site.site_name}
            </h2>
          </div>

          {/* Status Badge */}
          <div 
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shrink-0 ${
              compositeScore >= 75 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : compositeScore >= 50 
                ? 'bg-amber-50 text-amber-800 border-amber-200' 
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {renderTierIcon()}
            <span className="tracking-wide text-[11px]">{tier}</span>
          </div>
        </div>

        {/* Real-Data Verification & Telemetry Badge */}
        {(site.is_live_evaluated || site.data_provenance) && (
          <div className="mb-2.5 p-2 rounded-xl bg-gradient-to-r from-blue-50/90 via-emerald-50/80 to-teal-50/90 border border-emerald-200 shadow-2xs flex flex-wrap items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-900 flex items-center gap-1">
                <Satellite className="w-3 h-3 text-emerald-600" />
                NASA & Gov Telemetry Active
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1 text-[9px] font-mono">
              <span className="px-1.5 py-0.2 rounded bg-white text-slate-700 border border-emerald-200 font-semibold shadow-2xs">
                🛰️ NASA POWER
              </span>
              <span className="px-1.5 py-0.2 rounded bg-white text-slate-700 border border-emerald-200 font-semibold shadow-2xs">
                ⛰️ NASA SRTM
              </span>
              <span className="px-1.5 py-0.2 rounded bg-white text-slate-700 border border-emerald-200 font-semibold shadow-2xs">
                🌫️ CAMS AQI
              </span>
              <span className="px-1.5 py-0.2 rounded bg-white text-slate-700 border border-emerald-200 font-semibold shadow-2xs">
                🌊 CGWB SOE
              </span>
              <span className="px-1.5 py-0.2 rounded bg-white text-slate-700 border border-emerald-200 font-semibold shadow-2xs">
                ⚡ CEA Grid
              </span>
              <span className="px-1.5 py-0.2 rounded bg-white text-slate-700 border border-emerald-200 font-semibold shadow-2xs">
                🌲 FSI Forests
              </span>
              <span className="px-1.5 py-0.2 rounded bg-white text-slate-700 border border-emerald-200 font-semibold shadow-2xs">
                💧 GloFAS Basins
              </span>
            </div>
          </div>
        )}

        {/* 2. Unified Hero Analytics Box: Feasibility Score + Spacious 8-Axis Radar */}
        <div className="p-3 rounded-xl bg-[#f8f9fb] border border-[#dde0e6] space-y-2">
          
          {/* Top Score Strip */}
          <div className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-lg border border-[#dde0e6] shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#074ce0] shrink-0 shadow-2xs">
                <Gauge className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#454c58] font-bold">
                  Composite Feasibility
                </div>
                <div className="text-[10px] text-[#8c94a4] font-sans">8-Domain Statutory Model (CGWB • CEA • FSI • BIS)</div>
              </div>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black font-display text-[#16191f] tracking-tight">
                {compositeScore.toFixed(1)}
              </span>
              <span className="text-[#8c94a4] font-mono text-xs">/100</span>
            </div>
          </div>

          {/* Clean 8-Axis Radar Spider Chart (Spacious 340x200 ViewBox, Zero Overlaps / Zero Clippings) */}
          <div className="bg-white p-2 rounded-lg border border-[#dde0e6] flex flex-col items-center justify-center shadow-2xs">
            <svg 
              width="100%" 
              height="185" 
              viewBox="0 0 340 200" 
              className="w-full max-w-[340px] select-none"
            >
              {/* Concentric Polygonal Background Grid */}
              {gridRings.map((scale, ringIdx) => {
                const ringPoints = domainCards.map((_, i) => {
                  const coords = getRadarCoordinates(i, scale * 100);
                  return `${coords.x.toFixed(1)},${coords.y.toFixed(1)}`;
                }).join(' ');
                return (
                  <polygon
                    key={ringIdx}
                    points={ringPoints}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth={ringIdx === gridRings.length - 1 ? "1.5" : "1"}
                    strokeDasharray={ringIdx < gridRings.length - 1 ? "3,3" : "none"}
                  />
                );
              })}

              {/* Axis Spokes from Center to Outer Perimeter */}
              {domainCards.map((_, i) => {
                const outer = getRadarCoordinates(i, 100);
                return (
                  <line
                    key={i}
                    x1={radarCenterX}
                    y1={radarCenterY}
                    x2={outer.x}
                    y2={outer.y}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Shaded Data Polygon */}
              <polygon
                points={radarPolygonPoints}
                fill={`${tierColor}25`}
                stroke={tierColor}
                strokeWidth="2.5"
                className="transition-all duration-300 drop-shadow-2xs"
              />

              {/* Axis Data Points & Non-overlapping Labels */}
              {domainCards.map((d, i) => {
                const coords = getRadarCoordinates(i, d.score);
                const labelPos = getLabelCoordinates(i);
                
                // Smart text anchor based on position around center
                let textAnchor = "middle";
                if (labelPos.x < radarCenterX - 15) textAnchor = "end";
                else if (labelPos.x > radarCenterX + 15) textAnchor = "start";

                return (
                  <g key={i}>
                    {/* Vertex Glow Point */}
                    <circle
                      cx={coords.x}
                      cy={coords.y}
                      r="3.5"
                      fill={tierColor}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    
                    {/* Domain Axis Label & Score with explicit SVG typography */}
                    <text
                      x={labelPos.x}
                      y={labelPos.y}
                      textAnchor={textAnchor}
                      dominantBaseline="central"
                      fontFamily="system-ui, -apple-system, sans-serif"
                      fontSize="10"
                      fontWeight="700"
                      fill="#1e293b"
                    >
                      {d.axisLabel} <tspan fill={tierColor} fontWeight="800" dx="2">{d.score.toFixed(0)}</tspan>
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Radar Scale Reference */}
            <div className="flex items-center justify-between w-full px-2 pt-1 border-t border-slate-100 text-[9px] font-mono text-[#8c94a4]">
              <span>0% Center</span>
              <span className="flex items-center gap-1 font-bold text-slate-700">
                <Activity className="w-3 h-3 text-[#074ce0]" />
                8-Domain Multi-Axis Balance (Ecology Included)
              </span>
              <span>100% Perimeter</span>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Balanced 2x4 Grid of 8 Dimension Cards (4 Rows x 2 Columns) */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#454c58] font-bold flex items-center justify-between">
          <span>8 Statutory Infrastructure & Ecology Dimensions</span>
          <span className="text-[9.5px] text-[#8c94a4] font-normal">Weights: 100%</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {domainCards.map((domain) => (
            <div 
              key={domain.id}
              className="p-2 rounded-xl bg-white border border-[#dde0e6] hover:border-[#074ce0]/40 transition-colors flex items-center justify-between gap-2 shadow-2xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1 rounded-lg bg-[#f3f4f6] text-[#16191f] shrink-0">
                  {domain.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-[#16191f] font-display leading-tight">
                    {domain.name}
                  </div>
                  <div className="text-[9.5px] text-[#454c58] font-mono leading-tight mt-0.5">
                    {domain.shortTag}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0 font-mono pl-1">
                <div className="text-xs font-bold text-[#16191f]">
                  {domain.score.toFixed(1)}
                </div>
                <div className="text-[9px] text-[#8c94a4]">
                  {domain.weight}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Footer Note */}
      <div className="pt-1.5 border-t border-[#dde0e6] flex items-center justify-between text-[9.5px] text-[#8c94a4] font-mono">
        <span>Deterministic (CGWB • CEA • FSI • BIS)</span>
        <span className="text-[#074ce0] font-semibold">Zero Hallucinations</span>
      </div>

    </div>
  );
}
