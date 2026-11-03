"""
Pytest unit tests for Live Real-Data Ingestion & Telemetry Service.
Verifies all public functions and data sources:
1. haversine_distance_km
2. calculate_wet_bulb_stull
3. fetch_nasa_power_climatology
4. fetch_nasa_srtm_elevation
5. fetch_atmospheric_air_quality
6. fetch_usgs_seismic_activity
7. reverse_geocode_location
8. evaluate_live_site_telemetry
"""

import pytest
from backend.app.services.live_telemetry_service import (
    haversine_distance_km,
    calculate_wet_bulb_stull,
    fetch_nasa_power_climatology,
    fetch_nasa_srtm_elevation,
    fetch_atmospheric_air_quality,
    fetch_usgs_seismic_activity,
    reverse_geocode_location,
    evaluate_live_site_telemetry,
    fetch_osm_overpass_infrastructure,
    fetch_isric_soilgrids_mechanics,
    fetch_openmeteo_solar_and_renewables,
    evaluate_aeronautical_airspace_buffer,
    evaluate_environmental_corrosivity,
    compile_fifty_factor_telemetry,
)

def test_haversine_distance():
    d = haversine_distance_km(19.1170, 73.0160, 19.1350, 72.8120)
    assert 20.0 <= d <= 25.0

def test_wet_bulb_stull_psychrometrics():
    # 35°C dry-bulb at 70% RH -> wet bulb should be ~29 - 30.5°C
    tw = calculate_wet_bulb_stull(35.0, 70.0)
    assert 29.0 <= tw <= 31.0

    # 25°C at 50% RH -> wet bulb should be ~17 - 19°C
    tw2 = calculate_wet_bulb_stull(25.0, 50.0)
    assert 16.5 <= tw2 <= 19.0

def test_fetch_nasa_power_climatology():
    res = fetch_nasa_power_climatology(19.1170, 73.0160)
    assert "dry_bulb_temp_c" in res
    assert "relative_humidity_pct" in res
    assert "annual_cooling_degree_days" in res
    assert res["dry_bulb_temp_c"] > 0
    assert 0 <= res["relative_humidity_pct"] <= 100

def test_fetch_nasa_srtm_elevation():
    # Mumbai coastal elevation: typically 0-50m
    res = fetch_nasa_srtm_elevation(19.1170, 73.0160)
    assert "elevation_m" in res
    assert isinstance(res["elevation_m"], (int, float))

def test_fetch_atmospheric_air_quality():
    res = fetch_atmospheric_air_quality(19.1170, 73.0160)
    assert "air_quality_pm25" in res
    assert res["air_quality_pm25"] >= 0.0

def test_fetch_usgs_seismic_activity():
    res = fetch_usgs_seismic_activity(19.1170, 73.0160)
    assert "recorded_earthquakes_count" in res
    assert isinstance(res["recorded_earthquakes_count"], int)

def test_reverse_geocode_location_fallback():
    # Gujarat region
    res = reverse_geocode_location(22.25, 72.19)
    assert "state" in res
    assert res["state"] in ["Gujarat", "India"]

def test_evaluate_live_site_telemetry_gir_wildlife_sanctuary():
    # Gir Wildlife Sanctuary live evaluation
    res = evaluate_live_site_telemetry(
        lat=21.1243,
        lon=70.7963,
        site_name="Gir Wildlife Sanctuary",
        state="Gujarat",
        district="Junagadh",
        proposed_it_load_mw=50.0,
    )
    assert "site_input" in res
    assert "provenance" in res
    assert "api_statuses" in res
    inp = res["site_input"]

    # Inalienable sanctuary land cost must be 0.0
    assert inp.economics_params.land_cost_inr_crore_per_acre == 0.0

    # Not an IT industrial zone
    assert inp.land_params.is_notified_it_industrial_zone is False

    # Tree canopy should be high (> 50%)
    assert inp.eco_params.tree_canopy_cover_pct >= 50.0
    assert inp.eco_params.is_notified_non_forest is False
    assert inp.eco_params.distance_to_protected_forest_km == 0.0

    # Provenance contains protected areas and land valuation
    assert "protected_areas" in res["provenance"]
    assert "land_valuation" in res["provenance"]

def test_evaluate_live_site_telemetry_mahape_midc():
    # Mahape MIDC live evaluation
    res = evaluate_live_site_telemetry(
        lat=19.1170,
        lon=73.0160,
        site_name="Mahape MIDC Hub",
        state="Maharashtra",
        district="Thane",
        proposed_it_load_mw=80.0,
    )
    inp = res["site_input"]
    assert inp.land_params.is_notified_it_industrial_zone is True
    assert inp.economics_params.land_cost_inr_crore_per_acre >= 8.0
    assert inp.eco_params.is_notified_non_forest is True

def test_fetch_osm_overpass_infrastructure():
    infra = fetch_osm_overpass_infrastructure(19.1170, 73.0160)
    assert "substations_count_15km" in infra
    assert "fire_station_distance_km" in infra
    assert "hospital_distance_km" in infra
    assert infra["substations_count_15km"] >= 1
    assert infra["fire_station_distance_km"] > 0

def test_fetch_isric_soilgrids_mechanics():
    soil = fetch_isric_soilgrids_mechanics(19.1170, 73.0160)
    assert "depth_to_bedrock_cm" in soil
    assert "computed_sbc_kpa" in soil
    assert "bulk_density_g_cm3" in soil
    assert soil["computed_sbc_kpa"] >= 100.0

def test_fetch_openmeteo_solar_and_renewables():
    renewables = fetch_openmeteo_solar_and_renewables(19.1170, 73.0160)
    assert "solar_dni_w_m2" in renewables
    assert "solar_ghi_kwh_m2_day" in renewables
    assert "wind_power_density_w_m2" in renewables
    assert renewables["solar_dni_w_m2"] > 0

def test_evaluate_aeronautical_airspace_buffer():
    # Mumbai CSMIA proximity check
    aviation = evaluate_aeronautical_airspace_buffer(19.09, 72.87)
    assert aviation["airport_dist_km"] < 10.0
    assert "RESTRICTED" in aviation["ols_status"] or "CONDITIONAL" in aviation["ols_status"]

    # Remote area check
    aviation_remote = evaluate_aeronautical_airspace_buffer(21.8, 71.0)
    assert "ols_status" in aviation_remote

def test_evaluate_environmental_corrosivity():
    corr_industrial = evaluate_environmental_corrosivity(19.1170, 73.0160, 45.0, "Thane", "Maharashtra")
    assert "isa_class" in corr_industrial
    assert "recommendation" in corr_industrial

def test_compile_fifty_factor_telemetry():
    from backend.app.models.schemas import SiteInput
    site = SiteInput(
        site_name="Test Hub",
        state="Maharashtra",
        district="Thane",
        latitude=19.1170,
        longitude=73.0160,
    )
    res = compile_fifty_factor_telemetry(site)
    assert res["total_factors"] == 50
    assert res["total_apis"] == 50
    assert len(res["factors"]) == 50
    assert len(res["apis_directory"]) == 50
    assert "api_name" in res["factors"][0]
    assert "api_tier" in res["factors"][0]
    assert "authority" in res["factors"][0]
    assert res["factors"][0]["id"] == 1
    assert res["factors"][49]["id"] == 50
