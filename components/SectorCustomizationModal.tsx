
import React, { useState } from 'react';
import { SupplierCategory, ALL_CATEGORIES } from '../types';

interface SectorCustomizationModalProps {
  visibleSectors: SupplierCategory[];
  onSave: (sectors: SupplierCategory[]) => void;
  onClose: () => void;
}

const SectorCustomizationModal: React.FC<SectorCustomizationModalProps> = ({ visibleSectors, onSave, onClose }) => {
  const [selected, setSelected] = useState<SupplierCategory[]>(visibleSectors);
  const [search, setSearch] = useState('');

  const toggleSector = (cat: SupplierCategory) => {
    setSelected(prev => 
      prev.includes(cat) ? prev.filter(s => s !== cat) : [...prev, cat]
    );
  };

  const filteredCategories = ALL_CATEGORIES.filter(cat => 
    cat.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
        <div className="px-10 py-8 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Configure Channels</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Sector Visibility Settings</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-2 bg-slate-800 rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Filter sectors..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-5 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-slate-100 font-semibold text-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredCategories.map(cat => (
              <label 
                key={cat} 
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group ${
                  selected.includes(cat) 
                    ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-lg shadow-indigo-900/10' 
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
                }`}
              >
                <span className="text-xs font-black uppercase tracking-widest">{cat}</span>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={selected.includes(cat)} 
                  onChange={() => toggleSector(cat)} 
                />
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  selected.includes(cat) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-700'
                }`}>
                  {selected.includes(cat) && (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  )}
                </div>
              </label>
            ))}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-4 text-[10px] font-black text-slate-500 border border-slate-800 rounded-2xl hover:bg-slate-800 transition-all uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(selected)}
              className="flex-1 px-6 py-4 text-[10px] font-black text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/20 uppercase tracking-widest"
            >
              Commit Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectorCustomizationModal;
