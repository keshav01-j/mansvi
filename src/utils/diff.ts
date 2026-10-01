import { DiffToken, SpeechMetrics } from '../types';

/**
 * Tokenizes text into words, punctuation, and whitespace while preserving separators.
 */
function tokenize(text: string): string[] {
  // Matches words, numbers, punctuation sequences (like ... or —), or whitespace
  const regex = /([A-Za-z0-9]+|\.{3}|—|--|[.,!?;:()"'“”‘’$/%#@&+-]|\s+)/g;
  const tokens: string[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match[0]) tokens.push(match[0]);
  }
  return tokens;
}

/**
 * Computes Myers / LCS diff between original and prepared text tokens
 */
export function computeWordDiff(original: string, prepared: string): DiffToken[] {
  const origTokens = tokenize(original);
  const prepTokens = tokenize(prepared);

  const n = origTokens.length;
  const m = prepTokens.length;

  // Build DP table for Longest Common Subsequence
  // To avoid huge memory on very long text, optimize if needed. Typical TTS paragraphs are < 1000 tokens.
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1) as any);

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (origTokens[i].toLowerCase() === prepTokens[j].toLowerCase()) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  // Backtrack to extract diff
  const result: DiffToken[] = [];
  let i = n;
  let j = m;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && origTokens[i - 1].toLowerCase() === prepTokens[j - 1].toLowerCase()) {
      result.unshift({
        type: 'equal',
        value: prepTokens[j - 1], // use prepared casing
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      const val = prepTokens[j - 1];
      const isPause = val === '...' || val === '—' || val === ',' || val === ';';
      result.unshift({
        type: isPause ? 'pause' : 'insert',
        value: val,
      });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      result.unshift({
        type: 'delete',
        value: origTokens[i - 1],
      });
      i--;
    }
  }

  return result;
}

/**
 * Calculates speech timing metrics, pause counts, and word statistics
 */
export function calculateSpeechMetrics(original: string, prepared: string): SpeechMetrics {
  const origWords = (original.trim().match(/\S+/g) || []).length;
  const prepWords = (prepared.trim().match(/\S+/g) || []).length;
  const charCount = prepared.length;

  // Count punctuation pauses (commas, ellipses, periods, colons, semicolons, em-dashes)
  const pauseMatches = prepared.match(/(\.{3}|—|--|[,;:.])/g) || [];
  const pauseCount = pauseMatches.length;

  // Average speaking rates:
  // Standard speech: ~150 words per minute
  // Audiobook / deliberate: ~125 words per minute
  // Commercial / fast: ~175 words per minute
  // We also factor in +0.3s for each natural pause/comma and +0.6s for ellipses/periods
  const pauseBonusSeconds = (prepared.match(/[,;]/g) || []).length * 0.25 +
                            (prepared.match(/(\.{3}|—|\.|\!|\?)/g) || []).length * 0.45;

  const estimatedSecondsStandard = Math.max(1, Math.round((prepWords / 150) * 60 + pauseBonusSeconds));
  const estimatedSecondsSlow = Math.max(1, Math.round((prepWords / 125) * 60 + pauseBonusSeconds * 1.3));
  const estimatedSecondsFast = Math.max(1, Math.round((prepWords / 175) * 60 + pauseBonusSeconds * 0.7));

  // Estimate number of expanded abbreviations/numbers (difference in word count or regex match)
  const expandedEstimate = Math.max(0, prepWords - origWords);

  return {
    originalWordCount: origWords,
    preparedWordCount: prepWords,
    characterCount: charCount,
    pauseCount,
    estimatedSecondsStandard,
    estimatedSecondsSlow,
    estimatedSecondsFast,
    expandedEntitiesEstimate: expandedEstimate,
  };
}

/**
 * Converts speech-ready text into standard W3C SSML format for ElevenLabs, Azure, Polly, Google Cloud TTS
 */
