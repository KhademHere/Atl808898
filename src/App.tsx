import React, { useCallback, useMemo, useRef, useState } from 'react';
import { AmbientBackdrop } from './components/AmbientBackdrop';
import { TopBar } from './components/TopBar';
import { CompareSlider } from './components/CompareSlider';
import { StyleCarousel } from './components/StyleCarousel';
import { ConsultantChat } from './components/ConsultantChat';
import { ShoppableIndex } from './components/ShoppableIndex';
import { DEMO_ORIGINAL_ROOM, DESIGN_STYLES } from './data/styles';
import type { ChatMessage, RoomAsset, ShoppableItem } from './types';
import { validateUploadedImageFile } from './utils/designLogic';
import { fileToBase64, urlToBase64 } from './utils/imageHelpers';

function buildInitialDemoMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const style of DESIGN_STYLES) {
    if (style.demoImageUrl) {
      map[style.id] = style.demoImageUrl;
    }
  }
  return map;
}

function formatNowTime(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function createInitialMessages(styleName: string): ChatMessage[] {
  return [
    {
      id: 'welcome-1',
      role: 'assistant',
      timestamp: formatNowTime(),
      text: `Welcome to Atelier Room. Your living room study is currently staged in ${styleName}. Drag the divider across the photograph above to inspect how the furnishings and lighting transform the space.\n\nTell me what you would like to adjust—such as "Keep this layout but make the rug blue" or "Find a lower walnut coffee table"—and I will advise on proportion, refine the visualization, and source shoppable matches.`,
    },
  ];
}

export default function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [originalRoom, setOriginalRoom] = useState<RoomAsset>(DEMO_ORIGINAL_ROOM);
  const [activeStyleId, setActiveStyleId] = useState<string>(DESIGN_STYLES[0].id);
  const [generatedImagesByStyle, setGeneratedImagesByStyle] = useState<Record<string, string>>(
    () => buildInitialDemoMap()
  );
  const [refinedLabelByStyle, setRefinedLabelByStyle] = useState<Record<string, string>>({});
  const [refinedItemsByStyle, setRefinedItemsByStyle] = useState<Record<string, ShoppableItem[]>>(
    {}
  );

  const [splitPercent, setSplitPercent] = useState<number>(50);
  const [resolution, setResolution] = useState<'1K' | '2K'>('1K');

  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [generatingLabel, setGeneratingLabel] = useState<string | undefined>(undefined);
  const [visualError, setVisualError] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    createInitialMessages(DESIGN_STYLES[0].name)
  );
  const [chatInput, setChatInput] = useState<string>('');
  const [applyVisualEdit, setApplyVisualEdit] = useState<boolean>(true);
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);

  const activeStyle = useMemo(
    () => DESIGN_STYLES.find((s) => s.id === activeStyleId) ?? DESIGN_STYLES[0],
    [activeStyleId]
  );

  const activeReimaginedUrl = generatedImagesByStyle[activeStyle.id];
  const activeReimaginedLabel = refinedLabelByStyle[activeStyle.id] ?? activeStyle.name;

  const activeShoppableItems = useMemo(() => {
    const refined = refinedItemsByStyle[activeStyle.id] ?? [];
    return [...refined, ...activeStyle.curatedItems];
  }, [activeStyle, refinedItemsByStyle]);

  const triggerFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const ingestRoomFile = useCallback(async (file: File) => {
    setVisualError(null);
    const validation = validateUploadedImageFile({
      name: file.name,
      type: file.type,
      size: file.size,
    });
    if (!validation.valid) {
      setVisualError(validation.error ?? 'Unsupported image file.');
      return;
    }

    try {
      const encoded = await fileToBase64(file);
      const cleanName = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
      setOriginalRoom({
        url: encoded.dataUrl,
        base64: encoded.base64,
        mimeType: encoded.mimeType,
        label: cleanName || 'Uploaded Space',
        isDemo: false,
      });
      setGeneratedImagesByStyle({});
      setRefinedLabelByStyle({});
      setSplitPercent(50);
      setMessages([
        {
          id: `upload-${Date.now()}`,
          role: 'assistant',
          timestamp: formatNowTime(),
          text: `Your room photo ("${cleanName || 'Uploaded Space'}") is loaded in the studio. Choose any style in the carousel below and click Generate Makeover to transform your space, or tell me what you'd like to change first.`,
        },
      ]);
    } catch (err) {
      setVisualError(err instanceof Error ? err.message : 'Could not read the uploaded photo.');
    }
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await ingestRoomFile(file);
    }
    e.target.value = '';
  };

  const handleDropFile = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await ingestRoomFile(file);
    }
  };

  const handleResetDemo = useCallback(() => {
    setOriginalRoom(DEMO_ORIGINAL_ROOM);
    setGeneratedImagesByStyle(buildInitialDemoMap());
    setRefinedLabelByStyle({});
    setRefinedItemsByStyle({});
    setActiveStyleId(DESIGN_STYLES[0].id);
    setSplitPercent(50);
    setVisualError(null);
    setChatError(null);
    setMessages(createInitialMessages(DESIGN_STYLES[0].name));
  }, []);

  const handleSelectStyle = useCallback((styleId: string) => {
    setActiveStyleId(styleId);
    setVisualError(null);
  }, []);

  const handleGenerateStyle = useCallback(
    async (styleId: string, customNote?: string) => {
      const style = DESIGN_STYLES.find((s) => s.id === styleId);
      if (!style) return;

      setActiveStyleId(styleId);
      setVisualError(null);
      setIsGeneratingImage(true);
      setGeneratingLabel(`Reimagining in ${style.name}...`);

      try {
        let imageBase64 = originalRoom.base64;
        let mimeType = originalRoom.mimeType;

        if (!imageBase64) {
          const encoded = await urlToBase64(originalRoom.url);
          imageBase64 = encoded.base64;
          mimeType = encoded.mimeType;
        }

        const response = await fetch('/api/design/transform', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64,
            mimeType,
            styleName: style.name,
            styleDirective: style.promptDirective,
            customNote,
            resolution,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Could not generate reimagined design.');
        }

        if (typeof data.imageDataUrl === 'string' && data.imageDataUrl) {
          setGeneratedImagesByStyle((prev) => ({
            ...prev,
            [style.id]: data.imageDataUrl,
          }));
          setRefinedLabelByStyle((prev) => ({
            ...prev,
            [style.id]: customNote ? `${style.name} · Custom` : style.name,
          }));
          setSplitPercent(50);
        }
      } catch (err) {
        setVisualError(
          err instanceof Error
            ? err.message
            : 'An error occurred while generating the room makeover.'
        );
      } finally {
        setIsGeneratingImage(false);
        setGeneratingLabel(undefined);
      }
    },
    [originalRoom, resolution]
  );

  const handleSendMessage = useCallback(
    async (rawText: string) => {
      const trimmed = rawText.trim();
      if (!trimmed || isSendingChat) return;

      setChatError(null);
      setChatInput('');

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        text: trimmed,
        timestamp: formatNowTime(),
      };

      const nextMessages = [...messages, userMessage];
      setMessages(nextMessages);
      setIsSendingChat(true);

      try {
        let currentRoomImageBase64: string | undefined;
        let currentRoomMimeType: string | undefined;

        const referenceUrl = activeReimaginedUrl || originalRoom.url;
        if (referenceUrl) {
          try {
            const encoded = await urlToBase64(referenceUrl);
            currentRoomImageBase64 = encoded.base64;
            currentRoomMimeType = encoded.mimeType;
          } catch {
            // Continue with text-only context if local image cannot be encoded
          }
        }

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: nextMessages.map((m) => ({ role: m.role, text: m.text })),
            activeStyleName: activeStyle.name,
            activeStyleSummary: activeStyle.summary,
            currentRoomImageBase64,
            currentRoomMimeType,
            requestVisualEdit: applyVisualEdit ? undefined : false,
            resolution,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'The design consultant could not respond right now.');
        }

        let appliedVisual = false;
        if (typeof data.refinedImageUrl === 'string' && data.refinedImageUrl) {
          setGeneratedImagesByStyle((prev) => ({
            ...prev,
            [activeStyle.id]: data.refinedImageUrl,
          }));
          setRefinedLabelByStyle((prev) => ({
            ...prev,
            [activeStyle.id]: `${activeStyle.name} · Refined`,
          }));
          setSplitPercent(45);
          appliedVisual = true;
        }

        if (Array.isArray(data.shoppableItems) && data.shoppableItems.length > 0) {
          setRefinedItemsByStyle((prev) => ({
            ...prev,
            [activeStyle.id]: [
              ...(data.shoppableItems as ShoppableItem[]),
              ...(prev[activeStyle.id] ?? []),
            ],
          }));
        }

        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text:
            typeof data.reply === 'string' && data.reply.trim()
              ? data.reply.trim()
              : 'I have reviewed your room and updated the design notes.',
          timestamp: formatNowTime(),
          appliedVisualEdit: appliedVisual,
          visualEditNotice:
            !appliedVisual && typeof data.visualEditError === 'string'
              ? data.visualEditError
              : undefined,
          shoppableItems: Array.isArray(data.shoppableItems) ? data.shoppableItems : undefined,
          groundingSources: Array.isArray(data.groundingSources)
            ? data.groundingSources
            : undefined,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        setChatError(
          err instanceof Error ? err.message : 'Unable to reach the design consultant.'
        );
      } finally {
        setIsSendingChat(false);
      }
    },
    [
      activeReimaginedUrl,
      activeStyle,
      applyVisualEdit,
      isSendingChat,
      messages,
      originalRoom.url,
      resolution,
    ]
  );

  const handleAskAboutItem = useCallback((item: ShoppableItem) => {
    setChatInput(
      `How would the ${item.name} (${item.material}) fit this room's proportions, and can you suggest one alternative around a similar budget?`
    );
    const inputEl = document.getElementById('consultant-prompt-input');
    inputEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    inputEl?.focus();
  }, []);

  return (
    <div
      className="relative min-h-screen text-[#141715]"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggingFile(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) {
          setIsDraggingFile(false);
        }
      }}
      onDrop={handleDropFile}
    >
      <AmbientBackdrop />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        aria-label="Upload room photograph"
        className="sr-only"
      />

      <TopBar onTriggerUpload={triggerFilePicker} />

      {isDraggingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-6 backdrop-blur-md">
          <div className="rounded-[28px] border border-white/40 bg-[#141D18]/80 px-10 py-8 text-center text-white shadow-2xl backdrop-blur-xl">
            <p className="font-editorial text-3xl font-medium">Drop your room photo here</p>
            <p className="mt-2 text-sm text-white/85">
              Supports JPG, PNG, and WebP photographs up to 12 MB
            </p>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-[1280px] space-y-10 px-5 pb-8 pt-8 sm:px-8 sm:pt-9">
        {/* Studio Hero & Primary Focal Anchor: Interactive Before / After Visualizer */}
        <section id="studio" aria-labelledby="studio-heading" className="space-y-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl space-y-1.5">
              <p className="text-xs font-medium text-[#464D49]">
                Interactive Architectural Makeover · Before &amp; After Visualization
              </p>
              <h1
                id="studio-heading"
                className="font-editorial text-[clamp(2rem,3.4vw,3rem)] leading-[1.08] font-medium tracking-tight text-[#141715] text-balance"
              >
                Reimagine your room before moving a single chair.
              </h1>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-[#464D49]">
              Drag across the frame to compare your original space against curated interior styles, then refine every detail with your consultant below.
            </p>
          </div>

          <CompareSlider
            originalImageUrl={originalRoom.url}
            originalLabel={originalRoom.label}
            reimaginedImageUrl={activeReimaginedUrl}
            reimaginedLabel={activeReimaginedLabel}
            splitPercent={splitPercent}
            onSplitChange={setSplitPercent}
            isGenerating={isGeneratingImage}
            generatingLabel={generatingLabel}
            isDemoRoom={originalRoom.isDemo}
            onGenerateCurrentStyle={() => handleGenerateStyle(activeStyle.id)}
            onTriggerUpload={triggerFilePicker}
            onResetDemo={handleResetDemo}
            errorMessage={visualError}
            onDismissError={() => setVisualError(null)}
          />
        </section>

        {/* Style Carousel & Material Dossier */}
        <StyleCarousel
          styles={DESIGN_STYLES}
          activeStyleId={activeStyle.id}
          generatedImagesByStyle={generatedImagesByStyle}
          isGenerating={isGeneratingImage}
          resolution={resolution}
          onResolutionChange={setResolution}
          onSelectStyle={handleSelectStyle}
          onGenerateStyle={handleGenerateStyle}
        />

        {/* Context-Aware Consultant Chat + Shoppable Index */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch">
          <div className="lg:col-span-7">
            <ConsultantChat
              messages={messages}
              activeStyleName={activeStyle.name}
              inputValue={chatInput}
              onInputChange={setChatInput}
              applyVisualEdit={applyVisualEdit}
              onToggleApplyVisualEdit={setApplyVisualEdit}
              isSending={isSendingChat}
              errorMessage={chatError}
              onSendMessage={handleSendMessage}
            />
          </div>

          <div className="lg:col-span-5">
            <ShoppableIndex
              activeStyleName={activeStyle.name}
              items={activeShoppableItems}
              onAskAboutItem={handleAskAboutItem}
            />
          </div>
        </div>
      </main>

      <footer className="px-5 pb-8 pt-6 sm:px-8">
        <div className="liquid-glass-dock mx-auto flex max-w-[1280px] flex-col items-start justify-between gap-4 rounded-[24px] px-6 py-5 text-xs text-[#464D49] sm:flex-row sm:items-center">
          <span className="font-editorial text-lg font-semibold text-[#141715]">
            Atelier Room
          </span>
          <div className="flex flex-wrap items-center gap-6">
            <a href="#studio" className="hover:text-[#141715] hover:underline underline-offset-4">
              Studio Visualizer
            </a>
            <a href="#styles" className="hover:text-[#141715] hover:underline underline-offset-4">
              Style Library
            </a>
            <a href="#consultation" className="hover:text-[#141715] hover:underline underline-offset-4">
              Design Consultation
            </a>
            <a href="#shoppable-index" className="hover:text-[#141715] hover:underline underline-offset-4">
              Shoppable Index
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
