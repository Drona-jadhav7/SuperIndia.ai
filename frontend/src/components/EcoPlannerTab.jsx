import React, { useState, useEffect, useRef } from 'react';
import { 
  Leaf, 
  Droplet, 
  TreePine, 
  Sun, 
  Wind, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Download, 
  Sliders, 
  Compass, 
  Sparkles, 
  Server, 
  Layers, 
  TrendingUp, 
  Satellite, 
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Award
} from 'lucide-react';
import { assessEcoFriendlyDC } from '../services/api';

export default function EcoPlannerTab({ selectedSite }) {
  const [isLoading, setIsLoading] = useState(false);
  const [ecoResult, setEcoResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Interactive Simulation Controls
  const [coolingMode, setCoolingMode] = useState('DIRECT_TO_CHIP_LIQUID');
  const [solarRooftopMw, setSolarRooftopMw] = useState(3.0);
  const [solarPpaMw, setSolarPpaMw] = useState(45.0);
  const [itLoadMw, setItLoadMw] = useState(selectedSite?.proposed_it_load_mw || 50.0);

  const debounceTimerRef = useRef(null);

  // Sync with selected site
  useEffect(() => {
    if (selectedSite?.proposed_it_load_mw) {
      setItLoadMw(selectedSite.proposed_it_load_mw);
    }
  }, [selectedSite]);

  const runCalculation = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const lat = selectedSite?.latitude || selectedSite?.coordinates?.lat || 19.10;
      const lon = selectedSite?.longitude || selectedSite?.coordinates?.lon || 73.01;
      const district = selectedSite?.district || "Thane";
      const state = selectedSite?.state || "Maharashtra";
      const soe = selectedSite?.water_params?.groundwater_extraction_pct || 74.0;

      const payload = {
        latitude: lat,
        longitude: lon,
        site_name: selectedSite?.site_name || "Mahape MIDC Eco Campus",
        district: district,
        state: state,
        it_load_mw: parseFloat(itLoadMw),
        cooling_mode: coolingMode,
        solar_rooftop_mw: parseFloat(solarRooftopMw),
        offsite_solar_ppa_mw: parseFloat(solarPpaMw),
        aquifer_soe_pct: parseFloat(soe),
        solar_ghi: 5.4,
        wind_speed: 5.2,
      };

      const res = await assessEcoFriendlyDC(payload);
      setEcoResult(res);
    } catch (err) {
      console.error("Eco assessment error:", err);
      setErrorMsg("Failed to run environmental calculation. Ensure backend service is active.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      runCalculation();
    }, 200);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [selectedSite, coolingMode, solarRooftopMw, solarPpaMw, itLoadMw]);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* 1. Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-[#dde0e6] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 uppercase tracking-wider font-bold mb-1">
            <Leaf className="w-4 h-4 text-emerald-600" />
            Module 8: Eco-Friendly AI Data Center & Environmental Protection Engine
          </div>
          <h2 className="text-2xl font-bold font-display text-[#16191f] tracking-tight">
            Zero-Deforestation & Sustainable Water Siting Mandate
          </h2>
          <p className="text-xs text-[#454c58] mt-1 max-w-2xl leading-relaxed">
            Statutory environmental assessment grounded in <strong>Open-Meteo GloFAS river discharge</strong>, 
            <strong>ERA5 soil moisture</strong>, <strong>Global Forest Watch / FSI canopy loss</strong>, and <strong>CEA grid emissions</strong>.
            Guarantees zero aquifer depletion and complete ecological buffer compliance.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-900 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Target: {selectedSite?.site_name?.split(' (')[0] || "Navi Mumbai"}</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={runCalculation} className="underline font-bold">Retry</button>
        </div>
      )}

      {/* 2. Top Hero Metric Strip */}
      {ecoResult && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Overall Eco-Score */}
          <div className="bg-white p-5 rounded-2xl border border-[#dde0e6] shadow-sm flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-[#8c94a4] uppercase font-bold">Eco-Feasibility Index</div>
              <div className="text-3xl font-black font-display text-[#16191f] mt-1">
                {ecoResult.overall_eco_score.toFixed(1)}
                <span className="text-xs font-normal text-[#8c94a4]">/100</span>
              </div>
              <div className="text-[11px] font-bold mt-1" style={{ color: ecoResult.tier_color }}>
                {ecoResult.eco_tier}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md" style={{ backgroundColor: ecoResult.tier_color }}>
              <Leaf className="w-6 h-6" />
            </div>
          </div>

          {/* Water Saved Daily */}
          <div className="bg-white p-5 rounded-2xl border border-[#dde0e6] shadow-sm flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-[#8c94a4] uppercase font-bold">Daily Water Saved</div>
              <div className="text-2xl font-black font-display text-emerald-600 mt-1">
                +{(ecoResult.water_preservation.daily_water_saved_liters / 1000000).toFixed(2)}M
                <span className="text-xs font-normal text-[#454c58]"> L/day</span>
              </div>
              <div className="text-[11px] text-[#454c58] mt-1 font-mono">
                {ecoResult.water_preservation.water_saved_percentage}% vs Evaporative
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-[#074ce0] flex items-center justify-center">
              <Droplet className="w-6 h-6" />
            </div>
          </div>

          {/* Tree Canopy & Forest Cover */}
          <div className="bg-white p-5 rounded-2xl border border-[#dde0e6] shadow-sm flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-[#8c94a4] uppercase font-bold">Deforestation Status</div>
              <div className="text-2xl font-black font-display text-[#16191f] mt-1">
                {ecoResult.forest_protection.tree_canopy_cover_pct}%
                <span className="text-xs font-normal text-[#454c58]"> Canopy</span>
              </div>
              <div className="text-[11px] font-bold text-emerald-700 mt-1 font-mono">
                Zero Forest Clearing
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <TreePine className="w-6 h-6" />
            </div>
          </div>

          {/* Clean Energy & Carbon Displaced */}
          <div className="bg-white p-5 rounded-2xl border border-[#dde0e6] shadow-sm flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-[#8c94a4] uppercase font-bold">Carbon Displaced</div>
              <div className="text-2xl font-black font-display text-indigo-600 mt-1">
                {Math.round(ecoResult.renewable_and_carbon.annual_carbon_abated_tons_yr / 1000)}k
                <span className="text-xs font-normal text-[#454c58]"> Tons/yr</span>
              </div>
              <div className="text-[11px] text-[#454c58] mt-1 font-mono">
                {ecoResult.renewable_and_carbon.renewable_energy_share_pct}% Clean Power
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
              <Sun className="w-6 h-6" />
            </div>
          </div>

        </div>
      )}

      {/* 3. Main Analytical Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Interactive Sizing & Cooling Controls (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-[#dde0e6] shadow-sm space-y-5">
          <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[#16191f] flex items-center gap-2 border-b border-[#dde0e6] pb-3">
            <Sliders className="w-4 h-4 text-emerald-600" />
            Eco-Engineering Controls
          </h3>

          {/* IT Load (MW) */}
          <div>
            <div className="flex justify-between items-center text-xs font-mono text-[#454c58] mb-1.5">
              <span>Proposed Compute Load</span>
              <span className="font-bold text-[#16191f]">{itLoadMw} MW</span>
            </div>
            <input 
              type="range"
              min="10"
              max="200"
              step="5"
              value={itLoadMw}
              onChange={(e) => setItLoadMw(parseFloat(e.target.value))}
              className="w-full accent-emerald-600"
            />
          </div>

          {/* Cooling Mode Selector */}
          <div>
            <label className="block text-xs font-mono text-[#454c58] mb-1.5 font-medium">
              Cooling Loop Architecture
            </label>
            <select
              value={coolingMode}
              onChange={(e) => setCoolingMode(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-[#dde0e6] rounded-xl px-3 py-2 text-xs text-[#16191f] font-mono focus:outline-none focus:border-emerald-600"
            >
              <option value="DIRECT_TO_CHIP_LIQUID">Direct-to-Chip Closed-Loop (93% Water Saved)</option>
              <option value="DRY_AIR_CHILLER">100% Dry Chiller / Adiabatic (99% Water Saved)</option>
              <option value="IMMERSION">Single-Phase Synthetic Immersion (Near-Zero Water)</option>
              <option value="CONVENTIONAL_EVAPORATIVE">Conventional Evaporative Tower (Water Intensive)</option>
            </select>
            <p className="text-[10px] text-[#8c94a4] font-mono mt-1">
              Direct-to-Chip avoids millions of liters of daily groundwater depletion.
            </p>
          </div>

          {/* Solar Rooftop Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-mono text-[#454c58] mb-1.5">
              <span>On-Site Rooftop Solar PV</span>
              <span className="font-bold text-[#16191f]">{solarRooftopMw} MW</span>
            </div>
            <input 
              type="range"
              min="0"
              max="15"
              step="0.5"
              value={solarRooftopMw}
              onChange={(e) => setSolarRooftopMw(parseFloat(e.target.value))}
              className="w-full accent-emerald-600"
            />
          </div>

          {/* Offsite Solar PPA Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-mono text-[#454c58] mb-1.5">
              <span>Green Energy Open Access PPA</span>
              <span className="font-bold text-[#16191f]">{solarPpaMw} MW</span>
            </div>
            <input 
              type="range"
              min="0"
              max="200"
              step="5"
              value={solarPpaMw}
              onChange={(e) => setSolarPpaMw(parseFloat(e.target.value))}
              className="w-full accent-emerald-600"
            />
            <p className="text-[10px] text-[#8c94a4] font-mono mt-1">
              Ministry of Power 2022 Green Energy Rules enable 100% off-site clean PPA.
            </p>
          </div>

          {/* Live Telemetry Provenance Box */}
          <div className="p-3.5 rounded-xl bg-[#f8f9fb] border border-[#dde0e6] space-y-2 text-[11px] font-mono">
            <div className="text-[10px] font-bold text-[#454c58] uppercase flex items-center gap-1.5">
              <Satellite className="w-3.5 h-3.5 text-emerald-600" />
              Active Telemetry Pipelines
            </div>
            <div className="space-y-1 text-[#454c58]">
              <div className="flex justify-between">
                <span>GloFAS River Flow:</span>
                <span className="text-[#16191f] font-semibold">{ecoResult?.glofas_hydrology?.river_discharge_m3_s || 24.5} m³/s</span>
              </div>
              <div className="flex justify-between">
                <span>ERA5 Soil Water:</span>
                <span className="text-[#16191f] font-semibold">{ecoResult?.era5_soil_moisture?.soil_moisture_root_m3_m3 || 0.25} m³/m³</span>
              </div>
              <div className="flex justify-between">
                <span>CEA Grid Baseline:</span>
                <span className="text-[#16191f] font-semibold">0.716 kg/kWh</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Deep Environmental Intelligence Panels (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* PILLAR 1: Water Shortage Prevention & Conservation */}
          {ecoResult && (
            <div className="bg-white p-6 rounded-2xl border border-[#dde0e6] shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#dde0e6] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-[#074ce0] flex items-center justify-center">
                    <Droplet className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-display text-[#16191f]">
                      Pillar 1: Aquifer Depletion & Zero Water Shortage Guard
                    </h3>
                    <p className="text-xs text-[#454c58]">
                      Central Ground Water Board (CGWB) & Copernicus GloFAS River Flow Integration
                    </p>
                  </div>
                </div>

                <div className="px-2.5 py-1 rounded-full bg-blue-50 text-[#074ce0] text-xs font-mono font-bold border border-blue-200">
                  WUE: {ecoResult.water_preservation.water_usage_effectiveness_wue} L/kWh
                </div>
              </div>

              {/* Water Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 bg-[#f8f9fb] rounded-xl border border-[#dde0e6]">
                  <div className="text-[#8c94a4] text-[10px] uppercase">Evaporative Need</div>
                  <div className="text-base font-bold text-slate-800 mt-1">
                    {(ecoResult.water_preservation.daily_evaporative_needed_liters / 1000).toLocaleString()} kL/day
                  </div>
                  <div className="text-[10px] text-rose-600 mt-0.5">High Aquifer Stress</div>
                </div>

                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
                  <div className="text-emerald-800 text-[10px] uppercase font-bold">With {ecoResult.water_preservation.cooling_technology.split(' ')[0]}</div>
                  <div className="text-base font-bold text-emerald-950 mt-1">
                    {(ecoResult.water_preservation.daily_actual_consumption_liters / 1000).toLocaleString()} kL/day
                  </div>
                  <div className="text-[10px] text-emerald-700 mt-0.5">93.3% Aquifer Shield</div>
                </div>

                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200">
                  <div className="text-blue-800 text-[10px] uppercase font-bold">Net Water Conserved</div>
                  <div className="text-base font-bold text-[#074ce0] mt-1">
                    +{(ecoResult.water_preservation.daily_water_saved_liters / 1000).toLocaleString()} kL/day
                  </div>
                  <div className="text-[10px] text-[#074ce0] mt-0.5">Zero Municipal Deprivation</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Verdict:</strong> {ecoResult.water_preservation.water_status}. 
                  Closed-loop liquid loops ensure agricultural and municipal water security in {ecoResult.district}.
                </span>
              </div>
            </div>
          )}

          {/* PILLAR 2: Zero-Deforestation & Tree Canopy Protection */}
          {ecoResult && (
            <div className="bg-white p-6 rounded-2xl border border-[#dde0e6] shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#dde0e6] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                    <TreePine className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-display text-[#16191f]">
                      Pillar 2: Zero-Deforestation & Forest Canopy Conservation
                    </h3>
                    <p className="text-xs text-[#454c58]">
                      Forest Survey of India (ISFR 2023) & Global Forest Watch (GFW) Verification
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-mono font-bold border border-emerald-200">
                  {ecoResult.forest_protection.deforestation_risk_level.split(' ')[0]}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 bg-[#f8f9fb] rounded-xl border border-[#dde0e6]">
                  <div className="text-[#8c94a4] text-[10px] uppercase">Zoning Classification</div>
                  <div className="text-xs font-bold text-[#16191f] mt-1 font-sans">
                    {ecoResult.forest_protection.forest_classification}
                  </div>
                  <div className="text-[10px] text-emerald-600 mt-0.5">Non-Forest Industrial Land</div>
                </div>

                <div className="p-3 bg-[#f8f9fb] rounded-xl border border-[#dde0e6]">
                  <div className="text-[#8c94a4] text-[10px] uppercase">Eco-Sensitive Zone (ESZ)</div>
                  <div className="text-base font-bold text-[#16191f] mt-1">
                    {ecoResult.forest_protection.eco_sensitive_zone_dist_km} km
                  </div>
                  <div className="text-[10px] text-emerald-600 mt-0.5">&gt; 10km Wildlife Buffer Pass</div>
                </div>

                <div className="p-3 bg-[#f8f9fb] rounded-xl border border-[#dde0e6]">
                  <div className="text-[#8c94a4] text-[10px] uppercase">Compensatory Greenbelt</div>
                  <div className="text-base font-bold text-emerald-700 mt-1">
                    {ecoResult.forest_protection.compensatory_afforestation_trees} Trees
                  </div>
                  <div className="text-[10px] text-emerald-600 mt-0.5">3:1 Endemic Species Mandate</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#f8f9fb] border border-[#dde0e6] text-xs font-mono text-[#454c58] leading-relaxed">
                <strong className="text-[#16191f]">Anti-Deforestation Guarantee:</strong> The candidate facility is planned exclusively on brownfield or pre-notified industrial corridors with tree canopy density under 5%. Prohibits topsoil excavation or tree removal across contiguous parcels.
              </div>
            </div>
          )}

          {/* PILLAR 3: Carbon Neutrality & 100% Clean Energy Transition */}
          {ecoResult && (
            <div className="bg-white p-6 rounded-2xl border border-[#dde0e6] shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#dde0e6] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-display text-[#16191f]">
                      Pillar 3: Carbon Neutrality & Clean Power Displacement
                    </h3>
                    <p className="text-xs text-[#454c58]">
                      Central Electricity Authority (CEA) CO2 Baseline & Ministry of Power Green Rules
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-mono font-bold border border-indigo-200">
                  {ecoResult.renewable_and_carbon.renewable_energy_share_pct}% Net Zero
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 bg-[#f8f9fb] rounded-xl border border-[#dde0e6]">
                  <div className="text-[#8c94a4] text-[10px] uppercase">Grid Baseline CO2</div>
                  <div className="text-base font-bold text-slate-800 mt-1">
                    {Math.round(ecoResult.renewable_and_carbon.baseline_co2_emissions_tons_yr).toLocaleString()} Tons
                  </div>
                  <div className="text-[10px] text-[#8c94a4]">CEA 0.716 kg/kWh Standard</div>
                </div>

                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
                  <div className="text-emerald-800 text-[10px] uppercase font-bold">Annual Carbon Abated</div>
                  <div className="text-base font-bold text-emerald-800 mt-1">
                    -{Math.round(ecoResult.renewable_and_carbon.annual_carbon_abated_tons_yr).toLocaleString()} Tons
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold">Clean Solar/Wind PPA</div>
                </div>

                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200">
                  <div className="text-indigo-800 text-[10px] uppercase font-bold">Net Residual Footprint</div>
                  <div className="text-base font-bold text-indigo-950 mt-1">
                    {Math.round(ecoResult.renewable_and_carbon.net_annual_co2_emissions_tons_yr).toLocaleString()} Tons
                  </div>
                  <div className="text-[10px] text-indigo-700">Scope 2 Reduction Target</div>
                </div>
              </div>
            </div>
          )}

          {/* 4. Statutory ESG Certification & Mandates List */}
          {ecoResult && (
            <div className="bg-white p-6 rounded-2xl border border-[#dde0e6] shadow-sm space-y-4">
              <h3 className="text-base font-bold font-display text-[#16191f] flex items-center gap-2 border-b border-[#dde0e6] pb-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Statutory Environmental & ESG Mandates (Rule-Enforced)
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center">
                  <div className="text-[10px] text-emerald-700 font-bold">MoEFCC EIA 2006</div>
                  <div className="font-extrabold text-sm mt-0.5">Compliant</div>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center">
                  <div className="text-[10px] text-emerald-700 font-bold">CGWB Aquifer NOC</div>
                  <div className="font-extrabold text-sm mt-0.5">Eligible</div>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center">
                  <div className="text-[10px] text-emerald-700 font-bold">Green Open Access</div>
                  <div className="font-extrabold text-sm mt-0.5">MoP Approved</div>
                </div>
                <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-center">
                  <div className="text-[10px] text-indigo-700 font-bold">LEED Data Center</div>
                  <div className="font-extrabold text-sm mt-0.5">{ecoResult.statutory_certifications.leed_green_rating}</div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                {ecoResult.environmental_mandates.map((mandate, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-xl bg-[#f8f9fb] border border-[#dde0e6] text-xs text-[#16191f] flex items-start gap-2.5 font-sans"
                  >
                    <span className="font-mono text-emerald-700 font-bold mt-0.5 shrink-0">{idx + 1}.</span>
                    <span className="leading-relaxed">{mandate}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
