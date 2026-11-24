import React from 'react';
import { Activity, ShieldAlert, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { IncidentSummary } from '../../types';

interface KpiCardsProps {
  summary: IncidentSummary | null;
  livePacketsCount: number;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ summary, livePacketsCount }) => {
  const cards = [
    {
      title: 'Real-time Packets',
      value: livePacketsCount.toLocaleString(),
      subtext: 'Processed NetFlow streams',
      icon: Activity,
      color: 'indigo',
    },
    {
      title: 'Total Incidents',
      value: summary ? summary.total_incidents.toLocaleString() : '0',
      subtext: `${summary ? summary.new : 0} unreviewed alerts`,
      icon: ShieldAlert,
      color: 'amber',
    },
    {
      title: 'Critical Threats',
      value: summary ? summary.critical.toLocaleString() : '0',
      subtext: 'Immediate action required',
      icon: AlertOctagon,
      color: 'rose',
    },
    {
      title: 'Resolved / Verified',
      value: summary ? summary.resolved.toLocaleString() : '0',
      subtext: 'Audited by security team',
      icon: CheckCircle2,
      color: 'emerald',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl bg-${card.color}-500/10 text-${card.color}-400 border border-${card.color}-500/20`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-white tracking-tight">{card.value}</div>
              <div className="text-xs text-slate-500 mt-1">{card.subtext}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
