"""
Pytest unit tests for Water Resources & Subsystem Siting Engine (7 Sub-Models).
Verifies:
1. evaluate_water_availability (CGWA Stage of Extraction)
2. evaluate_water_quality (BIS 10500 TDS)
3. evaluate_demand_stress (competing abstraction)
4. evaluate_reuse_effluent_proximity (STP distance & tertiary supply)
5. evaluate_supply_demand_balance (buffer ratio)
6. evaluate_storage_headroom (72h buffer)
7. evaluate_climate_resilience (drought & flood risk)
8. calculate_water_assessment (7-model composite)
"""

import pytest
from backend.app.models.schemas import WaterInput, WaterAssessmentOutput
from backend.app.services.water_engine import (
    evaluate_water_availability,
    evaluate_water_quality,
    evaluate_demand_stress,
    evaluate_reuse_effluent_proximity,
    evaluate_supply_demand_balance,
    evaluate_storage_headroom,
    evaluate_climate_resilience,
    calculate_water_assessment,
)

def test_evaluate_water_availability():
    # Safe <= 70%
    safe = evaluate_water_availability(WaterInput(groundwater_extraction_pct=60.0))
    assert safe.score >= 80.0
    assert "Safe" in safe.category
    assert safe.flagged is False

    # Over-exploited > 100%
    over = evaluate_water_availability(WaterInput(groundwater_extraction_pct=115.0))
    assert over.score < 40.0
    assert "Over-Exploited" in over.category
    assert over.flagged is True

def test_evaluate_water_quality_tds():
    # Excellent <= 500 mg/L
    pure = evaluate_water_quality(WaterInput(water_quality_tds=300.0))
    assert pure.score >= 90.0
    assert pure.flagged is False

    # Stressed > 1500 mg/L
    saline = evaluate_water_quality(WaterInput(water_quality_tds=1800.0))
    assert saline.score < 50.0
    assert saline.flagged is True

def test_evaluate_demand_stress():
    # High stress
    stress = evaluate_demand_stress(WaterInput(demand_stress_score=35.0))
    assert stress.score == 35.0
    assert stress.flagged is True

    # Moderate stress
    calm = evaluate_demand_stress(WaterInput(demand_stress_score=85.0))
    assert calm.score == 85.0
    assert calm.flagged is False

def test_evaluate_reuse_effluent_proximity():
    res = evaluate_reuse_effluent_proximity(WaterInput(stp_distance_km=2.0, tertiary_supply_mld=30.0))
    assert res.score >= 75.0

def test_evaluate_supply_demand_balance():
    # Assured 4.0 MLD vs DC demand 1.5 MLD (Ratio > 2.5)
    res = evaluate_supply_demand_balance(WaterInput(assured_supply_mld=4.0, data_center_demand_mld=1.5))
    assert res.score >= 85.0

def test_evaluate_storage_headroom():
    # >= 72 hours target
    res_safe = evaluate_storage_headroom(WaterInput(on_site_storage_hours=72.0))
    assert res_safe.score >= 90.0
    assert res_safe.flagged is False

    # < 48 hours triggers storage risk flag
    res_low = evaluate_storage_headroom(WaterInput(on_site_storage_hours=24.0))
    assert res_low.score <= 50.0
    assert res_low.flagged is True

def test_evaluate_climate_resilience():
    res = evaluate_climate_resilience(WaterInput(drought_risk_index=20.0, flood_zone_risk=15.0))
    assert res.score >= 80.0

def test_calculate_water_assessment_aggregate():
    params = WaterInput(
        groundwater_extraction_pct=65.0,
        water_quality_tds=350.0,
        demand_stress_score=75.0,
        data_center_demand_mld=1.5,
        local_aquifer_stress_pct=45.0,
        industrial_density_index=50.0,
        stp_distance_km=2.0,
        tertiary_supply_mld=30.0,
        assured_supply_mld=3.5,
        on_site_storage_hours=72.0,
        elevation_m=20.0,
        drought_risk_index=20.0,
        flood_zone_risk=15.0,
    )
    res = calculate_water_assessment(params)
    assert isinstance(res, WaterAssessmentOutput)
    assert res.water_score >= 80.0
    assert len(res.sub_metrics) == 7
    assert res.stress_flag_triggered is False
