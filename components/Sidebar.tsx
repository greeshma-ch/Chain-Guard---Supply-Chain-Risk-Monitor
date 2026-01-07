
import React, { useState } from 'react';
import { SupplierCategory } from '../types';

interface SidebarProps {
  activeTab: 'dashboard' | 'suppliers' | 'alerts' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'suppliers' | 'alerts' | 'settings') => void;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  alertCount: number;
  visibleSectors: SupplierCategory[];
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  onOpenCustomization: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onLogout, 
  isOpen,
  setIsOpen,
  alertCount, 
  visibleSectors, 
  categoryFilter,
  setCategoryFilter,
  onOpenCustomization
}) => {
  const [isSectorsExpanded, setIsSectorsExpanded] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Tactical Overview', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
    )},
    { id: 'suppliers', label: 'Network Registry', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
    )},
    { id: 'alerts', label: 'Intelligence Feed', icon: (
      <div className="relative">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
        {alertCount > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>}
      </div>
    )},
    { id: 'settings', label: 'Operational HQ', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
    )}
  ];

  const handleSectorClick = (sector: SupplierCategory) => {
    setCategoryFilter(sector);
    setActiveTab('suppliers');
  };

  const displayedSectors = isSectorsExpanded ? visibleSectors : visibleSectors.slice(0, 3);

  return (
    <>
      {/* Overlay Backdrop for Mobile */}
      <div 
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Container */}
      <aside className={`fixed lg:sticky top-0 left-0 bottom-0 w-72 bg-slate-900 border-r border-slate-800 flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-xl font-black text-white tracking-tight uppercase">ChainGuard</h1>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 text-slate-500 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <nav className="flex-grow p-6 space-y-8 overflow-y-auto custom-scrollbar">
          <div>
            <p className="px-4 text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Command Center</p>
            <div className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    if (item.id !== 'suppliers') setCategoryFilter('ALL');
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                    activeTab === item.id 
                      ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <span className={`${activeTab === item.id ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                    {item.icon}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="px-4 flex justify-between items-center mb-4 group cursor-pointer" onClick={() => setIsSectorsExpanded(!isSectorsExpanded)}>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Strategic Sectors</p>
              <svg className={`w-3 h-3 text-slate-600 transition-transform duration-300 ${isSectorsExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
            <div className="space-y-1">
              {displayedSectors.map((sector) => (
                <button
                  key={sector}
                  onClick={() => handleSectorClick(sector)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-left transition-all duration-200 group ${
                    categoryFilter === sector && activeTab === 'suppliers'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner shadow-emerald-950/20' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest">{sector}</span>
                  <span className={`w-1.5 h-1.5 rounded-full transition-all ${categoryFilter === sector && activeTab === 'suppliers' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-slate-700 opacity-0 group-hover:opacity-100'}`}></span>
                </button>
              ))}
              {visibleSectors.length > 3 && !isSectorsExpanded && (
                <button 
                  onClick={() => setIsSectorsExpanded(true)}
                  className="w-full px-4 py-2.5 text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-indigo-400 text-left transition-colors"
                >
                  + {visibleSectors.length - 3} More Sectors
                </button>
              )}
            </div>
          </div>
        </nav>

        <div className="p-6 border-t border-slate-800 space-y-3">
          <button 
            onClick={onOpenCustomization}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-2xl text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50 transition-all group"
          >
            <span className="text-[10px] font-black uppercase tracking-widest">Customize Sectors</span>
            <svg className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </button>
          
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-between px-4 py-3 text-slate-500 hover:text-rose-400 transition-colors"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-left">Terminate Session</span>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
