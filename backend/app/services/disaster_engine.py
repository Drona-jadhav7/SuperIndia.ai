"""
Natural Disaster & Climate Physical Hazard Siting Engine for SuperIndia.ai
Evaluates seismic vulnerability per IS 1893:2016, 100-year flood zone exposure,
cyclone wind speed per NDMA hazard maps, and extreme climate hazard risks.
"""

from typing import Dict, List, Any
from pydantic import BaseModel, Field

class DisasterInput(BaseModel):
    seismic_zone: str = Field("III", description="Seismic Zone per IS 1893:2016 (II, III, IV, V)")
    elevation_above_hfl_m: float = Field(3.5, description="Elevation above 100-year High Flood Level (HFL) in meters")
    cyclone_wind_speed_ms: float = Field(39.0, description="Basic peak wind speed in m/s (IS 875 Part 3 / NDMA)")
    landslide_risk_index: float = Field(10.0, description="Geological Survey of India landslide hazard index (0-100)")
    industrial_hazard_distance_km: float = Field(8.0, description="Distance from Major Accident Hazard (MAH) chemical/refinery units in km")

class DisasterAssessmentOutput(BaseModel):
    disaster_resilience_score: float
    weights: Dict[str, float]
    sub_metrics: List[Dict[str, Any]]
    critical_hazard_flag: bool
    summary: str

