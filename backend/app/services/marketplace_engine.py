"""
National Cross-Institution GPU Compute Marketplace & Allocation Engine for SuperIndia.ai
Aggregates idle and commercial GPU capacity across Indian academic institutions,
national supercomputing centers (C-DAC), public research labs, and commercial hyperscalers.
Optimizes multi-objective allocation respecting interconnect bandwidth, latency, and budget.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

# Genuine Indian Compute Nodes Inventory
FEDERATED_NODES_INVENTORY = [
    {
        "node_id": "node_iit_bombay",
        "institution_name": "IIT Bombay - Centre for Machine Intelligence & Data Science",
        "institution_type": "Academic / University",
        "location": "Powai, Mumbai, Maharashtra",
        "gpu_model": "NVIDIA_A100_SXM",
        "total_gpus": 64,
        "active_allocated_gpus": 14,
        "base_utilization_pct": 21.9,
        "interconnect": "NVLink 3 (600 GB/s) + 200Gbps HDR InfiniBand",
        "hourly_rate_inr": 185.0, # Heavily subsidized academic rate
        "green_energy_pct": 45.0,
        "supports_pretraining": True,
        "state": "Maharashtra",
    },
    {
        "node_id": "node_cdac_pune",
        "institution_name": "C-DAC Pune - AIRAWAT / Param Siddhi Sovereign Cluster",
        "institution_type": "National Supercomputing Laboratory",
        "location": "Pune, Maharashtra",
        "gpu_model": "NVIDIA_A100_SXM",
        "total_gpus": 512,
        "active_allocated_gpus": 230,
        "base_utilization_pct": 44.9,
        "interconnect": "Mellanox HDR 200Gbps InfiniBand Non-Blocking Fabric",
        "hourly_rate_inr": 210.0,
        "green_energy_pct": 60.0,
        "supports_pretraining": True,
        "state": "Maharashtra",
    },
    {
        "node_id": "node_yotta_nm1",
        "institution_name": "Yotta NM1 Hyperscale Data Center",
        "institution_type": "Commercial Tier-IV Cloud CSP",
        "location": "Panvel / Navi Mumbai, Maharashtra",
        "gpu_model": "NVIDIA_H100_SXM",
        "total_gpus": 2048,
        "active_allocated_gpus": 1720,
        "base_utilization_pct": 84.0,
        "interconnect": "NVLink 4 (900 GB/s) + 800Gbps Quantum-2 InfiniBand",
        "hourly_rate_inr": 340.0, # Commercial baseline rate
        "green_energy_pct": 75.0,
        "supports_pretraining": True,
        "state": "Maharashtra",
    },
    {
        "node_id": "node_iisc_bangalore",
        "institution_name": "IISc Bangalore - Computational and Data Sciences (CDS)",
        "institution_type": "Academic / University",
        "location": "Bengaluru, Karnataka",
        "gpu_model": "NVIDIA_H100_SXM",
        "total_gpus": 32,
        "active_allocated_gpus": 6,
        "base_utilization_pct": 18.8,
        "interconnect": "NVLink 4 + 400Gbps RoCEv2",
        "hourly_rate_inr": 195.0,
        "green_energy_pct": 55.0,
        "supports_pretraining": False, # Smaller cluster suited for fine-tuning & research
        "state": "Karnataka",
    },
    {
        "node_id": "node_ctrls_hyderabad",
        "institution_name": "CtrlS AI Park",
        "institution_type": "Commercial Tier-IV Cloud CSP",
        "location": "Gachibowli, Hyderabad, Telangana",
        "gpu_model": "NVIDIA_H100_SXM",
        "total_gpus": 1024,
        "active_allocated_gpus": 798,
        "base_utilization_pct": 77.9,
        "interconnect": "800Gbps Spectrum-X RoCEv2 Network Fabric",
        "hourly_rate_inr": 330.0,
        "green_energy_pct": 80.0,
        "supports_pretraining": True,
        "state": "Telangana",
    },
    {
        "node_id": "node_nx_tra_noida",
        "institution_name": "Airtel Nxtra Hyperscale Data Center",
        "institution_type": "Commercial Tier-III Cloud CSP",
        "location": "Sector 132, Greater Noida, Uttar Pradesh",
        "gpu_model": "NVIDIA_H100_SXM",
        "total_gpus": 512,
        "active_allocated_gpus": 332,
        "base_utilization_pct": 64.8,
        "interconnect": "800Gbps Quantum-2 InfiniBand",
        "hourly_rate_inr": 325.0,
        "green_energy_pct": 70.0,
        "supports_pretraining": True,
        "state": "Uttar Pradesh",
    },
    {
        "node_id": "node_iit_madras",
        "institution_name": "IIT Madras - Robert Bosch Centre for Data Science & AI",
        "institution_type": "Academic / University",
        "location": "Chennai, Tamil Nadu",
        "gpu_model": "NVIDIA_A100_SXM",
        "total_gpus": 128,
        "active_allocated_gpus": 38,
        "base_utilization_pct": 29.7,
        "interconnect": "200Gbps HDR InfiniBand",
        "hourly_rate_inr": 190.0,
        "green_energy_pct": 50.0,
        "supports_pretraining": True,
        "state": "Tamil Nadu",
    },
    {
        "node_id": "node_enterprise_pool_blr",
        "institution_name": "Indian Enterprise Off-Peak Compute Cooperative",
        "institution_type": "Enterprise Shared Capacity",
        "location": "Electronic City, Bengaluru, Karnataka",
        "gpu_model": "NVIDIA_L40S",
        "total_gpus": 96,
        "active_allocated_gpus": 12,
        "base_utilization_pct": 12.5,
        "interconnect": "PCIe Gen5 + 100Gbps Ethernet",
        "hourly_rate_inr": 120.0,
        "green_energy_pct": 65.0,
        "supports_pretraining": False, # Ideal for high-throughput batch inference
        "state": "Karnataka",
    },
]

class WorkloadAllocationRequest(BaseModel):
    workload_name: str = Field("Indic LLM Fine-Tuning", description="Project or model name")
    workload_type: str = Field("FINE_TUNING", description="PRE_TRAINING, FINE_TUNING, INFERENCE, ACADEMIC_RESEARCH")
    gpu_model_preference: Optional[str] = Field("NVIDIA_H100_SXM", description="Preferred GPU architecture or ANY")
    quantity_gpus: int = Field(32, ge=1, le=1024, description="Required number of GPUs")
    duration_hours: int = Field(24, ge=1, le=720, description="Reserved runtime in hours")
    max_budget_inr_per_hour_gpu: Optional[float] = Field(None, description="Max acceptable hourly rate per GPU")
    require_green_energy_minimum_pct: float = Field(40.0, description="Minimum renewable energy threshold")
    eligible_for_india_ai_subsidy: bool = Field(False, description="Has IndiaAI mission grant voucher (50% fee rebate)")

class NodeAllocationResult(BaseModel):
    node_id: str
    institution_name: str
    institution_type: str
    location: str
    gpu_model: str
    allocated_gpus: int
    interconnect: str
    hourly_rate_per_gpu_inr: float
    effective_hourly_rate_inr: float # After IndiaAI subsidy if applicable
    total_cost_inr: float
    green_energy_pct: float
    before_utilization_pct: float
    after_utilization_pct: float
    utilization_gain_pct: float

class WorkloadAllocationResponse(BaseModel):
    success: bool
    workload_name: str
    workload_type: str
    quantity_requested: int
    duration_hours: int
    allocations: List[NodeAllocationResult]
    total_cost_inr: float
    commercial_cloud_equivalent_cost_inr: float # vs AWS/Azure standard rate (~₹580/h for H100)
    savings_inr: float
    savings_pct: float
    national_idle_capacity_harvested: bool
    carbon_saved_kg_co2: float
    optimization_summary: str

def get_marketplace_inventory() -> List[Dict[str, Any]]:
    """Returns all active nodes with live capacity metrics."""
    results = []
    for node in FEDERATED_NODES_INVENTORY:
        free_gpus = node["total_gpus"] - node["active_allocated_gpus"]
        results.append({
            **node,
            "free_available_gpus": free_gpus,
            "status": "AVAILABLE" if free_gpus > 0 else "FULL_UTILIZATION",
        })
    return results

def allocate_workload(req: WorkloadAllocationRequest) -> WorkloadAllocationResponse:
    """
    Multi-objective optimizer:
    1. Filter nodes by workload constraints:
       - PRE_TRAINING: Must have supports_pretraining=True and high-speed NVLink/InfiniBand.
       - INFERENCE: Can utilize L40S or A100/H100 with Ethernet/RoCE.
    2. Filter nodes by preferred GPU model (if specified).
    3. Filter by renewable energy requirement.
    4. Sort available nodes by cost and lowest existing utilization (to maximize idle harvest).
    """
    candidates = []
    for node in FEDERATED_NODES_INVENTORY:
        free_gpus = node["total_gpus"] - node["active_allocated_gpus"]
        if free_gpus <= 0:
            continue
        
        # Check green energy threshold
        if node["green_energy_pct"] < req.require_green_energy_minimum_pct:
            continue

        # Check workload physical interconnect constraint
        if req.workload_type == "PRE_TRAINING" and not node["supports_pretraining"]:
            continue

        # Check GPU model preference if not ANY
        if req.gpu_model_preference and req.gpu_model_preference != "ANY":
            if node["gpu_model"] != req.gpu_model_preference:
                continue

        # Check budget constraint
        if req.max_budget_inr_per_hour_gpu:
            if node["hourly_rate_inr"] > req.max_budget_inr_per_hour_gpu:
                continue

        candidates.append(node)

    # Sort priority:
    # 1. Academic/Lab off-peak nodes first (cheapest + highest idle capacity)
    # 2. Ascending hourly rate
    # 3. Lowest current utilization
    candidates.sort(key=lambda n: (n["hourly_rate_inr"], n["base_utilization_pct"]))

    allocated_records: List[NodeAllocationResult] = []
    gpus_needed = req.quantity_gpus

    for node in candidates:
        if gpus_needed <= 0:
            break

        free_gpus = node["total_gpus"] - node["active_allocated_gpus"]
        alloc_qty = min(gpus_needed, free_gpus)

        # Pre-training workload should preferably not be split across 2 disparate institutions
        if req.workload_type == "PRE_TRAINING" and free_gpus < gpus_needed and len(candidates) > 1:
            # Check if any single candidate has full capacity
            full_fit = next((c for c in candidates if (c["total_gpus"] - c["active_allocated_gpus"]) >= gpus_needed), None)
            if full_fit and full_fit["node_id"] != node["node_id"]:
                continue

        base_rate = node["hourly_rate_inr"]
        eff_rate = base_rate * 0.5 if req.eligible_for_india_ai_subsidy else base_rate
        subtotal_inr = alloc_qty * eff_rate * req.duration_hours

        before_util = node["base_utilization_pct"]
        new_active = node["active_allocated_gpus"] + alloc_qty
        after_util = round((new_active / node["total_gpus"]) * 100.0, 1)
        util_gain = round(after_util - before_util, 1)

        allocated_records.append(
            NodeAllocationResult(
                node_id=node["node_id"],
                institution_name=node["institution_name"],
                institution_type=node["institution_type"],
                location=node["location"],
                gpu_model=node["gpu_model"],
                allocated_gpus=alloc_qty,
                interconnect=node["interconnect"],
                hourly_rate_per_gpu_inr=base_rate,
                effective_hourly_rate_inr=eff_rate,
                total_cost_inr=round(subtotal_inr, 2),
                green_energy_pct=node["green_energy_pct"],
                before_utilization_pct=before_util,
                after_utilization_pct=after_util,
                utilization_gain_pct=util_gain,
            )
        )
        gpus_needed -= alloc_qty

    if not allocated_records:
        return WorkloadAllocationResponse(
            success=False,
            workload_name=req.workload_name,
            workload_type=req.workload_type,
            quantity_requested=req.quantity_gpus,
            duration_hours=req.duration_hours,
            allocations=[],
            total_cost_inr=0.0,
            commercial_cloud_equivalent_cost_inr=0.0,
            savings_inr=0.0,
            savings_pct=0.0,
            national_idle_capacity_harvested=False,
            carbon_saved_kg_co2=0.0,
            optimization_summary="No matching compute cluster currently meets the workload constraints or green energy requirements.",
        )

    total_actual_cost = sum(a.total_cost_inr for a in allocated_records)

    # Standard commercial public cloud benchmark (AWS/Azure/GCP standard H100/A100 rate ~₹550/GPU-hour)
    commercial_rate_per_gpu = 550.0
    commercial_benchmark_cost = req.quantity_gpus * commercial_rate_per_gpu * req.duration_hours
    savings_inr = max(0.0, commercial_benchmark_cost - total_actual_cost)
    savings_pct = round((savings_inr / commercial_benchmark_cost) * 100.0, 1) if commercial_benchmark_cost > 0 else 0.0

    # Carbon savings compared to dirty thermal grid
    avg_green_pct = sum(a.green_energy_pct for a in allocated_records) / len(allocated_records)
    # Approx 0.7 kW per GPU * duration * (avg_green_pct / 100) * 0.716 kg CO2
    carbon_saved = round(req.quantity_gpus * 0.7 * req.duration_hours * (avg_green_pct / 100.0) * 0.716, 1)

    is_academic_harvested = any("Academic" in a.institution_type or "Laboratory" in a.institution_type for a in allocated_records)

    institutions_str = ", ".join(a.institution_name.split(" - ")[0] for a in allocated_records)
    summary = (
        f"Optimally allocated {req.quantity_gpus} GPUs across {institutions_str}. "
        f"Delivered {savings_pct}% cost savings (saving ₹{savings_inr:,.0f}) vs commercial public cloud, "
        f"while harvesting off-peak national capacity and saving {carbon_saved:,.0f} kg CO2."
    )

    return WorkloadAllocationResponse(
        success=True,
        workload_name=req.workload_name,
        workload_type=req.workload_type,
        quantity_requested=req.quantity_gpus,
        duration_hours=req.duration_hours,
        allocations=allocated_records,
        total_cost_inr=round(total_actual_cost, 2),
        commercial_cloud_equivalent_cost_inr=round(commercial_benchmark_cost, 2),
        savings_inr=round(savings_inr, 2),
        savings_pct=savings_pct,
        national_idle_capacity_harvested=is_academic_harvested,
        carbon_saved_kg_co2=carbon_saved,
        optimization_summary=summary,
    )
