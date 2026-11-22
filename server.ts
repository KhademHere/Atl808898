import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  formatGeminiError,
  generateRoomVisual,
  runConsultantChat,
  type IncomingChatTurn,
} from './server/gemini.ts';
import {
  buildRefinementPrompt,
  buildStyleTransformPrompt,
  detectVisualEditIntent,
  parseShoppableItemsFromResponse,
} from './src/utils/designLogic.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '20mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/api/design/transform', async (req, res) => {
    try {
      const { imageBase64, mimeType, styleName, styleDirective, customNote, resolution } = req.body ?? {};
      if (typeof imageBase64 !== 'string' || !imageBase64.trim()) {
        res.status(400).json({ error: 'A room photograph is required for transformation.' });
        return;
      }
      if (typeof styleName !== 'string' || !styleName.trim()) {
        res.status(400).json({ error: 'Please specify a target interior style.' });
        return;
      }

      const prompt = buildStyleTransformPrompt(
        styleName,
        typeof styleDirective === 'string' && styleDirective.trim()
          ? styleDirective
          : `${styleName} residential interior design`,
        typeof customNote === 'string' ? customNote : undefined
      );

      const result = await generateRoomVisual({
        imageBase64,
        mimeType: typeof mimeType === 'string' ? mimeType : 'image/jpeg',
        prompt,
        resolution: resolution === '2K' ? '2K' : '1K',
      });

      res.json({
        imageDataUrl: result.imageDataUrl,
        modelNotes: result.modelNotes,
      });
    } catch (err) {
      const formatted = formatGeminiError(err, true);
      res.status(formatted.status).json({
        error: formatted.message,
        code: formatted.code,
      });
    }
  });

  app.post('/api/chat', async (req, res) => {
    try {
      const {
        messages,
        activeStyleName,
        activeStyleSummary,
        currentRoomImageBase64,
        currentRoomMimeType,
        requestVisualEdit,
        resolution,
      } = req.body ?? {};

      if (!Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({ error: 'At least one message is required.' });
        return;
      }

      const sanitizedMessages: IncomingChatTurn[] = messages
        .filter(
          (m: unknown): m is IncomingChatTurn =>
            typeof m === 'object' &&
            m !== null &&
            ('role' in m && ((m as IncomingChatTurn).role === 'user' || (m as IncomingChatTurn).role === 'assistant')) &&
            ('text' in m && typeof (m as IncomingChatTurn).text === 'string' && (m as IncomingChatTurn).text.trim().length > 0)
        )
        .map((m) => ({ role: m.role, text: m.text.trim() }));

      if (sanitizedMessages.length === 0) {
        res.status(400).json({ error: 'Please enter a valid message.' });
        return;
      }

      const latestUserMessage = [...sanitizedMessages].reverse().find((m) => m.role === 'user')?.text ?? '';
      const styleName = typeof activeStyleName === 'string' && activeStyleName.trim() ? activeStyleName : 'Curated Modern';
      const styleSummary = typeof activeStyleSummary === 'string' ? activeStyleSummary : '';
      const hasRoomImage = typeof currentRoomImageBase64 === 'string' && currentRoomImageBase64.trim().length > 0;

      const shouldEditImage =
        hasRoomImage &&
        (requestVisualEdit === true ||
          (requestVisualEdit !== false && detectVisualEditIntent(latestUserMessage)));

      // Run text consultant (gemini-4-hydrogen + Google Search grounding)
      const chatPromise = runConsultantChat({
        messages: sanitizedMessages,
        activeStyleName: styleName,
        activeStyleSummary: styleSummary,
        currentRoomImageBase64: hasRoomImage ? currentRoomImageBase64 : undefined,
        currentRoomMimeType: typeof currentRoomMimeType === 'string' ? currentRoomMimeType : 'image/jpeg',
      });

      // Optionally run live visual refinement (gemini-nano-banana-2.1) in parallel
      const visualEditPromise: Promise<{ imageDataUrl?: string; visualEditError?: string }> = shouldEditImage
        ? generateRoomVisual({
            imageBase64: currentRoomImageBase64,
            mimeType: typeof currentRoomMimeType === 'string' ? currentRoomMimeType : 'image/jpeg',
            prompt: buildRefinementPrompt(styleName, latestUserMessage),
            resolution: resolution === '2K' ? '2K' : '1K',
          })
            .then((resVisual) => ({ imageDataUrl: resVisual.imageDataUrl }))
            .catch((editErr) => {
              const formatted = formatGeminiError(editErr, true);
              return { visualEditError: formatted.message };
            })
        : Promise.resolve({});

      const [chatResult, visualResult] = await Promise.all([chatPromise, visualEditPromise]);
      const parsed = parseShoppableItemsFromResponse(chatResult.rawText, chatResult.groundingSources);

      res.json({
        reply: parsed.cleanReply,
        shoppableItems: parsed.items,
        groundingSources: chatResult.groundingSources,
        refinedImageUrl: visualResult.imageDataUrl,
        visualEditError: visualResult.visualEditError,
        attemptedVisualEdit: shouldEditImage,
      });
    } catch (err) {
      const formatted = formatGeminiError(err, false);
      res.status(formatted.status).json({
        error: formatted.message,
        code: formatted.code,
      });
    }
  });

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api/')) {
          next();
          return;
        }
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Atelier Room server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
