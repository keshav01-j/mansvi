import React, { useState } from 'react';
import { ELEVENLABS_VOICES, getVoiceByNameOrId, generateElevenLabsCurl, generateElevenLabsPython } from '../utils/elevenlabs';
import {
  Sparkles,
  Copy,
  Check,
  ChevronDown,
  Terminal,
  Code2,
  ExternalLink,
  Volume2,
  Mic,
  ShieldCheck,
} from 'lucide-react';

interface ElevenLabsVoiceCardProps {
  selectedVoiceName: string;
  voiceId: string;
  reason?: string;
  cleanText: string;
  onSelectVoice: (name: string, id: string) => void;
}

export const ElevenLabsVoiceCard: React.FC<ElevenLabsVoiceCardProps> = ({
  selectedVoiceName,
  voiceId,
  reason,
  cleanText,
  onSelectVoice,
}) => {
  const [copiedId, setCopiedId] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);
  const [showApiSnippet, setShowApiSnippet] = useState(false);
  const [apiTab, setApiTab] = useState<'curl' | 'python'>('curl');
  const [copiedCode, setCopiedCode] = useState(false);

  const currentVoice = getVoiceByNameOrId(selectedVoiceName) || getVoiceByNameOrId(voiceId) || ELEVENLABS_VOICES[0];

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(currentVoice.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {}
  };

  const handleCopyCode = async () => {
    const code = apiTab === 'curl'
      ? generateElevenLabsCurl(currentVoice.id, cleanText)
      : generateElevenLabsPython(currentVoice.id, cleanText);
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {}
  };

  return (
    <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-violet-950 text-white rounded-2xl border border-indigo-500/30 p-5 shadow-lg relative overflow-hidden">
      {/* Decorative ambient background */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Recommended ElevenLabs Voice
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1">
                <Check className="w-2.5 h-2.5" />
                AI Matched
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Optimal voice model for this emotion, energy, and content style
            </p>
          </div>
        </div>

        {/* Change voice toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCatalog(!showCatalog)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/15 border border-white/10 text-zinc-200 transition-all"
          >
            <span>{showCatalog ? 'Close Voice Catalog' : 'Browse All 9 Voices'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCatalog ? 'rotate-180' : ''}`} />
          </button>

          <button
            onClick={() => setShowApiSnippet(!showApiSnippet)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/30 text-indigo-200 transition-all"
            title="View API Call snippet"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">API Code</span>
          </button>
        </div>
      </div>

      {/* Main Matched Voice Row */}
      <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-4">
          {/* Avatar / Initial */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xl font-extrabold shadow-md shadow-indigo-500/30 flex-shrink-0">
            {currentVoice.name.charAt(0)}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-black text-white tracking-tight">
                {currentVoice.name}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-indigo-200 border border-white/10">
                {currentVoice.gender}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Style: {currentVoice.style}
              </span>
            </div>

            {/* Why this voice reason */}
            {reason && (
              <p className="text-xs sm:text-sm text-indigo-100/90 mt-1.5 font-medium leading-relaxed max-w-xl">
                <strong className="text-indigo-300">Reason: </strong>
                {reason}
              </p>
            )}

            <div className="text-xs text-zinc-400 mt-1">
              <span className="text-zinc-500">Best for: </span>
              {currentVoice.bestFor}
            </div>
          </div>
        </div>

        {/* Voice ID Box with Instant Copy */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-3 flex flex-col gap-1.5 self-start md:self-auto min-w-[240px]">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span className="font-semibold uppercase tracking-wider text-indigo-300">ElevenLabs Voice ID</span>
            <span>{currentVoice.accent}</span>
          </div>

          <div className="flex items-center justify-between gap-2 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10">
            <code className="text-xs font-mono text-emerald-400 select-all font-semibold">
              {currentVoice.id}
            </code>
            <button
              onClick={handleCopyId}
              className="p-1 text-zinc-400 hover:text-white rounded hover:bg-white/10 transition-colors"
              title="Copy ElevenLabs Voice ID"
            >
              {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* API Code Snippet Modal/Drawer */}
      {showApiSnippet && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setApiTab('curl')}
                className={`px-2.5 py-1 rounded text-xs font-semibold ${
                  apiTab === 'curl' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                cURL Request
              </button>
              <button
                onClick={() => setApiTab('python')}
                className={`px-2.5 py-1 rounded text-xs font-semibold ${
                  apiTab === 'python' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Python (requests)
              </button>
            </div>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-white/10 hover:bg-white/20 text-white"
            >
              {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
          <pre className="bg-black/60 rounded-xl p-3 text-xs font-mono text-zinc-300 overflow-x-auto max-h-48 custom-scrollbar border border-white/10">
            {apiTab === 'curl'
              ? generateElevenLabsCurl(currentVoice.id, cleanText)
              : generateElevenLabsPython(currentVoice.id, cleanText)}
          </pre>
        </div>
      )}

      {/* Voice Catalog Grid (9 Available Voices) */}
      {showCatalog && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-200">
              The 9 Available ElevenLabs Voices
            </h4>
            <span className="text-[11px] text-zinc-400">Click any voice to switch</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {ELEVENLABS_VOICES.map((v) => {
              const isSelected = v.id === currentVoice.id;
              return (
                <button
                  key={v.id}
                  onClick={() => {
                    onSelectVoice(v.name, v.id);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-indigo-600/40 border-indigo-400 text-white shadow-sm'
                      : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white flex items-center gap-1.5">
                      {v.name}
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 font-mono">
                      {v.style}
                    </span>
                  </div>
                  <div className="text-[11px] text-indigo-200/80 mt-1 font-medium line-clamp-1">
                    {v.bestFor}
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                    <span className="truncate max-w-[120px]">{v.id}</span>
                    <span className="text-zinc-500">{v.gender}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
