"""
Pytest unit tests for Citizen Infrastructure Participation Simulation Engine.
Verifies:
1. get_flagship_projects
2. simulate_citizen_participation
"""

import pytest
from backend.app.services.citizen_financing_engine import (
    get_flagship_projects,
    simulate_citizen_participation,
    CitizenParticipationSimRequest,
    CitizenParticipationSimResponse,
)

def test_get_flagship_projects():
    projects = get_flagship_projects()
    assert isinstance(projects, list)
    assert len(projects) > 0
    p = projects[0]
    assert "project_id" in p
    assert "project_name" in p
    assert "citizen_pool_allocation_cr" in p
    assert "total_capital_outlay_cr" in p

def test_simulate_citizen_participation():
    req = CitizenParticipationSimRequest(
        contribution_amount_inr=50000.0,
        tenure_years=5,
        reinvestment_mode="CASH_DIVIDEND",
    )
    res = simulate_citizen_participation(req)
    assert isinstance(res, CitizenParticipationSimResponse)
    assert res.total_maturity_amount_inr > req.contribution_amount_inr
    assert res.annual_apy_pct > 0.0
    assert res.equivalent_gpus_fraction_backed > 0.0
    assert res.equivalent_power_capacity_watts > 0.0
