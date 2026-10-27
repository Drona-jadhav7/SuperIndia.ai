"""
Climate and Thermal Siting Engine for SuperIndia.ai
Evaluates psychrometric properties, cooling degree days, and ambient atmospheric
suitability for AI data centers per ASHRAE TC 9.9 thermal guidelines and IMD 30-year normals.
"""

import math
from typing import Dict, List, Any
from pydantic import BaseModel, Field

class ClimateInput(BaseModel):
    dry_bulb_temp_c: float = Field(32.0, description="Annual design peak dry-bulb temperature in °C")
    relative_humidity_pct: float = Field(65.0, description="Relative humidity percentage at design temperature")
    annual_cooling_degree_days: float = Field(2800.0, description="Cooling Degree Days (CDD base 18.3°C)")
    air_quality_pm25: float = Field(45.0, description="Annual mean PM2.5 particulate concentration in µg/m³ (CPCB)")
    extreme_heat_days: float = Field(15.0, description="Annual days with temperatures exceeding 42°C")

class ClimateAssessmentOutput(BaseModel):
    climate_score: float
    wet_bulb_temp_c: float
    ashrae_compliance_class: str
    free_cooling_hours_pct: float
    weights: Dict[str, float]
    sub_metrics: List[Dict[str, Any]]
    summary: str

def calculate_wet_bulb_stull(T: float, RH: float) -> float:
    """
    Computes ambient wet-bulb temperature using Stull's psychrometric formulation.
    Accurate to within 0.15°C for standard atmospheric pressure and typical ambient ranges.
    """
    Tw = (
        T * math.atan(0.151977 * math.sqrt(RH + 8.313659))
        + math.atan(T + RH)
        - math.atan(RH - 1.676331)
        + 0.00391838 * (RH ** 1.5) * math.atan(0.023101 * RH)
        - 4.686035
    )
    return round(Tw, 2)

