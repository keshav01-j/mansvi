export interface ElevenLabsVoice {
  name: string;
  id: string;
  gender: 'Female' | 'Male';
  bestFor: string;
  style: string;
  accent: string;
  previewTone: string;
}

export interface VoiceAnalysis {
  emotion?: string;
  contentType?: string;
  genderPreference?: string;
  energyLevel?: string;
}

export interface TTSPrepResult {
  id: string;
  original: string;
  prepared: string;
  timestamp: number;
  pacing?: string;
  styleNote?: string;
  selectedVoice?: string;
  voiceId?: string;
  reason?: string;
  analysis?: VoiceAnalysis;
  rawOutput?: string;
}

export interface DiffToken {
  type: 'equal' | 'insert' | 'delete' | 'pause';
  value: string;
}

export interface SpeechMetrics {
  originalWordCount: number;
  preparedWordCount: number;
  characterCount: number;
  pauseCount: number;
  estimatedSecondsStandard: number; // ~150 wpm
  estimatedSecondsSlow: number;     // ~125 wpm
  estimatedSecondsFast: number;     // ~175 wpm
  expandedEntitiesEstimate: number;
}
