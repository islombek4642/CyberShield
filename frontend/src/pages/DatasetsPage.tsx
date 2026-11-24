import React from 'react';
import { Database, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export const DatasetsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-white">Dataset Management & Schema Profiling</h1>
        <p className="text-xs text-slate-400">Integrated benchmark cybersecurity datasets</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CIC-IDS2017 Card */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">CIC-IDS2017 Benchmark</h3>
                <span className="text-xs text-slate-400">Canadian Institute for Cybersecurity</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
              Active / Ready
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Realistik zamonaviy tarmoq xurujlari to'plami. Tizim avtomatik tarzda inf/nan qiymatlarni tozalaydi va DDoS, PortScan, Botnet, Infiltration va Brute Force kabi 8 ta toifadagi xurujlarni ajratadi.
          </p>
          <div className="text-xs text-slate-400 bg-slate-800/40 p-3 rounded-xl border border-slate-800 font-mono space-y-1">
            <div>• Ustunlar soni: 80+ (18 ta eng informativ xususiyatlar tanlangan)</div>
            <div>• Namuna hajmi: 10,000 tarmoq oqimi (stratified)</div>
            <div>• Manba: datasets/samples/cic_ids2017_sample.csv</div>
          </div>
        </div>

        {/* UNSW-NB15 Card */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">UNSW-NB15 Benchmark</h3>
                <span className="text-xs text-slate-400">Cyber Range Lab (UNSW Canberra)</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
              Active / Ready
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Sintetik va haqiqiy xurujlar gibridi. Fuzzers, Analysis, Backdoors, DoS, Exploits, Generic, Reconnaissance, Shellcode va Worms sinflarini qamrab oladi.
          </p>
          <div className="text-xs text-slate-400 bg-slate-800/40 p-3 rounded-xl border border-slate-800 font-mono space-y-1">
            <div>• Ustunlar soni: 45+ (oqim tezligi, baytlar va paketlar nisbati)</div>
            <div>• Namuna hajmi: 10,000 tarmoq oqimi (stratified)</div>
            <div>• Manba: datasets/samples/unsw_nb15_sample.csv</div>
          </div>
        </div>
      </div>
    </div>
  );
};
