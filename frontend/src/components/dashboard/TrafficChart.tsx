import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

interface TrafficChartProps {
  history: Array<{ time: string; pps: number; isAttack: boolean }>;
}

export const TrafficChart: React.FC<TrafficChartProps> = ({ history }) => {
  const labels = history.map((h) => h.time);
  const dataValues = history.map((h) => h.pps);

  const data = {
    labels,
    datasets: [
      {
        fill: true,
        label: 'Flow Packets / sec',
        data: dataValues,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        tension: 0.35,
        pointRadius: 2,
        pointBackgroundColor: history.map((h) => (h.isAttack ? '#f43f5e' : '#6366f1')),
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(51, 65, 85, 0.2)' },
        ticks: { color: '#64748b', maxTicksLimit: 8 },
      },
      y: {
        grid: { color: 'rgba(51, 65, 85, 0.2)' },
        ticks: { color: '#64748b' },
      },
    },
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-white">Live NetFlow Traffic Dynamics</h2>
          <p className="text-xs text-slate-400">Incoming flow volume and real-time anomaly spike detection</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-indigo-400">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Normal Flow
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Anomaly / Attack Spike
          </span>
        </div>
      </div>
      <div className="h-64">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};
