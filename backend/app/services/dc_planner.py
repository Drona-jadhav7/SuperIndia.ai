"""
Data Center Engineering & Capacity Planner for SuperIndia.ai
Translates target GPU requirements and location parameters into deterministic
electrical, thermodynamic cooling, rack density, and financial infrastructure models.
"""

import math
from typing import Dict, Any, List
from pydantic import BaseModel, Field

# Hardware Specifications (Genuine Manufacturer TDP and Specifications)
HARDWARE_SPECS = {
    "NVIDIA_H100_SXM": {
        "name": "NVIDIA H100 SXM5 (80GB)",
        "gpu_tdp_w": 700.0,
        "gpus_per_server": 8,
        "server_total_draw_kw": 10.2, # HGX chassis with dual Xeon/EPYC, 2TB DDR5, 8x CX7 NICs
        "tflops_fp8": 1979.0,
        "interconnect_type": "NVLink 4 (900 GB/s) + 800Gbps InfiniBand",
        "approx_cost_inr_lakh": 28.5, # per GPU fully configured with server node
    },
    "NVIDIA_B200_NVL72": {
        "name": "NVIDIA Blackwell B200 NVL72",
        "gpu_tdp_w": 1000.0,
        "gpus_per_server": 72, # Liquid-cooled unified rack
        "server_total_draw_kw": 132.0, # Full liquid rack with 18 compute trays & 9 NVSwitch trays
        "tflops_fp8": 4500.0,
        "interconnect_type": "NVLink 5 (1.8 TB/s) + 1.6Tbps Quantum-X800",
        "approx_cost_inr_lakh": 38.0,
    },
    "NVIDIA_L40S": {
        "name": "NVIDIA L40S (48GB Ada Lovelace)",
        "gpu_tdp_w": 350.0,
        "gpus_per_server": 8,
        "server_total_draw_kw": 4.2,
        "tflops_fp8": 733.0,
        "interconnect_type": "PCIe Gen5 + 400Gbps RoCEv2",
        "approx_cost_inr_lakh": 12.0,
    },
    "NVIDIA_A100_SXM": {
        "name": "NVIDIA A100 SXM4 (80GB)",
        "gpu_tdp_w": 400.0,
        "gpus_per_server": 8,
        "server_total_draw_kw": 6.5,
        "tflops_fp8": 624.0,
        "interconnect_type": "NVLink 3 (600 GB/s) + 200Gbps HDR",
        "approx_cost_inr_lakh": 16.0,
    },
}

COOLING_MODES = {
    "DIRECT_TO_CHIP_LIQUID": {
        "name": "Direct-to-Chip (D2C) Liquid Cooling (ASHRAE W40)",
        "base_pue": 1.18,
        "max_rack_density_kw": 80.0,
        "wue_l_kwh": 0.12,
        "capex_premium_pct": 15.0,
    },
    "TOTAL_IMMERSION": {
        "name": "Single/Two-Phase Immersion Tank (Warm-Water Loop)",
        "base_pue": 1.08,
        "max_rack_density_kw": 120.0,
        "wue_l_kwh": 0.02,
        "capex_premium_pct": 25.0,
    },
    "REAR_DOOR_HEAT_EXCHANGER": {
        "name": "Rear Door Heat Exchanger (RDHx) + Chilled Water Loop",
        "base_pue": 1.28,
        "max_rack_density_kw": 45.0,
        "wue_l_kwh": 0.35,
        "capex_premium_pct": 8.0,
    },
    "AIR_COOLED_CRAH": {
        "name": "Traditional Air-Cooled CRAH + Dry Chillers (Zero Water)",
        "base_pue": 1.48,
        "max_rack_density_kw": 18.0,
        "wue_l_kwh": 0.00, # Air cooled systems consume 0.00 L/kWh on-site operational water
        "capex_premium_pct": 0.0,
    },
    "EVAPORATIVE_WET_TOWER": {
        "name": "Water-Cooled Chiller + Evaporative Wet Cooling Towers",
        "base_pue": 1.32,
        "max_rack_density_kw": 25.0,
        "wue_l_kwh": 1.85, # Evaporative wet cooling tower consumption baseline
        "capex_premium_pct": 5.0,
    },
}

