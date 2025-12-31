
import React from 'react';

interface HeaderProps {
  activeTab: 'dashboard' | 'suppliers' | 'alerts';
  setActiveTab: (tab: 'dashboard' | 'suppliers' | 'alerts') => void;
  alertCount: number;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, alertCount }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">ChainGuard</h1>
          </div>
          
          <nav className="flex space-x-1 sm:space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'dashboard' ? 'text-indigo-400 bg-indigo-950/50' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'suppliers' ? 'text-indigo-400 bg-indigo-950/50' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Suppliers
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`relative px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'alerts' ? 'text-indigo-400 bg-indigo-950/50' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Alerts
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 block h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {alertCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
