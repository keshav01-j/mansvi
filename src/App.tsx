/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { RulesBanner } from './components/RulesBanner';
import { SampleSelector } from './components/SampleSelector';
import { InputPanel } from './components/InputPanel';
import { OutputPanel } from './components/OutputPanel';
import { TeleprompterModal } from './components/TeleprompterModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { SAMPLE_PARAGRAPHS, SamplePreset } from './utils/diff';
import { TTSPrepResult } from './types';
import { AlertCircle } from 'lucide-react';

const STORAGE_KEY = 'elevenprep_history_v2';

export default function App() {
  const [paragraph, setParagraph] = useState<string>('');
  const [prepared, setPrepared] = useState<string>('');
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('Rachel');
  const [voiceId, setVoiceId] = useState<string>('21m00Tcm4TlvDq8ikWAM');
  const [reason, setReason] = useState<string>('');
  const [preferredGender, setPreferredGender] = useState<string>('any');
  const [styleNote, setStyleNote] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals & Panels
  const [showRules, setShowRules] = useState<boolean>(false);
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [selectedSampleId, setSelectedSampleId] = useState<string | undefined>();
  const [history, setHistory] = useState<TTSPrepResult[]>([]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const saveToHistory = (item: TTSPrepResult) => {
    setHistory((prev) => {
      const updated = [item, ...prev.filter((p) => p.id !== item.id)].slice(0, 30);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleSelectSample = (sample: SamplePreset) => {
    setSelectedSampleId(sample.id);
    setParagraph(sample.paragraph);
    setErrorMessage(null);
  };

  const handleReset = () => {
    setParagraph('');
    setPrepared('');
    setSelectedSampleId(undefined);
    setStyleNote('');
    setReason('');
    setSelectedVoiceName('Rachel');
    setVoiceId('21m00Tcm4TlvDq8ikWAM');
    setErrorMessage(null);
  };

  const handleManualSelectVoice = (name: string, id: string) => {
    setSelectedVoiceName(name);
    setVoiceId(id);
  };

  const handlePrepare = async () => {
    if (!paragraph.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/prepare-tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paragraph: paragraph.trim(),
          styleNote: styleNote.trim(),
          preferredGender: preferredGender !== 'any' ? preferredGender : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze paragraph & prepare speech.');
      }

      setPrepared(data.prepared);
      setSelectedVoiceName(data.selectedVoice || 'Rachel');
      setVoiceId(data.voiceId || '21m00Tcm4TlvDq8ikWAM');
      setReason(data.reason || '');

      // Save to history
      const historyItem: TTSPrepResult = {
        id: 'elevenprep-' + Date.now(),
        original: paragraph,
        prepared: data.prepared,
        timestamp: Date.now(),
        selectedVoice: data.selectedVoice,
        voiceId: data.voiceId,
        reason: data.reason,
        styleNote,
      };
      saveToHistory(historyItem);
    } catch (err: any) {
      console.error('Error during voice selection and TTS preparation:', err);
      setErrorMessage(err.message || 'Something went wrong while preparing speech text.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadFromHistory = (item: TTSPrepResult) => {
    setParagraph(item.original);
    setPrepared(item.prepared);
    if (item.selectedVoice) setSelectedVoiceName(item.selectedVoice);
    if (item.voiceId) setVoiceId(item.voiceId);
    if (item.reason) setReason(item.reason);
    if (item.styleNote) setStyleNote(item.styleNote);
    setSelectedSampleId(undefined);
  };

  return (
    <div className="min-h-screen bg-zinc-50/70 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors">
      {/* Header */}
      <Header
        showRules={showRules}
        onToggleRules={() => setShowRules(!showRules)}
        historyCount={history.length}
        onToggleHistory={() => setIsHistoryOpen(true)}
        onReset={handleReset}
      />

      {/* Rules Banner (Collapsible) */}
      <RulesBanner isOpen={showRules} onClose={() => setShowRules(false)} />

      {/* Main Studio Workbench */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* Sample Paragraph Presets (Movie trailer, Apology, Meditation, Podcast, etc.) */}
        <SampleSelector
          onSelectSample={handleSelectSample}
          selectedId={selectedSampleId}
        />

        {/* Error message notification if any */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs sm:text-sm text-rose-700 dark:text-rose-300 flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <div className="flex-1">
              <span className="font-semibold">Preparation Notice: </span>
              {errorMessage}
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-200 text-xs font-semibold px-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 2-Column Responsive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Column 1: Input & Voice Preferences */}
          <div className="h-full">
            <InputPanel
              paragraph={paragraph}
              onChangeParagraph={(val) => {
                setParagraph(val);
                if (selectedSampleId) setSelectedSampleId(undefined);
              }}
              onPrepare={handlePrepare}
              isLoading={isLoading}
              preferredGender={preferredGender}
              onChangePreferredGender={setPreferredGender}
              styleNote={styleNote}
              onChangeStyleNote={setStyleNote}
            />
          </div>

          {/* Column 2: Voice Card, Clean Script, Diff, SSML & Audition Studio */}
          <div className="h-full">
            <OutputPanel
              original={paragraph}
              prepared={prepared}
              selectedVoiceName={selectedVoiceName}
              voiceId={voiceId}
              reason={reason}
              isLoading={isLoading}
              onOpenTeleprompter={() => setIsTeleprompterOpen(true)}
              onSelectVoice={handleManualSelectVoice}
            />
          </div>
        </div>
      </main>

      {/* Fullscreen Teleprompter Modal */}
      <TeleprompterModal
        text={prepared || paragraph}
        isOpen={isTeleprompterOpen}
        onClose={() => setIsTeleprompterOpen(false)}
      />

      {/* Script History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={handleLoadFromHistory}
        onClear={handleClearHistory}
        onDeleteOne={handleDeleteHistoryItem}
      />
    </div>
  );
}
