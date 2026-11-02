"""
Land & Civil Infrastructure Siting Engine for SuperIndia.ai
Evaluates master plan industrial/IT zoning, heavy logistics corridor accessibility,
soil safe bearing capacity (SBC in kN/m²), and plot boundary contiguity.
"""

from typing import Dict, List, Any
from pydantic import BaseModel, Field

class LandInput(BaseModel):
    is_notified_it_industrial_zone: bool = Field(True, description="Located in notified IT/ITeS or Industrial Development Zone")
    distance_to_national_highway_km: float = Field(2.5, description="Distance to National Highway / Expressway for heavy transformer transport")
    soil_bearing_capacity_kpa: float = Field(220.0, description="Safe Soil Bearing Capacity (SBC) in kN/m² (IS 1904)")
    contiguous_parcel_acres: float = Field(25.0, description="Contiguous unfragmented land parcel size in acres")
    slope_gradient_pct: float = Field(1.5, description="Topographical natural terrain slope percentage")

class LandAssessmentOutput(BaseModel):
    land_score: float
    weights: Dict[str, float]
    sub_metrics: List[Dict[str, Any]]
    zoning_cleared: bool
    summary: str

def calculate_land_assessment(params: LandInput) -> LandAssessmentOutput:
    """
    Evaluates land and civil site feasibility:
    1. Industrial / IT Zoning Compliance (0.35): Avoids 18+ month Change of Land Use (CLU) litigation.
    2. Heavy Logistics Access (0.25): Ability to transport 100+ ton step-up transformers and chillers.
    3. Soil Bearing Capacity (0.20): Heavy foundation structural viability without deep piling.
    4. Parcel Contiguity & Expansion (0.20): Minimum scale for 50MW+ hyperscale expansion.
    """
    # 1. Zoning
    zoning_score = 100.0 if params.is_notified_it_industrial_zone else 35.0

    # 2. Highway distance
    # <= 2.0 km: 100
    # 2.0 - 6.0 km: 85
    # 6.0 - 15.0 km: 60
    # > 15.0 km: 35
    hwy = params.distance_to_national_highway_km
    if hwy <= 2.0:
        hwy_score = 100.0
    elif hwy <= 6.0:
        hwy_score = 100.0 - ((hwy - 2.0) / 4.0) * 15.0
    elif hwy <= 15.0:
        hwy_score = 85.0 - ((hwy - 6.0) / 9.0) * 35.0
    else:
        hwy_score = max(20.0, 50.0 - ((hwy - 15.0) / 15.0) * 30.0)

    # 3. Soil Bearing Capacity (SBC)
    # >= 200 kN/m²: Superb (dense gravel/hard murrum/basalt)
    # 150 - 200 kN/m²: Good
    # 100 - 150 kN/m²: Medium (requires reinforced raft)
    # < 100 kN/m²: Poor (soft clay/alluvial, requires deep pile driving)
    sbc = params.soil_bearing_capacity_kpa
    if sbc >= 200.0:
        sbc_score = 100.0
    elif sbc >= 150.0:
        sbc_score = 80.0 + ((sbc - 150.0) / 50.0) * 20.0
    elif sbc >= 100.0:
        sbc_score = 55.0 + ((sbc - 100.0) / 50.0) * 25.0
    else:
        sbc_score = max(20.0, (sbc / 100.0) * 55.0)

    # 4. Parcel Size
    # >= 20 acres: 100 (Hyperscale campus ready)
    # 10 - 20 acres: 85
    # 5 - 10 acres: 65
    # < 5 acres: 40 (Limited expansion)
    acres = params.contiguous_parcel_acres
    if acres >= 20.0:
        parcel_score = 100.0
    elif acres >= 10.0:
        parcel_score = 85.0 + ((acres - 10.0) / 10.0) * 15.0
    elif acres >= 5.0:
        parcel_score = 65.0 + ((acres - 5.0) / 5.0) * 20.0
    else:
        parcel_score = max(25.0, (acres / 5.0) * 65.0)

    weights = {
        "zoning_compliance": 0.35,
        "heavy_logistics_access": 0.25,
        "soil_bearing_capacity": 0.20,
        "parcel_scale_contiguity": 0.20,
    }

    land_score = round(
        (zoning_score * weights["zoning_compliance"])
        + (hwy_score * weights["heavy_logistics_access"])
        + (sbc_score * weights["soil_bearing_capacity"])
        + (parcel_score * weights["parcel_scale_contiguity"]),
        2,
    )

    sub_metrics = [
        {
            "name": "Zoning & Statutory Land Use",
            "key": "zoning_compliance",
            "score": round(zoning_score, 1),
            "weight": weights["zoning_compliance"],
            "weighted_score": round(zoning_score * weights["zoning_compliance"], 2),
            "category": "CLEAR" if params.is_notified_it_industrial_zone else "NON-CONFORMING",
            "details": "Notified Industrial/IT Zone (No CLU required)" if params.is_notified_it_industrial_zone else "Agricultural/Non-IT (Requires CLU clearance).",
            "flagged": not params.is_notified_it_industrial_zone,
        },
        {
            "name": "Highway / Expressway Logistics",
            "key": "heavy_logistics_access",
            "score": round(hwy_score, 1),
            "weight": weights["heavy_logistics_access"],
            "weighted_score": round(hwy_score * weights["heavy_logistics_access"], 2),
            "category": "EXCELLENT" if hwy_score >= 80 else "ACCEPTABLE" if hwy_score >= 60 else "STRESSED",
            "details": f"{hwy:.1f} km from National Highway corridor for heavy machinery transport.",
            "flagged": hwy_score < 60.0,
        },
        {
            "name": "Soil Safe Bearing Capacity",
            "key": "soil_bearing_capacity",
            "score": round(sbc_score, 1),
            "weight": weights["soil_bearing_capacity"],
            "weighted_score": round(sbc_score * weights["soil_bearing_capacity"], 2),
            "category": "EXCELLENT" if sbc_score >= 80 else "ACCEPTABLE" if sbc_score >= 60 else "STRESSED",
            "details": f"SBC {sbc:.0f} kN/m² (IS 1904 standard).",
            "flagged": sbc_score < 60.0,
        },
        {
            "name": "Contiguous Parcel Scale",
            "key": "parcel_scale_contiguity",
            "score": round(parcel_score, 1),
            "weight": weights["parcel_scale_contiguity"],
            "weighted_score": round(parcel_score * weights["parcel_scale_contiguity"], 2),
            "category": "EXCELLENT" if parcel_score >= 80 else "ACCEPTABLE" if parcel_score >= 60 else "STRESSED",
            "details": f"{acres:.1f} contiguous acres available for multi-phase expansion.",
            "flagged": parcel_score < 60.0,
        },
    ]

    return LandAssessmentOutput(
        land_score=land_score,
        weights=weights,
        sub_metrics=sub_metrics,
        zoning_cleared=params.is_notified_it_industrial_zone,
        summary=f"Land suitability score {land_score}/100 with {acres} contiguous acres and SBC {sbc} kN/m².",
    )
