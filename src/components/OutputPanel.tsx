import React, { useState } from 'react';
import { DiffViewer } from './DiffViewer';
import { AudioStudio } from './AudioStudio';
import { ElevenLabsVoiceCard } from './ElevenLabsVoiceCard';
import { calculateSpeechMetrics, generateSSML } from '../utils/diff';
import {
  Copy,
  Check,
  Download,
  Code,
  FileText,
  GitCompare,
  Tv,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';

interface OutputPanelProps {
  original: string;
  prepared: string;
  selectedVoiceName: string;
  voiceId: string;
  reason?: string;
  isLoading: boolean;
  onOpenTeleprompter: () => void;
  onSelectVoice: (name: string, id: string) => void;
}

export const OutputPanel: React.FC<OutputPanelProps> = ({
  original,
  prepared,
  selectedVoiceName,
  voiceId,
  reason,
  isLoading,
  onOpenTeleprompter,
  onSelectVoice,
}) => {
  const [activeTab, setActiveTab] = useState<'script' | 'diff' | 'ssml'>('script');
  const [copied, setCopied] = useState(false);
  const [copiedSSML, setCopiedSSML] = useState(false);

  const metrics = calculateSpeechMetrics(original, prepared);
  const ssmlCode = generateSSML(prepared);

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(prepared);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleCopySSML = async () => {
    try {
      await navigator.clipboard.writeText(ssmlCode);
      setCopiedSSML(true);
      setTimeout(() => setCopiedSSML(false), 2000);
    } catch {}
  };

  const handleDownloadTxt = () => {
    const content = `Selected Voice: ${selectedVoiceName}
Voice ID: ${voiceId}
Reason: ${reason || 'N/A'}

Clean Text:
${prepared}`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `elevenlabs-script-${selectedVoiceName.toLowerCase()}-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  if (!prepared && !isLoading) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-8 text-center flex flex-col items-center justify-center min-h-[440px]">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/50 dark:border-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
          <Sparkles className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
          Ready to Select Voice & Prepare Script
        </h3>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md mt-1.5 leading-relaxed">
          Paste your paragraph on the left or click any sample above. We’ll analyze the emotion and content, recommend the single best ElevenLabs Voice ID, and output clean, polished speech text.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1. Recommended ElevenLabs Voice Card */}
      {prepared && (
        <ElevenLabsVoiceCard
          selectedVoiceName={selectedVoiceName}
          voiceId={voiceId}
          reason={reason}
          cleanText={prepared}
          onSelectVoice={onSelectVoice}
        />
      )}

      {/* 2. Script Panel Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
        {/* Header Tabs & Actions */}
        <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-zinc-200/80 dark:bg-zinc-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('script')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'script'
                  ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Clean Speech Text</span>
            </button>
            <button
              onClick={() => setActiveTab('diff')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'diff'
                  ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Diff Changes</span>
            </button>
            <button
              onClick={() => setActiveTab('ssml')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'ssml'
                  ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>SSML / Breaks</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenTeleprompter}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Full screen studio teleprompter"
            >
              <Tv className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">Teleprompter</span>
            </button>

            <button
              onClick={handleDownloadTxt}
              className="p-1.5 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              title="Download text file with Voice ID"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={activeTab === 'ssml' ? handleCopySSML : handleCopyScript}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-xs"
            >
              {(activeTab === 'ssml' ? copiedSSML : copied) ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{activeTab === 'ssml' ? 'Copy SSML' : 'Copy Clean Text'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="min-h-[200px] flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-zinc-500">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-xs font-medium">Analyzing emotion & selecting the best ElevenLabs voice...</p>
              <p className="text-[11px] text-zinc-400 mt-1">Expanding numbers, abbreviations & inserting vocal pauses</p>
            </div>
          ) : (
            <>
              {activeTab === 'script' && (
                <div className="p-6 text-base sm:text-lg leading-relaxed text-zinc-900 dark:text-zinc-100 font-serif whitespace-pre-wrap selection:bg-indigo-100 dark:selection:bg-indigo-950">
                  {prepared}
                </div>
              )}

              {activeTab === 'diff' && (
                <DiffViewer original={original} prepared={prepared} />
              )}

              {activeTab === 'ssml' && (
                <div className="p-4 bg-zinc-950 text-zinc-200 font-mono text-xs overflow-x-auto custom-scrollbar">
                  <pre>{ssmlCode}</pre>
                </div>
              )}
            </>
          )}
        </div>

        {/* Voiceover Timing & Metrics Footer */}
        <div className="px-5 py-3 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300">
          <div className="flex flex-wrap items-center justify-between gap-y-2">
            <div className="flex items-center gap-4">
              <div>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{metrics.preparedWordCount}</span> words
                {metrics.preparedWordCount !== metrics.originalWordCount && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium ml-1">
                    ({metrics.preparedWordCount > metrics.originalWordCount ? '+' : ''}
                    {metrics.preparedWordCount - metrics.originalWordCount} expanded)
                  </span>
                )}
              </div>
              <span>•</span>
              <div>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{metrics.characterCount}</span> chars
              </div>
              <span>•</span>
              <div>
                <span className="font-bold text-purple-600 dark:text-purple-400">{metrics.pauseCount}</span> natural pauses
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px]">
              <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>Est. Duration:</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold" title="Standard speech pacing (~150 WPM)">
                {formatTime(metrics.estimatedSecondsStandard)} (Standard)
              </span>
              <span className="hidden sm:inline text-zinc-400" title="Audiobook / Story pacing (~125 WPM)">
                {formatTime(metrics.estimatedSecondsSlow)} (Deliberate)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Audio Audition Studio */}
      {prepared && (
        <AudioStudio
          preparedText={prepared}
          selectedVoiceName={selectedVoiceName}
          voiceId={voiceId}
        />
      )}
    </div>
  );
};
