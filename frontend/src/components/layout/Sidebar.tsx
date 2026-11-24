import React from 'react';
import { LayoutDashboard, AlertTriangle, Database, Cpu, Settings } from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  unreadIncidentsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange, unreadIncidentsCount = 0 }) => {
  const menuItems = [
    { id: 'dashboard', label: 'SOC Dashboard', icon: LayoutDashboard },
    { id: 'incidents', label: 'Incidents & SIEM', icon: AlertTriangle, badge: unreadIncidentsCount },
    { id: 'datasets', label: 'Dataset Management', icon: Database },
    { id: 'models', label: 'ML Analytics', icon: Cpu },
    { id: 'settings', label: 'Settings & Bot', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/60 backdrop-blur min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Monitoring Center
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && item.badge > 0 ? (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl text-xs text-slate-400 space-y-1">
        <div className="font-semibold text-slate-300">Target Datasets:</div>
        <div className="flex items-center gap-1.5 text-indigo-400">
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span> CIC-IDS2017
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> UNSW-NB15
        </div>
      </div>
    </aside>
  );
};
