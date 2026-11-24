import React, { useState } from 'react';
import { IncidentTable } from '../components/incidents/IncidentTable';
import { Incident } from '../types';
import { Filter, Download } from 'lucide-react';

interface IncidentsPageProps {
  incidents: Incident[];
  onStatusChange: (id: number, newStatus: string) => void;
}

export const IncidentsPage: React.FC<IncidentsPageProps> = ({ incidents, onStatusChange }) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  const filtered = incidents.filter((inc) => {
    if (statusFilter !== 'ALL' && inc.status !== statusFilter) return false;
    if (severityFilter !== 'ALL' && inc.severity !== severityFilter) return false;
    return true;
  });

  const exportCSV = () => {
    const headers = ['ID,Timestamp,Threat,Severity,Source,TargetPort,Confidence,Status'];
    const rows = filtered.map(
      (i) => `${i.id},${i.timestamp},${i.attack_type},${i.severity},${i.source_ip},${i.dest_port},${i.confidence},${i.status}`
    );
    const blob = new Blob([[headers.join('\n'), ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cybershield_incidents_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white">Incident Response & SIEM Explorer</h1>
          <p className="text-xs text-slate-400">Inspect, investigate and resolve security events</p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition"
        >
          <Download className="w-4 h-4" /> Export CSV Report
        </button>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Filter className="w-4 h-4 text-indigo-400" />
          <span>Status Filter:</span>
        </div>
        <div className="flex items-center gap-1 bg-slate-800/60 p-1 rounded-xl">
          {['ALL', 'NEW', 'IN_REVIEW', 'RESOLVED', 'FALSE_POSITIVE'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                statusFilter === st ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-slate-400 ml-auto">
          <span>Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1 focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Only</option>
            <option value="MEDIUM">Medium Only</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <IncidentTable incidents={filtered} onStatusChange={onStatusChange} />
    </div>
  );
};
