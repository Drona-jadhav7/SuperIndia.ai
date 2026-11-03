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
    <div className="min-h-screen bg-[#f8fafc] text-[#16191f] flex flex-col font-sans selection:bg-[#074ce0]/20 selection:text-[#074ce0]">
      
      {/* 1. Header (National Insignia & Clean Enterprise Command Bar) */}
      <header className="sticky top-0 z-[1500] border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-2xs">
        
        {/* Subtle Indian Tricolor National Accent Stripe */}
        <div className="h-[3px] bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808] w-full shrink-0 shadow-xs" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          
          {/* Top-Left: Menu Trigger & Brand Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
            {/* TOP-LEFT CORNER: Platform Modules Menu Button (Signature Blue matching Simulate Site) */}
            <button
              onClick={() => setIsSidePanelOpen(true)}
              className="flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#074ce0] hover:bg-[#0640c4] text-white transition-all shadow-sm shadow-[#074ce0]/25 font-display shrink-0 group cursor-pointer"
              title="Open Platform Features Menu (7 Extended Modules)"
            >
              <Menu className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              <span className="font-bold">Features</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/20 text-white font-bold border border-white/25">
                7
              </span>
            </button>

            {/* Subtle Divider */}
            <div className="h-5 w-px bg-slate-200 hidden sm:block shrink-0" />

            {/* Brand Logo & Name */}
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => { setActiveTab('mesh'); }}>
              <div className="relative group">
                <div className="w-9 h-9 rounded-full p-0.5 group-hover:scale-105 transition-transform flex items-center justify-center shrink-0">
                  <img 
                    src="/logo.png" 
                    alt="SuperIndia.ai Official Insignia" 
                    className="w-full h-full object-contain drop-shadow-2xs" 
                  />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full shadow-2xs" title="National AI OS Active" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold font-display tracking-tight text-slate-900 leading-none">
                    SuperIndia<span className="text-[#074ce0]">.ai</span>
                  </h1>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-[#074ce0] border border-blue-200 font-bold hidden sm:inline-flex items-center gap-1">
                    <span>🇮🇳</span> National AI OS
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-sans hidden 2xl:block mt-0.5">
                  National AI Infrastructure Intelligence & Siting Operating System
                </div>
              </div>
            </div>
          </div>

          {/* Center: Executive Compact Hub Selector (Guarantees zero header wrap) */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/70 transition-colors px-3 py-1.5 rounded-xl border border-slate-200/90 text-xs shadow-2xs">
            <MapPin className="w-3.5 h-3.5 text-[#074ce0] shrink-0" />
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Hub:</span>
            <select
              value={selectedSite?.site_id || ''}
              onChange={(e) => {
                const s = sites.find(item => item.site_id === e.target.value);
                if (s) {
                  setSelectedSite(s);
                  if (activeTab !== 'mesh') setActiveTab('mesh');
                }
              }}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer max-w-[170px] xl:max-w-[220px] truncate"
            >
              {sites.map(s => (
                <option key={s.site_id} value={s.site_id}>
                  {s.site_name.split(' (')[0]}
                </option>
              ))}
            </select>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-white text-[#074ce0] border border-blue-100 shadow-2xs shrink-0">
              {selectedSite?.composite_score?.toFixed(1) || '0'}/100
            </span>
          </div>

          {/* Right Action Controls: Health, Refresh & Simulate Site (Shrink-0 Guaranteed) */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-mono text-emerald-800 font-medium">
              <span className={`w-2 h-2 rounded-full ${apiOnline ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`}></span>
              <span>{apiOnline ? 'Backend Live' : 'Sovereign Edge Live'}</span>
            </div>

            <button
              onClick={loadSites}
              title="Refresh Ground Truth Telemetry"
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#074ce0] hover:bg-[#0640c4] text-white transition-all shadow-sm shadow-[#074ce0]/25 font-display shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Simulate Site</span>
              <span className="sm:hidden">Simulate</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. Core Home View vs. Extended Feature Module View */}
      {activeTab === 'mesh' ? (
        /* HOME PAGE: 100% Focused on the Main Working Model of Site Scoring */
        <>
          {/* Mission & Statutory Siting Overview Banner */}
          <section className="border-b border-slate-200 bg-gradient-to-b from-white via-slate-50/70 to-slate-100/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                
                <div className="space-y-1.5 max-w-3xl">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#074ce0] text-[11px] font-mono font-bold border border-blue-200 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#074ce0]"></span>
                    <span>INDIA AI MISSION (₹10,372 CR) • STATUTORY GROUNDED SITING</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight leading-tight">
                    National AI Infrastructure Siting & Decision Intelligence
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                    Evaluates hyperscale AI data centers across 9 statutory infrastructure & sovereign dimensions (50-Factor Matrix): water stress (CGWB), electrical grid (CEA), psychrometric wet-bulb (NASA POWER), subsea connectivity (NIXI), seismic hazard (BIS IS 1893:2016), soil bearing capacity (IS 1892), open-access tariffs (SERC), atmospheric corrosivity (ISA-71.04), and MoEFCC forest buffers. Zero guessed scores.
                  </p>
                </div>

                {/* Quick Stats Micro Strip - Glassmorphic capsules */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0 font-mono text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs text-center min-w-[90px] hover:border-slate-300 transition-colors">
                    <div className="text-base font-black text-slate-900">{sites.length}</div>
                    <div className="text-[10px] text-slate-500 font-sans font-medium uppercase tracking-wider">Key Hubs</div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs text-center min-w-[90px] hover:border-blue-300 transition-colors">
                    <div className="text-base font-black text-[#074ce0]">9</div>
                    <div className="text-[10px] text-slate-500 font-sans font-medium uppercase tracking-wider">Dimensions</div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs text-center min-w-[90px] hover:border-emerald-300 transition-colors">
                    <div className="text-base font-black text-emerald-600">50</div>
                    <div className="text-[10px] text-slate-500 font-sans font-medium uppercase tracking-wider">Factors</div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs text-center min-w-[90px] hover:border-indigo-300 transition-colors">
                    <div className="text-base font-black text-indigo-600">5</div>
                    <div className="text-[10px] text-slate-500 font-sans font-medium uppercase tracking-wider">Live APIs</div>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* Main Siting Working Model Canvas */}
          <section className="flex-1 bg-slate-100/60 py-6 sm:py-8">
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
                <div className="lg:col-span-7 min-h-[580px] lg:h-[640px] flex flex-col rounded-2xl overflow-hidden border border-slate-300 shadow-sm bg-[#16191f]">
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
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-white via-white to-blue-50/70 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-[#074ce0] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#074ce0]/25">
                    <Menu className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold font-display text-slate-900">
                        Extended IndiaAI Infrastructure Feature Suites
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-[#074ce0] border border-blue-200 font-bold">
                        7 Modules
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 max-w-2xl leading-relaxed">
                      Beyond site scoring: run DC Engineering sizing simulations, inspect the GPU Marketplace, analyze state policy incentives, optimize ESG renewable mix, or review the multi-site audit matrix.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsSidePanelOpen(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#074ce0] hover:bg-[#0640c4] text-white transition-all shadow-sm shadow-[#074ce0]/25 shrink-0 group cursor-pointer"
                >
                  <Menu className="w-4 h-4 text-white" />
                  <span>Open Features Menu</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </div>
          </section>
        </>
      ) : (
        /* EXTENDED MODULE VIEW (Launched via Side Panel) */
        <section className="flex-1 bg-slate-100/60 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            
            {/* Extended Module Breadcrumb & Navigation Command Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <button 
                    onClick={() => setActiveTab('mesh')}
                    className="hover:text-[#074ce0] flex items-center gap-1 font-semibold text-slate-600 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#074ce0]" />
                    <span>Site Scoring Engine</span>
                  </button>
                  <span>/</span>
                  <span>Platform Modules</span>
                  <span>/</span>
                  <span className="text-slate-900 font-bold">
                    {currentModule?.shortLabel || 'Extended Suite'}
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${currentModule?.bgColor || 'bg-blue-50'} ${currentModule?.color || 'text-[#074ce0]'} border ${currentModule?.borderColor || 'border-blue-200'}`}>
                    {currentModule?.icon && <currentModule.icon className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold font-display text-slate-900 leading-tight">
                        {currentModule?.title}
                      </h2>
                      {currentModule?.badge && (
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${currentModule.badgeColor}`}>
                          {currentModule.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {currentModule?.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                {/* Active Hub Context */}
                {selectedSite && (
                  <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono">
                    <span className="text-slate-400">Active Hub:</span>
                    <span className="font-bold text-slate-800">{selectedSite.site_name.split(' (')[0]}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-white text-[#074ce0] font-bold border border-blue-100">
                      {selectedSite.composite_score?.toFixed(1) || '0'}/100
                    </span>
                  </div>
                )}

                <button
                  onClick={() => setIsSidePanelOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-blue-50 hover:bg-blue-100 text-[#074ce0] transition-colors border border-blue-200 font-semibold cursor-pointer"
                >
                  <Menu className="w-4 h-4 text-[#074ce0]" />
                  <span>Switch Module</span>
                </button>

                <button
                  onClick={() => setActiveTab('mesh')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#074ce0] hover:bg-[#0640c4] text-white transition-all shadow-sm shadow-[#074ce0]/25 cursor-pointer"
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

      {/* 3. Enterprise Institutional Footer */}
      <footer className="border-t border-slate-200 bg-[#0F172A] text-slate-300 py-10">
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
              <p className="text-xs text-slate-300 leading-relaxed max-w-md">
                India's sovereign infrastructure intelligence and resource optimization platform.
                Bridging upstream strategic spatial planning with cross-institutional compute utilization under IndiaAI.
              </p>
              <div className="text-[11px] font-mono text-slate-400">
                Axiom: One model → one responsibility → domain aggregator → composite national intelligence.
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-bold text-white font-display uppercase tracking-wider text-[11px]">
                Platform Capabilities
              </div>
              <ul className="space-y-1.5 text-slate-300">
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
              <ul className="space-y-1.5 text-slate-300">
                <li>• Central Ground Water Board (CGWB)</li>
                <li>• Central Electricity Authority (CEA)</li>
                <li>• NASA POWER 30-Year Climatology</li>
                <li>• BIS IS 1893:2016 Seismic Standards</li>
                <li>• National Internet Exchange of India (NIXI)</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-sans">
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
