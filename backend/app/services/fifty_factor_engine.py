"""
SuperIndia.ai - Expanded 50-Factor Siting & Defense Core Engine
Authoritative Mathematical Scoring Framework across 9 Physical & Sovereign Dimensions.

Each of the 50 factors is evaluated against real-world data and statutory baselines
with exact non-linear transfer functions, continuous utility curves, explicit statutory weights (summing to 1.000),
and hard sovereign veto constraints (Wildlife Protection Act 1972 & MHA National Security Vetoes).
"""

import math
from typing import Dict, Any, List, Optional, Tuple
from backend.app.models.schemas import SiteInput
from backend.app.services.ai_siting_model import calculate_topsis_score, calculate_bottleneck_multiplier, determine_precision_tier


# ============================================================================
# 1. Statutory Factor Weights Matrix (Total Sum = 1.000 / 100.0%)
# ============================================================================
FACTOR_WEIGHTS: Dict[int, float] = {
    # Dimension 1: Water Subsystem & Hydro-Geology (Sum = 0.180 / 18.0%)
    1: 0.040,   # Stage of Groundwater Extraction (SOE %)
    2: 0.025,   # Total Dissolved Solids (TDS mg/L)
    3: 0.025,   # Local Aquifer Stress & Depletion Category
    4: 0.030,   # Data Center Cooling Water Demand (WUE)
    5: 0.035,   # Tertiary Treated Recycled Greywater Supply (STP)
    6: 0.025,   # Dedicated Emergency On-Site Water Buffer (Hours)

    # Dimension 2: Electrical Grid & Clean Energy (Sum = 0.200 / 20.0%)
    7: 0.040,   # Distance to Nearest 400kV/220kV EHV Substation
    8: 0.040,   # Grid Interconnection Voltage Class
    9: 0.035,   # Substation N-1 Spare Transformer Headroom
    10: 0.020,  # Mapped Physical Substations Density (15 km)
    11: 0.025,  # Renewable Open Access & Green Corridor Access
    12: 0.015,  # Direct Normal Irradiance (DNI W/m²)
    13: 0.015,  # Global Horizontal Irradiance (GHI kWh/m²/day)
    14: 0.010,  # Wind Power Density at 100m Hub Height (W/m²)

    # Dimension 3: Climate & Psychrometrics (Sum = 0.130 / 13.0%)
    15: 0.025,  # Annual Peak Design Dry-Bulb Temperature
    16: 0.015,  # Annual Peak Design Relative Humidity
    17: 0.040,  # Psychrometric Wet-Bulb Temperature
    18: 0.020,  # Annual Cooling Degree Days (CDD 18.3°C)
    19: 0.015,  # Annual Extreme Heat Days (>42°C)
    20: 0.015,  # Atmospheric Particulate Load (PM2.5)

    # Dimension 4: Telecom & Optical Fiber Backbone (Sum = 0.120 / 12.0%)
    21: 0.020,  # Terrestrial Distance to Subsea CLS
    22: 0.030,  # Subsea Gateway Optical Round-Trip Time (RTT)
    23: 0.020,  # Distance to Nearest NIXI Internet Exchange
    24: 0.020,  # Carrier-Neutral Tier-1 Telco Providers Count
    25: 0.015,  # Physically Diverse Dark Fiber Conduits
    26: 0.015,  # Metro Internet Exchange & Peering Density

    # Dimension 5: Physical Hazards & Disaster Resilience (Sum = 0.080 / 8.0%)
    27: 0.020,  # BIS IS 1893:2016 Seismic Zone & Ground Motion
    28: 0.010,  # 250 km Historical Seismic Events (M >= 3.5)
    29: 0.020,  # Elevation Margin above 100-Year High Flood Level
    30: 0.010,  # Basic 50-Year Cyclone Wind Velocity
    31: 0.005,  # Landslide Hazard Susceptibility Index
    32: 0.010,  # Distance to Operational Municipal Fire Station
    33: 0.005,  # Distance to Emergency Tertiary Hospital

    # Dimension 6: Civil Infrastructure & Soil Mechanics (Sum = 0.070 / 7.0%)
    34: 0.015,  # Notified IT/Industrial Zone Certification
    35: 0.012,  # Distance to National Highway / Expressway
    36: 0.008,  # Depth to Hard Bedrock from Surface
    37: 0.005,  # Soil Mechanical Texture Composition
    38: 0.015,  # Safe Soil Bearing Capacity (SBC)
    39: 0.005,  # Distance to Civil/Defense Airport
    40: 0.010,  # Aeronautical Obstacle Limitation Surface (OLS)

    # Dimension 7: Economics, Tariffs & State Policy (Sum = 0.070 / 7.0%)
    41: 0.025,  # Industrial High-Tension (HT) Electricity Tariff
    42: 0.012,  # State Capital Investment Subsidy
    43: 0.010,  # Industrial Electricity Duty Exemption Duration
    44: 0.010,  # Official Land Acquisition Circle Rate
    45: 0.013,  # State Data Center Policy & Single-Window Clearance

    # Dimension 8: Atmospheric Chemistry & Corrosivity (Sum = 0.030 / 3.0%)
    46: 0.015,  # Distance to Major Chemical / Refinery Hazards
    47: 0.015,  # ISA-71.04 Electronics Gaseous Corrosivity Level

    # Dimension 9: Sovereign Strategic Vetoes (Sum = 0.120 / 12.0%)
    48: 0.040,  # Wildlife Sanctuary / National Park Proximity
    49: 0.040,  # Tree Canopy Density & Zero-Deforestation Ban
    50: 0.040,  # Hostile Border Proximity & Winter Snowbound Cutoff
}

# Dimension weight definitions for assertion and validation
DIMENSION_WEIGHTS: Dict[str, float] = {
    "water": 0.180,
    "power": 0.200,
    "climate": 0.130,
    "connectivity": 0.120,
    "disaster": 0.080,
    "land": 0.070,
    "economics": 0.070,
    "atmospheric": 0.030,
    "sovereign_vetoes": 0.120,
}

# Verify weights sum exactly to 1.000
assert abs(sum(FACTOR_WEIGHTS.values()) - 1.000) < 1e-6, "Factor weights must sum to exactly 1.000"

DIMENSION_SLICES: Dict[str, List[int]] = {
    "water": list(range(1, 7)),
    "power": list(range(7, 15)),
    "climate": list(range(15, 21)),
    "connectivity": list(range(21, 27)),
    "disaster": list(range(27, 34)),
    "land": list(range(34, 41)),
    "economics": list(range(41, 46)),
    "atmospheric": [46, 47],
    "sovereign_vetoes": [48, 49, 50],
}

for dim, fids in DIMENSION_SLICES.items():
    assert abs(sum(FACTOR_WEIGHTS[fid] for fid in fids) - DIMENSION_WEIGHTS[dim]) < 1e-6, (
        f"Dimension {dim} weight sum ({sum(FACTOR_WEIGHTS[fid] for fid in fids)}) != target ({DIMENSION_WEIGHTS[dim]})"
    )


# ============================================================================
# 2. Mathematical Utility Functions for the 50 Siting Factors
# ============================================================================

def f1_groundwater_soe(soe_pct: float, tertiary_supply_mld: float = 0.0) -> float:
    """Factor 1: Stage of Groundwater Extraction (CGWB baseline, with tertiary treated offset)."""
    if soe_pct <= 60.0:
        base = 100.0
    elif soe_pct <= 70.0:
        base = 100.0 - (soe_pct - 60.0) * 1.5
    elif soe_pct <= 90.0:
        base = 85.0 - ((soe_pct - 70.0) / 20.0) * 35.0
    elif soe_pct <= 100.0:
        base = 50.0 - ((soe_pct - 90.0) / 10.0) * 25.0
    else:
        base = max(0.0, 25.0 - (soe_pct - 100.0) * 1.5)

    if tertiary_supply_mld >= 15.0:
        return max(base, 80.0)
    elif tertiary_supply_mld >= 5.0:
        return max(base, 65.0)
    return base

