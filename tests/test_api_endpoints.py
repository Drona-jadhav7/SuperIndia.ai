"""
Pytest integration tests for all FastAPI endpoints in backend.app.main.
Uses Starlette/FastAPI TestClient for high-speed in-process HTTP verification.
Verifies:
1. Health and discovery endpoints.
2. 7-domain site assessment (/api/assess).
3. Critical scoring accuracy for Gir Wildlife Sanctuary (clamped to 10 - 20 range, UNVIABLE).
4. Zero tree felling and accurate land circle rates.
5. Benchmark retrieval (/api/sites and /api/sites/{id}).
6. Multi-site comparative audit (/api/compare).
7. Live authentic telemetry ingestion (/api/telemetry/fetch-real-data and /api/assess/live).
8. DC engineering planner (/api/dc/hardware and /api/dc/plan).
9. GPU marketplace (/api/marketplace/nodes and /api/marketplace/allocate).
10. National demand forecast (/api/demand/forecast and /api/demand/simulate).
11. Citizen infrastructure financing (/api/citizen/projects and /api/citizen/simulate).
12. Policy matrix (/api/policy/states and /api/policy/india-ai).
13. Environmental ESG engine (/api/eco/assess).
"""

import pytest
from starlette.testclient import TestClient
from backend.app.main import app

@pytest.fixture(scope="module")
def client():
    return TestClient(app)

