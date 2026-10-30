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

def assess_site(site: SiteInput, provenance: Optional[Dict[str, Any]] = None, is_live_evaluated: bool = False) -> SiteAssessmentResponse:
    """
    Core Architecture Axiom:
    'One model -> one responsibility -> domain aggregator -> composite site assessment.'
    
    Composite Site Score = 
        (Water * 0.20) + (Power * 0.25) + (Climate * 0.15) + (Connectivity * 0.15) +
        (Disaster * 0.10) + (Land * 0.08) + (Economics * 0.07)
    
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

    # Composite Siting Synthesis (Domain Weights sum to 1.00)
    composite_score = round(
        (water_score * 0.20)
        + (power_score * 0.25)
        + (climate_score * 0.15)
        + (connectivity_score * 0.15)
        + (disaster_score * 0.10)
        + (land_score * 0.08)
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
        water_assessment=water_result,
        power_assessment=power_result,
        climate_assessment=climate_result.model_dump(),
        connectivity_assessment=connectivity_result.model_dump(),
        disaster_assessment=disaster_result.model_dump(),
        land_assessment=land_result.model_dump(),
        economics_assessment=economics_result.model_dump(),
        risk_flags=risk_flags,
        engineering_mandates=engineering_mandates,
        diagnostics=diagnostics,
        timestamp=timestamp,
        is_live_evaluated=is_live_evaluated,
        data_provenance=provenance,
    )
