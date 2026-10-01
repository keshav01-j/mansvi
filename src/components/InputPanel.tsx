import React, { useState } from 'react';
import { Play, Sparkles, Clipboard, Trash2, Sliders, Info, Zap, UserCheck } from 'lucide-react';

interface InputPanelProps {
  paragraph: string;
  onChangeParagraph: (text: string) => void;
  onPrepare: () => void;
  isLoading: boolean;
  preferredGender: string;
  onChangePreferredGender: (gender: string) => void;
  styleNote: string;
  onChangeStyleNote: (note: string) => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  paragraph,
  onChangeParagraph,
  onPrepare,
  isLoading,
  preferredGender,
  onChangePreferredGender,
  styleNote,
  onChangeStyleNote,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const wordCount = (paragraph.trim().match(/\S+/g) || []).length;
  const charCount = paragraph.length;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onChangeParagraph(text);
      }
    } catch {}
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isLoading && paragraph.trim()) {
        onPrepare();
      }
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Panel Header */}
      <div className="px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-200">
            Raw Input Paragraph
          </span>
          <span className="text-[11px] text-zinc-400 font-medium">
            (Script, Voiceover, Dialogue)
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handlePaste}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
            title="Paste text from clipboard"
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span>Paste</span>
          </button>
          {paragraph && (
            <button
              onClick={() => onChangeParagraph('')}
              className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-colors"
              title="Clear text"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Textarea Area */}
      <div className="relative flex-1 p-4 flex flex-col min-h-[220px]">
        <textarea
          value={paragraph}
          onChange={(e) => onChangeParagraph(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste or write the paragraph you want to voice... e.g. a story, corporate announcement, podcast intro, or emotional apology."
          className="w-full flex-1 resize-none bg-transparent text-sm sm:text-base text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none leading-relaxed custom-scrollbar font-normal"
        />

        {/* Word / Char counter */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/60 text-xs text-zinc-400 font-mono">
          <div className="flex items-center gap-3">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{charCount} characters</span>
          </div>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-sans"
          >
            <Sliders className="w-3 h-3" />
            <span>{showAdvanced ? 'Hide Voice Preferences' : 'Voice Preference & Hints'}</span>
          </button>
        </div>
      </div>

      {/* Advanced Preference Controls */}
      {showAdvanced && (
        <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-100 dark:border-zinc-800 text-xs space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wide mb-1.5 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span>Voice Gender Preference (Optional)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'any', label: 'AI Discretion', desc: 'Optimal match based on content' },
                { id: 'female', label: 'Female Voice', desc: 'Rachel, Domi, Bella, or Elli' },
                { id: 'male', label: 'Male Voice', desc: 'Antoni, Josh, Arnold, Adam, Sam' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onChangePreferredGender(opt.id)}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    preferredGender === opt.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200'
                      : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
                  }`}
                >
                  <div className="font-semibold">{opt.label}</div>
                  <div className="text-[10px] text-zinc-400">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wide mb-1">
              Context or Pronunciation Hint (Optional)
            </label>
            <input
              type="text"
              value={styleNote}
              onChange={(e) => onChangeStyleNote(e.target.value)}
              placeholder="e.g., Emphasize the final countdown, slightly cinematic tone, British pronunciation for aluminium..."
              className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Prepare Button Footer */}
      <div className="p-4 bg-zinc-50/80 dark:bg-zinc-900/80 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden sm:inline">Press</span>
          <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[10px] font-mono text-zinc-600 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">
            Ctrl
          </kbd>
          <span>+</span>
          <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[10px] font-mono text-zinc-600 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">
            Enter
          </kbd>
        </div>

        <button
          onClick={onPrepare}
          disabled={isLoading || !paragraph.trim()}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Matching Voice & Preparing Text...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-indigo-200" />
              <span>Select Voice & Prepare Speech</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
