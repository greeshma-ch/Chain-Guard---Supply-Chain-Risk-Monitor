
import React, { useState } from 'react';
import { Supplier, SupplierCategory } from '../types';

interface SupplierFormProps {
  onAdd: (supplier: Omit<Supplier, 'id' | 'registeredAt'>) => void;
  onClose: () => void;
}

const SupplierForm: React.FC<SupplierFormProps> = ({ onAdd, onClose }) => {
  const [step, setStep] = useState(1);
  const [isDetecting, setIsDetecting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    category: 'Electronics' as SupplierCategory
  });

  const categories: SupplierCategory[] = [
    'Electronics', 'Raw Materials', 'Logistics', 'Manufacturing', 'Textiles', 'Food & Beverage'
  ];

  const detectLocation = () => {
    setIsDetecting(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      setIsDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          // Using Nominatim for a free, no-key-required reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
          );
          const data = await response.json();
          
          // Construct a friendly address string
          const address = data.address;
          const city = address.city || address.town || address.village || address.suburb || '';
          const state = address.state || '';
          const country = address.country || '';
          
          const resolvedLocation = [city, state, country].filter(Boolean).join(', ');
          
          setFormData(prev => ({ 
            ...prev, 
            location: resolvedLocation || `${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}` 
          }));
        } catch (error) {
          console.error("Geocoding failed:", error);
          setFormData(prev => ({ ...prev, location: `${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}` }));
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Location access denied or unavailable.");
        setIsDetecting(false);
      },
      { timeout: 10000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    if (!formData.name || !formData.location) return;
    onAdd(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
        <div className="px-10 py-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Register Node</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-2 bg-slate-800 rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-slate-800 w-full">
          <div 
            className="h-full bg-indigo-500 transition-all duration-500" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          {step === 1 && (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Node Identity</label>
              <input
                autoFocus
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-6 py-4 rounded-2xl bg-slate-950 border border-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-slate-100 font-semibold"
                placeholder="Partner or Hub Name"
              />
              <p className="text-[10px] text-slate-500 mt-4 font-medium italic">Unique identifier for the supply chain node.</p>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Geospatial Locale</label>
              <div className="relative">
                <input
                  required
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-950 border border-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-slate-100 font-semibold"
                  placeholder="e.g. Shanghai, China"
                />
                <button 
                  type="button"
                  onClick={detectLocation}
                  disabled={isDetecting}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-indigo-600/10 text-indigo-400 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600/20 transition-all"
                >
                  {isDetecting ? 'Locating...' : 'Auto-Detect'}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-4 font-medium italic">Resolves coordinates to human-readable geographic identifiers.</p>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Supply Sector</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as SupplierCategory })}
                className="w-full px-6 py-4 rounded-2xl bg-slate-950 border border-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-slate-100 font-semibold appearance-none"
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <p className="text-[10px] text-slate-500 mt-4 font-medium italic">Categorization targets industry-specific risk channels.</p>
            </div>
          )}

          <div className="pt-4 flex gap-4">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-6 py-4 text-[10px] font-black text-slate-500 border border-slate-800 rounded-2xl hover:bg-slate-800 transition-all uppercase tracking-widest"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              className="flex-1 px-6 py-4 text-[10px] font-black text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/20 uppercase tracking-widest"
            >
              {step < 3 ? 'Continue Protocol' : 'Finalize Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierForm;
