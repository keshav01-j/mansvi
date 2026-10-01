import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // ElevenLabs Voice Selection & Speech Preparation Endpoint
  app.post('/api/prepare-tts', async (req, res) => {
    try {
      const { paragraph, styleNote, preferredGender } = req.body;
      if (!paragraph || typeof paragraph !== 'string' || paragraph.trim().length === 0) {
        return res.status(400).json({ error: 'Please provide a valid paragraph.' });
      }

      let systemInstruction = `You are an expert Voice Selection & Speech Preparation Assistant specialized in ElevenLabs.

Your job has two parts:

1. **Choose the best voice** for the given paragraph
2. **Prepare the text** perfectly for natural speech

### Available Voices (you must choose only from these):

| Voice Name          | Voice ID                  | Best For                          | Style                  |
|---------------------|---------------------------|-----------------------------------|------------------------|
| Rachel              | 21m00Tcm4TlvDq8ikWAM     | Clear, professional, storytelling | Calm & natural         |
| Domi                | AZnzlk1XvdvUeBnXmlld     | Energetic, young, friendly        | Upbeat                 |
| Bella               | EXAVITQu4vr4xnSDxMaL     | Soft, emotional, warm             | Empathetic             |
| Antoni              | ErXwobaYiN019PkySvjV     | Deep male, authoritative          | Serious & strong       |
| Elli                | MF3mGyEYCl7XYWbV9V6O     | Soft female, gentle               | Calm & caring          |
| Josh                | TxGEqnHWrfWFTfGW9XjX     | Conversational male               | Casual & friendly      |
| Arnold              | VR6AewLTigWG4xSOukaG     | Deep, powerful, cinematic         | Dramatic               |
| Adam                | pNInz6obpgDQGcFmaJgB     | Clear male narrator               | Professional           |
| Sam                 | yoZ06aMxZJJ28mfd3POQ     | Young male, modern                | Casual                 |

### Rules you must follow:

1. Analyze the paragraph’s:
   - Emotion (happy, sad, serious, exciting, calm, etc.)
   - Content type (story, announcement, educational, motivational, casual chat, etc.)
   - Gender preference (if any${preferredGender ? `: user prefers ${preferredGender}` : ''})
   - Energy level

2. Choose the **single best matching Voice ID** from the table above.

3. Prepare the paragraph for speech:
   - Keep original meaning 100%
   - Improve punctuation and natural pauses
   - Expand numbers and abbreviations for spoken language
   - Make it flow naturally when spoken

4. Your output must be in this exact format (nothing else):

Selected Voice: [Voice Name]
Voice ID: [Voice ID]
Reason: [One short sentence why you chose this voice]

Clean Text:
[the final cleaned paragraph ready for ElevenLabs]

Do not add any extra text, markdown, or explanations outside this format.`;

      if (styleNote) {
        systemInstruction += `\nAdditional user hint: ${styleNote}. Maintain 100% meaning and follow the exact 4-line output format.`;
      }

      const prompt = `User's paragraph:\n${paragraph.trim()}`;

      // Candidates with fallback in case of high load
      const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
      let rawOutput = '';
      let lastError: any = null;

      for (const model of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.25,
            },
          });
          rawOutput = response.text?.trim() || '';
          if (rawOutput) break;
        } catch (err: any) {
          console.warn(`Model ${model} issue:`, err.message || err);
          lastError = err;
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      if (!rawOutput) {
        throw lastError || new Error('Failed to generate response from model.');
      }

      // Parse the strict output format
      const voiceMatch = rawOutput.match(/Selected Voice:\s*([^\n\r]+)/i);
      const idMatch = rawOutput.match(/Voice ID:\s*([^\n\r]+)/i);
      const reasonMatch = rawOutput.match(/Reason:\s*([^\n\r]+)/i);
      const cleanTextMatch = rawOutput.match(/Clean Text:\s*([\s\S]+)$/i);

      const selectedVoice = voiceMatch ? voiceMatch[1].trim() : 'Rachel';
      const voiceId = idMatch ? idMatch[1].trim() : '21m00Tcm4TlvDq8ikWAM';
      const reason = reasonMatch ? reasonMatch[1].trim() : 'Clear, natural delivery suited for this content.';
      let cleanText = cleanTextMatch ? cleanTextMatch[1].trim() : rawOutput;

      // In case the model wrapped clean text in quotes or extra markdown codeblocks
      cleanText = cleanText.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();

      return res.json({
        original: paragraph,
        prepared: cleanText,
        selectedVoice,
        voiceId,
        reason,
        rawOutput,
      });
    } catch (err: any) {
      console.error('Error in ElevenLabs TTS preparation:', err);
      return res.status(500).json({
        error: err.message || 'Failed to prepare speech with Gemini AI.',
      });
    }
  });

  // Audio Preview Synthesis using Gemini 3.8 Flash Lite TTS
  app.post('/api/generate-speech', async (req, res) => {
    try {
      const { text, voiceName = 'Rachel' } = req.body;
      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({ error: 'No text provided for speech generation.' });
      }

      // Map ElevenLabs voice persona to Gemini TTS voice persona
      let geminiVoice = 'Kore';
      let styleInstruction = 'Clear, natural, professional speaker';

      switch (voiceName.toLowerCase()) {
        case 'rachel':
          geminiVoice = 'Kore';
          styleInstruction = 'Calm, clear, natural, professional storytelling';
          break;
        case 'domi':
          geminiVoice = 'Zephyr';
          styleInstruction = 'Energetic, young, friendly, upbeat';
          break;
        case 'bella':
          geminiVoice = 'Kore';
          styleInstruction = 'Soft, emotional, warm, empathetic';
          break;
        case 'antoni':
          geminiVoice = 'Charon';
          styleInstruction = 'Deep male, authoritative, serious and strong';
          break;
        case 'elli':
          geminiVoice = 'Kore';
          styleInstruction = 'Soft female, gentle, calm and caring';
          break;
        case 'josh':
          geminiVoice = 'Puck';
          styleInstruction = 'Conversational male, casual, approachable and friendly';
          break;
        case 'arnold':
          geminiVoice = 'Charon';
          styleInstruction = 'Deep, powerful, cinematic, dramatic movie narrator';
          break;
        case 'adam':
          geminiVoice = 'Fenrir';
          styleInstruction = 'Clear male narrator, authoritative and professional broadcast';
          break;
        case 'sam':
          geminiVoice = 'Puck';
          styleInstruction = 'Young male, modern, casual everyday cadence';
          break;
        default:
          geminiVoice = 'Kore';
      }

      const textToSynthesize = text.slice(0, 3000);

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: textToSynthesize,
                speechMetadata: {
                  style: styleInstruction,
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: geminiVoice },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (!base64Audio) {
        return res.status(500).json({ error: 'No audio returned from speech synthesis.' });
      }

      return res.json({
        audioBase64: base64Audio,
        mimeType: 'audio/wav',
        geminiVoiceUsed: geminiVoice,
        elevenLabsVoice: voiceName,
      });
    } catch (err: any) {
      console.error('Error generating audio:', err);
      return res.status(500).json({
        error: err.message || 'Speech preview generation failed.',
      });
    }
  });

  // Static or Vite Dev middleware
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`ElevenPrep Studio server listening at http://0.0.0.0:${port}`);
  });
}

startServer();
