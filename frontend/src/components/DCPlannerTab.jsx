import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Cpu, 
  Zap, 
  Droplet, 
  Flame, 
  Coins, 
  TrendingUp, 
  ShieldCheck, 
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';
import { calculateDCPlan, fetchDCHardwareOptions } from '../services/api';

export default function DCPlannerTab({ selectedSite }) {
  const [hardwareCatalog, setHardwareCatalog] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [planResult, setPlanResult] = useState(null);

  // Form State
  const [gpuModel, setGpuModel] = useState('NVIDIA_H100_SXM');
  const [gpuCount, setGpuCount] = useState(8192);
  const [coolingMode, setCoolingMode] = useState('DIRECT_TO_CHIP_LIQUID');
  const [tariff, setTariff] = useState(selectedSite?.economics_params?.electricity_tariff_inr_per_kwh || 7.5);
  const [wetBulb, setWetBulb] = useState(selectedSite?.climate_params?.dry_bulb_temp_c ? 26.5 : 26.5);

  useEffect(() => {
    const loadHardware = async () => {
      try {
        const data = await fetchDCHardwareOptions();
        setHardwareCatalog(data);
      } catch (err) {
        console.error('Failed to load hardware options:', err);
      }
    };
    loadHardware();
  }, []);

  const runCalculation = async () => {
    setIsLoading(true);
    try {
      const payload = {
        site_name: selectedSite?.site_name || "Navi Mumbai Mega Hub",
        state: selectedSite?.state || "Maharashtra",
        gpu_model: gpuModel,
        target_gpu_count: parseInt(gpuCount),
        cooling_mode: coolingMode,
        electricity_tariff_inr_per_kwh: parseFloat(tariff),
        ambient_wet_bulb_c: parseFloat(wetBulb),
      };
      const res = await calculateDCPlan(payload);
      setPlanResult(res);
    } catch (err) {
      console.error('DC planning error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runCalculation();
  }, [gpuModel, gpuCount, coolingMode, tariff, wetBulb, selectedSite]);

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#dde0e6] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#074ce0] uppercase tracking-wider font-bold mb-1">
            <Server className="w-4 h-4" />
            Module 2: AI / Data Center Intelligence Engine
          </div>
          <h2 className="text-2xl font-bold font-display text-[#16191f] tracking-tight">
            Hyperscale Data Center Sizing & Capacity Planner
          </h2>
          <p className="text-xs text-[#454c58] mt-1 max-w-2xl">
            Deterministically derives server chassis count, liquid cooling loops, high-voltage substation sizing,
            dynamic climate-adjusted PUE, and full CAPEX/OPEX based on authentic hardware TDP benchmarks.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-[#f3f4f6] border border-[#dde0e6] text-xs font-mono text-[#454c58]">
          Target Site: <strong className="text-[#074ce0] font-bold">{selectedSite?.site_name || "Navi Mumbai"}</strong>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Sizing Controls (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-[#dde0e6] shadow-sm space-y-5">
          <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[#16191f] flex items-center gap-2 border-b border-[#dde0e6] pb-3">
            <Cpu className="w-4 h-4 text-[#074ce0]" />
            Engineering Parameters
          </h3>

          {/* GPU Hardware Selector */}
          <div>
            <label className="block text-xs font-mono text-[#454c58] mb-1.5 font-medium">
              GPU Hardware Architecture
            </label>
            <select
              value={gpuModel}
              onChange={(e) => setGpuModel(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-[#dde0e6] rounded-xl px-3 py-2 text-xs text-[#16191f] font-mono focus:outline-none focus:border-[#074ce0]"
            >
              <option value="NVIDIA_H100_SXM">NVIDIA H100 SXM5 (700W • 8-GPU HGX)</option>
              <option value="NVIDIA_B200_NVL72">NVIDIA Blackwell B200 NVL72 (1000W Liquid Rack)</option>
              <option value="NVIDIA_L40S">NVIDIA L40S (350W • Inference Workhorse)</option>
              <option value="NVIDIA_A100_SXM">NVIDIA A100 SXM4 (400W • Academic/Gov)</option>
            </select>
          </div>

          {/* Target GPU Count Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-mono text-[#454c58] mb-1.5">
              <span>Target GPU Count</span>
              <span className="text-[#074ce0] font-bold text-sm">{parseInt(gpuCount).toLocaleString()} GPUs</span>
            </div>
            <input
              type="range"
              min="128"
              max="32768"
              step="128"
              value={gpuCount}
              onChange={(e) => setGpuCount(e.target.value)}
              className="w-full h-2 bg-[#dde0e6] rounded-lg appearance-none cursor-pointer accent-[#074ce0]"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#8c94a4] mt-1">
              <span>128</span>
              <span>8,192</span>
              <span>16,384</span>
              <span>32,768</span>
            </div>
          </div>

          {/* Cooling Mode Selector */}
          <div>
            <label className="block text-xs font-mono text-[#454c58] mb-1.5 font-medium">
              Thermodynamic Cooling Technology
            </label>
            <select
              value={coolingMode}
              onChange={(e) => setCoolingMode(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-[#dde0e6] rounded-xl px-3 py-2 text-xs text-[#16191f] font-mono focus:outline-none focus:border-[#074ce0]"
            >
              <option value="DIRECT_TO_CHIP_LIQUID">Direct-to-Chip (D2C) Liquid Cooling (ASHRAE W40)</option>
              <option value="REAR_DOOR_HEAT_EXCHANGER">Rear Door Heat Exchanger (RDHx) + Chilled Water</option>
              <option value="AIR_COOLED_CRAH">Traditional Air-Cooled Perimeter CRAH</option>
              <option value="TOTAL_IMMERSION">Two-Phase / Single-Phase Immersion Tank</option>
            </select>
          </div>

          {/* Electricity Tariff Input */}
          <div>
            <div className="flex justify-between text-xs font-mono text-[#454c58] mb-1.5">
              <span>Electricity Tariff (₹/kWh)</span>
              <span className="text-[#16191f] font-bold">₹{parseFloat(tariff).toFixed(2)}</span>
            </div>
            <input
              type="number"
              step="0.1"
              value={tariff}
              onChange={(e) => setTariff(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-[#dde0e6] rounded-xl px-3 py-2 text-xs text-[#16191f] font-mono focus:outline-none focus:border-[#074ce0]"
            />
          </div>

          {/* Ambient Wet-Bulb Temp */}
          <div>
            <div className="flex justify-between text-xs font-mono text-[#454c58] mb-1.5">
              <span>Design Ambient Wet-Bulb</span>
              <span className="text-[#074ce0] font-bold">{parseFloat(wetBulb).toFixed(1)}°C</span>
            </div>
            <input
              type="number"
              step="0.5"
              value={wetBulb}
              onChange={(e) => setWetBulb(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-[#dde0e6] rounded-xl px-3 py-2 text-xs text-[#16191f] font-mono focus:outline-none focus:border-[#074ce0]"
            />
          </div>

        </div>

        {/* Right Column: Calculated Engineering Results (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {planResult && (
            <>
              {/* Top 4 KPI Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                
                <div className="p-4 rounded-xl bg-white border border-[#dde0e6] shadow-sm">
                  <div className="text-[11px] font-mono text-[#454c58] uppercase tracking-wider mb-1 flex items-center gap-1 font-semibold">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    Facility Power
                  </div>
                  <div className="text-2xl font-bold font-display text-[#16191f]">
                    {planResult.total_facility_power_mw} <span className="text-xs text-amber-600 font-mono">MW</span>
                  </div>
                  <div className="text-[10px] text-[#454c58] font-mono mt-1">
                    IT Load: {planResult.total_it_load_mw} MW
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#dde0e6] shadow-sm">
                  <div className="text-[11px] font-mono text-[#454c58] uppercase tracking-wider mb-1 flex items-center gap-1 font-semibold">
                    <Flame className="w-3.5 h-3.5 text-[#074ce0]" />
                    Dynamic PUE
                  </div>
                  <div className="text-2xl font-bold font-display text-[#074ce0]">
                    {planResult.computed_pue}
                  </div>
                  <div className="text-[10px] text-[#454c58] font-mono mt-1">
                    Climate Adjusted
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#dde0e6] shadow-sm">
                  <div className="text-[11px] font-mono text-[#454c58] uppercase tracking-wider mb-1 flex items-center gap-1 font-semibold">
                    <Layers className="w-3.5 h-3.5 text-purple-600" />
                    Liquid Racks
                  </div>
                  <div className="text-2xl font-bold font-display text-[#16191f]">
                    {planResult.rack_count} <span className="text-xs text-purple-600 font-mono">Racks</span>
                  </div>
                  <div className="text-[10px] text-[#454c58] font-mono mt-1">
                    ~{planResult.average_rack_density_kw} kW/rack
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#dde0e6] shadow-sm">
                  <div className="text-[11px] font-mono text-[#454c58] uppercase tracking-wider mb-1 flex items-center gap-1 font-semibold">
                    <Droplet className="w-3.5 h-3.5 text-[#074ce0]" />
                    Water Demand
                  </div>
                  <div className="text-2xl font-bold font-display text-[#16191f]">
                    {planResult.daily_water_demand_mld} <span className="text-xs text-[#074ce0] font-mono">MLD</span>
                  </div>
                  <div className="text-[10px] text-[#454c58] font-mono mt-1">
                    {planResult.primary_cooling_loop_flow_lpm.toLocaleString()} L/min flow
                  </div>
                </div>

              </div>

              {/* Financial Capitalization & Operating Expenses Matrix */}
              <div className="bg-white p-5 rounded-2xl border border-[#dde0e6] shadow-sm">
                <div className="flex items-center justify-between border-b border-[#dde0e6] pb-3 mb-4">
                  <h4 className="text-sm font-bold font-display uppercase tracking-wider text-[#16191f] flex items-center gap-2">
                    <Coins className="w-4 h-4 text-emerald-600" />
                    Capital & Operational Expenditure (₹ Crore)
                  </h4>
                  <span className="text-[11px] font-mono text-[#454c58]">
                    Authentic CEA & Industrial Standards
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* CAPEX Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-mono text-[#454c58]">Total Infrastructure CAPEX</span>
                      <span className="text-xl font-bold font-display text-emerald-700">
                        ₹{planResult.total_capex_cr.toLocaleString()} Cr
                      </span>
                    </div>

                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between p-2.5 rounded-xl bg-[#f3f4f6] border border-[#dde0e6]">
                        <span className="text-[#454c58]">GPU & Server Hardware</span>
                        <span className="text-[#16191f] font-bold">₹{planResult.capex_gpu_servers_cr.toLocaleString()} Cr</span>
                      </div>
                      <div className="flex justify-between p-2.5 rounded-xl bg-[#f3f4f6] border border-[#dde0e6]">
                        <span className="text-[#454c58]">Electrical (GIS, UPS, Backup Gensets)</span>
                        <span className="text-[#16191f] font-bold">₹{planResult.capex_electrical_infrastructure_cr.toLocaleString()} Cr</span>
                      </div>
                      <div className="flex justify-between p-2.5 rounded-xl bg-[#f3f4f6] border border-[#dde0e6]">
                        <span className="text-[#454c58]">Mechanical & Liquid Cooling Plant</span>
                        <span className="text-[#16191f] font-bold">₹{planResult.capex_cooling_mechanical_cr.toLocaleString()} Cr</span>
                      </div>
                      <div className="flex justify-between p-2.5 rounded-xl bg-[#f3f4f6] border border-[#dde0e6]">
                        <span className="text-[#454c58]">Civil Building, Shell & Security</span>
                        <span className="text-[#16191f] font-bold">₹{planResult.capex_civil_building_cr.toLocaleString()} Cr</span>
                      </div>
                    </div>
                  </div>

                  {/* OPEX & Sustainability Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-mono text-[#454c58]">Annual Total OPEX</span>
                      <span className="text-xl font-bold font-display text-amber-700">
                        ₹{planResult.total_annual_opex_cr.toLocaleString()} Cr / yr
                      </span>
                    </div>

                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between p-2.5 rounded-xl bg-[#f3f4f6] border border-[#dde0e6]">
                        <span className="text-[#454c58]">Electricity OPEX (at ₹{tariff}/kWh)</span>
                        <span className="text-[#16191f] font-bold">₹{planResult.annual_power_opex_cr.toLocaleString()} Cr / yr</span>
                      </div>
                      <div className="flex justify-between p-2.5 rounded-xl bg-[#f3f4f6] border border-[#dde0e6]">
                        <span className="text-[#454c58]">Water, Facilities & Security Maintenance</span>
                        <span className="text-[#16191f] font-bold">₹{planResult.annual_water_maintenance_opex_cr.toLocaleString()} Cr / yr</span>
                      </div>
                      <div className="flex justify-between p-2.5 rounded-xl bg-[#f3f4f6] border border-[#dde0e6]">
                        <span className="text-[#454c58]">Compute Throughput (FP8)</span>
                        <span className="text-[#074ce0] font-bold">{planResult.aggregate_compute_pflops_fp8.toLocaleString()} PFLOPS</span>
                      </div>
                      <div className="flex justify-between p-2.5 rounded-xl bg-[#f3f4f6] border border-[#dde0e6]">
                        <span className="text-[#454c58]">Annual Grid Carbon Emission (CEA)</span>
                        <span className="text-rose-700 font-bold">{planResult.annual_carbon_footprint_tco2.toLocaleString()} tCO2 / yr</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Substation Sizing Note */}
                <div className="mt-4 p-3 rounded-xl bg-[#f3f4f6] border border-[#dde0e6] flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 text-[#16191f]">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Dedicated Grid Substation Requirement: <strong>{planResult.substation_capacity_mva} MVA (N+1 Redundancy)</strong></span>
                  </div>
                  <span className="text-[#454c58]">{planResult.server_count.toLocaleString()} Physical Server Nodes</span>
                </div>

              </div>

              {/* Summary Banner */}
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs font-mono text-blue-950">
                <strong className="text-[#074ce0]">Engineering Specification:</strong> {planResult.summary}
              </div>

            </>
          )}
        </div>

      </div>

    </div>
  );
}
