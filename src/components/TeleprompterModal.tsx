import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  X,
  Type,
  Maximize2,
  FlipHorizontal,
  Clock,
} from 'lucide-react';

interface TeleprompterModalProps {
  text: string;
  isOpen: boolean;
  onClose: () => void;
}

export const TeleprompterModal: React.FC<TeleprompterModalProps> = ({
  text,
  isOpen,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(3); // 1 to 10
  const [fontSize, setFontSize] = useState(36); // px
  const [isMirrored, setIsMirrored] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<any>(null);
  const animRef = useRef<number | null>(null);

  // Keyboard shortcut listener: Space to toggle play/pause, Esc to exit
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.code === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Elapsed timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying]);

  // Smooth autoscroll loop
  useEffect(() => {
    let lastTime: number | null = null;

    const scrollLoop = (time: number) => {
      if (!isPlaying || !containerRef.current) return;

      if (lastTime !== null) {
        const delta = (time - lastTime) / 1000;
        const pixelsPerSecond = speed * 18;
        containerRef.current.scrollTop += delta * pixelsPerSecond;
      }
      lastTime = time;
      animRef.current = requestAnimationFrame(scrollLoop);
    };

    if (isPlaying) {
      animRef.current = requestAnimationFrame(scrollLoop);
    } else {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    }

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, speed]);

  const handleReset = () => {
    setIsPlaying(false);
    setElapsedSeconds(0);
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  };

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col select-none">
      {/* Top Teleprompter Controls Bar */}
      <div className="h-16 px-6 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between gap-4">
        {/* Play/Pause & Reset */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-sm text-white transition-colors"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Scroll (Space)</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            title="Rewind to top"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Stopwatch */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-xs text-zinc-300">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{formatElapsed(elapsedSeconds)}</span>
          </div>
        </div>

        {/* Speed & Font adjustments */}
        <div className="flex items-center gap-6">
          {/* Speed slider */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-medium">Speed:</span>
            <input
              type="range"
              min="1"
              max="10"
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              className="w-24 accent-indigo-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
            <span className="font-mono text-xs text-zinc-300 w-4">{speed}</span>
          </div>

          {/* Font Size slider */}
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-zinc-400" />
            <input
              type="range"
              min="24"
              max="64"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-24 accent-indigo-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
            <span className="font-mono text-xs text-zinc-300 w-6">{fontSize}px</span>
          </div>

          {/* Mirror / Flip */}
          <button
            onClick={() => setIsMirrored(!isMirrored)}
            className={`p-2 rounded-lg border transition-colors ${
              isMirrored
                ? 'bg-indigo-900/60 border-indigo-500 text-indigo-300'
                : 'border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
            title="Mirror text horizontally for glass teleprompters"
          >
            <FlipHorizontal className="w-4 h-4" />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors ml-2"
            title="Exit teleprompter (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Prompter Visual Center Indicator Line */}
      <div className="absolute top-1/2 left-0 right-0 h-0.5 border-t border-dashed border-indigo-500/30 pointer-events-none z-10 flex items-center justify-between px-4">
        <span className="text-[10px] text-indigo-400/50 uppercase tracking-widest font-mono">
          Eye Line
        </span>
        <span className="text-[10px] text-indigo-400/50 uppercase tracking-widest font-mono">
          Eye Line
        </span>
      </div>

      {/* Prompter Scrolling Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-8 sm:px-24 lg:px-44 py-40 custom-scrollbar scroll-smooth"
        style={{
          transform: isMirrored ? 'scaleX(-1)' : 'none',
        }}
      >
        <div
          className="leading-relaxed font-sans font-medium text-zinc-100 max-w-4xl mx-auto whitespace-pre-wrap transition-all"
          style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
        >
          {text}
        </div>
        <div className="h-96"></div>
      </div>
    </div>
  );
};
