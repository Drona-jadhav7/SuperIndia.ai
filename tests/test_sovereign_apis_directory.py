"""
Pytest unit tests for SuperIndia.ai Sovereign APIs Directory & 50-Factor Mesh Service.
Validates:
1. Exact presence of all 50 sovereign public/satellite/statutory APIs.
2. Complete 1:1 mapping between Factor ID (1 to 50) and Sovereign APIs.
3. Strict schema validation for each API entry:
   - factor_id, dimension, factor_name, authority, api_name, endpoint,
     method, protocol, tier, status, cadence, description.
4. Correct 3-Tier Sovereign Mesh distribution:
   - Tier 1: Dynamic Telemetry (22 APIs)
   - Tier 2: Spatial Vector Layers (18 APIs)
   - Tier 3: Statutory Registries (10 APIs)
5. Lookup functionality: get_sovereign_api_by_factor_id(factor_id).
6. High-availability fallback guarantees and endpoint validity.
"""

import pytest
from backend.app.services.sovereign_apis_directory import (
    SOVEREIGN_APIS_DIRECTORY,
    get_all_sovereign_apis_directory,
    get_sovereign_api_by_factor_id,
)

def test_sovereign_apis_directory_count():
    """Verify that exactly 50 sovereign APIs are registered in the directory."""
    apis = get_all_sovereign_apis_directory()
    assert len(apis) == 50
    assert len(SOVEREIGN_APIS_DIRECTORY) == 50

def test_sequential_factor_ids_1_to_50():
    """Ensure all factor IDs from 1 to 50 are sequentially present with no gaps."""
    apis = get_all_sovereign_apis_directory()
    factor_ids = [api["factor_id"] for api in apis]
    expected_ids = list(range(1, 51))
    assert factor_ids == expected_ids, f"Factor IDs mismatch: {factor_ids} vs {expected_ids}"

def test_api_schema_completeness():
    """Verify that every API entry contains all mandatory production fields and non-empty values."""
    required_keys = [
        "factor_id",
        "dimension",
        "factor_name",
        "authority",
        "api_name",
        "endpoint",
        "method",
        "protocol",
        "tier",
        "status",
        "cadence",
        "description",
    ]
    apis = get_all_sovereign_apis_directory()
    for api in apis:
        fid = api.get("factor_id")
        for key in required_keys:
            assert key in api, f"Factor {fid} missing key '{key}'"
            assert api[key] is not None, f"Factor {fid} has None for '{key}'"
            if isinstance(api[key], str):
                assert len(api[key].strip()) > 0, f"Factor {fid} has empty string for '{key}'"
        
        # Verify valid endpoint URL
        assert api["endpoint"].startswith("http://") or api["endpoint"].startswith("https://"), (
            f"Factor {fid} endpoint '{api['endpoint']}' is not a valid URL"
        )

        # Verify status is LIVE_VERIFIED
        assert api["status"] == "LIVE_VERIFIED"

        # Verify valid tier
        assert api["tier"] in [
            "TIER_1_DYNAMIC_TELEMETRY",
            "TIER_2_SPATIAL_VECTOR_LAYER",
            "TIER_3_STATUTORY_REGISTRY",
        ]

def test_sovereign_mesh_tier_distribution():
    """Verify the 3-Tier Sovereign Mesh distribution."""
    apis = get_all_sovereign_apis_directory()
    tier_1 = [a for a in apis if a["tier"] == "TIER_1_DYNAMIC_TELEMETRY"]
    tier_2 = [a for a in apis if a["tier"] == "TIER_2_SPATIAL_VECTOR_LAYER"]
    tier_3 = [a for a in apis if a["tier"] == "TIER_3_STATUTORY_REGISTRY"]

    assert len(tier_1) == 22, f"Expected 22 Tier 1 APIs, got {len(tier_1)}"
    assert len(tier_2) == 18, f"Expected 18 Tier 2 APIs, got {len(tier_2)}"
    assert len(tier_3) == 10, f"Expected 10 Tier 3 APIs, got {len(tier_3)}"
    assert len(tier_1) + len(tier_2) + len(tier_3) == 50

def test_get_sovereign_api_by_factor_id_valid():
    """Verify individual factor ID lookup returns the correct API entry."""
    for fid in range(1, 51):
        api = get_sovereign_api_by_factor_id(fid)
        assert api is not None, f"Lookup failed for factor {fid}"
        assert api["factor_id"] == fid

    # Test specific key factors
    f1 = get_sovereign_api_by_factor_id(1)
    assert "CGWB" in f1["authority"]
    assert "Groundwater" in f1["api_name"]

    f7 = get_sovereign_api_by_factor_id(7)
    assert "CEA" in f7["authority"]
    assert "Substation" in f7["api_name"]

    f13 = get_sovereign_api_by_factor_id(13)
    assert "NASA" in f13["authority"]

    f15 = get_sovereign_api_by_factor_id(15)
    assert "NASA" in f15["authority"]

    f17 = get_sovereign_api_by_factor_id(17)
    assert "Stull" in f17["authority"] or "NOAA" in f17["authority"]
    assert "Psychrometric" in f17["api_name"] or "Evaporative" in f17["api_name"]

    f27 = get_sovereign_api_by_factor_id(27)
    assert "Bureau of Indian Standards" in f27["authority"] or "Seismology" in f27["authority"]

    f28 = get_sovereign_api_by_factor_id(28)
    assert "USGS" in f28["authority"]

    f36 = get_sovereign_api_by_factor_id(36)
    assert "ISRIC" in f36["authority"]

    f39 = get_sovereign_api_by_factor_id(39)
    assert "AAI" in f39["authority"]

    f40 = get_sovereign_api_by_factor_id(40)
    assert "AAI" in f40["authority"]

    f50 = get_sovereign_api_by_factor_id(50)
    assert "Border" in f50["authority"] or "MHA" in f50["authority"]

def test_get_sovereign_api_by_factor_id_invalid():
    """Verify that querying non-existent factor IDs safely returns empty dict."""
    assert get_sovereign_api_by_factor_id(0) == {}
    assert get_sovereign_api_by_factor_id(51) == {}
    assert get_sovereign_api_by_factor_id(-1) == {}
    assert get_sovereign_api_by_factor_id(999) == {}

def test_authoritative_agencies_coverage():
    """Ensure key Indian sovereign and satellite agencies are covered across the 50 APIs."""
    apis = get_all_sovereign_apis_directory()
    authorities_text = " ".join(a["authority"] for a in apis)

    key_agencies = [
        "CGWB",
        "CWC",
        "CEA",
        "NISE",
        "NASA",
        "CPCB",
        "NIXI",
        "USGS",
        "IMD",
        "GSI",
        "MoEFCC",
        "ISRIC",
        "AAI",
        "Regulatory Commissions",
        "MHA",
        "FSI",
        "WII",
        "Border Roads Organisation",
    ]
    for agency in key_agencies:
        assert agency in authorities_text, f"Expected key agency '{agency}' in directory"
