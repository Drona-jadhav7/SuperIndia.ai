import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, MapPin, Cpu, Radio, ShieldAlert, Key, Settings, Globe, Maximize2 } from 'lucide-react';

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
    latency_singapore_ms: 31.5,
    latency_marseille_ms: 53.8,
  },
  {
    name: "Chennai Santhome CLS",
    cables: "SMW4, Bharat Lanka, Chennai-Andaman, i2i",
    lat: 13.0333,
    lng: 80.2785,
    latency_singapore_ms: 22.0,
    latency_marseille_ms: 68.0,
  },
  {
    name: "Kochi Marine Drive CLS",
    cables: "SAFE, SEA-ME-WE 3",
    lat: 9.9816,
    lng: 76.2764,
    latency_singapore_ms: 28.0,
    latency_marseille_ms: 51.5,
  },
];

export default function MapView({ sites = [], selectedSite = null, onSelectSite }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const isFirstMountRef = useRef(true);
  const layersRef = useRef({
    tileLayer: null,
    sitesLayer: null,
    supercomputersLayer: null,
    subseaLayer: null,
  });

  // State
  const [selectedBasemap, setSelectedBasemap] = useState('carto_dark');
  const [showSites, setShowSites] = useState(true);
  const [showSupercomputers, setShowSupercomputers] = useState(true);
  const [showSubsea, setShowSubsea] = useState(true);
  const [customKeyModalOpen, setCustomKeyModalOpen] = useState(false);
  const [customMapboxKey, setCustomMapboxKey] = useState('');

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default view: full Indian subcontinent at zoom 5
      const map = L.map(mapContainerRef.current, {
        center: [21.5, 78.96],
        zoom: 5,
        zoomControl: false,
        attributionControl: true,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Create Layer Groups
      const sitesLayer = L.layerGroup().addTo(map);
      const supercomputersLayer = L.layerGroup().addTo(map);
      const subseaLayer = L.layerGroup().addTo(map);

      layersRef.current.sitesLayer = sitesLayer;
      layersRef.current.supercomputersLayer = supercomputersLayer;
      layersRef.current.subseaLayer = subseaLayer;

      mapInstanceRef.current = map;

      // Invalidate size shortly after mount to ensure smooth tile rendering
      setTimeout(() => {
        map.invalidateSize();
      }, 250);

      // Check saved custom Mapbox token in localStorage
      const savedKey = localStorage.getItem('SUPERINDIA_MAP_KEY');
      if (savedKey) {
        setCustomMapboxKey(savedKey);
      }
    }
  }, []);

  // ResizeObserver to automatically invalidate Leaflet map size on container resize
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const ro = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    ro.observe(mapContainerRef.current);
    return () => ro.disconnect();
  }, []);

  // 2. Manage Tile Provider Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing tile layer if any
    if (layersRef.current.tileLayer) {
      map.removeLayer(layersRef.current.tileLayer);
    }

    let newTileLayer = null;

    if (selectedBasemap === 'mapbox_custom' && customMapboxKey) {
      newTileLayer = L.tileLayer(
        `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token=${customMapboxKey}`,
        {
          attribution: '&copy; Mapbox &copy; OpenStreetMap',
          tileSize: 512,
          zoomOffset: -1,
          maxZoom: 22,
        }
      );
    } else {
      const provider = TILE_PROVIDERS[selectedBasemap] || TILE_PROVIDERS.carto_dark;
      newTileLayer = L.tileLayer(provider.url, provider.options);
    }

    newTileLayer.addTo(map);
    layersRef.current.tileLayer = newTileLayer;
  }, [selectedBasemap, customMapboxKey]);

  // 3. Render Candidate AI Siting Hubs
  useEffect(() => {
    const layer = layersRef.current.sitesLayer;
    if (!layer) return;

    layer.clearLayers();

    if (!showSites || !sites || sites.length === 0) return;

    sites.forEach((site) => {
      const lat = site.latitude || site.coordinates?.lat || 20.0;
      const lon = site.longitude || site.coordinates?.lon || 78.0;
      const isSelected = selectedSite && selectedSite.site_id === site.site_id;
      const score = site.composite_score || 0;

      // Color coding per classification tier
      let markerColor = '#10B981'; // Viable (Green)
      if (score < 50.0) {
        markerColor = '#EF4444'; // Unviable (Red)
      } else if (score < 75.0) {
        markerColor = '#F59E0B'; // Conditional (Amber)
      }

      const iconHtml = `
        <div class="relative flex items-center justify-center">
          <div class="w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-transform ${isSelected ? 'scale-125 ring-4 ring-white' : 'hover:scale-110'}" style="background-color: ${markerColor}; border: 2.5px solid #0B111A;">
            <div class="w-2.5 h-2.5 rounded-full bg-white shadow-inner"></div>
          </div>
          ${isSelected ? `<div class="absolute -inset-1.5 rounded-full animate-ping opacity-75" style="background-color: ${markerColor};"></div>` : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-site-marker',
        html: iconHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([lat, lon], { icon: customIcon });

      // Interactive Popup
      const popupContent = `
        <div style="font-family: inherit; min-width: 200px; padding: 4px;">
          <div style="font-size: 10px; font-weight: bold; color: ${markerColor}; text-transform: uppercase; margin-bottom: 2px;">
            ${site.tier || 'VIABLE'} (${score.toFixed(1)}/100)
          </div>
          <div style="font-size: 13px; font-weight: 700; color: #16191f; margin-bottom: 4px;">
            ${site.site_name}
          </div>
          <div style="font-size: 11px; color: #454c58; margin-bottom: 6px;">
            ${site.district ? `${site.district}, ` : ''}${site.state}
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 10px; background: #f3f4f6; padding: 6px; border-radius: 6px;">
            <div>Water: <strong>${site.water_score ? site.water_score.toFixed(0) : 'N/A'}</strong></div>
            <div>Power: <strong>${site.power_score ? site.power_score.toFixed(0) : 'N/A'}</strong></div>
            <div>Climate: <strong>${site.climate_score ? site.climate_score.toFixed(0) : 'N/A'}</strong></div>
            <div>Fiber: <strong>${site.connectivity_score ? site.connectivity_score.toFixed(0) : 'N/A'}</strong></div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        if (onSelectSite) onSelectSite(site);
      });

      layer.addLayer(marker);
    });
  }, [sites, selectedSite, showSites, onSelectSite]);

  // 4. Render National Supercomputers & AI Clusters
  useEffect(() => {
    const layer = layersRef.current.supercomputersLayer;
    if (!layer) return;

    layer.clearLayers();

    if (!showSupercomputers) return;

    NATIONAL_SUPERCOMPUTERS.forEach((cluster) => {
      const iconHtml = `
        <div class="flex items-center justify-center w-6 h-6 rounded-lg bg-[#0F172A] border border-indigo-400 shadow-md hover:scale-125 transition-transform">
          <div class="w-2.5 h-2.5 rounded-sm bg-indigo-400"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'supercomputer-marker',
        html: iconHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([cluster.lat, cluster.lng], { icon: customIcon });

      const popup = `
        <div style="font-family: inherit; min-width: 190px; padding: 4px;">
          <div style="font-size: 10px; font-weight: bold; color: #818CF8; text-transform: uppercase;">
            ${cluster.type}
          </div>
          <div style="font-size: 13px; font-weight: 700; color: #16191f; margin-bottom: 2px;">
            ${cluster.name}
          </div>
          <div style="font-size: 11px; color: #454c58; font-family: monospace;">
            ${cluster.capacity}
          </div>
        </div>
      `;

      marker.bindPopup(popup);
      layer.addLayer(marker);
    });
  }, [showSupercomputers]);

  // 5. Render Subsea Cable Landing Stations
  useEffect(() => {
    const layer = layersRef.current.subseaLayer;
    if (!layer) return;

    layer.clearLayers();

    if (!showSubsea) return;

    SUBSEA_LANDING_STATIONS.forEach((cls) => {
      const iconHtml = `
        <div class="flex items-center justify-center w-6 h-6 rounded-full bg-[#0F172A] border border-amber-400 shadow-md hover:scale-125 transition-transform">
          <div class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'subsea-marker',
        html: iconHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([cls.lat, cls.lng], { icon: customIcon });

      const popup = `
        <div style="font-family: inherit; min-width: 200px; padding: 4px;">
          <div style="font-size: 10px; font-weight: bold; color: #F59E0B; text-transform: uppercase;">
            Subsea Cable Landing Station (CLS)
          </div>
          <div style="font-size: 13px; font-weight: 700; color: #16191f; margin-bottom: 2px;">
            ${cls.name}
          </div>
          <div style="font-size: 10px; color: #454c58; margin-bottom: 4px;">
            Cables: <strong>${cls.cables}</strong>
          </div>
          <div style="font-size: 10px; font-family: monospace; color: #074ce0;">
            Singapore RTT: ${cls.latency_singapore_ms}ms • Marseille: ${cls.latency_marseille_ms}ms
          </div>
        </div>
      `;

      marker.bindPopup(popup);
      layer.addLayer(marker);
    });
  }, [showSubsea]);

  // 6. Smooth Pan on Site Selection (Keep national overview on mount, flyTo on user selection)
  useEffect(() => {
    if (!selectedSite || !mapInstanceRef.current) return;
    
    // Prevent auto-zooming into Mumbai on initial page load
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }

    const lat = selectedSite.latitude || selectedSite.coordinates?.lat;
    const lon = selectedSite.longitude || selectedSite.coordinates?.lon;
    if (lat && lon) {
      mapInstanceRef.current.flyTo([lat, lon], 8, {
        animate: true,
        duration: 1.2,
      });
    }
  }, [selectedSite]);

  // Save Custom Key
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

  const resetToAllIndia = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([21.5, 78.96], 5, {
        animate: true,
        duration: 1.0,
      });
    }
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-[#dde0e6] bg-[#0B111A] shadow-lg ring-1 ring-black/5 flex flex-col">
      
      {/* Sleek Floating Map Command Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Left: Brand & Basemap Selector */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-[#0B111A]/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-700/80 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0"></span>
          <span className="text-[11px] font-mono font-bold tracking-wide text-white hidden sm:inline">Geospatial Mesh</span>

          <span className="text-slate-600 font-mono hidden sm:inline">|</span>

          {/* Reset to All India Button */}
          <button
            onClick={resetToAllIndia}
            title="Reset to All-India View"
            className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono text-cyan-300 hover:text-white bg-cyan-950/70 border border-cyan-700/60 transition-colors"
          >
            <span>🇮🇳 Pan-India</span>
          </button>

          {/* Tile Layer Selector */}
          <select
            value={selectedBasemap}
            onChange={(e) => setSelectedBasemap(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-300 text-[10px] font-mono rounded-lg px-2 py-0.5 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="carto_dark">🌙 Carto Dark</option>
            <option value="osm_standard">🗺️ OSM Clean</option>
            <option value="esri_satellite">🛰️ Satellite</option>
            {customMapboxKey && <option value="mapbox_custom">🔑 Custom Mapbox</option>}
          </select>

          {/* API Key Modal Button */}
          <button
            onClick={() => setCustomKeyModalOpen(true)}
            title="Configure Mapbox Token"
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <Key className="w-3 h-3" />
          </button>
        </div>

        {/* Right: Layer Switches */}
        <div className="pointer-events-auto flex items-center gap-1 bg-[#0B111A]/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-lg">
          
          <button
            onClick={() => setShowSites(!showSites)}
            title="Toggle Candidate AI Siting Hubs"
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono transition-all ${
              showSites 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <MapPin className="w-3 h-3 text-cyan-400" />
            <span>Hubs ({sites.length})</span>
          </button>

          <button
            onClick={() => setShowSupercomputers(!showSupercomputers)}
            title="Toggle National Supercomputers & AI Clusters"
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono transition-all ${
              showSupercomputers 
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Cpu className="w-3 h-3 text-indigo-400" />
            <span>HPC ({NATIONAL_SUPERCOMPUTERS.length})</span>
          </button>

          <button
            onClick={() => setShowSubsea(!showSubsea)}
            title="Toggle Subsea Cable Landing Stations"
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono transition-all ${
              showSubsea 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Radio className="w-3 h-3 text-amber-400" />
            <span>CLS ({SUBSEA_LANDING_STATIONS.length})</span>
          </button>

        </div>

      </div>

      {/* Leaflet Map Div */}
      <div ref={mapContainerRef} className="w-full flex-1 min-h-[500px]" />

      {/* Legend Footer */}
      <div className="absolute bottom-3 left-3 z-[1000] hidden sm:flex items-center gap-3 bg-[#0B111A]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-400 shadow-md">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Viable (≥75)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span>Conditional (50–74.9)</span>
        </div>
        <div className="flex items-center gap-1.5">
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
