import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Leaf, 
  Server, 
  Cpu, 
  TrendingUp, 
  Building2, 
  Coins, 
  BarChart3, 
  ArrowRight, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  LayoutGrid,
  ShieldCheck,
  Zap,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export const PLATFORM_MODULES = [
  {
    id: 'mesh',
    title: 'Geospatial Siting Mesh & Scoring Engine',
    shortLabel: 'Site Scoring (Core)',
    category: 'Core Sovereign Model',
    icon: MapPin,
    badge: 'Core Engine',
    badgeColor: 'bg-blue-50 text-[#074ce0] border-blue-200',
    color: 'text-[#074ce0]',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'Ground-truth multi-factor geospatial siting & composite viability scoring across 9 statutory dimensions (50-Factor Matrix).',
    tags: ['NASA POWER', 'CGWB Water', 'BIS IS 1893:2016', 'NIXI Subsea'],
    isCore: true
  },
  {
    id: 'eco',
    title: 'Eco-Friendly DC & ESG Planner',
    shortLabel: 'Eco & ESG Planner',
    category: 'Engineering & Sustainability',
    icon: Leaf,
    badge: 'ESG Intelligence',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    description: 'Green power corridors, renewable mix optimization, PUE minimization, and sovereign carbon offset calculation.',
    tags: ['CEA Grid Factor', 'Tree Canopy & Offset', 'Water Stress Mitigation'],
    isCore: false
  },
  {
    id: 'dc_planner',
    title: 'DC Engineering Planner',
    shortLabel: 'DC Engineering Planner',
    category: 'Engineering & Sustainability',
    icon: Server,
    badge: 'Infrastructure Sizing',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
    color: 'text-slate-700',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-200',
    description: 'Hyperscale hardware cluster sizing (NVIDIA H100/B200), cooling infrastructure, power topology & CAPEX/OPEX model.',
    tags: ['MW Sizing & PUE', 'Chiller vs Direct-to-Chip', 'Transformer Specs'],
    isCore: false
  },
  {
    id: 'marketplace',
    title: 'GPU Marketplace & Allocation Engine',
    shortLabel: 'GPU Marketplace',
    category: 'Compute & Market Economics',
    icon: Cpu,
    badge: 'Compute Exchange',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    description: 'Federated sovereign compute exchange connecting national supercomputing clusters with AI researchers & enterprises.',
    tags: ['AIRAWAT & Param Siddhi', 'Compute Pooling', 'Sovereign Tariffs'],
    isCore: false
  },
  {
    id: 'demand',
    title: 'National Demand Forecasting',
    shortLabel: 'Demand Forecasting',
    category: 'Compute & Market Economics',
    icon: TrendingUp,
    badge: '2024–2030 Horizon',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    color: 'text-sky-600',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
    description: 'Predictive forecasting of India\'s national AI compute demand, power grid loads, and Tier-2/Tier-3 capacity expansion.',
    tags: ['Tier-2/3 Spillover', 'Grid Expansion Needs', 'LLM Training Workloads'],
    isCore: false
  },
  {
    id: 'policy',
    title: 'State Policy Matrix & Incentives',
    shortLabel: 'State Policy Matrix',
    category: 'Governance & Benchmarking',
    icon: Building2,
    badge: 'Statutory Incentives',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    description: 'Comparative state data center policies, capital subsidies, open-access tariffs, and single-window clearance frameworks.',
    tags: ['14 State Frameworks', 'Open Access Tariffs', 'Stamp Duty Waivers'],
    isCore: false
  },
  {
    id: 'citizen',
    title: 'Sovereign Citizen Infrastructure Bonds',
    shortLabel: 'Citizen Financing',
    category: 'Governance & Benchmarking',
    icon: Coins,
    badge: 'Retail Capital',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    description: 'Fractional retail infrastructure investment pool enabling citizen participation in sovereign AI compute assets.',
    tags: ['7.8% Target Yield', 'Govt Guaranteed Tenor', 'Micro-Bonds (₹1,000+)'],
    isCore: false
  },
  {
    id: 'comparison',
    title: 'Multi-Site Comparative Audit',
    shortLabel: 'Multi-Site Audit',
    category: 'Governance & Benchmarking',
    icon: BarChart3,
    badge: 'Comparative Matrix',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    description: 'Side-by-side comparative benchmarking matrix analyzing composite scores, statutory viability tiers, and risk factors.',
    tags: ['Cross-Hub Rankings', 'Statutory Deltas', 'Exportable Audit Report'],
    isCore: false
  }
];

