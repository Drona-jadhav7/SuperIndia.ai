import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  Leaf, 
  Cpu, 
  ShieldCheck, 
  TrendingUp, 
  Building2, 
  ArrowRight,
  Info,
  CheckCircle2,
  Users,
  Zap
} from 'lucide-react';
import { fetchCitizenProjects, simulateCitizenParticipation } from '../services/api';

export default function CitizenFinancingTab() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('proj_dholera_solar_gigawatt');
  const [contributionInr, setContributionInr] = useState(25000);
  const [tenureYears, setTenureYears] = useState(5);
  const [reinvestMode, setReinvestMode] = useState('CASH_DIVIDEND');
  const [simulationResult, setSimulationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await fetchCitizenProjects();
        setProjects(data);
        if (data && data.length > 0) {
          setSelectedProjectId(data[0].project_id);
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
      }
    };
    loadProjects();
  }, []);

  const runSimulation = async () => {
    setIsLoading(true);
    try {
      const payload = {
        project_id: selectedProjectId,
        contribution_amount_inr: parseFloat(contributionInr),
        tenure_years: parseInt(tenureYears),
        reinvestment_mode: reinvestMode,
      };
      const res = await simulateCitizenParticipation(payload);
      setSimulationResult(res);
    } catch (err) {
      console.error('Citizen simulation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      runSimulation();
    }
  }, [selectedProjectId, contributionInr, tenureYears, reinvestMode]);

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="bg-white p-6 rounded-xl border border-[#dde0e6] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#074ce0] uppercase tracking-wider mb-1">
            <Coins className="w-4 h-4 text-[#074ce0]" />
            Module 5: Citizen Infrastructure Participation Simulation
          </div>
          <h2 className="text-2xl font-display font-bold text-[#16191f] tracking-tight">
            Sovereign AI Infrastructure Fractional Participation
          </h2>
          <p className="text-sm font-sans text-[#454c58] mt-1 max-w-2xl leading-relaxed">
            Simulates a transparent mechanism for citizens to participate in financing mega-scale national AI data centers
            and renewable solar parks through SEBI-compliant Infrastructure Investment Trusts (InvITs) with compute dividends.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-lg bg-[#f3f4f6] border border-[#dde0e6] text-xs font-mono text-[#16191f]">
          Simulation Status: <strong className="text-emerald-700">Prototype Demo</strong>
        </div>
      </div>

      {/* Flagship Projects Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projects.map((proj) => {
          const isSelected = selectedProjectId === proj.project_id;
          const progressPct = ((proj.funded_so_far_cr / proj.citizen_pool_allocation_cr) * 100).toFixed(0);

          return (
            <div
              key={proj.project_id}
              onClick={() => setSelectedProjectId(proj.project_id)}
              className={`p-5 rounded-xl border cursor-pointer transition-all ${
                isSelected 
                  ? 'bg-blue-50/20 border-[#074ce0] shadow-sm ring-1 ring-[#074ce0]' 
                  : 'bg-white border-[#dde0e6] hover:border-[#074ce0]/50 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[11px] font-sans px-2 py-0.5 rounded bg-[#f3f4f6] text-[#454c58] font-medium border border-[#dde0e6]">
                  {proj.location.split(',')[0]}
                </span>
                <span className="text-sm font-bold font-mono text-emerald-700">
                  {proj.annual_projected_apy_pct}% APY
                </span>
              </div>

              <h3 className="text-base font-display font-bold text-[#16191f] mb-1">
                {proj.project_name}
              </h3>
              <p className="text-xs text-[#454c58] font-sans mb-3 line-clamp-2 leading-relaxed">
                {proj.description}
              </p>

              {/* Progress bar */}
              <div className="space-y-1 my-3">
                <div className="flex justify-between text-xs font-sans text-[#454c58]">
                  <span>Pool: ₹{proj.funded_so_far_cr}Cr / ₹{proj.citizen_pool_allocation_cr}Cr</span>
                  <span className="text-[#074ce0] font-mono font-semibold">{progressPct}%</span>
                </div>
                <div className="w-full bg-[#f3f4f6] border border-[#dde0e6] rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-2 bg-[#074ce0] rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-sans text-[#454c58] pt-2.5 border-t border-[#dde0e6]">
                <span className="flex items-center gap-1.5 text-[#454c58]">
                  <Users className="w-3.5 h-3.5 text-[#074ce0]" />
                  {proj.participants_count.toLocaleString()} Citizens
                </span>
                <span className="text-[#16191f] font-mono font-bold">{proj.target_gpus.toLocaleString()} GPUs</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Simulator Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Interactive Contribution Slider (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-[#dde0e6] shadow-sm space-y-5">
          <h3 className="text-sm font-display font-bold uppercase tracking-wider text-[#16191f] flex items-center gap-2 border-b border-[#dde0e6] pb-3">
            <Coins className="w-4 h-4 text-[#074ce0]" />
            Participation Calculator
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-sans text-[#454c58] mb-1">
                <span>Contribution Amount</span>
                <span className="text-emerald-700 font-bold font-mono text-sm">₹{parseInt(contributionInr).toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="200000"
                step="1000"
                value={contributionInr}
                onChange={(e) => setContributionInr(e.target.value)}
                className="w-full h-1.5 bg-[#dde0e6] rounded appearance-none cursor-pointer accent-[#074ce0]"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#454c58] mt-1">
                <span>₹1,000</span>
                <span>₹50,000</span>
                <span>₹1,00,000</span>
                <span>₹2,00,000</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-sans font-medium text-[#454c58] mb-1.5">
                Tenure Period
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[3, 5, 7].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setTenureYears(yr)}
                    className={`py-2 rounded-lg text-xs font-sans font-medium transition-all border ${
                      tenureYears === yr 
                        ? 'bg-[#074ce0] text-white border-[#074ce0] font-semibold shadow-sm' 
                        : 'bg-[#f3f4f6] border-[#dde0e6] text-[#454c58] hover:text-[#16191f]'
                    }`}
                  >
                    {yr} Years
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-sans font-medium text-[#454c58] mb-1.5">
                Dividend Payout Structure
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setReinvestMode('CASH_DIVIDEND')}
                  className={`p-3 rounded-lg text-xs font-sans text-left border transition-all ${
                    reinvestMode === 'CASH_DIVIDEND' 
                      ? 'bg-blue-50/40 border-[#074ce0] ring-1 ring-[#074ce0]' 
                      : 'bg-[#f3f4f6] border-[#dde0e6] text-[#454c58]'
                  }`}
                >
                  <div className={`font-semibold ${reinvestMode === 'CASH_DIVIDEND' ? 'text-[#074ce0]' : 'text-[#16191f]'}`}>Cash Yield</div>
                  <div className="text-[11px] text-[#454c58] mt-0.5">Annual APY in INR</div>
                </button>

                <button
                  type="button"
                  onClick={() => setReinvestMode('COMPUTE_CREDITS_VOUCHER')}
                  className={`p-3 rounded-lg text-xs font-sans text-left border transition-all ${
                    reinvestMode === 'COMPUTE_CREDITS_VOUCHER' 
                      ? 'bg-blue-50/40 border-[#074ce0] ring-1 ring-[#074ce0]' 
                      : 'bg-[#f3f4f6] border-[#dde0e6] text-[#454c58]'
                  }`}
                >
                  <div className={`font-semibold ${reinvestMode === 'COMPUTE_CREDITS_VOUCHER' ? 'text-[#074ce0]' : 'text-[#16191f]'}`}>AI Token Credits</div>
                  <div className="text-[11px] text-[#454c58] mt-0.5">Inference vouchers</div>
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f3f4f6] border border-[#dde0e6] text-xs font-sans text-[#454c58] leading-relaxed">
              <strong className="text-[#16191f]">Auditable Transparency:</strong> All citizen funds directly finance hardware asset purchases and captive solar fields registered on sovereign asset registries.
            </div>
          </div>
        </div>

        {/* Right: Simulation Results Matrix (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-[#dde0e6] shadow-sm space-y-4">
          <h3 className="text-sm font-display font-bold uppercase tracking-wider text-[#16191f] flex items-center gap-2 border-b border-[#dde0e6] pb-3">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Participation Return & Impact Breakdown
          </h3>

          {simulationResult && (
            <div className="space-y-4">
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                
                <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#dde0e6]">
                  <div className="text-[10px] font-sans font-medium text-[#454c58] uppercase">Annual Yield</div>
                  <div className="text-xl font-bold font-display text-emerald-700">
                    ₹{simulationResult.annual_interest_yield_inr.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-[#454c58] font-sans mt-0.5">
                    {simulationResult.annual_apy_pct}% Annual Return
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#dde0e6]">
                  <div className="text-[10px] font-sans font-medium text-[#454c58] uppercase">Maturity Value ({tenureYears}y)</div>
                  <div className="text-xl font-bold font-display text-[#16191f]">
                    ₹{simulationResult.total_maturity_amount_inr.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-[#454c58] font-sans mt-0.5">
                    Compound Principal
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#dde0e6]">
                  <div className="text-[10px] font-sans font-medium text-[#454c58] uppercase">Compute Backed</div>
                  <div className="text-xl font-bold font-display text-[#074ce0]">
                    {simulationResult.equivalent_gpus_fraction_backed}
                  </div>
                  <div className="text-[11px] text-[#454c58] font-sans mt-0.5">
                    H100 Unit Fractional Share
                  </div>
                </div>

              </div>

              {/* Physical & Green Footprint */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
                
                <div className="p-3.5 rounded-xl bg-[#f3f4f6] border border-[#dde0e6] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#454c58]">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span>Solar Capacity Backed:</span>
                  </div>
                  <strong className="text-[#16191f] font-mono">{simulationResult.equivalent_power_capacity_watts} Watts</strong>
                </div>

                <div className="p-3.5 rounded-xl bg-[#f3f4f6] border border-[#dde0e6] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#454c58]">
                    <Leaf className="w-4 h-4 text-emerald-600" />
                    <span>Annual CO2 Abated:</span>
                  </div>
                  <strong className="text-emerald-700 font-mono">{simulationResult.annual_carbon_abatement_kg_co2} kg CO2</strong>
                </div>

              </div>

              {/* Token Dividend Option */}
              {reinvestMode === 'COMPUTE_CREDITS_VOUCHER' && (
                <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs font-sans text-indigo-900 leading-relaxed">
                  <strong className="text-indigo-700">Student & Builder Dividend:</strong> Your annual return can be redeemed for <strong>{simulationResult.compute_dividend_tokens_million} Million tokens</strong> of sovereign LLM API inference.
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-[#074ce0]/20 text-xs font-sans text-[#16191f] leading-relaxed">
                {simulationResult.summary}
              </div>

              <div className="flex items-center gap-2 text-xs font-sans text-[#454c58] pt-1">
                <ShieldCheck className="w-4 h-4 text-[#074ce0]" />
                <span>{simulationResult.sovereign_guarantee_tier}</span>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
