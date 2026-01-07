
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

  const exportCSV = () => {
    if (!analysis) return;
    const headers = ['Category', 'Field', 'Value'];
    const data = [
      ['General', 'Supplier Name', supplier.name],
      ['General', 'Location', supplier.location],
      ['General', 'Category', supplier.category],
      ['Risk', 'Status', analysis.status],
      ['Risk', 'Last Updated', analysis.lastUpdated],
      ['Brief', 'Executive Summary', analysis.summary.replace(/"/g, '""')],
      ['Brief', 'Weather Telemetry', analysis.weatherDetails.replace(/"/g, '""')],
      ['Brief', 'Signal Intelligence', analysis.newsDetails.replace(/"/g, '""')],
      ['Logistics', 'Nearby Infrastructure', analysis.mapInsights?.summary.replace(/"/g, '""') || 'N/A'],
    ];
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + data.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ChainGuard_${supplier.name.replace(/\s+/g, '_')}_Risk_Brief.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl p-4 print:p-0 print:static print:bg-white print:text-black">
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300 print:shadow-none print:border-none print:rounded-none print:w-full print:max-w-none">
        <div className={`relative p-10 overflow-hidden border-b border-slate-800 ${isStable ? 'bg-emerald-950/20' : 'bg-slate-950/40'} print:bg-white print:border-slate-200`}>
          <div className="absolute inset-0 opacity-5 pointer-events-none print:hidden" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          
          <div className="absolute top-8 right-8 flex gap-3 z-20 print:hidden">
            <button 
              onClick={exportCSV}
              className="text-slate-300 hover:text-white transition-all bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              CSV Export
            </button>
            <button 
              onClick={handlePrint}
              className="text-slate-300 hover:text-white transition-all bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
              PDF Print
            </button>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-2 bg-slate-800 rounded-full border border-slate-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <div className="flex items-center gap-8 relative z-10 print:text-black">
            <div className={`w-20 h-20 rounded-[1.5rem] flex-shrink-0 flex items-center justify-center text-white text-3xl font-black border-2 shadow-2xl ${isStable ? 'bg-emerald-600 border-emerald-400/30 shadow-emerald-900/40' : 'bg-indigo-600 border-indigo-400/30 shadow-indigo-900/40'} print:bg-slate-200 print:text-black print:border-slate-300`}>
              {supplier.name.charAt(0)}
            </div>
            <div className="flex-grow">
              <div className="flex items-center gap-4 flex-wrap">
                <h2 className="text-3xl font-black text-white tracking-tight print:text-black">{supplier.name}</h2>
                <div className="print:block"><RiskBadge level={analysis?.status || RiskLevel.GREEN} /></div>
              </div>
              <p className="text-indigo-400 text-sm font-bold uppercase tracking-[0.25em] mt-2 print:text-slate-500">{supplier.location} &bull; {supplier.category}</p>
            </div>
          </div>
        </div>

        <div className="p-10 space-y-12 max-h-[70vh] overflow-y-auto bg-slate-900/90 print:max-h-none print:overflow-visible print:bg-white print:text-black">
          {analysis ? (
            <>
              <section className="space-y-4">
                <div className="flex justify-between items-end">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] print:text-slate-400">Intelligence Brief</h3>
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic print:text-slate-400">Analyzed {new Date(analysis.lastUpdated).toLocaleString()}</span>
                </div>
                <div className={`p-8 rounded-3xl border shadow-inner ${isStable ? 'bg-emerald-950/10 border-emerald-900/30' : 'bg-slate-950 border-slate-800'} print:bg-slate-50 print:border-slate-200 print:text-black`}>
                  <p className={`text-xl leading-relaxed font-semibold italic ${isStable ? 'text-emerald-50' : 'text-slate-100'} print:text-black`}>
                    "{analysis.summary}"
                  </p>
                </div>
              </section>

              <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-5">
                  <div className="flex items-center gap-4 text-indigo-400 print:text-black">
                    <div className="p-2.5 bg-indigo-950/50 rounded-xl border border-indigo-900/30 print:bg-slate-100 print:border-slate-200">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path></svg>
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-[0.3em]">Weather Telemetry</h3>
                  </div>
                  <div className={`text-sm leading-relaxed border p-6 rounded-2xl shadow-lg bg-slate-950/50 border-slate-800 text-slate-300 print:bg-white print:border-slate-100 print:text-slate-700 print:shadow-none`}>
                    {analysis.weatherDetails}
                  </div>
                </div>
                <div className="space-y-5">
                  <div className={`flex items-center gap-4 text-rose-400 print:text-black`}>
                    <div className={`p-2.5 rounded-xl border bg-rose-950/50 border-rose-900/30 print:bg-slate-100 print:border-slate-200`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 4v4h4"></path></svg>
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-[0.3em]">Signal Intelligence</h3>
                  </div>
                  <div className={`text-sm leading-relaxed border p-6 rounded-2xl shadow-lg bg-slate-950/50 border-slate-800 text-slate-300 print:bg-white print:border-slate-100 print:text-slate-700 print:shadow-none`}>
                    {analysis.newsDetails}
                  </div>
                </div>
              </section>

              {analysis.mapInsights && (
                <section className="space-y-6 border-t border-slate-800 pt-10 print:border-slate-200">
                  <div className="flex items-center gap-3 text-emerald-400 print:text-black">
                    <div className="p-2 bg-emerald-950/50 rounded-lg border border-emerald-900/30 print:bg-slate-100 print:border-slate-200">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-[0.3em]">Logistics Infrastructure</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="p-6 bg-slate-950/50 rounded-2xl border border-slate-800 text-xs text-slate-400 leading-relaxed font-medium tracking-wide print:bg-white print:border-slate-100 print:text-slate-600 print:shadow-none">
                      {analysis.mapInsights.summary}
                    </div>
                    <div className="space-y-3 print:hidden">
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
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-slate-600 print:hidden">
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
