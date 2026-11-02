"""
Citizen Infrastructure Participation & Fractional Financing Simulation for SuperIndia.ai
Simulates public-private fractional participation in national sovereign AI infrastructure
through AI Infrastructure Bonds (AIIBs) and Green Compute Trusts.
"""

from typing import List, Dict, Any
from pydantic import BaseModel, Field

# Flagship National Sovereign AI Infrastructure Projects
FLAGSHIP_PROJECTS = [
    {
        "project_id": "proj_dholera_solar_gigawatt",
        "project_name": "Dholera Green AI Gigawatt Mega-Campus",
        "location": "Dholera SIR, Gujarat",
        "project_type": "Greenfield AI Data Center & 300MW Captive Solar",
        "total_capital_outlay_cr": 12500.0,
        "citizen_pool_allocation_cr": 2500.0,
        "funded_so_far_cr": 1680.0,
        "participants_count": 84200,
        "target_gpus": 16384,
        "power_capacity_mw": 180.0,
        "annual_projected_apy_pct": 8.45,
        "tenure_years": 5,
        "carbon_offset_tco2_year": 420000.0,
        "status": "OPEN_FOR_PARTICIPATION",
        "description": "Asia's largest planned zero-carbon AI compute park powered directly by Gujarat's 5GW Ultra Mega Solar Park.",
    },
    {
        "project_id": "proj_navi_mumbai_gateway",
        "project_name": "Navi Mumbai Subsea AI Gateway",
        "location": "Airoli / Mahape, Navi Mumbai, Maharashtra",
        "project_type": "Tier-IV Hyperscale Direct Subsea Landing Facility",
        "total_capital_outlay_cr": 8200.0,
        "citizen_pool_allocation_cr": 1640.0,
        "funded_so_far_cr": 1410.0,
        "participants_count": 62500,
        "target_gpus": 10240,
        "power_capacity_mw": 110.0,
        "annual_projected_apy_pct": 8.15,
        "tenure_years": 3,
        "carbon_offset_tco2_year": 185000.0,
        "status": "OPEN_FOR_PARTICIPATION",
        "description": "Ultra-low latency AI training hub connected directly to 14 international subsea fiber cables.",
    },
    {
        "project_id": "proj_yamuna_expressway_hub",
        "project_name": "Yamuna Expressway Sovereign AI Hub",
        "location": "Sector 28, YEIDA / Jewar, Uttar Pradesh",
        "project_type": "National Mission AI Campus & High-Voltage Grid Interconnect",
        "total_capital_outlay_cr": 6800.0,
        "citizen_pool_allocation_cr": 1360.0,
        "funded_so_far_cr": 720.0,
        "participants_count": 31400,
        "target_gpus": 8192,
        "power_capacity_mw": 85.0,
        "annual_projected_apy_pct": 8.60,
        "tenure_years": 5,
        "carbon_offset_tco2_year": 140000.0,
        "status": "OPEN_FOR_PARTICIPATION",
        "description": "Dedicated North India enterprise and government AI compute cluster backed by UP Data Centre Policy subsidies.",
    },
]

class CitizenParticipationSimRequest(BaseModel):
    project_id: str = Field("proj_dholera_solar_gigawatt", description="Target infrastructure project ID")
    contribution_amount_inr: float = Field(25000.0, ge=1000.0, le=5000000.0, description="Citizen investment amount in ₹")
    tenure_years: int = Field(5, ge=1, le=10, description="Tenure in years")
    reinvestment_mode: str = Field("CASH_DIVIDEND", description="CASH_DIVIDEND or COMPUTE_CREDITS_VOUCHER")

class CitizenParticipationSimResponse(BaseModel):
    project_id: str
    project_name: str
    location: str
    contribution_amount_inr: float
    annual_apy_pct: float
    annual_interest_yield_inr: float
    total_maturity_amount_inr: float
    equivalent_gpus_fraction_backed: float
    equivalent_power_capacity_watts: float
    annual_carbon_abatement_kg_co2: float
    compute_dividend_tokens_million: float
    sovereign_guarantee_tier: str
    summary: str

def get_flagship_projects() -> List[Dict[str, Any]]:
    return FLAGSHIP_PROJECTS

def simulate_citizen_participation(req: CitizenParticipationSimRequest) -> CitizenParticipationSimResponse:
    project = next((p for p in FLAGSHIP_PROJECTS if p["project_id"] == req.project_id), FLAGSHIP_PROJECTS[0])

    apy = project["annual_projected_apy_pct"]
    p_inr = req.contribution_amount_inr
    years = req.tenure_years

    # Simple/Compound annual yield
    annual_yield_inr = round(p_inr * (apy / 100.0), 2)
    total_maturity_inr = round(p_inr * ((1.0 + (apy / 100.0)) ** years), 2)

    # Fractions backed:
    # 1 GPU in this project costs approximately (Total Project Cr * 10^7) / Target GPUs
    cost_per_gpu_system_inr = (project["total_capital_outlay_cr"] * 10_000_000.0) / project["target_gpus"]
    gpu_fraction = round(p_inr / cost_per_gpu_system_inr, 4)

    # Power capacity backed in Watts:
    # (Total MW * 10^6) / (Total Project Cr * 10^7) = Watts per INR
    watts_per_inr = (project["power_capacity_mw"] * 1_000_000.0) / (project["total_capital_outlay_cr"] * 10_000_000.0)
    power_watts_backed = round(p_inr * watts_per_inr, 1)

    # Annual Carbon Abatement
    total_carbon_kg = project["carbon_offset_tco2_year"] * 1000.0
    carbon_share_kg = round(total_carbon_kg * (p_inr / (project["total_capital_outlay_cr"] * 10_000_000.0)), 1)

    # If converted to compute credits voucher for Indic AI:
    # Approx ₹100 = 1,000,000 tokens of 70B inference
    tokens_million_annual = round((annual_yield_inr / 100.0) * 1.0, 1)

    summary = (
        f"Your ₹{p_inr:,.0f} participation in {project['project_name']} backs {gpu_fraction:.4f} GPU units "
        f"and {power_watts_backed:.1f} W of clean capacity. Generates ₹{annual_yield_inr:,.0f}/year yield "
        f"({apy}% APY) with a {years}-year maturity value of ₹{total_maturity_inr:,.0f}."
    )

    return CitizenParticipationSimResponse(
        project_id=project["project_id"],
        project_name=project["project_name"],
        location=project["location"],
        contribution_amount_inr=p_inr,
        annual_apy_pct=apy,
        annual_interest_yield_inr=annual_yield_inr,
        total_maturity_amount_inr=total_maturity_inr,
        equivalent_gpus_fraction_backed=gpu_fraction,
        equivalent_power_capacity_watts=power_watts_backed,
        annual_carbon_abatement_kg_co2=carbon_share_kg,
        compute_dividend_tokens_million=tokens_million_annual,
        sovereign_guarantee_tier="Tier-1 Sovereign Backed Infrastructure Trust (SEBI InvIT Compliant)",
        summary=summary,
    )