def f2_water_tds(tds: float) -> float:
    """Factor 2: Total Dissolved Solids (BIS 10500 standard)."""
    if tds <= 300.0:
        return 100.0
    elif tds <= 500.0:
        return 100.0 - ((tds - 300.0) / 200.0) * 15.0
    elif tds <= 1000.0:
        return 85.0 - ((tds - 500.0) / 500.0) * 35.0
    else:
        return max(15.0, 50.0 - ((tds - 1000.0) / 1000.0) * 30.0)

def f3_aquifer_stress(stress_pct: float) -> float:
    """Factor 3: Local Competing Aquifer Draft & Industrial Stress Index."""
    if stress_pct <= 50.0:
        return 100.0
    elif stress_pct <= 70.0:
        return 100.0 - ((stress_pct - 50.0) / 20.0) * 20.0
    elif stress_pct <= 90.0:
        return 80.0 - ((stress_pct - 70.0) / 20.0) * 35.0
    else:
        return max(15.0, 45.0 - ((stress_pct - 90.0) / 10.0) * 25.0)

def f4_water_demand(demand_mld: float, it_load_mw: float) -> float:
    """Factor 4: Projected DC Cooling Demand & WUE compliance."""
    ratio = demand_mld / max(1.0, it_load_mw)
    if ratio <= 0.025:
        return 100.0
    elif ratio <= 0.040:
        return 90.0 - ((ratio - 0.025) / 0.015) * 15.0
    else:
        return max(35.0, 75.0 - ((ratio - 0.040) / 0.030) * 35.0)

def f5_tertiary_water(supply_mld: float) -> float:
    """Factor 5: Tertiary Recycled Treated Effluent Availability (STP)."""
    if supply_mld >= 20.0:
        return 100.0
    elif supply_mld >= 10.0:
        return 80.0 + ((supply_mld - 10.0) / 10.0) * 20.0
    elif supply_mld >= 2.0:
        return 45.0 + ((supply_mld - 2.0) / 8.0) * 35.0
    else:
        return max(20.0, (supply_mld / 2.0) * 45.0)

def f6_storage_hours(hours: float) -> float:
    """Factor 6: Dedicated On-Site Emergency Storage Buffer (72h target)."""
    if hours >= 72.0:
        return 100.0
    elif hours >= 48.0:
        return 75.0 + ((hours - 48.0) / 24.0) * 25.0
    elif hours >= 24.0:
        return 45.0 + ((hours - 24.0) / 24.0) * 30.0
    else:
        return max(10.0, (hours / 24.0) * 45.0)

def f7_substation_dist(dist_km: float) -> float:
    """Factor 7: Distance to 400kV/220kV EHV Substation."""
    if dist_km <= 1.0:
        return 100.0
    elif dist_km <= 2.5:
        return 100.0 - ((dist_km - 1.0) / 1.5) * 15.0
    elif dist_km <= 5.0:
        return 85.0 - ((dist_km - 2.5) / 2.5) * 20.0
    elif dist_km <= 10.0:
        return 65.0 - ((dist_km - 5.0) / 5.0) * 35.0
    else:
        return max(0.0, 30.0 - (dist_km - 10.0) * 6.0)

def f8_voltage_class(kv: float) -> float:
    """Factor 8: Grid Interconnection Voltage Class."""
    if kv >= 400.0:
        return 100.0
    elif kv >= 220.0:
        return 85.0 + min(15.0, (kv - 220.0) * 0.08)
    elif kv >= 132.0:
        return 70.0 + min(15.0, (kv - 132.0) * 0.17)
    elif kv >= 66.0:
        return 50.0 + min(20.0, (kv - 66.0) * 0.30)
    else:
        return max(15.0, (kv / 33.0) * 45.0)

def f9_spare_mva(spare_mva: float, it_load_mw: float) -> float:
    """Factor 9: Substation Spare N-1 Transformer Headroom."""
    req = it_load_mw * 1.2
    ratio = spare_mva / max(1.0, req)
    if ratio >= 1.5:
        return 100.0
    elif ratio >= 1.0:
        return 85.0 + (ratio - 1.0) * 30.0
    elif ratio >= 0.5:
        return 50.0 + (ratio - 0.5) * 70.0
    else:
        return max(15.0, ratio * 100.0)

def f10_substations_density(count: int) -> float:
    """Factor 10: Mapped Physical Substations Density within 15 km."""
    if count >= 4:
        return 100.0
    elif count == 3:
        return 90.0
    elif count == 2:
        return 80.0
    elif count == 1:
        return 60.0
    else:
        return 20.0

def f11_renewable_open_access(score: float) -> float:
    """Factor 11: Renewable Open Access & Green Corridor Access."""
    return round(max(0.0, min(100.0, score)), 2)

def f12_solar_dni(dni: float) -> float:
    """Factor 12: Direct Normal Irradiance (DNI W/m²)."""
    if dni >= 750.0:
        return 100.0
    elif dni >= 650.0:
        return 85.0 + ((dni - 650.0) / 100.0) * 15.0
    else:
        return max(30.0, (dni / 650.0) * 85.0)

def f13_solar_ghi(ghi: float) -> float:
    """Factor 13: Global Horizontal Irradiance (GHI kWh/m²/day)."""
    if ghi >= 5.5:
        return 100.0
    elif ghi >= 4.8:
        return 80.0 + ((ghi - 4.8) / 0.7) * 20.0
    else:
        return max(30.0, (ghi / 4.8) * 80.0)

def f14_wind_density(density: float) -> float:
    """Factor 14: Wind Power Density at 100m Hub Height (W/m²)."""
    if density >= 300.0:
        return 100.0
    elif density >= 200.0:
        return 75.0 + ((density - 200.0) / 100.0) * 25.0
    else:
        return max(20.0, (density / 200.0) * 75.0)

def f15_dry_bulb(t: float) -> float:
    """Factor 15: Annual Peak Design Dry-Bulb Temperature (°C)."""
    if t <= 30.0:
        return 100.0
    elif t <= 36.0:
        return 100.0 - ((t - 30.0) / 6.0) * 18.0
    elif t <= 42.0:
        return 82.0 - ((t - 36.0) / 6.0) * 32.0
    else:
        return max(15.0, 50.0 - (t - 42.0) * 6.0)

def f16_relative_humidity(rh: float) -> float:
    """Factor 16: Annual Peak Design Relative Humidity (% RH)."""
    if 45.0 <= rh <= 65.0:
        return 100.0
    elif 35.0 <= rh < 45.0 or 65.0 < rh <= 75.0:
        return 85.0
    elif 25.0 <= rh < 35.0 or 75.0 < rh <= 85.0:
        return 65.0
    else:
        return 40.0

def f17_wet_bulb(tw: float) -> float:
    """Factor 17: Psychrometric Wet-Bulb Temperature (°C) calibrated for modern DLC liquid cooling."""
    if tw <= 24.0:
        return 100.0
    elif tw <= 28.0:
        return 100.0 - ((tw - 24.0) / 4.0) * 20.0
    elif tw <= 31.0:
        return 80.0 - ((tw - 28.0) / 3.0) * 35.0
    elif tw <= 33.5:
        return 45.0 - ((tw - 31.0) / 2.5) * 25.0
    else:
        return max(15.0, 20.0 - (tw - 33.5) * 3.0)

# Exported alias for psychrometric testing
f17_wet_bulb_temp = f17_wet_bulb

