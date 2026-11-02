"""
National AI Demand Forecasting & Infrastructure Capacity Planning for SuperIndia.ai
Models compute trajectory across Startups, Enterprises, Academia, and Sovereign AI.
Translates daily token throughput and training requirements into target GPUs, Megawatts, and CAPEX.
"""

from typing import List, Dict, Any
from pydantic import BaseModel, Field

# National Demand Milestones (2024 to 2030)
DEMAND_TIMELINE = [
    {
        "year": 2024,
        "label": "2024 Baseline",
        "total_gpus_required": 16500,
        "installed_capacity_gpus": 12000,
        "deficit_gpus": 4500,
        "training_pct": 72.0,
        "inference_pct": 28.0,
        "total_power_mw": 24.8,
        "capex_required_cr": 4950.0,
        "daily_tokens_billion": 45.0,
        "startups_demand_pct": 35.0,
        "enterprise_demand_pct": 30.0,
        "research_demand_pct": 25.0,
        "sovereign_demand_pct": 10.0,
    },
    {
        "year": 2026,
        "label": "2026 IndiaAI Mission Scale",
        "total_gpus_required": 48000,
        "installed_capacity_gpus": 28500,
        "deficit_gpus": 19500,
        "training_pct": 52.0,
        "inference_pct": 48.0,
        "total_power_mw": 72.5,
        "capex_required_cr": 14400.0,
        "daily_tokens_billion": 320.0,
        "startups_demand_pct": 38.0,
        "enterprise_demand_pct": 34.0,
        "research_demand_pct": 18.0,
        "sovereign_demand_pct": 10.0,
    },
    {
        "year": 2028,
        "label": "2028 Enterprise & Indic LLM Mass Adoption",
        "total_gpus_required": 115000,
        "installed_capacity_gpus": 65000,
        "deficit_gpus": 50000,
        "training_pct": 32.0,
        "inference_pct": 68.0,
        "total_power_mw": 175.0,
        "capex_required_cr": 34500.0,
        "daily_tokens_billion": 1850.0,
        "startups_demand_pct": 32.0,
        "enterprise_demand_pct": 45.0,
        "research_demand_pct": 13.0,
        "sovereign_demand_pct": 10.0,
    },
    {
        "year": 2030,
        "label": "2030 Sovereign AI Superpower Vision",
        "total_gpus_required": 250000,
        "installed_capacity_gpus": 140000,
        "deficit_gpus": 110000,
        "training_pct": 18.0,
        "inference_pct": 82.0,
        "total_power_mw": 380.0,
        "capex_required_cr": 75000.0,
        "daily_tokens_billion": 8500.0,
        "startups_demand_pct": 28.0,
        "enterprise_demand_pct": 52.0,
        "research_demand_pct": 10.0,
        "sovereign_demand_pct": 10.0,
    },
]

# Regional Capacity & Deficit Balance
REGIONAL_BREAKDOWN = [
    {
        "region": "West India (Mumbai, Navi Mumbai, Gujarat, Pune)",
        "share_of_demand_pct": 38.0,
        "current_gpus": 12500,
        "required_2026_gpus": 18240,
        "deficit_surplus": -5740,
        "status": "High Infrastructure Siting Suitability (Subsea Landing & Dholera Solar)",
        "recommendation": "Expand Dholera Mega-Campus & Navi Mumbai Tier-IV clusters.",
    },
    {
        "region": "South India (Bengaluru, Hyderabad, Chennai)",
        "share_of_demand_pct": 36.0,
        "current_gpus": 9800,
        "required_2026_gpus": 17280,
        "deficit_surplus": -7480,
        "status": "Highest AI Startup Density, Moderate Water Stressed Aquifers",
        "recommendation": "Enforce 100% STP tertiary water reuse & tap Telangana solar corridors.",
    },
    {
        "region": "North India (Delhi-NCR, Noida, Yamuna Expressway)",
        "share_of_demand_pct": 20.0,
        "current_gpus": 5200,
        "required_2026_gpus": 9600,
        "deficit_surplus": -4400,
        "status": "High Enterprise & Government AI Demand, Seismic Zone IV Consideration",
        "recommendation": "Leverage UP Data Centre Policy subsidies along Yamuna Expressway.",
    },
    {
        "region": "East & Central India (Kolkata, Odisha, Madhya Pradesh)",
        "share_of_demand_pct": 6.0,
        "current_gpus": 1000,
        "required_2026_gpus": 2880,
        "deficit_surplus": -1880,
        "status": "Emerging Regional Hub, Low-Cost Hydro & Coal Grid Baseload",
        "recommendation": "Establish disaster-resilient sovereign disaster recovery (DR) compute.",
    },
]

