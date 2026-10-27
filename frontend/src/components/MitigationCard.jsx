import React from 'react';
import { ShieldAlert, Wrench, FileText, CheckCircle2, AlertOctagon, Terminal } from 'lucide-react';

export default function MitigationCard({ site }) {
  if (!site) return null;

  const riskFlags = site.risk_flags || [];
  const mandates = site.engineering_mandates || [];
  const diagnostics = site.diagnostics || [];
  const hasRisks = riskFlags.length > 0;

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#dde0e6] shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#dde0e6]">
        <div>
          <h3 className="text-lg font-bold font-display text-[#16191f] flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            Automated Diagnostic & Engineering Mitigation Engine
          </h3>
          <p className="text-xs text-[#454c58] mt-0.5">
            Rule-based engineering mandates triggered by CGWA groundwater boundaries and CEA grid transmission criteria.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasRisks ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-rose-50 text-rose-700 border border-rose-200">
              <AlertOctagon className="w-3.5 h-3.5" />
              {riskFlags.length} Risk Flag{riskFlags.length > 1 ? 's' : ''} Fired
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Zero Critical Flags (Nominal)
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Risk Flags Column */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-rose-700 font-bold">
            <AlertOctagon className="w-4 h-4" />
            Active Regulatory & Physical Risk Flags
          </div>

          {riskFlags.length === 0 ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Site meets all baseline environmental, aquifer extraction, and grid proximity criteria without triggering primary risk flags.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {riskFlags.map((flag, idx) => (
                <div 
                  key={idx}
                  className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 text-xs flex items-start gap-2.5 text-rose-900"
                >
                  <span className="mt-1 w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                  <div className="font-semibold font-display">
                    {flag}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Engineering Mandates Column */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-700 font-bold">
            <Wrench className="w-4 h-4" />
            Compulsory Engineering Mitigation Mandates
          </div>

          <div className="space-y-2">
            {mandates.map((mandate, idx) => (
              <div 
                key={idx}
                className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5"
              >
                <span className="font-mono text-amber-700 font-bold shrink-0">{idx + 1}.</span>
                <span className="leading-relaxed font-sans">{mandate}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Engineering Diagnostic Logs Console (Contrast Dark Passage) */}
      <div className="mt-4 pt-4 border-t border-[#dde0e6]">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#074ce0] font-bold mb-2">
          <Terminal className="w-3.5 h-3.5" />
          Deterministic System Diagnostics & Rule Logs
        </div>

        <div className="p-4 rounded-xl bg-[#16191f] text-[#d0d4dd] font-mono text-xs space-y-1.5 border border-slate-800 shadow-inner overflow-x-auto">
          {diagnostics.length === 0 ? (
            <div className="text-slate-500">Telemetry logs nominal; zero diagnostic exceptions fired.</div>
          ) : (
            diagnostics.map((diag, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#074ce0] select-none font-bold">&gt;</span>
                <span className="text-[#fcfcfd]">{diag}</span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
