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
  GraduationCap
} from 'lucide-react';
import { fetchMarketplaceNodes, allocateWorkload } from '../services/api';

export default function MarketplaceTab() {
  const [nodes, setNodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allocationResult, setAllocationResult] = useState(null);
  const [isAllocating, setIsAllocating] = useState(false);

  // Workload Form
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

  const handleAllocate = async (e) => {
    if (e) e.preventDefault();
    setIsAllocating(true);
    try {
      const payload = {
        workload_name: workloadName,
        workload_type: workloadType,
        gpu_model_preference: gpuModel,
        quantity_gpus: parseInt(quantity),
        duration_hours: parseInt(duration),
        require_green_energy_minimum_pct: parseFloat(minGreenEnergy),
        eligible_for_india_ai_subsidy: subsidyEligible,
      };
      const res = await allocateWorkload(payload);
      setAllocationResult(res);
    } catch (err) {
      console.error('Allocation error:', err);
      alert('Failed to optimize workload allocation.');
    } finally {
      setIsAllocating(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="bg-white p-6 rounded-xl border border-[#dde0e6] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#074ce0] uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4 text-[#074ce0]" />
            Module 3: Cross-Institution GPU Marketplace & Allocation Engine
          </div>
          <h2 className="text-2xl font-display font-bold text-[#16191f] tracking-tight">
            National Federated GPU Compute Coordination
          </h2>
          <p className="text-sm font-sans text-[#454c58] mt-1 max-w-2xl leading-relaxed">
            Aggregates fragmented GPU capacity across IITs, C-DAC, sovereign laboratories, and commercial hyperscalers.
            Algorithmic optimizer matches AI workloads to harvest off-peak university compute, maximizing national utilization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-lg bg-[#f3f4f6] border border-[#dde0e6] text-xs font-mono text-[#16191f]">
            Active Nodes: <strong className="text-[#074ce0]">{nodes.length} Clusters</strong>
          </div>
        </div>
      </div>

      {/* Main Grid: Left is Allocator Form, Right is Federated Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Workload Submission & Optimizer (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-[#dde0e6] shadow-sm space-y-5">
          <h3 className="text-sm font-display font-bold uppercase tracking-wider text-[#16191f] flex items-center gap-2 border-b border-[#dde0e6] pb-3">
            <Sparkles className="w-4 h-4 text-[#074ce0]" />
            Workload Allocation Optimizer
          </h3>

          <form onSubmit={handleAllocate} className="space-y-4">
            <div>
              <label className="block text-xs font-sans font-medium text-[#454c58] mb-1">
                Workload / Model Name
              </label>
              <input
                type="text"
                value={workloadName}
                onChange={(e) => setWorkloadName(e.target.value)}
                className="w-full bg-[#f3f4f6] border border-[#dde0e6] rounded-lg px-3 py-2 text-xs text-[#16191f] font-sans focus:outline-none focus:border-[#074ce0] focus:ring-1 focus:ring-[#074ce0] transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-sans font-medium text-[#454c58] mb-1">
                  Workload Constraint
                </label>
                <select
                  value={workloadType}
                  onChange={(e) => setWorkloadType(e.target.value)}
                  className="w-full bg-[#f3f4f6] border border-[#dde0e6] rounded-lg px-2.5 py-2 text-xs text-[#16191f] font-sans focus:outline-none focus:border-[#074ce0] focus:ring-1 focus:ring-[#074ce0] transition-colors"
                >
                  <option value="PRE_TRAINING">Pre-Training (800G IB required)</option>
                  <option value="FINE_TUNING">Fine-Tuning / LoRA</option>
                  <option value="INFERENCE">High-Throughput Inference</option>
                  <option value="ACADEMIC_RESEARCH">Academic Research</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-sans font-medium text-[#454c58] mb-1">
                  GPU Architecture
                </label>
                <select
                  value={gpuModel}
                  onChange={(e) => setGpuModel(e.target.value)}
                  className="w-full bg-[#f3f4f6] border border-[#dde0e6] rounded-lg px-2.5 py-2 text-xs text-[#16191f] font-sans focus:outline-none focus:border-[#074ce0] focus:ring-1 focus:ring-[#074ce0] transition-colors"
                >
                  <option value="NVIDIA_H100_SXM">NVIDIA H100 SXM</option>
                  <option value="NVIDIA_A100_SXM">NVIDIA A100 SXM</option>
                  <option value="NVIDIA_L40S">NVIDIA L40S</option>
                  <option value="ANY">Any Architecture</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-xs font-sans text-[#454c58] mb-1">
                  <span>GPUs Needed</span>
                  <span className="text-[#074ce0] font-bold font-mono">{quantity}</span>
                </div>
                <input
                  type="number"
                  min="1"
                  max="512"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-[#f3f4f6] border border-[#dde0e6] rounded-lg px-3 py-2 text-xs text-[#16191f] font-mono focus:outline-none focus:border-[#074ce0] focus:ring-1 focus:ring-[#074ce0] transition-colors"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-sans text-[#454c58] mb-1">
                  <span>Duration (Hours)</span>
                  <span className="text-[#074ce0] font-bold font-mono">{duration}h</span>
                </div>
                <input
                  type="number"
                  min="1"
                  max="720"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-[#f3f4f6] border border-[#dde0e6] rounded-lg px-3 py-2 text-xs text-[#16191f] font-mono focus:outline-none focus:border-[#074ce0] focus:ring-1 focus:ring-[#074ce0] transition-colors"
                />
              </div>
            </div>

            {/* Min Green Energy & IndiaAI Subsidy */}
            <div className="p-3.5 rounded-lg bg-[#f3f4f6] border border-[#dde0e6] space-y-3">
              <div className="flex items-center justify-between text-xs font-sans">
                <span className="text-[#454c58] flex items-center gap-1.5 font-medium">
                  <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                  Min Clean Energy:
                </span>
                <span className="text-emerald-700 font-bold font-mono">{minGreenEnergy}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="5"
                value={minGreenEnergy}
                onChange={(e) => setMinGreenEnergy(e.target.value)}
                className="w-full h-1.5 bg-[#dde0e6] rounded appearance-none cursor-pointer accent-[#074ce0]"
              />

              <div className="flex items-center justify-between pt-1 text-xs font-sans">
                <span className="text-[#16191f] flex items-center gap-1.5 font-medium">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                  IndiaAI Mission Subsidy (50% Off)
                </span>
                <input
                  type="checkbox"
                  checked={subsidyEligible}
                  onChange={(e) => setSubsidyEligible(e.target.checked)}
                  className="rounded bg-white border-[#dde0e6] text-[#074ce0] focus:ring-[#074ce0] cursor-pointer w-4 h-4"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isAllocating}
              className="w-full py-2.5 rounded-lg bg-[#074ce0] hover:bg-[#053cb3] text-white font-sans font-semibold text-xs tracking-wider uppercase transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {isAllocating ? 'Solving Optimization Matrix...' : 'Run Allocation Optimizer'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Allocation Result Box */}
          {allocationResult && (
            <div className="mt-4 p-4 rounded-xl bg-[#f8fafc] border border-[#074ce0]/30 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans font-bold text-[#16191f] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Optimized Allocation Plan
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                  {allocationResult.savings_pct}% Cost Savings
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-white border border-[#dde0e6]">
                  <div className="text-[10px] text-[#454c58]">SuperIndia Total Cost</div>
                  <div className="text-sm font-bold text-emerald-600 font-display">₹{allocationResult.total_cost_inr.toLocaleString()}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-[#dde0e6]">
                  <div className="text-[10px] text-[#454c58]">Commercial Cloud Equiv.</div>
                  <div className="text-sm font-bold text-[#454c58] line-through font-display">₹{allocationResult.commercial_cloud_equivalent_cost_inr.toLocaleString()}</div>
                </div>
              </div>

              {/* Allocated nodes list */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-sans font-medium text-[#454c58]">Allocated Nodes:</div>
                {allocationResult.allocations.map((alloc, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-white border border-[#dde0e6] text-xs font-sans">
                    <div className="flex justify-between font-bold text-[#16191f]">
                      <span>{alloc.institution_name.split(' - ')[0]}</span>
                      <span className="text-[#074ce0] font-mono">{alloc.allocated_gpus} GPUs</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-[#454c58] mt-1 font-mono">
                      <span>Rate: ₹{alloc.effective_hourly_rate_inr}/GPU-hr</span>
                      <span>Util: {alloc.before_utilization_pct}% → <strong className="text-emerald-600">{alloc.after_utilization_pct}%</strong></span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-xs font-sans text-[#454c58] pt-2 border-t border-[#dde0e6] leading-relaxed">
                {allocationResult.optimization_summary}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Live Federated Inventory (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-display font-bold uppercase tracking-wider text-[#16191f] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#074ce0]" />
              National Federated GPU Inventory
            </h3>
            <span className="text-xs font-mono text-[#454c58]">
              Real-Time Node Telemetry
            </span>
          </div>

          <div className="space-y-3">
            {nodes.map((node) => {
              const free = node.free_available_gpus || (node.total_gpus - node.active_allocated_gpus);
              const utilPct = node.base_utilization_pct;
              const isAcademic = node.institution_type.includes("Academic") || node.institution_type.includes("Laboratory");

              return (
                <div 
                  key={node.node_id}
                  className="bg-white p-4.5 rounded-xl border border-[#dde0e6] hover:border-[#074ce0]/50 hover:shadow-sm transition-all"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        {isAcademic ? (
                          <GraduationCap className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Building2 className="w-4 h-4 text-emerald-600" />
                        )}
                        <h4 className="text-sm font-display font-bold text-[#16191f]">
                          {node.institution_name}
                        </h4>
                      </div>
                      <div className="text-xs text-[#454c58] font-sans mt-0.5">
                        {node.location} • <span className="text-[#074ce0] font-semibold">{node.gpu_model.replace(/_/g, ' ')}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-display font-bold text-[#16191f]">
                        ₹{node.hourly_rate_inr} <span className="text-xs text-[#454c58] font-normal">/GPU-hr</span>
                      </div>
                      <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-[#f3f4f6] text-[#454c58] border border-[#dde0e6]">
                        {node.institution_type.split(' / ')[0]}
                      </span>
                    </div>
                  </div>

                  {/* Utilization bar */}
                  <div className="space-y-1 my-2.5">
                    <div className="flex justify-between text-xs font-sans text-[#454c58]">
                      <span>Live Utilization: <strong className="text-[#16191f] font-mono">{utilPct.toFixed(1)}%</strong></span>
                      <span>Free: <strong className="text-[#074ce0] font-mono">{free} of {node.total_gpus} GPUs</strong></span>
                    </div>
                    <div className="w-full bg-[#f3f4f6] border border-[#dde0e6] rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${utilPct}%`,
                          backgroundColor: utilPct > 80 ? '#f59e0b' : '#074ce0'
                        }}
                      />
                    </div>
                  </div>

                  {/* Interconnect and green energy badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-[#dde0e6] text-xs font-sans text-[#454c58]">
                    <span className="truncate max-w-[280px]">
                      ⚡ Fabric: {node.interconnect}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-700 font-medium">
                      <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                      {node.green_energy_pct}% Clean Energy
                    </span>
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
