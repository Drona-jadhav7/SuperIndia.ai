import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, MapPin, Cpu, Radio, ShieldAlert, Key, Settings } from 'lucide-react';

// Tile Providers (100% Free, No API Key Mandatory + Optional Custom Key Support)
const TILE_PROVIDERS = {
  carto_dark: {
    name: 'Carto Dark Matter',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    options: {
      attribution: '&copy; CARTO &copy; OpenStreetMap',
      subdomains: 'abcd',
      maxZoom: 20,
    },
  },
  osm_standard: {
    name: 'OpenStreetMap (Clean)',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    },
  },
  esri_satellite: {
    name: 'Satellite Terrain',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    options: {
      attribution: '&copy; Esri, Maxar, Earthstar',
      maxZoom: 18,
    },
  },
};

// National AI Ecosystem Supercomputers & Sovereign Clusters
const NATIONAL_SUPERCOMPUTERS = [
  {
    name: "AIRAWAT & Param Siddhi (C-DAC Pune)",
    type: "National AI Supercomputer",
    lat: 18.5204,
    lng: 73.8567,
    capacity: "13,170 TFLOPS (Peak) • 512x A100/H100",
    color: "#38BDF8", // Cyan
  },
  {
    name: "IIT Bombay AI Cluster (Powai)",
    type: "Academic Sovereign Node",
    lat: 19.1334,
    lng: 72.9133,
    capacity: "64x NVIDIA A100 80GB (NVLink 3)",
    color: "#818CF8", // Indigo
  },
  {
    name: "IIT Madras RBCDSAI (Chennai)",
    type: "Academic Sovereign Node",
    lat: 12.9915,
    lng: 80.2337,
    capacity: "128x NVIDIA A100 SXM4 (HDR InfiniBand)",
    color: "#818CF8",
  },
  {
    name: "IISc Computational Sciences (Bengaluru)",
    type: "Deep Learning Cluster",
    lat: 13.0219,
    lng: 77.5671,
    capacity: "32x NVIDIA H100 SXM5",
    color: "#A78BFA",
  },
  {
    name: "Param Ananta (IIT Gandhinagar)",
    type: "NSM Supercomputing Node",
    lat: 23.2156,
    lng: 72.6840,
    capacity: "838 TFLOPS Direct Liquid Cooled",
    color: "#38BDF8",
  },
  {
    name: "Yotta NM1 (Navi Mumbai)",
    type: "Commercial Hyperscale CSP",
    lat: 18.9902,
    lng: 73.1277,
    capacity: "2,048x NVIDIA H100 SXM5",
    color: "#34D399",
  },
];

// Submarine Cable Landing Stations (CLS) - India's International Gateways
const SUBSEA_LANDING_STATIONS = [
  {
    name: "Mumbai Versova CLS",
    cables: "SEA-ME-WE 3, SEA-ME-WE 4, I-ME-WE, AAE-1",
    lat: 19.1350,
    lng: 72.8120,
    latency_singapore_ms: 32.0,
    latency_marseille_ms: 54.0,
  },
  {
    name: "Mumbai Prabhadevi / Worli CLS",
    cables: "BBG, FALCON, MENA, FLAG Europe-Asia",
    lat: 19.0144,
    lng: 72.8277,
    latency_singapore_ms: 34.0,
    latency_marseille_ms: 52.0,
  },
  {
    name: "Chennai Santhome CLS",
    cables: "SMW4, i2i (Tata-Singtel), Chennai-Andaman, MIST",
    lat: 13.0330,
    lng: 80.2780,
    latency_singapore_ms: 22.5,
    latency_marseille_ms: 68.0,
  },
  {
    name: "Dighi Port Subsea Gateway (Upcoming)",
    cables: "2Africa Pearl & India-Europe Express (IEX)",
    lat: 18.1750,
    lng: 72.9850,
    latency_singapore_ms: 33.0,
    latency_marseille_ms: 51.0,
  },
];

