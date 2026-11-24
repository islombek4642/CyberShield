import React from 'react';
import { MLMetrics } from '../../types';

interface ConfusionMatrixViewProps {
  metrics: MLMetrics | null;
}

export const ConfusionMatrixView: React.FC<ConfusionMatrixViewProps> = ({ metrics }) => {
  if (!metrics || !metrics.confusion_matrix) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-900/60 rounded-2xl border border-slate-800">
        Model metrikalari yuklanmoqda...
      </div>
    );
  }

  const { labels, matrix } = metrics.confusion_matrix;

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Model Evaluation & Confusion Matrix
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              {metrics.dataset_type}
            </span>
          </h2>
          <p className="text-xs text-slate-400">Random Forest Classifier performance analysis</p>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-4 gap-3 text-center">
          <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Accuracy</div>
            <div className="text-lg font-black text-indigo-400">{(metrics.accuracy * 100).toFixed(1)}%</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Precision</div>
            <div className="text-lg font-black text-emerald-400">{(metrics.precision * 100).toFixed(1)}%</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Recall</div>
            <div className="text-lg font-black text-rose-400">{(metrics.recall * 100).toFixed(1)}%</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="text-[10px] uppercase font-semibold text-slate-400">F1-Score</div>
            <div className="text-lg font-black text-amber-400">{(metrics.f1_score * 100).toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Heatmap Matrix Table */}
      <div className="overflow-x-auto">
        <div className="text-xs font-semibold text-slate-400 mb-2">Confusion Matrix (Predicted vs Actual):</div>
        <table className="w-full text-center text-xs font-mono">
          <thead>
            <tr>
              <th className="p-2 text-left text-slate-500 font-sans">Actual \ Predicted</th>
              {labels.map((lbl, idx) => (
                <th key={idx} className="p-2 text-slate-400 font-semibold">{lbl}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, rIdx) => (
              <tr key={rIdx} className="border-t border-slate-800/60">
                <td className="p-2 text-left font-semibold text-slate-300 font-sans">{labels[rIdx]}</td>
                {row.map((val, cIdx) => {
                  const isDiagonal = rIdx === cIdx;
                  return (
                    <td
                      key={cIdx}
                      className={`p-2.5 font-bold rounded transition ${
                        isDiagonal
                          ? val > 0
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-slate-800/40 text-slate-500'
                          : val > 0
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'text-slate-600'
                      }`}
                    >
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Top Features */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 mb-2">Top Discriminative NetFlow Features:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {metrics.feature_importance.slice(0, 8).map((feat, idx) => (
            <div key={idx} className="p-2 rounded-lg bg-slate-800/40 border border-slate-800 text-xs flex justify-between">
              <span className="text-slate-300 truncate">{feat.feature}</span>
              <span className="text-indigo-400 font-mono font-bold">{(feat.importance * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
