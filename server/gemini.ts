import { GoogleGenAI } from '@google/genai';

let cachedClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    const err = new Error(
      'GEMINI_API_KEY is not configured. Please check Settings > Secrets to attach your API key.'
    ) as Error & { status?: number; code?: string };
    err.status = 500;
    err.code = 'MISSING_API_KEY';
    throw err;
  }

  if (!cachedClient) {
    cachedClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return cachedClient;
}

export interface FormattedApiError {
  status: number;
  code: string;
  message: string;
}

export function formatGeminiError(err: unknown, isPaidImageModel = false): FormattedApiError {
  const rawMessage = err instanceof Error ? err.message : String(err);
  const statusMatch = rawMessage.match(/\b(400|401|403|404|429|500|503)\b/);
  const explicitStatus =
    typeof err === 'object' && err !== null && 'status' in err && typeof (err as { status?: unknown }).status === 'number'
      ? (err as { status: number }).status
      : undefined;
  const status = explicitStatus ?? (statusMatch ? Number(statusMatch[1]) : 500);

  if (rawMessage.includes('MISSING_API_KEY') || rawMessage.includes('GEMINI_API_KEY is not configured')) {
    return {
      status: 500,
      code: 'MISSING_API_KEY',
      message: 'API key is not configured on the server. Please configure it in Settings > Secrets.',
    };
  }

  if (status === 403 || rawMessage.includes('PERMISSION_DENIED') || rawMessage.includes('API_KEY_INVALID')) {
    return {
      status: 403,
      code: 'PERMISSION_DENIED',
      message: isPaidImageModel
        ? 'Live AI image generation with gemini-nano-banana-2.1 requires a billing-enabled API key in Settings > Secrets.'
        : 'The Gemini API key could not be authorized. Please verify your API key in Settings > Secrets.',
    };
  }

  if (status === 429 || rawMessage.includes('RESOURCE_EXHAUSTED')) {
    return {
      status: 429,
      code: 'RESOURCE_EXHAUSTED',
      message: isPaidImageModel
        ? 'Image generation quota reached or paid tier required for gemini-nano-banana-2.1. You can attach a billing-enabled key in Settings > Secrets.'
        : 'Rate limit reached on the design consultant service. Please wait a moment and try again.',
    };
  }

  if (status === 404 || rawMessage.includes('NOT_FOUND')) {
    return {
      status: 404,
      code: 'MODEL_NOT_FOUND',
      message: 'The requested Gemini model was not found or is currently unavailable for this key.',
    };
  }

  return {
    status: status >= 400 && status < 600 ? status : 500,
    code: 'GEMINI_ERROR',
    message: rawMessage || 'An unexpected error occurred while communicating with the design engine.',
  };
}

export async function generateRoomVisual(params: {
  imageBase64: string;
  mimeType: string;
  prompt: string;
  resolution?: '1K' | '2K';
}): Promise<{ imageDataUrl: string; modelNotes?: string }> {
  const ai = getGeminiClient();
  const imageSize = params.resolution === '2K' ? '2K' : '1K';

  const response = await ai.models.generateContent({
    model: 'gemini-nano-banana-2.1',
    contents: {
      parts: [
        {
          inlineData: {
            data: params.imageBase64,
            mimeType: params.mimeType || 'image/jpeg',
          },
        },
        {
          text: params.prompt,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: '16:9',
        imageSize,
      },
    },
  });

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  let imageDataUrl = '';
  let modelNotes = '';

  for (const part of parts) {
    if (part.inlineData?.data) {
      const mime = part.inlineData.mimeType ?? 'image/png';
      imageDataUrl = `data:${mime};base64,${part.inlineData.data}`;
    } else if (part.text) {
      modelNotes += part.text;
    }
  }

  if (!imageDataUrl) {
    throw new Error('The image generation model returned no image output. Please try a different prompt.');
  }

  return {
    imageDataUrl,
    modelNotes: modelNotes.trim() || undefined,
  };
}

export interface IncomingChatTurn {
  role: 'user' | 'assistant';
  text: string;
}

export interface GroundingChunkResult {
  title: string;
  uri: string;
}

export async function runConsultantChat(params: {
  messages: IncomingChatTurn[];
  activeStyleName: string;
  activeStyleSummary: string;
  currentRoomImageBase64?: string;
  currentRoomMimeType?: string;
}): Promise<{ rawText: string; groundingSources: GroundingChunkResult[] }> {
  const ai = getGeminiClient();

  const systemInstruction = [
    'You are the Principal Interior Architect & Sourcing Consultant at Atelier Room.',
    'You advise homeowners on spatial proportion, color harmony, materials, lighting layers, and furniture sourcing for the exact room they are currently viewing.',
    `The client is currently exploring the "${params.activeStyleName}" concept (${params.activeStyleSummary}).`,
    'Keep your prose concise, authoritative, warm, and practical (2–4 focused paragraphs or crisp bullet points).',
    'Whenever the client asks to refine an element (for example, changing a rug color, swapping a table, or improving lighting) OR asks for shopping recommendations, use Google Search to find real, currently available furniture and decor pieces from reputable retailers (such as Design Within Reach, West Elm, CB2, Article, Rejuvenation, Nordic Knots, Crate & Barrel, Room & Board, Lulu and Georgia, Wayfair, IKEA).',
    'At the very end of your response, when recommending 2–4 specific shoppable pieces matching the conversation, append a fenced JSON block labeled ```shoppable ... ``` containing an array of objects with exact keys: "name", "retailer", "category" (one of "Seating", "Rugs", "Lighting", "Tables", "Decor"), "price" (e.g. "$699"), "dimensions" (e.g. "8\' x 10\'"), "material", and "url" (a real https:// product or category link if known, otherwise omit or leave empty string).',
    'Do not explain the ```shoppable``` block in your prose—just write natural architectural advice above it.',
  ].join('\n');

  const recentHistory = params.messages.slice(-12);
  const contents = recentHistory.map((turn, index) => {
    const isLastUserMessage = index === recentHistory.length - 1 && turn.role === 'user';
    const parts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = [];

    if (isLastUserMessage && params.currentRoomImageBase64) {
      parts.push({
        inlineData: {
          data: params.currentRoomImageBase64,
          mimeType: params.currentRoomMimeType || 'image/jpeg',
        },
      });
    }
    parts.push({ text: turn.text });

    return {
      role: turn.role === 'assistant' ? 'model' : 'user',
      parts,
    };
  });

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents,
    config: {
      systemInstruction,
      tools: [{ googleSearch: {} }],
    },
  });

  const rawText = (response.text ?? '').trim();
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
  const groundingSources: GroundingChunkResult[] = [];
  const seenUris = new Set<string>();

  for (const chunk of groundingChunks) {
    const uri = chunk.web?.uri;
    const title = chunk.web?.title;
    if (uri && !seenUris.has(uri)) {
      seenUris.add(uri);
      groundingSources.push({
        title: title || uri,
        uri,
      });
    }
  }

  return { rawText, groundingSources };
}
