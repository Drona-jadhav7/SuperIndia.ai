"""
Connectivity and Network Backbone Siting Engine for SuperIndia.ai
Evaluates optical dark-fiber proximity, round-trip latency to subsea cable landing stations (CLS),
National Internet Exchange of India (NIXI) peering access, and carrier neutrality.
"""

from typing import Dict, List, Any
from pydantic import BaseModel, Field

class ConnectivityInput(BaseModel):
    fiber_backbone_distance_km: float = Field(1.2, description="Distance to nearest national dark fiber route (RailTel/BharatNet/GAILTel) in km")
    rtt_to_landing_station_ms: float = Field(4.5, description="Round-trip time latency to nearest Subsea Cable Landing Station (Mumbai/Chennai) in ms")
    nixi_distance_km: float = Field(18.0, description="Distance to nearest National Internet Exchange of India (NIXI) peering point in km")
    carrier_neutral_providers_count: int = Field(4, description="Number of independent Tier-1 carriers present (Jio, Airtel, Tata, Vodafone Idea)")
    dark_fiber_routes_count: int = Field(3, description="Physically diverse, non-overlapping fiber entry paths")

class ConnectivityAssessmentOutput(BaseModel):
    connectivity_score: float
    weights: Dict[str, float]
    sub_metrics: List[Dict[str, Any]]
    summary: str

def calculate_connectivity_assessment(params: ConnectivityInput) -> ConnectivityAssessmentOutput:
    """
    Evaluates telecommunications connectivity:
    1. Fiber Backbone Proximity (0.30): Trenching latency and Right-of-Way (RoW) risk.
    2. Cable Landing Station RTT (0.30): Latency to international subsea gateways (Mumbai/Chennai).
    3. Carrier Neutrality & Path Diversity (0.25): Redundancy to avoid single point of failure.
    4. NIXI Peering Proximity (0.15): Sovereign peering exchange proximity.
    """
    # 1. Fiber distance
    # <= 1.0 km: 100
    # 1.0 - 5.0 km: 85
    # 5.0 - 15.0 km: 60
    # > 15.0 km: 30
    dist = params.fiber_backbone_distance_km
    if dist <= 1.0:
        fiber_score = 100.0
    elif dist <= 5.0:
        fiber_score = 100.0 - ((dist - 1.0) / 4.0) * 20.0
    elif dist <= 15.0:
        fiber_score = 80.0 - ((dist - 5.0) / 10.0) * 35.0
    else:
        fiber_score = max(15.0, 45.0 - ((dist - 15.0) / 15.0) * 30.0)

    # 2. RTT to Cable Landing Station
    # <= 2 ms (Metro Mumbai/Chennai): 100
    # 2 - 8 ms (Pune, Bangalore, Hyderabad, Dholera): 85-90
    # 8 - 18 ms (Delhi-NCR): 75
    # > 25 ms (Inland/Himalayan): 50
    rtt = params.rtt_to_landing_station_ms
    if rtt <= 2.0:
        rtt_score = 100.0
    elif rtt <= 8.0:
        rtt_score = 100.0 - ((rtt - 2.0) / 6.0) * 15.0
    elif rtt <= 20.0:
        rtt_score = 85.0 - ((rtt - 8.0) / 12.0) * 25.0
    else:
        rtt_score = max(25.0, 60.0 - ((rtt - 20.0) / 20.0) * 35.0)

    # 3. Carrier Diversity & Neutrality
    # Providers: >= 4 (Jio, Airtel, Tata, Vi) = 100, 3 = 80, 2 = 60, 1 = 30
    # Diverse paths: >= 3 = 100, 2 = 80, 1 = 50
    prov_score = min(100.0, params.carrier_neutral_providers_count * 25.0)
    path_score = min(100.0, params.dark_fiber_routes_count * 33.3)
    diversity_score = (prov_score * 0.6) + (path_score * 0.4)

    # 4. NIXI Proximity
    nixi_d = params.nixi_distance_km
    if nixi_d <= 15.0:
        nixi_score = 95.0
    elif nixi_d <= 40.0:
        nixi_score = 80.0
    elif nixi_d <= 100.0:
        nixi_score = 65.0
    else:
        nixi_score = 40.0

    weights = {
        "fiber_backbone_proximity": 0.30,
        "cable_landing_rtt": 0.30,
        "carrier_diversity_neutrality": 0.25,
        "nixi_peering_proximity": 0.15,
    }

    connectivity_score = round(
        (fiber_score * weights["fiber_backbone_proximity"])
        + (rtt_score * weights["cable_landing_rtt"])
        + (diversity_score * weights["carrier_diversity_neutrality"])
        + (nixi_score * weights["nixi_peering_proximity"]),
        2,
    )

    sub_metrics = [
        {
            "name": "Fiber Backbone Proximity",
            "key": "fiber_backbone_proximity",
            "score": round(fiber_score, 1),
            "weight": weights["fiber_backbone_proximity"],
            "weighted_score": round(fiber_score * weights["fiber_backbone_proximity"], 2),
            "category": "EXCELLENT" if fiber_score >= 80 else "ACCEPTABLE" if fiber_score >= 60 else "STRESSED",
            "details": f"{dist:.1f} km from primary dark fiber trunk.",
            "flagged": fiber_score < 60.0,
        },
        {
            "name": "Cable Landing Station RTT",
            "key": "cable_landing_rtt",
            "score": round(rtt_score, 1),
            "weight": weights["cable_landing_rtt"],
            "weighted_score": round(rtt_score * weights["cable_landing_rtt"], 2),
            "category": "EXCELLENT" if rtt_score >= 80 else "ACCEPTABLE" if rtt_score >= 60 else "STRESSED",
            "details": f"{rtt:.1f} ms round-trip time to international subsea gateway.",
            "flagged": rtt_score < 60.0,
        },
        {
            "name": "Carrier Neutrality & Diverse Paths",
            "key": "carrier_diversity_neutrality",
            "score": round(diversity_score, 1),
            "weight": weights["carrier_diversity_neutrality"],
            "weighted_score": round(diversity_score * weights["carrier_diversity_neutrality"], 2),
            "category": "EXCELLENT" if diversity_score >= 80 else "ACCEPTABLE" if diversity_score >= 60 else "STRESSED",
            "details": f"{params.carrier_neutral_providers_count} Tier-1 telcos, {params.dark_fiber_routes_count} redundant fiber lead-ins.",
            "flagged": diversity_score < 60.0,
        },
        {
            "name": "NIXI Exchange Proximity",
            "key": "nixi_peering_proximity",
            "score": round(nixi_score, 1),
            "weight": weights["nixi_peering_proximity"],
            "weighted_score": round(nixi_score * weights["nixi_peering_proximity"], 2),
            "category": "EXCELLENT" if nixi_score >= 80 else "ACCEPTABLE" if nixi_score >= 60 else "STRESSED",
            "details": f"{nixi_d:.1f} km to National Internet Exchange node.",
            "flagged": False,
        },
    ]

    return ConnectivityAssessmentOutput(
        connectivity_score=connectivity_score,
        weights=weights,
        sub_metrics=sub_metrics,
        summary=f"Connectivity score {connectivity_score}/100 with {rtt}ms subsea RTT and {params.carrier_neutral_providers_count} carrier backbones.",
    )