def f18_cdd(cdd: float) -> float:
    """Factor 18: Annual Cooling Degree Days (CDD base 18.3°C)."""
    if cdd <= 2200.0:
        return 100.0
    elif cdd <= 3000.0:
        return 100.0 - ((cdd - 2200.0) / 800.0) * 25.0
    else:
        return max(30.0, 75.0 - ((cdd - 3000.0) / 1000.0) * 35.0)

def f19_extreme_heat_days(days: float) -> float:
    """Factor 19: Annual Extreme Heat Days (>42°C)."""
    if days <= 5.0:
        return 100.0
    elif days <= 15.0:
        return 100.0 - ((days - 5.0) / 10.0) * 25.0
    else:
        return max(20.0, 75.0 - (days - 15.0) * 2.5)

def f20_pm25(pm25: float) -> float:
    """Factor 20: Atmospheric Particulate Matter (PM2.5 in µg/m³) with positive-pressure MERV filtration."""
    if pm25 <= 30.0:
        return 100.0
    elif pm25 <= 60.0:
        return 100.0 - ((pm25 - 30.0) / 30.0) * 20.0
    elif pm25 <= 120.0:
        return 80.0 - ((pm25 - 60.0) / 60.0) * 30.0
    else:
        return max(30.0, 50.0 - (pm25 - 120.0) * 0.15)

def f21_cls_dist(dist_km: float) -> float:
    """Factor 21: Terrestrial Distance to Nearest Subsea CLS."""
    if dist_km <= 30.0:
        return 100.0
    elif dist_km <= 100.0:
        return 90.0 - ((dist_km - 30.0) / 70.0) * 20.0
    elif dist_km <= 500.0:
        return 70.0 - ((dist_km - 100.0) / 400.0) * 25.0
    else:
        return max(25.0, 45.0 - ((dist_km - 500.0) / 1000.0) * 20.0)

def f22_cls_rtt(rtt_ms: float) -> float:
    """Factor 22: Subsea Gateway Optical RTT Latency via high-speed optical expressways."""
    if rtt_ms <= 4.0:
        return 100.0
    elif rtt_ms <= 10.0:
        return 100.0 - ((rtt_ms - 4.0) / 6.0) * 18.0
    elif rtt_ms <= 20.0:
        return 82.0 - ((rtt_ms - 10.0) / 10.0) * 22.0
    else:
        return max(30.0, 60.0 - (rtt_ms - 20.0) * 1.5)

def f23_nixi_dist(dist_km: float) -> float:
    """Factor 23: Distance to Nearest NIXI Internet Exchange."""
    if dist_km <= 20.0:
        return 100.0
    elif dist_km <= 50.0:
        return 100.0 - ((dist_km - 20.0) / 30.0) * 20.0
    else:
        return max(25.0, 80.0 - (dist_km - 50.0) * 0.5)

def f24_carriers_count(count: int) -> float:
    """Factor 24: Carrier-Neutral Tier-1 Telco Providers Count."""
    if count >= 4:
        return 100.0
    elif count == 3:
        return 85.0
    elif count == 2:
        return 65.0
    else:
        return 40.0

def f25_dark_fiber_routes(count: int) -> float:
    """Factor 25: Physically Diverse Dark Fiber Conduits Count."""
    if count >= 3:
        return 100.0
    elif count == 2:
        return 75.0
    else:
        return 45.0

def f26_peering_density(desc: str) -> float:
    """Factor 26: Metro Internet Exchange & Peering Interconnection Density."""
    d = desc.lower()
    if "multi" in d or "extreme" in d or "ams" in d or "de-cix" in d:
        return 100.0
    elif "active" in d or "nixi" in d:
        return 85.0
    else:
        return 50.0

def f27_seismic_zone(zone: str) -> float:
    """Factor 27: BIS IS 1893:2016 Seismic Zone & Ground Motion."""
    z = zone.strip().upper()
    if z == "II":
        return 100.0
    elif z == "III":
        return 80.0
    elif z == "IV":
        return 50.0
    elif z == "V":
        return 20.0
    return 70.0

def f28_seismic_history(events_count: int) -> float:
    """Factor 28: 250 km Historical Seismic Events (M >= 3.5)."""
    if events_count == 0:
        return 100.0
    elif events_count <= 3:
        return 85.0
    elif events_count <= 10:
        return 65.0
    else:
        return max(20.0, 50.0 - events_count * 2.0)

def f29_hfl_headroom(m: float) -> float:
    """Factor 29: Elevation Margin above 100-Year High Flood Level (HFL)."""
    if m >= 5.0:
        return 100.0
    elif m >= 3.0:
        return 85.0 + ((m - 3.0) / 2.0) * 15.0
    elif m >= 1.0:
        return 55.0 + ((m - 1.0) / 2.0) * 30.0
    else:
        return max(15.0, m * 55.0)

def f30_cyclone_wind(ws: float) -> float:
    """Factor 30: Basic 50-Year Cyclone Wind Speed (m/s)."""
    if ws <= 33.0:
        return 100.0
    elif ws <= 39.0:
        return 100.0 - ((ws - 33.0) / 6.0) * 15.0
    elif ws <= 47.0:
        return 85.0 - ((ws - 39.0) / 8.0) * 25.0
    else:
        return max(20.0, 60.0 - (ws - 47.0) * 3.0)

def f31_landslide_risk(index: float) -> float:
    """Factor 31: Landslide Hazard & Slope Instability Index."""
    if index <= 10.0:
        return 100.0
    elif index <= 30.0:
        return 100.0 - ((index - 10.0) / 20.0) * 25.0
    else:
        return max(15.0, 75.0 - (index - 30.0) * 1.5)

def f32_fire_station_dist(km: float) -> float:
    """Factor 32: Distance to Operational Municipal Fire Station (km)."""
    if km <= 3.5:
        return 100.0
    elif km <= 7.0:
        return 100.0 - ((km - 3.5) / 3.5) * 25.0
    elif km <= 15.0:
        return 75.0 - ((km - 7.0) / 8.0) * 35.0
    else:
        return max(20.0, 40.0 - (km - 15.0) * 2.0)

def f33_hospital_dist(km: float) -> float:
    """Factor 33: Distance to Nearest Emergency Tertiary Hospital (km)."""
    if km <= 5.0:
        return 100.0
    elif km <= 12.0:
        return 100.0 - ((km - 5.0) / 7.0) * 25.0
    else:
        return max(25.0, 75.0 - (km - 12.0) * 2.0)

def f34_zoning_clearance(is_notified: bool) -> float:
    """Factor 34: Notified IT/Industrial Zone Certification."""
    return 100.0 if is_notified else 35.0

def f35_highway_dist(km: float) -> float:
    """Factor 35: Distance to National Highway / Expressway (km)."""
    if km <= 2.0:
        return 100.0
    elif km <= 5.0:
        return 100.0 - ((km - 2.0) / 3.0) * 15.0
    elif km <= 15.0:
        return 85.0 - ((km - 5.0) / 10.0) * 35.0
    else:
        return max(20.0, 50.0 - (km - 15.0) * 2.0)

def f36_bedrock_depth(cm: float) -> float:
    """Factor 36: Depth to Hard Bedrock from Ground Surface (cm)."""
    if 80.0 <= cm <= 150.0:
        return 100.0
    elif 150.0 < cm <= 250.0:
        return 90.0 - ((cm - 150.0) / 100.0) * 20.0
    elif cm < 80.0:
        return 85.0  # Very shallow rock requires blasting
    else:
        return max(40.0, 70.0 - ((cm - 250.0) / 200.0) * 30.0)

def f37_soil_texture(desc: str) -> float:
    """Factor 37: Soil Mechanical Texture Composition."""
    d = desc.lower()
    if "basalt" in d or "murrum" in d or "clay loam" in d:
        return 100.0
    elif "silt" in d or "sand" in d:
        return 80.0
    elif "marine" in d or "alluvium" in d or "marsh" in d:
        return 45.0
    return 85.0

