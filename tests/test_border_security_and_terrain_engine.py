"""
Pytest unit tests for National Security, Border Conflict & Extreme Terrain Siting Engine.
Verifies:
1. Kargil Sector: Line of Control (LoC) military conflict veto drops score to 10 - 20 range (UNVIABLE).
2. Leh & Eastern Ladakh: LAC & Siachen frontier isolation and high-altitude derating.
3. Tawang Frontier: Forward LAC border defense veto.
4. Logistics & Maintenance: 4-6 month winter road blockades and talent deficit flags.
5. Inland Benchmarks: Navi Mumbai and Dholera SIR remain secure inland (no false vetoes).
"""

import pytest
from backend.app.services.border_security_and_terrain_engine import (
    check_geostrategic_and_terrain_risk,
    SENSITIVE_BORDER_SECTORS,
    REMOTE_TERRAIN_DISTRICTS,
)
from backend.app.services.live_telemetry_service import evaluate_live_site_telemetry
from backend.app.services.aggregator import assess_site

def test_kargil_border_conflict_veto():
    """
    CRITICAL USER REQUIREMENT TEST:
    'it scores well to kargil where there is less conectivity less resources less electcity
    very dificult for maintance as there are less proffesional experts to handle and manage
    it also closer of pakistan to attack and distroy'
    """
    res = check_geostrategic_and_terrain_risk(
        lat=34.5539,
        lon=76.1349,
        place_name="Kargil Town",
        district="Kargil",
        state="Ladakh",
        elevation_m=2758.0,
    )
    assert res["is_border_conflict_zone"] is True
    assert res["national_security_veto"] is True
    assert res["score_ceiling"] <= 15.0
    assert "Pakistan Line of Control" in res["hostile_border_type"]
    assert res["winter_cutoff_months"] >= 4
    assert "Zojila" in res["mountain_pass_closure"]
    assert "UNVIABLE" in res["verdict"]

def test_leh_lac_siachen_veto():
    res = check_geostrategic_and_terrain_risk(
        lat=34.1526,
        lon=77.5771,
        place_name="Leh Campus",
        district="Leh",
        state="Ladakh",
        elevation_m=3500.0,
    )
    assert res["is_border_conflict_zone"] is True
    assert res["national_security_veto"] is True
    assert "Line of Actual Control" in res["hostile_border_type"]
    assert res["score_ceiling"] <= 18.0

def test_tawang_frontier_veto():
    res = check_geostrategic_and_terrain_risk(
        lat=27.5861,
        lon=91.8653,
        place_name="Tawang Valley",
        district="Tawang",
        state="Arunachal Pradesh",
        elevation_m=2900.0,
    )
    assert res["is_border_conflict_zone"] is True
    assert res["national_security_veto"] is True
    assert "Sela Pass" in res["mountain_pass_closure"]

def test_secure_inland_metro_no_veto():
    # Navi Mumbai TTC Industrial Area
    res_mumbai = check_geostrategic_and_terrain_risk(
        lat=19.1558,
        lon=73.0031,
        place_name="Navi Mumbai TTC",
        district="Thane",
        state="Maharashtra",
        elevation_m=15.0,
    )
    assert res_mumbai["national_security_veto"] is False
    assert res_mumbai["is_border_conflict_zone"] is False
    assert res_mumbai["score_ceiling"] == 100.0

    # Dholera SIR
    res_dholera = check_geostrategic_and_terrain_risk(
        lat=22.2514,
        lon=72.1965,
        place_name="Dholera SIR AI Park",
        district="Ahmedabad",
        state="Gujarat",
        elevation_m=12.0,
    )
    assert res_dholera["national_security_veto"] is False
    assert res_dholera["is_border_conflict_zone"] is False
    assert res_dholera["score_ceiling"] == 100.0

def test_kargil_full_site_assessment_clamped_to_10_to_20():
    """
    Verifies that when Kargil is evaluated end-to-end through the live telemetry
    and aggregator pipeline, its score drops to the unviable 10 - 20 range,
    flagging national defense, road blockades, and talent deficits.
    """
    tel = evaluate_live_site_telemetry(
        lat=34.5539,
        lon=76.1349,
        state="Ladakh",
        district="Kargil",
        site_name="Kargil Town",
    )
    res = assess_site(tel["site_input"])

    # Composite score MUST be in the 10 - 20 range
    assert 10.0 <= res.composite_score <= 20.0
    assert res.tier_badge == "UNVIABLE"
    assert res.strategic_security_assessment is not None
    assert res.strategic_security_assessment["national_security_veto"] is True

    # Risk Flags must include national defense, logistics, and talent pool warnings
    flag_text = " ".join(res.risk_flags)
    assert "NATIONAL SECURITY VETO" in flag_text
    assert "LOGISTICS & MAINTENANCE ISOLATION" in flag_text
    assert "SPECIALIZED WORKFORCE & TALENT DEFICIT" in flag_text
    assert "SUB-ZERO THERMODYNAMIC" in flag_text
