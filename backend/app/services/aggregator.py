from datetime import datetime
from typing import List, Tuple, Optional, Dict, Any
from backend.app.models.schemas import (
    SiteInput,
    SiteAssessmentResponse,
)
from backend.app.services.water_engine import calculate_water_assessment
from backend.app.services.power_engine import calculate_power_assessment
from backend.app.services.climate_engine import calculate_climate_assessment
from backend.app.services.connectivity_engine import calculate_connectivity_assessment
from backend.app.services.disaster_engine import calculate_disaster_assessment
from backend.app.services.land_engine import calculate_land_assessment
from backend.app.services.economics_engine import calculate_economics_assessment
from backend.app.services.eco_telemetry_service import run_eco_assessment

def assess_site(site: SiteInput, provenance: Optional[Dict[str, Any]] = None, is_live_evaluated: bool = False) -> SiteAssessmentResponse:
    """
    Core Architecture Axiom:
    'One model -> one responsibility -> domain aggregator -> composite site assessment.'
    
    Composite Site Score (8 Dimensions, Weights sum to 1.00):
        (Power * 0.20) + (Water * 0.18) + (Ecology & Forests * 0.15) + (Climate * 0.13) +
        (Connectivity * 0.12) + (Disaster * 0.08) + (Land * 0.07) + (Economics * 0.07)
    
    Classification Tiers:
      >= 75.0: VIABLE / RECOMMENDED (Green)
      50.0 - 74.9: CONDITIONAL / HIGH RISK (Amber)
      < 50.0: UNVIABLE / REJECT (Red)
    """
    # 1. Run 7-Model Water Engine
    water_result = calculate_water_assessment(site.water_params)
    water_score = water_result.water_score

    # 2. Run Electrical Grid Engine
    power_result = calculate_power_assessment(site.power_params)
    power_score = power_result.power_score

    # 3. Run Climate & Psychrometrics Engine
    climate_result = calculate_climate_assessment(site.climate_params)
    climate_score = climate_result.climate_score

    # 4. Run Connectivity & Fiber Engine
    connectivity_result = calculate_connectivity_assessment(site.connectivity_params)
    connectivity_score = connectivity_result.connectivity_score

    # 5. Run Disaster & Physical Hazard Engine
    disaster_result = calculate_disaster_assessment(site.disaster_params)
    disaster_score = disaster_result.disaster_resilience_score

    # 6. Run Land & Civil Infrastructure Engine
    land_result = calculate_land_assessment(site.land_params)
    land_score = land_result.land_score

    # 7. Run Economics & State Policy Engine
    economics_result = calculate_economics_assessment(site.economics_params)
    economics_score = economics_result.economics_score

    # 8. Run Ecology, Forest & Tree Protection Engine
    cooling_mode = getattr(site.eco_params, "cooling_mode", "DIRECT_TO_CHIP_LIQUID") if site.eco_params else "DIRECT_TO_CHIP_LIQUID"
    solar_rooftop = getattr(site.eco_params, "solar_rooftop_mw", 2.5) if site.eco_params else 2.5
    solar_ppa = getattr(site.eco_params, "offsite_solar_ppa_mw", 45.0) if site.eco_params else 45.0
    
    raw_eco = run_eco_assessment(
        lat=site.latitude,
        lon=site.longitude,
        site_name=site.site_name,
        district=site.district,
        state=site.state,
        it_load_mw=site.proposed_it_load_mw,
        cooling_mode=cooling_mode,
        solar_rooftop_mw=solar_rooftop,
        offsite_solar_ppa_mw=solar_ppa,
        aquifer_soe_pct=site.water_params.groundwater_extraction_pct,
        solar_ghi=5.4,
        wind_speed=5.2,
    )

    # Estimate tree felling impact on site
    campus_acres = getattr(site.eco_params, "campus_area_acres", site.land_params.contiguous_parcel_acres) if site.eco_params else site.land_params.contiguous_parcel_acres
    is_non_forest = (site.eco_params.is_notified_non_forest if site.eco_params else site.land_params.is_notified_it_industrial_zone)
    canopy_pct = raw_eco["forest_protection"]["tree_canopy_cover_pct"]
    
    if is_non_forest or canopy_pct < 5.0:
        trees_to_cut = 0
        tree_status = "Zero Tree Cutting Required (Certified Industrial/Brownfield)"
        tree_preservation_score = 100.0
    else:
        trees_to_cut = int(round(campus_acres * canopy_pct * 4.2))
        tree_status = f"Estimated {trees_to_cut} Trees Felling Required"
        tree_preservation_score = max(20.0, 100.0 - (trees_to_cut * 0.15))
    
    compensatory_trees = max(150, trees_to_cut * 3) if trees_to_cut > 0 else 0

    # Sub-metrics for explainability panel
    eco_sub_metrics = [
        {
            "name": "Tree Canopy & Land Non-Forest Status",
            "score": raw_eco["forest_protection"]["forest_score"],
            "weight": 0.25,
            "weighted_score": round(raw_eco["forest_protection"]["forest_score"] * 0.25, 1),
            "category": "Deforestation Guard",
            "details": f"{canopy_pct:.1f}% Canopy Density • {raw_eco['forest_protection']['forest_classification']} (FSI ISFR 2023 / GFW)",
            "flagged": canopy_pct > 20.0,
        },
        {
            "name": "Tree Felling Impact & Existing Tree Preservation",
            "score": tree_preservation_score,
            "weight": 0.25,
            "weighted_score": round(tree_preservation_score * 0.25, 1),
            "category": "Anti-Felling Guard",
            "details": f"{tree_status} • Compensatory Afforestation: {compensatory_trees} saplings (3:1 statutory ratio)",
            "flagged": trees_to_cut > 100,
        },
        {
            "name": "Aquifer Protection & Zero Water Shortage",
            "score": raw_eco["water_preservation"]["water_score"],
            "weight": 0.25,
            "weighted_score": round(raw_eco["water_preservation"]["water_score"] * 0.25, 1),
            "category": "Hydrological Shield",
            "details": f"Conserves {raw_eco['water_preservation']['daily_water_saved_liters']/1000:,.0f} kL/day with closed-loop DLC • GloFAS River Flow: {raw_eco['glofas_hydrology']['river_discharge_m3_s']} m³/s",
            "flagged": raw_eco["water_preservation"]["water_score"] < 50.0,
        },
        {
            "name": "Clean Energy Transition & Grid Carbon Offset",
            "score": raw_eco["renewable_and_carbon"]["clean_energy_score"],
            "weight": 0.15,
            "weighted_score": round(raw_eco["renewable_and_carbon"]["clean_energy_score"] * 0.15, 1),
            "category": "Carbon Neutrality",
            "details": f"{raw_eco['renewable_and_carbon']['renewable_energy_share_pct']}% RE Share • Abates {raw_eco['renewable_and_carbon']['annual_carbon_abated_tons_yr']:,.0f} Tons CO2/yr against CEA baseline",
            "flagged": False,
        },
        {
            "name": "Eco-Sensitive Zone (ESZ) & Biodiversity Buffer",
            "score": 95.0 if raw_eco["forest_protection"]["eco_sensitive_zone_dist_km"] >= 15.0 else 60.0,
            "weight": 0.10,
            "weighted_score": round((95.0 if raw_eco["forest_protection"]["eco_sensitive_zone_dist_km"] >= 15.0 else 60.0) * 0.10, 1),
            "category": "Ecological Buffer",
            "details": f"{raw_eco['forest_protection']['eco_sensitive_zone_dist_km']} km to Nearest Wildlife Sanctuary / Protected Corridor (MoEFCC Standards)",
            "flagged": raw_eco["forest_protection"]["eco_sensitive_zone_dist_km"] < 10.0,
        },
    ]

    eco_score = round(sum(sm["weighted_score"] for sm in eco_sub_metrics), 1)

    eco_assessment_output = {
        "score": eco_score,
        "weights": {"tree_canopy": 0.25, "tree_felling": 0.25, "aquifer_shield": 0.25, "clean_energy": 0.15, "esz_buffer": 0.10},
        "sub_metrics": eco_sub_metrics,
        "summary": f"Eco-Feasibility Index {eco_score:.1f}/100. {tree_status}. Water conserved: {raw_eco['water_preservation']['daily_water_saved_liters']/1000:,.0f} kL/day.",
        "estimated_trees_to_cut": trees_to_cut,
        "tree_preservation_status": tree_status,
        "compensatory_afforestation_trees": compensatory_trees,
        "canopy_cover_pct": canopy_pct,
        "esz_proximity_km": raw_eco["forest_protection"]["eco_sensitive_zone_dist_km"],
        "daily_water_saved_liters": raw_eco["water_preservation"]["daily_water_saved_liters"],
        "wue_cooling": raw_eco["water_preservation"]["water_usage_effectiveness_wue"],
        "annual_carbon_abated_tons": raw_eco["renewable_and_carbon"]["annual_carbon_abated_tons_yr"],
        "re_share_pct": raw_eco["renewable_and_carbon"]["renewable_energy_share_pct"],
        "provenance": raw_eco["provenance"],
    }

    # 8-Domain Weighted Composite Score (Domain Weights sum to 1.00)
    composite_score = round(
        (power_score * 0.20)
        + (water_score * 0.18)
        + (eco_score * 0.15)
        + (climate_score * 0.13)
        + (connectivity_score * 0.12)
        + (disaster_score * 0.08)
        + (land_score * 0.07)
        + (economics_score * 0.07),
        2,
    )

    # Classification Tiers
    if composite_score >= 75.0:
        tier = "VIABLE / RECOMMENDED"
        tier_badge = "VIABLE"
        tier_color = "#10B981"  # Emerald green
    elif composite_score >= 50.0:
        tier = "CONDITIONAL / HIGH RISK"
        tier_badge = "CONDITIONAL"
        tier_color = "#F59E0B"  # Amber
    else:
        tier = "UNVIABLE / REJECT"
        tier_badge = "UNVIABLE"
        tier_color = "#EF4444"  # Red

    # Automated Diagnostic & Mitigation Engine
    risk_flags: List[str] = []
    engineering_mandates: List[str] = []
    diagnostics: List[str] = []

    # Water Mandate 1: Demand Stress <= 50
    demand_metric = next(
        (sm for sm in water_result.sub_metrics if sm.key == "demand_stress"), None
    )
    demand_stress_score = demand_metric.score if demand_metric else 100.0

    if demand_stress_score <= 50.0:
        risk_flags.append("Competitive industrial extraction stress")
        engineering_mandates.append(
            "1. Deploy on-site closed-loop cooling towers. 2. Tap MIDC/Municipal CETP tertiary treated greywater to avoid municipal cuts."
        )
        diagnostics.append(
            f"Demand stress score ({demand_stress_score:.1f}/100) breached the <= 50 threshold due to severe competing regional water abstraction."
        )
    elif demand_stress_score < 60.0:
        risk_flags.append("Moderate industrial demand stress (Warning)")
        diagnostics.append(
            f"Demand stress score ({demand_stress_score:.1f}/100) triggered automated stress flag (< 60 threshold)."
        )

    # Water Mandate 2: Coastal / Flood Elevation < 10m
    site_elevation = min(site.elevation_m, site.water_params.elevation_m)
    if site_elevation < 10.0:
        risk_flags.append("100-year flood zone & CRZ restrictions")
        engineering_mandates.append("Unviable for sub-grade electrical infrastructure.")
        diagnostics.append(
            f"Site ground elevation ({site_elevation:.1f}m) is below the 10m threshold; vulnerable to high-tide coastal surge and Coastal Regulation Zone (CRZ) clauses."
        )

    # Power Mandate 1: Substation distance > 5km
    if site.power_params.substation_distance_km > 5.0:
        risk_flags.append("Transmission Right-of-Way (RoW) acquisition latency")
        engineering_mandates.append(
            "Construct dedicated EHV transmission line corridor with redundant dual-circuit bays."
        )
        diagnostics.append(
            f"Substation distance is {site.power_params.substation_distance_km:.2f} km; high risk of easement disputes and line construction delays."
        )

    # Power Mandate 2: Substation spare margin < 40 MVA
    if site.power_params.spare_mva_margin < 40.0:
        risk_flags.append("Constrained N-1 contingency grid margin")
        engineering_mandates.append(
            "Require captive Gas Insulated Substation (GIS) or upfront utility transformer augmentation."
        )
        diagnostics.append(
            f"Substation spare capacity ({site.power_params.spare_mva_margin:.0f} MVA) cannot guarantee N-1 contingency for {site.proposed_it_load_mw:.0f} MW IT load."
        )

    # Storage Mandate: On-site storage < 72 hours
    if site.water_params.on_site_storage_hours < 72.0:
        risk_flags.append("Sub-72-hour emergency cooling buffer vulnerability")
        engineering_mandates.append(
            "Expand on-site water reservoir or install atmospheric water generation (AWG) standby system."
        )
        diagnostics.append(
            f"Emergency storage buffer ({site.water_params.on_site_storage_hours:.0f}h) is below the 72-hour mission-critical mandate."
        )

    # Climate Mandate: Wet bulb > 28°C
    if climate_result.wet_bulb_temp_c > 28.0:
        risk_flags.append("Elevated Wet-Bulb Cooling Limit Exceeded")
        engineering_mandates.append(
            "Mandate Direct-to-Chip (D2C) liquid cooling or adiabatic hybrid coolers to prevent thermal shutdown during summer peaks."
        )
        diagnostics.append(
            f"Design wet-bulb temperature ({climate_result.wet_bulb_temp_c}°C) limits open-circuit cooling tower thermal dissipation."
        )

    # Disaster Mandate: Seismic Zone IV or V
    if site.disaster_params.seismic_zone.upper() in ["IV", "V"]:
        risk_flags.append(f"High Seismic Hazard (Zone {site.disaster_params.seismic_zone.upper()})")
        engineering_mandates.append(
            "Implement base-isolated foundation pads and flexible structural bellows for high-voltage bus ducts."
        )
        diagnostics.append(
            f"Location in Seismic Zone {site.disaster_params.seismic_zone.upper()} mandates IS 1893:2016 ductile detailing."
        )

    # Land Mandate: Non-notified industrial zone
    if not site.land_params.is_notified_it_industrial_zone:
        risk_flags.append("Statutory Land Use Non-Conformity")
        engineering_mandates.append(
            "Obtain mandatory Change of Land Use (CLU) notification and State Pollution Control Board CTE approval before EPC mobilization."
        )
        diagnostics.append("Site is not situated in a pre-notified industrial or IT development corridor.")

    # Eco & Forest Mandate: Tree felling & existing canopy preservation
    if trees_to_cut > 0:
        risk_flags.append(f"Tree Felling Required ({trees_to_cut} mature trees on parcel)")
        engineering_mandates.append(
            f"Mandatory 3:1 Compensatory Afforestation: Plant and nurture {compensatory_trees} native endemic trees along campus perimeter with survival monitoring (MoEFCC Green Protocol)."
        )
        diagnostics.append(
            f"Greenfield tree canopy density ({canopy_pct:.1f}%) requires felling approximately {trees_to_cut} trees across the {campus_acres} acre campus footprint."
        )
    else:
        engineering_mandates.append(
            "Zero Tree Felling Certified: Site confirmed on master-planned non-forest industrial land (MIDC/GIDC). Mandate preservation of existing perimeter trees."
        )
        diagnostics.append("Site confirmed on certified industrial brownfield / non-forest zone; zero trees to be felled.")

    # Water Conservation & Aquifer Shield Mandate
    daily_saved = raw_eco["water_preservation"]["daily_water_saved_liters"]
    if daily_saved > 500_000:
        engineering_mandates.append(
            f"Closed-Loop Aquifer Shield: Conserves {daily_saved/1000:,.0f} kL/day over conventional evaporative towers; Zero municipal water depletion in {site.district}."
        )
        diagnostics.append(f"Closed-loop liquid cooling loop delivers {raw_eco['water_preservation']['water_saved_percentage']}% water savings with WUE {raw_eco['water_preservation']['water_usage_effectiveness_wue']} L/kWh.")

    timestamp = datetime.utcnow().isoformat() + "Z"

    return SiteAssessmentResponse(
        site_id=site.site_id,
        site_name=site.site_name,
        state=site.state,
        district=site.district,
        latitude=site.latitude,
        longitude=site.longitude,
        elevation_m=site.elevation_m,
        proposed_it_load_mw=site.proposed_it_load_mw,
        composite_score=composite_score,
        tier=tier,
        tier_badge=tier_badge,
        tier_color=tier_color,
        water_score=water_score,
        power_score=power_score,
        climate_score=climate_score,
        connectivity_score=connectivity_score,
        disaster_score=disaster_score,
        land_score=land_score,
        economics_score=economics_score,
        eco_score=eco_score,
        water_assessment=water_result,
        power_assessment=power_result,
        climate_assessment=climate_result.model_dump(),
        connectivity_assessment=connectivity_result.model_dump(),
        disaster_assessment=disaster_result.model_dump(),
        land_assessment=land_result.model_dump(),
        economics_assessment=economics_result.model_dump(),
        eco_assessment=eco_assessment_output,
        risk_flags=risk_flags,
        engineering_mandates=engineering_mandates,
        diagnostics=diagnostics,
        timestamp=timestamp,
        is_live_evaluated=is_live_evaluated,
        data_provenance=provenance,
    )
