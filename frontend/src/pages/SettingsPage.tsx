import React, { useState } from 'react';
import { Send, Shield, Key, CheckCircle } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const linkCode = 'CS-89115';

  const copyCode = () => {
    navigator.clipboard.writeText(`/link ${linkCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-white">Settings & Telegram Serverless Integration</h1>
        <p className="text-xs text-slate-400">Connect Telegram Cloud bot for mobile incident notifications</p>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Send className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Cyber_ShieldUz_Bot (Telegram Serverless)</h2>
            <p className="text-xs text-slate-400">Telegram rasmiy bulutida ishlovchi avtonom kiberxavfsizlik boti</p>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-4 space-y-3">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Profilingizni ulash yo'riqnomasi:</h3>
          <ol className="text-xs text-slate-400 space-y-2 list-decimal list-inside leading-relaxed">
            <li>Telegramda o'zingizning botingizni oching (<span className="text-sky-400 font-mono">@Cyber_ShieldUz_Bot</span>).</li>
            <li><span className="text-slate-200 font-mono">/start</span> tugmasini bosing.</li>
            <li>Quyidagi bir martalik ulanish kodini nusxalab, botga yuboring:</li>
          </ol>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700 font-mono text-sm justify-between">
            <span className="text-indigo-400 font-bold">/link {linkCode}</span>
            <button
              onClick={copyCode}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-sans font-bold text-white transition"
            >
              {copied ? 'Nusxalandi!' : 'Kodni nusxalash'}
            </button>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-4 text-xs text-slate-400 space-y-1">
          <div className="font-semibold text-slate-300">Xavfsizlik eslatmasi:</div>
          <p>
            Telegram Serverless tokeni xavfsiz holda <span className="text-amber-400 font-mono">.env</span> faylida saqlanadi va GitHub ga chiqarilmaydi.
          </p>
        </div>
      </div>
    </div>
  );
};
