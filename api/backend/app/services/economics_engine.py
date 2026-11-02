"""
Economics & State Policy Siting Engine for SuperIndia.ai
Evaluates industrial electricity tariffs (SERC HT rates), state data center policy incentives,
capital subsidies, stamp duty waivers, and land circle rates across Indian states.
"""

from typing import Dict, List, Any
from pydantic import BaseModel, Field

class EconomicsInput(BaseModel):
    electricity_tariff_inr_per_kwh: float = Field(7.5, description="State SERC Industrial High-Tension (HT) base electricity tariff in ₹/kWh")
    state_has_dc_policy: bool = Field(True, description="State has dedicated Data Centre / AI infrastructure policy")
    capital_subsidy_pct: float = Field(15.0, description="State capital investment subsidy percentage on fixed assets")
    stamp_duty_exemption_pct: float = Field(100.0, description="Stamp duty and registration fee concession percentage")
    electricity_duty_exemption_years: int = Field(10, description="Duration of electricity duty waiver in years")
    land_cost_inr_crore_per_acre: float = Field(4.5, description="Land acquisition cost / circle rate in ₹ Crore per acre")

class EconomicsAssessmentOutput(BaseModel):
    economics_score: float
    weights: Dict[str, float]
    sub_metrics: List[Dict[str, Any]]
    policy_tier: str
    summary: str