def calculate_disaster_assessment(params: DisasterInput) -> DisasterAssessmentOutput:
    """
    Evaluates physical catastrophic risk to AI compute infrastructure:
    1. Seismic Vulnerability (0.30): IS 1893:2016 criteria.
    2. Flood & Coastal Inundation (0.35): Distance above 100-year High Flood Level.
    3. Cyclone & Extreme Wind Velocity (0.20): NDMA coastal/cyclonic wind risk.
    4. Industrial Chemical Hazard Separation (0.15): Hazardous chemical/refinery proximity.
    """
    # 1. Seismic Zone Score
    zone_upper = params.seismic_zone.strip().upper()
    if zone_upper == "II":
        seismic_score = 100.0  # Low damage risk (Bangalore, Hyderabad)
    elif zone_upper == "III":
        seismic_score = 80.0   # Moderate risk (Mumbai, Chennai, Dholera)
    elif zone_upper == "IV":
        seismic_score = 50.0   # Severe risk (Delhi-NCR, Greater Noida)
    elif zone_upper == "V":
        seismic_score = 20.0   # Very severe risk (Himalayan belt, Kutch)
    else:
        seismic_score = 70.0

    # 2. Flood & Inundation Headroom above 100-yr HFL
    # >= 5.0m: 100 (Safe)
    # 3.0 - 5.0m: 85
    # 1.0 - 3.0m: 60 (Conditional)
    # < 1.0m: 25 (Extreme flood jeopardy)
    hfl = params.elevation_above_hfl_m
    if hfl >= 5.0:
        flood_score = 100.0
    elif hfl >= 3.0:
        flood_score = 85.0 + ((hfl - 3.0) / 2.0) * 15.0
    elif hfl >= 1.0:
        flood_score = 60.0 + ((hfl - 1.0) / 2.0) * 25.0
    else:
        flood_score = max(15.0, hfl * 60.0)

    # 3. Cyclone / Wind Speed
    # <= 33 m/s: 100 (Inland)
    # 33 - 39 m/s: 85 (Moderate coastal)
    # 39 - 47 m/s: 65 (High damage risk)
    # > 50 m/s: 35 (Very high cyclone risk - Odisha/AP/Bengal coast)
    ws = params.cyclone_wind_speed_ms
    if ws <= 33.0:
        wind_score = 100.0
    elif ws <= 39.0:
        wind_score = 100.0 - ((ws - 33.0) / 6.0) * 15.0
    elif ws <= 47.0:
        wind_score = 85.0 - ((ws - 39.0) / 8.0) * 25.0
    else:
        wind_score = max(20.0, 60.0 - ((ws - 47.0) / 10.0) * 40.0)

    # 4. Industrial Chemical Hazard Separation
    # >= 10 km: 100
    # 5 - 10 km: 85
    # 2 - 5 km: 60
    # < 2 km: 30 (Risk of toxic gas clouds, explosions, corrosive emissions)
    mah_d = params.industrial_hazard_distance_km
    if mah_d >= 10.0:
        mah_score = 100.0
    elif mah_d >= 5.0:
        mah_score = 85.0 + ((mah_d - 5.0) / 5.0) * 15.0
    elif mah_d >= 2.0:
        mah_score = 60.0 + ((mah_d - 2.0) / 3.0) * 25.0
    else:
        mah_score = max(15.0, mah_d * 30.0)

    weights = {
        "seismic_vulnerability": 0.30,
        "flood_inundation_headroom": 0.35,
        "cyclone_wind_resistance": 0.20,
        "industrial_chemical_buffer": 0.15,
    }

    disaster_score = round(
        (seismic_score * weights["seismic_vulnerability"])
        + (flood_score * weights["flood_inundation_headroom"])
        + (wind_score * weights["cyclone_wind_resistance"])
        + (mah_score * weights["industrial_chemical_buffer"]),
        2,
    )

    critical_hazard = (hfl < 1.0) or (zone_upper in ["IV", "V"]) or (ws > 47.0)

    sub_metrics = [
        {
            "name": f"Seismic Hazard (Zone {zone_upper})",
            "key": "seismic_vulnerability",
            "score": round(seismic_score, 1),
            "weight": weights["seismic_vulnerability"],
            "weighted_score": round(seismic_score * weights["seismic_vulnerability"], 2),
            "category": "SAFE" if seismic_score >= 80 else "MODERATE" if seismic_score >= 50 else "SEVERE",
            "details": f"Zone {zone_upper} per IS 1893:2016 classification.",
            "flagged": seismic_score < 60.0,
        },
        {
            "name": "Flood Elevation Margin",
            "key": "flood_inundation_headroom",
            "score": round(flood_score, 1),
            "weight": weights["flood_inundation_headroom"],
            "weighted_score": round(flood_score * weights["flood_inundation_headroom"], 2),
            "category": "SAFE" if flood_score >= 80 else "CONDITIONAL" if flood_score >= 60 else "CRITICAL",
            "details": f"{hfl:.1f}m elevation above 100-year High Flood Level (HFL).",
            "flagged": flood_score < 60.0,
        },
        {
            "name": "Cyclone & Peak Wind Load",
            "key": "cyclone_wind_resistance",
            "score": round(wind_score, 1),
            "weight": weights["cyclone_wind_resistance"],
            "weighted_score": round(wind_score * weights["cyclone_wind_resistance"], 2),
            "category": "SAFE" if wind_score >= 80 else "MODERATE" if wind_score >= 60 else "SEVERE",
            "details": f"Design wind velocity {ws:.1f} m/s (NDMA / IS 875-3).",
            "flagged": wind_score < 60.0,
        },
        {
            "name": "Industrial Hazard Buffer",
            "key": "industrial_chemical_buffer",
            "score": round(mah_score, 1),
            "weight": weights["industrial_chemical_buffer"],
            "weighted_score": round(mah_score * weights["industrial_chemical_buffer"], 2),
            "category": "SAFE" if mah_score >= 80 else "CONDITIONAL" if mah_score >= 60 else "CRITICAL",
            "details": f"{mah_d:.1f} km buffer from designated Major Accident Hazard (MAH) sites.",
            "flagged": mah_score < 60.0,
        },
    ]

    return DisasterAssessmentOutput(
        disaster_resilience_score=disaster_score,
        weights=weights,
        sub_metrics=sub_metrics,
        critical_hazard_flag=critical_hazard,
        summary=f"Natural disaster resilience score {disaster_score}/100. Seismic Zone {zone_upper}, {hfl}m above HFL.",
    )
