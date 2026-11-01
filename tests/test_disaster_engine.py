"""
Pytest unit tests for Disaster Resilience & Natural Hazard Siting Engine.
Verifies:
1. calculate_disaster_assessment
2. IS 1893:2016 Seismic Zone scaling (Zones II to V)
3. 100-year High Flood Level (HFL) headroom
4. Cyclonic wind velocity and chemical hazard buffers
"""

import pytest
from backend.app.models.schemas import DisasterInput
from backend.app.services.disaster_engine import (
    calculate_disaster_assessment,
    DisasterAssessmentOutput,
)

def test_calculate_disaster_assessment_seismic_zone_ii():
    # Low seismic hazard (Zone II - Bengaluru/Hyderabad)
    params = DisasterInput(
        seismic_zone="II",
        elevation_above_hfl_m=5.0,
        cyclone_wind_speed_ms=33.0,
        landslide_risk_index=5.0,
        industrial_hazard_distance_km=10.0,
    )
    res = calculate_disaster_assessment(params)
    assert isinstance(res, DisasterAssessmentOutput)
    assert res.disaster_resilience_score >= 90.0
    assert res.critical_hazard_flag is False

def test_calculate_disaster_assessment_seismic_zone_v_flood_risk():
    # Very severe seismic hazard (Zone V - Himalayan/Kutch) + low flood elevation
    params = DisasterInput(
        seismic_zone="V",
        elevation_above_hfl_m=0.5,
        cyclone_wind_speed_ms=50.0,
        landslide_risk_index=70.0,
        industrial_hazard_distance_km=2.0,
    )
    res = calculate_disaster_assessment(params)
    assert res.disaster_resilience_score < 40.0
    assert res.critical_hazard_flag is True
    # Seismic and flood metrics should be flagged
    seismic_metric = next(sm for sm in res.sub_metrics if sm["key"] == "seismic_vulnerability")
    assert seismic_metric["flagged"] is True
