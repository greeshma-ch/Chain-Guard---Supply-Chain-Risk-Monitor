
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Auth from './components/Auth';
import SupplierForm from './components/SupplierForm';
import SupplierDetailModal from './components/SupplierDetailModal';
import SectorCustomizationModal from './components/SectorCustomizationModal';
import RiskBadge from './components/RiskBadge';
import Sparkline from './components/Sparkline';
import { Supplier, RiskAnalysis, RiskLevel, Alert, CompanyInfo, SupplierCategory, ALL_CATEGORIES } from './types';
import { analyzeSupplierRisk } from './services/geminiService';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('chainGuard_auth') === 'true';
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'suppliers' | 'alerts' | 'settings'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCustomizingSectors, setIsCustomizingSectors] = useState(false);
  
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(() => {
    const saved = localStorage.getItem('chainGuard_company');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('chainGuard_suppliers');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Zhongshan Electronics', location: 'Guangdong, China', category: 'Electronics', registeredAt: new Date().toISOString() },
      { id: '2', name: 'Nordic Logistics Co', location: 'Hamburg, Germany', category: 'Logistics', registeredAt: new Date().toISOString() },
    ];
  });

  const [visibleSectors, setVisibleSectors] = useState<SupplierCategory[]>(() => {
    const saved = localStorage.getItem('chainGuard_visibleSectors');
    return saved ? JSON.parse(saved) : ALL_CATEGORIES;
  });

  const [analyses, setAnalyses] = useState<Record<string, RiskAnalysis>>({});
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | RiskLevel>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [feedTimeFilter, setFeedTimeFilter] = useState<'24H' | '7D' | 'ALL'>('ALL');
  const [isSimulationMode, setIsSimulationMode] = useState(false);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('chainGuard_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('chainGuard_visibleSectors', JSON.stringify(visibleSectors));
  }, [visibleSectors]);

  const lastGlobalUpdate = useMemo(() => {
    const dates = Object.values(analyses).map(a => new Date(a.lastUpdated).getTime());
    return dates.length > 0 ? new Date(Math.max(...dates)) : null;
  }, [analyses]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('chainGuard_auth', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('chainGuard_auth');
  };

  const saveCompany = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const info = {
      name: formData.get('companyName') as string,
      location: formData.get('hqLocation') as string,
    };
    setCompanyInfo(info);
    localStorage.setItem('chainGuard_company', JSON.stringify(info));
    setActiveTab('dashboard');
  };

  const refreshRisk = useCallback(async (supplier: Supplier) => {
    const analysis = await analyzeSupplierRisk(supplier, companyInfo?.location);
    setAnalyses(prev => ({ ...prev, [supplier.id]: analysis }));
    
    setAlerts(prev => {
      const otherAlerts = prev.filter(a => a.supplierId !== supplier.id);
      if (analysis.status === RiskLevel.GREEN) return otherAlerts;

      const updatedAlert: Alert = {
        id: Math.random().toString(36).substring(2, 11),
        supplierId: supplier.id,
        supplierName: supplier.name,
        type: 'SYSTEM',
        severity: analysis.status,
        message: analysis.summary,
        timestamp: new Date().toISOString()
      };
      return [updatedAlert, ...otherAlerts].slice(0, 50);
    });
  }, [companyInfo]);

  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all(suppliers.map(s => refreshRisk(s)));
    setIsRefreshing(false);
  }, [suppliers, refreshRisk]);

  useEffect(() => {
    if (isAuthenticated && companyInfo) {
      refreshAll();
    }
  }, [suppliers.length, refreshAll, isAuthenticated, !!companyInfo]);

  const handleAddSupplier = (data: Omit<Supplier, 'id' | 'registeredAt'>) => {
    const newSupplier: Supplier = {
      ...data,
      id: Math.random().toString(36).substring(2, 11),
      registeredAt: new Date().toISOString()
    };
    setSuppliers(prev => [...prev, newSupplier]);
  };

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.location.toLowerCase().includes(searchQuery.toLowerCase());
      const analysis = analyses[s.id];
      const matchesStatus = statusFilter === 'ALL' || (analysis && analysis.status === statusFilter);
      const matchesCategory = categoryFilter === 'ALL' || s.category === categoryFilter;
      const isSectorVisible = visibleSectors.includes(s.category);
      
      return matchesSearch && matchesStatus && matchesCategory && isSectorVisible;
    });
  }, [suppliers, searchQuery, statusFilter, categoryFilter, analyses, visibleSectors]);

  const filteredAlerts = useMemo(() => {
    let baseAlerts = alerts;
    if (feedTimeFilter !== 'ALL') {
      const now = new Date().getTime();
      const limit = feedTimeFilter === '24H' ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
      baseAlerts = alerts.filter(a => (now - new Date(a.timestamp).getTime()) < limit);
    }
    return baseAlerts.filter(a => {
      const supplier = suppliers.find(s => s.id === a.supplierId);
      return supplier ? visibleSectors.includes(supplier.category) : true;
    });
  }, [alerts, feedTimeFilter, visibleSectors, suppliers]);

  const dashboardStats = {
    total: suppliers.filter(s => visibleSectors.includes(s.category)).length,
    high: (Object.entries(analyses) as [string, RiskAnalysis][])
      .filter(([id, a]) => {
        const s = suppliers.find(sup => sup.id === id);
        return a.status === RiskLevel.RED && s && visibleSectors.includes(s.category);
      }).length,
    caution: (Object.entries(analyses) as [string, RiskAnalysis][])
      .filter(([id, a]) => {
        const s = suppliers.find(sup => sup.id === id);
        return a.status === RiskLevel.YELLOW && s && visibleSectors.includes(s.category);
      }).length,
    safe: (Object.entries(analyses) as [string, RiskAnalysis][])
      .filter(([id, a]) => {
        const s = suppliers.find(sup => sup.id === id);
        return a.status === RiskLevel.GREEN && s && visibleSectors.includes(s.category);
      }).length,
  };

  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className={`min-h-screen flex bg-slate-950 text-slate-100 font-sans transition-all duration-700 ${isSimulationMode ? 'grayscale-[0.3] sepia-[0.1]' : ''}`}>
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => { setActiveTab(tab); setIsSidebarOpen(false); }} 
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        alertCount={filteredAlerts.length}
        visibleSectors={visibleSectors}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        onOpenCustomization={() => setIsCustomizingSectors(true)}
      />

      <main className="flex-grow flex flex-col min-h-screen relative overflow-x-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-40 backdrop-blur-lg">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <h1 className="text-sm font-black text-white uppercase tracking-tight">ChainGuard</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500'}`}></div>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{dashboardStats.total} Nodes</span>
          </div>
        </div>

        {isSimulationMode && (
          <div className="absolute top-0 left-0 w-full h-1 bg-red-600 animate-pulse z-[60]" />
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 w-full">
          {(!companyInfo || activeTab === 'settings') && (
            <div className="animate-in fade-in duration-500 mb-8">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="bg-indigo-600/5 p-6 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Enterprise Configuration</h2>
                    <p className="text-slate-400 text-xs mt-1 font-medium">Verify your HQ location for precise proximal risk mapping.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Risk Simulation</span>
                    <button 
                      onClick={() => setIsSimulationMode(!isSimulationMode)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${isSimulationMode ? 'bg-indigo-600' : 'bg-slate-800 border border-slate-700'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isSimulationMode ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
                <form onSubmit={saveCompany} className="p-6 sm:p-8 flex flex-col lg:flex-row lg:items-end gap-6 items-stretch">
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Entity Name</label>
                    <input required name="companyName" defaultValue={companyInfo?.name} className="w-full px-5 py-3.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-slate-100 font-semibold" placeholder="Enter Company Name" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Coordinates (HQ)</label>
                    <input required name="hqLocation" defaultValue={companyInfo?.location} className="w-full px-5 py-3.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-slate-100 font-semibold" placeholder="e.g. London, UK" />
                  </div>
                  <button className="w-full lg:w-auto px-10 py-3.5 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:bg-indigo-700 h-[52px] flex items-center justify-center">Commit Identity</button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && companyInfo && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                  <h1 className="text-xl lg:text-2xl font-black text-white uppercase tracking-tight leading-tight">
                    {isSimulationMode ? '[SIMULATION] System Breach Detected' : `System Status: ${dashboardStats.high > 0 ? 'Disrupted' : 'Optimal'}`}
                  </h1>
                  <p className="text-slate-400 text-xs lg:text-sm font-medium mt-1">
                    Grounded telemetry active for {companyInfo.name}. 
                    {lastGlobalUpdate && <span className="block sm:inline text-[9px] sm:ml-3 opacity-60 uppercase font-black tracking-widest italic mt-1 sm:mt-0">Last Refresh: {lastGlobalUpdate.toLocaleTimeString()}</span>}
                  </p>
                </div>
                <div className="flex w-full md:w-auto gap-3">
                   <div className="hidden sm:flex px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-indigo-500 animate-ping' : 'bg-emerald-500'}`}></div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{dashboardStats.total} Nodes Monitored</span>
                   </div>
                   <button onClick={refreshAll} disabled={isRefreshing} className="flex-1 md:flex-none px-6 py-3.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-900/20">
                      {isRefreshing ? 'Scanning...' : 'Manual Sweep'}
                   </button>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-slate-900/50 p-5 sm:p-6 rounded-3xl border border-slate-800 backdrop-blur-sm shadow-xl"><p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Registry Nodes</p><p className="text-2xl sm:text-3xl font-black mt-2">{dashboardStats.total}</p></div>
                <div className="bg-rose-500/5 p-5 sm:p-6 rounded-3xl border border-rose-500/20 backdrop-blur-sm shadow-xl"><p className="text-rose-400 text-[10px] font-black uppercase tracking-widest">High Disruption</p><p className="text-2xl sm:text-3xl font-black text-rose-500 mt-2">{isSimulationMode ? dashboardStats.total : dashboardStats.high}</p></div>
                <div className="bg-amber-500/5 p-5 sm:p-6 rounded-3xl border border-amber-500/20 backdrop-blur-sm shadow-xl"><p className="text-amber-400 text-[10px] font-black uppercase tracking-widest">Warning States</p><p className="text-2xl sm:text-3xl font-black text-amber-500 mt-2">{dashboardStats.caution}</p></div>
                <div className="bg-emerald-500/5 p-5 sm:p-6 rounded-3xl border border-emerald-500/20 backdrop-blur-sm shadow-xl"><p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Optimal Nodes</p><p className="text-2xl sm:text-3xl font-black text-emerald-500 mt-2">{isSimulationMode ? 0 : dashboardStats.safe}</p></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Tactical Spatial Radar</h2>
                  <div className={`bg-slate-900 h-[400px] sm:h-[500px] rounded-[2.5rem] relative overflow-hidden flex items-center justify-center border border-slate-800 shadow-2xl group shadow-indigo-950/20 ${isSimulationMode ? 'border-red-600/50' : ''}`}>
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                      {suppliers.filter(s => visibleSectors.includes(s.category)).map((s, idx) => {
                        const analysis = analyses[s.id];
                        const status = isSimulationMode ? RiskLevel.RED : (analysis?.status || RiskLevel.GREEN);
                        const color = status === RiskLevel.RED ? '#ef4444' : status === RiskLevel.YELLOW ? '#f59e0b' : '#10b981';
                        const sX = (idx % 2 === 0 ? 15 : 75) + (idx * 5);
                        const sY = 20 + (idx * 25);
                        return <line key={`line-${s.id}`} x1="50%" y1="45%" x2={`${sX}%`} y2={`${sY}%`} stroke={color} strokeWidth="1.5" strokeOpacity={isSimulationMode ? "0.6" : "0.25"} className="transition-all duration-1000" />;
                      })}
                    </svg>
                    <div className="absolute w-10 h-10 rounded-full cursor-default border-2 border-indigo-400 shadow-[0_0_40px_rgba(129,140,248,0.5)] z-30 flex items-center justify-center bg-slate-950" style={{ top: '45%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                      <div className="absolute inset-0 rounded-full animate-ping bg-indigo-500/20"></div>
                      <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-indigo-600 px-3 py-1 rounded-lg shadow-2xl whitespace-nowrap border border-indigo-400 scale-75 sm:scale-100">
                        <p className="text-[8px] font-black text-white uppercase tracking-widest text-center">{companyInfo.name}</p>
                      </div>
                    </div>
                    {suppliers.filter(s => visibleSectors.includes(s.category)).map((s, idx) => {
                      const analysis = analyses[s.id];
                      const status = isSimulationMode ? RiskLevel.RED : (analysis?.status || RiskLevel.GREEN);
                      const posX = (idx % 2 === 0 ? 15 : 75) + (idx * 5);
                      const posY = 20 + (idx * 25);
                      return (
                        <div key={s.id} onClick={() => setSelectedSupplierId(s.id)} className="absolute w-6 h-6 sm:w-8 sm:h-8 rounded-full cursor-pointer border-2 border-slate-950 shadow-2xl transition-all hover:scale-125 z-20 group/pin" style={{ top: `${posY}%`, left: `${posX}%`, transform: 'translate(-50%, -50%)', backgroundColor: status === RiskLevel.RED ? '#ef4444' : status === RiskLevel.YELLOW ? '#f59e0b' : '#10b981' }}>
                          <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl shadow-2xl whitespace-nowrap opacity-0 group-hover/pin:opacity-100 transition-all duration-300 pointer-events-none hidden sm:block">
                            <p className="text-[9px] font-black text-white uppercase tracking-widest text-center">{s.name}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Disruption Signals</h2>
                    <div className="flex gap-1">
                      {(['24H', '7D', 'ALL'] as const).map(f => (
                        <button 
                          key={f} 
                          onClick={() => setFeedTimeFilter(f)}
                          className={`text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 rounded border transition-all ${feedTimeFilter === f ? 'bg-indigo-600 text-white border-indigo-500' : 'text-slate-600 border-slate-800 hover:text-slate-400'}`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 h-[400px] sm:h-[500px] overflow-y-auto divide-y divide-slate-800 shadow-2xl custom-scrollbar">
                    {filteredAlerts.map(alert => (
                      <div key={alert.id} className="p-5 sm:p-6 hover:bg-slate-800/50 cursor-pointer transition-colors" onClick={() => setSelectedSupplierId(alert.supplierId)}>
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest truncate max-w-[150px]">{alert.supplierName}</p>
                          <RiskBadge level={alert.severity} />
                        </div>
                        <p className="text-xs text-slate-300 font-semibold leading-relaxed line-clamp-2 italic">"{alert.message}"</p>
                        <div className="mt-4 flex justify-between items-center">
                          <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">{new Date(alert.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          {analyses[alert.supplierId] && <Sparkline data={analyses[alert.supplierId].trend} color={alert.severity === RiskLevel.RED ? '#f43f5e' : '#f59e0b'} />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'suppliers' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                  <h1 className="text-xl lg:text-2xl font-black text-white uppercase tracking-tight">
                    Network Registry {categoryFilter !== 'ALL' && <span className="text-indigo-400 font-medium ml-2">/ {categoryFilter}</span>}
                  </h1>
                  <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1">Verified global logistics nodes and partners.</p>
                </div>
                <div className="flex w-full sm:w-auto gap-3">
                  {categoryFilter !== 'ALL' && (
                    <button onClick={() => setCategoryFilter('ALL')} className="flex-1 sm:flex-none px-4 py-2.5 border border-slate-800 text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all">Clear</button>
                  )}
                  <button onClick={() => setIsAddingSupplier(true)} className="flex-1 sm:flex-none px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/20">Register Node</button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 bg-slate-900/50 p-4 rounded-3xl border border-slate-800 items-center">
                <div className="relative w-full md:flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                  </div>
                  <input type="text" placeholder="Search registry..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="block w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs sm:text-sm font-semibold text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                </div>
                <div className="flex gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800 w-full md:w-auto overflow-x-auto custom-scrollbar">
                  {(['ALL', RiskLevel.GREEN, RiskLevel.YELLOW, RiskLevel.RED] as const).map((lvl) => (
                    <button key={lvl} onClick={() => setStatusFilter(lvl)} className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === lvl ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                      {lvl === 'ALL' ? 'Unified' : lvl === RiskLevel.GREEN ? 'Stable' : lvl === RiskLevel.YELLOW ? 'Caution' : 'Risky'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl overflow-x-auto custom-scrollbar">
                <table className="w-full text-left min-w-[700px]">
                  <thead className="bg-slate-950/50 border-b border-slate-800">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Node Identity</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Locale</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Risk State</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredSuppliers.map(s => (
                      <tr key={s.id} className="hover:bg-slate-800/30 group transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800 text-[10px] font-black text-indigo-400">{s.name.charAt(0)}</div>
                            <div>
                              <p className="text-sm font-bold text-slate-100">{s.name}</p>
                              <p className="text-[9px] font-black text-indigo-500/60 uppercase tracking-widest">{s.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">{s.location}</td>
                        <td className="px-8 py-5">
                           {analyses[s.id] ? <RiskBadge level={analyses[s.id].status} /> : <div className="h-1 w-16 bg-slate-800 rounded-full animate-pulse" />}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button onClick={() => setSelectedSupplierId(s.id)} className="text-indigo-400 text-[9px] font-black uppercase tracking-widest border border-indigo-900/50 px-4 py-2 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">Assess</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-xl lg:text-2xl font-black text-white uppercase tracking-tight">Intelligence Archive</h1>
                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                   {(['24H', '7D', 'ALL'] as const).map(f => (
                    <button 
                      key={f} 
                      onClick={() => setFeedTimeFilter(f)}
                      className={`whitespace-nowrap text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border transition-all ${feedTimeFilter === f ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:gap-6">
                {filteredAlerts.length > 0 ? (
                  filteredAlerts.map(alert => (
                    <div key={alert.id} className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 sm:p-8 hover:border-indigo-500 transition-all shadow-2xl group cursor-pointer" onClick={() => setSelectedSupplierId(alert.supplierId)}>
                       <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                          <div className="flex items-center gap-4">
                             <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center ${alert.severity === RiskLevel.RED ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'} border border-current/20 shadow-xl`}>
                               <svg className="w-6 h-6 sm:w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                             </div>
                             <div>
                               <h3 className="font-black text-white text-lg sm:text-xl uppercase tracking-tight">{alert.supplierName}</h3>
                               <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{new Date(alert.timestamp).toLocaleString()}</p>
                             </div>
                          </div>
                          <div className="flex items-center sm:flex-col sm:items-end gap-3 w-full sm:w-auto border-t sm:border-none border-slate-800 pt-4 sm:pt-0">
                            <RiskBadge level={alert.severity} />
                            {analyses[alert.supplierId] && <div className="ml-auto sm:ml-0"><Sparkline data={analyses[alert.supplierId].trend} color={alert.severity === RiskLevel.RED ? '#f43f5e' : '#f59e0b'} /></div>}
                          </div>
                       </div>
                       <p className="text-slate-200 text-sm sm:text-base font-semibold italic leading-relaxed">"{alert.message}"</p>
                    </div>
                  ))
                ) : (
                  <div className="bg-slate-900 border border-slate-800 rounded-[2rem] py-20 text-center">
                    <p className="text-slate-500 font-medium italic text-sm">No relevant telemetry detected for selected filters.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {selectedSupplierId && selectedSupplier && (
        <SupplierDetailModal supplier={selectedSupplier} analysis={analyses[selectedSupplierId]} onClose={() => setSelectedSupplierId(null)} />
      )}
      {isAddingSupplier && (
        <SupplierForm onAdd={handleAddSupplier} onClose={() => setIsAddingSupplier(false)} />
      )}
      {isCustomizingSectors && (
        <SectorCustomizationModal 
          visibleSectors={visibleSectors} 
          onSave={(newSectors) => {
            setVisibleSectors(newSectors);
            setIsCustomizingSectors(false);
          }}
          onClose={() => setIsCustomizingSectors(false)}
        />
      )}
    </div>
  );
};

export default App;
