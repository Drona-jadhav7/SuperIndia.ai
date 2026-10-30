from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

# ==========================================
# Domain 1: Water Subsystem Schema
# ==========================================
class WaterInput(BaseModel):
    groundwater_extraction_pct: float = Field(
        75.0, description="CGWA groundwater stage of extraction percentage"
    )
    water_quality_tds: float = Field(
        500.0, description="Total Dissolved Solids in mg/L (BIS 10500)"
    )
    demand_stress_score: Optional[float] = Field(
        None, description="Explicit demand stress score 0-100 or computed dynamically"
    )
    data_center_demand_mld: float = Field(
        1.5, description="Projected data center cooling & operational water demand in MLD"
    )
    local_aquifer_stress_pct: float = Field(
        65.0, description="Local competing aquifer draft & industrial stress percentage"
    )
    industrial_density_index: float = Field(
        60.0, description="Industrial density index (0-100)"
    )
    stp_distance_km: float = Field(
        4.0, description="Distance to nearest STP / CETP tertiary treatment plant in km"
    )
    tertiary_supply_mld: float = Field(
        20.0, description="Tertiary treated recycled greywater availability in MLD"
    )
    assured_supply_mld: float = Field(
        2.5, description="Assured municipal / canal / industrial pipeline water supply in MLD"
    )
    on_site_storage_hours: float = Field(
        48.0, description="Dedicated on-site emergency water storage headroom in hours (72h buffer target)"
    )
    elevation_m: float = Field(
        25.0, description="Site ground surface elevation in meters above sea level"
    )
    drought_risk_index: float = Field(
        30.0, description="Climate drought vulnerability index 0-100"
    )
    flood_zone_risk: float = Field(
        20.0, description="100-year flood zone vulnerability index 0-100"
    )

# ==========================================
# Domain 2: Electrical Grid Schema
# ==========================================
class PowerInput(BaseModel):
    substation_distance_km: float = Field(
        2.0, description="Distance to nearest 400kV/220kV EHV substation in km"
    )
    voltage_class_kv: float = Field(
        220.0, description="Interconnection voltage class in kV (400, 220, 132, 66, 33, 11)"
    )
    spare_mva_margin: float = Field(
        80.0, description="Substation spare N-1 transformer headroom margin in MVA"
    )
    proposed_it_load_mw: float = Field(
        50.0, description="Proposed AI data center IT load in MW"
    )
    renewable_open_access_score: float = Field(
        75.0, description="Renewable Open Access / ISTS corridor accessibility score (0-100)"
    )

# ==========================================
# Domain 3: Climate & Psychrometrics Schema
# ==========================================
class ClimateInput(BaseModel):
    dry_bulb_temp_c: float = Field(32.0, description="Annual peak design dry-bulb temperature in °C")
    relative_humidity_pct: float = Field(65.0, description="Design relative humidity %")
    annual_cooling_degree_days: float = Field(2800.0, description="Cooling Degree Days (CDD base 18.3°C)")
    air_quality_pm25: float = Field(45.0, description="Annual mean PM2.5 in µg/m³ (CPCB standard)")
    extreme_heat_days: float = Field(15.0, description="Annual days > 42°C")

# ==========================================
# Domain 4: Connectivity & Fiber Backbone
# ==========================================
class ConnectivityInput(BaseModel):
    fiber_backbone_distance_km: float = Field(1.5, description="Distance to dark fiber trunk in km")
    rtt_to_landing_station_ms: float = Field(5.0, description="RTT to subsea cable landing station in ms")
    nixi_distance_km: float = Field(20.0, description="Distance to NIXI node in km")
    carrier_neutral_providers_count: int = Field(4, description="Tier-1 telco providers present")
    dark_fiber_routes_count: int = Field(3, description="Redundant physical fiber routes")

# ==========================================
# Domain 5: Disaster & Physical Hazard
# ==========================================
class DisasterInput(BaseModel):
    seismic_zone: str = Field("III", description="Seismic Zone per IS 1893:2016 (II, III, IV, V)")
    elevation_above_hfl_m: float = Field(3.5, description="Elevation above 100-year High Flood Level in meters")
    cyclone_wind_speed_ms: float = Field(39.0, description="Basic peak wind speed in m/s")
    landslide_risk_index: float = Field(10.0, description="Landslide risk index 0-100")
    industrial_hazard_distance_km: float = Field(8.0, description="Distance from Major Accident Hazard sites in km")

# ==========================================
# Domain 6: Land & Civil Infrastructure
# ==========================================
class LandInput(BaseModel):
    is_notified_it_industrial_zone: bool = Field(True, description="Notified IT or industrial zone")
    distance_to_national_highway_km: float = Field(2.5, description="Distance to National Highway in km")
    soil_bearing_capacity_kpa: float = Field(200.0, description="Safe Soil Bearing Capacity in kN/m²")
    contiguous_parcel_acres: float = Field(25.0, description="Contiguous unfragmented parcel size in acres")
    slope_gradient_pct: float = Field(1.5, description="Terrain slope gradient %")

