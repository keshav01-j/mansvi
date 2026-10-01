import { ElevenLabsVoice } from '../types';

export const ELEVENLABS_VOICES: ElevenLabsVoice[] = [
  {
    name: 'Rachel',
    id: '21m00Tcm4TlvDq8ikWAM',
    gender: 'Female',
    bestFor: 'Clear, professional, storytelling',
    style: 'Calm & natural',
    accent: 'American (Standard)',
    previewTone: 'Polished, trustworthy, versatile for audiobooks & narrations.',
  },
  {
    name: 'Domi',
    id: 'AZnzlk1XvdvUeBnXmlld',
    gender: 'Female',
    bestFor: 'Energetic, young, friendly',
    style: 'Upbeat',
    accent: 'American (Youthful)',
    previewTone: 'Bubbly, enthusiastic, ideal for ads, gaming & shorts.',
  },
  {
    name: 'Bella',
    id: 'EXAVITQu4vr4xnSDxMaL',
    gender: 'Female',
    bestFor: 'Soft, emotional, warm',
    style: 'Empathetic',
    accent: 'American (Warm)',
    previewTone: 'Gentle, expressive, perfect for heartfelt stories & apologies.',
  },
  {
    name: 'Antoni',
    id: 'ErXwobaYiN019PkySvjV',
    gender: 'Male',
    bestFor: 'Deep male, authoritative',
    style: 'Serious & strong',
    accent: 'American (Resonant)',
    previewTone: 'Commanding, firm, suited for documentaries & corporate trailers.',
  },
  {
    name: 'Elli',
    id: 'MF3mGyEYCl7XYWbV9V6O',
    gender: 'Female',
    bestFor: 'Soft female, gentle',
    style: 'Calm & caring',
    accent: 'American (Delicate)',
    previewTone: 'Soothing, whisper-soft, excellent for meditation & lullabies.',
  },
  {
    name: 'Josh',
    id: 'TxGEqnHWrfWFTfGW9XjX',
    gender: 'Male',
    bestFor: 'Conversational male',
    style: 'Casual & friendly',
    accent: 'American (Everyday)',
    previewTone: 'Approachable, natural guy-next-door, perfect for podcasts & YouTube.',
  },
  {
    name: 'Arnold',
    id: 'VR6AewLTigWG4xSOukaG',
    gender: 'Male',
    bestFor: 'Deep, powerful, cinematic',
    style: 'Dramatic',
    accent: 'American (Baritone)',
    previewTone: 'Movie trailer baritone, epic video games, suspenseful thrillers.',
  },
  {
    name: 'Adam',
    id: 'pNInz6obpgDQGcFmaJgB',
    gender: 'Male',
    bestFor: 'Clear male narrator',
    style: 'Professional',
    accent: 'American (Broadcast)',
    previewTone: 'Gold-standard newsreader, explainer videos & audiobooks.',
  },
  {
    name: 'Sam',
    id: 'yoZ06aMxZJJ28mfd3POQ',
    gender: 'Male',
    bestFor: 'Young male, modern',
    style: 'Casual',
    accent: 'American (Contemporary)',
    previewTone: 'Youthful, tech-savvy, great for gaming, Discord & tutorials.',
  },
];

export function getVoiceByNameOrId(key: string): ElevenLabsVoice | undefined {
  if (!key) return undefined;
  const lower = key.toLowerCase().trim();
  return ELEVENLABS_VOICES.find(
    (v) => v.name.toLowerCase() === lower || v.id.toLowerCase() === lower
  );
}

export function generateElevenLabsCurl(voiceId: string, text: string): string {
  const sanitizedText = text.replace(/"/g, '\\"').replace(/\n/g, ' ');
  return `curl -X POST "https://api.elevenlabs.io/v1/text-to-speech/${voiceId}" \\
  -H "xi-api-key: YOUR_ELEVENLABS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "${sanitizedText}",
    "model_id": "eleven_multilingual_v2",
    "voice_settings": {
      "stability": 0.5,
      "similarity_boost": 0.75
    }
  }' \\
  --output "speech.mp3"`;
}

export function generateElevenLabsPython(voiceId: string, text: string): string {
  const sanitizedText = text.replace(/"""/g, "'''");
  return `import requests

url = "https://api.elevenlabs.io/v1/text-to-speech/${voiceId}"
headers = {
    "xi-api-key": "YOUR_ELEVENLABS_API_KEY",
    "Content-Type": "application/json"
}
payload = {
    "text": """${sanitizedText}""",
    "model_id": "eleven_multilingual_v2",
    "voice_settings": {
        "stability": 0.5,
        "similarity_boost": 0.75
    }
}

response = requests.post(url, json=payload, headers=headers)
with open("speech.mp3", "wb") as f:
    f.write(response.content)
print("Speech generated successfully!")`;
}
