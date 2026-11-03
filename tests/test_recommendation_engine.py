"""
Unit tests for Geospatial Sovereign Alternative Recommendation Engine.
Verifies:
1. Low-scoring or vetoed sites (e.g., Gir Wildlife Sanctuary) trigger high-viability nearby recommendations.
2. Already optimal sites (score >= 80) do not trigger unnecessary relocation suggestions.
3. Utility ranking selects the best balance of geographic proximity and score improvement.
"""

import pytest
from backend.app.services.recommendation_engine import (
    haversine_distance_km,
    find_nearby_recommended_sites,
    VERIFIED_AI_HUBS_CATALOG,
)
from backend.app.models.schemas import SiteInput
from backend.app.services.aggregator import assess_site

def test_haversine_distance():
    # Distance between Mumbai (19.0760, 72.8777) and Pune (18.5204, 73.8567) is ~120 km
    d = haversine_distance_km(19.0760, 72.8777, 18.5204, 73.8567)
    assert 115.0 <= d <= 125.0, f"Expected distance ~120 km, got {d}"

def test_gir_sanctuary_recommends_viable_gujarat_cluster():
    # Gir Wildlife Sanctuary: (21.1243, 70.7963)
    best_alt, nearby = find_nearby_recommended_sites(
        current_lat=21.1243,
        current_lon=70.7963,
        current_score=15.0,
        is_vetoed=True,
        current_state="Gujarat",
    )
    assert best_alt is not None, "Expected a recommended alternative for Gir Wildlife Sanctuary"
    assert best_alt.state == "Gujarat", f"Expected Gujarat cluster, got {best_alt.state}"
    assert best_alt.composite_score >= 85.0, f"Expected high score >= 85, got {best_alt.composite_score}"
    assert best_alt.score_delta > 60.0, f"Expected massive score gain, got {best_alt.score_delta}"
    assert best_alt.distance_km < 300.0, f"Expected distance < 300 km, got {best_alt.distance_km}"
    assert len(nearby) >= 1
    assert "power" in best_alt.why_better
    assert "environment" in best_alt.why_better

def test_optimal_site_returns_no_recommendation():
    # Dholera SIR has score > 88.0, un-vetoed
    best_alt, nearby = find_nearby_recommended_sites(
        current_lat=22.2500,
        current_lon=72.2000,
        current_score=89.4,
        is_vetoed=False,
        current_state="Gujarat",
    )
    assert best_alt is None, "Optimal site must not trigger relocation recommendation"
    assert len(nearby) == 0

def test_aggregator_integration_with_recommendations():
    # Assess Gir Wildlife Sanctuary which drops score directly to 10-20 (Statutory Veto)
    site = SiteInput(
        site_id="test_gir_sanctuary",
        site_name="Gir Wildlife Sanctuary",
        state="Gujarat",
        district="Junagadh",
        latitude=21.1243,
        longitude=70.7963,
        elevation_m=50.0,
        proposed_it_load_mw=50.0,
    )
    site.water_params.groundwater_extraction_pct = 75.0

    assessment = assess_site(site)
    assert assessment.composite_score <= 25.0, f"Expected vetoed score <= 25.0, got {assessment.composite_score}"
    assert assessment.recommended_alternative is not None, "Vetoed site must have recommended_alternative"
    assert assessment.recommended_alternative.composite_score > 80.0
    assert assessment.recommended_alternative.score_delta > 50.0
    assert len(assessment.nearby_alternatives) >= 1
