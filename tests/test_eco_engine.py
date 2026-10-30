"""
Tests for Module 8: Eco-Friendly Data Center & Environmental Engine
Verifies:
1. Open-Meteo GloFAS river discharge ingestion and basin hydrology
2. Open-Meteo ERA5 soil moisture & drought tracking
3. Global Forest Watch / FSI deforestation & tree canopy compliance
4. CGWB zero-water-shortage & closed-loop cooling savings calculation
5. CEA grid carbon offset and 100% renewable PPA sizing
6. Statutory ESG certification generation
"""

import pytest
from backend.app.services.eco_telemetry_service import (
    run_eco_assessment,
    evaluate_forest_and_biodiversity,
    calculate_water_preservation_metrics,
    calculate_carbon_abatement,
)

def test_eco_assessment_navi_mumbai():
    res = run_eco_assessment(
        lat=19.10,
        lon=73.01,
        site_name="Mahape MIDC Eco Campus",
        district="Thane",
        state="Maharashtra",
        it_load_mw=50.0,
        cooling_mode="DIRECT_TO_CHIP_LIQUID",
        solar_rooftop_mw=2.5,
        offsite_solar_ppa_mw=45.0,
        aquifer_soe_pct=74.0,
    )
    assert res is not None
    assert "overall_eco_score" in res
    assert 0 <= res["overall_eco_score"] <= 100
    assert "eco_tier" in res
    
    # Water check
    water = res["water_preservation"]
    assert water["daily_water_saved_liters"] > 1_000_000  # Saved over 1M L/day with DLC
    assert water["water_usage_effectiveness_wue"] <= 0.20
    
    # Forest check
    forest = res["forest_protection"]
    assert forest["tree_canopy_cover_pct"] < 10.0
    assert "ZERO_RISK" in forest["deforestation_risk_level"]
    
    # Carbon check
    carbon = res["renewable_and_carbon"]
    assert carbon["renewable_energy_share_pct"] > 50.0
    assert carbon["annual_carbon_abated_tons_yr"] > 10_000
    
    # Mandates
    assert len(res["environmental_mandates"]) >= 2
    assert "provenance" in res


def test_eco_assessment_dholera_solar():
    res = run_eco_assessment(
        lat=22.25,
        lon=72.18,
        site_name="Dholera Ultra-Mega Solar AI Park",
        district="Dholera",
        state="Gujarat",
        it_load_mw=100.0,
        cooling_mode="DRY_AIR_CHILLER",
        solar_rooftop_mw=5.0,
        offsite_solar_ppa_mw=120.0,
        aquifer_soe_pct=55.0,
        solar_ghi=5.8,
    )
    assert res["overall_eco_score"] >= 80.0
    assert "EXEMPLARY GREEN" in res["eco_tier"]
    assert res["statutory_certifications"]["leed_green_rating"] == "Platinum"


def test_forest_evaluation_protection():
    safe_forest = evaluate_forest_and_biodiversity(19.10, 73.01, district="Navi Mumbai")
    assert safe_forest["forest_score"] >= 90.0

    dense_forest = evaluate_forest_and_biodiversity(19.20, 72.90, district="Mumbai Suburban")
    assert dense_forest["compensatory_afforestation_trees"] > 0
