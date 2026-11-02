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
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Leaf
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
import EcoPlannerTab from './components/EcoPlannerTab';

import { fetchBenchmarkSites, assessCustomSite, checkApiHealth } from './services/api';
import { Analytics } from '@vercel/analytics/react';

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
    { id: 'eco', label: 'Eco-Friendly DC & ESG', icon: <Leaf className="w-4 h-4 text-emerald-600" /> },
    { id: 'dc_planner', label: 'DC Engineering Planner', icon: <Server className="w-4 h-4" /> },
    { id: 'marketplace', label: 'GPU Marketplace', icon: <Cpu className="w-4 h-4" /> },
    { id: 'demand', label: 'Demand Forecasting', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'citizen', label: 'Citizen Financing', icon: <Coins className="w-4 h-4" /> },
    { id: 'policy', label: 'State Policy Matrix', icon: <Building2 className="w-4 h-4" /> },
    { id: 'comparison', label: 'Multi-Site Audit', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-[#16191f] flex flex-col font-sans selection:bg-[#074ce0]/20 selection:text-[#074ce0]">
      
      {/* 1. Header (National Insignia & Sleek Command Bar) */}
      <header className="sticky top-0 z-[1500] border-b border-[#dde0e6] bg-[#fcfcfd]/95 backdrop-blur-md">
        
        {/* Subtle Indian Tricolor National Accent Stripe */}
        <div className="h-[3px] bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808] w-full shrink-0 shadow-xs" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative group cursor-pointer" onClick={() => { setActiveTab('mesh'); }}>
              <div className="w-11 h-11 rounded-full p-0.5 group-hover:scale-105 transition-transform flex items-center justify-center">
                <img 
                  src="/logo.png" 
                  alt="SuperIndia.ai Official Insignia" 
                  className="w-full h-full object-contain drop-shadow-xs" 
                />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-2xs" title="National AI OS Active" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-display tracking-tight text-[#16191f] cursor-pointer" onClick={() => { setActiveTab('mesh'); }}>
                  SuperIndia<span className="text-[#074ce0]">.ai</span>
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-[#074ce0] border border-blue-200 font-bold flex items-center gap-1">
                  <span>🇮🇳</span> National AI OS
                </span>
              </div>
              <div className="text-[11px] text-[#454c58] font-sans hidden md:block">
                National AI Infrastructure Intelligence & Siting Operating System
              </div>
            </div>
          </div>

          {/* Strategic Hub Quick Switcher (Desktop Pills + Laptop/Tablet Compact Dropdown) */}
          <div className="hidden xl:flex items-center gap-1.5 bg-[#f3f4f6] p-1 rounded-xl border border-[#dde0e6] text-xs">
            <span className="text-[10px] font-mono font-bold text-[#8c94a4] uppercase px-2">Hubs:</span>
            {sites.slice(0, 5).map((s) => {
              const active = selectedSite?.site_id === s.site_id;
              const shortName = s.site_name.split(' (')[0].split(' / ')[0];
              return (
                <button
                  key={s.site_id}
                  onClick={() => {
                    setSelectedSite(s);
                    if (activeTab !== 'mesh') setActiveTab('mesh');
                  }}
                  className={`px-3 py-1 rounded-lg transition-all font-medium text-xs whitespace-nowrap ${
                    active 
                      ? 'bg-white text-[#074ce0] shadow-sm font-bold border border-blue-100' 
                      : 'text-[#454c58] hover:text-[#16191f]'
                  }`}
                >
                  {shortName}
                </button>
              );
            })}
          </div>

          {/* Compact Dropdown on Laptop & Medium Viewports to Guarantee Zero Header Wrap */}
          <div className="hidden md:flex xl:hidden items-center gap-1.5 bg-[#f3f4f6] px-2.5 py-1.5 rounded-xl border border-[#dde0e6] text-xs">
            <span className="text-[10px] font-mono font-bold text-[#8c94a4] uppercase">Hub:</span>
            <select
              value={selectedSite?.site_id || ''}
              onChange={(e) => {
                const s = sites.find(item => item.site_id === e.target.value);
                if (s) {
                  setSelectedSite(s);
                  if (activeTab !== 'mesh') setActiveTab('mesh');
                }
              }}
              className="bg-transparent text-xs font-semibold text-[#16191f] focus:outline-none cursor-pointer"
            >
              {sites.map(s => (
                <option key={s.site_id} value={s.site_id}>
                  {s.site_name.split(' (')[0]} ({s.composite_score?.toFixed(0) || '0'}/100)
                </option>
              ))}
            </select>
          </div>

          {/* Action Controls & Health */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f3f4f6] border border-[#dde0e6] text-[11px] font-mono text-[#454c58]">
              <span className={`w-2 h-2 rounded-full ${apiOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
              <span>{apiOnline ? 'Backend Live' : 'Connecting...'}</span>
            </div>

            <button
              onClick={loadSites}
              title="Refresh Ground Truth Telemetry"
              className="p-2 rounded-xl bg-white border border-[#dde0e6] text-[#454c58] hover:text-[#16191f] hover:bg-[#f3f4f6] transition-colors shadow-2xs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#074ce0] hover:bg-[#0640c4] text-white transition-all shadow-sm shadow-[#074ce0]/25 font-display"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>Simulate Site</span>
            </button>
          </div>

        </div>

        {/* Tab Navigation Pill Bar (Guaranteed No Truncation) */}
        <div className="border-t border-[#dde0e6] bg-[#fcfcfd]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1.5 overflow-x-auto py-2 scrollbar-none">
            {navTabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    active 
                      ? 'bg-[#16191f] text-white shadow-sm font-semibold' 
                      : 'text-[#454c58] hover:text-[#16191f] hover:bg-[#f3f4f6]'
                  }`}
                >
                  <span className={active ? 'text-[#074ce0]' : 'text-[#8c94a4]'}>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* 2. Compact High-Impact Mission Banner (Replaces bulky vertical hero) */}
      <section className="border-b border-[#dde0e6] bg-gradient-to-b from-[#fcfcfd] to-[#f8f9fb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="space-y-1 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#074ce0] text-[11px] font-mono font-bold border border-blue-200">
                <span className="w-1.5 h-1.5 rounded-full bg-[#074ce0]"></span>
                <span>INDIA AI MISSION (₹10,372 CR) • STATUTORY GROUNDED SITING</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-[#16191f] tracking-tight">
                National AI Infrastructure Decision Intelligence & Geospatial Operating System
              </h2>
              <p className="text-xs text-[#454c58] leading-relaxed">
                Evaluates hyperscale AI data centers across 7 physical and regulatory dimensions: water stress (CGWB), electrical grid (CEA), psychrometric wet-bulb (NASA POWER), subsea connectivity (NIXI), and seismic hazard (BIS IS 1893:2016). Strictly zero guessed scores.
              </p>
            </div>

            {/* Quick Stats Micro Strip */}
            <div className="flex items-center gap-2.5 shrink-0 font-mono text-xs">
              <div className="p-2.5 bg-white rounded-xl border border-[#dde0e6] shadow-2xs text-center min-w-[90px]">
                <div className="text-sm font-black text-[#16191f]">{sites.length}</div>
                <div className="text-[10px] text-[#454c58]">Key Hubs</div>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-[#dde0e6] shadow-2xs text-center min-w-[90px]">
                <div className="text-sm font-black text-[#074ce0]">7</div>
                <div className="text-[10px] text-[#454c58]">Domains</div>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-[#dde0e6] shadow-2xs text-center min-w-[90px]">
                <div className="text-sm font-black text-emerald-600">31</div>
                <div className="text-[10px] text-[#454c58]">Sub-Metrics</div>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-[#dde0e6] shadow-2xs text-center min-w-[90px]">
                <div className="text-sm font-black text-indigo-600">NASA</div>
                <div className="text-[10px] text-[#454c58]">Live APIs</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Main Analytical Content (Shared Pale-Grey Field) */}
      <section className="flex-1 bg-[#f3f4f6] py-6 sm:py-8">
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
              
              {/* Perfectly Balanced Two-Column Layout (Map 7 cols, ScoreCard 5 cols, matching heights) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Precision Cartographic Viewer (7 cols) */}
                <div className="lg:col-span-7 min-h-[580px] lg:h-[640px] flex flex-col rounded-2xl overflow-hidden border border-[#dde0e6] shadow-sm bg-[#16191f]">
                  <MapView 
                    sites={sites} 
                    selectedSite={selectedSite} 
                    onSelectSite={(site) => { setSelectedSite(site); }} 
                  />
                </div>

                {/* Selected Site Composite ScoreCard (5 cols) */}
                <div className="lg:col-span-5 min-h-[580px] lg:h-[640px] flex flex-col">
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
                onSelectSite={(site) => { setSelectedSite(site); }} 
              />

            </div>
          )}

          {/* TAB: Eco-Friendly DC & ESG Engine (Module 8) */}
          {activeTab === 'eco' && (
            <EcoPlannerTab selectedSite={selectedSite} />
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

          {/* TAB 5: Sovereign Citizen Infrastructure Financing */}
          {activeTab === 'citizen' && (
            <CitizenFinancingTab />
          )}

          {/* TAB 6: Government & State Policy Intelligence */}
          {activeTab === 'policy' && (
            <PolicyIntelligenceTab />
          )}

          {/* TAB 7: Multi-Site Audit Table */}
          {activeTab === 'comparison' && (
            <SiteComparison 
              sites={sites} 
              selectedSite={selectedSite} 
              onSelectSite={(site) => { setSelectedSite(site); setActiveTab('mesh'); }} 
            />
          )}

        </div>
      </section>

      {/* 4. Enterprise Institutional Footer */}
      <footer className="border-t border-[#dde0e6] bg-[#0F172A] text-slate-300 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white/10 p-0.5 border border-white/20 flex items-center justify-center">
                  <img src="/logo.png" alt="SuperIndia.ai Logo" className="w-full h-full object-contain rounded-full" />
                </div>
                <h3 className="text-lg font-bold font-display text-white">
                  SuperIndia.ai
                </h3>
              </div>
              <p className="text-xs text-[#d0d4dd] leading-relaxed max-w-md">
                India's sovereign infrastructure intelligence and resource optimization platform.
                Bridging upstream strategic spatial planning with cross-institutional compute utilization under IndiaAI.
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
                <li>• 7-Domain Siting Mesh</li>
                <li>• Data Center Capacity Planner</li>
                <li>• Federated GPU Marketplace</li>
                <li>• 2024–2030 Demand Forecasting</li>
                <li>• Sovereign Infrastructure Bonds</li>
              </ul>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-bold text-white font-display uppercase tracking-wider text-[11px]">
                Authentic Statutory Standards
              </div>
              <ul className="space-y-1.5 text-[#d0d4dd]">
                <li>• Central Ground Water Board (CGWB)</li>
                <li>• Central Electricity Authority (CEA)</li>
                <li>• NASA POWER 30-Year Climatology</li>
                <li>• BIS IS 1893:2016 Seismic Standards</li>
                <li>• National Internet Exchange of India (NIXI)</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8c94a4] font-sans">
            <div>
              &copy; 2026 SuperIndia.ai • National AI Infrastructure Intelligence Platform
            </div>
            <div className="flex items-center gap-4 text-[11px] font-mono">
              <span>Zero Hallucinations</span>
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

      {/* Vercel Web Analytics */}
      <Analytics />
    </div>
  );
}
