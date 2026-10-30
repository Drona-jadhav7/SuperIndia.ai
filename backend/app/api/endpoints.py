import json
import os
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query, Path

from backend.app.models.schemas import (
    SiteInput,
    SiteAssessmentResponse,
    SiteComparisonRequest,
    SiteComparisonResponse,
    LiveTelemetryRequest,
    LiveTelemetryResponse,
)
from backend.app.services.aggregator import assess_site
from backend.app.services.live_telemetry_service import evaluate_live_site_telemetry
from backend.app.services.dc_planner import (
    HARDWARE_SPECS,
    COOLING_MODES,
    DCPlannerRequest,
    DCPlannerResponse,
    plan_data_center,
)
from backend.app.services.marketplace_engine import (
    WorkloadAllocationRequest,
    WorkloadAllocationResponse,
    get_marketplace_inventory,
    allocate_workload,
)
from backend.app.services.demand_forecast_engine import (
    TokenDemandSimulatorRequest,
    TokenDemandSimulatorResponse,
    get_demand_forecast_summary,
    simulate_custom_demand,
)
from backend.app.services.citizen_financing_engine import (
    CitizenParticipationSimRequest,
    CitizenParticipationSimResponse,
    get_flagship_projects,
    simulate_citizen_participation,
)
from backend.app.services.policy_engine import (
    get_all_state_policies,
    get_india_ai_mission_summary,
)

router = APIRouter()

BENCHMARK_FILE = os.path.join(
    os.path.dirname(os.path.dirname(__file__)), "data", "benchmark_sites.json"
)

