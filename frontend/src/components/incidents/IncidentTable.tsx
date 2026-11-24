import React from 'react';
import { Incident } from '../../types';
import { Check, Eye, XCircle } from 'lucide-react';

interface IncidentTableProps {
  incidents: Incident[];
  onStatusChange: (id: number, newStatus: string) => void;
}

export const IncidentTable: React.FC<IncidentTableProps> = ({ incidents, onStatusChange }) => {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'IN_REVIEW':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'RESOLVED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl backdrop-blur">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-slate-800/60 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
          <tr>
            <th className="py-3 px-4">ID</th>
            <th className="py-3 px-4">Timestamp</th>
            <th className="py-3 px-4">Threat Type</th>
            <th className="py-3 px-4">Severity</th>
            <th className="py-3 px-4">Source &rarr; Target</th>
            <th className="py-3 px-4">Confidence</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-mono">
          {incidents.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-8 text-center text-slate-500 font-sans">
                Hozircha hech qanday shubhali xuruj qayd etilmagan.
              </td>
            </tr>
          ) : (
            incidents.map((inc) => (
              <tr key={inc.id} className="hover:bg-slate-800/40 transition">
                <td className="py-3 px-4 font-bold text-slate-400">#{inc.id}</td>
                <td className="py-3 px-4 text-slate-400">
                  {new Date(inc.timestamp).toLocaleTimeString()}
                </td>
                <td className="py-3 px-4 font-semibold text-white">
                  {inc.attack_type}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${getSeverityBadge(inc.severity)}`}>
                    {inc.severity}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-300">
                  <span className="text-indigo-400">{inc.source_ip}</span> : {inc.dest_port}
                </td>
                <td className="py-3 px-4">
                  <span className="text-emerald-400 font-bold">{Math.round(inc.confidence * 100)}%</span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getStatusBadge(inc.status)}`}>
                    {inc.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1 font-sans">
                    {inc.status !== 'RESOLVED' && (
                      <button
                        onClick={() => onStatusChange(inc.id, 'RESOLVED')}
                        className="p-1 rounded hover:bg-emerald-500/20 text-emerald-400 transition"
                        title="Resolve (Tekshirildi)"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    {inc.status === 'NEW' && (
                      <button
                        onClick={() => onStatusChange(inc.id, 'IN_REVIEW')}
                        className="p-1 rounded hover:bg-amber-500/20 text-amber-400 transition"
                        title="Mark in Review"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    {inc.status !== 'FALSE_POSITIVE' && (
                      <button
                        onClick={() => onStatusChange(inc.id, 'FALSE_POSITIVE')}
                        className="p-1 rounded hover:bg-slate-500/20 text-slate-400 transition"
                        title="False Positive"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
