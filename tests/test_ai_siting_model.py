"""
Pytest unit tests for SuperIndia.ai AI Precision Siting Model (ai_siting_model.py).
Validates:
1. Mathematical precision and boundary conditions of the TOPSIS Multi-Criteria Algorithm.
2. Non-linear critical foundation bottleneck multiplier triggers (water, power, economics, land, climate, disaster, atmospheric).
3. Compound bottleneck interactions.
4. Precision tier determination.
"""

import pytest
import math
from backend.app.services.ai_siting_model import (
    calculate_topsis_score,
    calculate_bottleneck_multiplier,
    determine_precision_tier,
    CRITICAL_PILLAR_THRESHOLDS,
    BOTTLENECK_EXPONENTS,
)
from backend.app.services.fifty_factor_engine import FACTOR_WEIGHTS


def test_topsis_ideal_solutions():
    """Verify TOPSIS returns 100.0 for positive ideal and 0.0 for negative ideal."""
    perfect_factors = {i: 100.0 for i in range(1, 51)}
    score, d_plus, d_minus = calculate_topsis_score(perfect_factors, FACTOR_WEIGHTS)
    assert score == 100.0
    assert d_plus == 0.0
    assert d_minus > 0.0

    worst_factors = {i: 0.0 for i in range(1, 51)}
    score_worst, d_plus_w, d_minus_w = calculate_topsis_score(worst_factors, FACTOR_WEIGHTS)
    assert score_worst == 0.0
    assert d_plus_w > 0.0
    assert d_minus_w == 0.0


def test_topsis_midpoint_symmetry():
    """Verify TOPSIS returns 50.0 for uniform 50.0 factor scores."""
    mid_factors = {i: 50.0 for i in range(1, 51)}
    score, d_plus, d_minus = calculate_topsis_score(mid_factors, FACTOR_WEIGHTS)
    assert abs(score - 50.0) < 0.1
    assert abs(d_plus - d_minus) < 0.01


def test_topsis_clamping_and_robustness():
    """Verify TOPSIS handles out-of-bound or missing weights gracefully."""
    factors = {i: 150.0 if i % 2 == 0 else -20.0 for i in range(1, 51)}
    score, d_plus, d_minus = calculate_topsis_score(factors, FACTOR_WEIGHTS)
    assert 0.0 <= score <= 100.0
    assert d_plus > 0.0
    assert d_minus > 0.0


def test_water_bottleneck_penalty():
    """Verify severe water stress triggers non-linear fatal bottleneck multiplier."""
    healthy_dims = {
        "water": 85.0,
        "power": 85.0,
        "climate": 75.0,
        "connectivity": 80.0,
        "disaster": 80.0,
        "land": 85.0,
        "economics": 80.0,
        "atmospheric": 90.0,
    }
    mult_healthy, penalties = calculate_bottleneck_multiplier(healthy_dims)
    assert mult_healthy == 1.0
    assert len(penalties) == 0

    water_stressed = dict(healthy_dims, water=30.0)
    mult_water, penalties_water = calculate_bottleneck_multiplier(water_stressed)
    assert mult_water < 1.0
    assert len(penalties_water) == 1
    assert penalties_water[0]["pillar"] == "Water Subsystem"
    expected = (30.0 / CRITICAL_PILLAR_THRESHOLDS["water"]) ** BOTTLENECK_EXPONENTS["water"]
    assert abs(mult_water - expected) < 1e-3


def test_power_bottleneck_penalty():
    """Verify electrical grid deficit (< 50) triggers power bottleneck multiplier."""
    power_deficit = {
        "water": 80.0,
        "power": 25.0,  # Below 50.0 threshold
        "economics": 70.0,
        "land": 70.0,
        "climate": 70.0,
        "disaster": 70.0,
        "atmospheric": 70.0,
    }
    mult, penalties = calculate_bottleneck_multiplier(power_deficit)
    assert mult < 1.0
    assert any(p["pillar"] == "Electrical Grid" for p in penalties)


def test_economics_land_cost_bottleneck():
    """Verify prohibitive land cost and unfavorable tariffs trigger steep economic bottleneck."""
    econ_deficit = {
        "water": 80.0,
        "power": 80.0,
        "economics": 35.0,  # Below 55.0 threshold
        "land": 80.0,
        "climate": 80.0,
        "disaster": 80.0,
        "atmospheric": 80.0,
    }
    mult, penalties = calculate_bottleneck_multiplier(econ_deficit)
    assert mult < 1.0
    assert any("Economics" in p["pillar"] for p in penalties)


def test_compound_bottlenecks():
    """Verify compound bottlenecks apply multiplicative degradation."""
    compound_crisis = {
        "water": 25.0,     # Fails threshold 50
        "power": 20.0,     # Fails threshold 50
        "economics": 30.0, # Fails threshold 55
        "land": 80.0,
        "climate": 80.0,
        "disaster": 80.0,
        "atmospheric": 80.0,
    }
    mult, penalties = calculate_bottleneck_multiplier(compound_crisis)
    assert mult < 0.40
    assert len(penalties) == 3


def test_precision_tier_determination():
    """Verify tier badges, colors, and labels based on score."""
    tier, badge, color = determine_precision_tier(85.0)
    assert "VIABLE" in tier
    assert badge == "VIABLE"
    assert color == "#10B981"

    tier_c, badge_c, color_c = determine_precision_tier(65.0)
    assert "CONDITIONAL" in tier_c
    assert badge_c == "CONDITIONAL"
    assert color_c == "#F59E0B"

    tier_u, badge_u, color_u = determine_precision_tier(45.0)
    assert "UNVIABLE" in tier_u
    assert badge_u == "UNVIABLE"
    assert color_u == "#EF4444"
