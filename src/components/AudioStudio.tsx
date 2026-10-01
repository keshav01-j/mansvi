import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Volume2,
  VolumeX,
  Sparkles,
  Radio,
  Sliders,
  CheckCircle,
  AlertCircle,
  Loader2,
  Mic,
} from 'lucide-react';
import { getVoiceByNameOrId } from '../utils/elevenlabs';

interface AudioStudioProps {
  preparedText: string;
  selectedVoiceName?: string;
  voiceId?: string;
}

export const AudioStudio: React.FC<AudioStudioProps> = ({
  preparedText,
  selectedVoiceName = 'Rachel',
  voiceId,
}) => {
  const [engine, setEngine] = useState<'studio' | 'browser'>('studio');

  // Studio Audio State
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Audio Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Web Speech API State
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedBrowserVoice, setSelectedBrowserVoice] = useState<string>('');
  const [browserRate, setBrowserRate] = useState<number>(1.0);
  const [browserPitch, setBrowserPitch] = useState<number>(1.0);
  const [isPlayingBrowser, setIsPlayingBrowser] = useState(false);

  const voiceMeta = getVoiceByNameOrId(selectedVoiceName) || getVoiceByNameOrId(voiceId || '');

  // Load browser voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setBrowserVoices(voices);
        if (voices.length > 0 && !selectedBrowserVoice) {
          const defaultVoice =
            voices.find((v) => v.lang.startsWith('en') && v.default) ||
            voices.find((v) => v.lang.startsWith('en')) ||
            voices[0];
          setSelectedBrowserVoice(defaultVoice?.name || '');
        }
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [selectedBrowserVoice]);

  // Clean up audio URL
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [audioUrl]);

  // Reset generated audio if selected voice changes
  useEffect(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [selectedVoiceName]);

  const handleGenerateAudio = async () => {
    if (!preparedText.trim()) return;
    setIsGenerating(true);
    setAudioError(null);

    try {
      const res = await fetch('/api/generate-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: preparedText,
          voiceName: selectedVoiceName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to synthesize speech preview.');
      }

      if (data.audioBase64) {
        const binaryString = atob(data.audioBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'audio/wav' });
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.play().catch(() => {});
        }
      }
    } catch (err: any) {
      console.error('Audio generation error:', err);
      setAudioError(err.message || 'Speech preview generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  // Browser speech synthesis handlers
  const handlePlayBrowser = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPlayingBrowser) {
      window.speechSynthesis.cancel();
      setIsPlayingBrowser(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(preparedText);
    if (selectedBrowserVoice) {
      const v = browserVoices.find((voice) => voice.name === selectedBrowserVoice);
      if (v) utterance.voice = v;
    }
    utterance.rate = browserRate;
    utterance.pitch = browserPitch;

    utterance.onend = () => setIsPlayingBrowser(false);
    utterance.onerror = () => setIsPlayingBrowser(false);

    setIsPlayingBrowser(true);
    window.speechSynthesis.speak(utterance);
  };

  const formatSeconds = (sec: number) => {
    if (isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden p-5">
      {/* Studio Header & Engine Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-indigo-500 animate-pulse" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">
              Speech Audition Studio
            </h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Audition the cadence with persona matching{' '}
            <strong className="text-indigo-600 dark:text-indigo-400 font-semibold">{selectedVoiceName}</strong> ({voiceMeta?.style || 'Natural'})
          </p>
        </div>

        {/* Engine switcher tab */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setEngine('studio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              engine === 'studio'
                ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Studio Voice Preview</span>
          </button>
          <button
            onClick={() => setEngine('browser')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              engine === 'browser'
                ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Instant Browser Player</span>
          </button>
        </div>
      </div>

      {/* Engine 1: Studio Audio */}
      {engine === 'studio' && (
        <div className="pt-4 space-y-4">
          {/* Persona Card */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                {selectedVoiceName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Voiceover Persona: {selectedVoiceName}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold">
                    {voiceMeta?.style || 'Natural'}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {voiceMeta?.previewTone || 'Natural cadence tailored for this script.'}
                </p>
              </div>
            </div>

            <button
              onClick={handleGenerateAudio}
              disabled={isGenerating || !preparedText.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20 transition-all flex-shrink-0"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-200" />
                  <span>{audioUrl ? 'Regenerate Audio' : 'Audition Voice Audio'}</span>
                </>
              )}
            </button>
          </div>

          {audioError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Notice: </span>
                {audioError}
              </div>
            </div>
          )}

          {/* Audio Player Bar */}
          {audioUrl && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-zinc-900 to-indigo-950 text-white shadow-inner flex flex-col gap-3">
              <audio
                ref={audioRef}
                src={audioUrl}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleTimeUpdate}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-full bg-white text-zinc-950 flex items-center justify-center hover:bg-zinc-100 active:scale-95 transition-all shadow-md"
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                  </button>

                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{selectedVoiceName} Audition</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                        24kHz RIFF WAV
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono">
                      {formatSeconds(currentTime)} / {formatSeconds(duration)}
                    </div>
                  </div>
                </div>

                {/* Animated Waveform */}
                <div className="flex items-end gap-1 h-7">
                  {[40, 75, 55, 90, 65, 30, 85, 45, 95, 60, 35, 80].map((h, i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-full bg-indigo-400 transition-all ${
                        isPlaying ? 'wave-bar' : 'opacity-40'
                      }`}
                      style={{
                        height: isPlaying ? `${h}%` : '20%',
                        animationDelay: `${(i * 0.1).toFixed(1)}s`,
                      }}
                    />
                  ))}
                </div>

                {/* Volume & Export */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <button onClick={toggleMute} className="text-zinc-300 hover:text-white">
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-16 sm:w-24 accent-indigo-500 h-1 bg-zinc-700 rounded-lg cursor-pointer"
                    />
                  </div>

                  <a
                    href={audioUrl}
                    download={`elevenlabs-prep-${selectedVoiceName.toLowerCase()}.wav`}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title="Download audio clip"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Progress Slider */}
              <input
                type="range"
                min="0"
                max={duration || 1}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="w-full accent-indigo-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>
          )}
        </div>
      )}

      {/* Engine 2: Instant Browser Player */}
      {engine === 'browser' && (
        <div className="pt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wide mb-1.5">
                Local Device Voice
              </label>
              <select
                value={selectedBrowserVoice}
                onChange={(e) => setSelectedBrowserVoice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 text-xs focus:outline-none focus:border-indigo-500"
              >
                {browserVoices.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wide">
                  Speaking Rate
                </label>
                <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">
                  {browserRate.toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.75"
                step="0.05"
                value={browserRate}
                onChange={(e) => setBrowserRate(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wide">
                  Vocal Pitch
                </label>
                <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">
                  {browserPitch.toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
                value={browserPitch}
                onChange={(e) => setBrowserPitch(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handlePlayBrowser}
              disabled={!preparedText.trim()}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isPlayingBrowser
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                  : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500'
              }`}
            >
              {isPlayingBrowser ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Stop In-Browser Playback</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>Instant Live Playback</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