class TokenDemandSimulatorRequest(BaseModel):
    projected_daily_active_users_million: float = Field(50.0, description="Projected DAU using Indian AI services")
    average_tokens_per_user_daily: int = Field(5000, description="Tokens generated/consumed per active user per day")
    target_foundation_models_training_per_year: int = Field(12, description="Major frontier models trained annually")
    average_model_parameter_billions: float = Field(70.0, description="Average parameter count (e.g. 70B)")

class TokenDemandSimulatorResponse(BaseModel):
    annual_inference_tokens_trillion: float
    annual_training_tokens_billion: float
    required_inference_gpus_h100: int
    required_training_gpus_h100: int
    total_gpus_required: int
    total_power_requirement_mw: float
    estimated_capital_outlay_cr: float
    summary: str

def get_demand_forecast_summary() -> Dict[str, Any]:
    return {
        "timeline": DEMAND_TIMELINE,
        "regions": REGIONAL_BREAKDOWN,
        "key_takeaway": (
            "India faces an immediate national deficit of ~19,500 GPUs by end of 2026. "
            "Inference demand will surge from 28% to 82% of total national compute by 2030, "
            "requiring distributed low-latency regional edge deployments rather than single-location silos."
        ),
    }

def simulate_custom_demand(req: TokenDemandSimulatorRequest) -> TokenDemandSimulatorResponse:
    # 1. Inference Tokens: DAU * tokens * 365
    daily_tokens = req.projected_daily_active_users_million * 1_000_000 * req.average_tokens_per_user_daily
    annual_inference_tokens_trillion = round((daily_tokens * 365.0) / 1_000_000_000_000.0, 2)

    # Throughput physics: An H100 GPU running optimized vLLM/TensorRT-LLM on a 70B model delivers ~35 tokens/second
    # 35 tokens/sec * 3600 * 24 = ~3,024,000 tokens/day/GPU at 80% duty cycle
    tokens_per_gpu_day = 3_024_000.0
    inference_gpus = round(daily_tokens / tokens_per_gpu_day)

    # 2. Training Tokens:
    # Standard Chinchilla optimal training = 20 tokens per parameter
    # e.g., 70B parameter model requires 1.4 Trillion tokens (1,400 Billion)
    tokens_per_model_billion = req.average_model_parameter_billions * 20.0
    total_training_tokens_billion = tokens_per_model_billion * req.target_foundation_models_training_per_year

    # Training FLOPs: 6 * Parameters * Tokens
    # H100 FP8 delivers ~800 TFLOPS sustained MFU (40% of 1979 TFLOPS peak)
    # Total FLOPs = 6 * (params * 10^9) * (tokens * 10^9)
    total_flops = 6.0 * (req.average_model_parameter_billions * 1e9) * (total_training_tokens_billion * 1e9)
    seconds_in_year = 365.0 * 24.0 * 3600.0
    sustained_flops_per_h100_sec = 800.0 * 1e12
    h100_seconds_needed = total_flops / sustained_flops_per_h100_sec
    training_gpus = round(h100_seconds_needed / seconds_in_year)

    total_gpus = inference_gpus + training_gpus
    # Facility power at ~1.5 kW per H100 fully burdened with servers, networking, and cooling (PUE 1.25)
    total_power_mw = round((total_gpus * 1.5) / 1000.0, 2)
    # Total capital outlay at ₹32 Lakh per deployed H100 system share
    capex_cr = round((total_gpus * 32.0) / 100.0, 2)

    summary = (
        f"Serving {req.projected_daily_active_users_million:.0f}M active users ({annual_inference_tokens_trillion:.1f}T annual inference tokens) "
        f"and training {req.target_foundation_models_training_per_year} frontier {req.average_model_parameter_billions:.0f}B models requires "
        f"{total_gpus:,} H100-equivalent GPUs ({inference_gpus:,} inference + {training_gpus:,} training). "
        f"This demands {total_power_mw:.1f} MW utility grid power and ₹{capex_cr:,.1f} Cr capital deployment."
    )

    return TokenDemandSimulatorResponse(
        annual_inference_tokens_trillion=annual_inference_tokens_trillion,
        annual_training_tokens_billion=total_training_tokens_billion,
        required_inference_gpus_h100=inference_gpus,
        required_training_gpus_h100=training_gpus,
        total_gpus_required=total_gpus,
        total_power_requirement_mw=total_power_mw,
        estimated_capital_outlay_cr=capex_cr,
        summary=summary,
    )