def calculate_economics_assessment(params: EconomicsInput) -> EconomicsAssessmentOutput:
    """
    Evaluates financial and policy attractiveness:
    1. Electricity Tariff (0.40): Dominant OPEX line-item for hyperscale AI compute.
    2. Policy Capital Subsidies & Stamp Duty (0.30): Upfront CAPEX incentives.
    3. Electricity Duty Waiver (0.15): 8-15% annual power cost relief.
    4. Land Acquisition Cost (0.15): Initial civil capitalization barrier.
    """
    # 1. Electricity Tariff Score
    # <= ₹6.0/kWh: 100 (Gujarat Dholera / Solar Open Access)
    # ₹6.0 - ₹7.2/kWh: 88 (Telangana, UP, Chhattisgarh)
    # ₹7.2 - ₹8.2/kWh: 70 (Maharashtra, Karnataka, Tamil Nadu)
    # > ₹9.0/kWh: 40 (High tariff zones)
    tariff = params.electricity_tariff_inr_per_kwh
    if tariff <= 6.0:
        tariff_score = 100.0
    elif tariff <= 7.2:
        tariff_score = 100.0 - ((tariff - 6.0) / 1.2) * 15.0
    elif tariff <= 8.5:
        tariff_score = 85.0 - ((tariff - 7.2) / 1.3) * 25.0
    else:
        tariff_score = max(25.0, 60.0 - ((tariff - 8.5) / 2.0) * 35.0)

    # 2. State Policy Incentives
    if not params.state_has_dc_policy:
        policy_score = 40.0
    else:
        subsidy_factor = min(100.0, params.capital_subsidy_pct * 4.0)
        stamp_factor = params.stamp_duty_exemption_pct
        policy_score = min(100.0, (subsidy_factor * 0.5) + (stamp_factor * 0.5))

    # 3. Electricity Duty Waiver
    ed_years = params.electricity_duty_exemption_years
    if ed_years >= 10:
        ed_score = 100.0
    elif ed_years >= 5:
        ed_score = 80.0
    elif ed_years >= 1:
        ed_score = 60.0
    else:
        ed_score = 30.0

    # 4. Land Cost (₹ Cr / acre)
    # <= ₹1.5 Cr: 100 (Dholera / Tier-2 Industrial)
    # ₹1.5 - ₹4.0 Cr: 85 (Noida, Siruseri)
    # ₹4.0 - ₹10.0 Cr: 65 (Navi Mumbai, Whitefield)
    # > ₹15.0 Cr: 30 (Core Mumbai/Delhi CBD)
    lc = params.land_cost_inr_crore_per_acre
    if lc <= 1.5:
        land_cost_score = 100.0
    elif lc <= 4.0:
        land_cost_score = 100.0 - ((lc - 1.5) / 2.5) * 18.0
    elif lc <= 10.0:
        land_cost_score = 82.0 - ((lc - 4.0) / 6.0) * 30.0
    else:
        land_cost_score = max(20.0, 52.0 - ((lc - 10.0) / 10.0) * 30.0)

    weights = {
        "electricity_tariff_competitiveness": 0.40,
        "state_policy_capital_incentives": 0.30,
        "electricity_duty_concessions": 0.15,
        "land_acquisition_affordability": 0.15,
    }

    economics_score = round(
        (tariff_score * weights["electricity_tariff_competitiveness"])
        + (policy_score * weights["state_policy_capital_incentives"])
        + (ed_score * weights["electricity_duty_concessions"])
        + (land_cost_score * weights["land_acquisition_affordability"]),
        2,
    )

    policy_tier = "TIER-1 INCENTIVE STATE" if economics_score >= 80 else "COMPETITIVE INCENTIVES" if economics_score >= 60 else "STANDARD COMMERCIAL"

    sub_metrics = [
        {
            "name": "Industrial Electricity Tariff",
            "key": "electricity_tariff_competitiveness",
            "score": round(tariff_score, 1),
            "weight": weights["electricity_tariff_competitiveness"],
            "weighted_score": round(tariff_score * weights["electricity_tariff_competitiveness"], 2),
            "category": "COMPETITIVE" if tariff_score >= 80 else "MODERATE" if tariff_score >= 60 else "EXPENSIVE",
            "details": f"SERC HT Tariff: ₹{tariff:.2f} / kWh.",
            "flagged": tariff_score < 60.0,
        },
        {
            "name": "State DC Policy & Capital Subsidies",
            "key": "state_policy_capital_incentives",
            "score": round(policy_score, 1),
            "weight": weights["state_policy_capital_incentives"],
            "weighted_score": round(policy_score * weights["state_policy_capital_incentives"], 2),
            "category": "EXCELLENT" if policy_score >= 80 else "MODERATE" if policy_score >= 60 else "LIMITED",
            "details": f"{params.capital_subsidy_pct:.0f}% Capex Subsidy, {params.stamp_duty_exemption_pct:.0f}% Stamp Duty Waiver.",
            "flagged": policy_score < 60.0,
        },
        {
            "name": "Electricity Duty Exemption",
            "key": "electricity_duty_concessions",
            "score": round(ed_score, 1),
            "weight": weights["electricity_duty_concessions"],
            "weighted_score": round(ed_score * weights["electricity_duty_concessions"], 2),
            "category": "EXCELLENT" if ed_score >= 80 else "ACCEPTABLE" if ed_score >= 60 else "NONE",
            "details": f"{ed_years} Years 100% Electricity Duty Exemption.",
            "flagged": ed_score < 60.0,
        },
        {
            "name": "Land Circle Rate Viability",
            "key": "land_acquisition_affordability",
            "score": round(land_cost_score, 1),
            "weight": weights["land_acquisition_affordability"],
            "weighted_score": round(land_cost_score * weights["land_acquisition_affordability"], 2),
            "category": "AFFORDABLE" if land_cost_score >= 80 else "MODERATE" if land_cost_score >= 60 else "PREMIUM",
            "details": f"₹{lc:.2f} Cr / acre benchmark cost.",
            "flagged": land_cost_score < 60.0,
        },
    ]

    return EconomicsAssessmentOutput(
        economics_score=economics_score,
        weights=weights,
        sub_metrics=sub_metrics,
        policy_tier=policy_tier,
        summary=f"Economic viability score {economics_score}/100. Electricity tariff ₹{tariff}/kWh with {policy_tier} benefits.",
    )
