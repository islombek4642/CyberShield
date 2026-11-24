import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface AttackDistributionChartProps {
  distribution: Record<string, number>;
}

export const AttackDistributionChart: React.FC<AttackDistributionChartProps> = ({ distribution }) => {
  const labels = Object.keys(distribution);
  const counts = Object.values(distribution);

  const colors = [
    '#6366f1', // Indigo
    '#f43f5e', // Rose
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#06b6d4', // Cyan
    '#8b5cf6', // Purple
  ];

  const data = {
    labels: labels.length ? labels : ['No Threats Detected'],
    datasets: [
      {
        data: counts.length ? counts : [1],
        backgroundColor: labels.length ? colors.slice(0, labels.length) : ['#334155'],
        borderColor: '#0f172a',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#94a3b8',
          boxWidth: 12,
          padding: 12,
        },
      },
    },
    cutout: '68%',
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur">
      <h2 className="text-base font-bold text-white mb-1">Threat Class Breakdown</h2>
      <p className="text-xs text-slate-400 mb-4">Categorized by Machine Learning Intrusion Detector</p>
      <div className="h-64 flex items-center justify-center">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
};
