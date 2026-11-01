"""
Pytest unit tests for Electrical Grid & Power Infrastructure Siting Engine.
Verifies:
1. evaluate_substation_proximity
2. evaluate_voltage_class
3. evaluate_substation_spare_mva_margin
4. evaluate_renewable_open_access_corridors
5. calculate_power_assessment
"""

import pytest
from backend.app.models.schemas import PowerInput, PowerAssessmentOutput
from backend.app.services.power_engine import (
    evaluate_substation_proximity,
    evaluate_voltage_class,
    evaluate_substation_spare_mva_margin,
    evaluate_renewable_open_access_corridors,
    calculate_power_assessment,
)

def test_evaluate_substation_proximity():
    # Close proximity <= 1 km
    res_close = evaluate_substation_proximity(PowerInput(substation_distance_km=0.8))
    assert res_close.score >= 95.0
    assert res_close.flagged is False

    # Distal > 5 km triggers risk flag
    res_distal = evaluate_substation_proximity(PowerInput(substation_distance_km=7.5))
    assert res_distal.score < 65.0
    assert res_distal.flagged is True

def test_evaluate_voltage_class():
    # 400 kV extra high voltage
    res_400 = evaluate_voltage_class(PowerInput(voltage_class_kv=400.0))
    assert res_400.score == 100.0
    assert res_400.flagged is False

    # 220 kV benchmark
    res_220 = evaluate_voltage_class(PowerInput(voltage_class_kv=220.0))
    assert res_220.score >= 85.0

    # 11 kV low voltage distribution triggers flag
    res_11 = evaluate_voltage_class(PowerInput(voltage_class_kv=11.0))
    assert res_11.score <= 20.0
    assert res_11.flagged is True

def test_evaluate_substation_spare_mva_margin():
    # Headroom >= 120 MVA
    res_high = evaluate_substation_spare_mva_margin(PowerInput(spare_mva_margin=150.0, proposed_it_load_mw=80.0))
    assert res_high.score >= 95.0
    assert res_high.flagged is False

    # Headroom < 40 MVA triggers constraint flag
    res_low = evaluate_substation_spare_mva_margin(PowerInput(spare_mva_margin=25.0, proposed_it_load_mw=80.0))
    assert res_low.score < 60.0
    assert res_low.flagged is True

def test_evaluate_renewable_open_access_corridors():
    res_prime = evaluate_renewable_open_access_corridors(PowerInput(renewable_open_access_score=90.0))
    assert res_prime.score == 90.0
    assert "Prime Clean Energy" in res_prime.category

    res_fric = evaluate_renewable_open_access_corridors(PowerInput(renewable_open_access_score=35.0))
    assert res_fric.score == 35.0
    assert res_fric.flagged is True

def test_calculate_power_assessment_aggregate():
    params = PowerInput(
        substation_distance_km=1.2,
        voltage_class_kv=220.0,
        spare_mva_margin=90.0,
        proposed_it_load_mw=50.0,
        renewable_open_access_score=85.0,
    )
    res = calculate_power_assessment(params)
    assert isinstance(res, PowerAssessmentOutput)
    assert res.power_score >= 85.0
    assert len(res.sub_metrics) == 4
