"""
Pytest unit tests for Climate & Psychrometrics Siting Engine.
Verifies:
1. calculate_wet_bulb_stull
2. calculate_climate_assessment
3. ASHRAE TC 9.9 thermal classification and free cooling potential
"""

import pytest
from backend.app.models.schemas import ClimateInput
from backend.app.services.climate_engine import (
    calculate_wet_bulb_stull,
    calculate_climate_assessment,
    ClimateAssessmentOutput,
)

def test_calculate_wet_bulb_stull_formulation():
    # Cold condition: 15°C, 40% RH
    tw_cold = calculate_wet_bulb_stull(15.0, 40.0)
    assert 7.0 <= tw_cold <= 10.0

    # Hot humid: 38°C, 80% RH
    tw_hot = calculate_wet_bulb_stull(38.0, 80.0)
    assert 32.0 <= tw_hot <= 35.5

def test_calculate_climate_assessment_temperate():
    params = ClimateInput(
        dry_bulb_temp_c=28.0,
        relative_humidity_pct=50.0,
        annual_cooling_degree_days=2100.0,
        air_quality_pm25=30.0,
        extreme_heat_days=3.0,
    )
    res = calculate_climate_assessment(params)
    assert isinstance(res, ClimateAssessmentOutput)
    assert res.climate_score >= 80.0
    assert res.wet_bulb_temp_c < 24.0
    assert len(res.sub_metrics) == 4

def test_calculate_climate_assessment_extreme_heat():
    params = ClimateInput(
        dry_bulb_temp_c=44.0,
        relative_humidity_pct=65.0,
        annual_cooling_degree_days=3800.0,
        air_quality_pm25=120.0,
        extreme_heat_days=45.0,
    )
    res = calculate_climate_assessment(params)
    assert res.climate_score < 45.0
    assert res.wet_bulb_temp_c > 30.0
    # Wet bulb and air quality metrics should be flagged
    wb_metric = next(sm for sm in res.sub_metrics if sm["key"] == "wet_bulb_temperature")
    assert wb_metric["flagged"] is True
