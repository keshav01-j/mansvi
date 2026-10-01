import React from 'react';
import { CheckCircle2, ShieldCheck, X } from 'lucide-react';

interface RulesBannerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesBanner: React.FC<RulesBannerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const rules = [
    {
      num: 1,
      title: 'Voice Persona Analysis',
      desc: 'Evaluates emotional tone (serious, empathetic, upbeat), content type, and energy level to match the single best ElevenLabs voice.',
    },
    {
      num: 2,
      title: '9 Exclusive Voices',
      desc: 'Selects strictly from Rachel, Domi, Bella, Antoni, Elli, Josh, Arnold, Adam, or Sam with exact ElevenLabs Voice IDs.',
    },
    {
      num: 3,
      title: '100% Meaning Retained',
      desc: 'Never alters the underlying narrative, facts, context, or meaning of the user paragraph.',
    },
    {
      num: 4,
      title: 'Breath & Cadence Flow',
      desc: 'Enhances punctuation with commas, periods, or ellipses (...) for realistic human speech rhythm.',
    },
    {
      num: 5,
      title: 'Spoken Word Expansion',
      desc: 'Expands numbers, abbreviations, dates, and currency symbols into their natural spoken verbal forms.',
    },
    {
      num: 6,
      title: 'Strict Output Structure',
      desc: 'Outputs Selected Voice, Voice ID, Reason, and Clean Text without extra commentary or markdown clutter.',
    },
  ];

  return (
    <div className="bg-gradient-to-r from-indigo-900/90 via-slate-900/95 to-violet-950 text-white border-b border-indigo-500/20 shadow-lg px-4 py-4 transition-all">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-semibold tracking-wide text-indigo-200 uppercase">
              The 6 Cardinal Rules of Text-to-Speech Script Preparation
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
            title="Dismiss rules banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {rules.map((rule) => (
            <div
              key={rule.num}
              className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm flex items-start gap-3 hover:border-indigo-400/30 transition-colors"
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 font-bold text-xs flex items-center justify-center">
                {rule.num}
              </span>
              <div>
                <h3 className="text-xs font-semibold text-zinc-100 flex items-center gap-1.5">
                  {rule.title}
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </h3>
                <p className="text-[11px] text-zinc-300 mt-0.5 leading-relaxed">
                  {rule.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
