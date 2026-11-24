import React from 'react';
import { Shield, Activity, Wifi, WifiOff, LogOut, Bell } from 'lucide-react';
import { User } from '../../types';

interface NavbarProps {
  user: User | null;
  isConnected: boolean;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, isConnected, onLogout }) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
          <Shield className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-wide text-white flex items-center gap-2">
            CyberShield <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">SOC 1.0</span>
          </h1>
          <p className="text-xs text-slate-400">Intrusion Detection & Traffic Analytics Platform</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Live Stream Status */}
        <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border ${
          isConnected
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          {isConnected ? <Wifi className="w-3.5 h-3.5 animate-pulse" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span className="font-medium">{isConnected ? 'LIVE STREAM CONNECTED' : 'STREAM DISCONNECTED'}</span>
        </div>

        {/* User Info */}
        {user && (
          <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
            <div className="text-right">
              <div className="text-sm font-semibold text-slate-200">{user.username}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">{user.role}</div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
              title="Chiqish"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