export function generateSSML(preparedText: string): string {
  if (!preparedText.trim()) return '';

  // Escape XML characters
  let escaped = preparedText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  // Replace ellipses with 450ms breaks
  escaped = escaped.replace(/\.{3}/g, '<break time="450ms"/>');

  // Replace em dashes with 250ms breaks
  escaped = escaped.replace(/—|--/g, '<break time="250ms"/>');

  // Split into paragraphs
  const paragraphs = escaped.split(/\n\s*\n/).filter(p => p.trim().length > 0);

  const ssmlParagraphs = paragraphs.map(p => {
    // Split into sentences (by period, exclamation, question mark followed by space or end)
    const sentences = p.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
    const sentenceTags = sentences.map(s => `    <s>${s.trim()}</s>`).join('\n');
    return `  <p>\n${sentenceTags}\n  </p>`;
  }).join('\n\n');

  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
${ssmlParagraphs}
</speak>`;
}

export interface SamplePreset {
  id: string;
  title: string;
  category: string;
  badge: string;
  paragraph: string;
  description: string;
}

export const SAMPLE_PARAGRAPHS: SamplePreset[] = [
  {
    id: 'sample-cinematic',
    title: 'Cinematic Movie Trailer',
    category: 'Epic / Dramatic',
    badge: 'Matches Arnold',
    description: 'Deep, powerful, suspenseful narration. Demands a commanding baritone voice.',
    paragraph: `In 2049, humanity faced its greatest reckoning. Beyond the shattered ruins of Sector 4, an ancient signal pulsed at 14.8 gigahertz. One lone pilot must brave the outer rim before zero hour strikes on Nov. 12th.`,
  },
  {
    id: 'sample-empathetic',
    title: 'Heartfelt Apology & Care',
    category: 'Support / Empathy',
    badge: 'Matches Bella',
    description: 'Emotional, gentle, and warm customer care note reassuring an anxious customer.',
    paragraph: `We are truly sorry for the unexpected delay with order #88412 on Dec. 24th. We know how much this anniversary gift meant to you and your family, and our team is sending a full refund plus a $75 credit to make things right.`,
  },
  {
    id: 'sample-meditation',
    title: 'Sleep & Mindful Breathing',
    category: 'Wellness / Calm',
    badge: 'Matches Elli',
    description: 'Ultra-gentle, soothing, whisper-soft guidance for evening relaxation.',
    paragraph: `Close your eyes and breathe in slowly for 4 seconds... hold for 3... and gently release. Feel the tension in your shoulders melt away into the quiet evening air as you drift into restorative peace.`,
  },
  {
    id: 'sample-podcast',
    title: 'Casual Tech Podcast Intro',
    category: 'Conversational',
    badge: 'Matches Josh',
    description: 'Friendly guy-next-door chat diving into AI tools and community updates.',
    paragraph: `What's up everyone, welcome back to ep. 56! Today we're testing whether these new AI agents can really automate 80% of our daily coding workflow by 2026. Hit that subscribe button and let's jump right in.`,
  },
  {
    id: 'sample-broadcast',
    title: 'Financial & Market Report',
    category: 'Broadcast / News',
    badge: 'Matches Adam / Rachel',
    description: 'Clear, authoritative professional delivery of quarterly fiscal earnings.',
    paragraph: `At 9:30 AM EST on Oct. 15th, TechGlobal announced Q3 gross margins of 42.8%, surpassing Wall Street estimates by $320M. CEO Dr. Evans confirmed that 1,200 new engineering roles will open across 5 global hubs in 2025.`,
  },
  {
    id: 'sample-promo',
    title: 'High-Energy Summer Festival',
    category: 'Energetic / Youth',
    badge: 'Matches Domi',
    description: 'Upbeat, bubbly, and fast-paced promo for an electric music festival.',
    paragraph: `Get ready! Neon Fest is back this July 18th to 20th with over 60 live DJs, 3 mega stages, and 50,000 fans! Grab your early-bird VIP tickets at 40% off before midnight tonight!`,
  },
];

export const GEMINI_VOICES: { id: string; name: string; gender: 'Female' | 'Male' | 'Neutral'; tone: string; description: string }[] = [
  { id: 'Kore', name: 'Kore', gender: 'Female', tone: 'Warm, articulate, and natural', description: 'Exceptional for audiobooks, narrations, and professional explainers.' },
  { id: 'Puck', name: 'Puck', gender: 'Male', tone: 'Engaging, friendly, and energetic', description: 'Great for podcasts, conversational clips, and commercials.' },
  { id: 'Charon', name: 'Charon', gender: 'Male', tone: 'Deep, authoritative, and cinematic', description: 'Ideal for documentaries, trailers, and serious presentations.' },
  { id: 'Fenrir', name: 'Fenrir', gender: 'Male', tone: 'Resonant, steady, and calm', description: 'Clear corporate and educational delivery.' },
  { id: 'Zephyr', name: 'Zephyr', gender: 'Female', tone: 'Smooth, bright, and modern', description: 'Fresh, conversational voice for tech and lifestyle.' },
];
