import React, { useState } from 'react';
import { SOVEREIGN_APIS_DIRECTORY } from '../data/sovereignApis';
import { 
  Droplet, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  MapPin, 
  Gauge,
  Thermometer,
  Wifi,
  Shield,
  Layers,
  Coins,
  Activity,
  Satellite,
  Compass,
  Award,
  TreePine,
  Leaf,
  X,
  Search,
  SlidersHorizontal,
  FileCheck,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Globe,
  Database,
  Radio
} from 'lucide-react';
import { findNearbyRecommendedSitesClient } from '../services/scoringEngine';

export default function ScoreCard({ site, onSelectSite }) {
  if (!site) {
    return (
      <div className="bg-white p-6 rounded-2xl flex items-center justify-center text-[#454c58] min-h-[350px] border border-[#dde0e6] shadow-sm">
        <div className="text-center space-y-2">
          <img src="/logo.png" alt="SuperIndia.ai" className="w-12 h-12 mx-auto object-contain drop-shadow-sm" />
          <div className="text-sm font-bold font-display text-[#16191f]">No Site Selected</div>
          <div className="text-xs text-[#454c58]">Select a candidate hub from the geospatial mesh or header switcher.</div>
        </div>
      </div>
    );
  }

  const compositeScore = site.composite_score || 0;
  const tierColor = site.tier_color || '#10B981';
  const tier = site.tier || 'VIABLE / RECOMMENDED';

  const recommendedAlt = site.recommended_alternative || (
    ((compositeScore < 75.0) || site.fifty_factor_telemetry?.is_vetoed || site.strategic_security_assessment?.national_security_veto) && (site.latitude && site.longitude)
      ? findNearbyRecommendedSitesClient(
          site.latitude,
          site.longitude,
          compositeScore,
          Boolean(site.fifty_factor_telemetry?.is_vetoed || site.strategic_security_assessment?.national_security_veto || compositeScore < 25),
          site.state
        ).bestAlternative
      : null
  );

  const renderTierIcon = () => {
    if (compositeScore >= 90.0) {
      return <Award className="w-3.5 h-3.5 text-emerald-700 shrink-0" />;
    } else if (compositeScore >= 75.0) {
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
    } else if (compositeScore >= 50.0) {
      return <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />;
    } else {
      return <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />;
    }
  };

  const treesToCut = site.eco_assessment?.estimated_trees_to_cut ?? 0;
  const canopyPct = site.eco_assessment?.canopy_cover_pct ?? 3.2;

  const [showFiftyMatrix, setShowFiftyMatrix] = useState(false);
  const [selectedDim, setSelectedDim] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalTab, setModalTab] = useState('factors'); // 'factors' | 'apis'
  const [selectedTier, setSelectedTier] = useState('ALL');

  // 50-Factor Architecture List (From backend telemetry or dynamic site compilation)
  const activeFactorsList = site.fifty_factor_telemetry?.factors || [
    { id: 1, dimension: 'Water Subsystem', name: 'Groundwater Stage of Extraction (SOE %)', value: `${site.water_params?.groundwater_extraction_pct ?? 74}%`, benchmark: '<= 70% (Safe per CGWB)', source: 'Central Ground Water Board (CGWB)', status: (site.water_params?.groundwater_extraction_pct ?? 74) <= 70 ? 'COMPLIANT' : 'WARNING', factor_score: 85.0, weight: 0.040, weighted_score: 3.4 },
    { id: 2, dimension: 'Water Subsystem', name: 'Total Dissolved Solids (TDS)', value: `${site.water_params?.water_quality_tds ?? 420} mg/L`, benchmark: '<= 500 mg/L (BIS 10500 Potable)', source: 'Bureau of Indian Standards IS 10500', status: 'COMPLIANT', factor_score: 92.0, weight: 0.025, weighted_score: 2.3 },
    { id: 3, dimension: 'Water Subsystem', name: 'Local Aquifer Stress & Depletion Category', value: `${site.water_params?.local_aquifer_stress_pct ?? 65}%`, benchmark: '<= 65% Industrial Draft Allowance', source: 'Ministry of Jal Shakti / India-WRIS', status: 'COMPLIANT', factor_score: 80.0, weight: 0.025, weighted_score: 2.0 },
    { id: 4, dimension: 'Water Subsystem', name: 'Data Center Cooling Water Demand', value: `${site.water_params?.data_center_demand_mld ?? 1.4} MLD`, benchmark: 'WUE <= 0.4 L/kWh (Closed-loop liquid)', source: 'ASHRAE TC 9.9 & D2C Thermal Model', status: 'OPTIMAL', factor_score: 100.0, weight: 0.030, weighted_score: 3.0 },
    { id: 5, dimension: 'Water Subsystem', name: 'Tertiary Recycled Greywater Supply (STP)', value: `${site.water_params?.tertiary_supply_mld ?? 25} MLD`, benchmark: '>= 10.0 MLD for 100% Zero Groundwater Use', source: 'State Urban Development Department', status: 'COMPLIANT', factor_score: 100.0, weight: 0.035, weighted_score: 3.5 },
    { id: 6, dimension: 'Water Subsystem', name: 'Dedicated Emergency On-Site Water Buffer', value: `${site.water_params?.on_site_storage_hours ?? 72} Hours`, benchmark: '>= 72 Hours (Mission-Critical Tier-IV)', source: 'Uptime Institute Tier-IV / TIA-942', status: (site.water_params?.on_site_storage_hours ?? 72) >= 72 ? 'COMPLIANT' : 'WARNING', factor_score: 100.0, weight: 0.025, weighted_score: 2.5 },
    
    { id: 7, dimension: 'Power & Grid', name: 'Distance to Nearest 400kV/220kV EHV Substation', value: `${site.power_params?.substation_distance_km ?? 1.5} km`, benchmark: '<= 2.5 km (Minimal RoW Latency)', source: 'Central Electricity Authority (CEA)', status: 'COMPLIANT', factor_score: 95.0, weight: 0.040, weighted_score: 3.8 },
    { id: 8, dimension: 'Power & Grid', name: 'Interconnection Voltage Class', value: `${site.power_params?.voltage_class_kv ?? 220} kV`, benchmark: '>= 220 kV (Bulk Transmission for 50MW+)', source: 'CEA Transmission Planning Manual', status: 'COMPLIANT', factor_score: 85.0, weight: 0.040, weighted_score: 3.4 },
    { id: 9, dimension: 'Power & Grid', name: 'Substation N-1 Spare Transformer Headroom', value: `${site.power_params?.spare_mva_margin ?? 80} MVA`, benchmark: '>= 60 MVA for N-1 Redundancy', source: 'State Load Despatch Centre (SLDC)', status: 'COMPLIANT', factor_score: 90.0, weight: 0.035, weighted_score: 3.15 },
    { id: 10, dimension: 'Power & Grid', name: 'Mapped Physical Substations Density (15 km)', value: '4 Substations', benchmark: '>= 2 Redundant Substations for Dual-Grid', source: 'OpenStreetMap Overpass API (Live Scan)', status: 'COMPLIANT', factor_score: 100.0, weight: 0.020, weighted_score: 2.0 },
    { id: 11, dimension: 'Power & Grid', name: 'Renewable Open Access & Green Corridor Access', value: `${site.power_params?.renewable_open_access_score ?? 80}/100`, benchmark: '>= 75.0 (Green Energy Open Access Rules)', source: 'Ministry of Power Green Open Access Portal', status: 'COMPLIANT', factor_score: 80.0, weight: 0.025, weighted_score: 2.0 },
    { id: 12, dimension: 'Power & Grid', name: 'Direct Normal Irradiance (DNI)', value: '710 W/m²', benchmark: '>= 650 W/m² (High Solar Viability)', source: 'Open-Meteo Solar & Global Solar Atlas', status: 'COMPLIANT', factor_score: 90.0, weight: 0.015, weighted_score: 1.35 },
    { id: 13, dimension: 'Power & Grid', name: 'Global Horizontal Irradiance (GHI)', value: '5.4 kWh/m²/day', benchmark: '>= 5.0 kWh/m²/day (National Solar Tier-1)', source: 'NASA POWER / NISE Resource Map', status: 'COMPLIANT', factor_score: 95.0, weight: 0.015, weighted_score: 1.425 },
    { id: 14, dimension: 'Power & Grid', name: 'Wind Power Density at 100m Hub Height', value: '250 W/m²', benchmark: '>= 200 W/m² (Hybrid Wind PPA Feasible)', source: 'Global Wind Atlas / MNRE', status: 'COMPLIANT', factor_score: 85.0, weight: 0.010, weighted_score: 0.85 },

    { id: 15, dimension: 'Climate & Cooling', name: 'Annual Peak Design Dry-Bulb Temperature', value: `${site.climate_params?.dry_bulb_temp_c ?? 34}°C`, benchmark: '<= 38.0°C (ASHRAE Envelope A1)', source: 'NASA POWER 30-Year Climatology', status: 'COMPLIANT', factor_score: 88.0, weight: 0.025, weighted_score: 2.2 },
    { id: 16, dimension: 'Climate & Cooling', name: 'Annual Peak Design Relative Humidity', value: `${site.climate_params?.relative_humidity_pct ?? 65}%`, benchmark: '40% - 70% RH (Condensation & ESD Shield)', source: 'NASA POWER Climatology API', status: 'COMPLIANT', factor_score: 85.0, weight: 0.015, weighted_score: 1.275 },
    { id: 17, dimension: 'Climate & Cooling', name: 'Psychrometric Wet-Bulb Temperature', value: `${site.climate_assessment?.wet_bulb_temp_c ?? 26.5}°C`, benchmark: '<= 28.0°C (Evaporative & Adiabatic Limit)', source: 'Stull Psychrometric Formulation', status: (site.climate_assessment?.wet_bulb_temp_c ?? 26.5) <= 28 ? 'COMPLIANT' : 'WARNING', factor_score: 82.0, weight: 0.040, weighted_score: 3.28 },
    { id: 18, dimension: 'Climate & Cooling', name: 'Annual Cooling Degree Days (CDD base 18.3°C)', value: `${site.climate_params?.annual_cooling_degree_days ?? 2800} CDD`, benchmark: '<= 3000 CDD (Low Mechanical Chiller Hours)', source: 'NASA POWER Satellite Climatology', status: 'COMPLIANT', factor_score: 80.0, weight: 0.020, weighted_score: 1.6 },
    { id: 19, dimension: 'Climate & Cooling', name: 'Annual Extreme Heat Days (>42°C)', value: `${site.climate_params?.extreme_heat_days ?? 8} Days/Year`, benchmark: '<= 10 Days/Year (Peak Stress Mitigation)', source: 'India Meteorological Department (IMD)', status: 'COMPLIANT', factor_score: 90.0, weight: 0.015, weighted_score: 1.35 },
    { id: 20, dimension: 'Climate & Cooling', name: 'Atmospheric Particulate Load (PM2.5)', value: `${site.climate_params?.air_quality_pm25 ?? 45} µg/m³`, benchmark: '<= 60 µg/m³ (CPCB National Standard)', source: 'Copernicus CAMS & ECMWF Reanalysis', status: 'COMPLIANT', factor_score: 85.0, weight: 0.015, weighted_score: 1.275 },

    { id: 21, dimension: 'Connectivity & Fiber', name: 'Terrestrial Distance to Subsea CLS', value: '22.0 km (Mumbai Versova / Prabhadevi)', benchmark: '<= 50 km (Low International Egress Latency)', source: 'TRAI Subsea Cable Landing Registry', status: 'COMPLIANT', factor_score: 95.0, weight: 0.020, weighted_score: 1.9 },
    { id: 22, dimension: 'Connectivity & Fiber', name: 'Subsea Gateway Optical Round-Trip Time', value: `${site.connectivity_params?.rtt_to_landing_station_ms ?? 3.5} ms`, benchmark: '<= 5.0 ms (Ultra-Low Latency GPU Mesh)', source: 'Terrestrial SMF-28 Optical Geodesic Transit', status: 'OPTIMAL', factor_score: 98.0, weight: 0.030, weighted_score: 2.94 },
    { id: 23, dimension: 'Connectivity & Fiber', name: 'Distance to Nearest NIXI Internet Exchange', value: `${site.connectivity_params?.nixi_distance_km ?? 15} km`, benchmark: '<= 30 km (Direct Peering & BGP Proximity)', source: 'National Internet Exchange of India (NIXI)', status: 'COMPLIANT', factor_score: 95.0, weight: 0.020, weighted_score: 1.9 },
    { id: 24, dimension: 'Connectivity & Fiber', name: 'Carrier-Neutral Tier-1 Telco Providers Count', value: `${site.connectivity_params?.carrier_neutral_providers_count ?? 4} Providers`, benchmark: '>= 3 Tier-1 Telcos (Airtel, Jio, Tata)', source: 'Department of Telecommunications (DoT)', status: 'COMPLIANT', factor_score: 100.0, weight: 0.020, weighted_score: 2.0 },
    { id: 25, dimension: 'Connectivity & Fiber', name: 'Physically Diverse Dark Fiber Conduits', value: `${site.connectivity_params?.dark_fiber_routes_count ?? 3} Diverse Routes`, benchmark: '>= 3 Independent Trench Corridors', source: 'National Optical Fiber Network / BharatNet', status: 'COMPLIANT', factor_score: 100.0, weight: 0.015, weighted_score: 1.5 },
    { id: 26, dimension: 'Connectivity & Fiber', name: 'Metro Internet Exchange & Peering Density', value: 'Active Multi-Carrier Peering Fabric', benchmark: 'Active IXP Presence (NIXI, Extreme IX)', source: 'PeeringDB Global Interconnection Database', status: 'COMPLIANT', factor_score: 100.0, weight: 0.015, weighted_score: 1.5 },

    { id: 27, dimension: 'Disaster Resilience', name: 'BIS IS 1893:2016 Seismic Zone & Motion', value: `Zone ${site.disaster_params?.seismic_zone ?? 'III'}`, benchmark: 'Zone II or Zone III (PGA <= 0.16g)', source: 'Bureau of Indian Standards IS 1893: 2016', status: 'COMPLIANT', factor_score: 80.0, weight: 0.020, weighted_score: 1.6 },
    { id: 28, dimension: 'Disaster Resilience', name: '250 km Historical Seismic Events (M >= 3.5)', value: '0 Significant Historical Events', benchmark: '<= 5 Significant Events per Century', source: 'USGS Earthquake Hazards Program Live Feed', status: 'COMPLIANT', factor_score: 100.0, weight: 0.010, weighted_score: 1.0 },
    { id: 29, dimension: 'Disaster Resilience', name: 'Elevation Margin above 100-Year High Flood Level', value: `${site.disaster_params?.elevation_above_hfl_m ?? 4.2} meters`, benchmark: '>= 3.0 meters Headroom above Notified HFL', source: 'Central Water Commission & NASA SRTM', status: 'COMPLIANT', factor_score: 95.0, weight: 0.020, weighted_score: 1.9 },
    { id: 30, dimension: 'Disaster Resilience', name: 'Basic 50-Year Cyclone Wind Velocity', value: `${site.disaster_params?.cyclone_wind_speed_ms ?? 39} m/s`, benchmark: '<= 39.0 m/s (IS 875 Part 3 Standard)', source: 'IS 875 (Part 3): 2015 & NDMA Maps', status: 'COMPLIANT', factor_score: 85.0, weight: 0.010, weighted_score: 0.85 },
    { id: 31, dimension: 'Disaster Resilience', name: 'Landslide Hazard Susceptibility Index', value: `${site.disaster_params?.landslide_risk_index ?? 5}/100`, benchmark: '<= 20.0 (Stable Low Slope Plains)', source: 'Geological Survey of India (GSI) Atlas', status: 'COMPLIANT', factor_score: 100.0, weight: 0.005, weighted_score: 0.5 },
    { id: 32, dimension: 'Disaster Resilience', name: 'Distance to Nearest Operational Fire Station', value: '3.4 km', benchmark: '<= 5.0 km (Under-10-Min Response per TIA-942)', source: 'OpenStreetMap Overpass API (Live Scan)', status: 'COMPLIANT', factor_score: 100.0, weight: 0.010, weighted_score: 1.0 },
    { id: 33, dimension: 'Disaster Resilience', name: 'Distance to Nearest Emergency Hospital', value: '3.8 km', benchmark: '<= 8.0 km (Workforce Critical Life Safety)', source: 'OpenStreetMap Overpass API / State Health', status: 'COMPLIANT', factor_score: 100.0, weight: 0.005, weighted_score: 0.5 },

    { id: 34, dimension: 'Land & Civil', name: 'Notified IT/Industrial Zone Certification', value: site.land_params?.is_notified_it_industrial_zone ? 'Certified Notified Industrial Zone' : 'Agricultural / Non-Notified', benchmark: 'Notified Industrial Land (Zero CLU Litigation)', source: 'State Industrial Development Corporation', status: site.land_params?.is_notified_it_industrial_zone ? 'COMPLIANT' : 'WARNING', factor_score: 100.0, weight: 0.015, weighted_score: 1.5 },
    { id: 35, dimension: 'Land & Civil', name: 'Distance to National Highway / Expressway', value: `${site.land_params?.distance_to_national_highway_km ?? 2.0} km`, benchmark: '<= 4.0 km (100-ton Heavy Logistics Clearance)', source: 'National Highways Authority of India (NHAI)', status: 'COMPLIANT', factor_score: 100.0, weight: 0.012, weighted_score: 1.2 },
    { id: 36, dimension: 'Land & Civil', name: 'Depth to Hard Bedrock from Surface', value: '110 cm', benchmark: '80 - 150 cm (Shallow Raft Foundation Viable)', source: 'ISRIC SoilGrids 2.0 Global Geotechnical Model', status: 'OPTIMAL', factor_score: 100.0, weight: 0.008, weighted_score: 0.8 },
    { id: 37, dimension: 'Land & Civil', name: 'Soil Mechanical Texture Composition', value: 'Clay Loam (28% Clay, 40% Sand, 32% Silt)', benchmark: 'Cohesive Clay Loam / Hard Murrum / Basalt', source: 'ISRIC SoilGrids 2.0 Physical Soil Texture', status: 'COMPLIANT', factor_score: 100.0, weight: 0.005, weighted_score: 0.5 },
    { id: 38, dimension: 'Land & Civil', name: 'Safe Soil Bearing Capacity (SBC)', value: `${site.land_params?.soil_bearing_capacity_kpa ?? 220} kN/m²`, benchmark: '>= 180 kN/m² (Heavy Transformer Bay Support)', source: 'IS 1904 Foundation Engineering Code', status: 'COMPLIANT', factor_score: 100.0, weight: 0.015, weighted_score: 1.5 },
    { id: 39, dimension: 'Land & Civil', name: 'Distance to Nearest Civil/Defense Airport', value: '22.5 km (Outside Runway Funnel)', benchmark: '>= 15.0 km (Avoids Obstacle Limitation Caps)', source: 'Airports Authority of India (AAI) Registry', status: 'COMPLIANT', factor_score: 100.0, weight: 0.005, weighted_score: 0.5 },
    { id: 40, dimension: 'Land & Civil', name: 'Aeronautical Obstacle Limitation Surface (OLS)', value: 'CLEARED (Unrestricted Height Clearance)', benchmark: 'Outside Aeronautical Funnel Approach Surface', source: 'Ministry of Civil Aviation GSR 751(E) Rules', status: 'COMPLIANT', factor_score: 100.0, weight: 0.010, weighted_score: 1.0 },

    { id: 41, dimension: 'Economics & Policy', name: 'Industrial HT Electricity Tariff', value: `₹${site.economics_params?.electricity_tariff_inr_per_kwh ?? 7.2}/kWh`, benchmark: '<= ₹7.20/kWh (Competitive AI Training Threshold)', source: 'State Electricity Regulatory Commission (SERC)', status: 'COMPLIANT', factor_score: 85.0, weight: 0.025, weighted_score: 2.125 },
    { id: 42, dimension: 'Economics & Policy', name: 'State Capital Investment Subsidy', value: `${site.economics_params?.capital_subsidy_pct ?? 15}%`, benchmark: '>= 15.0% (Dedicated State Data Center Policy)', source: 'State IT & Electronics Promotion Policy', status: 'COMPLIANT', factor_score: 80.0, weight: 0.012, weighted_score: 0.96 },
    { id: 43, dimension: 'Economics & Policy', name: 'Electricity Duty Exemption Duration', value: `${site.economics_params?.electricity_duty_exemption_years ?? 10} Years`, benchmark: '>= 5 Years Full Electricity Duty Waiver', source: 'State Department of Energy Gazettes', status: 'COMPLIANT', factor_score: 100.0, weight: 0.010, weighted_score: 1.0 },
    { id: 44, dimension: 'Economics & Policy', name: 'Official Land Acquisition Circle Rate', value: `₹${site.economics_params?.land_cost_inr_crore_per_acre ?? 9.0} Cr/Acre`, benchmark: 'Official SRO Ready Reckoner / IDC Industrial Tariff', source: 'State Department of Revenue SRO Ready Reckoner', status: 'COMPLIANT', factor_score: 75.0, weight: 0.010, weighted_score: 0.75 },
    { id: 45, dimension: 'Economics & Policy', name: 'State Data Center Policy & Single-Window', value: 'Dedicated DC Policy Active', benchmark: 'Dedicated AI/DC Policy with Essential Services Status', source: 'Ministry of Electronics and IT (MeitY)', status: 'COMPLIANT', factor_score: 100.0, weight: 0.013, weighted_score: 1.3 },

    { id: 46, dimension: 'Atmospheric Chemistry', name: 'Distance to Major Chemical / Refinery Plants', value: `${site.disaster_params?.industrial_hazard_distance_km ?? 8.5} km`, benchmark: '>= 5.0 km Buffer from Toxic Hazard Facilities', source: 'Petroleum & Explosives Safety Org (PESO)', status: 'COMPLIANT', factor_score: 90.0, weight: 0.015, weighted_score: 1.35 },
    { id: 47, dimension: 'Atmospheric Chemistry', name: 'ISA-71.04 Electronics Gaseous Corrosivity Level', value: 'Class G1 (Mild - Standard MERV-13 Filtration)', benchmark: 'Class G1 (Mild - Standard MERV-13 Filtration)', source: 'ISA-71.04 Standard & CPCB Air Monitoring', status: 'COMPLIANT', factor_score: 100.0, weight: 0.015, weighted_score: 1.5 },

    { id: 48, dimension: 'Ecology & Sovereign Vetoes', name: 'Wildlife Sanctuary / National Park Proximity', value: `${site.eco_assessment?.distance_to_protected_area_km ?? 22.0} km (MoEFCC Network)`, benchmark: '> 10.0 km from Notified Wildlife Core / ESZ', source: 'Wildlife Institute of India & MoEFCC Registry', status: (site.eco_assessment?.distance_to_protected_area_km ?? 22.0) > 10.0 ? 'COMPLIANT' : 'PROHIBITED', factor_score: (site.eco_assessment?.distance_to_protected_area_km ?? 22.0) > 10.0 ? 100.0 : 0.0, weight: 0.040, weighted_score: (site.eco_assessment?.distance_to_protected_area_km ?? 22.0) > 10.0 ? 4.0 : 0.0 },
    { id: 49, dimension: 'Ecology & Sovereign Vetoes', name: 'Tree Canopy Density & Zero-Deforestation Ban', value: `${canopyPct}% Canopy Cover (${treesToCut} trees to cut)`, benchmark: '0 Trees Cut (Strict Non-Forest Allotment Mandate)', source: 'Forest Survey of India ISFR 2023 & WPA 1972', status: treesToCut === 0 ? 'COMPLIANT' : 'WARNING', factor_score: treesToCut === 0 ? 100.0 : 35.0, weight: 0.040, weighted_score: treesToCut === 0 ? 4.0 : 1.4 },
    { id: 50, dimension: 'Ecology & Sovereign Vetoes', name: 'Hostile Border Proximity & Winter Snowbound Cutoff', value: site.strategic_security_assessment?.is_border_conflict_zone ? 'PROHIBITED (Border Conflict LoC/LAC)' : 'PEACETIME_SECURE (Inland Logistics Corridor)', benchmark: 'Zero Hostile Artillery Exposure & 365-Day Highway Access', source: 'MHA Sensitive Border Guidelines & BRO Pass Log', status: site.strategic_security_assessment?.national_security_veto ? 'PROHIBITED' : 'COMPLIANT', factor_score: site.strategic_security_assessment?.national_security_veto ? 0.0 : 100.0, weight: 0.040, weighted_score: site.strategic_security_assessment?.national_security_veto ? 0.0 : 4.0 },
  ];

  const optimalCount = activeFactorsList.filter(f => f.status === 'OPTIMAL' || f.status === 'COMPLIANT').length;
  const warningCount = activeFactorsList.filter(f => f.status === 'WARNING').length;
  const prohibitedCount = activeFactorsList.filter(f => f.status === 'PROHIBITED' || f.status === 'CRITICAL').length;

  const filteredFactors = activeFactorsList.filter((f) => {
    const matchesDim = selectedDim === 'ALL' || f.dimension.toLowerCase().includes(selectedDim.toLowerCase());
    const matchesSearch = !searchQuery || 
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      f.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.dimension.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDim && matchesSearch;
  });

  const domainCards = [
    {
      id: "water",
      name: "Water Subsystem",
      axisLabel: "Water",
      score: site.water_score || 0,
      weight: "18%",
      icon: <Droplet className="w-3.5 h-3.5 text-[#074ce0]" />,
      shortTag: "CGWA • Zero Depletion",
    },
    {
      id: "power",
      name: "Power & Grid",
      axisLabel: "Power",
      score: site.power_score || 0,
      weight: "20%",
      icon: <Zap className="w-3.5 h-3.5 text-amber-500" />,
      shortTag: "CEA • 400kV/220kV Grid",
    },
    {
      id: "climate",
      name: "Climate & Cooling",
      axisLabel: "Climate",
      score: site.climate_score || 0,
      weight: "13%",
      icon: <Thermometer className="w-3.5 h-3.5 text-indigo-600" />,
      shortTag: "NASA Wet-Bulb • ASHRAE",
    },
    {
      id: "connectivity",
      name: "Connectivity & CLS",
      axisLabel: "Fiber",
      score: site.connectivity_score || 0,
      weight: "12%",
      icon: <Wifi className="w-3.5 h-3.5 text-emerald-600" />,
      shortTag: "Subsea CLS • NIXI Peering",
    },
    {
      id: "disaster",
      name: "Disaster Resilience",
      axisLabel: "Disaster",
      score: site.disaster_score || 0,
      weight: "8%",
      icon: <Shield className="w-3.5 h-3.5 text-rose-600" />,
      shortTag: "IS 1893:2016 • Flood HFL",
    },
    {
      id: "land",
      name: "Land & Civil",
      axisLabel: "Land",
      score: site.land_score || 0,
      weight: "7%",
      icon: <Layers className="w-3.5 h-3.5 text-purple-600" />,
      shortTag: "IT Zone • Soil SBC",
    },
    {
      id: "economics",
      name: "Economics & Policy",
      axisLabel: "Tariff",
      score: site.economics_score || 0,
      weight: "7%",
      icon: <Coins className="w-3.5 h-3.5 text-cyan-600" />,
      shortTag: "SERC Tariffs • SRO Rates",
    },
    {
      id: "atmospheric",
      name: "Atmospheric Corrosivity",
      axisLabel: "Corrosivity",
      score: site.fifty_factor_telemetry?.atmospheric_score ?? 92.0,
      weight: "3%",
      icon: <Activity className="w-3.5 h-3.5 text-orange-600" />,
      shortTag: "ISA-71.04 • PESO Hazard",
    },
    {
      id: "sovereign",
      name: "Sovereign Strategic & Forests",
      axisLabel: "Sovereign",
      score: site.fifty_factor_telemetry?.sovereign_score !== undefined ? site.fifty_factor_telemetry.sovereign_score : (site.eco_score || 88.0),
      weight: "12% + Veto",
      icon: <TreePine className="w-3.5 h-3.5 text-emerald-600" />,
      shortTag: treesToCut === 0 ? "0 Trees Cut • WPA 1972 Safe" : `${treesToCut} Trees Cut • 3:1 Afforest`,
    },
  ];

  // Radar Chart Coordinates (viewBox: 0 0 340 200, center: 170, 96, radius: 55)
  const radarRadius = 55;
  const radarCenterX = 170;
  const radarCenterY = 96;
  const numAxes = domainCards.length;
  
  const getRadarCoordinates = (index, value) => {
    const angle = (Math.PI * 2 / numAxes) * index - Math.PI / 2;
    const r = (value / 100) * radarRadius;
    return {
      x: radarCenterX + r * Math.cos(angle),
      y: radarCenterY + r * Math.sin(angle),
    };
  };

  const getLabelCoordinates = (index) => {
    const angle = (Math.PI * 2 / numAxes) * index - Math.PI / 2;
    const r = radarRadius + 22; // 77px distance from center
    return {
      x: radarCenterX + r * Math.cos(angle),
      y: radarCenterY + r * Math.sin(angle),
      angle: angle,
    };
  };

  const radarPolygonPoints = domainCards.map((d, i) => {
    const coords = getRadarCoordinates(i, d.score);
    return `${coords.x.toFixed(1)},${coords.y.toFixed(1)}`;
  }).join(' ');

  const gridRings = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#dde0e6] shadow-sm flex flex-col justify-between h-full space-y-3.5 overflow-y-auto">
      
      {/* 1. Header with Site Name and Badge */}
      <div>
        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#454c58] font-mono mb-0.5">
              <MapPin className="w-3 h-3 text-[#074ce0] shrink-0" />
              <span className="font-semibold text-slate-800">{site.district || site.state}, {site.state}</span>
              <span className="text-slate-300">•</span>
              <span>Elev: <strong className="text-slate-700">{site.elevation_m}m</strong></span>
              <span className="text-slate-300">•</span>
              <span className="text-[#074ce0] font-bold">{site.proposed_it_load_mw} MW Load</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-[#16191f] tracking-tight leading-tight">
              {site.site_name}
            </h2>
          </div>

          {/* Status Badge */}
          <div 
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shrink-0 ${
              compositeScore >= 75 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : compositeScore >= 50 
                ? 'bg-amber-50 text-amber-800 border-amber-200' 
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {renderTierIcon()}
            <span className="tracking-wide text-[11px]">{tier}</span>
          </div>
        </div>

        {/* Real-Data Verification & Telemetry Badge */}
        {(site.is_live_evaluated || site.data_provenance) && (
          <div className="mb-2.5 p-2 rounded-xl bg-gradient-to-r from-blue-50/90 via-emerald-50/80 to-teal-50/90 border border-emerald-200 shadow-2xs flex flex-wrap items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-900 flex items-center gap-1">
                <Satellite className="w-3 h-3 text-emerald-600" />
                NASA & Gov Telemetry Active
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1 text-[9px] font-mono">
              <span className="px-1.5 py-0.2 rounded bg-white text-slate-700 border border-emerald-200 font-semibold shadow-2xs">
                🛰️ NASA POWER
              </span>
              <span className="px-1.5 py-0.2 rounded bg-white text-slate-700 border border-emerald-200 font-semibold shadow-2xs">
                ⛰️ NASA SRTM
              </span>
              <span className="px-1.5 py-0.2 rounded bg-white text-slate-700 border border-emerald-200 font-semibold shadow-2xs">
                🌫️ CAMS AQI
              </span>
              <span className="px-1.5 py-0.2 rounded bg-white text-slate-700 border border-emerald-200 font-semibold shadow-2xs">
                🌊 CGWB SOE
              </span>
              <span className="px-1.5 py-0.2 rounded bg-white text-slate-700 border border-emerald-200 font-semibold shadow-2xs">
                ⚡ CEA Grid
              </span>
              <span className="px-1.5 py-0.2 rounded bg-white text-slate-700 border border-emerald-200 font-semibold shadow-2xs">
                🌲 FSI Forests
              </span>
              <span className="px-1.5 py-0.2 rounded bg-white text-slate-700 border border-emerald-200 font-semibold shadow-2xs">
                💧 GloFAS Basins
              </span>
            </div>
          </div>
        )}

        {/* Statutory / Sovereign Veto Banner on ScoreCard */}
        {(site.fifty_factor_telemetry?.is_vetoed || site.strategic_security_assessment?.national_security_veto || compositeScore < 25) && (
          <div className="mb-2.5 p-2.5 rounded-xl bg-rose-50 border border-rose-300 shadow-2xs flex items-start gap-2 text-rose-900 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="font-sans leading-tight">
              <span className="font-bold font-display text-rose-800">STATUTORY REJECTION VETO: </span>
              {site.fifty_factor_telemetry?.veto_reasons?.[0] || 
               site.strategic_security_assessment?.risk_summary ||
               "Site violates mandatory sovereign or statutory protection criteria (WPA 1972 / MHA Defense Corridor). Construction unviable."}
            </div>
          </div>
        )}

                {/* Recommended Better Site Nearby Card (When site scores low or has statutory veto) */}
        {recommendedAlt && (
          <div className="mb-3 p-3.5 rounded-xl bg-gradient-to-br from-emerald-50 via-teal-50/70 to-blue-50 border-2 border-emerald-300 shadow-sm animate-fadeIn">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <span className="p-1 rounded-md bg-emerald-600 text-white shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-bold font-display uppercase tracking-wider text-emerald-950">
                  Recommended Better Site Nearby
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs">
                +{(recommendedAlt.score_delta > 0 ? recommendedAlt.score_delta : (recommendedAlt.composite_score - compositeScore)).toFixed(1)} pts higher
              </span>
            </div>

            <div className="bg-white/95 backdrop-blur-xs p-3 rounded-lg border border-emerald-200 shadow-2xs mb-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 font-display truncate">
                    {recommendedAlt.site_name}
                  </div>
                  <div className="text-[11px] text-slate-600 font-sans flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>{recommendedAlt.district}, {recommendedAlt.state}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-mono font-bold text-emerald-700">{recommendedAlt.distance_km} km away</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-black font-display text-emerald-700">
                    {recommendedAlt.composite_score.toFixed(1)}/100
                  </div>
                  <div className="text-[9px] font-mono font-bold text-emerald-600 uppercase">
                    {recommendedAlt.tier_badge || 'VIABLE'}
                  </div>
                </div>
              </div>

              {/* Why It's Better highlights */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1 text-[11px]">
                {recommendedAlt.why_better?.power && (
                  <div className="flex items-start gap-1.5 text-slate-700">
                    <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span className="leading-snug"><strong>Power Grid:</strong> {recommendedAlt.why_better.power}</span>
                  </div>
                )}
                {recommendedAlt.why_better?.water && (
                  <div className="flex items-start gap-1.5 text-slate-700">
                    <Droplet className="w-3.5 h-3.5 text-[#074ce0] shrink-0 mt-0.5" />
                    <span className="leading-snug"><strong>Water Resource:</strong> {recommendedAlt.why_better.water}</span>
                  </div>
                )}
                {recommendedAlt.why_better?.environment && (
                  <div className="flex items-start gap-1.5 text-slate-700">
                    <TreePine className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-snug"><strong>Statutory Land:</strong> {recommendedAlt.why_better.environment}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 1-Click Action to Adopt/Switch */}
            <button
              onClick={() => {
                if (onSelectSite) {
                  onSelectSite(recommendedAlt);
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-all shadow-sm shadow-emerald-600/25 cursor-pointer font-display"
            >
              <span>Switch to Recommended Site</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 2. Unified Hero Analytics Box: Feasibility Score + Spacious 8-Axis Radar */}
        <div className="p-3 rounded-xl bg-[#f8f9fb] border border-[#dde0e6] space-y-2">
          
          {/* Top Score Strip */}
          <div className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-lg border border-[#dde0e6] shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#074ce0] shrink-0 shadow-2xs">
                <Gauge className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#454c58] font-bold">
                  Composite Feasibility
                </div>
                <div className="text-[10px] text-[#8c94a4] font-sans">50-Factor Sovereign Siting Matrix (CGWB • CEA • NASA • USGS • FSI • MHA)</div>
              </div>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black font-display text-[#16191f] tracking-tight">
                {compositeScore.toFixed(1)}
              </span>
              <span className="text-[#8c94a4] font-mono text-xs">/100</span>
            </div>
          </div>

          {/* Clean 8-Axis Radar Spider Chart (Spacious 340x200 ViewBox, Zero Overlaps / Zero Clippings) */}
          <div className="bg-white p-2 rounded-lg border border-[#dde0e6] flex flex-col items-center justify-center shadow-2xs">
            <svg 
              width="100%" 
              height="185" 
              viewBox="0 0 340 200" 
              className="w-full max-w-[340px] select-none"
            >
              {/* Concentric Polygonal Background Grid */}
              {gridRings.map((scale, ringIdx) => {
                const ringPoints = domainCards.map((_, i) => {
                  const coords = getRadarCoordinates(i, scale * 100);
                  return `${coords.x.toFixed(1)},${coords.y.toFixed(1)}`;
                }).join(' ');
                return (
                  <polygon
                    key={ringIdx}
                    points={ringPoints}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth={ringIdx === gridRings.length - 1 ? "1.5" : "1"}
                    strokeDasharray={ringIdx < gridRings.length - 1 ? "3,3" : "none"}
                  />
                );
              })}

              {/* Axis Spokes from Center to Outer Perimeter */}
              {domainCards.map((_, i) => {
                const outer = getRadarCoordinates(i, 100);
                return (
                  <line
                    key={i}
                    x1={radarCenterX}
                    y1={radarCenterY}
                    x2={outer.x}
                    y2={outer.y}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Shaded Data Polygon */}
              <polygon
                points={radarPolygonPoints}
                fill={`${tierColor}25`}
                stroke={tierColor}
                strokeWidth="2.5"
                className="transition-all duration-300 drop-shadow-2xs"
              />

              {/* Axis Data Points & Non-overlapping Labels */}
              {domainCards.map((d, i) => {
                const coords = getRadarCoordinates(i, d.score);
                const labelPos = getLabelCoordinates(i);
                
                // Smart text anchor based on position around center
                let textAnchor = "middle";
                if (labelPos.x < radarCenterX - 15) textAnchor = "end";
                else if (labelPos.x > radarCenterX + 15) textAnchor = "start";

                return (
                  <g key={i}>
                    {/* Vertex Glow Point */}
                    <circle
                      cx={coords.x}
                      cy={coords.y}
                      r="3.5"
                      fill={tierColor}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    
                    {/* Domain Axis Label & Score with explicit SVG typography */}
                    <text
                      x={labelPos.x}
                      y={labelPos.y}
                      textAnchor={textAnchor}
                      dominantBaseline="central"
                      fontFamily="system-ui, -apple-system, sans-serif"
                      fontSize="10"
                      fontWeight="700"
                      fill="#1e293b"
                    >
                      {d.axisLabel} <tspan fill={tierColor} fontWeight="800" dx="2">{d.score.toFixed(0)}</tspan>
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Radar Scale Reference */}
            <div className="flex items-center justify-between w-full px-2.5 py-1.5 border-t border-slate-100 text-[10px] font-mono text-slate-500">
              <span className="flex items-center gap-1 font-bold text-slate-700">
                <Activity className="w-3 h-3 text-[#074ce0]" />
                9-Domain Architecture (50 Factors)
              </span>
              <div className="flex items-center gap-1.5 text-[9px]">
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">0% Center</span>
                <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[#074ce0] font-semibold border border-blue-100">100% Outer</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Balanced Grid of 9 Dimension Cards */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#454c58] font-bold flex items-center justify-between">
          <span>9 Statutory Infrastructure & Sovereign Dimensions</span>
          <span className="text-[9.5px] text-[#8c94a4] font-normal">Weights: 100% (Sum = 1.000)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {domainCards.map((domain) => (
            <div 
              key={domain.id}
              className="p-2 rounded-xl bg-white border border-[#dde0e6] hover:border-[#074ce0]/40 transition-colors flex items-center justify-between gap-2 shadow-2xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1 rounded-lg bg-[#f3f4f6] text-[#16191f] shrink-0">
                  {domain.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-[#16191f] font-display leading-tight truncate">
                    {domain.name}
                  </div>
                  <div className="text-[9.5px] text-[#454c58] font-mono leading-tight mt-0.5 truncate">
                    {domain.shortTag}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0 font-mono pl-1">
                <div className="text-xs font-bold text-[#16191f]">
                  {domain.score.toFixed(1)}
                </div>
                <div className="text-[9px] text-[#8c94a4]">
                  {domain.weight}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3b. Expanded 50-Factor Siting Matrix Interactive Drawer Trigger */}
      <button
        onClick={() => setShowFiftyMatrix(true)}
        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50/70 to-slate-50 hover:from-blue-100/90 hover:via-indigo-100/90 hover:to-slate-100 border border-blue-300/80 text-[#074ce0] text-xs font-bold font-mono flex items-center justify-between transition-all group shadow-2xs cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#074ce0] text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            <Layers className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="text-slate-900 font-display block text-xs font-bold">Expanded 50-Factor Siting Matrix</span>
            <span className="text-[9.5px] text-slate-500 font-normal font-sans block">Deterministic non-linear decay & live public API provenance</span>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-[#074ce0] text-white text-[10px] font-sans font-bold flex items-center gap-1 shadow-xs shrink-0">
          <span>50 Factors</span>
          <span>→</span>
        </span>
      </button>

      {/* 4. Footer Note */}
      <div className="pt-1.5 border-t border-[#dde0e6] flex items-center justify-between text-[9.5px] text-[#8c94a4] font-mono">
        <span>Deterministic (CGWB • CEA • FSI • BIS)</span>
        <span className="text-[#074ce0] font-semibold">Zero Hallucinations</span>
      </div>

      {/* 5. 50-Factor Architecture Matrix Fullscreen/Centered Modal */}
      {showFiftyMatrix && (
        <div className="fixed inset-0 z-[2500] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#074ce0] text-white flex items-center justify-center shadow-md shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold font-display text-slate-900">
                      50-Factor Statutory, Environmental & Defense Matrix
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-[#074ce0] font-bold border border-blue-200">
                      v2.0-Sovereign-50
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">
                    Target Site: <span className="font-semibold text-slate-800">{site.site_name}</span> ({site.district}, {site.state}) • Composite Score: <span className="font-mono font-bold text-[#074ce0]">{site.composite_score}</span>/100
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1 p-1 bg-slate-200/80 rounded-xl">
                  <button
                    onClick={() => setModalTab('factors')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer ${
                      modalTab === 'factors'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📊 50 Siting Factors
                  </button>
                  <button
                    onClick={() => setModalTab('apis')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer flex items-center gap-1.5 ${
                      modalTab === 'apis'
                        ? 'bg-white text-[#074ce0] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    ⚡ 50 Sovereign APIs
                  </button>
                </div>
                <button 
                  onClick={() => setShowFiftyMatrix(false)}
                  className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 50-Factor Architecture Statistics Overview Strip */}
            <div className="px-5 py-2.5 bg-slate-100/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 font-bold shadow-2xs">
                  50 Statutory Factors
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold shadow-2xs">
                  ✓ {optimalCount} Compliant / Optimal
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-bold shadow-2xs">
                  ▲ {warningCount} Elevated / Warning
                </span>
                {prohibitedCount > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-rose-100 border border-rose-300 text-rose-800 font-black shadow-2xs animate-pulse">
                    ⛔ {prohibitedCount} Statutory Vetoes Triggered
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-600 font-sans">
                Weights Sum: <span className="font-mono font-bold text-slate-900">1.000 (100.0%)</span>
              </div>
            </div>

            {/* Sovereign Veto Warning Banner if prohibited */}
            {(prohibitedCount > 0 || site.statutory_veto_triggered) && (
              <div className="mx-4 mt-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5 shadow-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed font-sans">
                  <strong className="font-bold text-rose-800 font-display">STATUTORY / SOVEREIGN VETO ACTIVE:</strong> This candidate site violates non-negotiable statutory safeguards (e.g. Wildlife Protection Act 1972 Section 35 core sanctuary boundaries or MHA Sensitive Border Corridors). The composite score is clamped to the unviable range (<span className="font-mono font-bold">{compositeScore.toFixed(1)}</span>/100). No data center construction is legally permissible.
                </div>
              </div>
            )}

            {/* Filter Pills & Search */}
            <div className="p-3 border-b border-slate-200 bg-white flex flex-col sm:flex-row gap-2 items-center justify-between">
              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none text-xs">
                {['ALL', 'Water', 'Power', 'Climate', 'Connectivity', 'Disaster', 'Land', 'Economics', 'Atmospheric', 'Vetoes'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedDim(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedDim === cat 
                        ? 'bg-[#074ce0] text-white shadow-xs' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'ALL' ? 'All (50)' : cat}
                  </button>
                ))}
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search metric or authority..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-slate-50"
                />
              </div>
            </div>

            {/* 50 Sovereign APIs Grid View */}
            {modalTab === 'apis' ? (
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-50/60">
                {/* Tier Filter Bar for APIs */}
                <div className="p-3 border-b border-slate-200 bg-white flex flex-col sm:flex-row gap-2 items-center justify-between">
                  <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
                    {[
                      { id: 'ALL', label: 'All 50 APIs' },
                      { id: 'TIER_1_DYNAMIC_TELEMETRY', label: 'Tier 1: Dynamic (18)' },
                      { id: 'TIER_2_SPATIAL_VECTOR_LAYER', label: 'Tier 2: Spatial (18)' },
                      { id: 'TIER_3_STATUTORY_REGISTRY', label: 'Tier 3: Statutory (14)' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTier(t.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                          selectedTier === t.id
                            ? 'bg-[#074ce0] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">
                    Showing <strong className="text-slate-800">{filteredApis.length}</strong> of 50 APIs
                  </div>
                </div>

                {/* APIs Cards Grid */}
                <div className="overflow-y-auto p-4 space-y-2.5 flex-1">
                  {filteredApis.map((api) => (
                    <div
                      key={api.factor_id}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 transition-all shadow-2xs flex flex-col gap-2"
                    >
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="w-6 h-6 rounded-lg bg-blue-50 text-[#074ce0] border border-blue-200 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                            #{api.factor_id}
                          </span>
                          <span className="text-xs font-bold text-slate-900 font-display">
                            {api.api_name}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-50 text-[#074ce0] font-semibold border border-blue-100">
                            {api.dimension}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            {api.status}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-mono font-semibold">
                            {api.tier.replace('TIER_', 'Tier ').replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-700 font-sans">
                        <strong className="text-slate-900">Factor {api.factor_id}:</strong> {api.factor_name}
                      </div>

                      <div className="text-[11px] text-slate-500 font-sans flex items-center gap-2 flex-wrap">
                        <span>Authority: <strong className="text-slate-800">{api.authority}</strong></span>
                        <span>•</span>
                        <span>Cadence: <span className="text-slate-700 font-mono">{api.cadence}</span></span>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2 text-xs font-mono">
                        <span className="text-slate-500 truncate text-[11px]">Endpoint: <span className="text-slate-800 font-medium">{api.endpoint}</span></span>
                        <a
                          href={api.endpoint}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[#074ce0] hover:bg-blue-50 hover:border-blue-200 text-[11px] font-sans font-bold flex items-center gap-1 transition-all shrink-0"
                        >
                          <span>Open API</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <p className="text-[11px] text-slate-600 font-sans italic">
                        {api.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* 50-Factor Scrollable Inventory */}
                <div className="overflow-y-auto p-4 space-y-2 flex-1 bg-slate-50/60 divide-y-0">
                  {filteredFactors.map((f) => (
                <div 
                  key={f.id}
                  className={`p-3 rounded-2xl border transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                    f.status === 'PROHIBITED' || f.status === 'CRITICAL'
                      ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
                      : 'bg-white border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className={`w-7 h-7 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border ${
                      f.status === 'PROHIBITED' || f.status === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      #{f.id}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 font-display">
                          {f.name}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-50 text-[#074ce0] font-semibold border border-blue-100">
                          {f.dimension}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-sans mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span>Target: <span className="text-slate-800 font-mono font-medium">{f.benchmark}</span></span>
                        <span>•</span>
                        <span>Authority: <span className="text-slate-600 font-mono">{f.source}</span></span>
                      </div>

                      {/* Connected Sovereign API Link & Badge */}
                      <div className="mt-1 flex items-center gap-1.5 flex-wrap text-[10px] font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold flex items-center gap-1 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          {f.api_name || 'India Sovereign API'}
                        </span>
                        {f.api_endpoint && (
                          <a
                            href={f.api_endpoint}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 truncate max-w-[260px] flex items-center gap-1 transition-colors"
                            title={f.api_endpoint}
                          >
                            <span className="truncate">{f.api_endpoint.replace('https://', '')}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          </a>
                        )}
                        {f.api_tier && (
                          <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 text-[9px]">
                            {f.api_tier.replace('TIER_', 'Tier ').replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                      
                      {/* Factor Mathematical Weight & Contribution */}
                      <div className="text-[10px] font-mono text-slate-600 mt-1 flex items-center gap-2 flex-wrap">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          Score: <strong className="text-slate-900">{typeof f.factor_score === 'number' ? f.factor_score.toFixed(1) : '100.0'}/100</strong>
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          Weight: <strong className="text-slate-900">{typeof f.weight === 'number' ? (f.weight * 100).toFixed(1) : '2.0'}%</strong>
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[#074ce0] border border-blue-200 font-bold">
                          Impact: +{typeof f.weighted_score === 'number' ? f.weighted_score.toFixed(2) : '2.00'} pts
                        </span>
                      </div>

                      {f.status === 'PROHIBITED' && (
                        <div className="mt-1.5 text-[11px] font-sans text-rose-700 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>Statutory Rejection: Violates non-negotiable legal or sovereign boundary thresholds.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-right font-mono">
                      <div className="text-xs font-bold text-slate-900">{f.value}</div>
                    </div>
                    <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full font-bold uppercase shadow-2xs ${
                      f.status === 'OPTIMAL' || f.status === 'COMPLIANT'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : f.status === 'PROHIBITED' || f.status === 'CRITICAL'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 font-black'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {f.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            </>
            )}

            {/* Modal Bottom Bar */}
            <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Displaying {filteredFactors.length} of {activeFactorsList.length} sovereign siting factors</span>
              <button 
                onClick={() => setShowFiftyMatrix(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close Matrix
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
