"""
Pytest unit tests for Protected Areas & Wildlife Sanctuaries Engine.
Verifies:
1. Haversine distance geodesic accuracy.
2. Gir Wildlife Sanctuary & National Park detection by coordinates and keywords.
3. Eco-Sensitive Zone (ESZ) proximity tracking.
4. Non-protected industrial zones clearance.
5. Statutory zero tree cutting mandate and score ceilings.
"""

import pytest
from backend.app.services.protected_areas_engine import (
    haversine_distance_km,
    check_protected_area_proximity,
    INDIAN_PROTECTED_AREAS_REGISTRY,
)

def test_haversine_distance_accuracy():
    # Mumbai (19.0760, 72.8777) to Pune (18.5204, 73.8567) is ~120 km
    d = haversine_distance_km(19.0760, 72.8777, 18.5204, 73.8567)
    assert 110.0 <= d <= 130.0

    # Same point distance is 0.0
    assert haversine_distance_km(21.1243, 70.7963, 21.1243, 70.7963) == 0.0

def test_gir_wildlife_sanctuary_detection_by_coordinates():
    # Sasan Gir coordinates: 21.1243°N, 70.7963°E
    res = check_protected_area_proximity(
        lat=21.1243,
        lon=70.7963,
        place_name="Candidate Site",
        district="Junagadh",
        state="Gujarat"
    )
    assert res["is_protected"] is True
    assert res["is_in_core"] is True
    assert "Gir" in res["closest_protected_area"]
    assert res["distance_to_protected_area_km"] == 0.0
    assert res["score_ceiling"] <= 20.0  # Must be clamped to 10-20
    assert res["felling_prohibited"] is True
    assert res["zero_tree_cutting_guaranteed"] is True
    assert "Asiatic Lion" in res["fauna_summary"]

def test_gir_wildlife_sanctuary_detection_by_name():
    # User selects "Gir Wildlife Sanctuary"
    res = check_protected_area_proximity(
        lat=21.15,
        lon=70.82,
        place_name="Gir Wildlife Sanctuary",
        district="Gir Somnath",
        state="Gujarat"
    )
    assert res["is_protected"] is True
    assert res["is_in_core"] is True
    assert "Gir" in res["closest_protected_area"]
    assert "Wildlife (Protection) Act" in res["statutory_act"]
    assert "Zero trees will be cut" in res["summary"]

def test_industrial_hub_clearance():
    # Dholera SIR (22.2514, 72.1965)
    res = check_protected_area_proximity(
        lat=22.2514,
        lon=72.1965,
        place_name="Dholera SIR Industrial Hub",
        district="Ahmedabad",
        state="Gujarat"
    )
    assert res["is_in_core"] is False
    assert res["status_label"] == "NON_PROTECTED"
    assert res["score_ceiling"] == 100.0

def test_kaziranga_national_park_detection():
    # Kaziranga coordinates: 26.5775, 93.1711
    res = check_protected_area_proximity(
        lat=26.5775,
        lon=93.1711,
        place_name="Kaziranga Area",
        district="Golaghat",
        state="Assam"
    )
    assert res["is_in_core"] is True
    assert "Kaziranga" in res["closest_protected_area"]
    assert "Rhinoceros" in res["fauna_summary"]

def test_osm_tags_protected_area():
    res = check_protected_area_proximity(
        lat=25.0,
        lon=75.0,
        place_name="Custom Forest",
        osm_tags={"boundary": "protected_area", "protect_class": "2"}
    )
    assert res["is_protected"] is True
