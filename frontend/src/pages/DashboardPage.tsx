import React from 'react';
import { Play, Pause, Zap, Database } from 'lucide-react';
import { KpiCards } from '../components/dashboard/KpiCards';
import { TrafficChart } from '../components/dashboard/TrafficChart';
import { AttackDistributionChart } from '../components/dashboard/AttackDistributionChart';
import { IncidentTable } from '../components/incidents/IncidentTable';
import { Incident, IncidentSummary } from '../types';

interface DashboardPageProps {
  summary: IncidentSummary | null;
  livePacketsCount: number;
  trafficHistory: Array<{ time: string; pps: number; isAttack: boolean }>;
  attackDistribution: Record<string, number>;
  recentIncidents: Incident[];
  isStreamRunning: boolean;
  streamSpeed: number;
  currentDataset: string;
  onToggleStream: () => void;
  onChangeSpeed: (speed: number) => void;
  onChangeDataset: (ds: string) => void;
  onStatusChange: (id: number, newStatus: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  summary,
  livePacketsCount,
  trafficHistory,
  attackDistribution,
  recentIncidents,
  isStreamRunning,
  streamSpeed,
  currentDataset,
  onToggleStream,
  onChangeSpeed,
  onChangeDataset,
  onStatusChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Stream Control Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleStream}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition ${
              isStreamRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/20'
            }`}
          >
            {isStreamRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isStreamRunning ? 'Pause Stream' : 'Start Live Stream'}
          </button>

          <div className="flex items-center gap-1 bg-slate-800/60 p-1 rounded-xl border border-slate-800">
            {[1, 2, 5].map((s) => (
              <button
                key={s}
                onClick={() => onChangeSpeed(s)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  streamSpeed === s
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-400" />
          <span className="text-xs text-slate-400">Stream Dataset:</span>
          <select
            value={currentDataset}
            onChange={(e) => onChangeDataset(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="CIC-IDS2017">CIC-IDS2017 (DDoS, PortScan, Botnet)</option>
            <option value="UNSW-NB15">UNSW-NB15 (Exploits, DoS, Generic)</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <KpiCards summary={summary} livePacketsCount={livePacketsCount} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TrafficChart history={trafficHistory} />
        </div>
        <div>
          <AttackDistributionChart distribution={attackDistribution} />
        </div>
      </div>

      {/* Recent Incidents Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Recent Security Incidents</h2>
            <p className="text-xs text-slate-400">Latest detected anomalous flows requiring review</p>
          </div>
        </div>
        <IncidentTable incidents={recentIncidents} onStatusChange={onStatusChange} />
      </div>
    </div>
  );
};
