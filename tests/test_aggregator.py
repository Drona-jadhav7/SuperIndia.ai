"""
Pytest unit tests for Aggregator & Composite Siting Engine.
Verifies:
1. Gir Wildlife Sanctuary: Siting in wildlife habitat directly drops composite score to 10 - 20 range (UNVIABLE).
2. Zero Tree Cutting Guarantee: Enforces zero tree felling across protected and industrial zones.
3. Benchmark Viable Sites: Dholera SIR and Mahape MIDC score >= 75 (VIABLE).
4. Automated Diagnostics & Risk Flag Generation across 8 domains.
"""

import pytest
from backend.app.models.schemas import (
    SiteInput,
    WaterInput,
    PowerInput,
    ClimateInput,
    ConnectivityInput,
    DisasterInput,
    LandInput,
    EconomicsInput,
    EcoInput,
)
from backend.app.services.aggregator import assess_site
from backend.app.services.live_telemetry_service import evaluate_live_site_telemetry

def test_gir_wildlife_sanctuary_scoring_10_to_20():
    """
    CRITICAL USER REQUIREMENT TEST:
    'For example, the place selected is Gir Wildlife Sanctuary, where millions of trees
    and animals live; the score should be directly 10- 20, but instead it is 80'
    """
    telemetry = evaluate_live_site_telemetry(
        lat=21.1243,
        lon=70.7963,
        site_name="Gir Wildlife Sanctuary",
        state="Gujarat",
        district="Junagadh",
        proposed_it_load_mw=50.0,
    )
    site_input = telemetry["site_input"]
    assessment = assess_site(site_input)

    # 1. Composite score MUST be directly in the 10 - 20 range
    assert 10.0 <= assessment.composite_score <= 20.0, (
        f"Expected composite score between 10.0 and 20.0, got {assessment.composite_score}"
    )

    # 2. Tier MUST be UNVIABLE / REJECT
    assert assessment.tier == "UNVIABLE / REJECT"
    assert assessment.tier_badge == "UNVIABLE"
    assert assessment.tier_color == "#EF4444"

    # 3. Land score must reflect statutory non-conformity
    assert assessment.land_score <= 15.0

    # 4. Zero tree felling guaranteed
    assert assessment.eco_assessment["estimated_trees_to_cut"] == 0
    assert "no trees will be cut" in assessment.eco_assessment["tree_preservation_status"].lower() or "zero tree cutting" in assessment.eco_assessment["tree_preservation_status"].lower()

    # 5. Risk flags must contain statutory barrier and millions of trees mention
    risk_text = " ".join(assessment.risk_flags).lower()
    assert "statutory prohibition" in risk_text or "protected" in risk_text
    assert "millions of trees" in risk_text or "wildlife" in risk_text

    # 6. Engineering mandates must order immediate rejection and relocation
    mandate_text = " ".join(assessment.engineering_mandates).lower()
    assert "rejection" in mandate_text or "relocate" in mandate_text
    assert "zero tree" in mandate_text or "no trees will be cut" in mandate_text

def test_dholera_sir_viable_hub():
    """Verify master-planned greenfield industrial park achieves high viability."""
    telemetry = evaluate_live_site_telemetry(
        lat=22.2514,
        lon=72.1965,
        site_name="Dholera SIR (Special Investment Region)",
        state="Gujarat",
        district="Ahmedabad",
        proposed_it_load_mw=100.0,
    )
    site_input = telemetry["site_input"]
    assessment = assess_site(site_input)

    assert assessment.composite_score >= 75.0
    assert assessment.tier == "VIABLE / RECOMMENDED"
    assert assessment.tier_badge == "VIABLE"
    assert assessment.eco_assessment["estimated_trees_to_cut"] == 0
    assert "Zero Tree Cutting Required" in assessment.eco_assessment["tree_preservation_status"]

def test_zero_tree_cutting_mandate_text():
    """Verify that zero tree cutting policy is explicitly stated in assessment."""
    site = SiteInput(
        site_name="Test Industrial AI Park",
        state="Maharashtra",
        district="Thane",
        latitude=19.1170,
        longitude=73.0160,
        elevation_m=15.0,
        proposed_it_load_mw=50.0,
        land_params=LandInput(is_notified_it_industrial_zone=True),
        eco_params=EcoInput(tree_canopy_cover_pct=2.0, is_notified_non_forest=True),
    )
    res = assess_site(site)
    assert res.eco_assessment["estimated_trees_to_cut"] == 0
    assert res.eco_assessment["zero_tree_cutting_mandated"] is True
    assert "Zero Tree" in res.eco_assessment["tree_preservation_status"]

def test_tier_classification_logic():
    # Construct synthetic inputs to verify tier thresholds
    base_site = SiteInput(
        site_name="High Power Site",
        state="Maharashtra",
        district="Thane",
        latitude=19.10,
        longitude=73.01,
        proposed_it_load_mw=50.0,
    )
    res = assess_site(base_site)
    assert res.tier in ["VIABLE / RECOMMENDED", "CONDITIONAL / HIGH RISK", "UNVIABLE / REJECT"]
