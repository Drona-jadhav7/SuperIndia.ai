"""
Pytest unit tests for National AI Compute Demand Forecasting Engine.
Verifies:
1. get_demand_forecast_summary
2. simulate_custom_demand
"""

import pytest
from backend.app.services.demand_forecast_engine import (
    get_demand_forecast_summary,
    simulate_custom_demand,
    TokenDemandSimulatorRequest,
    TokenDemandSimulatorResponse,
)

def test_get_demand_forecast_summary():
    summary = get_demand_forecast_summary()
    assert "timeline" in summary
    assert "regions" in summary
    assert "key_takeaway" in summary
    timeline_2030 = next(t for t in summary["timeline"] if t["year"] == 2030)
    assert timeline_2030["total_gpus_required"] >= 250000

def test_simulate_custom_demand():
    req = TokenDemandSimulatorRequest(
        projected_daily_active_users_million=25.0,
        average_tokens_per_user_daily=1500,
        target_foundation_models_training_per_year=6,
        average_model_parameter_billions=70.0,
    )
    res = simulate_custom_demand(req)
    assert isinstance(res, TokenDemandSimulatorResponse)
    assert res.annual_inference_tokens_trillion > 0
    assert res.total_gpus_required > 0
    assert res.total_power_requirement_mw > 0
    assert res.estimated_capital_outlay_cr > 0
