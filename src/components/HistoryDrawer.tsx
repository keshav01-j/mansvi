import React from 'react';
import { TTSPrepResult } from '../types';
import { X, Trash2, ArrowRight, Clock, FileText } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: TTSPrepResult[];
  onSelect: (item: TTSPrepResult) => void;
  onClear: () => void;
  onDeleteOne: (id: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelect,
  onClear,
  onDeleteOne,
}) => {
  if (!isOpen) return null;

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' • ' + d.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">
                Script Preparation History
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {history.length > 0 && (
                <button
                  onClick={onClear}
                  className="text-xs text-rose-600 hover:text-rose-700 hover:underline px-2 py-1"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Drawer Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {history.length === 0 ? (
              <div className="py-16 text-center text-zinc-400">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No saved scripts yet.</p>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Prepared paragraphs will automatically appear here.
                </p>
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span>{formatDate(item.timestamp)}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteOne(item.id);
                      }}
                      className="text-zinc-400 hover:text-rose-500 p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove from history"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-zinc-800 dark:text-zinc-200 line-clamp-3 leading-relaxed">
                    {item.prepared}
                  </p>

                  <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {(item.prepared.trim().match(/\S+/g) || []).length} words
                    </span>

                    <button
                      onClick={() => {
                        onSelect(item);
                        onClose();
                      }}
                      className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                    >
                      <span>Load into Studio</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
