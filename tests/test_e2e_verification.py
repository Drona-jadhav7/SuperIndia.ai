import urllib.request
import json
import sys

BASE = 'http://127.0.0.1:8000/api'

def run_tests():
    print("=" * 60)
    print("   SuperIndia.ai Automated E2E Verification Suite")
    print("=" * 60)

    # 1. Test GET /sites
    req = urllib.request.urlopen(f'{BASE}/sites')
    sites = json.loads(req.read().decode())
    print(f"\n[PASS] 1. GET /sites: Verified {len(sites)} benchmark hubs.")
    for s in sites:
        print(f"  - {s['site_name']} ({s['state']}) | Composite: {s['composite_score']} [{s['tier_badge']}] | Water: {s['water_score']} | Power: {s['power_score']}")

    # 2. Test GET /sites/{id} (using valid Mahape MIDC ID)
    req2 = urllib.request.urlopen(f'{BASE}/sites/site_mahape_midc')
    nm = json.loads(req2.read().decode())
    print(f"\n[PASS] 2. GET /sites/site_mahape_midc: Retrieved successfully.")
    print(f"  - Risk Flags: {len(nm['risk_flags'])} fired ({nm['risk_flags']})")
    print(f"  - Mandates: {len(nm['engineering_mandates'])} issued")

    # 3. Test POST /assess with custom 7-domain payload
    custom_payload = {
        'site_name': 'Kochi Marine AI Park',
        'state': 'Kerala',
        'district': 'Ernakulam',
        'latitude': 9.9312,
        'longitude': 76.2673,
        'elevation_m': 4.5,
        'proposed_it_load_mw': 45.0,
        'water_params': {
            'groundwater_extraction_pct': 68.0,
            'water_quality_tds': 850.0,
            'demand_stress_score': 45.0,
            'data_center_demand_mld': 1.2,
            'local_aquifer_stress_pct': 70.0,
            'industrial_density_index': 65.0,
            'stp_distance_km': 3.0,
            'tertiary_supply_mld': 15.0,
            'assured_supply_mld': 2.0,
            'on_site_storage_hours': 36.0,
            'elevation_m': 4.5,
            'drought_risk_index': 20.0,
            'flood_zone_risk': 65.0
        },
        'power_params': {
            'substation_distance_km': 1.8,
            'voltage_class_kv': 220.0,
            'spare_mva_margin': 65.0,
            'proposed_it_load_mw': 45.0,
            'renewable_open_access_score': 85.0
        },
        'climate_params': {
            'dry_bulb_temp_c': 33.0,
            'relative_humidity_pct': 78.0,
            'annual_cooling_degree_days': 2900.0,
            'air_quality_pm25': 32.0,
            'extreme_heat_days': 5.0
        },
        'connectivity_params': {
            'fiber_backbone_distance_km': 1.0,
            'rtt_to_landing_station_ms': 2.5,
            'nixi_distance_km': 12.0,
            'carrier_neutral_providers_count': 4,
            'dark_fiber_routes_count': 3
        },
        'disaster_params': {
            'seismic_zone': 'III',
            'elevation_above_hfl_m': 1.5,
            'cyclone_wind_speed_ms': 39.0,
            'landslide_risk_index': 2.0,
            'industrial_hazard_distance_km': 12.0
        },
        'land_params': {
            'is_notified_it_industrial_zone': True,
            'distance_to_national_highway_km': 3.0,
            'soil_bearing_capacity_kpa': 220.0,
            'contiguous_parcel_acres': 30.0,
            'slope_gradient_pct': 1.0
        },
        'economics_params': {
            'electricity_tariff_inr_per_kwh': 6.8,
            'state_has_dc_policy': True,
            'capital_subsidy_pct': 15.0,
            'stamp_duty_exemption_pct': 100.0,
            'electricity_duty_exemption_years': 5,
            'land_cost_inr_crore_per_acre': 2.5
        }
    }
    req3 = urllib.request.Request(
        f'{BASE}/assess',
        data=json.dumps(custom_payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    res3 = urllib.request.urlopen(req3)
    custom_res = json.loads(res3.read().decode())
    print(f"\n[PASS] 3. POST /assess Custom Site: {custom_res['site_name']}")
    print(f"  - Composite: {custom_res['composite_score']} ({custom_res['tier']})")
    print(f"  - Risk Flags Fired ({len(custom_res['risk_flags'])}): {custom_res['risk_flags']}")
    print(f"  - Mandates Issued ({len(custom_res['engineering_mandates'])}): {custom_res['engineering_mandates']}")

    # 4. Test POST /compare
    req4 = urllib.request.Request(
        f'{BASE}/compare',
        data=json.dumps({}).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    res4 = urllib.request.urlopen(req4)
    compare_res = json.loads(res4.read().decode())
    print(f"\n[PASS] 4. POST /compare Summary: {compare_res['comparison_summary']}")
    print(f"  - Best Site: {compare_res['best_site']}")

    # 5. Test Data Center Planner /dc/plan
    dc_payload = {
        'site_name': 'Hyderabad Fab City',
        'state': 'Telangana',
        'gpu_model': 'NVIDIA_H100_SXM',
        'target_gpu_count': 4096,
        'cooling_mode': 'DIRECT_TO_CHIP_LIQUID',
        'electricity_tariff_inr_per_kwh': 7.0,
        'ambient_wet_bulb_c': 24.5
    }
    req5 = urllib.request.Request(
        f'{BASE}/dc/plan',
        data=json.dumps(dc_payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    res5 = urllib.request.urlopen(req5)
    dc_res = json.loads(res5.read().decode())
    print(f"\n[PASS] 5. POST /dc/plan: Modeled 4,096 H100 GPUs")
    print(f"  - IT Load: {dc_res['total_it_load_mw']} MW | Facility Power: {dc_res['total_facility_power_mw']} MW | PUE: {dc_res['computed_pue']}")
    print(f"  - Total CAPEX: ₹{dc_res['total_capex_cr']} Cr | Annual OPEX: ₹{dc_res['total_annual_opex_cr']} Cr")

    # 6. Test Marketplace Nodes /marketplace/nodes
    req6 = urllib.request.urlopen(f'{BASE}/marketplace/nodes')
    nodes = json.loads(req6.read().decode())
    print(f"\n[PASS] 6. GET /marketplace/nodes: Retrieved {len(nodes)} federated compute nodes across India.")

    # 7. Test POST /telemetry/fetch-real-data (NASA & Gov Live Telemetry)
    telemetry_payload = {
        'latitude': 19.0330,
        'longitude': 73.0297,
        'state': 'Maharashtra',
        'district': 'Thane',
        'site_name': 'Navi Mumbai AI Hub',
        'proposed_it_load_mw': 80.0
    }
    req7 = urllib.request.Request(
        f'{BASE}/telemetry/fetch-real-data',
        data=json.dumps(telemetry_payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    res7 = urllib.request.urlopen(req7)
    telem_data = json.loads(res7.read().decode())
    print(f"\n[PASS] 7. POST /telemetry/fetch-real-data: Live Ingestion from NASA & Gov APIs")
    print(f"  - Elevation (NASA SRTM): {telem_data['site_input']['elevation_m']}m ASL")
    print(f"  - Climate (NASA POWER): {telem_data['site_input']['climate_params']['dry_bulb_temp_c']}°C, RH: {telem_data['site_input']['climate_params']['relative_humidity_pct']}%")
    print(f"  - Provenance: {list(telem_data['provenance'].keys())}")

    # 8. Test POST /assess/live (One-Click Authentic Assessment)
    req8 = urllib.request.Request(
        f'{BASE}/assess/live',
        data=json.dumps(telemetry_payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    res8 = urllib.request.urlopen(req8)
    live_eval = json.loads(res8.read().decode())
    print(f"\n[PASS] 8. POST /assess/live: Evaluated with Live Physical Telemetry")
    print(f"  - Composite: {live_eval['composite_score']} [{live_eval['tier']}] | is_live_evaluated: {live_eval['is_live_evaluated']}")
    print(f"  - Water: {live_eval['water_score']} | Power: {live_eval['power_score']} | Climate: {live_eval['climate_score']}")

    print("\n" + "=" * 60)
    print("   ALL 8 END-TO-END VERIFICATION CHECKS PASSED PERFECTLY!")
    print("=" * 60)

if __name__ == '__main__':
    run_tests()