def load_benchmark_sites() -> List[SiteInput]:
    if not os.path.exists(BENCHMARK_FILE):
        return []
    with open(BENCHMARK_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    return [SiteInput(**item) for item in data]

# ==========================================
# 1. Health Check
# ==========================================
@router.get("/health", tags=["System"])
def api_health():
    return {
        "status": "healthy",
        "service": "SuperIndia.ai National Infrastructure Intelligence API",
        "version": "2.0.0",
        "modules": [
            "Site Assessment (7 Domains)",
            "Data Center Engineering Planner",
            "GPU Compute Marketplace & Allocation",
            "National Demand Forecasting",
            "Citizen Infrastructure Financing Simulation",
            "Government Policy Intelligence",
        ],
    }

# ==========================================
# 2. Site Assessment Endpoints (7 Domains)
# ==========================================
@router.post("/assess", response_model=SiteAssessmentResponse, tags=["Site Assessment"])
def assess_site_endpoint(site: SiteInput):
    """
    Run deterministic 7-domain site assessment:
    Water (7 sub-models), Power, Climate, Connectivity, Disaster, Land, and Economics.
    Returns composite score, tier, radar metrics, risk flags, and engineering mandates.
    """
    try:
        return assess_site(site)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Assessment error: {str(e)}")

@router.get("/sites", response_model=List[SiteAssessmentResponse], tags=["Site Assessment"])
def get_benchmark_sites():
    """
    Retrieve pre-seeded ground truth assessments for 8 strategic Indian AI/data center hubs:
    Navi Mumbai, Dholera SIR, Hyderabad, Greater Noida, Bengaluru, Chennai, Taloja, South Mumbai.
    """
    sites = load_benchmark_sites()
    return [assess_site(site) for site in sites]

@router.get("/sites/{site_id}", response_model=SiteAssessmentResponse, tags=["Site Assessment"])
def get_site_by_id(site_id: str = Path(..., description="Unique ID of benchmark site")):
    """
    Retrieve single benchmark site assessment by ID.
    """
    sites = load_benchmark_sites()
    for site in sites:
        if site.site_id == site_id:
            return assess_site(site)
    raise HTTPException(status_code=404, detail=f"Site with ID '{site_id}' not found.")

@router.post("/compare", response_model=SiteComparisonResponse, tags=["Site Assessment"])
def compare_sites_endpoint(req: SiteComparisonRequest):
    """
    Multi-site audit and comparison matrix across all 7 infrastructure dimensions.
    """
    all_benchmarks = {s.site_id: s for s in load_benchmark_sites()}
    sites_to_assess: List[SiteInput] = []

    if req.site_ids:
        for sid in req.site_ids:
            if sid in all_benchmarks:
                sites_to_assess.append(all_benchmarks[sid])
            else:
                raise HTTPException(status_code=404, detail=f"Benchmark site '{sid}' not found")
    elif req.custom_sites:
        sites_to_assess.extend(req.custom_sites)
    else:
        sites_to_assess = list(all_benchmarks.values())

    assessments = [assess_site(s) for s in sites_to_assess]
    sorted_assessments = sorted(assessments, key=lambda a: a.composite_score, reverse=True)

    ranked_list = []
    for rank, item in enumerate(sorted_assessments, start=1):
        ranked_list.append({
            "rank": rank,
            "site_id": item.site_id,
            "site_name": item.site_name,
            "state": item.state,
            "composite_score": item.composite_score,
            "water_score": item.water_score,
            "power_score": item.power_score,
            "climate_score": item.climate_score,
            "connectivity_score": item.connectivity_score,
            "disaster_score": item.disaster_score,
            "land_score": item.land_score,
            "economics_score": item.economics_score,
            "tier": item.tier,
            "tier_badge": item.tier_badge,
            "tier_color": item.tier_color,
            "risk_flags_count": len(item.risk_flags),
        })

    best_site = sorted_assessments[0].site_name if sorted_assessments else None
    summary = f"Evaluated {len(sorted_assessments)} candidate hubs. Highest ranked: {best_site} ({sorted_assessments[0].composite_score}/100)."

    return SiteComparisonResponse(
        sites=sorted_assessments,
        ranked_sites=ranked_list,
        best_site=best_site,
        comparison_summary=summary,
    )


# ==========================================
# 2b. Live Telemetry & Authentic Scoring Endpoints
# ==========================================
@router.post("/telemetry/fetch-real-data", response_model=LiveTelemetryResponse, tags=["Authentic Live Telemetry"])
def fetch_real_data_telemetry(req: LiveTelemetryRequest):
    """
    Query real-time physical telemetry for any geographic coordinate (lat, lon) in India.
    Connects to NASA POWER (climatology/psychrometrics), NASA SRTM 30m Global Elevation,
    Open-Meteo/CAMS ECMWF (air quality), USGS & BIS IS 1893:2016 (seismic),
    CGWB (groundwater extraction & TDS), CEA transmission grid, and NIXI transit.
    Returns full physical parameters, provenance metadata, and official citations.
    """
    try:
        result = evaluate_live_site_telemetry(
            lat=req.latitude,
            lon=req.longitude,
            state=req.state or "Maharashtra",
            district=req.district,
            site_name=req.site_name or "Live Candidate Hub",
            proposed_it_load_mw=req.proposed_it_load_mw or 50.0,
        )
        return LiveTelemetryResponse(
            site_input=result["site_input"],
            provenance=result["provenance"],
            api_statuses=result["api_statuses"],
            summary=result["summary"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Live telemetry fetch error: {str(e)}")

@router.post("/assess/live", response_model=SiteAssessmentResponse, tags=["Authentic Live Telemetry"])
def assess_live_site_endpoint(req: LiveTelemetryRequest):
    """
    One-click authentic site assessment:
    Fetches genuine live physical parameters from NASA and Indian Government APIs,
    then deterministically evaluates the candidate hub across all 7 infrastructure domains.
    Returns composite score, domain radar, risk flags, engineering mandates, and verified provenance.
    """
    try:
        telemetry = evaluate_live_site_telemetry(
            lat=req.latitude,
            lon=req.longitude,
            state=req.state or "Maharashtra",
            district=req.district,
            site_name=req.site_name or f"Live Site ({req.latitude:.2f}°N, {req.longitude:.2f}°E)",
            proposed_it_load_mw=req.proposed_it_load_mw or 50.0,
        )
        site_input = telemetry["site_input"]
        return assess_site(
            site=site_input,
            provenance=telemetry["provenance"],
            is_live_evaluated=True,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Live site assessment error: {str(e)}")

# ==========================================
# 3. Data Center Engineering Planner
# ==========================================
@router.get("/dc/hardware", tags=["Data Center Planner"])
def get_dc_hardware_options():
    """Retrieve genuine GPU hardware profiles and cooling architectures."""
    return {
        "hardware_options": HARDWARE_SPECS,
        "cooling_modes": COOLING_MODES,
    }

@router.post("/dc/plan", response_model=DCPlannerResponse, tags=["Data Center Planner"])
def calculate_dc_plan(req: DCPlannerRequest):
    """
    Calculates required racks, IT MW, facility power (MW), dynamic PUE, cooling flow rate,
    water consumption (MLD), substation MVA, and detailed CAPEX/OPEX in ₹ Crore.
    """
    try:
        return plan_data_center(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DC planning error: {str(e)}")

# ==========================================
# 4. GPU Marketplace & Allocation Engine
# ==========================================
@router.get("/marketplace/nodes", tags=["GPU Marketplace"])
def get_federated_nodes():
    """List federated cross-institution GPU nodes across IITs, C-DAC, and CSPs with live utilization."""
    return get_marketplace_inventory()

@router.post("/marketplace/allocate", response_model=WorkloadAllocationResponse, tags=["GPU Marketplace"])
def allocate_workload_endpoint(req: WorkloadAllocationRequest):
    """
    Multi-objective optimization matching workloads to available GPUs,
    maximizing national utilization and minimizing cost vs commercial cloud.
    """
    try:
        return allocate_workload(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Marketplace allocation error: {str(e)}")

# ==========================================
# 5. National AI Demand Forecasting
# ==========================================
@router.get("/demand/forecast", tags=["Demand Intelligence"])
def get_national_demand_forecast():
    """Retrieve 2024-2030 national compute forecast and regional deficit models."""
    return get_demand_forecast_summary()

@router.post("/demand/simulate", response_model=TokenDemandSimulatorResponse, tags=["Demand Intelligence"])
def simulate_demand_endpoint(req: TokenDemandSimulatorRequest):
    """Translate target daily active users and token throughput into required GPUs, MW, and CAPEX."""
    try:
        return simulate_custom_demand(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Demand simulation error: {str(e)}")

# ==========================================
# 6. Citizen Infrastructure Participation Simulation
# ==========================================
@router.get("/citizen/projects", tags=["Citizen Financing"])
def get_citizen_projects():
    """List flagship sovereign AI infrastructure projects available for fractional participation."""
    return get_flagship_projects()

@router.post("/citizen/simulate", response_model=CitizenParticipationSimResponse, tags=["Citizen Financing"])
def simulate_citizen_participation_endpoint(req: CitizenParticipationSimRequest):
    """Simulate fractional participation returns, backed GPU units, clean power, and token dividends."""
    try:
        return simulate_citizen_participation(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Citizen simulation error: {str(e)}")

# ==========================================
# 7. Government & Policy Intelligence
# ==========================================
@router.get("/policy/states", tags=["Policy Intelligence"])
def get_state_policies_endpoint():
    """Retrieve comparative database of state-wise data center and AI policies."""
    return get_all_state_policies()

@router.get("/policy/india-ai", tags=["Policy Intelligence"])
def get_india_ai_endpoint():
    """Retrieve overview and pillars of the national IndiaAI mission."""
    return get_india_ai_mission_summary()
