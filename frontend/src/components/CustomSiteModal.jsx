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
  Info
} from 'lucide-react';
import { STRATEGIC_INDIAN_PLACES } from '../data/indianPlaces';

export default function CustomSiteModal({ isOpen, onClose, onAssessCustomSite }) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    site_name: 'Custom Greenfield Data Center',
    state: 'Maharashtra',
    district: 'Pune / Chakan',
    latitude: 18.7520,
    longitude: 73.8560,
    elevation_m: 640.0,
    proposed_it_load_mw: 50.0,
    water_params: {
      groundwater_extraction_pct: 75.0,
      water_quality_tds: 480.0,
      demand_stress_score: 55.0,
      data_center_demand_mld: 1.5,
      local_aquifer_stress_pct: 65.0,
      industrial_density_index: 60.0,
      stp_distance_km: 4.5,
      tertiary_supply_mld: 20.0,
      assured_supply_mld: 2.5,
      on_site_storage_hours: 48.0,
      elevation_m: 640.0,
      drought_risk_index: 30.0,
      flood_zone_risk: 15.0,
    },
    power_params: {
      substation_distance_km: 2.5,
      voltage_class_kv: 220.0,
      spare_mva_margin: 70.0,
      proposed_it_load_mw: 50.0,
      renewable_open_access_score: 75.0,
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  // Filter local strategic places + debounced Nominatim geocoder
  useEffect(() => {
    if (!searchTerm || searchTerm.trim().length === 0) {
      // Show top strategic hubs when focused but empty
      setSuggestions(STRATEGIC_INDIAN_PLACES.slice(0, 8));
      setIsSearchingOnline(false);
      return;
    }

    const query = searchTerm.toLowerCase().trim();
    
    // 1. Search in local verified catalog
    const localMatches = STRATEGIC_INDIAN_PLACES.filter(place => 
      place.name.toLowerCase().includes(query) ||
      place.state.toLowerCase().includes(query) ||
      place.district.toLowerCase().includes(query) ||
      place.category.toLowerCase().includes(query)
    );

    setSuggestions(localMatches);

    // 2. If fewer than 5 matches or specific query, query Nominatim API for any Indian city/locality
    const timer = setTimeout(async () => {
      if (query.length >= 3) {
        setIsSearchingOnline(true);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchTerm)}&countrycodes=in&format=json&addressdetails=1&limit=5`,
            { headers: { 'Accept-Language': 'en' } }
          );
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

            // Combine unique items
            setSuggestions(prev => {
              const existingCoords = new Set(prev.map(p => `${p.latitude.toFixed(2)},${p.longitude.toFixed(2)}`));
              const newItems = externalSuggestions.filter(item => !existingCoords.has(`${item.latitude.toFixed(2)},${item.longitude.toFixed(2)}`));
              return [...prev, ...newItems].slice(0, 10);
            });
          }
        } catch (err) {
          // Gracefully fallback to local matches
          console.warn('Geocoding search failed or offline:', err);
        } finally {
          setIsSearchingOnline(false);
        }
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // When user selects a suggestion
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
      }
    }));

    setSearchTerm(place.name);
    setShowDropdown(false);
    setAppliedPlaceMessage(`Applied coordinates: ${place.latitude}° N, ${place.longitude}° E for ${place.name}`);

    // Auto-clear notification after 5 seconds
    setTimeout(() => {
      setAppliedPlaceMessage(null);
    }, 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onAssessCustomSite(formData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickPicks = [
    STRATEGIC_INDIAN_PLACES[0], // GIFT City
    STRATEGIC_INDIAN_PLACES[1], // Dholera SIR
    STRATEGIC_INDIAN_PLACES[3], // Navi Mumbai
    STRATEGIC_INDIAN_PLACES[5], // Pune Hinjewadi
    STRATEGIC_INDIAN_PLACES[7], // Hyderabad Gachibowli
    STRATEGIC_INDIAN_PLACES[9], // Bengaluru Whitefield
    STRATEGIC_INDIAN_PLACES[12], // Chennai Siruseri
    STRATEGIC_INDIAN_PLACES[14], // Greater Noida
    STRATEGIC_INDIAN_PLACES[19], // Kochi Infopark
    STRATEGIC_INDIAN_PLACES[22], // Indore Super Corridor
  ];

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-xl border border-[#dde0e6] bg-white p-6 my-8 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#dde0e6]">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#074ce0]" />
            <h3 className="text-lg font-bold font-display text-[#16191f]">
              Greenfield AI Compute Site Simulator
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#454c58] hover:text-[#16191f] hover:bg-[#f3f4f6] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          
          {/* City & Place Autocomplete Search Box */}
          <div className="space-y-2 p-4 rounded-xl bg-blue-50/40 border border-[#074ce0]/20" ref={searchContainerRef}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-display font-bold uppercase tracking-wider text-[#074ce0] flex items-center gap-1.5">
                <Search className="w-4 h-4 text-[#074ce0]" />
                Auto-Suggest City, Strategic Hub or Place
              </label>
              <span className="text-[10px] font-mono text-[#454c58]">
                Coordinates & regional baseline will apply automatically
              </span>
            </div>

            <div className="relative">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Type Indian city, tech park or industrial cluster (e.g. GIFT City, Hinjewadi, Whitefield, Dholera, Noida)..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full bg-white border border-[#dde0e6] rounded-lg pl-9 pr-24 py-2 text-xs text-[#16191f] font-sans focus:outline-none focus:border-[#074ce0] focus:ring-1 focus:ring-[#074ce0] shadow-sm"
                />
                <Navigation className="w-4 h-4 text-[#074ce0] absolute left-3 pointer-events-none" />
                
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setSuggestions(STRATEGIC_INDIAN_PLACES.slice(0, 8));
                    }}
                    className="absolute right-2 text-xs text-[#454c58] hover:text-[#16191f] px-2 py-0.5 rounded"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Suggestions Dropdown */}
              {showDropdown && suggestions.length > 0 && (
                <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-[#dde0e6] rounded-xl shadow-xl max-h-72 overflow-y-auto divided-y divide-[#dde0e6]">
                  <div className="p-2 bg-[#f3f4f6] text-[10px] font-mono text-[#454c58] flex justify-between items-center border-b border-[#dde0e6]">
                    <span>Suggested Verified Locations ({suggestions.length})</span>
                    {isSearchingOnline && <span className="text-[#074ce0] animate-pulse">Searching OSM...</span>}
                  </div>

                  {suggestions.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectPlace(item)}
                      className="p-3 hover:bg-[#f3f4f6] cursor-pointer transition-colors border-b border-[#dde0e6]/60 last:border-b-0 flex items-start justify-between gap-3 text-left"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-[#074ce0] flex-shrink-0" />
                          <span className="text-xs font-bold text-[#16191f] font-display">
                            {item.name}
                          </span>
                          <span className="text-[10px] font-sans px-1.5 py-0.2 rounded bg-blue-50 text-[#074ce0] border border-[#074ce0]/20 font-medium">
                            {item.category}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#454c58] font-sans">
                          {item.district ? `${item.district}, ` : ''}{item.state}
                          {item.highlight && <span className="text-[#8c94a4]"> • {item.highlight}</span>}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="text-[11px] font-mono font-bold text-[#074ce0]">
                          {item.latitude.toFixed(4)}° N, {item.longitude.toFixed(4)}° E
                        </div>
                        <div className="text-[10px] font-mono text-[#8c94a4]">
                          Elev: {item.elevation_m}m
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Strategic Hub Chips */}
            <div className="pt-2">
              <div className="text-[11px] font-sans text-[#454c58] mb-1.5 font-medium flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#074ce0]" />
                <span>Quick-Select High-Potential AI Hubs:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {quickPicks.map((pick, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPlace(pick)}
                    className="text-[11px] font-sans px-2.5 py-1 rounded-md bg-white hover:bg-[#f3f4f6] text-[#16191f] border border-[#dde0e6] transition-colors shadow-2xs hover:border-[#074ce0]/60"
                  >
                    {pick.name.split(' (')[0]} <span className="text-[#454c58] font-mono text-[10px]">({pick.state.slice(0, 2).toUpperCase()})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Success Applied Banner */}
            {appliedPlaceMessage && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-sans flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-medium">{appliedPlaceMessage}</span>
              </div>
            )}
          </div>

          {/* General Geographic Telemetry Fields */}
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-[#074ce0] font-semibold flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#074ce0]" />
              Applied Geographic Telemetry (Auto-Populated & Editable)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-sans font-medium text-[#454c58] mb-1 block">Site Name</label>
                <input 
                  type="text" 
                  value={formData.site_name}
                  onChange={(e) => setFormData({...formData, site_name: e.target.value})}
                  className="w-full bg-[#f3f4f6] border border-[#dde0e6] rounded-lg px-2.5 py-1.5 text-xs text-[#16191f] font-sans focus:outline-none focus:border-[#074ce0] focus:ring-1 focus:ring-[#074ce0]"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-sans font-medium text-[#454c58] mb-1 block">State</label>
                <input 
                  type="text" 
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  className="w-full bg-[#f3f4f6] border border-[#dde0e6] rounded-lg px-2.5 py-1.5 text-xs text-[#16191f] font-sans focus:outline-none focus:border-[#074ce0] focus:ring-1 focus:ring-[#074ce0]"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-sans font-medium text-[#454c58] mb-1 block">District / Region</label>
                <input 
                  type="text" 
                  value={formData.district}
                  onChange={(e) => setFormData({...formData, district: e.target.value})}
                  className="w-full bg-[#f3f4f6] border border-[#dde0e6] rounded-lg px-2.5 py-1.5 text-xs text-[#16191f] font-sans focus:outline-none focus:border-[#074ce0] focus:ring-1 focus:ring-[#074ce0]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-sans font-medium text-[#454c58] mb-1 flex items-center justify-between">
                  <span>Latitude</span>
                  <span className="text-[10px] text-[#074ce0] font-mono font-bold">Auto</span>
                </label>
                <input 
                  type="number" step="0.0001"
                  value={formData.latitude}
                  onChange={(e) => setFormData({...formData, latitude: parseFloat(e.target.value) || 0})}
                  className="w-full bg-[#f3f4f6] border border-[#dde0e6] rounded-lg px-2.5 py-1.5 text-xs text-[#16191f] font-mono focus:outline-none focus:border-[#074ce0] focus:ring-1 focus:ring-[#074ce0]"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-sans font-medium text-[#454c58] mb-1 flex items-center justify-between">
                  <span>Longitude</span>
                  <span className="text-[10px] text-[#074ce0] font-mono font-bold">Auto</span>
                </label>
                <input 
                  type="number" step="0.0001"
                  value={formData.longitude}
                  onChange={(e) => setFormData({...formData, longitude: parseFloat(e.target.value) || 0})}
                  className="w-full bg-[#f3f4f6] border border-[#dde0e6] rounded-lg px-2.5 py-1.5 text-xs text-[#16191f] font-mono focus:outline-none focus:border-[#074ce0] focus:ring-1 focus:ring-[#074ce0]"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-sans font-medium text-[#454c58] mb-1 block">Ground Elevation (m)</label>
                <input 
                  type="number" step="0.1"
                  value={formData.elevation_m}
                  onChange={(e) => {
                    const elev = parseFloat(e.target.value) || 0;
                    setFormData({
                      ...formData, 
                      elevation_m: elev,
                      water_params: {...formData.water_params, elevation_m: elev}
                    });
                  }}
                  className="w-full bg-[#f3f4f6] border border-[#dde0e6] rounded-lg px-2.5 py-1.5 text-xs text-[#16191f] font-mono focus:outline-none focus:border-[#074ce0] focus:ring-1 focus:ring-[#074ce0]"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-sans font-medium text-[#454c58] mb-1 block">Target IT Load (MW)</label>
                <input 
                  type="number" step="1"
                  value={formData.proposed_it_load_mw}
                  onChange={(e) => {
                    const mw = parseFloat(e.target.value) || 0;
                    setFormData({
                      ...formData, 
                      proposed_it_load_mw: mw,
                      power_params: {...formData.power_params, proposed_it_load_mw: mw}
                    });
                  }}
                  className="w-full bg-[#f3f4f6] border border-[#dde0e6] rounded-lg px-2.5 py-1.5 text-xs text-[#16191f] font-mono focus:outline-none focus:border-[#074ce0] focus:ring-1 focus:ring-[#074ce0]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Water Engine Inputs */}
          <div className="space-y-3 pt-3 border-t border-[#dde0e6]">
            <div className="text-xs font-mono uppercase tracking-wider text-[#074ce0] font-semibold flex items-center gap-1.5">
              <Droplet className="w-3.5 h-3.5 text-[#074ce0]" />
              7-Model CGWA Water Parameters
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-sans font-medium text-[#454c58] mb-1 block">CGWA GW Extraction %</label>
                <input 
                  type="number" step="1"
                  value={formData.water_params.groundwater_extraction_pct}
                  onChange={(e) => setFormData({
                    ...formData,
                    water_params: {...formData.water_params, groundwater_extraction_pct: parseFloat(e.target.value) || 0}
                  })}
                  className="w-full bg-[#f3f4f6] border border-[#dde0e6] rounded-lg px-2.5 py-1.5 text-xs text-[#16191f] font-mono focus:outline-none focus:border-[#074ce0] focus:ring-1 focus:ring-[#074ce0]"
                />
              </div>
              <div>
                <label className="text-[11px] font-sans font-medium text-[#454c58] mb-1 block">Water Quality TDS (mg/L)</label>
                <input 
                  type="number" step="10"
                  value={formData.water_params.water_quality_tds}
                  onChange={(e) => setFormData({
                    ...formData,
                    water_params: {...formData.water_params, water_quality_tds: parseFloat(e.target.value) || 0}
                  })}
                  className="w-full bg-[#f3f4f6] border border-[#dde0e6] rounded-lg px-2.5 py-1.5 text-xs text-[#16191f] font-mono focus:outline-none focus:border-[#074ce0] focus:ring-1 focus:ring-[#074ce0]"
                />
              </div>
              <div>
                <label className="text-[11px] font-sans font-medium text-[#454c58] mb-1 block">Demand Stress Score (0-100)</label>
                <input 
                  type="number" step="1"
                  value={formData.water_params.demand_stress_score}
                  onChange={(e) => setFormData({
                    ...formData,
                    water_params: {...formData.water_params, demand_stress_score: parseFloat(e.target.value) || 0}
                  })}
                  className="w-full bg-[#f3f4f6] border border-[#dde0e6] rounded-lg px-2.5 py-1.5 text-xs text-[#16191f] font-mono focus:outline-none focus:border-[#074ce0] focus:ring-1 focus:ring-[#074ce0]"
                />
              </div>
              <div>
                <label className="text-[11px] font-sans font-medium text-[#454c58] mb-1 block">STP Distance (km)</label>
                <input 
                  type="number" step="0.1"
                  value={formData.water_params.stp_distance_km}
                  onChange={(e) => setFormData({
                    ...formData,
                    water_params: {...formData.water_params, stp_distance_km: parseFloat(e.target.value) || 0}
                  })}
                  className="w-full bg-[#f3f4f6] border border-[#dde0e6] rounded-lg px-2.5 py-1.5 text-xs text-[#16191f] font-mono focus:outline-none focus:border-[#074ce0] focus:ring-1 focus:ring-[#074ce0]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-sans font-medium text-[#454c58] mb-1 block">Assured Supply (MLD)</label>
                <input 
                  type="number" step="0.1"
                  value={formData.water_params.assured_supply_mld}
                  onChange={(e) => setFormData({
                    ...formData,
                    water_params: {...formData.water_params, assured_supply_mld: parseFloat(e.target.value) || 0}
                  })}
                  className="w-full bg-[#f3f4f6] border border-[#dde0e6] rounded-lg px-2.5 py-1.5 text-xs text-[#16191f] font-mono focus:outline-none focus:border-[#074ce0] focus:ring-1 focus:ring-[#074ce0]"
                />
              </div>
              <div>
                <label className="text-[11px] font-sans font-medium text-[#454c58] mb-1 block">On-site Storage (Hours)</label>
                <input 
                  type="number" step="1"
                  value={formData.water_params.on_site_storage_hours}
                  onChange={(e) => setFormData({
                    ...formData,
                    water_params: {...formData.water_params, on_site_storage_hours: parseFloat(e.target.value) || 0}
                  })}
                  className="w-full bg-[#f3f4f6] border border-[#dde0e6] rounded-lg px-2.5 py-1.5 text-xs text-[#16191f] font-mono focus:outline-none focus:border-[#074ce0] focus:ring-1 focus:ring-[#074ce0]"
                />
              </div>
              <div>
                <label className="text-[11px] font-sans font-medium text-[#454c58] mb-1 block">Tertiary Recycled MLD</label>
                <input 
                  type="number" step="0.5"
                  value={formData.water_params.tertiary_supply_mld}
                  onChange={(e) => setFormData({
                    ...formData,
                    water_params: {...formData.water_params, tertiary_supply_mld: parseFloat(e.target.value) || 0}
                  })}
                  className="w-full bg-[#f3f4f6] border border-[#dde0e6] rounded-lg px-2.5 py-1.5 text-xs text-[#16191f] font-mono focus:outline-none focus:border-[#074ce0] focus:ring-1 focus:ring-[#074ce0]"
                />
              </div>
            </div>
          </div>

          {/* Power Module Inputs */}
          <div className="space-y-3 pt-3 border-t border-[#dde0e6]">
            <div className="text-xs font-mono uppercase tracking-wider text-[#074ce0] font-semibold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#074ce0]" />
              4-Metric CEA Electrical Grid Parameters
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-sans font-medium text-[#454c58] mb-1 block">Substation Distance (km)</label>
                <input 
                  type="number" step="0.1"
                  value={formData.power_params.substation_distance_km}
                  onChange={(e) => setFormData({
                    ...formData,
                    power_params: {...formData.power_params, substation_distance_km: parseFloat(e.target.value) || 0}
                  })}
                  className="w-full bg-[#f3f4f6] border border-[#dde0e6] rounded-lg px-2.5 py-1.5 text-xs text-[#16191f] font-mono focus:outline-none focus:border-[#074ce0] focus:ring-1 focus:ring-[#074ce0]"
                />
              </div>
              <div>
                <label className="text-[11px] font-sans font-medium text-[#454c58] mb-1 block">Voltage Class (kV)</label>
                <select 
                  value={formData.power_params.voltage_class_kv}
                  onChange={(e) => setFormData({
                    ...formData,
                    power_params: {...formData.power_params, voltage_class_kv: parseFloat(e.target.value) || 0}
                  })}
                  className="w-full bg-[#f3f4f6] border border-[#dde0e6] rounded-lg px-2.5 py-1.5 text-xs text-[#16191f] font-sans focus:outline-none focus:border-[#074ce0] focus:ring-1 focus:ring-[#074ce0]"
                >
                  <option value={400.0}>400 kV (EHV Bulk Transmission)</option>
                  <option value={220.0}>220 kV (Hyperscale Substation)</option>
                  <option value={132.0}>132 kV (Standard Industrial)</option>
                  <option value={66.0}>66 kV (Medium Industrial)</option>
                  <option value={33.0}>33 kV (Distribution Substation)</option>
                  <option value={11.0}>11 kV (Local Feeder)</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-sans font-medium text-[#454c58] mb-1 block">Spare MVA Margin</label>
                <input 
                  type="number" step="5"
                  value={formData.power_params.spare_mva_margin}
                  onChange={(e) => setFormData({
                    ...formData,
                    power_params: {...formData.power_params, spare_mva_margin: parseFloat(e.target.value) || 0}
                  })}
                  className="w-full bg-[#f3f4f6] border border-[#dde0e6] rounded-lg px-2.5 py-1.5 text-xs text-[#16191f] font-mono focus:outline-none focus:border-[#074ce0] focus:ring-1 focus:ring-[#074ce0]"
                />
              </div>
              <div>
                <label className="text-[11px] font-sans font-medium text-[#454c58] mb-1 block">Renewable Open Access (0-100)</label>
                <input 
                  type="number" step="1"
                  value={formData.power_params.renewable_open_access_score}
                  onChange={(e) => setFormData({
                    ...formData,
                    power_params: {...formData.power_params, renewable_open_access_score: parseFloat(e.target.value) || 0}
                  })}
                  className="w-full bg-[#f3f4f6] border border-[#dde0e6] rounded-lg px-2.5 py-1.5 text-xs text-[#16191f] font-mono focus:outline-none focus:border-[#074ce0] focus:ring-1 focus:ring-[#074ce0]"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-[#dde0e6] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-sans font-medium text-[#454c58] hover:text-[#16191f] bg-[#f3f4f6] hover:bg-[#e5e7eb] border border-[#dde0e6] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-sans font-semibold text-white bg-[#074ce0] hover:bg-[#053cb3] transition-colors shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {isSubmitting ? 'Evaluating...' : 'Run Deterministic Assessment'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
