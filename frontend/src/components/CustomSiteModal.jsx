import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Play, 
  Sliders, 
  Droplet, 
  Zap, 
  MapPin, 
  Search, 
  Check, 
  Sparkles, 
  Navigation, 
  Building2, 
  ChevronRight,
  Info,
  Thermometer,
  Wifi,
  Shield,
  Layers,
  Coins,
  Radio,
  Satellite,
  Globe,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { STRATEGIC_INDIAN_PLACES } from '../data/indianPlaces';
import { fetchLiveTelemetry, assessLiveSite } from '../services/api';

export default function CustomSiteModal({ isOpen, onClose, onAssessCustomSite }) {
  if (!isOpen) return null;

  const [activeDomainTab, setActiveDomainTab] = useState('water');

  const [formData, setFormData] = useState({
    site_name: 'Pune Industrial AI Park (Chakan)',
    state: 'Maharashtra',
    district: 'Pune',
    latitude: 18.7520,
    longitude: 73.8560,
    elevation_m: 640.0,
    proposed_it_load_mw: 50.0,
    
    // Domain 1: Water
    water_params: {
      groundwater_extraction_pct: 74.0,
      water_quality_tds: 420.0,
      demand_stress_score: 55.0,
      data_center_demand_mld: 1.5,
      local_aquifer_stress_pct: 65.0,
      industrial_density_index: 60.0,
      stp_distance_km: 3.5,
      tertiary_supply_mld: 25.0,
      assured_supply_mld: 3.0,
      on_site_storage_hours: 48.0,
      elevation_m: 640.0,
      drought_risk_index: 25.0,
      flood_zone_risk: 15.0,
    },
    
    // Domain 2: Power
    power_params: {
      substation_distance_km: 1.5,
      voltage_class_kv: 220.0,
      spare_mva_margin: 75.0,
      proposed_it_load_mw: 50.0,
      renewable_open_access_score: 80.0,
    },

    // Domain 3: Climate
    climate_params: {
      dry_bulb_temp_c: 32.0,
      relative_humidity_pct: 62.0,
      annual_cooling_degree_days: 2650.0,
      air_quality_pm25: 42.0,
      extreme_heat_days: 10.0,
    },

    // Domain 4: Connectivity
    connectivity_params: {
      fiber_backbone_distance_km: 1.2,
      rtt_to_landing_station_ms: 3.8,
      nixi_distance_km: 25.0,
      carrier_neutral_providers_count: 4,
      dark_fiber_routes_count: 3,
    },

    // Domain 5: Disaster & Hazard
    disaster_params: {
      seismic_zone: 'III',
      elevation_above_hfl_m: 4.5,
      cyclone_wind_speed_ms: 39.0,
      landslide_risk_index: 5.0,
      industrial_hazard_distance_km: 7.5,
    },

    // Domain 6: Land & Civil
    land_params: {
      is_notified_it_industrial_zone: true,
      distance_to_national_highway_km: 1.5,
      soil_bearing_capacity_kpa: 240.0,
      contiguous_parcel_acres: 25.0,
      slope_gradient_pct: 1.5,
    },

    // Domain 7: Economics & Policy
    economics_params: {
      electricity_tariff_inr_per_kwh: 7.2,
      state_has_dc_policy: true,
      capital_subsidy_pct: 15.0,
      stamp_duty_exemption_pct: 100.0,
      electricity_duty_exemption_years: 10,
      land_cost_inr_crore_per_acre: 3.5,
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTelemetry, setIsLoadingTelemetry] = useState(false);
  const [telemetryResult, setTelemetryResult] = useState(null);
  const [telemetryError, setTelemetryError] = useState(null);
  const [isLiveEvaluated, setIsLiveEvaluated] = useState(false);
  
  // Place & City Autocomplete Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [appliedPlaceMessage, setAppliedPlaceMessage] = useState(null);
  
  const searchContainerRef = useRef(null);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter local strategic places + debounced geocoder
  useEffect(() => {
    if (!searchTerm || searchTerm.trim().length === 0) {
      setSuggestions(STRATEGIC_INDIAN_PLACES.slice(0, 8));
      setIsSearchingOnline(false);
      return;
    }

    const query = searchTerm.toLowerCase().trim();
    
    // 1. Search in local catalog
    const localMatches = STRATEGIC_INDIAN_PLACES.filter(place => 
      place.name.toLowerCase().includes(query) ||
      place.state.toLowerCase().includes(query) ||
      place.district.toLowerCase().includes(query) ||
      (place.category && place.category.toLowerCase().includes(query))
    );

    setSuggestions(localMatches);

    // 2. Query geocoding API with error boundary
    const timer = setTimeout(async () => {
      if (query.length >= 3) {
        setIsSearchingOnline(true);
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);

          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchTerm)}&countrycodes=in&format=json&addressdetails=1&limit=5`,
            { 
              headers: { 'Accept-Language': 'en' },
              signal: controller.signal 
            }
          );
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            const externalSuggestions = data.map(item => {
              const state = item.address?.state || item.address?.state_district || 'India';
              const district = item.address?.county || item.address?.state_district || item.address?.city || item.address?.town || item.address?.village || '';
              return {
                name: item.name || item.display_name.split(',')[0],
                state: state,
                district: district,
                latitude: parseFloat(parseFloat(item.lat).toFixed(4)),
                longitude: parseFloat(parseFloat(item.lon).toFixed(4)),
                elevation_m: 50.0,
                category: item.type ? item.type.replace(/_/g, ' ') : 'City / Place',
                highlight: item.display_name.split(',').slice(1, 4).join(',').trim(),
                isExternal: true
              };
            });

            setSuggestions(prev => {
              const existingCoords = new Set(prev.map(p => `${p.latitude.toFixed(2)},${p.longitude.toFixed(2)}`));
              const newItems = externalSuggestions.filter(item => !existingCoords.has(`${item.latitude.toFixed(2)},${item.longitude.toFixed(2)}`));
              return [...prev, ...newItems].slice(0, 10);
            });
          }
        } catch (err) {
          // Gracefully fallback to local matches
        } finally {
          setIsSearchingOnline(false);
        }
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // When user selects a suggestion, map ALL 7 domain parameters intelligently
  const handleSelectPlace = (place) => {
    const elev = place.elevation_m || formData.elevation_m || 50.0;
    
    setFormData(prev => ({
      ...prev,
      site_name: place.name,
      state: place.state,
      district: place.district || place.state,
      latitude: place.latitude,
      longitude: place.longitude,
      elevation_m: elev,
      
      water_params: {
        ...prev.water_params,
        elevation_m: elev,
        water_quality_tds: place.water_tds || prev.water_params.water_quality_tds,
      },
      
      power_params: {
        ...prev.power_params,
        voltage_class_kv: place.voltage_class_kv || prev.power_params.voltage_class_kv,
        substation_distance_km: place.substation_dist_km || prev.power_params.substation_distance_km,
      },

      connectivity_params: {
        ...prev.connectivity_params,
        rtt_to_landing_station_ms: place.subsea_rtt_ms || prev.connectivity_params.rtt_to_landing_station_ms,
      },

      disaster_params: {
        ...prev.disaster_params,
        seismic_zone: place.seismic_zone || prev.disaster_params.seismic_zone,
      },

      economics_params: {
        ...prev.economics_params,
        electricity_tariff_inr_per_kwh: place.tariff_inr || prev.economics_params.electricity_tariff_inr_per_kwh,
      }
    }));

    setSearchTerm(place.name);
    setShowDropdown(false);
    setAppliedPlaceMessage(`Applied base parameters for ${place.name} (${place.latitude}°N, ${place.longitude}°E). Click below to fetch live NASA & Gov telemetry!`);

    setTimeout(() => {
      setAppliedPlaceMessage(null);
    }, 5000);
  };

  // Fetch genuine real-time data from NASA & Indian Gov APIs
  const handleFetchLiveTelemetry = async () => {
    setIsLoadingTelemetry(true);
    setTelemetryError(null);
    try {
      const res = await fetchLiveTelemetry({
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        state: formData.state,
        district: formData.district,
        site_name: formData.site_name,
        proposed_it_load_mw: parseFloat(formData.proposed_it_load_mw),
      });
      
      if (res && res.site_input) {
        const inp = res.site_input;
        setFormData(prev => ({
          ...prev,
          site_name: inp.site_name || prev.site_name,
          state: inp.state || prev.state,
          district: inp.district || prev.district,
          elevation_m: inp.elevation_m || prev.elevation_m,
          proposed_it_load_mw: inp.proposed_it_load_mw || prev.proposed_it_load_mw,
          water_params: { ...prev.water_params, ...(inp.water_params || {}) },
          power_params: { ...prev.power_params, ...(inp.power_params || {}) },
          climate_params: { ...prev.climate_params, ...(inp.climate_params || {}) },
          connectivity_params: { ...prev.connectivity_params, ...(inp.connectivity_params || {}) },
          disaster_params: { ...prev.disaster_params, ...(inp.disaster_params || {}) },
          land_params: { ...prev.land_params, ...(inp.land_params || {}) },
          economics_params: { ...prev.economics_params, ...(inp.economics_params || {}) },
        }));

        setTelemetryResult(res);
        setIsLiveEvaluated(true);
        setAppliedPlaceMessage(`Successfully loaded verified telemetry from NASA POWER, NASA SRTM, CAMS AQI, USGS & CGWB!`);
      }
    } catch (err) {
      console.error("Live telemetry error:", err);
      setTelemetryError(err.response?.data?.detail || err.message || "Failed to fetch live telemetry. Fallback normals active.");
    } finally {
      setIsLoadingTelemetry(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        is_live_evaluated: isLiveEvaluated,
        data_provenance: telemetryResult?.provenance || null,
      };
      await onAssessCustomSite(payload);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const domainTabs = [
    { id: 'water', label: '💧 Water', icon: <Droplet className="w-3.5 h-3.5 text-[#074ce0]" /> },
    { id: 'power', label: '⚡ Power', icon: <Zap className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 'climate', label: '🌡️ Climate', icon: <Thermometer className="w-3.5 h-3.5 text-indigo-500" /> },
    { id: 'connectivity', label: '🌐 Network', icon: <Wifi className="w-3.5 h-3.5 text-emerald-500" /> },
    { id: 'disaster', label: '🛡️ Disaster', icon: <Shield className="w-3.5 h-3.5 text-rose-500" /> },
    { id: 'land_econ', label: '🏗️ Land & Econ', icon: <Layers className="w-3.5 h-3.5 text-purple-500" /> },
  ];

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      
      <div className="bg-white border border-[#dde0e6] w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-[#dde0e6] flex items-center justify-between bg-[#fcfcfd]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#074ce0] flex items-center justify-center text-white shadow-sm">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-display text-[#16191f]">
                  Greenfield Candidate Site Simulation
                </h3>
                {isLiveEvaluated && (
                  <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    NASA & GOV TELEMETRY ACTIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-[#454c58] font-mono">
                Authentic 7-Domain Ingestion: NASA POWER, NASA SRTM, CAMS ECMWF, USGS, CGWB & CEA
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#454c58] hover:text-[#16191f] hover:bg-[#f3f4f6] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Autocomplete Search & Quick-Select Bar */}
          <div ref={searchContainerRef} className="relative">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#454c58] mb-1.5 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#074ce0]" />
              Smart City & Industrial Zone Suggester
            </label>
            
            <div className="relative">
              <Search className="w-4 h-4 text-[#8c94a4] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search any Indian city, MIDC, GIDC, SEZ, or Tech Hub (e.g. Dholera, GIFT City, Hinjewadi, Noida)..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                className="w-full bg-[#f3f4f6] border border-[#dde0e6] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#16191f] font-sans focus:outline-none focus:border-[#074ce0] shadow-sm"
              />
              {isSearchingOnline && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  <div className="w-3.5 h-3.5 border-2 border-[#074ce0] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Notification Banner when place applied */}
            {appliedPlaceMessage && (
              <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-800 flex items-center gap-2 animate-fadeIn">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{appliedPlaceMessage}</span>
              </div>
            )}

            {/* Suggestions Dropdown */}
            {showDropdown && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#dde0e6] rounded-xl shadow-xl z-[2100] max-h-60 overflow-y-auto divide-y divide-[#dde0e6]">
                {suggestions.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectPlace(item)}
                    className="p-3 hover:bg-[#f3f4f6] cursor-pointer transition-colors flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-[#16191f] font-display flex items-center gap-2">
                        {item.name}
                        {item.category && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-50 text-[#074ce0] border border-blue-200">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#454c58] mt-0.5">
                        {item.district ? `${item.district}, ` : ''}{item.state} • {item.latitude.toFixed(3)}°N, {item.longitude.toFixed(3)}°E
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8c94a4]" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Authentic Live Telemetry Trigger Bar */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-emerald-50/80 border border-blue-200/80 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#074ce0] text-white flex items-center justify-center shrink-0 shadow-md">
                  <Satellite className={`w-5 h-5 ${isLoadingTelemetry ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-display text-[#16191f]">
                      NASA & Indian Gov Authentic Telemetry Ingestion
                    </span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-100 text-[#074ce0] border border-blue-300">
                      LIVE APIs
                    </span>
                  </div>
                  <p className="text-[11px] text-[#454c58] mt-0.5">
                    Connects directly to <strong>NASA POWER</strong> (30-yr climatology), <strong>NASA SRTM</strong> (30m elevation), <strong>CAMS ECMWF</strong> (air quality), <strong>USGS</strong> (seismicity), and <strong>CGWB</strong> (aquifer extraction).
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleFetchLiveTelemetry}
                disabled={isLoadingTelemetry}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#074ce0] hover:bg-[#074ce0]/90 text-white text-xs font-mono font-bold shadow-md hover:shadow-lg transition-all shrink-0 disabled:opacity-50"
              >
                {isLoadingTelemetry ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Querying NASA & Gov APIs...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    <span>Auto-Fetch Real Data ({formData.latitude}°N, {formData.longitude}°E)</span>
                  </>
                )}
              </button>
            </div>

            {/* Error banner if telemetry fetch failed */}
            {telemetryError && (
              <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs font-mono text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{telemetryError}</span>
              </div>
            )}

            {/* Active Telemetry Provenance Chips */}
            {isLiveEvaluated && telemetryResult && (
              <div className="mt-3 pt-3 border-t border-blue-200/60 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-[10px] font-mono">
                <div className="p-1.5 bg-white/90 rounded border border-blue-100 text-[#16191f]">
                  <div className="text-gray-500 font-bold">🛰️ NASA POWER</div>
                  <div>{formData.climate_params.dry_bulb_temp_c}°C • {formData.climate_params.relative_humidity_pct}% RH</div>
                </div>
                <div className="p-1.5 bg-white/90 rounded border border-blue-100 text-[#16191f]">
                  <div className="text-gray-500 font-bold">⛰️ NASA SRTM</div>
                  <div>{formData.elevation_m}m ASL Elevation</div>
                </div>
                <div className="p-1.5 bg-white/90 rounded border border-blue-100 text-[#16191f]">
                  <div className="text-gray-500 font-bold">🌫️ CAMS AQI</div>
                  <div>{formData.climate_params.air_quality_pm25} µg/m³ PM2.5</div>
                </div>
                <div className="p-1.5 bg-white/90 rounded border border-blue-100 text-[#16191f]">
                  <div className="text-gray-500 font-bold">🌊 CGWB SOE</div>
                  <div>{formData.water_params.groundwater_extraction_pct}% Extraction</div>
                </div>
                <div className="p-1.5 bg-white/90 rounded border border-blue-100 text-[#16191f]">
                  <div className="text-gray-500 font-bold">⚡ CEA Grid</div>
                  <div>{formData.power_params.substation_distance_km}km • {formData.power_params.voltage_class_kv}kV</div>
                </div>
                <div className="p-1.5 bg-white/90 rounded border border-blue-100 text-[#16191f]">
                  <div className="text-gray-500 font-bold">🌋 BIS Seismic</div>
                  <div>Zone {formData.disaster_params.seismic_zone} (IS 1893)</div>
                </div>
              </div>
            )}
          </div>

          {/* Basic Site Identifiers & Geographic Coordinates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 bg-[#fcfcfd] p-4 rounded-xl border border-[#dde0e6]">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-mono text-[#454c58] mb-1 font-semibold">Site Name</label>
              <input
                type="text"
                value={formData.site_name}
                onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                className="w-full bg-white border border-[#dde0e6] rounded-lg px-2.5 py-1.5 text-xs text-[#16191f] focus:outline-none focus:border-[#074ce0]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-[#454c58] mb-1 font-semibold">Latitude (°N)</label>
              <input
                type="number"
                step="0.0001"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                className="w-full bg-white border border-[#dde0e6] rounded-lg px-2.5 py-1.5 text-xs text-[#16191f] focus:outline-none focus:border-[#074ce0]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-[#454c58] mb-1 font-semibold">Longitude (°E)</label>
              <input
                type="number"
                step="0.0001"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                className="w-full bg-white border border-[#dde0e6] rounded-lg px-2.5 py-1.5 text-xs text-[#16191f] focus:outline-none focus:border-[#074ce0]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-[#454c58] mb-1 font-semibold">Elevation (m ASL)</label>
              <input
                type="number"
                value={formData.elevation_m}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setFormData({ 
                    ...formData, 
                    elevation_m: val, 
                    water_params: { ...formData.water_params, elevation_m: val } 
                  });
                }}
                className="w-full bg-white border border-[#dde0e6] rounded-lg px-2.5 py-1.5 text-xs text-[#16191f] focus:outline-none focus:border-[#074ce0]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-[#454c58] mb-1 font-semibold">IT Load (MW)</label>
              <input
                type="number"
                value={formData.proposed_it_load_mw}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setFormData({ 
                    ...formData, 
                    proposed_it_load_mw: val,
                    power_params: { ...formData.power_params, proposed_it_load_mw: val }
                  });
                }}
                className="w-full bg-white border border-[#dde0e6] rounded-lg px-2.5 py-1.5 text-xs text-[#16191f] focus:outline-none focus:border-[#074ce0]"
              />
            </div>
          </div>

          {/* Domain Tab Selector Bar */}
          <div>
            <div className="flex flex-wrap items-center gap-1.5 border-b border-[#dde0e6] pb-2">
              {domainTabs.map((tab) => {
                const active = activeDomainTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveDomainTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                      active
                        ? 'bg-[#074ce0] text-white shadow-sm font-semibold'
                        : 'bg-[#f3f4f6] text-[#454c58] hover:text-[#16191f]'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Domain Form Body Panels */}
          <div className="p-4 rounded-xl border border-[#dde0e6] bg-[#fcfcfd]">
            
            {/* 1. Water Domain */}
            {activeDomainTab === 'water' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono text-[#074ce0] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Droplet className="w-4 h-4" />
                    Water Subsystem Telemetry (CGWA / BIS 10500 Standards)
                  </div>
                  <span className="text-[10px] font-mono text-[#454c58] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Source: CGWB Groundwater Assessment 2023
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <label className="block text-[#454c58] mb-1">
                      CGWA Groundwater Extraction %: <strong>{formData.water_params.groundwater_extraction_pct}%</strong>
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="150"
                      value={formData.water_params.groundwater_extraction_pct}
                      onChange={(e) => setFormData({
                        ...formData,
                        water_params: { ...formData.water_params, groundwater_extraction_pct: parseFloat(e.target.value) }
                      })}
                      className="w-full accent-[#074ce0]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#454c58] mb-1">
                      Water Quality TDS (mg/L): <strong>{formData.water_params.water_quality_tds} mg/L</strong>
                    </label>
                    <input
                      type="range"
                      min="100"
                      max="2500"
                      step="50"
                      value={formData.water_params.water_quality_tds}
                      onChange={(e) => setFormData({
                        ...formData,
                        water_params: { ...formData.water_params, water_quality_tds: parseFloat(e.target.value) }
                      })}
                      className="w-full accent-[#074ce0]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#454c58] mb-1">
                      Distance to Nearest STP/CETP: <strong>{formData.water_params.stp_distance_km} km</strong>
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="25"
                      step="0.5"
                      value={formData.water_params.stp_distance_km}
                      onChange={(e) => setFormData({
                        ...formData,
                        water_params: { ...formData.water_params, stp_distance_km: parseFloat(e.target.value) }
                      })}
                      className="w-full accent-[#074ce0]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#454c58] mb-1">
                      On-Site Buffer Storage: <strong>{formData.water_params.on_site_storage_hours} Hours</strong>
                    </label>
                    <input
                      type="range"
                      min="12"
                      max="120"
                      step="6"
                      value={formData.water_params.on_site_storage_hours}
                      onChange={(e) => setFormData({
                        ...formData,
                        water_params: { ...formData.water_params, on_site_storage_hours: parseFloat(e.target.value) }
                      })}
                      className="w-full accent-[#074ce0]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. Power Domain */}
            {activeDomainTab === 'power' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono text-amber-600 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-4 h-4" />
                    Electrical Grid Transmission Telemetry (CEA Planning Guidelines)
                  </div>
                  <span className="text-[10px] font-mono text-[#454c58] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Source: CEA National Substation Database
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <label className="block text-[#454c58] mb-1">
                      Substation Distance: <strong>{formData.power_params.substation_distance_km} km</strong>
                    </label>
                    <input
                      type="range"
                      min="0.2"
                      max="20"
                      step="0.2"
                      value={formData.power_params.substation_distance_km}
                      onChange={(e) => setFormData({
                        ...formData,
                        power_params: { ...formData.power_params, substation_distance_km: parseFloat(e.target.value) }
                      })}
                      className="w-full accent-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[#454c58] mb-1">
                      Grid Voltage Class: <strong>{formData.power_params.voltage_class_kv} kV</strong>
                    </label>
                    <select
                      value={formData.power_params.voltage_class_kv}
                      onChange={(e) => setFormData({
                        ...formData,
                        power_params: { ...formData.power_params, voltage_class_kv: parseFloat(e.target.value) }
                      })}
                      className="w-full bg-white border border-[#dde0e6] rounded-lg px-2.5 py-1.5 text-xs text-[#16191f]"
                    >
                      <option value="66.0">66 kV Line</option>
                      <option value="110.0">110 kV Line</option>
                      <option value="132.0">132 kV Transmission Line</option>
                      <option value="220.0">220 kV EHV Transmission Line</option>
                      <option value="400.0">400 kV National Grid Interconnect</option>
                      <option value="765.0">765 kV Super-Grid Backbone</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#454c58] mb-1">
                      Substation Spare MVA Margin: <strong>{formData.power_params.spare_mva_margin} MVA</strong>
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="300"
                      step="10"
                      value={formData.power_params.spare_mva_margin}
                      onChange={(e) => setFormData({
                        ...formData,
                        power_params: { ...formData.power_params, spare_mva_margin: parseFloat(e.target.value) }
                      })}
                      className="w-full accent-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[#454c58] mb-1">
                      Renewable Open-Access Score: <strong>{formData.power_params.renewable_open_access_score}/100</strong>
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={formData.power_params.renewable_open_access_score}
                      onChange={(e) => setFormData({
                        ...formData,
                        power_params: { ...formData.power_params, renewable_open_access_score: parseFloat(e.target.value) }
                      })}
                      className="w-full accent-amber-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. Climate Domain */}
            {activeDomainTab === 'climate' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono text-indigo-600 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Thermometer className="w-4 h-4" />
                    Atmospheric & Climatology Telemetry (ASHRAE TC 9.9)
                  </div>
                  <span className="text-[10px] font-mono text-[#454c58] bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    Source: NASA POWER API (30-Year Climatology)
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <label className="block text-[#454c58] mb-1">
                      NASA 30-Year Dry Bulb Temp (°C): <strong>{formData.climate_params.dry_bulb_temp_c}°C</strong>
                    </label>
                    <input
                      type="range"
                      min="15"
                      max="48"
                      step="0.5"
                      value={formData.climate_params.dry_bulb_temp_c}
                      onChange={(e) => setFormData({
                        ...formData,
                        climate_params: { ...formData.climate_params, dry_bulb_temp_c: parseFloat(e.target.value) }
                      })}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[#454c58] mb-1">
                      NASA Relative Humidity (%): <strong>{formData.climate_params.relative_humidity_pct}%</strong>
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="95"
                      value={formData.climate_params.relative_humidity_pct}
                      onChange={(e) => setFormData({
                        ...formData,
                        climate_params: { ...formData.climate_params, relative_humidity_pct: parseFloat(e.target.value) }
                      })}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[#454c58] mb-1">
                      Annual Cooling Degree Days (CDD): <strong>{formData.climate_params.annual_cooling_degree_days}</strong>
                    </label>
                    <input
                      type="range"
                      min="1000"
                      max="4500"
                      step="50"
                      value={formData.climate_params.annual_cooling_degree_days}
                      onChange={(e) => setFormData({
                        ...formData,
                        climate_params: { ...formData.climate_params, annual_cooling_degree_days: parseFloat(e.target.value) }
                      })}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[#454c58] mb-1">
                      CAMS Air Quality PM2.5 (µg/m³): <strong>{formData.climate_params.air_quality_pm25} µg/m³</strong>
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="250"
                      step="5"
                      value={formData.climate_params.air_quality_pm25}
                      onChange={(e) => setFormData({
                        ...formData,
                        climate_params: { ...formData.climate_params, air_quality_pm25: parseFloat(e.target.value) }
                      })}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. Connectivity Domain */}
            {activeDomainTab === 'connectivity' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Wifi className="w-4 h-4" />
                    Subsea Cable Landing Station & Optical Peering Telemetry
                  </div>
                  <span className="text-[10px] font-mono text-[#454c58] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Source: National Subsea CLS & NIXI Database
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <label className="block text-[#454c58] mb-1">
                      RTT to Subsea Landing Station (Mumbai/Chennai): <strong>{formData.connectivity_params.rtt_to_landing_station_ms} ms</strong>
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="35"
                      step="0.5"
                      value={formData.connectivity_params.rtt_to_landing_station_ms}
                      onChange={(e) => setFormData({
                        ...formData,
                        connectivity_params: { ...formData.connectivity_params, rtt_to_landing_station_ms: parseFloat(e.target.value) }
                      })}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[#454c58] mb-1">
                      Distance to NIXI Internet Exchange Node: <strong>{formData.connectivity_params.nixi_distance_km} km</strong>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="150"
                      step="1"
                      value={formData.connectivity_params.nixi_distance_km}
                      onChange={(e) => setFormData({
                        ...formData,
                        connectivity_params: { ...formData.connectivity_params, nixi_distance_km: parseFloat(e.target.value) }
                      })}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[#454c58] mb-1">
                      Carrier-Neutral Telco Providers: <strong>{formData.connectivity_params.carrier_neutral_providers_count} Telcos</strong>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="8"
                      value={formData.connectivity_params.carrier_neutral_providers_count}
                      onChange={(e) => setFormData({
                        ...formData,
                        connectivity_params: { ...formData.connectivity_params, carrier_neutral_providers_count: parseInt(e.target.value) }
                      })}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[#454c58] mb-1">
                      Geographically Diverse Dark Fiber Routes: <strong>{formData.connectivity_params.dark_fiber_routes_count} Routes</strong>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="6"
                      value={formData.connectivity_params.dark_fiber_routes_count}
                      onChange={(e) => setFormData({
                        ...formData,
                        connectivity_params: { ...formData.connectivity_params, dark_fiber_routes_count: parseInt(e.target.value) }
                      })}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 5. Disaster Domain */}
            {activeDomainTab === 'disaster' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono text-rose-600 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />
                    Geophysical Hazard & Seismic Resilience (BIS IS 1893:2016)
                  </div>
                  <span className="text-[10px] font-mono text-[#454c58] bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    Source: BIS IS 1893:2016 & USGS Seismic Catalog
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <label className="block text-[#454c58] mb-1">
                      Official BIS Seismic Zone: <strong>Zone {formData.disaster_params.seismic_zone}</strong>
                    </label>
                    <select
                      value={formData.disaster_params.seismic_zone}
                      onChange={(e) => setFormData({
                        ...formData,
                        disaster_params: { ...formData.disaster_params, seismic_zone: e.target.value }
                      })}
                      className="w-full bg-white border border-[#dde0e6] rounded-lg px-2.5 py-1.5 text-xs text-[#16191f]"
                    >
                      <option value="II">Zone II (Low Damage Risk - PGA 0.10g)</option>
                      <option value="III">Zone III (Moderate Risk - PGA 0.16g)</option>
                      <option value="IV">Zone IV (High Damage Risk - PGA 0.24g)</option>
                      <option value="V">Zone V (Very High Damage Risk - PGA 0.36g)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#454c58] mb-1">
                      Height Above 100-Year High Flood Level (HFL): <strong>{formData.disaster_params.elevation_above_hfl_m} meters</strong>
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="15"
                      step="0.5"
                      value={formData.disaster_params.elevation_above_hfl_m}
                      onChange={(e) => setFormData({
                        ...formData,
                        disaster_params: { ...formData.disaster_params, elevation_above_hfl_m: parseFloat(e.target.value) }
                      })}
                      className="w-full accent-rose-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 6. Land & Economics Domain */}
            {activeDomainTab === 'land_econ' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono text-purple-600 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Coins className="w-4 h-4" />
                    Civil Land Readiness & State Policy Economics
                  </div>
                  <span className="text-[10px] font-mono text-[#454c58] bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    Source: State SERC Tariffs & MeitY Policies
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <label className="block text-[#454c58] mb-1">
                      Base Industrial Power Tariff: <strong>₹{formData.economics_params.electricity_tariff_inr_per_kwh}/kWh</strong>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.economics_params.electricity_tariff_inr_per_kwh}
                      onChange={(e) => setFormData({
                        ...formData,
                        economics_params: { ...formData.economics_params, electricity_tariff_inr_per_kwh: parseFloat(e.target.value) }
                      })}
                      className="w-full bg-white border border-[#dde0e6] rounded-lg px-2.5 py-1.5 text-xs text-[#16191f]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#454c58] mb-1">
                      State Capital Subsidy (%): <strong>{formData.economics_params.capital_subsidy_pct}%</strong>
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={formData.economics_params.capital_subsidy_pct}
                      onChange={(e) => setFormData({
                        ...formData,
                        economics_params: { ...formData.economics_params, capital_subsidy_pct: parseFloat(e.target.value) }
                      })}
                      className="w-full bg-white border border-[#dde0e6] rounded-lg px-2.5 py-1.5 text-xs text-[#16191f]"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-3">
                    <input
                      type="checkbox"
                      id="notifiedZone"
                      checked={formData.land_params.is_notified_it_industrial_zone}
                      onChange={(e) => setFormData({
                        ...formData,
                        land_params: { ...formData.land_params, is_notified_it_industrial_zone: e.target.checked }
                      })}
                      className="w-4 h-4 accent-[#074ce0]"
                    />
                    <label htmlFor="notifiedZone" className="text-xs text-[#16191f] cursor-pointer font-sans font-medium">
                      Notified IT / Industrial Master Plan Zone (MIDC, GIDC, YEIDA, SIPCOT)
                    </label>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-[#dde0e6] flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#dde0e6] text-[#454c58] hover:text-[#16191f] text-xs font-mono"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#074ce0] text-white hover:bg-[#074ce0]/90 text-xs font-mono font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>
                  {isSubmitting 
                    ? 'Evaluating 7 Engines...' 
                    : isLiveEvaluated 
                    ? 'Assess Site with Verified Live Telemetry' 
                    : 'Execute Deterministic Assessment'}
                </span>
              </button>
            </div>
          </div>

        </form>

      </div>

    </div>
  );
}