def calculate_climate_assessment(params: ClimateInput) -> ClimateAssessmentOutput:
    """
    Scores site climate suitability based on:
    1. Wet Bulb Temperature (0.35) - Dictates evaporative and economizer cooling limits.
    2. Cooling Degree Days (0.25) - Annual HVAC thermodynamic energy penalty.
    3. Free Cooling Headroom (0.20) - Winter economizer potential (hours < 20°C).
    4. Air Quality & Corrosive Particulates (0.20) - Copper heatsink corrosion per ASHRAE TC 9.9.
    """
    T = params.dry_bulb_temp_c
    RH = params.relative_humidity_pct
    Tw = calculate_wet_bulb_stull(T, RH)

    # 1. Wet-bulb score:
    # Tw <= 24°C: Superb (100)
    # Tw 24-27°C: Good (80)
    # Tw 27-29°C: Stressed (55)
    # Tw > 29°C: Extreme risk of evaporative cooling failure (< 35)
    if Tw <= 23.0:
        wb_score = 100.0
    elif Tw <= 26.0:
        wb_score = 100.0 - ((Tw - 23.0) / 3.0) * 20.0  # 100 -> 80
    elif Tw <= 29.0:
        wb_score = 80.0 - ((Tw - 26.0) / 3.0) * 35.0   # 80 -> 45
    else:
        wb_score = max(15.0, 45.0 - ((Tw - 29.0) / 3.0) * 30.0)

    # 2. Cooling Degree Days (CDD base 18.3°C):
    # CDD < 2000: Excellent (Bangalore/Highlands ~1800)
    # CDD 2000-3000: Moderate (Mumbai/Pune ~2500-2900)
    # CDD > 3500: Severe (Delhi/Chennai summer ~3500+)
    cdd = params.annual_cooling_degree_days
    if cdd <= 1800.0:
        cdd_score = 98.0
    elif cdd <= 2800.0:
        cdd_score = 98.0 - ((cdd - 1800.0) / 1000.0) * 25.0
    elif cdd <= 3800.0:
        cdd_score = 73.0 - ((cdd - 2800.0) / 1000.0) * 35.0
    else:
        cdd_score = max(20.0, 38.0 - ((cdd - 3800.0) / 1000.0) * 18.0)

    # 3. Free cooling economizer potential (hours where dry-bulb < 20°C):
    # Estimated from CDD and extreme heat days
    free_cooling_pct = max(5.0, min(65.0, (4000.0 - cdd) / 50.0 - (params.extreme_heat_days * 0.4)))
    fc_score = min(100.0, free_cooling_pct * 1.8)

    # 4. Air Quality (PM2.5 particulate contamination):
    # CPCB standard: < 30 µg/m³ is Safe, 30-60 Moderate, > 90 Hazardous for server air intake
    pm = params.air_quality_pm25
    if pm <= 30.0:
        aqi_score = 95.0
    elif pm <= 60.0:
        aqi_score = 95.0 - ((pm - 30.0) / 30.0) * 25.0
    elif pm <= 120.0:
        aqi_score = 70.0 - ((pm - 60.0) / 60.0) * 35.0
    else:
        aqi_score = max(20.0, 35.0 - ((pm - 120.0) / 80.0) * 20.0)

    weights = {
        "wet_bulb_temperature": 0.35,
        "cooling_degree_days": 0.25,
        "free_cooling_potential": 0.20,
        "air_quality_particulates": 0.20,
    }

    climate_score = round(
        (wb_score * weights["wet_bulb_temperature"])
        + (cdd_score * weights["cooling_degree_days"])
        + (fc_score * weights["free_cooling_potential"])
        + (aqi_score * weights["air_quality_particulates"]),
        2,
    )

    ashrae_class = "ASHRAE TC 9.9 Class A1 (Tight Envelope)" if wb_score >= 80 else "ASHRAE TC 9.9 Class A2 (Requires Hybrid Chiller Assist)"

    sub_metrics = [
        {
            "name": "Wet Bulb Temperature",
            "key": "wet_bulb_temperature",
            "score": round(wb_score, 1),
            "weight": weights["wet_bulb_temperature"],
            "weighted_score": round(wb_score * weights["wet_bulb_temperature"], 2),
            "category": "EXCELLENT" if wb_score >= 80 else "ACCEPTABLE" if wb_score >= 60 else "STRESSED",
            "details": f"Design Wet Bulb: {Tw}°C (Dry: {T}°C, RH: {RH}%).",
            "flagged": wb_score < 60.0,
        },
        {
            "name": "Cooling Degree Days",
            "key": "cooling_degree_days",
            "score": round(cdd_score, 1),
            "weight": weights["cooling_degree_days"],
            "weighted_score": round(cdd_score * weights["cooling_degree_days"], 2),
            "category": "EXCELLENT" if cdd_score >= 80 else "ACCEPTABLE" if cdd_score >= 60 else "STRESSED",
            "details": f"Annual CDD: {cdd:.0f} (Base 18.3°C).",
            "flagged": cdd_score < 60.0,
        },
        {
            "name": "Free Cooling Potential",
            "key": "free_cooling_potential",
            "score": round(fc_score, 1),
            "weight": weights["free_cooling_potential"],
            "weighted_score": round(fc_score * weights["free_cooling_potential"], 2),
            "category": "EXCELLENT" if fc_score >= 80 else "ACCEPTABLE" if fc_score >= 60 else "STRESSED",
            "details": f"Estimated {free_cooling_pct:.1f}% annual hours eligible for economizer bypass.",
            "flagged": False,
        },
        {
            "name": "Air Quality (PM2.5)",
            "key": "air_quality_particulates",
            "score": round(aqi_score, 1),
            "weight": weights["air_quality_particulates"],
            "weighted_score": round(aqi_score * weights["air_quality_particulates"], 2),
            "category": "EXCELLENT" if aqi_score >= 80 else "ACCEPTABLE" if aqi_score >= 60 else "STRESSED",
            "details": f"Annual PM2.5 mean: {pm:.1f} µg/m³.",
            "flagged": aqi_score < 60.0,
        },
    ]

    return ClimateAssessmentOutput(
        climate_score=climate_score,
        wet_bulb_temp_c=Tw,
        ashrae_compliance_class=ashrae_class,
        free_cooling_hours_pct=round(free_cooling_pct, 1),
        weights=weights,
        sub_metrics=sub_metrics,
        summary=f"Climate suitability score {climate_score}/100. Wet bulb {Tw}°C supports {ashrae_class}.",
    )
