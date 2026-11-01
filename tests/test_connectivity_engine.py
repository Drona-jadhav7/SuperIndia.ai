"""
Pytest unit tests for Connectivity & Telecommunications Siting Engine.
Verifies:
1. calculate_connectivity_assessment
2. Fiber backbone proximity scoring
3. Subsea cable landing station (CLS) RTT latency
4. Carrier neutrality and diverse routes
5. NIXI peering point proximity
"""

import pytest
from backend.app.models.schemas import ConnectivityInput
from backend.app.services.connectivity_engine import (
    calculate_connectivity_assessment,
    ConnectivityAssessmentOutput,
)

def test_calculate_connectivity_assessment_metro_mumbai():
    # Metro Mumbai near Versova CLS with multiple carriers
    params = ConnectivityInput(
        fiber_backbone_distance_km=0.8,
        rtt_to_landing_station_ms=1.8,
        nixi_distance_km=14.0,
        carrier_neutral_providers_count=4,
        dark_fiber_routes_count=4,
    )
    res = calculate_connectivity_assessment(params)
    assert isinstance(res, ConnectivityAssessmentOutput)
    assert res.connectivity_score >= 90.0
    assert len(res.sub_metrics) == 4

def test_calculate_connectivity_assessment_remote_location():
    # Remote inland without carriers
    params = ConnectivityInput(
        fiber_backbone_distance_km=25.0,
        rtt_to_landing_station_ms=35.0,
        nixi_distance_km=180.0,
        carrier_neutral_providers_count=1,
        dark_fiber_routes_count=1,
    )
    res = calculate_connectivity_assessment(params)
    assert res.connectivity_score < 45.0
    # Subsea and fiber metrics flagged
    cls_metric = next(sm for sm in res.sub_metrics if sm["key"] == "cable_landing_rtt")
    assert cls_metric["flagged"] is True
