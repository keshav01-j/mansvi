import React from 'react';
import { Sparkles, BookOpen, History, RotateCcw, Volume2 } from 'lucide-react';

interface HeaderProps {
  onToggleRules: () => void;
  showRules: boolean;
  onToggleHistory: () => void;
  historyCount: number;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleRules,
  showRules,
  onToggleHistory,
  historyCount,
  onReset,
}) => {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                ElevenPrep <span className="text-indigo-600 dark:text-indigo-400">AI</span>
              </h1>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
                ElevenLabs Studio
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
              Voice Selection & Natural Speech Preparation for ElevenLabs
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Rules toggle */}
          <button
            onClick={onToggleRules}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              showRules
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
            title="View 6 Rules of TTS Script Preparation"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Prep Rules</span>
          </button>

          {/* History */}
          <button
            onClick={onToggleHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all relative"
            title="Recent Script History"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden md:inline">History</span>
            {historyCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-600 text-white leading-tight">
                {historyCount}
              </span>
            )}
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            title="Clear and Reset Workbench"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Gemini Engine Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-zinc-200 dark:border-zinc-800 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Gemini 3.8 Flash Ready</span>
          </div>
        </div>
      </div>
    </header>
  );
};
