"""
Pytest unit tests for Land Valuation & Circle Rate Engine.
Verifies:
1. Accurate circle rate and market valuations across Indian states and industrial corridors.
2. Inalienability and zero valuation for protected Wildlife Sanctuaries and National Parks.
3. Agricultural vs industrial zoning price adjustments.
"""

import pytest
from backend.app.services.land_valuation_engine import estimate_authentic_land_cost

def test_land_valuation_gir_wildlife_sanctuary():
    # Gir Wildlife Sanctuary is inalienable forest land
    res = estimate_authentic_land_cost(
        lat=21.1243,
        lon=70.7963,
        state="Gujarat",
        district="Junagadh",
        site_name="Gir Wildlife Sanctuary",
        is_protected_area=True,
    )
    assert res["land_cost_inr_crore_per_acre"] == 0.0
    assert res["is_commercially_purchasable"] is False
    assert "INALIENABLE SANCTUARY LAND" in res["valuation_status"]
    assert "Wildlife (Protection) Act" in res["regulatory_framework"]

def test_land_valuation_navi_mumbai_mahape():
    # Mahape MIDC in Thane / Navi Mumbai
    res = estimate_authentic_land_cost(
        lat=19.1170,
        lon=73.0160,
        state="Maharashtra",
        district="Thane",
        site_name="Mahape MIDC TTC Industrial Area",
        is_protected_area=False,
        is_industrial_zone=True,
    )
    assert res["land_cost_inr_crore_per_acre"] >= 8.0
    assert res["is_commercially_purchasable"] is True
    assert "Premier Data Center Corridor" in res["valuation_status"]

def test_land_valuation_dholera_sir():
    # Dholera Special Investment Region
    res = estimate_authentic_land_cost(
        lat=22.2514,
        lon=72.1965,
        state="Gujarat",
        district="Ahmedabad",
        site_name="Dholera SIR AI Park",
        is_protected_area=False,
        is_industrial_zone=True,
    )
    assert res["land_cost_inr_crore_per_acre"] == 1.8
    assert res["is_commercially_purchasable"] is True
    assert "Greenfield Smart Mega-City" in res["valuation_status"]

def test_land_valuation_bengaluru():
    # Bengaluru Urban (Whitefield / Electronic City)
    res = estimate_authentic_land_cost(
        lat=12.9716,
        lon=77.5946,
        state="Karnataka",
        district="Bengaluru Urban",
        site_name="Whitefield Tech Park",
        is_protected_area=False,
        is_industrial_zone=True,
    )
    assert res["land_cost_inr_crore_per_acre"] >= 7.0
    assert res["is_commercially_purchasable"] is True

def test_land_valuation_noida():
    # Noida Sector 132
    res = estimate_authentic_land_cost(
        lat=28.5020,
        lon=77.3780,
        state="Uttar Pradesh",
        district="Gautam Buddha Nagar",
        site_name="Noida Sector 132",
        is_protected_area=False,
        is_industrial_zone=True,
    )
    assert res["land_cost_inr_crore_per_acre"] >= 7.0
    assert res["is_commercially_purchasable"] is True

def test_land_valuation_agricultural_non_industrial():
    # Non-industrial agricultural parcel
    res = estimate_authentic_land_cost(
        lat=19.8,
        lon=74.5,
        state="Maharashtra",
        district="Ahmednagar",
        site_name="Rural Farm",
        is_protected_area=False,
        is_industrial_zone=False,
    )
    assert res["is_commercially_purchasable"] is True
    assert "Agricultural Circle Rate" in res["valuation_status"]
