import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Cpu, 
  Zap, 
  Coins, 
  MapPin, 
  Activity, 
  ArrowRight,
  Info,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { fetchDemandForecast, simulateDemand } from '../services/api';

export default function DemandForecastTab() {
  const [forecastData, setForecastData] = useState(null);
  const [simulationResult, setSimulationResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Simulation Form
  const [dauMillion, setDauMillion] = useState(50);
  const [tokensPerUser, setTokensPerUser] = useState(5000);
  const [modelsPerYear, setModelsPerYear] = useState(12);
  const [modelParamsB, setModelParamsB] = useState(70);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchDemandForecast();
        setForecastData(data);
      } catch (err) {
        console.error('Failed to load forecast data:', err);
      }
    };
    loadData();
  }, []);

  const runSimulation = async (e) => {
    if (e) e.preventDefault();
    setIsSimulating(true);
    try {
      const payload = {
        projected_daily_active_users_million: parseFloat(dauMillion),
        average_tokens_per_user_daily: parseInt(tokensPerUser),
        target_foundation_models_training_per_year: parseInt(modelsPerYear),
        average_model_parameter_billions: parseFloat(modelParamsB),
      };
      const res = await simulateDemand(payload);
      setSimulationResult(res);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [dauMillion, tokensPerUser, modelsPerYear, modelParamsB]);

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="bg-white p-6 rounded-xl border border-[#dde0e6] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#074ce0] uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4 text-[#074ce0]" />
            Module 4: National AI Demand Forecasting & Capacity Roadmap
          </div>
          <h2 className="text-2xl font-display font-bold text-[#16191f] tracking-tight">
            Sovereign Compute Trajectory & Deficit Intelligence
          </h2>
          <p className="text-sm font-sans text-[#454c58] mt-1 max-w-2xl leading-relaxed">
            Forecasts training vs inference demand shifts through 2030 across Indian startups, enterprises, and research.
            Translates national Indic language token generation volume into required GPUs, electrical megawatts, and capital outlay.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-lg bg-[#f3f4f6] border border-[#dde0e6] text-xs font-mono text-[#16191f]">
          Horizon: <strong className="text-[#074ce0]">2024 — 2030</strong>
        </div>
      </div>

      {/* 2024 to 2030 National Milestones Grid */}
      {forecastData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {forecastData.timeline.map((stage) => {
            const isDeficit = stage.deficit_gpus > 0;
            return (
              <div 
                key={stage.year}
                className="bg-white p-5 rounded-xl border border-[#dde0e6] shadow-sm flex flex-col justify-between hover:border-[#074ce0]/50 hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="font-bold text-[#16191f] text-lg font-display">{stage.year}</span>
                    <span className="text-[#074ce0] font-semibold">{stage.daily_tokens_billion}B tokens/day</span>
                  </div>

                  <div className="text-xs font-sans text-[#454c58] mb-3">
                    {stage.label}
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between p-2 rounded-lg bg-[#f3f4f6] border border-[#dde0e6]">
                      <span className="text-[#454c58]">Total Required</span>
                      <span className="text-[#16191f] font-bold">{stage.total_gpus_required.toLocaleString()} GPUs</span>
                    </div>

                    <div className="flex justify-between p-2 rounded-lg bg-[#f3f4f6] border border-[#dde0e6]">
                      <span className="text-[#454c58]">Capacity Deficit</span>
                      <span className={`font-bold ${isDeficit ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {isDeficit ? `-${stage.deficit_gpus.toLocaleString()}` : '0'} GPUs
                      </span>
                    </div>

                    <div className="flex justify-between p-2 rounded-lg bg-[#f3f4f6] border border-[#dde0e6]">
                      <span className="text-[#454c58]">Utility Power</span>
                      <span className="text-amber-700 font-bold">{stage.total_power_mw} MW</span>
                    </div>
                  </div>
                </div>

                {/* Training vs Inference distribution */}
                <div className="mt-4 pt-3 border-t border-[#dde0e6]">
                  <div className="flex justify-between text-xs font-sans text-[#454c58] mb-1">
                    <span>Train: <strong className="text-[#16191f]">{stage.training_pct}%</strong></span>
                    <span>Infer: <strong className="text-[#16191f]">{stage.inference_pct}%</strong></span>
                  </div>
                  <div className="w-full bg-[#e5e7eb] rounded-full h-1.5 flex overflow-hidden">
                    <div className="bg-indigo-600 h-1.5" style={{ width: `${stage.training_pct}%` }} />
                    <div className="bg-[#074ce0] h-1.5" style={{ width: `${stage.inference_pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Token-to-Compute Translator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Input Simulator Form (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-[#dde0e6] shadow-sm space-y-4">
          <h3 className="text-sm font-display font-bold uppercase tracking-wider text-[#16191f] flex items-center gap-2 border-b border-[#dde0e6] pb-3">
            <Cpu className="w-4 h-4 text-[#074ce0]" />
            Token-to-Infrastructure Physics Translator
          </h3>

          <form onSubmit={runSimulation} className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-sans text-[#454c58] mb-1">
                <span>Daily Active Users (DAU)</span>
                <span className="text-[#074ce0] font-bold font-mono">{dauMillion} Million</span>
              </div>
              <input
                type="range"
                min="5"
                max="250"
                step="5"
                value={dauMillion}
                onChange={(e) => setDauMillion(e.target.value)}
                className="w-full h-1.5 bg-[#dde0e6] rounded appearance-none cursor-pointer accent-[#074ce0]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-sans text-[#454c58] mb-1">
                <span>Tokens Generated Per User / Day</span>
                <span className="text-[#074ce0] font-bold font-mono">{parseInt(tokensPerUser).toLocaleString()} tokens</span>
              </div>
              <input
                type="range"
                min="500"
                max="20000"
                step="500"
                value={tokensPerUser}
                onChange={(e) => setTokensPerUser(e.target.value)}
                className="w-full h-1.5 bg-[#dde0e6] rounded appearance-none cursor-pointer accent-[#074ce0]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-sans font-medium text-[#454c58] mb-1">
                  Models Trained / Year
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={modelsPerYear}
                  onChange={(e) => setModelsPerYear(e.target.value)}
                  className="w-full bg-[#f3f4f6] border border-[#dde0e6] rounded-lg px-3 py-2 text-xs text-[#16191f] font-mono focus:outline-none focus:border-[#074ce0] focus:ring-1 focus:ring-[#074ce0] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-medium text-[#454c58] mb-1">
                  Avg Model Size (B Params)
                </label>
                <input
                  type="number"
                  min="7"
                  max="500"
                  value={modelParamsB}
                  onChange={(e) => setModelParamsB(e.target.value)}
                  className="w-full bg-[#f3f4f6] border border-[#dde0e6] rounded-lg px-3 py-2 text-xs text-[#16191f] font-mono focus:outline-none focus:border-[#074ce0] focus:ring-1 focus:ring-[#074ce0] transition-colors"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f3f4f6] border border-[#dde0e6] text-xs font-sans text-[#454c58] leading-relaxed">
              Derivation employs Chinchilla scaling laws ($6 \times P \times T$ FLOPs) and sustained H100 FP8 tensor utilization.
            </div>
          </form>
        </div>

        {/* Right: Simulation Output Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-[#dde0e6] shadow-sm space-y-4">
          <h3 className="text-sm font-display font-bold uppercase tracking-wider text-[#16191f] flex items-center gap-2 border-b border-[#dde0e6] pb-3">
            <Zap className="w-4 h-4 text-amber-600" />
            Infrastructure Translation Output
          </h3>

          {simulationResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                
                <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#dde0e6]">
                  <div className="text-[10px] font-sans font-medium text-[#454c58] uppercase">Total Target GPUs</div>
                  <div className="text-2xl font-bold font-display text-[#074ce0]">
                    {simulationResult.total_gpus_required.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-[#454c58] font-sans mt-0.5">
                    {simulationResult.required_inference_gpus_h100.toLocaleString()} Infer • {simulationResult.required_training_gpus_h100.toLocaleString()} Train
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#dde0e6]">
                  <div className="text-[10px] font-sans font-medium text-[#454c58] uppercase">Power Capacity</div>
                  <div className="text-2xl font-bold font-display text-amber-700">
                    {simulationResult.total_power_requirement_mw} MW
                  </div>
                  <div className="text-[11px] text-[#454c58] font-sans mt-0.5">
                    Grid Utility Baseload
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#dde0e6]">
                  <div className="text-[10px] font-sans font-medium text-[#454c58] uppercase">Capital Outlay</div>
                  <div className="text-2xl font-bold font-display text-emerald-700">
                    ₹{simulationResult.estimated_capital_outlay_cr.toLocaleString()} Cr
                  </div>
                  <div className="text-[11px] text-[#454c58] font-sans mt-0.5">
                    Compute + DC Build
                  </div>
                </div>

              </div>

              <div className="p-4 rounded-xl bg-[#f3f4f6] border border-[#dde0e6] space-y-2 text-xs font-sans">
                <div className="flex justify-between">
                  <span className="text-[#454c58]">Annual National Inference Volume</span>
                  <span className="text-[#16191f] font-bold font-mono">{simulationResult.annual_inference_tokens_trillion} Trillion Tokens</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#454c58]">Annual Frontier Training Tokens</span>
                  <span className="text-[#16191f] font-bold font-mono">{simulationResult.annual_training_tokens_billion.toLocaleString()} Billion Tokens</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-[#074ce0]/20 text-xs font-sans text-[#16191f] leading-relaxed">
                {simulationResult.summary}
              </div>
            </div>
          )}

          {/* Regional Deficit Overview */}
          {forecastData && (
            <div className="pt-3 border-t border-[#dde0e6] space-y-2.5">
              <h4 className="text-xs font-display font-bold uppercase tracking-wider text-[#454c58]">
                Regional Supply-Demand Balance (2026 Projections)
              </h4>

              <div className="space-y-2">
                {forecastData.regions.map((reg, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#f3f4f6] border border-[#dde0e6] text-xs font-sans">
                    <div className="flex justify-between font-bold text-[#16191f]">
                      <span>{reg.region.split(' (')[0]}</span>
                      <span className="text-rose-600 font-mono">{reg.deficit_surplus.toLocaleString()} GPU Deficit</span>
                    </div>
                    <div className="text-xs text-[#454c58] mt-1 leading-relaxed">
                      {reg.recommendation}
                    </div>
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
