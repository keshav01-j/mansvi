import React from 'react';
import { SAMPLE_PARAGRAPHS, SamplePreset } from '../utils/diff';
import { Sparkles, Stethoscope, TrendingUp, Mic, Compass, Headphones } from 'lucide-react';

interface SampleSelectorProps {
  onSelectSample: (sample: SamplePreset) => void;
  selectedId?: string;
}

export const SampleSelector: React.FC<SampleSelectorProps> = ({
  onSelectSample,
  selectedId,
}) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'sample-medical':
        return <Stethoscope className="w-3.5 h-3.5" />;
      case 'sample-finance':
        return <TrendingUp className="w-3.5 h-3.5" />;
      case 'sample-podcast':
        return <Mic className="w-3.5 h-3.5" />;
      case 'sample-travel':
        return <Compass className="w-3.5 h-3.5" />;
      case 'sample-support':
        return <Headphones className="w-3.5 h-3.5" />;
      default:
        return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          Test Sample Paragraphs
        </label>
        <span className="text-[11px] text-zinc-400">Click to load instantly</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {SAMPLE_PARAGRAPHS.map((sample) => {
          const isSelected = selectedId === sample.id;
          return (
            <button
              key={sample.id}
              onClick={() => onSelectSample(sample)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all text-left group ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20'
                  : 'bg-white dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-zinc-800'
              }`}
            >
              <span className={isSelected ? 'text-indigo-200' : 'text-indigo-500'}>
                {getIcon(sample.id)}
              </span>
              <span>{sample.title}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
                  isSelected
                    ? 'bg-indigo-700/80 text-indigo-100'
                    : 'bg-zinc-100 dark:bg-zinc-700/60 text-zinc-500 dark:text-zinc-400'
                }`}
              >
                {sample.badge}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
