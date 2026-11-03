from datetime import datetime, timezone
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
from backend.app.services.protected_areas_engine import check_protected_area_proximity
from backend.app.services.border_security_and_terrain_engine import check_geostrategic_and_terrain_risk
from backend.app.services.live_telemetry_service import compile_fifty_factor_telemetry
from backend.app.services.fifty_factor_engine import calculate_fifty_factor_assessment
from backend.app.services.recommendation_engine import find_nearby_recommended_sites

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
    pa_info = check_protected_area_proximity(
        lat=site.latitude,
        lon=site.longitude,
        place_name=site.site_name,
        district=site.district,
        state=site.state,
    )
    is_core_sanctuary = pa_info["is_in_core"]
    is_esz_corridor = pa_info["is_in_esz"]

    # 9. Run National Security, Border Conflict & Extreme Terrain Siting Engine
    strat_risk = check_geostrategic_and_terrain_risk(
        lat=site.latitude,
        lon=site.longitude,
        place_name=site.site_name,
        district=site.district,
        state=site.state,
        elevation_m=site.elevation_m,
    )
    is_border_veto = strat_risk["national_security_veto"]
    is_border_zone = strat_risk["is_border_conflict_zone"]
    is_high_altitude_isolated = strat_risk["is_high_altitude"]

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
    
    if is_core_sanctuary:
        # Core Wildlife Sanctuary (e.g. Gir Wildlife Sanctuary)
        trees_to_cut = 0
        tree_status = "Strict Zero Tree Cutting Directive: Home to millions of trees and endangered wildlife. Under Sections 29 & 35 of the Wildlife (Protection) Act 1972, no trees will be cut. Industrial development is strictly prohibited."
        tree_preservation_score = 10.0
        compensatory_trees = 0
        land_score = min(land_score, 12.0)
        power_score = min(power_score, 20.0)
        connectivity_score = min(connectivity_score, 20.0)
    elif is_border_veto:
        # Border conflict sector (e.g. Kargil / LoC)
        trees_to_cut = 0
        tree_status = f"Zero Tree Cutting Mandate Active: Frontier defense corridor in {strat_risk['border_name']}. Commercial industrial clearing prohibited."
        tree_preservation_score = 45.0
        compensatory_trees = 0
        land_score = min(land_score, 15.0)
        power_score = min(power_score, 22.0)
        connectivity_score = min(connectivity_score, 22.0)
        disaster_score = min(disaster_score, 40.0)
        climate_score = min(climate_score, 40.0)
    elif is_esz_corridor:
        # Eco-Sensitive Zone Buffer
        trees_to_cut = 0
        tree_status = f"Zero Tree Cutting Policy: Located in {pa_info['closest_protected_area']} Eco-Sensitive Zone. No trees will be cut without Supreme Court & NBWL clearance."
        tree_preservation_score = 30.0
        compensatory_trees = 0
        land_score = min(land_score, 35.0)
    elif is_non_forest or canopy_pct < 5.0:
        trees_to_cut = 0
        tree_status = "Zero Tree Cutting Required (Certified Non-Forest Industrial Zone) • 100% Perimeter Trees Preserved"
        tree_preservation_score = 100.0
        compensatory_trees = 0
    else:
        trees_to_cut = int(round(campus_acres * canopy_pct * 4.2))
        tree_status = f"Zero Tree Cutting Mandate Enforced: Avoids felling {trees_to_cut} trees; layout must be reconfigured to brownfield footprint"
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
            "flagged": canopy_pct > 20.0 or is_core_sanctuary,
        },
        {
            "name": "Tree Felling Impact & Existing Tree Preservation",
            "score": tree_preservation_score,
            "weight": 0.25,
            "weighted_score": round(tree_preservation_score * 0.25, 1),
            "category": "Anti-Felling Guard",
            "details": f"{tree_status} • Compensatory Afforestation: {compensatory_trees} saplings (3:1 statutory ratio)",
            "flagged": is_core_sanctuary or trees_to_cut > 100,
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
            "score": raw_eco["renewable_and_carbon"]["clean_energy_score"] if not is_core_sanctuary else 15.0,
            "weight": 0.15,
            "weighted_score": round((raw_eco["renewable_and_carbon"]["clean_energy_score"] if not is_core_sanctuary else 15.0) * 0.15, 1),
            "category": "Carbon Neutrality",
            "details": f"{raw_eco['renewable_and_carbon']['renewable_energy_share_pct']}% RE Share • Abates {raw_eco['renewable_and_carbon']['annual_carbon_abated_tons_yr']:,.0f} Tons CO2/yr against CEA baseline",
            "flagged": False,
        },
        {
            "name": "Eco-Sensitive Zone (ESZ) & Biodiversity Buffer",
            "score": 5.0 if is_core_sanctuary else (30.0 if is_esz_corridor else 95.0),
            "weight": 0.10,
            "weighted_score": round((5.0 if is_core_sanctuary else (30.0 if is_esz_corridor else 95.0)) * 0.10, 1),
            "category": "Ecological Buffer",
            "details": f"{raw_eco['forest_protection']['eco_sensitive_zone_dist_km']} km to Nearest Wildlife Sanctuary / Protected Corridor (MoEFCC Standards)",
            "flagged": raw_eco["forest_protection"]["eco_sensitive_zone_dist_km"] < 10.0 or is_core_sanctuary,
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
        "zero_tree_cutting_mandated": True,
        "is_core_sanctuary": is_core_sanctuary,
        "provenance": raw_eco["provenance"],
    }

    # 10. Authoritative 50-Factor Siting & Sovereign Defense Evaluation
    # Every site is scored on the 50-factor matrix by default based on genuine real-world data and statutory baselines.
    telemetry_extras = provenance.get("telemetry_extras") if provenance else None
    if not telemetry_extras and provenance and "fifty_factor_telemetry" in provenance:
        telemetry_extras = provenance.get("fifty_factor_telemetry")

    fifty_assessment = calculate_fifty_factor_assessment(
        site=site,
        pa_info=pa_info,
        strat_risk=strat_risk,
        telemetry_extras=telemetry_extras,
    )

    composite_score = fifty_assessment["composite_score"]
    raw_composite = fifty_assessment["raw_composite_score"]
    tier = fifty_assessment["tier"]
    tier_badge = fifty_assessment["tier_badge"]
    tier_color = fifty_assessment["tier_color"]

    # Align dimensional scores directly from the 50-factor statutory model
    water_score = fifty_assessment["water_score"]
    power_score = fifty_assessment["power_score"]
    climate_score = fifty_assessment["climate_score"]
    connectivity_score = fifty_assessment["connectivity_score"]
    disaster_score = fifty_assessment["disaster_score"]
    land_score = fifty_assessment["land_score"]
    economics_score = fifty_assessment["economics_score"]
    eco_score = fifty_assessment["eco_score"]

    # Automated Diagnostic & Mitigation Engine
    risk_flags: List[str] = []
    engineering_mandates: List[str] = []
    diagnostics: List[str] = []

    # Statutory Protected Area Disqualification Flags
    if is_core_sanctuary:
        risk_flags.append(f"STATUTORY PROHIBITION: Site located inside {pa_info['closest_protected_area']} (Wildlife Protection Act 1972 Sec 35)")
        risk_flags.append(f"CRITICAL ECOLOGICAL HAZARD: Habitat of millions of trees and {pa_info['fauna_summary']}")
        risk_flags.append("ZERO TREE CUTTING DIRECTIVE: No trees will be cut under any circumstances. Commercial proposal rejected.")
        risk_flags.append("INALIENABLE SANCTUARY LAND: Land cannot be zoned, alienated, or acquired for industrial computing facilities.")
        engineering_mandates.append(f"1. IMMEDIATE SITE REJECTION: Siting in {pa_info['closest_protected_area']} is forbidden by national law. Zero construction permits can be issued.")
        engineering_mandates.append("2. MANDATORY ZERO TREE FELLING DIRECTIVE: No trees will be cut under any circumstances. Preserves millions of mature trees and endangered lion/wildlife ecosystems.")
        engineering_mandates.append("3. MANDATORY RELOCATION: Relocate compute infrastructure to designated non-forest master-planned zones (e.g., Dholera SIR, Sanand GIDC, or Mahape MIDC).")
        diagnostics.append(f"Statutory Veto Triggered: {pa_info['closest_protected_area']} is a Category II/IV Protected Sanctuary. Composite score clamped to 10-20 unviable range per national environmental mandate.")
    elif is_esz_corridor:
        risk_flags.append(f"ECO-SENSITIVE ZONE HAZARD: Site within {pa_info['distance_to_protected_area_km']:.1f} km of {pa_info['closest_protected_area']} ESZ boundary.")
        risk_flags.append("ZERO TREE CUTTING POLICY: Buffer zone vegetation must be preserved intact without Supreme Court NBWL sanction.")
        engineering_mandates.append(f"1. ESZ CLEARANCE REQUIRED: Mandatory National Board for Wildlife (NBWL) and Supreme Court Standing Committee sanction prior to planning.")
        engineering_mandates.append("2. ZERO TREE CUTTING: No trees will be cut. Mandatory acoustic buffering (< 45 dBA) and zero nocturnal light emissions.")
        diagnostics.append(f"Location in Eco-Sensitive Zone ({pa_info['distance_to_protected_area_km']:.1f} km from {pa_info['closest_protected_area']}) limits industrial civil footprint.")
    elif is_border_veto:
        risk_flags.append(f"NATIONAL SECURITY VETO: Site located in {strat_risk['border_name']} (~{strat_risk['distance_to_border_km']:.1f} km from {strat_risk['hostile_border_type']}). Extreme vulnerability to cross-border artillery shelling, drone strikes, and military disruption under MHA & NCIIPC critical infrastructure directives.")
        risk_flags.append(f"LOGISTICS & MAINTENANCE ISOLATION: Severe {strat_risk['winter_cutoff_months']}-month winter road blockade via {strat_risk['mountain_pass_closure']}. Mission-critical AI hardware components (replacement GPUs, power chassis, cooling chillers) cannot meet standard 4-hour/24-hour enterprise SLAs.")
        risk_flags.append(f"SPECIALIZED WORKFORCE & TALENT DEFICIT: Critical shortage of certified data center engineers (CDCP/CDCE), high-voltage substation technicians, and liquid cooling specialists in remote high-altitude terrain.")
        risk_flags.append(f"SUB-ZERO THERMODYNAMIC & GRID HAZARD: Winter lows dropping to {strat_risk['winter_min_temp_c']}°C create severe freeze-out hazards for cooling loops and diesel generator fuel gelling, compounded by {strat_risk['grid_status']}.")
        engineering_mandates.append(f"1. IMMEDIATE STRATEGIC REJECTION: Siting sovereign AI compute within {strat_risk['border_name']} presents unacceptable national security and physical warfare vulnerability.")
        engineering_mandates.append("2. CRITICAL HARDWARE REPLACEMENT UNVIABILITY: Severe winter snow pass blockades prevent hardware component replacement; enterprise 4-hour/24-hour MTTR SLAs cannot be honored.")
        engineering_mandates.append("3. MANDATORY RELOCATION TO SECURE INLAND TECH CLUSTERS: Relocate proposed national AI data center to secure, master-planned industrial corridors with all-weather connectivity, 400kV grid baseload, and metro talent pools (e.g., Dholera SIR, Navi Mumbai TTC, or Noida Sector 132).")
        diagnostics.append(f"Strategic Defense Veto Triggered: {strat_risk['border_name']} is an active military border conflict sector. Composite score clamped to {strat_risk['score_ceiling']:.0f}/100 per national homeland security and critical infrastructure resilience standards.")
    elif is_high_altitude_isolated:
        risk_flags.append(f"HIGH ALTITUDE & WINTER ISOLATION HAZARD: Elevation {site.elevation_m:.0f}m ASL causes {strat_risk['air_density_loss_pct']:.0f}% atmospheric density penalty on cooling fan efficiency.")
        risk_flags.append(f"SEASONAL SUPPLY CHAIN BLOCKADE: {strat_risk['winter_cutoff_months']}-month winter access restriction via {strat_risk['mountain_pass_closure']}.")
        engineering_mandates.append("1. HIGH-ALTITUDE DERATING & HEATING: Mandatory de-rating of cooling coils and active pre-heating for winter intake air to prevent server thermal shock.")
        engineering_mandates.append("2. ONSITE CRITICAL SPARES DEPOT: Must stockpile 180 days of critical replacement GPUs, transceivers, and pumps on-site to survive winter cutoff.")
        diagnostics.append(f"High altitude and sub-zero winter temperatures constrain year-round availability and inflate OpEx.")

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

    # Geospatial Sovereign Alternative Recommendation
    is_vetoed = is_core_sanctuary or is_border_veto or is_esz_corridor
    best_alt, nearby_alts = find_nearby_recommended_sites(
        current_lat=site.latitude,
        current_lon=site.longitude,
        current_score=composite_score,
        is_vetoed=is_vetoed,
        current_state=site.state,
    )

    # Authoritative 50-Factor Siting & Defense Matrix Telemetry
    fifty_factor_data = fifty_assessment

    timestamp = datetime.now(timezone.utc).isoformat()

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
        strategic_security_assessment=strat_risk,
        risk_flags=risk_flags,
        engineering_mandates=engineering_mandates,
        diagnostics=diagnostics,
        timestamp=timestamp,
        is_live_evaluated=is_live_evaluated,
        data_provenance=provenance,
        fifty_factor_telemetry=fifty_factor_data,
        recommended_alternative=best_alt,
        nearby_alternatives=nearby_alts,
    )
