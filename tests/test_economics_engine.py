"""
Pytest unit tests for Economics & State Policy Siting Engine.
Verifies:
1. calculate_economics_assessment
2. Industrial electricity tariff curve
3. State policy incentives & capital subsidy modeling
4. Electricity duty waiver duration
5. Land cost / circle rate affordability scoring
"""

import pytest
from backend.app.models.schemas import EconomicsInput
from backend.app.services.economics_engine import (
    calculate_economics_assessment,
    EconomicsAssessmentOutput,
)

def test_calculate_economics_assessment_dholera_incentives():
    params = EconomicsInput(
        electricity_tariff_inr_per_kwh=6.0,
        state_has_dc_policy=True,
        capital_subsidy_pct=25.0,
        stamp_duty_exemption_pct=100.0,
        electricity_duty_exemption_years=10,
        land_cost_inr_crore_per_acre=1.5,
    )
    res = calculate_economics_assessment(params)
    assert isinstance(res, EconomicsAssessmentOutput)
    assert res.economics_score >= 95.0
    assert res.policy_tier == "TIER-1 INCENTIVE STATE"
    assert len(res.sub_metrics) == 4

def test_calculate_economics_assessment_high_tariff_no_policy():
    params = EconomicsInput(
        electricity_tariff_inr_per_kwh=9.5,
        state_has_dc_policy=False,
        capital_subsidy_pct=0.0,
        stamp_duty_exemption_pct=0.0,
        electricity_duty_exemption_years=0,
        land_cost_inr_crore_per_acre=18.0,
    )
    res = calculate_economics_assessment(params)
    assert res.economics_score < 45.0
    assert res.policy_tier == "STANDARD COMMERCIAL"

def test_tariff_scoring_tiers():
    # <= 6.0: 100
    res_low = calculate_economics_assessment(EconomicsInput(electricity_tariff_inr_per_kwh=5.8))
    t_low = next(sm for sm in res_low.sub_metrics if sm["key"] == "electricity_tariff_competitiveness")
    assert t_low["score"] == 100.0

    # > 8.5: high tariff penalty
    res_high = calculate_economics_assessment(EconomicsInput(electricity_tariff_inr_per_kwh=9.0))
    t_high = next(sm for sm in res_high.sub_metrics if sm["key"] == "electricity_tariff_competitiveness")
    assert t_high["score"] < 60.0
    assert t_high["flagged"] is True

def test_land_cost_affordability():
    # <= 1.5 Cr: 100
    res_afford = calculate_economics_assessment(EconomicsInput(land_cost_inr_crore_per_acre=1.2))
    lc_metric = next(sm for sm in res_afford.sub_metrics if sm["key"] == "land_acquisition_affordability")
    assert lc_metric["score"] == 100.0

    # > 15 Cr: premium cost penalty
    res_expensive = calculate_economics_assessment(EconomicsInput(land_cost_inr_crore_per_acre=20.0))
    lc_exp = next(sm for sm in res_expensive.sub_metrics if sm["key"] == "land_acquisition_affordability")
    assert lc_exp["score"] <= 30.0
    assert lc_exp["flagged"] is True