class DCPlannerRequest(BaseModel):
    site_name: str = Field("Navi Mumbai Mega Hub", description="Target deployment site")
    state: str = Field("Maharashtra", description="Indian state for tariff & policy computation")
    gpu_model: str = Field("NVIDIA_H100_SXM", description="Target GPU architecture")
    target_gpu_count: int = Field(8192, ge=16, le=65536, description="Number of GPUs to deploy")
    cooling_mode: str = Field("DIRECT_TO_CHIP_LIQUID", description="Cooling technology choice")
    electricity_tariff_inr_per_kwh: float = Field(7.5, description="Power tariff in ₹/kWh")
    ambient_wet_bulb_c: float = Field(26.5, description="Site design wet bulb temperature")

class DCPlannerResponse(BaseModel):
    site_name: str
    state: str
    gpu_model_name: str
    target_gpu_count: int
    cooling_mode_name: str
    
    # IT & Physical Layout
    server_count: int
    total_it_load_mw: float
    rack_count: int
    average_rack_density_kw: float
    
    # Thermodynamics & Facility Power
    computed_pue: float
    total_facility_power_mw: float
    cooling_thermal_load_mw: float
    primary_cooling_loop_flow_lpm: float
    daily_water_demand_mld: float
    substation_capacity_mva: float
    
    # Financial Intelligence (₹ Crore)
    capex_gpu_servers_cr: float
    capex_electrical_infrastructure_cr: float
    capex_cooling_mechanical_cr: float
    capex_civil_building_cr: float
    total_capex_cr: float
    
    annual_power_opex_cr: float
    annual_water_maintenance_opex_cr: float
    total_annual_opex_cr: float
    
    # Performance & Sustainability
    aggregate_compute_pflops_fp8: float
    annual_carbon_footprint_tco2: float
    summary: str

