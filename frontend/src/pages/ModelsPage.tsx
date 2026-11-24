import React, { useState } from 'react';
import { ConfusionMatrixView } from '../components/ml/ConfusionMatrixView';
import { MLMetrics } from '../types';
import { RefreshCw, Play } from 'lucide-react';

interface ModelsPageProps {
  metrics: MLMetrics | null;
  onTrainModel: (dsType: string) => Promise<void>;
  currentDataset: string;
}

export const ModelsPage: React.FC<ModelsPageProps> = ({ metrics, onTrainModel, currentDataset }) => {
  const [selectedDataset, setSelectedDataset] = useState(currentDataset);
  const [isTraining, setIsTraining] = useState(false);

  const handleTrain = async () => {
    setIsTraining(true);
    try {
      await onTrainModel(selectedDataset);
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white">Machine Learning Intrusion Detection Engine</h1>
          <p className="text-xs text-slate-400">Random Forest Classifier with balanced class weighting</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedDataset}
            onChange={(e) => setSelectedDataset(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="CIC-IDS2017">CIC-IDS2017 Model</option>
            <option value="UNSW-NB15">UNSW-NB15 Model</option>
          </select>

          <button
            onClick={handleTrain}
            disabled={isTraining}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isTraining ? 'animate-spin' : ''}`} />
            {isTraining ? 'Training Model...' : 'Retrain Model'}
          </button>
        </div>
      </div>

      <ConfusionMatrixView metrics={metrics} />
    </div>
  );
};
