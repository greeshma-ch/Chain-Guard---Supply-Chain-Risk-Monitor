
import React, { useState } from 'react';
import { Supplier, SupplierCategory } from '../types';

interface SupplierFormProps {
  onAdd: (supplier: Omit<Supplier, 'id' | 'registeredAt'>) => void;
  onClose: () => void;
}

const SupplierForm: React.FC<SupplierFormProps> = ({ onAdd, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    category: 'Electronics' as SupplierCategory
  });

  const categories: SupplierCategory[] = [
    'Electronics', 'Raw Materials', 'Logistics', 'Manufacturing', 'Textiles', 'Food & Beverage'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.location) return;
    onAdd(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
        <div className="px-10 py-8 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Register Node</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-2 bg-slate-800 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Partner Identity</label>
            <input
              autoFocus
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-slate-900 font-semibold"
              placeholder="e.g. Shenzhen Manufacturing Hub"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Geospatial Locale</label>
            <input
              required
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-slate-900 font-semibold"
              placeholder="e.g. Shanghai, China"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Supply Sector</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as SupplierCategory })}
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-slate-900 font-semibold appearance-none"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="pt-6 flex gap-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 text-xs font-black text-slate-500 border border-slate-800 rounded-2xl hover:bg-slate-800 hover:text-white transition-all uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-4 text-xs font-black text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-900/20 uppercase tracking-widest"
            >
              Authorize Node
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierForm;
