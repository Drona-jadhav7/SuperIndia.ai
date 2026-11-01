"""
Pytest unit tests for Government & State Policy Intelligence Engine.
Verifies:
1. get_all_state_policies
2. get_india_ai_mission_summary
"""

import pytest
from backend.app.services.policy_engine import (
    get_all_state_policies,
    get_india_ai_mission_summary,
)

def test_get_all_state_policies():
    policies = get_all_state_policies()
    assert isinstance(policies, list)
    assert len(policies) >= 6
    states = [p["state"] for p in policies]
    assert "Gujarat" in states
    assert "Maharashtra" in states
    assert "Uttar Pradesh" in states
    assert "Telangana" in states

def test_get_india_ai_mission_summary():
    summary = get_india_ai_mission_summary()
    assert "program_name" in summary
    assert "budget_outlay_inr_cr" in summary
    assert summary["target_sovereign_gpus"] >= 10000
