import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Droplet, 
  Activity, 
  Server, 
  PlusCircle, 
  RefreshCw, 
  Cpu, 
  ShieldCheck, 
  ExternalLink,
  Layers,
  TrendingUp,
  Coins,
  Building2,
  BarChart3,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Globe2,
  SlidersHorizontal
} from 'lucide-react';

import MapView from './components/MapView';
import ScoreCard from './components/ScoreCard';
import ExplainabilityPanel from './components/ExplainabilityPanel';
import MitigationCard from './components/MitigationCard';
import SiteComparison from './components/SiteComparison';
import CustomSiteModal from './components/CustomSiteModal';

// Major Modules
import DCPlannerTab from './components/DCPlannerTab';
import MarketplaceTab from './components/MarketplaceTab';
import DemandForecastTab from './components/DemandForecastTab';
import CitizenFinancingTab from './components/CitizenFinancingTab';
import PolicyIntelligenceTab from './components/PolicyIntelligenceTab';

import { fetchBenchmarkSites, assessCustomSite, checkApiHealth } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('mesh');
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiOnline, setApiOnline] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Load benchmark sites on mount
  const loadSites = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const health = await checkApiHealth();
      setApiOnline(health.status === 'healthy');

      const data = await fetchBenchmarkSites();
      setSites(data);
      if (data && data.length > 0) {
        setSelectedSite(data[0]); // Default to first hub (Navi Mumbai)
      }
    } catch (err) {
      console.error('Failed to load sites:', err);
      setErrorMsg('Failed to communicate with SuperIndia.ai backend. Please ensure the backend server is running on port 8000.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSites();
  }, []);

  const handleAssessCustomSite = async (customPayload) => {
    try {
      const assessment = await assessCustomSite(customPayload);
      setSites((prev) => [assessment, ...prev.filter(s => s.site_id !== assessment.site_id)]);
      setSelectedSite(assessment);
      setActiveTab('mesh');
    } catch (err) {
      alert(`Assessment failed: ${err.response?.data?.detail || err.message}`);
      throw err;
    }
  };

  const navTabs = [
    { id: 'mesh', label: 'Geospatial Siting Mesh', icon: <MapPin className="w-4 h-4" /> },
    { id: 'dc_planner', label: 'DC Engineering Planner', icon: <Server className="w-4 h-4" /> },
    { id: 'marketplace', label: 'GPU Marketplace & Allocator', icon: <Cpu className="w-4 h-4" /> },
    { id: 'demand', label: 'Demand Forecasting', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'citizen', label: 'Citizen Infrastructure Bonds', icon: <Coins className="w-4 h-4" /> },
    { id: 'policy', label: 'State Policy Matrix', icon: <Building2 className="w-4 h-4" /> },
    { id: 'comparison', label: 'Multi-Site Audit Table', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-[#16191f] flex flex-col font-sans selection:bg-[#074ce0]/20 selection:text-[#074ce0]">
      
      {/* 1. Header (Clean Light Surface with Ruled Border) */}
      <header className="sticky top-0 z-[1500] border-b border-[#dde0e6] bg-[#fcfcfd]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#074ce0] flex items-center justify-center text-white shadow-sm">
              <Cpu className="w-5 h-5 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-display tracking-tight text-[#16191f]">
                  SuperIndia<span className="text-[#074ce0]">.ai</span>
                </h1>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#f3f4f6] text-[#454c58] border border-[#dde0e6] font-semibold">
                  National AI OS
                </span>
              </div>
              <div className="text-[11px] text-[#454c58] font-sans hidden sm:block">
                National AI Infrastructure Intelligence & Coordination Platform
              </div>
            </div>
          </div>

          {/* Strategic Hub Quick Switcher */}
          <div className="hidden xl:flex items-center gap-1 bg-[#f3f4f6] p-1 rounded-xl border border-[#dde0e6] text-xs">
            {sites.slice(0, 5).map((s) => {
              const active = selectedSite?.site_id === s.site_id;
              return (
                <button
                  key={s.site_id}
                  onClick={() => {
                    setSelectedSite(s);
                    if (activeTab !== 'mesh') setActiveTab('mesh');
                  }}
                  className={`px-3 py-1 rounded-lg transition-all font-medium ${
                    active 
                      ? 'bg-white text-[#074ce0] shadow-sm font-semibold' 
                      : 'text-[#454c58] hover:text-[#16191f]'
                  }`}
                >
                  {s.site_name.split(' (')[0].split(' / ')[0]}
                </button>
              );
            })}
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#f3f4f6] border border-[#dde0e6] text-[11px] text-[#454c58]">
              <span className={`w-2 h-2 rounded-full ${apiOnline ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              <span>{apiOnline ? 'Engine Online' : 'Connecting...'}</span>
            </div>

            <button
              onClick={loadSites}
              title="Refresh Telemetry"
              className="p-2 rounded-xl bg-white border border-[#dde0e6] text-[#454c58] hover:text-[#16191f] hover:bg-[#f3f4f6] transition-colors shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#074ce0] hover:bg-[#0640c4] text-white transition-all shadow-sm shadow-[#074ce0]/25"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Simulate Site</span>
            </button>
          </div>

        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="border-t border-[#dde0e6] bg-[#fcfcfd]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto py-2 no-scrollbar">
            {navTabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    active 
                      ? 'bg-[#16191f] text-white shadow-sm' 
                      : 'text-[#454c58] hover:text-[#16191f] hover:bg-[#f3f4f6]'
                  }`}
                >
                  <span className={active ? 'text-[#074ce0]' : 'text-[#454c58]'}>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* 2. Hero Editorial Opening (Roughly 1.45:1 Split on Desktop per Design Instructions) */}
      <section className="border-b border-[#dde0e6] bg-[#fcfcfd]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left 1.45 Column: Clear Text Narrative */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#f3f4f6] text-[#074ce0] text-xs font-semibold border border-[#dde0e6]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#074ce0]"></span>
                <span>Deterministic Geospatial Decision Intelligence</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold font-display text-[#16191f] leading-[1.12] tracking-tight">
                Where India should build, engineer, and allocate AI infrastructure.
              </h2>

              <p className="text-base text-[#454c58] leading-relaxed max-w-2xl">
                Instead of simply building uncoordinated data centers, SuperIndia.ai calculates physical feasibility
                across 7 core domains—water stress, grid transmission, climate wet-bulb, subsea connectivity, and regional AI demand.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={() => setActiveTab('mesh')}
                  className="px-4 py-2 rounded-xl bg-[#074ce0] hover:bg-[#0640c4] text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-2"
                >
                  <span>Explore Geospatial Mesh</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveTab('dc_planner')}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-[#f3f4f6] text-[#16191f] text-xs font-semibold border border-[#dde0e6] transition-all shadow-sm"
                >
                  Data Center Planner
                </button>
                <button
                  onClick={() => setActiveTab('marketplace')}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-[#f3f4f6] text-[#16191f] text-xs font-semibold border border-[#dde0e6] transition-all shadow-sm"
                >
                  GPU Marketplace
                </button>
              </div>
            </div>

            {/* Right Product Diagram: Converging Inputs on Sovereign Product */}
            <div className="lg:col-span-5 bg-[#f3f4f6] p-6 rounded-2xl border border-[#dde0e6] shadow-sm">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#454c58] font-bold mb-3 flex items-center justify-between">
                <span>Multi-Model Convergence</span>
                <span className="text-[#074ce0]">7 Domains</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-white rounded-xl border border-[#dde0e6] shadow-sm">
                  <div className="text-[10px] text-[#454c58] font-mono">1. Water Engine</div>
                  <div className="text-sm font-bold font-display text-[#16191f]">7 Sub-Models</div>
                  <div className="text-[10px] text-emerald-600 font-semibold">CGWB & BIS 10500</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#dde0e6] shadow-sm">
                  <div className="text-[10px] text-[#454c58] font-mono">2. Power & Grid</div>
                  <div className="text-sm font-bold font-display text-[#16191f]">400kV / 220kV EHV</div>
                  <div className="text-[10px] text-amber-600 font-semibold">CEA Standards</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#dde0e6] shadow-sm">
                  <div className="text-[10px] text-[#454c58] font-mono">3. Climate / Wet-Bulb</div>
                  <div className="text-sm font-bold font-display text-[#16191f]">ASHRAE TC 9.9</div>
                  <div className="text-[10px] text-[#074ce0] font-semibold">Psychrometrics</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#dde0e6] shadow-sm">
                  <div className="text-[10px] text-[#454c58] font-mono">4. Subsea Gateways</div>
                  <div className="text-sm font-bold font-display text-[#16191f]">14 CLS Cables</div>
                  <div className="text-[10px] text-indigo-600 font-semibold">NIXI Peering</div>
                </div>
              </div>

              <div className="mt-3 p-3 bg-[#16191f] text-white rounded-xl flex items-center justify-between text-xs font-mono">
                <span>Composite Scoring Engine</span>
                <span className="font-bold text-emerald-400">Zero Black-Box</span>
              </div>
            </div>

          </div>

          {/* Ruled Facts Strip Below Hero */}
          <div className="mt-8 pt-6 border-t border-[#dde0e6] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <div className="text-lg font-bold font-display text-[#16191f]">8 Strategic Hubs</div>
              <div className="text-[#454c58]">Ground-truth telemetry pre-seeded</div>
            </div>
            <div>
              <div className="text-lg font-bold font-display text-[#074ce0]">31 Sub-Metrics</div>
              <div className="text-[#454c58]">Deterministically computed</div>
            </div>
            <div>
              <div className="text-lg font-bold font-display text-emerald-600">₹10,372 Cr</div>
              <div className="text-[#454c58]">IndiaAI mission policy integration</div>
            </div>
            <div>
              <div className="text-lg font-bold font-display text-[#16191f]">100% Deterministic</div>
              <div className="text-[#454c58]">Strictly zero guessed numbers</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Analytical Content (Shared Pale-Grey Field) */}
      <section className="flex-1 bg-[#f3f4f6] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Error Banner */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between font-mono">
              <span>{errorMsg}</span>
              <button onClick={loadSites} className="underline font-bold">Retry Connection</button>
            </div>
          )}

          {/* TAB 1: Geospatial Siting Mesh & Site Assessment */}
          {activeTab === 'mesh' && (
            <div className="space-y-8">
              
              {/* First Substantial Dark Passage: Precision Cartography & Live Telemetry Gauge */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Dark Cartographic Viewer (7 cols) */}
                <div className="lg:col-span-7 h-[500px] flex flex-col rounded-2xl overflow-hidden border border-[#dde0e6] shadow-sm bg-[#16191f]">
                  <MapView 
                    sites={sites} 
                    selectedSite={selectedSite} 
                    onSelectSite={(site) => setSelectedSite(site)} 
                  />
                </div>

                {/* Selected Site Composite ScoreCard (5 cols) */}
                <div className="lg:col-span-5 flex flex-col">
                  <ScoreCard site={selectedSite} />
                </div>

              </div>

              {/* Granular 7-Domain Explainability Panel */}
              {selectedSite && (
                <ExplainabilityPanel site={selectedSite} />
              )}

              {/* Mitigation Mandates & Risk Flags */}
              {selectedSite && (
                <MitigationCard site={selectedSite} />
              )}

              {/* Multi-Site Audit Matrix */}
              <SiteComparison 
                sites={sites} 
                selectedSite={selectedSite} 
                onSelectSite={(site) => setSelectedSite(site)} 
              />

            </div>
          )}

          {/* TAB 2: Data Center Engineering Planner */}
          {activeTab === 'dc_planner' && (
            <DCPlannerTab selectedSite={selectedSite} />
          )}

          {/* TAB 3: GPU Marketplace & Allocation Engine */}
          {activeTab === 'marketplace' && (
            <MarketplaceTab />
          )}

          {/* TAB 4: National Demand Forecasting */}
          {activeTab === 'demand' && (
            <DemandForecastTab />
          )}

          {/* TAB 5: Citizen Infrastructure Bonds */}
          {activeTab === 'citizen' && (
            <CitizenFinancingTab />
          )}

          {/* TAB 6: Policy Intelligence Matrix */}
          {activeTab === 'policy' && (
            <PolicyIntelligenceTab />
          )}

          {/* TAB 7: Multi-Site Audit Table */}
          {activeTab === 'comparison' && (
            <SiteComparison 
              sites={sites} 
              selectedSite={selectedSite} 
              onSelectSite={(site) => {
                setSelectedSite(site);
                setActiveTab('mesh');
              }} 
            />
          )}

        </div>
      </section>

      {/* 4. Second Substantial Dark Passage: Closing & Footer per Design Instructions */}
      <footer className="border-t border-[#dde0e6] bg-[#16191f] text-[#fcfcfd] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#074ce0] flex items-center justify-center text-white">
                  <Cpu className="w-4 h-4 font-bold" />
                </div>
                <h3 className="text-lg font-bold font-display text-white">
                  SuperIndia.ai
                </h3>
              </div>
              <p className="text-xs text-[#d0d4dd] leading-relaxed max-w-md">
                India's sovereign infrastructure intelligence and resource optimization platform.
                Bridging upstream strategic spatial planning with cross-institutional compute utilization.
              </p>
              <div className="text-[11px] font-mono text-[#8c94a4]">
                Axiom: One model → one responsibility → domain aggregator → composite national intelligence.
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-bold text-white font-display uppercase tracking-wider text-[11px]">
                Platform Capabilities
              </div>
              <ul className="space-y-1.5 text-[#d0d4dd]">
                <li>• 7-Domain Site Assessment</li>
                <li>• Data Center Capacity Planner</li>
                <li>• Federated GPU Marketplace</li>
                <li>• 2024-2030 Demand Forecasting</li>
                <li>• Sovereign Infrastructure Bonds</li>
              </ul>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-bold text-white font-display uppercase tracking-wider text-[11px]">
                Authentic Standards
              </div>
              <ul className="space-y-1.5 text-[#d0d4dd]">
                <li>• Central Ground Water Board (CGWB)</li>
                <li>• Central Electricity Authority (CEA)</li>
                <li>• ASHRAE TC 9.9 Thermal Classes</li>
                <li>• IS 1893:2016 Seismic Vulnerability</li>
                <li>• State Electricity Regulatory HT Tariffs</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8c94a4] font-sans">
            <div>
              &copy; 2026 SuperIndia.ai • National AI Infrastructure Coordination
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span>Strictly zero guessed numbers</span>
              <span>•</span>
              <span>Deterministic Engineering</span>
            </div>
          </div>

        </div>
      </footer>

      {/* Greenfield Simulator Modal */}
      <CustomSiteModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAssessCustomSite={handleAssessCustomSite}
      />

    </div>
  );
}
