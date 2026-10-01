import React, { useState } from 'react';
import { computeWordDiff } from '../utils/diff';
import { Columns, Eye, HelpCircle } from 'lucide-react';

interface DiffViewerProps {
  original: string;
  prepared: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ original, prepared }) => {
  const [viewMode, setViewMode] = useState<'inline' | 'split'>('inline');
  const tokens = computeWordDiff(original, prepared);

  return (
    <div className="flex flex-col h-full">
      {/* Diff Controls & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-200 dark:border-zinc-800 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-zinc-600 dark:text-zinc-300">Legend:</span>
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-300/50 dark:border-emerald-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Expanded Words / Numbers
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 rounded border border-purple-300/50 dark:border-purple-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            Natural Pauses (...)
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/60 px-2 py-0.5 rounded border border-rose-300/50 dark:border-rose-800/50 line-through">
            Original Replaced
          </span>
        </div>

        <div className="flex items-center gap-1 bg-zinc-200 dark:bg-zinc-800 p-0.5 rounded-lg">
          <button
            onClick={() => setViewMode('inline')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
              viewMode === 'inline'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Inline Markup
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
              viewMode === 'split'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Side by Side
          </button>
        </div>
      </div>

      {/* Diff Content View */}
      <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
        {viewMode === 'inline' ? (
          <div className="leading-relaxed text-sm sm:text-base text-zinc-800 dark:text-zinc-100">
            {tokens.map((token, idx) => {
              if (token.type === 'equal') {
                return <span key={idx}>{token.value}</span>;
              }
              if (token.type === 'delete') {
                return (
                  <span
                    key={idx}
                    className="mx-0.5 px-1 py-0.5 text-xs bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 line-through rounded border border-rose-200 dark:border-rose-800/60 select-none"
                    title={`Replaced original token: "${token.value}"`}
                  >
                    {token.value}
                  </span>
                );
              }
              if (token.type === 'pause') {
                return (
                  <span
                    key={idx}
                    className="mx-0.5 px-1.5 py-0.5 font-bold font-mono text-xs bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 rounded border border-purple-300 dark:border-purple-800 animate-pulse"
                    title="Breath / Cadence Pause added for voice synthesis"
                  >
                    {token.value}
                  </span>
                );
              }
              if (token.type === 'insert') {
                return (
                  <span
                    key={idx}
                    className="mx-0.5 px-1 py-0.5 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-200 font-medium rounded border border-emerald-300 dark:border-emerald-800/60 shadow-xs"
                    title="Spoken expansion added for natural pronunciation"
                  >
                    {token.value}
                  </span>
                );
              }
              return null;
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
              <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Original Raw</span>
                <span className="font-mono text-[10px] text-zinc-400">{(original.trim().match(/\S+/g) || []).length} words</span>
              </div>
              <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                {original}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/40">
              <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Speech-Ready Prepared</span>
                <span className="font-mono text-[10px] text-indigo-500">{(prepared.trim().match(/\S+/g) || []).length} words</span>
              </div>
              <p className="text-sm leading-relaxed text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap font-medium">
                {prepared}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
