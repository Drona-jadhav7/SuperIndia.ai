import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Layers, 
  Zap, 
  TrendingUp, 
  CheckCircle2, 
  Sparkles, 
  Coins, 
  Leaf, 
  Filter,
  ArrowRight,
  ShieldAlert,
  Building2,
  GraduationCap,
  AlertCircle,
  Server,
  RotateCcw,
  Network,
  Activity,
  Check
} from 'lucide-react';
import { fetchMarketplaceNodes, allocateWorkload } from '../services/api';

export default function MarketplaceTab() {
  const [nodes, setNodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allocationResult, setAllocationResult] = useState(null);
  const [isAllocating, setIsAllocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Workload Form State
  const [workloadName, setWorkloadName] = useState('Indic Multi-Modal Foundation Model');
  const [workloadType, setWorkloadType] = useState('PRE_TRAINING');
  const [gpuModel, setGpuModel] = useState('NVIDIA_H100_SXM');
  const [quantity, setQuantity] = useState(64);
  const [duration, setDuration] = useState(48);
  const [subsidyEligible, setSubsidyEligible] = useState(true);
  const [minGreenEnergy, setMinGreenEnergy] = useState(50);

  const loadNodes = async () => {
    setIsLoading(true);
    try {
      const data = await fetchMarketplaceNodes();
      setNodes(data);
    } catch (err) {
      console.error('Failed to load nodes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNodes();
  }, []);

  // Quick Workload Presets
  const applyPreset = (preset) => {
    setWorkloadName(preset.name);
    setWorkloadType(preset.type);
    setGpuModel(preset.gpu);
    setQuantity(preset.quantity);
    setDuration(preset.duration);
    setMinGreenEnergy(preset.green);
  };

  const handleAllocate = async (e) => {
    if (e) e.preventDefault();
    setIsAllocating(true);
    setErrorMessage(null);
    try {
      const payload = {
        workload_name: workloadName,
        workload_type: workloadType,
        gpu_model_preference: gpuModel,
        quantity_gpus: parseInt(quantity) || 16,
        duration_hours: parseInt(duration) || 24,
        require_green_energy_minimum_pct: parseFloat(minGreenEnergy),
        eligible_for_india_ai_subsidy: subsidyEligible,
      };
      const res = await allocateWorkload(payload);
      setAllocationResult(res);
    } catch (err) {
      console.error('Allocation error:', err);
      setErrorMessage(err.response?.data?.detail || 'Failed to optimize workload allocation. Please ensure the backend engine is running.');
    } finally {
      setIsAllocating(false);
    }
  };

  // Compute aggregate inventory stats
  const totalGpus = nodes.reduce((acc, n) => acc + (n.total_gpus || 0), 0);
  const freeGpus = nodes.reduce((acc, n) => acc + (n.free_available_gpus || (n.total_gpus - n.active_allocated_gpus) || 0), 0);
  const avgHourlyRate = nodes.length ? Math.round(nodes.reduce((acc, n) => acc + n.hourly_rate_inr, 0) / nodes.length) : 210;

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Live Coordination Banner */}
      <div className="bg-white p-6 rounded-2xl border border-[#dde0e6] shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#074ce0] text-[11px] font-mono font-bold border border-blue-200">
            <Cpu className="w-3.5 h-3.5" />
            <span>MODULE 3: CROSS-INSTITUTION GPU MARKETPLACE & ALLOCATION ENGINE</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-[#16191f] tracking-tight">
            National Federated GPU Compute Coordination
          </h2>
          <p className="text-xs text-[#454c58] leading-relaxed">
            Aggregates idle and sovereign compute capacity across Indian Institutes of Technology (IITs), C-DAC Param supercomputers, public research labs, and commercial hyperscalers. Multi-objective solver routes workloads to maximize off-peak national utilization with guaranteed InfiniBand/NVLink interconnects.
          </p>
        </div>

        {/* Live Aggregated Inventory Pills */}
        <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs shrink-0">
          <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#dde0e6] text-center min-w-[100px]">
            <div className="text-base font-black text-[#16191f]">{nodes.length}</div>
            <div className="text-[10px] text-[#454c58] uppercase font-semibold">Nodes</div>
          </div>
          <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#dde0e6] text-center min-w-[100px]">
            <div className="text-base font-black text-[#074ce0]">{totalGpus}</div>
            <div className="text-[10px] text-[#454c58] uppercase font-semibold">Total GPUs</div>
          </div>
          <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#dde0e6] text-center min-w-[100px]">
            <div className="text-base font-black text-emerald-600">{freeGpus}</div>
            <div className="text-[10px] text-[#454c58] uppercase font-semibold">Free Idle</div>
          </div>
          <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#dde0e6] text-center min-w-[100px]">
            <div className="text-base font-black text-indigo-600">₹{avgHourlyRate}</div>
            <div className="text-[10px] text-[#454c58] uppercase font-semibold">Avg Rate/hr</div>
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Balanced Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Workload Submission Optimizer (5 cols, Sticky Sidebar) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
          
          <div className="bg-white p-6 rounded-2xl border border-[#dde0e6] shadow-sm space-y-5">
            
            <div className="flex items-center justify-between border-b border-[#dde0e6] pb-3">
              <h3 className="text-sm font-display font-bold uppercase tracking-wider text-[#16191f] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#074ce0]" />
                Workload Allocation Optimizer
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-[#074ce0] border border-blue-200 font-bold">
                IndiaAI Grant Ready
              </span>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono font-bold text-[#8c94a4] uppercase">
                Quick Workload Presets:
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <button
                  type="button"
                  onClick={() => applyPreset({
                    name: "Indic 70B LLM Pre-Training",
                    type: "PRE_TRAINING",
                    gpu: "NVIDIA_H100_SXM",
                    quantity: 128,
                    duration: 72,
                    green: 60,
                  })}
                  className="px-2 py-1.5 rounded-lg border border-slate-200 hover:border-[#074ce0] bg-[#f8fafc] hover:bg-blue-50/50 text-[11px] font-medium text-slate-700 transition-all truncate"
                  title="128x H100 Pre-Training"
                >
                  🚀 128x Pre-Train
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset({
                    name: "Vision-Language Fine-Tuning",
                    type: "FINE_TUNING",
                    gpu: "NVIDIA_H100_SXM",
                    quantity: 32,
                    duration: 48,
                    green: 50,
                  })}
                  className="px-2 py-1.5 rounded-lg border border-slate-200 hover:border-[#074ce0] bg-[#f8fafc] hover:bg-blue-50/50 text-[11px] font-medium text-slate-700 transition-all truncate"
                  title="32x H100 Fine-Tuning"
                >
                  ⚡ 32x Fine-Tune
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset({
                    name: "Batch Token Inference Cluster",
                    type: "INFERENCE",
                    gpu: "NVIDIA_L40S",
                    quantity: 16,
                    duration: 24,
                    green: 40,
                  })}
                  className="px-2 py-1.5 rounded-lg border border-slate-200 hover:border-[#074ce0] bg-[#f8fafc] hover:bg-blue-50/50 text-[11px] font-medium text-slate-700 transition-all truncate"
                  title="16x L40S Inference"
                >
                  🌐 16x Inference
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-sans text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleAllocate} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-[#16191f] mb-1">
                  Workload / Model Name
                </label>
                <input
                  type="text"
                  value={workloadName}
                  onChange={(e) => setWorkloadName(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#dde0e6] rounded-xl px-3 py-2 text-xs text-[#16191f] font-sans focus:outline-none focus:border-[#074ce0] focus:ring-1 focus:ring-[#074ce0] transition-colors"
                  placeholder="e.g., Indic LLM Foundation Model"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#16191f] mb-1">
                    Workload Constraint
                  </label>
                  <select
                    value={workloadType}
                    onChange={(e) => setWorkloadType(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#dde0e6] rounded-xl px-2.5 py-2 text-xs text-[#16191f] font-sans focus:outline-none focus:border-[#074ce0] focus:ring-1 focus:ring-[#074ce0] transition-colors cursor-pointer"
                  >
                    <option value="PRE_TRAINING">Pre-Training (800G IB)</option>
                    <option value="FINE_TUNING">Fine-Tuning / LoRA</option>
                    <option value="INFERENCE">High-Throughput</option>
                    <option value="ACADEMIC_RESEARCH">Academic Research</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#16191f] mb-1">
                    GPU Architecture
                  </label>
                  <select
                    value={gpuModel}
                    onChange={(e) => setGpuModel(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#dde0e6] rounded-xl px-2.5 py-2 text-xs text-[#16191f] font-sans focus:outline-none focus:border-[#074ce0] focus:ring-1 focus:ring-[#074ce0] transition-colors cursor-pointer"
                  >
                    <option value="NVIDIA_H100_SXM">NVIDIA H100 SXM5</option>
                    <option value="NVIDIA_A100_SXM">NVIDIA A100 SXM4</option>
                    <option value="NVIDIA_L40S">NVIDIA L40S</option>
                    <option value="ANY">Any Architecture</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center text-xs font-semibold text-[#16191f] mb-1">
                    <span>GPUs Needed</span>
                    <span className="text-[#074ce0] font-bold font-mono">{quantity}</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="512"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#dde0e6] rounded-xl px-3 py-2 text-xs text-[#16191f] font-mono focus:outline-none focus:border-[#074ce0] focus:ring-1 focus:ring-[#074ce0] transition-colors"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-semibold text-[#16191f] mb-1">
                    <span>Duration</span>
                    <span className="text-[#074ce0] font-bold font-mono">{duration}h</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="720"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#dde0e6] rounded-xl px-3 py-2 text-xs text-[#16191f] font-mono focus:outline-none focus:border-[#074ce0] focus:ring-1 focus:ring-[#074ce0] transition-colors"
                  />
                </div>
              </div>

              {/* Min Clean Energy & IndiaAI Subsidy Box */}
              <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#dde0e6] space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-[#16191f]">
                  <span className="flex items-center gap-1.5">
                    <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                    Min Clean Energy Threshold:
                  </span>
                  <span className="text-emerald-700 font-bold font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {minGreenEnergy}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  step="5"
                  value={minGreenEnergy}
                  onChange={(e) => setMinGreenEnergy(e.target.value)}
                  className="w-full h-1.5 bg-[#dde0e6] rounded-lg appearance-none cursor-pointer accent-[#074ce0]"
                />

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <label htmlFor="subsidy_checkbox" className="flex flex-col cursor-pointer">
                    <span className="text-[#16191f] font-semibold flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-indigo-600" />
                      IndiaAI Mission Subsidy (50% Off)
                    </span>
                    <span className="text-[10px] text-[#454c58]">
                      Applies National AI Grant voucher rebate
                    </span>
                  </label>
                  <input
                    id="subsidy_checkbox"
                    type="checkbox"
                    checked={subsidyEligible}
                    onChange={(e) => setSubsidyEligible(e.target.checked)}
                    className="rounded bg-white border-[#dde0e6] text-[#074ce0] focus:ring-[#074ce0] cursor-pointer w-4 h-4 shrink-0"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isAllocating}
                className="w-full py-3 rounded-xl bg-[#074ce0] hover:bg-[#053cb3] text-white font-sans font-bold text-xs tracking-wider uppercase transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-md cursor-pointer"
              >
                {isAllocating ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    Solving Multi-Objective Matrix...
                  </>
                ) : (
                  <>
                    <span>Run Allocation Optimizer</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Allocation Result Summary Card */}
            {allocationResult && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/60 to-blue-50/60 border border-emerald-300 space-y-3.5 shadow-xs">
                
                <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Optimized Allocation Plan
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold shadow-2xs">
                    {allocationResult.savings_pct}% Cost Savings
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-white border border-emerald-200 shadow-2xs">
                    <div className="text-[10px] text-emerald-800 font-semibold uppercase">SuperIndia Total Cost</div>
                    <div className="text-base font-black text-emerald-700 font-display">
                      ₹{allocationResult.total_cost_inr.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                    <div className="text-[10px] text-[#8c94a4] font-semibold uppercase">Commercial Public Cloud</div>
                    <div className="text-base font-bold text-[#8c94a4] line-through font-display">
                      ₹{allocationResult.commercial_cloud_equivalent_cost_inr.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Allocated Clusters */}
                <div className="space-y-2">
                  <div className="text-[11px] font-mono uppercase font-bold text-slate-700">
                    Allocated Federated Clusters:
                  </div>
                  {allocationResult.allocations.map((alloc, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-white border border-slate-200 text-xs shadow-2xs space-y-1">
                      <div className="flex justify-between font-bold text-[#16191f]">
                        <span className="truncate pr-2">{alloc.institution_name.split(' - ')[0]}</span>
                        <span className="text-[#074ce0] font-mono font-bold shrink-0">{alloc.allocated_gpus} GPUs</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-[#454c58] font-mono">
                        <span>₹{alloc.effective_hourly_rate_inr}/GPU-hr</span>
                        <span>Util: {alloc.before_utilization_pct}% → <strong className="text-emerald-600">{alloc.after_utilization_pct}%</strong></span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-[11px] font-sans text-slate-700 pt-2 border-t border-emerald-200/60 leading-relaxed">
                  {allocationResult.optimization_summary}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Right Column: Live Federated GPU Inventory (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="flex items-center justify-between bg-white px-5 py-3.5 rounded-2xl border border-[#dde0e6] shadow-xs">
            <h3 className="text-sm font-display font-bold uppercase tracking-wider text-[#16191f] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#074ce0]" />
              National Federated GPU Inventory
            </h3>
            <div className="flex items-center gap-2 text-xs font-mono text-[#454c58]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Node Telemetry</span>
            </div>
          </div>

          <div className="space-y-3.5">
            {nodes.map((node) => {
              const free = node.free_available_gpus || (node.total_gpus - node.active_allocated_gpus);
              const utilPct = node.base_utilization_pct;
              const isAcademic = node.institution_type.includes("Academic") || node.institution_type.includes("University");
              const isSupercomputer = node.institution_type.includes("Supercomputing") || node.institution_type.includes("Laboratory");
              const isEnterprise = node.institution_type.includes("Enterprise");

              return (
                <div 
                  key={node.node_id}
                  className="bg-white p-5 rounded-2xl border border-[#dde0e6] hover:border-[#074ce0]/50 hover:shadow-md transition-all group"
                >
                  {/* Top Row: Institution + Rate */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {isAcademic && (
                          <span className="p-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200" title="Academic University Cluster">
                            <GraduationCap className="w-4 h-4" />
                          </span>
                        )}
                        {isSupercomputer && (
                          <span className="p-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200" title="National Supercomputer">
                            <Cpu className="w-4 h-4" />
                          </span>
                        )}
                        {!isAcademic && !isSupercomputer && isEnterprise && (
                          <span className="p-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200" title="Enterprise Compute Sharing">
                            <Activity className="w-4 h-4" />
                          </span>
                        )}
                        {!isAcademic && !isSupercomputer && !isEnterprise && (
                          <span className="p-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200" title="Tier-IV Hyperscale Cloud">
                            <Building2 className="w-4 h-4" />
                          </span>
                        )}

                        <h4 className="text-sm font-display font-bold text-[#16191f] group-hover:text-[#074ce0] transition-colors">
                          {node.institution_name}
                        </h4>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#454c58] font-sans pl-7">
                        <span>{node.location}</span>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#074ce0] font-semibold text-[11px] font-mono border border-blue-200">
                          {node.gpu_model.replace(/_/g, ' ')}
                        </span>
                        {node.supports_pretraining && (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-[10px] font-mono border border-indigo-200">
                            Pre-Training Validated
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price and Badge */}
                    <div className="sm:text-right shrink-0 pl-7 sm:pl-0">
                      <div className="text-base font-display font-black text-[#16191f]">
                        ₹{node.hourly_rate_inr} <span className="text-xs font-normal text-[#454c58] font-sans">/GPU-hr</span>
                      </div>
                      <span className="inline-block mt-0.5 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {node.institution_type}
                      </span>
                    </div>

                  </div>

                  {/* Utilization Progress Bar */}
                  <div className="space-y-1.5 my-3 pl-0 sm:pl-7">
                    <div className="flex justify-between text-xs font-sans text-[#454c58]">
                      <span>
                        Live Utilization: <strong className="text-[#16191f] font-mono">{utilPct.toFixed(1)}%</strong>
                      </span>
                      <span>
                        Available to Harvest: <strong className="text-emerald-700 font-mono font-bold">{free} of {node.total_gpus} GPUs</strong>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 border border-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="h-2.5 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${utilPct}%`,
                          backgroundColor: utilPct > 80 ? '#f59e0b' : (utilPct > 50 ? '#074ce0' : '#10b981')
                        }}
                      />
                    </div>
                  </div>

                  {/* Bottom Specs: Interconnect Fabric (FULL DISPLAY, NO TRUNCATION) & Clean Energy */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-[#dde0e6] text-xs pl-0 sm:pl-7">
                    <div className="flex items-center gap-1.5 text-slate-700 font-mono text-[11px] min-w-0">
                      <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="font-semibold text-slate-800">Interconnect Fabric:</span>
                      <span className="text-slate-600 break-words">{node.interconnect}</span>
                    </div>

                    <div className="flex items-center gap-1 text-emerald-700 text-xs font-medium shrink-0 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 w-fit">
                      <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{node.green_energy_pct}% Clean PPA</span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
}
