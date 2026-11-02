"""
SuperIndia.ai - National Security, Border Conflict & Extreme Terrain Siting Engine
Authoritative Strategic Defense & Logistics Risk Evaluator per:
1. Ministry of Home Affairs (MHA) Sensitive Border Area Guidelines
2. National Critical Information Infrastructure Protection Centre (NCIIPC) Directives
3. CERT-In Sovereign Computing & Critical Asset Physical Perimeter Standards
4. Ministry of Defence (MoD) Forward Military Conflict Perimeter Records
5. Border Roads Organisation (BRO) High-Altitude Mountain Pass Winter Closure Data
6. Central Electricity Authority (CEA) Islanded & Fragile Grid Reliability Standards

Prevents catastrophic siting of critical national AI infrastructure in hostile border conflict
zones (e.g., Kargil, LoC, LAC), remote avalanche corridors, and talent-deprived isolated terrains.
"""

import math
from typing import Dict, Any, List, Optional

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes great-circle distance in kilometers between two WGS84 points."""
    r = 6371.0088
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2.0) ** 2
    return round(2.0 * r * math.asin(math.sqrt(a)), 2)

# Authoritative Sensitive Border Conflict Sectors & Defense Frontiers
SENSITIVE_BORDER_SECTORS: List[Dict[str, Any]] = [
    {
        "id": "border_kargil_loc",
        "name": "Kargil Sector (Line of Control - LoC)",
        "aliases": ["Kargil", "Dras", "Drass", "Batalik", "Kaksar", "Mushkoh", "Tiger Hill", "Sankoo", "Zanskar"],
        "state": "Ladakh",
        "district": "Kargil",
        "latitude": 34.5539,
        "longitude": 76.1349,
        "conflict_radius_km": 55.0,
        "hostile_border_type": "Pakistan Line of Control (LoC)",
        "conflict_history": "1999 Kargil War (Operation Vijay); direct artillery shelling and infiltration sector",
        "defense_vulnerability": "HIGH_ARTILLERY_AND_DRONE_STRIKE_RISK",
        "winter_cutoff_months": 5,
        "mountain_pass_closure": "Zojila Pass (11,578 ft) closed by 20-30ft snow from Dec to April",
        "grid_status": "Isolated fragile 66kV/33kV grid; Chutak 44MW hydro drops 75% in freezing winter",
        "talent_status": "Severe deficit of certified CDCP/CDCE data center and liquid cooling engineers",
        "score_ceiling": 12.0,
        "national_security_veto": True,
    },
    {
        "id": "border_leh_lac_siachen",
        "name": "Leh, Nubra & Eastern Ladakh (LAC & Siachen Frontier)",
        "aliases": ["Leh", "Nubra", "Diskit", "Turtuk", "Siachen", "Galwan", "Pangong", "Pangong Tso", "Chushul", "Demchok", "Nyoma"],
        "state": "Ladakh",
        "district": "Leh",
        "latitude": 34.1526,
        "longitude": 77.5771,
        "conflict_radius_km": 60.0,
        "hostile_border_type": "China Line of Actual Control (LAC) & Siachen Glacier Border",
        "conflict_history": "Galwan Valley Standoff (2020), Eastern Ladakh military friction points",
        "defense_vulnerability": "HIGH_LAC_MILITARY_STANDOFF_RISK",
        "winter_cutoff_months": 5,
        "mountain_pass_closure": "Khardung La, Chang La, Rohtang / Baralacha La winter snow blockades",
        "grid_status": "Islanded mountain grid; Nimoo Bazgo 45MW hydro freezes; sub-zero winter deficits",
        "talent_status": "Acute shortage of specialized AI data center operations workforce",
        "score_ceiling": 15.0,
        "national_security_veto": True,
    },
    {
        "id": "border_kupwara_loc",
        "name": "Kupwara Forward Sector (Line of Control)",
        "aliases": ["Kupwara", "Machil", "Keran", "Tangdhar", "Karna"],
        "state": "Jammu and Kashmir",
        "district": "Kupwara",
        "latitude": 34.5262,
        "longitude": 74.2546,
        "conflict_radius_km": 40.0,
        "hostile_border_type": "Pakistan Line of Control (LoC)",
        "conflict_history": "Active forward LoC sector; frequent ceasefire violations and infiltration counter-operations",
        "defense_vulnerability": "HIGH_CROSS_BORDER_SHELLING_RISK",
        "winter_cutoff_months": 4,
        "mountain_pass_closure": "Razdan and Sadhna Passes closed in severe winter",
        "grid_status": "Constrained transmission lines vulnerable to mountain tripping",
        "talent_status": "Remote rural conflict corridor; absence of Tier-III/IV operational workforce",
        "score_ceiling": 12.0,
        "national_security_veto": True,
    },
    {
        "id": "border_baramulla_uri_loc",
        "name": "Uri - Baramulla Sector (Line of Control)",
        "aliases": ["Uri", "Baramulla", "Rampur", "Boniyar"],
        "state": "Jammu and Kashmir",
        "district": "Baramulla",
        "latitude": 34.0844,
        "longitude": 74.0384,
        "conflict_radius_km": 35.0,
        "hostile_border_type": "Pakistan Line of Control (LoC)",
        "conflict_history": "Uri attack (2016); forward military zone along Jhelum gorge",
        "defense_vulnerability": "HIGH_LOC_MILITARY_RISK",
        "winter_cutoff_months": 2,
        "mountain_pass_closure": "High-altitude gorge road vulnerable to landslides and shelling",
        "grid_status": "Near Uri-I/II hydro but transmission lines exposed to hostile artillery arc",
        "talent_status": "Lack of enterprise data center technical support ecosystem",
        "score_ceiling": 14.0,
        "national_security_veto": True,
    },
    {
        "id": "border_poonch_rajouri_loc",
        "name": "Poonch - Rajouri Sector (Line of Control)",
        "aliases": ["Poonch", "Rajouri", "Mendhar", "Balakote", "Nowshera", "Sunderbani"],
        "state": "Jammu and Kashmir",
        "district": "Poonch / Rajouri",
        "latitude": 33.7667,
        "longitude": 74.0952,
        "conflict_radius_km": 35.0,
        "hostile_border_type": "Pakistan Line of Control (LoC)",
        "conflict_history": "Intense cross-border artillery exchange history; forward military zone",
        "defense_vulnerability": "HIGH_SHELLING_AND_DRONE_THREAT",
        "winter_cutoff_months": 2,
        "mountain_pass_closure": "Mughal Road closed in winter due to snow at Peer Ki Gali",
        "grid_status": "Sub-transmission radial lines vulnerable to disruptions",
        "talent_status": "Zero certified cloud/datacenter hardware maintenance workforce",
        "score_ceiling": 14.0,
        "national_security_veto": True,
    },
    {
        "id": "border_tawang_lac",
        "name": "Tawang Frontier Sector (Line of Actual Control)",
        "aliases": ["Tawang", "Bum La", "Zemithang", "Jang", "Lumla"],
        "state": "Arunachal Pradesh",
        "district": "Tawang",
        "latitude": 27.5861,
        "longitude": 91.8653,
        "conflict_radius_km": 45.0,
        "hostile_border_type": "China Line of Actual Control (LAC)",
        "conflict_history": "1962 Sino-Indian War, 2022 Yangtse clash; heavily militarized frontier",
        "defense_vulnerability": "HIGH_LAC_DISPUTED_BORDER_RISK",
        "winter_cutoff_months": 4,
        "mountain_pass_closure": "Sela Pass (13,700 ft) winter snow and blizzard conditions",
        "grid_status": "Remote radial transmission over hundreds of kilometers of landslide terrain",
        "talent_status": "Remote Himalayan border; zero enterprise tech hardware maintenance hubs",
        "score_ceiling": 15.0,
        "national_security_veto": True,
    },
    {
        "id": "border_kibithu_walong_lac",
        "name": "Kibithu - Walong Sector (Eastern LAC)",
        "aliases": ["Kibithu", "Walong", "Anjaw", "Hayuliang"],
        "state": "Arunachal Pradesh",
        "district": "Anjaw",
        "latitude": 28.2325,
        "longitude": 97.0167,
        "conflict_radius_km": 40.0,
        "hostile_border_type": "China Line of Actual Control (LAC)",
        "conflict_history": "Battle of Walong (1962); easternmost border defense corridor",
        "defense_vulnerability": "HIGH_LAC_ISOLATION_RISK",
        "winter_cutoff_months": 3,
        "mountain_pass_closure": "Lohit valley landslides and monsoon bridge washouts",
        "grid_status": "Small micro-hydro isolated grid; zero industrial baseload",
        "talent_status": "Complete absence of specialized engineering talent",
        "score_ceiling": 15.0,
        "national_security_veto": True,
    },
    {
        "id": "border_sir_creek",
        "name": "Sir Creek & Kutch Maritime Frontier",
        "aliases": ["Sir Creek", "Kori Creek", "Koteshwar", "Lakhpat"],
        "state": "Gujarat",
        "district": "Kutch",
        "latitude": 23.6333,
        "longitude": 68.2000,
        "conflict_radius_km": 30.0,
        "hostile_border_type": "Pakistan Maritime & Marsh Frontier",
        "conflict_history": "Disputed tidal marsh frontier; high military patrol and BSF water wing jurisdiction",
        "defense_vulnerability": "MARITIME_BORDER_MARSH_RISK",
        "winter_cutoff_months": 0,
        "mountain_pass_closure": "Tidal salt marsh flooding; inaccessible during high tides and monsoon",
        "grid_status": "Remote rural electrification only; saline corrosion on insulators",
        "talent_status": "Remote desert border outpost; lack of IT infrastructure workforce",
        "score_ceiling": 20.0,
        "national_security_veto": True,
    },
]

# High Altitude & Remote Isolated Districts Registry (Elevation > 2,200m or winter pass blockades)
REMOTE_TERRAIN_DISTRICTS: Dict[str, Dict[str, Any]] = {
    "kargil": {
        "avg_elevation_m": 2750.0,
        "winter_min_temp_c": -32.0,
        "air_density_loss_pct": 28.0,
        "winter_cutoff_months": 5,
        "logistics_pass": "Zojila Pass (NH-1D)",
        "grid_type": "Isolated Mountain Grid / Small Hydro (44MW Chutak)",
        "subzero_freeze_risk": "CRITICAL_FREEZE_OUT",
        "talent_scarcity": "EXTREME",
    },
    "leh": {
        "avg_elevation_m": 3500.0,
        "winter_min_temp_c": -28.0,
        "air_density_loss_pct": 33.0,
        "winter_cutoff_months": 5,
        "logistics_pass": "Rohtang & Baralacha Passes / Zojila",
        "grid_type": "Islanded Hydro/Solar Grid (45MW Nimoo Bazgo)",
        "subzero_freeze_risk": "CRITICAL_FREEZE_OUT",
        "talent_scarcity": "EXTREME",
    },
    "lahaul and spiti": {
        "avg_elevation_m": 3300.0,
        "winter_min_temp_c": -25.0,
        "air_density_loss_pct": 31.0,
        "winter_cutoff_months": 5,
        "logistics_pass": "Kunzum Pass & Atal Tunnel corridor",
        "grid_type": "Remote Mountain Grid",
        "subzero_freeze_risk": "CRITICAL_FREEZE_OUT",
        "talent_scarcity": "EXTREME",
    },
    "kinnaur": {
        "avg_elevation_m": 2500.0,
        "winter_min_temp_c": -16.0,
        "air_density_loss_pct": 25.0,
        "winter_cutoff_months": 2,
        "logistics_pass": "Hindustan-Tibet Road (NH-5 Landslide Zone)",
        "grid_type": "Hydro Export Corridor (Vulnerable to Rockfalls)",
        "subzero_freeze_risk": "HIGH_FREEZE_RISK",
        "talent_scarcity": "HIGH",
    },
    "chamoli": {
        "avg_elevation_m": 2400.0,
        "winter_min_temp_c": -14.0,
        "air_density_loss_pct": 24.0,
        "winter_cutoff_months": 2,
        "logistics_pass": "Badrinath / Joshimath subsidence zone",
        "grid_type": "Mountain Hydro Grid",
        "subzero_freeze_risk": "HIGH_FREEZE_RISK",
        "talent_scarcity": "HIGH",
    },
    "pithoragarh": {
        "avg_elevation_m": 2200.0,
        "winter_min_temp_c": -12.0,
        "air_density_loss_pct": 22.0,
        "winter_cutoff_months": 2,
        "logistics_pass": "Dharchula / Lipulekh border road",
        "grid_type": "Radial Mountain Grid",
        "subzero_freeze_risk": "MODERATE_FREEZE_RISK",
        "talent_scarcity": "HIGH",
    },
    "tawang": {
        "avg_elevation_m": 2900.0,
        "winter_min_temp_c": -15.0,
        "air_density_loss_pct": 29.0,
        "winter_cutoff_months": 4,
        "logistics_pass": "Sela Pass (NH-13)",
        "grid_type": "Remote Micro-Hydro Grid",
        "subzero_freeze_risk": "HIGH_FREEZE_RISK",
        "talent_scarcity": "EXTREME",
    },
}

def check_geostrategic_and_terrain_risk(
    lat: float,
    lon: float,
    place_name: str = "",
    district: str = "",
    state: str = "",
    elevation_m: float = 50.0,
) -> Dict[str, Any]:
    """
    Evaluates national security border conflict proximity, high-altitude thermodynamics,
    winter logistics road isolation, grid fragility, and workforce talent deficits.
    """
    query_str = f"{place_name} {district} {state}".lower().strip()
    d_clean = district.lower().strip()
    s_clean = state.lower().strip()

    # 1. Check Geodesic Distance to Sensitive Border Sectors
    closest_sector: Optional[Dict[str, Any]] = None
    min_border_dist_km = 99999.0

    for sector in SENSITIVE_BORDER_SECTORS:
        d = haversine_distance_km(lat, lon, sector["latitude"], sector["longitude"])
        if d < min_border_dist_km:
            min_border_dist_km = d
            closest_sector = sector

        # Alias / keyword direct match
        for alias in sector.get("aliases", []):
            if alias.lower() in query_str:
                if d < 100.0 or min_border_dist_km > 60.0:
                    min_border_dist_km = d
                    closest_sector = sector
                    break

    # 2. Evaluate Border Security Threat Status
    is_border_conflict_zone = False
    national_security_veto = False
    score_ceiling = 100.0
    border_name = "None"
    hostile_border_type = "None"
    conflict_history = "Secure Inland Territory"
    defense_vulnerability = "SECURE_INLAND"

    if closest_sector:
        conflict_r = closest_sector.get("conflict_radius_km", 40.0)
        has_name_match = any(alias.lower() in query_str for alias in closest_sector.get("aliases", []))

        if has_name_match or min_border_dist_km <= conflict_r or (("kargil" in query_str or "ladakh" in query_str) and min_border_dist_km <= 80.0):
            is_border_conflict_zone = True
            national_security_veto = closest_sector.get("national_security_veto", True)
            score_ceiling = closest_sector.get("score_ceiling", 15.0)
            border_name = closest_sector["name"]
            hostile_border_type = closest_sector["hostile_border_type"]
            conflict_history = closest_sector["conflict_history"]
            defense_vulnerability = closest_sector["defense_vulnerability"]
        elif min_border_dist_km <= conflict_r * 1.8:
            # Buffer border zone (e.g. 50-80 km from LoC)
            is_border_conflict_zone = True
            national_security_veto = False
            score_ceiling = 35.0
            border_name = f"{closest_sector['name']} Buffer Belt ({min_border_dist_km:.1f} km)"
            hostile_border_type = closest_sector["hostile_border_type"]
            conflict_history = "Proximity to forward military border defense corridor"
            defense_vulnerability = "ELEVATED_BORDER_BUFFER_RISK"

    # 3. Evaluate High Altitude, Winter Logistics & Sub-Zero Freezing
    remote_data = None
    for r_key, r_val in REMOTE_TERRAIN_DISTRICTS.items():
        if r_key in d_clean or r_key in query_str:
            remote_data = r_val
            break

    effective_elev = max(elevation_m, remote_data["avg_elevation_m"] if remote_data else elevation_m)
    is_high_altitude = effective_elev >= 2200.0 or (remote_data is not None)
    
    if remote_data:
        winter_cutoff_months = remote_data["winter_cutoff_months"]
        logistics_pass = remote_data["logistics_pass"]
        grid_status = remote_data["grid_type"]
        talent_status = remote_data["talent_scarcity"]
        subzero_risk = remote_data["subzero_freeze_risk"]
        winter_min_temp_c = remote_data["winter_min_temp_c"]
        air_density_loss_pct = remote_data["air_density_loss_pct"]
    elif effective_elev >= 2500.0:
        winter_cutoff_months = 4
        logistics_pass = "High-altitude mountain road vulnerable to winter snow closure"
        grid_status = "Remote high-altitude transmission line; fragile hydro dependency"
        talent_status = "CRITICAL_DEFICIT"
        subzero_risk = "CRITICAL_FREEZE_OUT"
        winter_min_temp_c = -20.0
        air_density_loss_pct = 26.0
    elif effective_elev >= 1800.0:
        winter_cutoff_months = 1
        logistics_pass = "Mountain terrain road corridor"
        grid_status = "Radial mountain grid"
        talent_status = "HIGH"
        subzero_risk = "HIGH_FREEZE_RISK"
        winter_min_temp_c = -8.0
        air_density_loss_pct = 18.0
    else:
        winter_cutoff_months = 0
        logistics_pass = "All-weather national highway connectivity"
        grid_status = "Interconnected Regional 400kV/220kV Grid Baseload"
        talent_status = "ADEQUATE_OR_HIGH"
        subzero_risk = "NEGLIGIBLE"
        winter_min_temp_c = 8.0
        air_density_loss_pct = 0.0

    # 4. Formulate Strategic Intelligence Summary
    if national_security_veto:
        status_label = "CRITICAL_NATIONAL_SECURITY_VETO"
        verdict = "STRATEGIC BORDER CONFLICT HAZARD (100% UNVIABLE FOR COMMERCIAL AI DC)"
        summary = (
            f"Location is situated in {border_name} (~{min_border_dist_km:.1f} km from {hostile_border_type}). "
            f"Historical conflict record: {conflict_history}. "
            f"Under Ministry of Home Affairs and NCIIPC Critical Information Infrastructure guidelines, "
            f"siting sovereign AI data center capacity in active border artillery/drone strike corridors is prohibited. "
            f"Terrain compounding factors: {winter_cutoff_months}-month winter road cutoff via {logistics_pass}, "
            f"{subzero_risk} (winter lows to {winter_min_temp_c}°C), {grid_status}, and {talent_status} talent pool scarcity."
        )
    elif is_border_conflict_zone:
        status_label = "ELEVATED_BORDER_ZONE_RISK"
        verdict = "FORWARD BORDER PERIMETER (REQUIRES DEFENSE & HOMELAND SECURITY CLEARANCE)"
        summary = (
            f"Location is located in the buffer zone of {border_name} ({min_border_dist_km:.1f} km to {hostile_border_type}). "
            f"Requires dual-redundant underground hardened shelters, satellite backup, and MoD/MHA security clearances. "
            f"Logistics constraint: {logistics_pass}."
        )
    elif is_high_altitude:
        status_label = "HIGH_ALTITUDE_LOGISTICS_CONSTRAINED"
        verdict = "EXTREME TERRAIN HAZARD (HIGH OPEX / UNVIABLE WINTER SLA RISK)"
        score_ceiling = min(score_ceiling, 35.0)
        summary = (
            f"Location is situated at an elevation of {effective_elev:.0f}m ASL with {air_density_loss_pct:.0f}% atmospheric density penalty. "
            f"Subject to {winter_cutoff_months}-month winter road cutoff via {logistics_pass}. "
            f"Severe sub-zero freeze-out risk ({winter_min_temp_c}°C) and {talent_status} talent shortage."
        )
    else:
        status_label = "SECURE_INLAND_INDUSTRIAL"
        verdict = "STRATEGICALLY SECURE INLAND INFRASTRUCTURE ZONE"
        summary = (
            f"Site is located {min_border_dist_km:.1f} km from sensitive border defense corridors in secure inland territory. "
            f"All-weather highway connectivity and standard grid resilience active."
        )

    return {
        "is_border_conflict_zone": is_border_conflict_zone,
        "national_security_veto": national_security_veto,
        "is_high_altitude": is_high_altitude,
        "border_name": border_name,
        "hostile_border_type": hostile_border_type,
        "distance_to_border_km": min_border_dist_km,
        "defense_vulnerability": defense_vulnerability,
        "winter_cutoff_months": winter_cutoff_months,
        "mountain_pass_closure": logistics_pass,
        "grid_status": grid_status,
        "talent_status": talent_status,
        "subzero_risk": subzero_risk,
        "winter_min_temp_c": winter_min_temp_c,
        "air_density_loss_pct": air_density_loss_pct,
        "score_ceiling": score_ceiling,
        "status_label": status_label,
        "verdict": verdict,
        "summary": summary,
    }
