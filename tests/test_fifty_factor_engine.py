"""
Pytest unit tests for the SuperIndia.ai Expanded 50-Factor Siting & Defense Engine.
Validates:
1. Exact statutory weight summation (sum = 1.000 / 100.0%) across all 9 dimensions.
2. Individual non-linear continuous transfer functions (f1 - f50).
3. Hard sovereign veto constraints for Wildlife Sanctuaries (Gir WLS clamped to 10 - 20 range).
4. National defense veto constraints for Border Conflict Zones (Kargil / LoC clamped to 10 - 20 range).
5. High viability scoring for certified industrial corridors (Mahape MIDC, Dholera SIR).
6. Comprehensive structure of all 50 factor output payloads.
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
from backend.app.services.fifty_factor_engine import (
    FACTOR_WEIGHTS,
    DIMENSION_WEIGHTS,
    f1_groundwater_soe,
    f2_water_tds,
    f7_substation_dist,
    f8_voltage_class,
    f17_wet_bulb,
    f27_seismic_zone,
    f38_sbc,
    f48_protected_area,
    f49_tree_canopy,
    f50_border_security,
    calculate_fifty_factor_assessment,
)

def test_fifty_factor_weights_sum_to_one():
    """Verify that all 50 factor weights sum to exactly 1.000."""
    assert len(FACTOR_WEIGHTS) == 50
    total_weight = sum(FACTOR_WEIGHTS.values())
    assert abs(total_weight - 1.000) < 1e-6, f"Weights sum to {total_weight}, expected 1.000"

    # Verify dimensional weight subtotals
    water_weight = sum(FACTOR_WEIGHTS[i] for i in range(1, 7))
    power_weight = sum(FACTOR_WEIGHTS[i] for i in range(7, 15))
    climate_weight = sum(FACTOR_WEIGHTS[i] for i in range(15, 21))
    fiber_weight = sum(FACTOR_WEIGHTS[i] for i in range(21, 27))
    disaster_weight = sum(FACTOR_WEIGHTS[i] for i in range(27, 34))
    land_weight = sum(FACTOR_WEIGHTS[i] for i in range(34, 41))
    economics_weight = sum(FACTOR_WEIGHTS[i] for i in range(41, 46))
    corrosivity_weight = sum(FACTOR_WEIGHTS[i] for i in range(46, 48))
    sovereign_weight = sum(FACTOR_WEIGHTS[i] for i in range(48, 51))

    assert abs(water_weight - DIMENSION_WEIGHTS["water"]) < 1e-6
    assert abs(power_weight - DIMENSION_WEIGHTS["power"]) < 1e-6
    assert abs(climate_weight - DIMENSION_WEIGHTS["climate"]) < 1e-6
    assert abs(fiber_weight - DIMENSION_WEIGHTS["connectivity"]) < 1e-6
    assert abs(disaster_weight - DIMENSION_WEIGHTS["disaster"]) < 1e-6
    assert abs(land_weight - DIMENSION_WEIGHTS["land"]) < 1e-6
    assert abs(economics_weight - DIMENSION_WEIGHTS["economics"]) < 1e-6
    assert abs(corrosivity_weight - DIMENSION_WEIGHTS["atmospheric"]) < 1e-6
    assert abs(sovereign_weight - DIMENSION_WEIGHTS["sovereign_vetoes"]) < 1e-6

def test_individual_transfer_functions():
    """Verify non-linear continuous decay functions for representative factors."""
    # Factor 1: Groundwater SOE
    assert f1_groundwater_soe(50.0) == 100.0
    assert 80.0 <= f1_groundwater_soe(70.0) <= 90.0
    assert f1_groundwater_soe(110.0) <= 25.0

    # Factor 7: Substation distance
    assert f7_substation_dist(0.5) > 95.0
    assert f7_substation_dist(2.0) > 80.0
    assert f7_substation_dist(15.0) <= 35.0

    # Factor 17: Wet Bulb Temperature
    assert f17_wet_bulb(22.0) == 100.0
    assert 70.0 <= f17_wet_bulb(28.0) <= 85.0
    assert f17_wet_bulb(33.0) <= 25.0

    # Factor 27: Seismic Zone
    assert f27_seismic_zone("II") == 100.0
    assert f27_seismic_zone("III") == 80.0
    assert f27_seismic_zone("IV") == 50.0
    assert f27_seismic_zone("V") == 20.0

    # Factor 38: Soil Bearing Capacity
    assert f38_sbc(300.0) == 100.0
    assert 80.0 <= f38_sbc(180.0) <= 90.0
    assert f38_sbc(80.0) <= 40.0

    # Factor 48: Wildlife Sanctuary Proximity
    assert f48_protected_area({"is_in_core": True}) == 0.0
    assert f48_protected_area({"is_in_core": False, "is_in_esz": True}) == 25.0
    assert f48_protected_area({"is_in_core": False, "is_in_esz": False, "distance_to_protected_area_km": 25.0}) == 100.0

    # Factor 49: Tree Canopy
    assert f49_tree_canopy(canopy_pct=75.0, is_notified_non_forest=False, is_core=True) == 0.0
    assert f49_tree_canopy(canopy_pct=2.0, is_notified_non_forest=True, is_core=False) == 100.0

    # Factor 50: Border Security & Conflict
    assert f50_border_security({"national_security_veto": True}) == 0.0
    assert f50_border_security({"national_security_veto": False, "is_border_conflict_zone": True}) == 20.0
    assert f50_border_security({"national_security_veto": False, "is_border_conflict_zone": False, "is_high_altitude": False}) == 100.0

def test_calculate_fifty_factor_gir_sanctuary_veto():
    """Verify Gir Wildlife Sanctuary triggers hard statutory veto clamping score to 10 - 20."""
    site = SiteInput(
        site_name="Gir Wildlife Sanctuary Core",
        state="Gujarat",
        district="Junagadh",
        latitude=21.1243,
        longitude=70.7963,
        elevation_m=280.0,
        proposed_it_load_mw=50.0,
        water_params=WaterInput(groundwater_extraction_pct=65.0),
        power_params=PowerInput(substation_distance_km=22.0, voltage_class_kv=66.0),
        land_params=LandInput(is_notified_it_industrial_zone=False, contiguous_parcel_acres=10.0),
        eco_params=EcoInput(tree_canopy_cover_pct=75.0, is_notified_non_forest=False),
    )
    pa_info = {
        "is_in_core": True,
        "is_in_esz": False,
        "closest_protected_area": "Gir Wildlife Sanctuary & National Park",
        "distance_to_protected_area_km": 0.0,
        "status_label": "CRITICAL HABITAT / CORE SANCTUARY",
    }
    strat_risk = {
        "national_security_veto": False,
        "is_border_conflict_zone": False,
        "is_high_altitude": False,
        "score_ceiling": 100.0,
    }

    res = calculate_fifty_factor_assessment(site, pa_info, strat_risk)

    # Score MUST be in the 10 - 20 range
    assert 10.0 <= res["composite_score"] <= 20.0, f"Got {res['composite_score']}, expected 10-20"
    assert res["tier"] == "UNVIABLE / REJECT"
    assert res["tier_badge"] == "UNVIABLE"
    assert res["tier_color"] == "#EF4444"

    # Factors check
    assert res["total_factors"] == 50
    assert len(res["factors"]) == 50

    factor_48 = next(f for f in res["factors"] if f["id"] == 48)
    assert factor_48["factor_score"] == 0.0
    assert factor_48["status"] == "PROHIBITED"

    factor_49 = next(f for f in res["factors"] if f["id"] == 49)
    assert factor_49["factor_score"] == 0.0
    assert factor_49["status"] == "PROHIBITED"

def test_calculate_fifty_factor_kargil_border_veto():
    """Verify Kargil Border Conflict Zone triggers hard national security defense veto."""
    site = SiteInput(
        site_name="Kargil LoC Defense Sector",
        state="Ladakh",
        district="Kargil",
        latitude=34.5539,
        longitude=76.1349,
        elevation_m=2676.0,
        proposed_it_load_mw=30.0,
        water_params=WaterInput(groundwater_extraction_pct=40.0),
        power_params=PowerInput(substation_distance_km=35.0, voltage_class_kv=33.0),
        land_params=LandInput(is_notified_it_industrial_zone=False),
    )
    pa_info = {
        "is_in_core": False,
        "is_in_esz": False,
        "closest_protected_area": "Karakoram Wildlife Sanctuary",
        "distance_to_protected_area_km": 85.0,
    }
    strat_risk = {
        "national_security_veto": True,
        "is_border_conflict_zone": True,
        "is_high_altitude": True,
        "border_name": "Line of Control (LoC) - Kargil Frontier",
        "score_ceiling": 12.0,
    }

    res = calculate_fifty_factor_assessment(site, pa_info, strat_risk)

    # Score MUST be clamped to 10 - 15 range
    assert 10.0 <= res["composite_score"] <= 15.0, f"Got {res['composite_score']}, expected 10-15"
    assert res["tier"] == "UNVIABLE / REJECT"

    factor_50 = next(f for f in res["factors"] if f["id"] == 50)
    assert factor_50["factor_score"] == 0.0
    assert factor_50["status"] == "PROHIBITED"

def test_calculate_fifty_factor_dholera_viable_hub():
    """Verify Dholera SIR greenfield hub scores in the VIABLE range on the 50-factor matrix."""
    site = SiteInput(
        site_name="Dholera Special Investment Region (SIR)",
        state="Gujarat",
        district="Ahmedabad",
        latitude=22.2514,
        longitude=72.1965,
        elevation_m=12.0,
        proposed_it_load_mw=100.0,
        water_params=WaterInput(
            groundwater_extraction_pct=68.0,
            water_quality_tds=420.0,
            local_aquifer_stress_pct=55.0,
            data_center_demand_mld=1.2,
            tertiary_supply_mld=25.0,
            on_site_storage_hours=72.0,
        ),
        power_params=PowerInput(
            substation_distance_km=1.2,
            voltage_class_kv=400.0,
            spare_mva_margin=150.0,
            renewable_open_access_score=85.0,
        ),
        climate_params=ClimateInput(
            dry_bulb_temp_c=36.0,
            relative_humidity_pct=55.0,
            annual_cooling_degree_days=2600.0,
            air_quality_pm25=42.0,
            extreme_heat_days=8.0,
        ),
        connectivity_params=ConnectivityInput(
            fiber_backbone_distance_km=0.8,
            rtt_to_landing_station_ms=3.8,
            nixi_distance_km=25.0,
            carrier_neutral_providers_count=4,
            dark_fiber_routes_count=3,
        ),
        disaster_params=DisasterInput(
            seismic_zone="III",
            elevation_above_hfl_m=4.5,
            cyclone_wind_speed_ms=39.0,
            landslide_risk_index=2.0,
            industrial_hazard_distance_km=12.0,
        ),
        land_params=LandInput(
            is_notified_it_industrial_zone=True,
            distance_to_national_highway_km=1.5,
            soil_bearing_capacity_kpa=220.0,
            contiguous_parcel_acres=100.0,
        ),
        economics_params=EconomicsInput(
            electricity_tariff_inr_per_kwh=6.8,
            capital_subsidy_pct=25.0,
            electricity_duty_exemption_years=5,
            land_cost_inr_crore_per_acre=1.25,
            state_has_dc_policy=True,
        ),
        eco_params=EcoInput(
            tree_canopy_cover_pct=2.0,
            is_notified_non_forest=True,
            campus_area_acres=100.0,
        ),
    )
    pa_info = {
        "is_in_core": False,
        "is_in_esz": False,
        "closest_protected_area": "Velavadar Blackbuck National Park",
        "distance_to_protected_area_km": 34.0,
        "status_label": "Notified Non-Forest Industrial Land",
    }
    strat_risk = {
        "national_security_veto": False,
        "is_border_conflict_zone": False,
        "is_high_altitude": False,
        "score_ceiling": 100.0,
    }
    telemetry_extras = {
        "substations_count": 4,
        "solar_dni": 720.0,
        "solar_ghi": 5.6,
        "wind_power_density": 280.0,
        "depth_to_bedrock_cm": 110.0,
        "soil_texture_desc": "Clay Loam (28% Clay, 40% Sand, 32% Silt)",
        "fire_station_km": 3.2,
        "hospital_km": 4.5,
        "airport_dist_km": 28.0,
        "airport_name": "Dholera International Airport (Under Dev)",
        "ols_status": "CLEARED (Unrestricted Height Clearance)",
        "isa_corrosivity": "Class G1 (Mild - Standard MERV-13 Filtration)",
    }

    res = calculate_fifty_factor_assessment(site, pa_info, strat_risk, telemetry_extras)

    # Score should be >= 75.0 (VIABLE)
    assert res["composite_score"] >= 75.0, f"Got {res['composite_score']}, expected >= 75.0"
    assert res["tier"] == "VIABLE / RECOMMENDED"
    assert res["tier_badge"] == "VIABLE"
    assert res["tier_color"] == "#10B981"

    # Factors check
    assert res["total_factors"] == 50
    for f in res["factors"]:
        assert "id" in f
        assert "dimension" in f
        assert "name" in f
        assert "metric_key" in f
        assert "value" in f
        assert "factor_score" in f
        assert "weight" in f
        assert "weighted_score" in f
        assert "benchmark" in f
        assert "source" in f
        assert "status" in f
