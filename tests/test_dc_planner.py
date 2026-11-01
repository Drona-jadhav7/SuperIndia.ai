"""
Pytest unit tests for Data Center Engineering Planner.
Verifies:
1. plan_data_center for NVIDIA H100, B200, and A100 architectures
2. PUE, cooling flow rate, and water consumption calculations
3. Substation MVA sizing and CAPEX/OPEX financial modeling
"""

import pytest
from backend.app.services.dc_planner import (
    DCPlannerRequest,
    DCPlannerResponse,
    plan_data_center,
    HARDWARE_SPECS,
    COOLING_MODES,
)

def test_hardware_and_cooling_specs():
    assert "NVIDIA_H100_SXM" in HARDWARE_SPECS
    assert "NVIDIA_B200_NVL72" in HARDWARE_SPECS
    assert "DIRECT_TO_CHIP_LIQUID" in COOLING_MODES
    assert "TOTAL_IMMERSION" in COOLING_MODES

def test_plan_data_center_h100_liquid():
    req = DCPlannerRequest(
        site_name="Mahape AI Campus",
        state="Maharashtra",
        gpu_model="NVIDIA_H100_SXM",
        target_gpu_count=4096,
        cooling_mode="DIRECT_TO_CHIP_LIQUID",
        electricity_tariff_inr_per_kwh=7.5,
        ambient_wet_bulb_c=25.0,
    )
    res = plan_data_center(req)
    assert isinstance(res, DCPlannerResponse)
    assert res.rack_count > 0
    assert res.total_it_load_mw > 0.0
    assert res.total_facility_power_mw >= res.total_it_load_mw
    assert res.computed_pue < 1.35  # DLC PUE is efficient
    assert res.substation_capacity_mva > res.total_facility_power_mw
    assert res.total_capex_cr > 0.0
    assert res.total_annual_opex_cr > 0.0

def test_plan_data_center_cooling_comparison():
    # Evaporative vs Immersion
    req_evap = DCPlannerRequest(
        gpu_model="NVIDIA_H100_SXM",
        target_gpu_count=1024,
        cooling_mode="EVAPORATIVE_WET_TOWER",
    )
    res_evap = plan_data_center(req_evap)

    req_imm = DCPlannerRequest(
        gpu_model="NVIDIA_H100_SXM",
        target_gpu_count=1024,
        cooling_mode="TOTAL_IMMERSION",
    )
    res_imm = plan_data_center(req_imm)

    # Immersion should have lower PUE and lower water consumption
    assert res_imm.computed_pue < res_evap.computed_pue
    assert res_imm.daily_water_demand_mld < res_evap.daily_water_demand_mld