def test_api_health(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "SuperIndia.ai" in data["service"]

def test_get_benchmark_sites(client):
    res = client.get("/api/sites")
    assert res.status_code == 200
    sites = res.json()
    assert isinstance(sites, list)
    assert len(sites) >= 2
    for s in sites:
        assert "composite_score" in s
        assert "tier" in s

def test_get_site_by_id(client):
    res = client.get("/api/sites/site_mahape_midc")
    assert res.status_code == 200
    data = res.json()
    assert data["site_id"] == "site_mahape_midc"
    assert "Mahape" in data["site_name"]

def test_get_site_by_id_not_found(client):
    res = client.get("/api/sites/non_existent_id_9999")
    assert res.status_code == 404

def test_assess_custom_site_viable(client):
    payload = {
        "site_name": "Sanand GIDC Semiconductor Cluster",
        "state": "Gujarat",
        "district": "Ahmedabad",
        "latitude": 22.9860,
        "longitude": 72.3810,
        "elevation_m": 53.0,
        "proposed_it_load_mw": 80.0,
    }
    res = client.post("/api/assess", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "composite_score" in data
    assert 0 <= data["composite_score"] <= 100

def test_assess_gir_wildlife_sanctuary_score_10_to_20(client):
    """
    CRITICAL USER PROMPT TEST:
    'For example, the place selected is Gir Wildlife Sanctuary, where millions of trees and animals live;
    the score should be directly 10- 20, but instead it is 80...
    Also, mention no trees will be cut if needed; integrate more API's and increase the accuracy of scoring.
    Also, the land cost is not accurate'
    """
    # Query live telemetry for Gir Wildlife Sanctuary
    telem_res = client.post("/api/telemetry/fetch-real-data", json={
        "latitude": 21.1243,
        "longitude": 70.7963,
        "site_name": "Gir Wildlife Sanctuary",
        "state": "Gujarat",
        "district": "Junagadh",
        "proposed_it_load_mw": 50.0,
    })
    assert telem_res.status_code == 200
    telem_data = telem_res.json()
    site_input = telem_data["site_input"]

    # Verify land cost is 0.0 (inalienable sanctuary land)
    assert site_input["economics_params"]["land_cost_inr_crore_per_acre"] == 0.0

    # Assess site
    assess_res = client.post("/api/assess", json=site_input)
    assert assess_res.status_code == 200
    assessment = assess_res.json()

    # 1. Composite score MUST be directly in the 10 - 20 range
    score = assessment["composite_score"]
    assert 10.0 <= score <= 20.0, f"Expected Gir score in 10-20, got {score}"

    # 2. Tier MUST be UNVIABLE / REJECT
    assert assessment["tier"] == "UNVIABLE / REJECT"
    assert assessment["tier_badge"] == "UNVIABLE"

    # 3. Land score must reflect statutory non-conformity
    assert assessment["land_score"] <= 15.0

    # 4. Zero tree felling guaranteed
    assert assessment["eco_assessment"]["estimated_trees_to_cut"] == 0
    assert "no trees will be cut" in assessment["eco_assessment"]["tree_preservation_status"].lower() or "zero tree cutting" in assessment["eco_assessment"]["tree_preservation_status"].lower()

    # 5. Risk flags mention statutory prohibition and millions of trees
    all_flags = " ".join(assessment["risk_flags"]).lower()
    assert "statutory prohibition" in all_flags or "protected" in all_flags

    # 6. Engineering mandates order immediate rejection and zero tree felling
    all_mandates = " ".join(assessment["engineering_mandates"]).lower()
    assert "rejection" in all_mandates or "relocate" in all_mandates
    assert "no trees will be cut" in all_mandates or "zero tree" in all_mandates

def test_compare_sites(client):
    res = client.post("/api/compare", json={"site_ids": ["site_mahape_midc", "site_dholera_sir"]})
    assert res.status_code == 200
    data = res.json()
    assert "ranked_sites" in data
    assert len(data["ranked_sites"]) == 2

def test_dc_planner_endpoints(client):
    # GET /dc/hardware
    hw_res = client.get("/api/dc/hardware")
    assert hw_res.status_code == 200
    assert "hardware_options" in hw_res.json()

    # POST /dc/plan
    plan_payload = {
        "site_name": "Noida Knowledge Park",
        "state": "Uttar Pradesh",
        "gpu_model": "NVIDIA_H100_SXM",
        "target_gpu_count": 2048,
        "cooling_mode": "DIRECT_TO_CHIP_LIQUID",
    }
    plan_res = client.post("/api/dc/plan", json=plan_payload)
    assert plan_res.status_code == 200
    assert plan_res.json()["total_it_load_mw"] > 0

def test_marketplace_endpoints(client):
    # GET /marketplace/nodes
    nodes_res = client.get("/api/marketplace/nodes")
    assert nodes_res.status_code == 200

    # POST /marketplace/allocate
    alloc_payload = {
        "workload_type": "INFERENCE",
        "gpu_model_preferred": "NVIDIA_H100_SXM",
        "gpu_count": 64,
        "duration_hours": 24,
    }
    alloc_res = client.post("/api/marketplace/allocate", json=alloc_payload)
    assert alloc_res.status_code == 200

def test_demand_forecast_endpoints(client):
    # GET /demand/forecast
    f_res = client.get("/api/demand/forecast")
    assert f_res.status_code == 200

    # POST /demand/simulate
    sim_res = client.post("/api/demand/simulate", json={
        "daily_active_users_millions": 10.0,
        "tokens_per_user_daily": 1000,
    })
    assert sim_res.status_code == 200

def test_citizen_financing_endpoints(client):
    # GET /citizen/projects
    p_res = client.get("/api/citizen/projects")
    assert p_res.status_code == 200

    # POST /citizen/simulate
    sim_res = client.post("/api/citizen/simulate", json={
        "investment_inr": 25000.0,
        "tenure_years": 3,
    })
    assert sim_res.status_code == 200

def test_policy_endpoints(client):
    # GET /policy/states
    st_res = client.get("/api/policy/states")
    assert st_res.status_code == 200

    # GET /policy/india-ai
    ai_res = client.get("/api/policy/india-ai")
    assert ai_res.status_code == 200

def test_eco_assess_endpoint(client):
    # POST /eco/assess
    res = client.post("/api/eco/assess", json={
        "latitude": 19.1170,
        "longitude": 73.0160,
        "site_name": "Mahape Eco Test",
        "district": "Thane",
        "state": "Maharashtra",
        "it_load_mw": 50.0,
    })
    assert res.status_code == 200
    data = res.json()
    assert "overall_eco_score" in data


def test_sovereign_apis_directory_endpoint(client):
    """Verify GET /api/telemetry/sovereign-apis-directory returns full 50-API mesh."""
    res = client.get("/api/telemetry/sovereign-apis-directory")
    assert res.status_code == 200
    data = res.json()
    assert data["total_apis"] == 50
    assert data["mesh_status"] == "ONLINE_ACTIVE"
    assert "mesh_tier_distribution" in data
    dist = data["mesh_tier_distribution"]
    assert dist["tier_1_dynamic_telemetry"] == 22
    assert dist["tier_2_spatial_vector_layer"] == 18
    assert dist["tier_3_statutory_registry"] == 10
    assert len(data["apis_directory"]) == 50

    # Also verify non-prefixed resilient route
    res_direct = client.get("/telemetry/sovereign-apis-directory")
    assert res_direct.status_code == 200
    assert res_direct.json()["total_apis"] == 50