def f38_sbc(kpa: float) -> float:
    """Factor 38: Safe Soil Bearing Capacity (SBC in kN/m²)."""
    if kpa >= 220.0:
        return 100.0
    elif kpa >= 180.0:
        return 80.0 + ((kpa - 180.0) / 40.0) * 20.0
    elif kpa >= 120.0:
        return 50.0 + ((kpa - 120.0) / 60.0) * 30.0
    else:
        return max(0.0, (kpa / 120.0) * 50.0)

# Exported alias for geotechnical testing
f38_soil_bearing_capacity = f38_sbc

def f39_airport_dist(km: float) -> float:
    """Factor 39: Distance to Nearest Civil/Military Airport (km)."""
    if km >= 18.0:
        return 100.0
    elif km >= 10.0:
        return 80.0 + ((km - 10.0) / 8.0) * 20.0
    elif km >= 5.0:
        return 50.0 + ((km - 5.0) / 5.0) * 30.0
    else:
        return max(20.0, (km / 5.0) * 50.0)

def f40_ols_clearance(status: str) -> float:
    """Factor 40: Aeronautical Obstacle Limitation Surface (OLS Clearance)."""
    s = status.upper()
    if "CLEARED" in s:
        return 100.0
    elif "CONDITIONAL" in s:
        return 80.0
    else:
        return 35.0

def f41_tariff(inr: float) -> float:
    """Factor 41: Industrial High-Tension (HT) Electricity Tariff (₹/kWh)."""
    if inr <= 6.5:
        return 100.0
    elif inr <= 7.5:
        return 100.0 - ((inr - 6.5) / 1.0) * 20.0
    elif inr <= 9.0:
        return 80.0 - ((inr - 7.5) / 1.5) * 35.0
    else:
        return max(20.0, 45.0 - (inr - 9.0) * 10.0)

def f42_capital_subsidy(pct: float) -> float:
    """Factor 42: State Capital Investment Subsidy on Fixed Assets (%)."""
    if pct >= 25.0:
        return 100.0
    elif pct >= 15.0:
        return 80.0 + ((pct - 15.0) / 10.0) * 20.0
    elif pct >= 5.0:
        return 60.0 + ((pct - 5.0) / 10.0) * 20.0
    else:
        return max(30.0, (pct / 5.0) * 60.0)

def f43_duty_waiver(years: int) -> float:
    """Factor 43: Industrial Electricity Duty Exemption Duration (Years)."""
    if years >= 10:
        return 100.0
    elif years >= 5:
        return 80.0 + ((years - 5) / 5.0) * 20.0
    else:
        return max(40.0, (years / 5.0) * 80.0)

def f44_land_cost(inr_cr: float) -> float:
    """Factor 44: Official Land Acquisition Circle Rate (₹ Cr / Acre)."""
    if inr_cr == 0.0:
        return 5.0  # Inalienable sanctuary / forest land
    elif 0.5 <= inr_cr <= 4.0:
        return 100.0
    elif inr_cr <= 8.0:
        return 100.0 - ((inr_cr - 4.0) / 4.0) * 20.0
    elif inr_cr <= 15.0:
        return 80.0 - ((inr_cr - 8.0) / 7.0) * 30.0
    elif inr_cr <= 25.0:
        return 50.0 - ((inr_cr - 15.0) / 10.0) * 35.0
    else:
        return max(2.0, 15.0 - ((inr_cr - 25.0) / 25.0) * 13.0)

def f45_dc_policy(has_policy: bool) -> float:
    """Factor 45: State Data Center Policy & Single-Window Clearance."""
    return 100.0 if has_policy else 50.0

def f46_mah_hazard(km: float) -> float:
    """Factor 46: Distance to Major Accident Hazard Chemical & Refinery Plants (km)."""
    if km >= 10.0:
        return 100.0
    elif km >= 5.0:
        return 80.0 + ((km - 5.0) / 5.0) * 20.0
    elif km >= 2.0:
        return 50.0 + ((km - 2.0) / 3.0) * 30.0
    else:
        return max(15.0, (km / 2.0) * 50.0)

def f47_corrosivity(isa_class: str) -> float:
    """Factor 47: ISA-71.04 Electronics Gaseous Corrosivity Level."""
    s = isa_class.upper()
    if "G1" in s:
        return 100.0
    elif "G2" in s:
        return 75.0
    elif "G3" in s:
        return 45.0
    else:
        return 20.0

def f48_wildlife_proximity(dist_km: float = 25.0, is_core: bool = False, is_esz: bool = False, **kwargs) -> float:
    """Factor 48: Wildlife Sanctuary / National Park Proximity & Buffer Zone."""
    if is_core:
        return 0.0
    elif is_esz:
        return 25.0
    elif dist_km >= 10.0:
        return 100.0
    elif dist_km >= 5.0:
        return 60.0 + ((dist_km - 5.0) / 5.0) * 40.0
    else:
        return max(0.0, dist_km * 12.0)

def f48_protected_area(pa_info: Any, **kwargs) -> float:
    """Factor 48 wrapper accepting dictionary or direct arguments."""
    if isinstance(pa_info, dict):
        return f48_wildlife_proximity(
            dist_km=pa_info.get("distance_to_protected_area_km", 25.0),
            is_core=pa_info.get("is_in_core", False),
            is_esz=pa_info.get("is_in_esz", False),
        )
    return f48_wildlife_proximity(pa_info, **kwargs)

def f49_tree_canopy(canopy_pct: float, is_notified_non_forest: bool, is_core: bool) -> float:
    """Factor 49: Tree Canopy Density & Statutory Zero-Deforestation Felling Ban.
    Rule: Any place where there are more trees should NOT be scored well!"""
    if is_core:
        return 0.0
    # Even if claimed non-forest, if there are trees, felling is required and must be penalized
    if canopy_pct <= 5.0 and is_notified_non_forest:
        return 100.0  # Master-planned non-forest industrial land (0 trees cut)
    elif canopy_pct <= 5.0:
        return 85.0
    elif canopy_pct <= 10.0:
        return round(80.0 - ((canopy_pct - 5.0) / 5.0) * 25.0, 2)
    elif canopy_pct <= 20.0:
        return round(55.0 - ((canopy_pct - 10.0) / 10.0) * 30.0, 2)
    elif canopy_pct <= 40.0:
        return round(25.0 - ((canopy_pct - 20.0) / 20.0) * 20.0, 2)
    else:
        return max(0.0, round(5.0 - (canopy_pct - 40.0) * 0.1, 2))

def f50_border_security(strat_risk: Optional[Any] = None, **kwargs) -> float:
    """Factor 50: Hostile Border Proximity & Winter Snowbound Logistics Cutoff."""
    data = {}
    if strat_risk is not None:
        if isinstance(strat_risk, dict):
            data.update(strat_risk)
        elif isinstance(strat_risk, (int, float)):
            data["dist_km"] = float(strat_risk)
    data.update(kwargs)
    if data.get("national_security_veto", False):
        return 0.0
    elif data.get("is_border_conflict_zone", False):
        dist = data.get("dist_km", 45.0)
        return 20.0 if dist <= 50.0 else 35.0
    elif data.get("is_high_altitude", False):
        return 35.0
    return 100.0


# ============================================================================
# 3. Master 50-Factor Evaluation & Dimension Aggregator
# ============================================================================