def plan_data_center(req: DCPlannerRequest) -> DCPlannerResponse:
    gpu_spec = HARDWARE_SPECS.get(req.gpu_model, HARDWARE_SPECS["NVIDIA_H100_SXM"])
    cooling_spec = COOLING_MODES.get(req.cooling_mode, COOLING_MODES["DIRECT_TO_CHIP_LIQUID"])

    num_gpus = req.target_gpu_count
    gpus_per_server = gpu_spec["gpus_per_server"]
    server_count = math.ceil(num_gpus / gpus_per_server)

    # 1. IT Load Calculation
    server_draw_kw = gpu_spec["server_total_draw_kw"]
    it_load_kw = server_count * server_draw_kw
    total_it_load_mw = round(it_load_kw / 1000.0, 3)

    # 2. Rack Density & Rack Count
    max_rack_kw = cooling_spec["max_rack_density_kw"]
    if req.gpu_model == "NVIDIA_B200_NVL72":
        # NVL72 is an integrated rack itself
        rack_count = server_count
        avg_rack_kw = server_draw_kw
    else:
        # Number of servers per rack
        servers_per_rack = max(1, math.floor(max_rack_kw / server_draw_kw))
        rack_count = math.ceil(server_count / servers_per_rack)
        avg_rack_kw = round((server_count * server_draw_kw) / max(1, rack_count), 1)

    # 3. Dynamic PUE based on cooling physics & ambient wet-bulb
    wb = req.ambient_wet_bulb_c
    if req.cooling_mode == "TOTAL_IMMERSION":
        # Warm fluid loop (45-50°C) is decoupled from ambient wet bulb
        wb_penalty = max(0.0, (wb - 28.0) * 0.003)
    elif req.cooling_mode == "AIR_COOLED_CRAH":
        # Dry chillers lift penalty under elevated ambient
        wb_penalty = max(0.0, (wb - 24.0) * 0.008)
    else:
        # Evaporative & hybrid D2C cooling tower assist
        wb_penalty = max(0.0, (wb - 24.0) * 0.012)

    computed_pue = round(cooling_spec["base_pue"] + wb_penalty, 3)

    # 4. Total Facility Power & Substation Sizing
    total_facility_power_mw = round(total_it_load_mw * computed_pue, 3)
    cooling_load_mw = round(total_facility_power_mw - total_it_load_mw, 3)

    # Power factor 0.95 with N+1 transformer redundancy (1.25x)
    substation_capacity_mva = round((total_facility_power_mw / 0.95) * 1.25, 1)

    # 5. Cooling Loop Flow Rate (Liters per minute)
    # Q = kW / (4.184 * delta_T). delta_T = 10°C standard for D2C liquid loop
    delta_t = 10.0
    flow_l_per_sec = (total_it_load_mw * 1000.0) / (4.184 * delta_t)
    primary_loop_lpm = round(flow_l_per_sec * 60.0, 1)

    # 6. Water Consumption (MLD)
    # WUE in L/kWh. 1 MW = 1000 kW * 24 h = 24,000 kWh/day
    daily_it_kwh = total_it_load_mw * 1000.0 * 24.0
    daily_water_liters = daily_it_kwh * cooling_spec["wue_l_kwh"]
    daily_water_mld = round(daily_water_liters / 1_000_000.0, 3)

    # 7. CAPEX Calculations (in ₹ Crore)
    # Compute Hardware
    cost_per_gpu_lakh = gpu_spec["approx_cost_inr_lakh"]
    capex_gpu_cr = round((num_gpus * cost_per_gpu_lakh) / 100.0, 2)

    # High-density rack scaling factor (CDUs, heavy busways, seismic structural anchorages)
    density_scaling = 1.0 + max(0.0, (avg_rack_kw - 20.0) / 100.0) * 0.25

    # Facility Electrical (Transformers, Generators, UPS, GIS): ~₹1.75 Cr per Facility MW
    capex_electrical_cr = round(total_facility_power_mw * 1.75 * density_scaling, 2)

    # Facility Mechanical & Liquid Cooling: ~₹1.20 Cr per Facility MW * cooling capex factor
    cooling_factor = (1.0 + (cooling_spec["capex_premium_pct"] / 100.0)) * density_scaling
    capex_mechanical_cr = round(total_facility_power_mw * 1.20 * cooling_factor, 2)

    # Civil Building & Shell: ~₹0.95 Cr per Facility MW
    capex_civil_cr = round(total_facility_power_mw * 0.95, 2)

    total_capex_cr = round(
        capex_gpu_cr + capex_electrical_cr + capex_mechanical_cr + capex_civil_cr, 2
    )

    # 8. Annual OPEX (in ₹ Crore)
    # Annual power = Facility MW * 8760 h * 0.85 (average load factor) * Tariff / 10^7
    annual_kwh = total_facility_power_mw * 1000.0 * 8760.0 * 0.85
    annual_power_cr = round((annual_kwh * req.electricity_tariff_inr_per_kwh) / 10_000_000.0, 2)

    # Water, facilities, maintenance & security ~ ₹0.18 Cr per Facility MW
    annual_maint_cr = round(total_facility_power_mw * 0.18, 2)
    total_annual_opex_cr = round(annual_power_cr + annual_maint_cr, 2)

    # 9. Compute Throughput (PFLOPS FP8)
    aggregate_pflops = round((num_gpus * gpu_spec["tflops_fp8"]) / 1000.0, 1)

    # 10. Carbon footprint (CEA baseline: 0.716 kg CO2 / kWh)
    annual_tco2 = round((annual_kwh * 0.716) / 1000.0, 1)

    summary = (
        f"{num_gpus:,} {gpu_spec['name']} GPUs require {total_it_load_mw:.1f} MW IT load, "
        f"{total_facility_power_mw:.1f} MW facility power (PUE {computed_pue:.2f}) housed across {rack_count} racks. "
        f"Estimated CAPEX is ₹{total_capex_cr:,.1f} Cr with annual power OPEX of ₹{annual_power_cr:,.1f} Cr."
    )

    return DCPlannerResponse(
        site_name=req.site_name,
        state=req.state,
        gpu_model_name=gpu_spec["name"],
        target_gpu_count=num_gpus,
        cooling_mode_name=cooling_spec["name"],
        server_count=server_count,
        total_it_load_mw=total_it_load_mw,
        rack_count=rack_count,
        average_rack_density_kw=avg_rack_kw,
        computed_pue=computed_pue,
        total_facility_power_mw=total_facility_power_mw,
        cooling_thermal_load_mw=cooling_load_mw,
        primary_cooling_loop_flow_lpm=primary_loop_lpm,
        daily_water_demand_mld=daily_water_mld,
        substation_capacity_mva=substation_capacity_mva,
        capex_gpu_servers_cr=capex_gpu_cr,
        capex_electrical_infrastructure_cr=capex_electrical_cr,
        capex_cooling_mechanical_cr=capex_mechanical_cr,
        capex_civil_building_cr=capex_civil_cr,
        total_capex_cr=total_capex_cr,
        annual_power_opex_cr=annual_power_cr,
        annual_water_maintenance_opex_cr=annual_maint_cr,
        total_annual_opex_cr=total_annual_opex_cr,
        aggregate_compute_pflops_fp8=aggregate_pflops,
        annual_carbon_footprint_tco2=annual_tco2,
        summary=summary,
    )