# ==========================================
# Domain 7: Economics & State Policy
# ==========================================
class EconomicsInput(BaseModel):
    electricity_tariff_inr_per_kwh: float = Field(7.5, description="Base SERC HT industrial electricity tariff in ₹/kWh")
    state_has_dc_policy: bool = Field(True, description="State has dedicated Data Centre / AI policy")
    capital_subsidy_pct: float = Field(15.0, description="Capital subsidy percentage on fixed assets")
    stamp_duty_exemption_pct: float = Field(100.0, description="Stamp duty waiver percentage")
    electricity_duty_exemption_years: int = Field(10, description="Years of electricity duty exemption")
    land_cost_inr_crore_per_acre: float = Field(4.0, description="Land acquisition circle rate in ₹ Cr/acre")

# ==========================================
# Unified Site Input Schema
# ==========================================
class SiteInput(BaseModel):
    site_id: Optional[str] = None
    site_name: str = Field(..., description="Name of the candidate site / hub")
    state: str = Field(..., description="State name")
    district: str = Field(..., description="District name")
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    elevation_m: float = Field(25.0, description="Ground elevation in meters")
    proposed_it_load_mw: float = Field(50.0, description="Target IT load in MW")
    
    # 7 Domain Inputs
    water_params: WaterInput = Field(default_factory=WaterInput)
    power_params: PowerInput = Field(default_factory=PowerInput)
    climate_params: ClimateInput = Field(default_factory=ClimateInput)
    connectivity_params: ConnectivityInput = Field(default_factory=ConnectivityInput)
    disaster_params: DisasterInput = Field(default_factory=DisasterInput)
    land_params: LandInput = Field(default_factory=LandInput)
    economics_params: EconomicsInput = Field(default_factory=EconomicsInput)

# ==========================================
# Output Schemas
# ==========================================
class SubMetricResult(BaseModel):
    name: str
    key: str
    score: float
    weight: float
    weighted_score: float
    category: str
    details: str
    flagged: bool = False

class WaterAssessmentOutput(BaseModel):
    water_score: float
    weights: Dict[str, float]
    sub_metrics: List[SubMetricResult]
    stress_flag_triggered: bool
    summary: str

class PowerAssessmentOutput(BaseModel):
    power_score: float
    weights: Dict[str, float]
    sub_metrics: List[SubMetricResult]
    summary: str

class GenericDomainOutput(BaseModel):
    score: float
    weights: Dict[str, float]
    sub_metrics: List[Dict[str, Any]]
    summary: str

class SiteAssessmentResponse(BaseModel):
    site_id: Optional[str] = None
    site_name: str
    state: str
    district: str
    latitude: float
    longitude: float
    elevation_m: float
    proposed_it_load_mw: float
    
    # Composite & Domain Scores
    composite_score: float
    tier: str
    tier_badge: str
    tier_color: str
    
    water_score: float
    power_score: float
    climate_score: float
    connectivity_score: float
    disaster_score: float
    land_score: float
    economics_score: float
    
    # Subsystem Assessment Details
    water_assessment: WaterAssessmentOutput
    power_assessment: PowerAssessmentOutput
    climate_assessment: Dict[str, Any]
    connectivity_assessment: Dict[str, Any]
    disaster_assessment: Dict[str, Any]
    land_assessment: Dict[str, Any]
    economics_assessment: Dict[str, Any]
    
    # Diagnostics & Engineering Mandates
    risk_flags: List[str]
    engineering_mandates: List[str]
    diagnostics: List[str]
    timestamp: str

    # Authentic Telemetry & Data Provenance
    is_live_evaluated: bool = False
    data_provenance: Optional[Dict[str, Any]] = None

class SiteComparisonRequest(BaseModel):
    site_ids: Optional[List[str]] = None
    custom_sites: Optional[List[SiteInput]] = None

class SiteComparisonResponse(BaseModel):
    sites: List[SiteAssessmentResponse]
    ranked_sites: List[Dict[str, Any]]
    best_site: Optional[str]
    comparison_summary: str


class LiveTelemetryRequest(BaseModel):
    latitude: float
    longitude: float
    state: Optional[str] = "Maharashtra"
    district: Optional[str] = None
    site_name: Optional[str] = "Live Candidate Hub"
    proposed_it_load_mw: Optional[float] = 50.0

class LiveTelemetryResponse(BaseModel):
    site_input: SiteInput
    provenance: Dict[str, Any]
    api_statuses: Dict[str, str]
    summary: str