def calculate_fifty_factor_assessment(
    site: SiteInput,
    pa_info: Dict[str, Any],
    strat_risk: Dict[str, Any],
    telemetry_extras: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Evaluates all 50 physical, geotechnical, environmental, and strategic factors.
    Computes dimension-level scores, applies statutory hard vetoes,
    and returns the definitive composite feasibility score and 50-factor telemetry report.
    """
    wp = site.water_params
    pp = site.power_params
    cp = site.climate_params
    conn = site.connectivity_params
    dp = site.disaster_params
    lp = site.land_params
    ep = site.economics_params

    extras = telemetry_extras or {}
    substations_count = extras.get("substations_count_15km", extras.get("substations_count", 3))
    solar_dni = extras.get("solar_dni_w_m2", extras.get("solar_dni", 720.0))
    solar_ghi = extras.get("solar_ghi_kwh_m2_day", extras.get("solar_ghi", 5.4))
    wind_power_density = extras.get("wind_power_density_w_m2", extras.get("wind_power_density", 240.0))
    depth_to_bedrock_cm = extras.get("depth_to_bedrock_cm", 120.0)
    soil_texture_desc = extras.get("soil_texture_desc", "Clay Loam (28% Clay, 40% Sand, 32% Silt)")
    fire_station_km = extras.get("fire_station_distance_km", extras.get("fire_station_km", 3.8))
    hospital_km = extras.get("hospital_distance_km", extras.get("hospital_km", 4.2))
    airport_dist_km = extras.get("airport_dist_km", 24.5)
    airport_name = extras.get("airport_name", "Nearest Major Airport")
    ols_status = extras.get("ols_status", "CLEARED (Outside Airport Funnel Surface)")
    isa_corrosivity = extras.get("isa_corrosivity", "Class G1 (Mild - Standard Filtration)")
    cls_dist_km = extras.get("cls_dist_km", 25.0)

    # Compute Wet-Bulb from Dry-Bulb & RH
    t, rh = cp.dry_bulb_temp_c, cp.relative_humidity_pct
    twb = round(
        t * math.atan(0.151977 * math.sqrt(rh + 8.313659))
        + math.atan(t + rh)
        - math.atan(rh - 1.676331)
        + 0.00391838 * (rh ** 1.5) * math.atan(0.023101 * rh)
        - 4.686035,
        2,
    )

    canopy_pct = getattr(site.eco_params, "tree_canopy_cover_pct", 3.0) if site.eco_params else 3.0
    is_non_forest = getattr(site.eco_params, "is_notified_non_forest", True) if site.eco_params else True
    is_core_sanctuary = pa_info.get("is_in_core", False)
    is_esz_site = pa_info.get("is_in_esz", False)
    trees_cut = 0 if is_non_forest else int(canopy_pct * 12)

    # 1. Evaluate Individual Factor Scores (0.0 to 100.0)
    scores: Dict[int, float] = {
        1: round(f1_groundwater_soe(wp.groundwater_extraction_pct, wp.tertiary_supply_mld), 2),
        2: round(f2_water_tds(wp.water_quality_tds), 2),
        3: round(f3_aquifer_stress(wp.local_aquifer_stress_pct), 2),
        4: round(f4_water_demand(wp.data_center_demand_mld, site.proposed_it_load_mw), 2),
        5: round(f5_tertiary_water(wp.tertiary_supply_mld), 2),
        6: round(f6_storage_hours(wp.on_site_storage_hours), 2),

        7: round(f7_substation_dist(pp.substation_distance_km), 2),
        8: round(f8_voltage_class(pp.voltage_class_kv), 2),
        9: round(f9_spare_mva(pp.spare_mva_margin, site.proposed_it_load_mw), 2),
        10: round(f10_substations_density(substations_count), 2),
        11: round(f11_renewable_open_access(pp.renewable_open_access_score), 2),
        12: round(f12_solar_dni(solar_dni), 2),
        13: round(f13_solar_ghi(solar_ghi), 2),
        14: round(f14_wind_density(wind_power_density), 2),

        15: round(f15_dry_bulb(cp.dry_bulb_temp_c), 2),
        16: round(f16_relative_humidity(cp.relative_humidity_pct), 2),
        17: round(f17_wet_bulb(twb), 2),
        18: round(f18_cdd(cp.annual_cooling_degree_days), 2),
        19: round(f19_extreme_heat_days(cp.extreme_heat_days), 2),
        20: round(f20_pm25(cp.air_quality_pm25), 2),

        21: round(f21_cls_dist(cls_dist_km), 2),
        22: round(f22_cls_rtt(conn.rtt_to_landing_station_ms), 2),
        23: round(f23_nixi_dist(conn.nixi_distance_km), 2),
        24: round(f24_carriers_count(conn.carrier_neutral_providers_count), 2),
        25: round(f25_dark_fiber_routes(conn.dark_fiber_routes_count), 2),
        26: round(f26_peering_density(extras.get("peering_density", "Active")), 2),

        27: round(f27_seismic_zone(dp.seismic_zone), 2),
        28: round(f28_seismic_history(extras.get("recorded_earthquakes_count", 0)), 2),
        29: round(f29_hfl_headroom(dp.elevation_above_hfl_m), 2),
        30: round(f30_cyclone_wind(dp.cyclone_wind_speed_ms), 2),
        31: round(f31_landslide_risk(dp.landslide_risk_index), 2),
        32: round(f32_fire_station_dist(fire_station_km), 2),
        33: round(f33_hospital_dist(hospital_km), 2),

        34: round(f34_zoning_clearance(lp.is_notified_it_industrial_zone), 2),
        35: round(f35_highway_dist(lp.distance_to_national_highway_km), 2),
        36: round(f36_bedrock_depth(depth_to_bedrock_cm), 2),
        37: round(f37_soil_texture(soil_texture_desc), 2),
        38: round(f38_sbc(lp.soil_bearing_capacity_kpa), 2),
        39: round(f39_airport_dist(airport_dist_km), 2),
        40: round(f40_ols_clearance(ols_status), 2),

        41: round(f41_tariff(ep.electricity_tariff_inr_per_kwh), 2),
        42: round(f42_capital_subsidy(ep.capital_subsidy_pct), 2),
        43: round(f43_duty_waiver(ep.electricity_duty_exemption_years), 2),
        44: round(f44_land_cost(ep.land_cost_inr_crore_per_acre), 2),
        45: round(f45_dc_policy(ep.state_has_dc_policy), 2),

        46: round(f46_mah_hazard(dp.industrial_hazard_distance_km), 2),
        47: round(f47_corrosivity(isa_corrosivity), 2),

        48: round(f48_protected_area(pa_info), 2),
        49: round(f49_tree_canopy(canopy_pct, is_non_forest, is_core_sanctuary), 2),
        50: round(f50_border_security(strat_risk), 2),
    }

    # 2. Compute Dimension Aggregations
    dim_slices = {
        "water": list(range(1, 7)),
        "power": list(range(7, 15)),
        "climate": list(range(15, 21)),
        "connectivity": list(range(21, 27)),
        "disaster": list(range(27, 34)),
        "land": list(range(34, 41)),
        "economics": list(range(41, 46)),
        "atmospheric": [46, 47],
        "sovereign_vetoes": [48, 49, 50],
    }

    dim_scores: Dict[str, float] = {}
    for dim_name, factor_ids in dim_slices.items():
        sub_weights = sum(FACTOR_WEIGHTS[fid] for fid in factor_ids)
        weighted_sum = sum(scores[fid] * FACTOR_WEIGHTS[fid] for fid in factor_ids)
        dim_scores[dim_name] = round(weighted_sum / sub_weights, 1)

    # 3. Compute Multi-Criteria Decision & AI Calibrated Composite Score
    raw_composite = sum(scores[fid] * FACTOR_WEIGHTS[fid] for fid in range(1, 51))
    
    # 3a. TOPSIS Relative Closeness to Ideal Hyperscale Facility
    topsis_score, d_plus, d_minus = calculate_topsis_score(scores, FACTOR_WEIGHTS)
    
    # 3b. Non-Linear Critical Pillar Bottleneck Multiplier
    bottleneck_mult, bottleneck_penalties = calculate_bottleneck_multiplier(dim_scores)

    # Tree Canopy & Deforestation Bottleneck Multiplier: Any place where there are more trees should NOT be scored well!
    if canopy_pct > 10.0:
        bottleneck_mult *= max(0.05, (100.0 - canopy_pct) / 90.0) ** 0.75
    
    # Fatal Economic & Land acquisition cost veto for hyper-dense metros (e.g. South Mumbai)
    land_cost = getattr(site.economics_params, "land_cost_inr_crore_per_acre", 1.5)
    parcel_acres = getattr(site.land_params, "contiguous_parcel_acres", 50.0)
    if land_cost >= 30.0 or (land_cost >= 15.0 and parcel_acres <= 10.0):
        bottleneck_mult *= 0.60
        bottleneck_penalties.append({
            "pillar": "Prohibitive Metro Land Acquisition",
            "score": round(dim_scores.get("economics", 0.0), 1),
            "threshold": 50.0,
            "penalty_factor": 0.60,
            "reason": f"Astronomical commercial land cost (₹{land_cost:.1f} Cr/Acre) renders hyperscale AI compute unviable",
        })
        dim_scores["economics"] = min(dim_scores.get("economics", 50.0), 30.0)
        dim_scores["land"] = min(dim_scores.get("land", 50.0), 35.0)

    # 3c. Calibrated Precision Synthesis (25% TOPSIS geometric variance + 75% Weighted baseline * Bottleneck Multiplier)
    calibrated_base = (0.25 * topsis_score) + (0.75 * raw_composite)
    composite_score = round(calibrated_base * bottleneck_mult, 1)

    # Land Dimension & Tree Canopy Downward Clamping
    if is_core_sanctuary:
        dim_scores["land"] = min(dim_scores["land"], 10.0)
        dim_scores["sovereign_vetoes"] = min(dim_scores["sovereign_vetoes"], 5.0)
    elif canopy_pct >= 40.0:
        dim_scores["land"] = min(dim_scores["land"], 15.0)
        dim_scores["sovereign_vetoes"] = min(dim_scores["sovereign_vetoes"], 12.0)
        composite_score = round(min(composite_score, 22.0), 1)
    elif canopy_pct >= 20.0:
        dim_scores["land"] = min(dim_scores["land"], 35.0)
        dim_scores["sovereign_vetoes"] = min(dim_scores["sovereign_vetoes"], 30.0)
        composite_score = round(min(composite_score, 48.0), 1)
    elif canopy_pct >= 10.0:
        dim_scores["land"] = min(dim_scores["land"], 55.0)
        dim_scores["sovereign_vetoes"] = min(dim_scores["sovereign_vetoes"], 55.0)
        composite_score = round(min(composite_score, 65.0), 1)

    # 4. Apply Hard Sovereign Veto Constraints (Statutory Overrides)
    # VETO 1: Core Wildlife Sanctuary / National Park (e.g. Gir Wildlife Sanctuary)
    if is_core_sanctuary:
        composite_score = round(min(composite_score, 14.5), 1)
        dim_scores["sovereign_vetoes"] = 5.0
        dim_scores["land"] = min(dim_scores["land"], 12.0)
        dim_scores["power"] = min(dim_scores["power"], 20.0)
        dim_scores["connectivity"] = min(dim_scores["connectivity"], 20.0)

    # VETO 2: Hostile Border Conflict / Fragile Isolated Terrain (e.g. Kargil / LoC / LAC)
    if strat_risk.get("national_security_veto", False):
        composite_score = round(min(composite_score, 12.0), 1)
        dim_scores["sovereign_vetoes"] = 5.0
        dim_scores["land"] = min(dim_scores["land"], 15.0)
        dim_scores["power"] = min(dim_scores["power"], 22.0)
        dim_scores["connectivity"] = min(dim_scores["connectivity"], 22.0)
        dim_scores["disaster"] = min(dim_scores["disaster"], 40.0)
        dim_scores["climate"] = min(dim_scores["climate"], 40.0)

    # VETO 3: Eco-Sensitive Zone (ESZ Buffer)
    if is_esz_site and not is_core_sanctuary:
        composite_score = round(min(composite_score, 52.0), 1)
        dim_scores["land"] = min(dim_scores["land"], 35.0)

    # 5. Determine Classification Tier
    tier, tier_badge, tier_color = determine_precision_tier(composite_score)

    # 6. Build Detailed Factor Output Records (1..50)
    meta_info: Dict[int, Dict[str, str]] = {
        1: {"dim": "Water Subsystem", "name": "Groundwater Stage of Extraction (SOE %)", "key": "groundwater_extraction_pct", "val": f"{wp.groundwater_extraction_pct:.1f}%", "bench": "<= 70% (Safe per CGWB)", "src": "Central Ground Water Board (CGWB)"},
        2: {"dim": "Water Subsystem", "name": "Total Dissolved Solids (TDS)", "key": "water_quality_tds", "val": f"{wp.water_quality_tds:.0f} mg/L", "bench": "<= 500 mg/L (BIS 10500)", "src": "Bureau of Indian Standards IS 10500"},
        3: {"dim": "Water Subsystem", "name": "Local Aquifer Stress & Depletion Category", "key": "local_aquifer_stress_pct", "val": f"{wp.local_aquifer_stress_pct:.1f}%", "bench": "<= 65% Industrial Draft Allowance", "src": "Ministry of Jal Shakti / India-WRIS"},
        4: {"dim": "Water Subsystem", "name": "Data Center Cooling Water Demand", "key": "data_center_demand_mld", "val": f"{wp.data_center_demand_mld:.2f} MLD", "bench": "WUE <= 0.4 L/kWh (Closed-Loop Liquid)", "src": "ASHRAE TC 9.9 & D2C Model"},
        5: {"dim": "Water Subsystem", "name": "Tertiary Recycled Greywater Supply (STP)", "key": "tertiary_supply_mld", "val": f"{wp.tertiary_supply_mld:.1f} MLD", "bench": ">= 10.0 MLD for 100% Zero Groundwater", "src": "State Urban Development / Municipal STP"},
        6: {"dim": "Water Subsystem", "name": "Dedicated Emergency On-Site Water Buffer", "key": "on_site_storage_hours", "val": f"{wp.on_site_storage_hours:.0f} Hours", "bench": ">= 72 Hours (Tier-IV Mandate)", "src": "Uptime Institute Tier-IV / TIA-942"},

        7: {"dim": "Power & Grid", "name": "Distance to 400kV/220kV EHV Substation", "key": "substation_distance_km", "val": f"{pp.substation_distance_km:.2f} km", "bench": "<= 2.5 km (Minimal RoW Latency)", "src": "Central Electricity Authority (CEA)"},
        8: {"dim": "Power & Grid", "name": "Grid Interconnection Voltage Class", "key": "voltage_class_kv", "val": f"{pp.voltage_class_kv:.0f} kV", "bench": ">= 220 kV (Bulk Transmission 50MW+)", "src": "CEA Transmission Planning Manual"},
        9: {"dim": "Power & Grid", "name": "Substation N-1 Spare Transformer Headroom", "key": "spare_mva_margin", "val": f"{pp.spare_mva_margin:.0f} MVA", "bench": f">= {site.proposed_it_load_mw * 1.2:.0f} MVA (N-1 Redundancy)", "src": "State Load Despatch Centre (SLDC)"},
        10: {"dim": "Power & Grid", "name": "Mapped Physical Substations Density (15 km)", "key": "substations_count_15km", "val": f"{substations_count} Substations", "bench": ">= 2 Redundant Substations for Dual-Grid", "src": "OpenStreetMap Overpass API (Live Scan)"},
        11: {"dim": "Power & Grid", "name": "Renewable Open Access & Green Corridor Access", "key": "renewable_open_access_score", "val": f"{pp.renewable_open_access_score:.1f}/100", "bench": ">= 75.0 (Green Energy Open Access Rules)", "src": "Ministry of Power Green Open Access"},
        12: {"dim": "Power & Grid", "name": "Direct Normal Irradiance (DNI)", "key": "solar_dni_w_m2", "val": f"{solar_dni:.1f} W/m²", "bench": ">= 650 W/m² (High Solar Viability)", "src": "Open-Meteo Solar & Global Solar Atlas"},
        13: {"dim": "Power & Grid", "name": "Global Horizontal Irradiance (GHI)", "key": "solar_ghi_kwh_m2_day", "val": f"{solar_ghi:.2f} kWh/m²/day", "bench": ">= 5.0 kWh/m²/day (National Solar Tier-1)", "src": "NASA POWER / NISE Resource Map"},
        14: {"dim": "Power & Grid", "name": "Wind Power Density at 100m Hub Height", "key": "wind_power_density_w_m2", "val": f"{wind_power_density:.1f} W/m²", "bench": ">= 200 W/m² (Hybrid Wind PPA Feasible)", "src": "Global Wind Atlas / MNRE"},

        15: {"dim": "Climate & Cooling", "name": "Annual Peak Design Dry-Bulb Temperature", "key": "dry_bulb_temp_c", "val": f"{cp.dry_bulb_temp_c:.1f}°C", "bench": "<= 38.0°C (ASHRAE Envelope A1)", "src": "NASA POWER 30-Year Climatology"},
        16: {"dim": "Climate & Cooling", "name": "Annual Peak Design Relative Humidity", "key": "relative_humidity_pct", "val": f"{cp.relative_humidity_pct:.1f}%", "bench": "40% - 70% RH (ESD & Condensation Shield)", "src": "NASA POWER Climatology API"},
        17: {"dim": "Climate & Cooling", "name": "Psychrometric Wet-Bulb Temperature", "key": "wet_bulb_temp_c", "val": f"{twb:.1f}°C", "bench": "<= 28.0°C (Evaporative & Adiabatic Limit)", "src": "Stull Psychrometric Formulation"},
        18: {"dim": "Climate & Cooling", "name": "Annual Cooling Degree Days (CDD 18.3°C)", "key": "annual_cooling_degree_days", "val": f"{cp.annual_cooling_degree_days:.0f} CDD", "bench": "<= 3000 CDD (Low Mechanical Chiller Hours)", "src": "NASA POWER Satellite Climatology"},
        19: {"dim": "Climate & Cooling", "name": "Annual Extreme Heat Days (>42°C)", "key": "extreme_heat_days", "val": f"{cp.extreme_heat_days:.0f} Days/Year", "bench": "<= 10 Days/Year (Peak Stress Mitigation)", "src": "India Meteorological Department (IMD)"},
        20: {"dim": "Climate & Cooling", "name": "Atmospheric Particulate Load (PM2.5)", "key": "air_quality_pm25", "val": f"{cp.air_quality_pm25:.1f} µg/m³", "bench": "<= 60 µg/m³ (CPCB National Standard)", "src": "Copernicus CAMS & ECMWF Reanalysis"},

        21: {"dim": "Connectivity & Fiber", "name": "Terrestrial Distance to Subsea CLS", "key": "cls_distance_km", "val": f"{cls_dist_km:.1f} km", "bench": "<= 50 km (Low International Egress Latency)", "src": "TRAI Subsea Cable Landing Registry"},
        22: {"dim": "Connectivity & Fiber", "name": "Subsea Gateway Optical Round-Trip Time", "key": "rtt_to_landing_station_ms", "val": f"{conn.rtt_to_landing_station_ms:.1f} ms", "bench": "<= 5.0 ms (Ultra-Low Latency GPU Mesh)", "src": "Terrestrial SMF-28 Optical Transit"},
        23: {"dim": "Connectivity & Fiber", "name": "Distance to Nearest NIXI Internet Exchange", "key": "nixi_distance_km", "val": f"{conn.nixi_distance_km:.1f} km", "bench": "<= 30 km (Direct Peering & BGP Proximity)", "src": "National Internet Exchange of India (NIXI)"},
        24: {"dim": "Connectivity & Fiber", "name": "Carrier-Neutral Tier-1 Telco Providers Count", "key": "carrier_neutral_providers_count", "val": f"{conn.carrier_neutral_providers_count} Providers", "bench": ">= 3 Tier-1 Telcos (Airtel, Jio, Tata)", "src": "Department of Telecommunications (DoT)"},
        25: {"dim": "Connectivity & Fiber", "name": "Physically Diverse Dark Fiber Conduits", "key": "dark_fiber_routes_count", "val": f"{conn.dark_fiber_routes_count} Diverse Routes", "bench": ">= 3 Independent Trench Corridors", "src": "National Optical Fiber Network / BharatNet"},
        26: {"dim": "Connectivity & Fiber", "name": "Metro Internet Exchange & Peering Density", "key": "peering_density", "val": extras.get("peering_density", "Active Multi-Carrier Peering Fabric"), "bench": "Active IXP Peering Fabric Presence", "src": "PeeringDB Global Database"},

        27: {"dim": "Disaster Resilience", "name": "BIS IS 1893:2016 Seismic Zone & Motion", "key": "seismic_zone", "val": f"Zone {dp.seismic_zone.upper()}", "bench": "Zone II or Zone III (PGA <= 0.16g)", "src": "Bureau of Indian Standards IS 1893: 2016"},
        28: {"dim": "Disaster Resilience", "name": "250 km Historical Seismic Events (M >= 3.5)", "key": "recorded_earthquakes_count", "val": f"{extras.get('recorded_earthquakes_count', 0)} Events", "bench": "<= 5 Significant Events per Century", "src": "USGS Earthquake Hazards Live Feed"},
        29: {"dim": "Disaster Resilience", "name": "Elevation Margin above 100-Year High Flood Level", "key": "elevation_above_hfl_m", "val": f"{dp.elevation_above_hfl_m:.1f} meters", "bench": ">= 3.0 meters Headroom above Notified HFL", "src": "Central Water Commission & NASA SRTM"},
        30: {"dim": "Disaster Resilience", "name": "Basic 50-Year Cyclone Wind Velocity", "key": "cyclone_wind_speed_ms", "val": f"{dp.cyclone_wind_speed_ms:.1f} m/s", "bench": "<= 39.0 m/s (IS 875 Part 3 Standard)", "src": "IS 875 (Part 3): 2015 & NDMA Maps"},
        31: {"dim": "Disaster Resilience", "name": "Landslide Hazard Susceptibility Index", "key": "landslide_risk_index", "val": f"{dp.landslide_risk_index:.1f}/100", "bench": "<= 20.0 (Stable Low Slope Plains)", "src": "Geological Survey of India (GSI) Atlas"},
        32: {"dim": "Disaster Resilience", "name": "Distance to Nearest Operational Fire Station", "key": "fire_station_distance_km", "val": f"{fire_station_km:.1f} km", "bench": "<= 5.0 km (Under-10-Min Response per TIA-942)", "src": "OpenStreetMap Overpass API (Live Scan)"},
        33: {"dim": "Disaster Resilience", "name": "Distance to Nearest Emergency Hospital", "key": "hospital_distance_km", "val": f"{hospital_km:.1f} km", "bench": "<= 8.0 km (Workforce Critical Life Safety)", "src": "OpenStreetMap Overpass API / State Health"},

        34: {"dim": "Land & Civil", "name": "Notified IT/Industrial Zone Certification", "key": "is_notified_it_industrial_zone", "val": "Certified Notified Zone" if lp.is_notified_it_industrial_zone else "Agricultural / Non-Notified", "bench": "Notified Industrial Land (Zero CLU Litigation)", "src": "State Industrial Development Corporation"},
        35: {"dim": "Land & Civil", "name": "Distance to National Highway / Expressway", "key": "distance_to_national_highway_km", "val": f"{lp.distance_to_national_highway_km:.1f} km", "bench": "<= 4.0 km (100-ton Heavy Logistics)", "src": "National Highways Authority of India (NHAI)"},
        36: {"dim": "Land & Civil", "name": "Depth to Hard Bedrock from Surface", "key": "depth_to_bedrock_cm", "val": f"{depth_to_bedrock_cm:.0f} cm", "bench": "80 - 150 cm (Shallow Raft Viable)", "src": "ISRIC SoilGrids 2.0 Global Geotechnical Model"},
        37: {"dim": "Land & Civil", "name": "Soil Mechanical Texture Composition", "key": "soil_texture", "val": soil_texture_desc, "bench": "Cohesive Clay Loam / Hard Murrum / Basalt", "src": "ISRIC SoilGrids 2.0 Physical Soil Texture"},
        38: {"dim": "Land & Civil", "name": "Safe Soil Bearing Capacity (SBC)", "key": "soil_bearing_capacity_kpa", "val": f"{lp.soil_bearing_capacity_kpa:.0f} kN/m²", "bench": ">= 180 kN/m² (Heavy Transformer Bay Support)", "src": "IS 1904 Foundation Engineering Code"},
        39: {"dim": "Land & Civil", "name": "Distance to Nearest Civil/Defense Airport", "key": "airport_distance_km", "val": f"{airport_dist_km:.1f} km ({airport_name})", "bench": ">= 15.0 km (Avoids Obstacle Limitation Caps)", "src": "Airports Authority of India (AAI) Registry"},
        40: {"dim": "Land & Civil", "name": "Aeronautical Obstacle Limitation Surface (OLS)", "key": "ols_status", "val": ols_status, "bench": "Outside Aeronautical Funnel Approach Surface", "src": "Ministry of Civil Aviation GSR 751(E) Rules"},

        41: {"dim": "Economics & Policy", "name": "Industrial HT Electricity Tariff", "key": "electricity_tariff_inr_per_kwh", "val": f"₹{ep.electricity_tariff_inr_per_kwh:.2f}/kWh", "bench": "<= ₹7.20/kWh (Competitive AI Training Threshold)", "src": "State Electricity Regulatory Commission (SERC)"},
        42: {"dim": "Economics & Policy", "name": "State Capital Investment Subsidy", "key": "capital_subsidy_pct", "val": f"{ep.capital_subsidy_pct:.1f}%", "bench": ">= 15.0% (Dedicated State Data Center Policy)", "src": "State IT & Electronics Promotion Policy"},
        43: {"dim": "Economics & Policy", "name": "Electricity Duty Exemption Duration", "key": "electricity_duty_exemption_years", "val": f"{ep.electricity_duty_exemption_years} Years", "bench": ">= 5 Years Full Electricity Duty Waiver", "src": "State Department of Energy Gazettes"},
        44: {"dim": "Economics & Policy", "name": "Official Land Acquisition Circle Rate", "key": "land_cost_inr_crore_per_acre", "val": f"₹{ep.land_cost_inr_crore_per_acre:.2f} Cr/Acre", "bench": "Official SRO Ready Reckoner / IDC Industrial Tariff", "src": "State Department of Revenue SRO Ready Reckoner"},
        45: {"dim": "Economics & Policy", "name": "State Data Center Policy & Single-Window", "key": "state_has_dc_policy", "val": "Dedicated DC Policy Active" if ep.state_has_dc_policy else "Generic Industrial Regime", "bench": "Dedicated AI/DC Policy with Essential Services", "src": "Ministry of Electronics and IT (MeitY)"},

        46: {"dim": "Atmospheric Chemistry", "name": "Distance to Major Chemical / Refinery Plants", "key": "industrial_hazard_distance_km", "val": f"{dp.industrial_hazard_distance_km:.1f} km", "bench": ">= 5.0 km Buffer from Toxic Hazard Facilities", "src": "Petroleum & Explosives Safety Org (PESO)"},
        47: {"dim": "Atmospheric Chemistry", "name": "ISA-71.04 Electronics Gaseous Corrosivity Level", "key": "isa_corrosivity", "val": isa_corrosivity, "bench": "Class G1 (Mild - Standard MERV-13 Filtration)", "src": "ISA-71.04 Standard & CPCB Air Monitoring"},

        48: {"dim": "Ecology & Sovereign Vetoes", "name": "Wildlife Sanctuary / National Park Proximity", "key": "distance_to_protected_forest_km", "val": f"{pa_info.get('distance_to_protected_area_km', 25.0):.1f} km ({pa_info.get('closest_protected_area', pa_info.get('name', 'MoEFCC Protected Network'))})", "bench": "> 10.0 km from Notified Wildlife Core / ESZ", "src": "Wildlife Institute of India & MoEFCC Registry"},
        49: {"dim": "Ecology & Sovereign Vetoes", "name": "Tree Canopy Density & Zero-Deforestation Ban", "key": "tree_canopy_cover_pct", "val": f"{canopy_pct:.1f}% Canopy Cover ({trees_cut} trees to cut)", "bench": "0 Trees Cut (Strict Non-Forest Allotment Mandate)", "src": "Forest Survey of India ISFR 2023 & WPA 1972"},
        50: {"dim": "Ecology & Sovereign Vetoes", "name": "Hostile Border Proximity & Winter Snowbound Cutoff", "key": "conflict_risk", "val": f"Status: {strat_risk.get('status_label', 'SECURE_INLAND')} ({strat_risk.get('border_name', 'Inland Corridor')})", "bench": "Zero Hostile Artillery Exposure & 365-Day Highway Access", "src": "MHA Sensitive Border Guidelines & BRO Mountain Pass Log"},
    }

    factors_list: List[Dict[str, Any]] = []
    for fid in range(1, 51):
        m = meta_info[fid]
        score_val = scores[fid]
        weight_val = FACTOR_WEIGHTS[fid]

        # Determine Factor Compliance Status
        if fid in [48, 49, 50] and score_val <= 10.0:
            status = "PROHIBITED"
        elif score_val >= 90.0:
            status = "OPTIMAL"
        elif score_val >= 70.0:
            status = "COMPLIANT"
        elif score_val >= 40.0:
            status = "WARNING"
        else:
            status = "CRITICAL"

        factors_list.append({
            "id": fid,
            "dimension": m["dim"],
            "name": m["name"],
            "metric_key": m["key"],
            "value": m["val"],
            "factor_score": score_val,
            "weight": weight_val,
            "weighted_score": round(score_val * weight_val, 3),
            "benchmark": m["bench"],
            "source": m["src"],
            "status": status,
        })

    # Ecology score is the synthesized score of ecology & water preservation
    eco_composite = round((scores[48] * 0.40) + (scores[49] * 0.40) + (scores[11] * 0.20), 1)

    return {
        "composite_score": composite_score,
        "raw_composite_score": round(raw_composite, 1),
        "tier": tier,
        "tier_badge": tier_badge,
        "tier_color": tier_color,
        "water_score": dim_scores["water"],
        "power_score": dim_scores["power"],
        "climate_score": dim_scores["climate"],
        "connectivity_score": dim_scores["connectivity"],
        "disaster_score": dim_scores["disaster"],
        "land_score": dim_scores["land"],
        "economics_score": dim_scores["economics"],
        "atmospheric_score": dim_scores["atmospheric"],
        "sovereign_score": dim_scores["sovereign_vetoes"],
        "eco_score": eco_composite,
        "total_factors": 50,
        "factors": factors_list,
    }