export default function SidePanelMenu({ 
  isOpen, 
  onClose, 
  activeTab, 
  onSelectModule,
  sitesCount = 0 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Handle Escape key to close side panel
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scroll when side panel is open on small screens
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter modules based on search and category
  const filteredModules = PLATFORM_MODULES.filter((mod) => {
    const matchesSearch = 
      mod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = 
      selectedCategory === 'ALL' || 
      mod.category === selectedCategory ||
      (selectedCategory === 'OTHER' && !mod.isCore);

    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'ALL', label: 'All Modules' },
    { id: 'OTHER', label: 'Extended Features (7)' },
    { id: 'Engineering & Sustainability', label: 'Engineering & ESG' },
    { id: 'Compute & Market Economics', label: 'Compute & Market' },
    { id: 'Governance & Benchmarking', label: 'Policy & Audit' },
  ];

  const coreModule = PLATFORM_MODULES.find(m => m.id === 'mesh');
  const otherModules = filteredModules.filter(m => !m.isCore);

  return (
    <div className="fixed inset-0 z-[2000] overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop with subtle blur */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-8 sm:pl-16">
        <div className="w-screen max-w-md sm:max-w-lg md:max-w-xl bg-[#ffffff] shadow-2xl flex flex-col border-l border-[#dde0e6] animate-in slide-in-from-right duration-250 ease-out">
          
          {/* Indian Tricolor National Accent Stripe */}
          <div className="h-[3px] bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808] w-full shrink-0 shadow-xs" />

          {/* Drawer Header */}
          <div className="p-5 border-b border-[#dde0e6] bg-[#fcfcfd] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#074ce0] shadow-2xs">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold font-display text-[#16191f]">
                    Platform Feature Suites
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-[#074ce0] border border-blue-200 font-bold">
                    7 Modules
                  </span>
                </div>
                <p className="text-xs text-[#454c58] mt-0.5">
                  Extended infrastructure intelligence & sovereign tools
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              title="Close Menu (Esc)"
              className="p-2 rounded-xl text-[#454c58] hover:text-[#16191f] hover:bg-[#f3f4f6] transition-colors border border-transparent hover:border-[#dde0e6]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search & Category Pills Filter */}
          <div className="p-4 border-b border-[#dde0e6] bg-[#fcfcfd]/50 space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8c94a4]" />
              <input 
                type="text"
                placeholder="Search tools, models, metrics (e.g., PUE, GPU, Tariffs)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-[#dde0e6] rounded-xl focus:outline-none focus:border-[#074ce0] focus:ring-1 focus:ring-[#074ce0] text-[#16191f] placeholder:text-[#8c94a4]"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8c94a4] hover:text-[#16191f]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-[#16191f] text-white shadow-2xs font-semibold'
                        : 'bg-[#f3f4f6] text-[#454c58] hover:text-[#16191f] hover:bg-[#e9ebef]'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scrollable Module List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            
            {/* Core Model Quick Jump Card */}
            {coreModule && (selectedCategory === 'ALL' || selectedCategory === coreModule.category) && (
              <div className="mb-2">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8c94a4] mb-2 px-1 flex items-center justify-between">
                  <span>Main Working Model (Home)</span>
                  <span className="text-[#074ce0] font-semibold">Default Operational Core</span>
                </div>
                
                <div 
                  onClick={() => {
                    onSelectModule('mesh');
                    onClose();
                  }}
                  className={`group relative p-4 rounded-xl border transition-all cursor-pointer ${
                    activeTab === 'mesh'
                      ? 'bg-blue-50/70 border-blue-300 shadow-sm ring-1 ring-[#074ce0]/20'
                      : 'bg-white border-[#dde0e6] hover:border-blue-300 hover:shadow-sm hover:bg-blue-50/20'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
                      <MapPin className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-bold text-[#16191f] group-hover:text-[#074ce0] transition-colors truncate">
                          {coreModule.title}
                        </h3>
                        {activeTab === 'mesh' ? (
                          <span className="shrink-0 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                            Active Home
                          </span>
                        ) : (
                          <span className="shrink-0 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#074ce0] border border-blue-200">
                            Return Home
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#454c58] mt-1 leading-relaxed">
                        {coreModule.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                        {coreModule.tags.map((tag) => (
                          <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-[#dde0e6] text-[#454c58]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Extended Feature Suites Header */}
            <div className="pt-2">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8c94a4] mb-2 px-1 flex items-center justify-between">
                <span>Extended Infrastructure Suites ({otherModules.length})</span>
                <span>Select to Launch</span>
              </div>

              {otherModules.length === 0 ? (
                <div className="p-8 text-center bg-[#f8f9fb] rounded-xl border border-dashed border-[#dde0e6] text-xs text-[#8c94a4]">
                  No matching platform modules found for "{searchQuery}".
                </div>
              ) : (
                <div className="space-y-3">
                  {otherModules.map((module) => {
                    const IconComponent = module.icon;
                    const isActive = activeTab === module.id;

                    return (
                      <div
                        key={module.id}
                        onClick={() => {
                          onSelectModule(module.id);
                          onClose();
                        }}
                        className={`group relative p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                            : 'bg-white border-[#dde0e6] hover:border-[#074ce0]/40 hover:bg-[#fcfcfd] hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Module Icon */}
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                            isActive
                              ? 'bg-white/10 text-white'
                              : `${module.bgColor} ${module.color} border ${module.borderColor}`
                          }`}>
                            <IconComponent className="w-4 h-4" />
                          </div>

                          {/* Module Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className={`text-xs sm:text-sm font-bold truncate ${
                                isActive ? 'text-white' : 'text-[#16191f] group-hover:text-[#074ce0]'
                              }`}>
                                {module.title}
                              </h4>
                              
                              <span className={`shrink-0 text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                                isActive 
                                  ? 'bg-white/20 text-white border-white/30 font-bold'
                                  : module.badgeColor
                              }`}>
                                {module.badge}
                              </span>
                            </div>

                            <p className={`text-xs mt-1 leading-relaxed ${
                              isActive ? 'text-slate-300' : 'text-[#454c58]'
                            }`}>
                              {module.description}
                            </p>

                            {/* Tags & Action Row */}
                            <div className={`flex items-center justify-between gap-2 mt-3 pt-2 border-t border-dashed ${isActive ? 'border-white/15' : 'border-[#dde0e6]'}`}>
                              <div className="flex flex-wrap items-center gap-1">
                                {module.tags.slice(0, 2).map((tag) => (
                                  <span 
                                    key={tag} 
                                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                      isActive 
                                        ? 'bg-white/10 text-slate-200' 
                                        : 'bg-[#f3f4f6] text-[#454c58]'
                                    }`}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>

                              <div className={`flex items-center gap-1 text-[11px] font-medium transition-transform group-hover:translate-x-1 ${
                                isActive ? 'text-[#FF9933]' : 'text-[#074ce0]'
                              }`}>
                                <span>{isActive ? 'Current View' : 'Launch'}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Side Panel Footer */}
          <div className="p-4 border-t border-[#dde0e6] bg-[#fcfcfd] flex items-center justify-between gap-3 text-xs">
            <button
              onClick={() => {
                onSelectModule('mesh');
                onClose();
              }}
              className="flex items-center gap-1.5 font-medium text-[#074ce0] hover:text-[#0640c4] transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Back to Siting Model</span>
            </button>

            <span className="text-[11px] font-mono text-[#8c94a4]">
              IndiaAI Mission • ₹10,372 Cr
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
