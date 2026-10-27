import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Coins, 
  Zap, 
  Droplet, 
  Leaf, 
  MapPin, 
  CheckCircle2, 
  ExternalLink, 
  Award 
} from 'lucide-react';
import { fetchStatePolicies, fetchIndiaAIMission } from '../services/api';

export default function PolicyIntelligenceTab() {
  const [policies, setPolicies] = useState([]);
  const [indiaAi, setIndiaAi] = useState(null);
  const [selectedState, setSelectedState] = useState('Gujarat');

  useEffect(() => {
    const loadPolicies = async () => {
      try {
        const [pData, iData] = await Promise.all([
          fetchStatePolicies(),
          fetchIndiaAIMission(),
        ]);
        setPolicies(pData);
        setIndiaAi(iData);
      } catch (err) {
        console.error('Failed to load policies:', err);
      }
    };
    loadPolicies();
  }, []);

  const activePolicy = policies.find(p => p.state === selectedState) || policies[0];

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="bg-white p-6 rounded-xl border border-[#dde0e6] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#074ce0] uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4 text-[#074ce0]" />
            Module 6: Government & Policy Intelligence Layer
          </div>
          <h2 className="text-2xl font-display font-bold text-[#16191f] tracking-tight">
            Indian State AI & Data Center Policy Matrix
          </h2>
          <p className="text-sm font-sans text-[#454c58] mt-1 max-w-2xl leading-relaxed">
            Synthesizes regulatory incentives, capital subsidies, stamp duty waivers, and Green Energy Open Access provisions
            across India's leading digital infrastructure states to identify high-feasibility, subsidized corridors.
          </p>
        </div>

        {indiaAi && (
          <div className="px-4 py-2 rounded-lg bg-[#f3f4f6] border border-[#dde0e6] text-xs font-mono text-[#16191f]">
            IndiaAI Mission Outlay: <strong className="text-[#074ce0]">₹{indiaAi.budget_outlay_inr_cr.toLocaleString()} Crore</strong>
          </div>
        )}
      </div>

      {/* State Switcher Badges */}
      <div className="flex flex-wrap gap-2">
        {policies.map((p) => {
          const isSelected = selectedState === p.state;
          return (
            <button
              key={p.state}
              onClick={() => setSelectedState(p.state)}
              className={`px-4 py-2 rounded-lg text-xs font-sans font-medium transition-all border ${
                isSelected 
                  ? 'bg-[#074ce0] text-white border-[#074ce0] font-semibold shadow-sm' 
                  : 'bg-white border-[#dde0e6] text-[#454c58] hover:text-[#16191f] hover:border-[#074ce0]/50 shadow-sm'
              }`}
            >
              <span>{p.state}</span>
              <span className={`ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-[#f3f4f6] text-[#454c58] border border-[#dde0e6]'}`}>
                Score: {p.policy_score}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Policy Breakdown Card */}
      {activePolicy && (
        <div className="bg-white p-6 rounded-xl border border-[#dde0e6] shadow-sm space-y-6">
          
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#dde0e6] pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-sans text-[#454c58] mb-1">
                <MapPin className="w-3.5 h-3.5 text-[#074ce0]" />
                <span className="font-semibold text-[#16191f]">{activePolicy.state} Government</span>
                <span>•</span>
                <span>Valid Until: {activePolicy.valid_until}</span>
              </div>
              <h3 className="text-xl font-display font-bold text-[#16191f]">
                {activePolicy.policy_name}
              </h3>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#f3f4f6] border border-[#dde0e6] font-sans text-xs text-[#16191f]">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Target Capacity: <strong className="font-mono">{activePolicy.target_capacity_mw} MW</strong></span>
            </div>
          </div>

          {/* Key Clauses Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#dde0e6] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-sans text-emerald-700 font-bold">
                <Coins className="w-4 h-4 text-emerald-600" />
                <span>Capital Investment Subsidy</span>
              </div>
              <p className="text-xs text-[#454c58] font-sans leading-relaxed">
                {activePolicy.capital_subsidy}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#dde0e6] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-sans text-[#074ce0] font-bold">
                <ShieldCheck className="w-4 h-4 text-[#074ce0]" />
                <span>Stamp Duty Exemption</span>
              </div>
              <p className="text-xs text-[#454c58] font-sans leading-relaxed">
                {activePolicy.stamp_duty_exemption}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#dde0e6] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-sans text-amber-700 font-bold">
                <Zap className="w-4 h-4 text-amber-600" />
                <span>Electricity Duty Waiver</span>
              </div>
              <p className="text-xs text-[#454c58] font-sans leading-relaxed">
                {activePolicy.electricity_duty}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#dde0e6] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-sans text-indigo-700 font-bold">
                <Zap className="w-4 h-4 text-indigo-600" />
                <span>Dual Grid Reliability Mandate</span>
              </div>
              <p className="text-xs text-[#454c58] font-sans leading-relaxed">
                {activePolicy.dual_power_grid_mandate}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#dde0e6] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-sans text-sky-700 font-bold">
                <Droplet className="w-4 h-4 text-sky-600" />
                <span>Water Infrastructure Quota</span>
              </div>
              <p className="text-xs text-[#454c58] font-sans leading-relaxed">
                {activePolicy.water_concessions}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#dde0e6] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-sans text-emerald-700 font-bold">
                <Leaf className="w-4 h-4 text-emerald-600" />
                <span>Green Energy Open Access</span>
              </div>
              <p className="text-xs text-[#454c58] font-sans leading-relaxed">
                {activePolicy.green_energy_incentive}
              </p>
            </div>

          </div>

          {/* Key Clusters */}
          <div className="pt-3 border-t border-[#dde0e6] flex flex-wrap items-center gap-2 text-xs font-sans">
            <span className="text-[#454c58] font-medium">Designated State AI / DC Hubs:</span>
            {activePolicy.key_clusters.map((hub, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-md bg-[#f3f4f6] text-[#16191f] border border-[#dde0e6] font-medium">
                {hub}
              </span>
            ))}
          </div>

        </div>
      )}

      {/* IndiaAI Mission 7 Pillars Card */}
      {indiaAi && (
        <div className="bg-white p-6 rounded-xl border border-[#dde0e6] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#dde0e6] pb-3">
            <h3 className="text-base font-display font-bold text-[#16191f] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#074ce0]" />
              National IndiaAI Mission Framework
            </h3>
            <span className="text-xs font-sans text-[#454c58]">
              Cabinet Approved • ₹10,372 Cr Outlay
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-sans">
            {indiaAi.pillars.map((pillar, idx) => {
              const [title, desc] = pillar.split(': ');
              return (
                <div key={idx} className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#dde0e6]">
                  <div className="text-[#074ce0] font-bold mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{title}</span>
                  </div>
                  <div className="text-[#454c58] leading-relaxed">
                    {desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
