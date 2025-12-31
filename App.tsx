import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import SupplierForm from './components/SupplierForm';
import SupplierDetailModal from './components/SupplierDetailModal';
import RiskBadge from './components/RiskBadge';
import { Supplier, RiskAnalysis, RiskLevel, Alert, CompanyInfo } from './types';
import { analyzeSupplierRisk } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'suppliers' | 'alerts'>('dashboard');
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(() => {
    const saved = localStorage.getItem('chainGuard_company');
    return saved ? JSON.parse(saved) : null;
  });
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    { id: '1', name: 'Zhongshan Electronics', location: 'Guangdong, China', category: 'Electronics', registeredAt: new Date().toISOString() },
    { id: '2', name: 'Nordic Logistics Co', location: 'Hamburg, Germany', category: 'Logistics', registeredAt: new Date().toISOString() },
  ]);
  const [analyses, setAnalyses] = useState<Record<string, RiskAnalysis>>({});
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | RiskLevel>('ALL');

  const saveCompany = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const info = {
      name: formData.get('companyName') as string,
      location: formData.get('hqLocation') as string,
    };
    setCompanyInfo(info);
    localStorage.setItem('chainGuard_company', JSON.stringify(info));
    setIsEditingCompany(false);
  };

  const refreshRisk = useCallback(async (supplier: Supplier) => {
    const analysis = await analyzeSupplierRisk(supplier, companyInfo?.location);
    setAnalyses(prev => ({ ...prev, [supplier.id]: analysis }));
    
    // Synchronize Signal Feed: Replace existing alerts for this supplier with the latest data
    setAlerts(prev => {
      const otherAlerts = prev.filter(a => a.supplierId !== supplier.id);
      
      // If the node is now Stable (Green), we remove the active alert from the feed
      if (analysis.status === RiskLevel.GREEN) {
        return otherAlerts;
      }

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
    refreshAll();
  }, [suppliers.length, refreshAll]);

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
      return matchesSearch && matchesStatus;
    });
  }, [suppliers, searchQuery, statusFilter, analyses]);

  const dashboardStats = {
    total: suppliers.length,
    high: (Object.values(analyses) as RiskAnalysis[]).filter(a => a.status === RiskLevel.RED).length,
    caution: (Object.values(analyses) as RiskAnalysis[]).filter(a => a.status === RiskLevel.YELLOW).length,
    safe: (Object.values(analyses) as RiskAnalysis[]).filter(a => a.status === RiskLevel.GREEN).length,
  };

  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        alertCount={alerts.length}
      />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 w-full">
        {activeTab === 'dashboard' && (
          <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
            {/* Identity Banner */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl">
              {!companyInfo || isEditingCompany ? (
                <form onSubmit={saveCompany} className="p-6 md:p-8 flex flex-col md:flex-row md:items-end gap-6 items-stretch">
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Enterprise Entity</label>
                    <input required name="companyName" defaultValue={companyInfo?.name} className="w-full px-5 py-3 bg-slate-100 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-slate-900 font-semibold" placeholder="Enter Company Name" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Headquarters Coordinates</label>
                    <input required name="hqLocation" defaultValue={companyInfo?.location} className="w-full px-5 py-3 bg-slate-100 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-slate-900 font-semibold" placeholder="e.g. London, UK" />
                  </div>
                  <button className="w-full md:w-auto px-10 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:bg-indigo-700 h-[46px] md:h-[50px] flex items-center justify-center">Save Identity</button>
                </form>
              ) : (
                <div className="p-6 md:p-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-950 rounded-2xl flex items-center justify-center text-white border border-slate-800 relative">
                      <div className="absolute inset-0 rounded-2xl bg-indigo-500/10 animate-pulse"></div>
                      <svg className="w-6 h-6 md:w-7 md:h-7 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-black text-white">{companyInfo.name}</h2>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Operational HQ: {companyInfo.location}</p>
                    </div>
                  </div>
                  <button onClick={() => setIsEditingCompany(true)} className="w-full sm:w-auto text-[10px] font-black text-slate-500 border border-slate-800 px-4 py-2 rounded-full hover:text-indigo-400 transition-all">Update Profile</button>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-800"><p className="text-slate-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest">Global Nodes</p><p className="text-2xl md:text-3xl font-black mt-1">{dashboardStats.total}</p></div>
              <div className="bg-rose-950/20 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-rose-900/30"><p className="text-rose-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest">Risky</p><p className="text-2xl md:text-3xl font-black text-rose-500 mt-1">{dashboardStats.high}</p></div>
              <div className="bg-amber-950/20 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-amber-900/30"><p className="text-amber-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest">Caution</p><p className="text-2xl md:text-3xl font-black text-amber-500 mt-1">{dashboardStats.caution}</p></div>
              <div className="bg-emerald-950/20 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-emerald-900/30"><p className="text-emerald-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest">Stable</p><p className="text-2xl md:text-3xl font-black text-emerald-500 mt-1">{dashboardStats.safe}</p></div>
            </div>

            {/* Map & Signal Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-base md:text-lg font-bold text-white uppercase tracking-tight">Tactical Radar</h2>
                  <button onClick={refreshAll} disabled={isRefreshing} className="text-indigo-400 text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    {isRefreshing ? 'Scanning...' : 'Initiate Full Scan'}
                    <svg className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                  </button>
                </div>
                <div className="bg-slate-900 h-[350px] md:h-[500px] rounded-2xl md:rounded-[3rem] relative overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner group">
                  {companyInfo && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                      {suppliers.map((s, idx) => {
                        const status = analyses[s.id]?.status || RiskLevel.GREEN;
                        const color = status === RiskLevel.RED ? '#ef4444' : status === RiskLevel.YELLOW ? '#f59e0b' : '#10b981';
                        const sX = (idx % 2 === 0 ? 15 : 75) + (idx * 5);
                        const sY = 20 + (idx * 25);
                        return (
                          <line key={`line-${s.id}`} x1="50%" y1="45%" x2={`${sX}%`} y2={`${sY}%`} stroke={color} strokeWidth="2" strokeOpacity="0.35" className="transition-all duration-1000" />
                        );
                      })}
                    </svg>
                  )}
                  {companyInfo && (
                    <div className="absolute w-10 h-10 md:w-12 md:h-12 rounded-full cursor-default border-2 border-indigo-400 shadow-[0_0_30px_rgba(129,140,248,0.4)] z-30 flex items-center justify-center bg-slate-950 transition-all duration-500" style={{ top: '45%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                      <div className="absolute inset-0 rounded-full animate-ping bg-indigo-500/20 opacity-75"></div>
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                      <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-indigo-600 px-3 py-1.5 rounded-xl shadow-2xl whitespace-nowrap border border-indigo-400">
                        <p className="text-[8px] font-black text-white uppercase tracking-widest text-center">{companyInfo.name}</p>
                        <p className="text-[7px] font-bold text-indigo-100 uppercase tracking-tighter opacity-80 text-center">Operational HQ</p>
                      </div>
                    </div>
                  )}
                  {suppliers.map((s, idx) => {
                    const status = analyses[s.id]?.status || RiskLevel.GREEN;
                    const posX = (idx % 2 === 0 ? 15 : 75) + (idx * 5);
                    const posY = 20 + (idx * 25);
                    return (
                      <div key={s.id} onClick={() => setSelectedSupplierId(s.id)} className="absolute w-6 h-6 md:w-8 md:h-8 rounded-full cursor-pointer border-2 border-slate-950 shadow-2xl transition-all hover:scale-125 z-20 group/pin" style={{ top: `${posY}%`, left: `${posX}%`, transform: 'translate(-50%, -50%)', backgroundColor: status === RiskLevel.RED ? '#ef4444' : status === RiskLevel.YELLOW ? '#f59e0b' : '#10b981' }}>
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-800 px-2 py-1 rounded-lg shadow-2xl whitespace-nowrap group-hover/pin:border-indigo-500 transition-colors pointer-events-none">
                          <p className="text-[8px] font-black text-white uppercase tracking-widest text-center">{s.name}</p>
                          <p className="text-[7px] font-bold text-slate-500 uppercase tracking-tight text-center">{s.location}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-base md:text-lg font-bold text-white uppercase tracking-tight">Signal Feed</h2>
                <div className="bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-800 h-[350px] md:h-[500px] overflow-y-auto divide-y divide-slate-800 shadow-2xl">
                  {alerts.map(alert => (
                    <div key={alert.id} className="p-4 md:p-5 hover:bg-slate-800/50 cursor-pointer transition-colors" onClick={() => setSelectedSupplierId(alert.supplierId)}>
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest">{alert.supplierName}</p>
                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${alert.severity === RiskLevel.RED ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                      </div>
                      <p className="text-[10px] md:text-xs text-slate-300 font-semibold leading-relaxed line-clamp-2">"{alert.message}"</p>
                      <div className="mt-3 flex justify-between items-center">
                        <RiskBadge level={alert.severity} />
                        <span className="text-[8px] md:text-[9px] text-slate-600 font-bold">{new Date(alert.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>
                  ))}
                  {alerts.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-40">
                      <svg className="w-10 h-10 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      <p className="text-[10px] font-black uppercase tracking-widest">No active alerts</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'suppliers' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div><h2 className="text-xl md:text-2xl font-black text-white">Network Registry</h2><p className="text-slate-400 text-xs md:text-sm">Monitoring Global Logistics Nodes</p></div>
              <button onClick={() => setIsAddingSupplier(true)} className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-900/20 hover:bg-indigo-700 transition-all">Register New Node</button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 bg-slate-900/50 p-3 md:p-4 rounded-2xl border border-slate-800 backdrop-blur-md items-center">
              <div className="relative w-full md:flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <input
                  type="text"
                  placeholder="Filter nodes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-semibold text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div className="flex gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto w-full md:w-auto">
                {(['ALL', RiskLevel.GREEN, RiskLevel.YELLOW, RiskLevel.RED] as const).map((lvl) => {
                  const label = lvl === 'ALL' ? 'Unified' : lvl === RiskLevel.GREEN ? 'Stable' : lvl === RiskLevel.YELLOW ? 'Caution' : 'Risky';
                  return (
                    <button key={lvl} onClick={() => setStatusFilter(lvl)} className={`whitespace-nowrap px-4 py-2 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === lvl ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-slate-950/50 border-b border-slate-800">
                    <tr>
                      <th className="px-6 md:px-8 py-5 md:py-6 text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">Node Identity</th>
                      <th className="px-6 md:px-8 py-5 md:py-6 text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">Locale</th>
                      <th className="px-6 md:px-8 py-5 md:py-6 text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                      <th className="px-6 md:px-8 py-5 md:py-6 text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredSuppliers.length > 0 ? (
                      filteredSuppliers.map(s => (
                        <tr key={s.id} className="hover:bg-slate-800/30 group transition-colors">
                          <td className="px-6 md:px-8 py-5 md:py-6">
                            <div className="flex items-center gap-3 md:gap-4">
                              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800 text-xs font-black text-indigo-400">
                                {s.name.substring(0, 1)}
                              </div>
                              <span className="font-bold text-slate-100 text-sm">{s.name}</span>
                            </div>
                          </td>
                          <td className="px-6 md:px-8 py-5 md:py-6 text-[10px] text-slate-400 font-bold uppercase tracking-wide">{s.location}</td>
                          <td className="px-6 md:px-8 py-5 md:py-6">
                            {analyses[s.id] ? (
                              <RiskBadge level={analyses[s.id].status} />
                            ) : (
                              <div className="animate-spin h-3 w-3 border-2 border-indigo-500 border-t-transparent rounded-full" />
                            )}
                          </td>
                          <td className="px-6 md:px-8 py-5 md:py-6 text-right">
                            <button onClick={() => setSelectedSupplierId(s.id)} className="text-indigo-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-indigo-900/50 px-3 md:px-5 py-2 rounded-xl hover:bg-indigo-900/20 hover:border-indigo-500 transition-all">Assess Risk</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">No nodes found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl md:text-2xl font-black text-white">Disruption Intelligence</h2>
            <div className="grid gap-4">
              {alerts.length > 0 ? (
                alerts.map(alert => (
                  <div key={alert.id} className={`bg-slate-900 border rounded-2xl md:rounded-3xl p-6 md:p-8 hover:border-indigo-500 cursor-pointer transition-all shadow-2xl ${alert.severity === RiskLevel.RED ? 'border-red-900/50 bg-red-950/5' : 'border-slate-800'}`} onClick={() => setSelectedSupplierId(alert.supplierId)}>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center ${alert.severity === RiskLevel.RED ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'}`}>
                           <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        </div>
                        <div>
                          <h3 className="font-black text-white text-lg md:text-xl">{alert.supplierName}</h3>
                          <p className="text-[9px] md:text-[10px] text-slate-500 uppercase font-bold tracking-widest">{new Date(alert.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                      <RiskBadge level={alert.severity} />
                    </div>
                    <p className="text-slate-200 text-base md:text-lg font-semibold italic">"{alert.message}"</p>
                  </div>
                ))
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl py-20 text-center flex flex-col items-center shadow-2xl">
                  <h3 className="text-lg font-black text-white uppercase tracking-[0.2em]">Safe Environment</h3>
                  <p className="text-slate-500 max-w-sm text-sm mt-2">No disruptive feeds detected. Chain is verified stable.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {selectedSupplierId && selectedSupplier && (
        <SupplierDetailModal supplier={selectedSupplier} analysis={analyses[selectedSupplierId]} onClose={() => setSelectedSupplierId(null)} />
      )}
      {isAddingSupplier && (
        <SupplierForm onAdd={handleAddSupplier} onClose={() => setIsAddingSupplier(false)} />
      )}

      <footer className="bg-slate-950 border-t border-slate-900 py-10 md:py-16 text-center">
        <p className="text-slate-600 text-[8px] md:text-[10px] font-black uppercase tracking-[0.5em] px-4">ChainGuard Protocol &bull; Secure Enterprise Logistics &bull; Intelligence Grounded</p>
      </footer>
    </div>
  );
};

export default App;