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
  ArrowLeft,
  Globe2,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Leaf,
  LayoutGrid,
  Menu,
  X
} from 'lucide-react';

import MapView from './components/MapView';
import ScoreCard from './components/ScoreCard';
import ExplainabilityPanel from './components/ExplainabilityPanel';
import MitigationCard from './components/MitigationCard';
import SiteComparison from './components/SiteComparison';
import CustomSiteModal from './components/CustomSiteModal';
import SidePanelMenu, { PLATFORM_MODULES } from './components/SidePanelMenu';

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
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
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
      const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      setErrorMsg(isLocal 
        ? 'Failed to communicate with SuperIndia.ai backend. Please ensure the backend server is running on port 8000.'
        : 'Connecting to SuperIndia.ai Cloud Engine... Please refresh or retry in a few moments.'
      );
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

  // Find active extended module details (when not on home mesh)
  const currentModule = PLATFORM_MODULES.find(m => m.id === activeTab);

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-[#16191f] flex flex-col font-sans selection:bg-[#074ce0]/20 selection:text-[#074ce0]">
      
      {/* 1. Header (National Insignia & Clean Enterprise Command Bar) */}
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

          {/* Compact Dropdown on Laptop & Medium Viewports */}
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

          {/* Action Controls, Health & Platform Modules Trigger */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f3f4f6] border border-[#dde0e6] text-[11px] font-mono text-[#454c58]">
              <span className={`w-2 h-2 rounded-full ${apiOnline ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`}></span>
              <span>{apiOnline ? 'Backend Live' : 'Sovereign Edge Live'}</span>
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
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#074ce0] hover:bg-[#0640c4] text-white transition-all shadow-sm shadow-[#074ce0]/25 font-display"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Simulate Site</span>
              <span className="sm:hidden">Simulate</span>
            </button>

            {/* Dedicated Platform Features Side Menu Button */}
            <button
              onClick={() => setIsSidePanelOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-[#16191f] hover:bg-[#252a34] text-white transition-all shadow-xs border border-slate-700/50 group"
              title="Open Extended Platform Modules Side Menu"
            >
              <LayoutGrid className="w-4 h-4 text-[#FF9933] group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">Platform Modules</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-blue-600 text-white font-bold">
                7
              </span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. Floating Docked Quick-Access Pill on Right Edge (Tablet/Desktop) */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[1000] hidden md:block">
        <button
          onClick={() => setIsSidePanelOpen(true)}
          title="Open Platform Modules Menu (7 Extended Tools)"
          className="bg-[#16191f] text-white hover:bg-[#074ce0] shadow-xl rounded-l-xl px-2.5 py-3 flex items-center gap-2 cursor-pointer transition-all duration-200 border-l border-t border-b border-white/10 group hover:pr-3.5"
        >
          <LayoutGrid className="w-4 h-4 text-[#FF9933] group-hover:rotate-12 transition-transform" />
          <div className="text-left">
            <div className="text-[11px] font-bold font-display leading-tight flex items-center gap-1">
              <span>Modules</span>
              <span className="text-[9px] font-mono bg-blue-600 px-1.5 py-0.2 rounded-full text-white font-bold">7</span>
            </div>
            <div className="text-[9px] text-slate-400 group-hover:text-blue-100 font-mono leading-tight">Side Menu</div>
          </div>
        </button>
      </div>

      {/* 3. Core Home View vs. Extended Feature Module View */}
      {activeTab === 'mesh' ? (
        /* HOME PAGE: 100% Focused on the Main Working Model of Site Scoring */
        <>
          {/* Mission & Statutory Siting Overview Banner */}
          <section className="border-b border-[#dde0e6] bg-gradient-to-b from-[#fcfcfd] to-[#f8f9fb]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#074ce0] text-[11px] font-mono font-bold border border-blue-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#074ce0]"></span>
                      <span>INDIA AI MISSION (₹10,372 CR) • STATUTORY GROUNDED SITING</span>
                    </div>

                    <button
                      onClick={() => setIsSidePanelOpen(true)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[#454c58] text-[10px] font-mono border border-slate-300 transition-colors"
                      title="Explore 7 extended modules"
                    >
                      <LayoutGrid className="w-3 h-3 text-[#074ce0]" />
                      <span>7 Extended Suites in Side Menu →</span>
                    </button>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold font-display text-[#16191f] tracking-tight">
                    National AI Infrastructure Decision Intelligence & Geospatial Operating System
                  </h2>
                  <p className="text-xs text-[#454c58] leading-relaxed">
                    Evaluates hyperscale AI data centers across 9 statutory infrastructure & sovereign dimensions (50-Factor Matrix): water stress (CGWB), electrical grid (CEA), psychrometric wet-bulb (NASA POWER), subsea connectivity (NIXI), seismic hazard (BIS IS 1893:2016), soil bearing capacity (IS 1892), open-access tariffs (SERC), atmospheric corrosivity (ISA-71.04), and MoEFCC forest buffers. Zero guessed scores.
                  </p>
                </div>

                {/* Quick Stats Micro Strip */}
                <div className="flex items-center gap-2.5 shrink-0 font-mono text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-[#dde0e6] shadow-2xs text-center min-w-[85px]">
                    <div className="text-sm font-black text-[#16191f]">{sites.length}</div>
                    <div className="text-[10px] text-[#454c58]">Key Hubs</div>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-[#dde0e6] shadow-2xs text-center min-w-[85px]">
                    <div className="text-sm font-black text-[#074ce0]">9</div>
                    <div className="text-[10px] text-[#454c58]">Dimensions</div>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-[#dde0e6] shadow-2xs text-center min-w-[85px]">
                    <div className="text-sm font-black text-emerald-600">50</div>
                    <div className="text-[10px] text-[#454c58]">Factors</div>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-[#dde0e6] shadow-2xs text-center min-w-[85px]">
                    <div className="text-sm font-black text-indigo-600">5</div>
                    <div className="text-[10px] text-[#454c58]">Live APIs</div>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* Main Siting Working Model Canvas */}
          <section className="flex-1 bg-[#f3f4f6] py-6 sm:py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              
              {/* Error Banner */}
              {errorMsg && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between font-mono">
                  <span>{errorMsg}</span>
                  <button onClick={loadSites} className="underline font-bold">Retry Connection</button>
                </div>
              )}

              {/* CORE MODEL: Cartographic Mesh (7 cols) + Selected Site Composite ScoreCard (5 cols) */}
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

              {/* Granular 9-Domain Explainability Panel */}
              {selectedSite && (
                <ExplainabilityPanel site={selectedSite} />
              )}

              {/* Statutory Mitigation Mandates & Risk Flags */}
              {selectedSite && (
                <MitigationCard site={selectedSite} />
              )}

              {/* Extended Platform Ecosystem Gateway Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-white via-white to-blue-50/50 border border-[#dde0e6] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[#16191f] text-[#FF9933] flex items-center justify-center shrink-0 shadow-sm">
                    <LayoutGrid className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold font-display text-[#16191f]">
                        Extended IndiaAI Infrastructure Feature Suites
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-[#074ce0] border border-blue-200 font-bold">
                        7 Modules
                      </span>
                    </div>
                    <p className="text-xs text-[#454c58] mt-0.5 max-w-2xl leading-relaxed">
                      Beyond site scoring: run DC Engineering sizing simulations, inspect the GPU Marketplace, analyze state policy incentives, optimize ESG renewable mix, or review the multi-site audit matrix.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsSidePanelOpen(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#16191f] hover:bg-[#252a34] text-white transition-all shadow-xs shrink-0 group"
                >
                  <span>Explore Platform Suites</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#FF9933] group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </div>
          </section>
        </>
      ) : (
        /* EXTENDED MODULE VIEW (Launched via Side Panel) */
        <section className="flex-1 bg-[#f3f4f6] py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            
            {/* Extended Module Breadcrumb & Navigation Command Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#dde0e6] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono text-[#8c94a4]">
                  <button 
                    onClick={() => setActiveTab('mesh')}
                    className="hover:text-[#074ce0] flex items-center gap-1 font-semibold text-[#454c58] transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#074ce0]" />
                    <span>Site Scoring Engine</span>
                  </button>
                  <span>/</span>
                  <span>Platform Modules</span>
                  <span>/</span>
                  <span className="text-[#16191f] font-bold">
                    {currentModule?.shortLabel || 'Extended Suite'}
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${currentModule?.bgColor || 'bg-blue-50'} ${currentModule?.color || 'text-[#074ce0]'} border ${currentModule?.borderColor || 'border-blue-200'}`}>
                    {currentModule?.icon && <currentModule.icon className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold font-display text-[#16191f] leading-tight">
                        {currentModule?.title}
                      </h2>
                      {currentModule?.badge && (
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${currentModule.badgeColor}`}>
                          {currentModule.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#454c58] mt-0.5">
                      {currentModule?.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                {/* Active Hub Context */}
                {selectedSite && (
                  <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#f3f4f6] border border-[#dde0e6] text-xs font-mono">
                    <span className="text-[#8c94a4]">Active Hub:</span>
                    <span className="font-bold text-[#16191f]">{selectedSite.site_name.split(' (')[0]}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-white text-[#074ce0] font-bold border border-blue-100">
                      {selectedSite.composite_score?.toFixed(0) || '0'}/100
                    </span>
                  </div>
                )}

                <button
                  onClick={() => setIsSidePanelOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-[#f3f4f6] hover:bg-[#e5e7eb] text-[#16191f] transition-colors border border-[#dde0e6]"
                >
                  <LayoutGrid className="w-4 h-4 text-[#074ce0]" />
                  <span>Switch Module</span>
                </button>

                <button
                  onClick={() => setActiveTab('mesh')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#074ce0] hover:bg-[#0640c4] text-white transition-all shadow-sm shadow-[#074ce0]/25"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Site Scoring</span>
                </button>
              </div>
            </div>

            {/* Render the Active Extended Module */}
            {activeTab === 'eco' && (
              <EcoPlannerTab selectedSite={selectedSite} />
            )}

            {activeTab === 'dc_planner' && (
              <DCPlannerTab selectedSite={selectedSite} />
            )}

            {activeTab === 'marketplace' && (
              <MarketplaceTab />
            )}

            {activeTab === 'demand' && (
              <DemandForecastTab />
            )}

            {activeTab === 'citizen' && (
              <CitizenFinancingTab />
            )}

            {activeTab === 'policy' && (
              <PolicyIntelligenceTab />
            )}

            {activeTab === 'comparison' && (
              <SiteComparison 
                sites={sites} 
                selectedSite={selectedSite} 
                onSelectSite={(site) => { setSelectedSite(site); setActiveTab('mesh'); }} 
              />
            )}

          </div>
        </section>
      )}

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
                <li>• 9-Domain Siting Mesh (Core)</li>
                <li>• Data Center Capacity Planner</li>
                <li>• Federated GPU Marketplace</li>
                <li>• 2024–2030 Demand Forecasting</li>
                <li>• Sovereign Infrastructure Bonds</li>
                <li>• Eco-Friendly DC & ESG Engine</li>
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

      {/* Side Panel Drawer for Extended Feature Suites */}
      <SidePanelMenu
        isOpen={isSidePanelOpen}
        onClose={() => setIsSidePanelOpen(false)}
        activeTab={activeTab}
        onSelectModule={(moduleId) => setActiveTab(moduleId)}
        sitesCount={sites.length}
      />

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
