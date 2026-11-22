import type { GroundingSource, ItemCategory, ShoppableItem } from '../types';

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

const MAX_UPLOAD_BYTES = 12 * 1024 * 1024; // 12 MB

export function clampSplitPercentage(value: number): number {
  if (!Number.isFinite(value)) {
    return 50;
  }
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function validateUploadedImageFile(file: {
  type: string;
  size: number;
  name: string;
}): { valid: boolean; error?: string } {
  const normalizedType = file.type.toLowerCase().trim();
  if (!ALLOWED_IMAGE_MIME_TYPES.has(normalizedType)) {
    return {
      valid: false,
      error: 'Please upload a JPG, PNG, or WebP photograph of your room.',
    };
  }
  if (file.size <= 0) {
    return {
      valid: false,
      error: 'The selected file appears to be empty.',
    };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      valid: false,
      error: 'Please choose an image smaller than 12 MB.',
    };
  }
  return { valid: true };
}

const VISUAL_EDIT_PATTERNS: RegExp[] = [
  /\b(make|turn|change|swap|replace|paint|recolor|re-color|stain|dye)\b/i,
  /\b(add|remove|delete|place|put|hang|mount|install|introduce)\b.*\b(rug|sofa|couch|chair|table|lamp|light|lighting|pendant|chandelier|sconce|curtain|drape|plant|tree|foliage|greenery|fig|art|artwork|painting|mirror|pillow|cushion|throw|shelf|bookshelf|credenza|cabinet|wall|floor|ceiling|vase|ottoman|bench)\b/i,
  /\bkeep (this|the) (layout|room|sofa|walls?|floor)\b/i,
  /\b(warmer|cooler|darker|brighter|lighter|cozier|more minimal)\b.*\b(tone|palette|lighting|wood|walls?|rug|sofa|look|vibe)\b/i,
  /\b(blue|green|emerald|navy|sage|ivory|cream|walnut|oak|marble|travertine|velvet|leather|linen|brass|black|charcoal|terracotta|ochre)\s+(rug|sofa|couch|chair|table|curtains?|drapes?|walls?|lamp|pillows?)\b/i,
];

const PURE_SHOPPING_OR_INFO_PATTERNS: RegExp[] = [
  /^\s*(where|how much|what size|what dimensions|find|show me|give me|recommend|link|links|shop|buy)\b/i,
];

export function detectVisualEditIntent(message: string): boolean {
  const trimmed = message.trim();
  if (!trimmed) {
    return false;
  }
  const hasExplicitEdit = VISUAL_EDIT_PATTERNS.some((regex) => regex.test(trimmed));
  if (hasExplicitEdit) {
    return true;
  }
  if (PURE_SHOPPING_OR_INFO_PATTERNS.some((regex) => regex.test(trimmed))) {
    return false;
  }
  return false;
}

export function isSafeHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

const VALID_CATEGORIES = new Set<ItemCategory>([
  'Seating',
  'Rugs',
  'Lighting',
  'Tables',
  'Decor',
]);

function normalizeCategory(raw: unknown): ItemCategory {
  if (typeof raw === 'string') {
    const match = Array.from(VALID_CATEGORIES).find(
      (cat) => cat.toLowerCase() === raw.trim().toLowerCase()
    );
    if (match) return match;
    if (/sofa|chair|bench|ottoman|seat/i.test(raw)) return 'Seating';
    if (/rug|carpet|kilim|runner/i.test(raw)) return 'Rugs';
    if (/lamp|light|chandelier|pendant|sconce/i.test(raw)) return 'Lighting';
    if (/table|desk|credenza|console|plinth/i.test(raw)) return 'Tables';
  }
  return 'Decor';
}

export function buildSafeRetailerSearchUrl(itemName: string, retailer?: string): string {
  const query = encodeURIComponent(
    retailer && retailer.trim() ? `${retailer.trim()} ${itemName.trim()}` : itemName.trim()
  );
  return `https://www.google.com/search?tbm=shop&q=${query}`;
}

export function parseShoppableItemsFromResponse(
  rawText: string,
  groundingSources: GroundingSource[] = []
): { cleanReply: string; items: ShoppableItem[] } {
  const blockRegex = /```shoppable\s*([\s\S]*?)```/i;
  const match = rawText.match(blockRegex);

  let cleanReply = rawText;
  const items: ShoppableItem[] = [];

  if (match) {
    cleanReply = rawText.replace(blockRegex, '').trim();
    try {
      const parsed = JSON.parse(match[1].trim());
      const rawList = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.items) ? parsed.items : [];
      rawList.forEach((entry: Record<string, unknown>, idx: number) => {
        const name = typeof entry.name === 'string' ? entry.name.trim() : '';
        if (!name) return;
        const retailer =
          typeof entry.retailer === 'string' && entry.retailer.trim()
            ? entry.retailer.trim()
            : 'Curated Design Source';
        const rawUrl = typeof entry.url === 'string' ? entry.url.trim() : '';
        const matchingGrounding = groundingSources.find(
          (src) =>
            isSafeHttpUrl(src.uri) &&
            (src.title.toLowerCase().includes(name.toLowerCase().split(' ')[0]) ||
              src.title.toLowerCase().includes(retailer.toLowerCase().split(' ')[0]))
        );
        const resolvedUrl = isSafeHttpUrl(rawUrl)
          ? rawUrl
          : matchingGrounding?.uri ?? buildSafeRetailerSearchUrl(name, retailer);

        items.push({
          id: `refined-${Date.now()}-${idx}`,
          name,
          retailer,
          category: normalizeCategory(entry.category),
          price:
            typeof entry.price === 'string' && entry.price.trim()
              ? entry.price.trim()
              : 'Est. $450–$950',
          dimensions:
            typeof entry.dimensions === 'string' && entry.dimensions.trim()
              ? entry.dimensions.trim()
              : 'Standard Room Scale',
          material:
            typeof entry.material === 'string' && entry.material.trim()
              ? entry.material.trim()
              : 'Natural Architectural Finish',
          url: resolvedUrl,
          isRefinedPick: true,
        });
      });
    } catch {
      // Keep cleanReply even if structured block failed to parse
    }
  }

  return {
    cleanReply: cleanReply || rawText.trim(),
    items,
  };
}

export function buildStyleTransformPrompt(
  styleName: string,
  styleDirective: string,
  customNote?: string
): string {
  const extra = customNote && customNote.trim() ? ` Additional client preference: ${customNote.trim()}.` : '';
  return [
    `Reimagine this exact interior room photograph in authentic ${styleName} interior design.`,
    'Strictly preserve the exact architectural shell, wall boundaries, window placement, floor perspective, ceiling height, and camera angle from the source photograph.',
    `Design direction: ${styleDirective}.`,
    'Replace furnishings, textiles, rug, lighting fixtures, wall finishes, and styling accessories cohesively with photorealistic Architectural Digest editorial quality, realistic shadows, and natural daylight.',
    extra,
  ]
    .join(' ')
    .trim();
}

export function buildRefinementPrompt(baseStyleName: string, userInstruction: string): string {
  return [
    `Edit this interior room photograph (currently styled in ${baseStyleName}).`,
    `Client refinement request: "${userInstruction.trim()}".`,
    'Preserve the exact room architecture, window framing, camera perspective, and all unmentioned furniture pieces and layout.',
    'Apply only the requested refinement seamlessly with realistic materials, natural lighting, and editorial architectural photography fidelity.',
  ].join(' ');
}
