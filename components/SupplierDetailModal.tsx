
import React from 'react';
import { Supplier, RiskAnalysis, RiskLevel } from '../types';
import RiskBadge from './RiskBadge';

interface Props {
  supplier: Supplier;
  analysis?: RiskAnalysis;
  onClose: () => void;
}

const SupplierDetailModal: React.FC<Props> = ({ supplier, analysis, onClose }) => {
  const isStable = analysis?.status === RiskLevel.GREEN;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300">
        <div className={`relative p-10 overflow-hidden border-b border-slate-800 ${isStable ? 'bg-emerald-950/20' : 'bg-slate-950'}`}>
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          
          <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors z-20 bg-slate-900 p-2 rounded-full border border-slate-800">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>

          <div className="flex items-center gap-8 relative z-10">
            {/* Perfectly aligned avatar */}
            <div className={`w-20 h-20 rounded-[1.5rem] flex-shrink-0 flex items-center justify-center text-white text-3xl font-black border-2 shadow-2xl ${isStable ? 'bg-emerald-600 border-emerald-400/30 shadow-emerald-900/40' : 'bg-indigo-600 border-indigo-400/30 shadow-indigo-900/40'}`}>
              {supplier.name.charAt(0)}
            </div>
            <div className="flex-grow">
              <div className="flex items-center gap-4 flex-wrap">
                <h2 className="text-3xl font-black text-white tracking-tight">{supplier.name}</h2>
                <RiskBadge level={analysis?.status || RiskLevel.GREEN} />
                {isStable && (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 font-black uppercase tracking-widest">Safe Zone Verified</span>
                )}
              </div>
              <p className="text-indigo-400 text-sm font-bold uppercase tracking-[0.25em] mt-2">{supplier.location} &bull; {supplier.category}</p>
            </div>
          </div>
        </div>

        <div className="p-10 space-y-12 max-h-[70vh] overflow-y-auto">
          {analysis ? (
            <>
              {/* Executive Summary */}
              <section className="space-y-4">
                <div className="flex justify-between items-end">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Intelligence Brief</h3>
                  {isStable && <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Optimal Node Health</span>}
                </div>
                <div className={`p-8 rounded-3xl border shadow-inner ${isStable ? 'bg-emerald-950/10 border-emerald-900/30' : 'bg-slate-950 border-slate-800'}`}>
                  <p className={`text-xl leading-relaxed font-semibold italic ${isStable ? 'text-emerald-50' : 'text-slate-100'}`}>
                    "{analysis.summary}"
                  </p>
                </div>
              </section>

              {/* Data Blocks */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-5">
                  <div className="flex items-center gap-4 text-indigo-400">
                    <div className="p-2.5 bg-indigo-950/50 rounded-xl border border-indigo-900/30">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path></svg>
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-[0.3em]">Weather Telemetry</h3>
                  </div>
                  <div className={`text-sm leading-relaxed border p-6 rounded-2xl shadow-lg ${isStable ? 'bg-emerald-950/5 border-emerald-900/20 text-emerald-100/80' : 'bg-slate-950/50 border-slate-800 text-slate-300'}`}>
                    {analysis.weatherDetails}
                  </div>
                </div>
                <div className="space-y-5">
                  <div className={`flex items-center gap-4 ${isStable ? 'text-emerald-400' : 'text-rose-400'}`}>
                    <div className={`p-2.5 rounded-xl border ${isStable ? 'bg-emerald-950/50 border-emerald-900/30' : 'bg-rose-950/50 border-rose-900/30'}`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 4v4h4"></path></svg>
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-[0.3em]">Signal Intelligence</h3>
                  </div>
                  <div className={`text-sm leading-relaxed border p-6 rounded-2xl shadow-lg ${isStable ? 'bg-emerald-950/5 border-emerald-900/20 text-emerald-100/80' : 'bg-slate-950/50 border-slate-800 text-slate-300'}`}>
                    {analysis.newsDetails}
                  </div>
                </div>
              </section>

              {/* Action Suggestion for Stable Nodes */}
              {isStable && (
                <div className="bg-emerald-950/20 border border-emerald-900/50 p-6 rounded-[2rem] flex items-center gap-6">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-emerald-400 uppercase tracking-widest">Procurement Verified</h4>
                    <p className="text-xs text-emerald-200/60 font-medium mt-1">This node is verified stable. It is safe for the company to proceed with order placements and logistics scheduling.</p>
                  </div>
                </div>
              )}

              {/* Geographic Context (Maps Grounding) */}
              {analysis.mapInsights && (
                <section className="space-y-6 border-t border-slate-800 pt-10">
                  <div className="flex items-center gap-3 text-emerald-400">
                    <div className="p-2 bg-emerald-950/50 rounded-lg border border-emerald-900/30">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-[0.3em]">Logistics Infrastructure</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="p-6 bg-emerald-950/10 rounded-2xl border border-emerald-900/20 text-xs text-slate-400 leading-relaxed font-medium tracking-wide">
                      {analysis.mapInsights.summary}
                    </div>
                    <div className="space-y-3">
                      {analysis.mapInsights.links.map((link, i) => (
                        <a 
                          key={i} 
                          href={link.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 text-[11px] bg-slate-950 border border-slate-800 rounded-xl hover:bg-slate-800 hover:border-emerald-500 transition-all group shadow-xl"
                        >
                          <span className="font-bold text-slate-400 group-hover:text-emerald-400 uppercase tracking-widest">{link.title}</span>
                          <svg className="w-4 h-4 text-slate-600 group-hover:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                        </a>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Source Verification */}
              {analysis.sources.length > 0 && (
                <div className="space-y-6 pt-6 border-t border-slate-800">
                  <h4 className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em]">Consolidated Grounding Points</h4>
                  <div className="flex flex-wrap gap-3">
                    {analysis.sources.map((source, i) => (
                      <a 
                        key={i} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold bg-slate-950 text-slate-500 px-4 py-2 rounded-full hover:border-indigo-500 hover:text-indigo-400 transition-all border border-slate-800 shadow-xl"
                      >
                        {source.title.length > 35 ? source.title.substring(0, 35) + '...' : source.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center text-[9px] text-slate-600 font-bold uppercase tracking-[0.3em] pt-6">
                <span>Verification Timestamp: {new Date(analysis.lastUpdated).toISOString()}</span>
                <span>System: Grounded Insight Engine v3.4</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-slate-600">
               <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-800 border-t-indigo-500 shadow-2xl mb-8"></div>
               <p className="text-sm font-bold text-white uppercase tracking-[0.2em]">Synchronizing Data Channels</p>
               <p className="text-xs mt-2 text-slate-500">Mapping strategic and geospatial intelligence feeds...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierDetailModal;