export default function MapView({ sites = [], selectedSite = null, onSelectSite, onMapClick }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const currentTileLayerRef = useRef(null);
  const siteMarkersLayerRef = useRef(null);
  const supercomputerLayerRef = useRef(null);
  const subseaLayerRef = useRef(null);

  // Layer Visibility Toggles
  const [showSites, setShowSites] = useState(true);
  const [showSupercomputers, setShowSupercomputers] = useState(true);
  const [showSubsea, setShowSubsea] = useState(true);

  // Basemap Selector (Default: carto_dark, fallback: osm_standard)
  const [selectedBasemap, setSelectedBasemap] = useState('carto_dark');
  const [customKeyModalOpen, setCustomKeyModalOpen] = useState(false);
  const [customMapboxKey, setCustomMapboxKey] = useState(localStorage.getItem('SUPERINDIA_MAP_KEY') || '');

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [20.5937, 78.9629], // Center of India
      zoom: 5,
      minZoom: 4,
      maxZoom: 18,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initial tile layer
    const initialProvider = TILE_PROVIDERS[selectedBasemap] || TILE_PROVIDERS.carto_dark;
    const tileLayer = L.tileLayer(initialProvider.url, initialProvider.options).addTo(map);
    currentTileLayerRef.current = tileLayer;

    // Layer groups for markers
    siteMarkersLayerRef.current = L.layerGroup().addTo(map);
    supercomputerLayerRef.current = L.layerGroup().addTo(map);
    subseaLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    // Fix map container size on render
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);

    map.on('click', (e) => {
      if (onMapClick) {
        onMapClick({ lat: e.latlng.lat, lon: e.latlng.lng });
      }
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Basemap Change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }

    let url = TILE_PROVIDERS[selectedBasemap]?.url || TILE_PROVIDERS.carto_dark.url;
    let options = TILE_PROVIDERS[selectedBasemap]?.options || TILE_PROVIDERS.carto_dark.options;

    // If custom Mapbox key exists
    if (customMapboxKey && selectedBasemap === 'mapbox_custom') {
      url = `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token=${customMapboxKey}`;
      options = {
        attribution: '&copy; Mapbox &copy; OpenStreetMap',
        tileSize: 512,
        zoomOffset: -1,
        maxZoom: 20,
      };
    }

    const newLayer = L.tileLayer(url, options).addTo(map);
    currentTileLayerRef.current = newLayer;

    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [selectedBasemap, customMapboxKey]);

  // Sync Siting Hub Markers
  useEffect(() => {
    const layer = siteMarkersLayerRef.current;
    if (!layer) return;

    layer.clearLayers();
    if (!showSites) return;

    sites.forEach((site) => {
      const isSelected = selectedSite && selectedSite.site_id === site.site_id;
      const score = site.composite_score || 0;
      const color = site.tier_color || '#10B981';

      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -100%);">
            <div style="
              background: #0B111A; 
              border: 2px solid ${color}; 
              color: #FFFFFF; 
              border-radius: 9999px; 
              padding: 4px 8px; 
              font-family: monospace; 
              font-size: 11px; 
              font-weight: 700; 
              display: flex; 
              align-items: center; 
              gap: 4px;
              box-shadow: 0 4px 14px ${color}66;
              ${isSelected ? `box-shadow: 0 0 25px ${color}; transform: scale(1.18);` : ''}
              transition: all 0.2s ease-in-out;
            ">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: ${color}; display: inline-block;"></span>
              <span>${score.toFixed(1)}</span>
            </div>
            <div style="width: 2px; height: 10px; background: ${color}; margin-top: -1px;"></div>
            <div style="width: 8px; height: 8px; background: ${color}; border-radius: 50%; opacity: 0.8; box-shadow: 0 0 10px ${color};"></div>
          </div>
        `,
        iconSize: [60, 42],
        iconAnchor: [30, 42],
      });

      const marker = L.marker([site.latitude, site.longitude], { icon: customIcon });

      const popupContent = `
        <div style="font-family: sans-serif; min-width: 220px; color: #F1F5F9; background: #0F172A; padding: 12px; border-radius: 8px; border: 1px solid #334155;">
          <div style="font-size: 10px; text-transform: uppercase; color: #94A3B8; font-weight: 700;">Strategic AI Infrastructure Hub</div>
          <div style="font-size: 14px; font-weight: 700; color: #FFFFFF; margin: 2px 0 6px 0;">${site.site_name}</div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 12px; color: #CBD5E1;">Composite Score: <strong>${score.toFixed(1)}/100</strong></span>
            <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: ${color}22; color: ${color}; border: 1px solid ${color}66;">${site.tier_badge || 'VIABLE'}</span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px; color: #94A3B8; border-top: 1px solid #1E293B; padding-top: 6px;">
            <div>💧 Water: <strong style="color: #38BDF8;">${(site.water_score || 0).toFixed(1)}</strong></div>
            <div>⚡ Power: <strong style="color: #FBBF24;">${(site.power_score || 0).toFixed(1)}</strong></div>
            <div>🌡️ Climate: <strong style="color: #A78BFA;">${(site.climate_score || 0).toFixed(1)}</strong></div>
            <div>🌐 Fiber: <strong style="color: #34D399;">${(site.connectivity_score || 0).toFixed(1)}</strong></div>
          </div>
          <div style="font-size: 10px; color: #64748B; margin-top: 6px;">Click to view 7-domain telemetry.</div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: 'dark-leaflet-popup',
        closeButton: false,
      });

      marker.on('click', () => {
        if (onSelectSite) onSelectSite(site);
      });

      layer.addLayer(marker);
    });
  }, [sites, selectedSite, showSites]);

  // Sync National Supercomputer Cluster Markers
  useEffect(() => {
    const layer = supercomputerLayerRef.current;
    if (!layer) return;

    layer.clearLayers();
    if (!showSupercomputers) return;

    NATIONAL_SUPERCOMPUTERS.forEach((node) => {
      const customIcon = L.divIcon({
        className: 'supercomputer-marker',
        html: `
          <div style="display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 50%; background: #0B111A; border: 2px solid ${node.color}; box-shadow: 0 0 12px ${node.color}88; cursor: pointer;">
            <div style="width: 10px; height: 10px; border-radius: 50%; background: ${node.color};"></div>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const marker = L.marker([node.lat, node.lng], { icon: customIcon });
      marker.bindPopup(`
        <div style="font-family: sans-serif; min-width: 190px; color: #F1F5F9; background: #0F172A; padding: 10px; border-radius: 8px; border: 1px solid #334155;">
          <div style="font-size: 10px; text-transform: uppercase; color: #38BDF8; font-weight: 700;">National AI Supercomputer</div>
          <div style="font-size: 13px; font-weight: 700; color: #FFFFFF; margin: 2px 0;">${node.name}</div>
          <div style="font-size: 11px; color: #CBD5E1; margin-top: 4px;">Capacity: <strong>${node.capacity}</strong></div>
        </div>
      `, { className: 'dark-leaflet-popup', closeButton: false });

      layer.addLayer(marker);
    });
  }, [showSupercomputers]);

  // Sync Subsea Landing Station Markers
  useEffect(() => {
    const layer = subseaLayerRef.current;
    if (!layer) return;

    layer.clearLayers();
    if (!showSubsea) return;

    SUBSEA_LANDING_STATIONS.forEach((cls) => {
      const customIcon = L.divIcon({
        className: 'subsea-marker',
        html: `
          <div style="display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 6px; background: #0F172A; border: 2px solid #F59E0B; box-shadow: 0 0 10px #F59E0B88; cursor: pointer;">
            <div style="font-size: 11px;">🌐</div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([cls.lat, cls.lng], { icon: customIcon });
      marker.bindPopup(`
        <div style="font-family: sans-serif; min-width: 210px; color: #F1F5F9; background: #0F172A; padding: 10px; border-radius: 8px; border: 1px solid #334155;">
          <div style="font-size: 10px; text-transform: uppercase; color: #F59E0B; font-weight: 700;">Submarine Cable Gateway</div>
          <div style="font-size: 13px; font-weight: 700; color: #FFFFFF; margin: 2px 0;">${cls.name}</div>
          <div style="font-size: 11px; color: #94A3B8; margin-top: 4px;">Cables: <span style="color: #CBD5E1;">${cls.cables}</span></div>
          <div style="display: flex; justify-content: space-between; font-size: 10px; color: #94A3B8; margin-top: 6px; border-top: 1px solid #1E293B; padding-top: 4px;">
            <span>To Singapore: <strong style="color: #34D399;">${cls.latency_singapore_ms} ms</strong></span>
            <span>To Europe: <strong style="color: #38BDF8;">${cls.latency_marseille_ms} ms</strong></span>
          </div>
        </div>
      `, { className: 'dark-leaflet-popup', closeButton: false });

      layer.addLayer(marker);
    });
  }, [showSubsea]);

  // Center on selected site
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedSite) return;
    mapInstanceRef.current.flyTo([selectedSite.latitude, selectedSite.longitude], 8, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [selectedSite]);

  const saveCustomKey = (key) => {
    setCustomMapboxKey(key);
    localStorage.setItem('SUPERINDIA_MAP_KEY', key);
    if (key) {
      setSelectedBasemap('mapbox_custom');
    } else {
      setSelectedBasemap('carto_dark');
    }
    setCustomKeyModalOpen(false);
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-800 bg-[#0B111A] shadow-2xl">
      
      {/* Map Header Overlay with Basemap & Layer Toggles */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Title & Basemap Switcher */}
        <div className="pointer-events-auto flex items-center gap-2 bg-[#0B111A]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-xs font-mono font-bold tracking-wide text-white">India AI Geospatial Mesh</span>

          {/* Tile Layer Selector */}
          <select
            value={selectedBasemap}
            onChange={(e) => setSelectedBasemap(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-300 text-[11px] font-mono rounded-lg px-2 py-0.5 focus:outline-none focus:border-cyan-400 cursor-pointer ml-1"
          >
            <option value="carto_dark">🌙 Carto Dark</option>
            <option value="osm_standard">🗺️ OpenStreetMap (No Key)</option>
            <option value="esri_satellite">🛰️ Satellite Terrain</option>
            {customMapboxKey && <option value="mapbox_custom">🔑 Mapbox Custom</option>}
          </select>

          {/* API Key Modal Button */}
          <button
            onClick={() => setCustomKeyModalOpen(true)}
            title="Configure Map API Key (Optional)"
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <Key className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Feature Layer Switches */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-[#0B111A]/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-lg">
          
          <button
            onClick={() => setShowSites(!showSites)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all ${
              showSites 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <MapPin className="w-3 h-3 text-cyan-400" />
            <span>AI Siting Hubs</span>
          </button>

          <button
            onClick={() => setShowSupercomputers(!showSupercomputers)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all ${
              showSupercomputers 
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Cpu className="w-3 h-3 text-indigo-400" />
            <span>Supercomputers</span>
          </button>

          <button
            onClick={() => setShowSubsea(!showSubsea)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all ${
              showSubsea 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Radio className="w-3 h-3 text-amber-400" />
            <span>Subsea CLS</span>
          </button>

        </div>

      </div>

      {/* Leaflet Map Div */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[480px]" />

      {/* Legend Footer */}
      <div className="absolute bottom-3 left-3 z-[1000] hidden sm:flex items-center gap-3 bg-[#0B111A]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-400 shadow-md">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Viable (≥75)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span>Conditional (50-74.9)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-rose-400"></span>
          <span>Unviable (&lt;50)</span>
        </div>
      </div>

      {/* Optional Mapbox/Custom Key Modal */}
      {customKeyModalOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#0F172A] p-6 rounded-2xl border border-slate-700 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
                <Key className="w-4 h-4 text-cyan-400" />
                Configure Map Tile API Key
              </h4>
              <button 
                onClick={() => setCustomKeyModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              By default, <strong>SuperIndia.ai uses free open tile providers</strong> (Carto Dark & OpenStreetMap) with zero API keys required. If you wish to use a custom Mapbox style token:
            </p>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Mapbox Access Token (pk....)
              </label>
              <input
                type="text"
                value={customMapboxKey}
                onChange={(e) => setCustomMapboxKey(e.target.value)}
                placeholder="pk.eyJ1..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => saveCustomKey('')}
                className="px-3 py-1.5 rounded-xl text-xs font-mono text-slate-400 hover:text-white bg-slate-800"
              >
                Reset to Free Tiles
              </button>
              <button
                type="button"
                onClick={() => saveCustomKey(customMapboxKey)}
                className="px-4 py-1.5 rounded-xl text-xs font-mono font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-md"
              >
                Save & Apply
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
