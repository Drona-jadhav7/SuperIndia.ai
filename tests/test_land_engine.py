"""
Pytest unit tests for Land & Civil Infrastructure Siting Engine.
Verifies:
1. calculate_land_assessment
2. Zoning compliance weighting and scoring
3. Highway / heavy logistics corridor distance scoring
4. Safe Soil Bearing Capacity (SBC) curve
5. Contiguous parcel scale sizing
"""

import pytest
from backend.app.models.schemas import LandInput
from backend.app.services.land_engine import calculate_land_assessment, LandAssessmentOutput

def test_calculate_land_assessment_notified_it():
    params = LandInput(
        is_notified_it_industrial_zone=True,
        distance_to_national_highway_km=1.5,
        soil_bearing_capacity_kpa=240.0,
        contiguous_parcel_acres=25.0,
        slope_gradient_pct=1.0,
    )
    res = calculate_land_assessment(params)
    assert isinstance(res, LandAssessmentOutput)
    assert res.land_score >= 90.0
    assert res.zoning_cleared is True
    assert len(res.sub_metrics) == 4

def test_calculate_land_assessment_non_it_zone():
    params = LandInput(
        is_notified_it_industrial_zone=False,
        distance_to_national_highway_km=12.0,
        soil_bearing_capacity_kpa=90.0,
        contiguous_parcel_acres=3.0,
        slope_gradient_pct=5.0,
    )
    res = calculate_land_assessment(params)
    assert res.land_score < 50.0
    assert res.zoning_cleared is False
    # Zoning submetric should be flagged
    zoning_metric = next(sm for sm in res.sub_metrics if sm["key"] == "zoning_compliance")
    assert zoning_metric["flagged"] is True

def test_highway_distance_tiers():
    # <= 2km: 100
    res_close = calculate_land_assessment(LandInput(distance_to_national_highway_km=1.0))
    hwy_close = next(sm for sm in res_close.sub_metrics if sm["key"] == "heavy_logistics_access")
    assert hwy_close["score"] == 100.0

    # > 15km: lower score
    res_far = calculate_land_assessment(LandInput(distance_to_national_highway_km=20.0))
    hwy_far = next(sm for sm in res_far.sub_metrics if sm["key"] == "heavy_logistics_access")
    assert hwy_far["score"] <= 45.0
    assert hwy_far["flagged"] is True

def test_soil_bearing_capacity_tiers():
    # >= 200 kPa: 100
    res_hard = calculate_land_assessment(LandInput(soil_bearing_capacity_kpa=220.0))
    sbc_hard = next(sm for sm in res_hard.sub_metrics if sm["key"] == "soil_bearing_capacity")
    assert sbc_hard["score"] == 100.0

    # < 100 kPa: poor foundation
    res_soft = calculate_land_assessment(LandInput(soil_bearing_capacity_kpa=75.0))
    sbc_soft = next(sm for sm in res_soft.sub_metrics if sm["key"] == "soil_bearing_capacity")
    assert sbc_soft["score"] < 60.0
    assert sbc_soft["flagged"] is True
