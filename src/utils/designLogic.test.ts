import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildRefinementPrompt,
  buildStyleTransformPrompt,
  clampSplitPercentage,
  detectVisualEditIntent,
  isSafeHttpUrl,
  parseShoppableItemsFromResponse,
  validateUploadedImageFile,
} from './designLogic';

test('clampSplitPercentage clamps bounds and handles non-finite numbers', () => {
  assert.equal(clampSplitPercentage(48.6), 49);
  assert.equal(clampSplitPercentage(-15), 0);
  assert.equal(clampSplitPercentage(142), 100);
  assert.equal(clampSplitPercentage(Number.NaN), 50);
});

test('validateUploadedImageFile enforces supported MIME types and size limits', () => {
  assert.deepEqual(
    validateUploadedImageFile({ name: 'living-room.jpg', type: 'image/jpeg', size: 2_500_000 }),
    { valid: true }
  );
  assert.equal(
    validateUploadedImageFile({ name: 'floorplan.pdf', type: 'application/pdf', size: 100_000 }).valid,
    false
  );
  assert.equal(
    validateUploadedImageFile({ name: 'huge.png', type: 'image/png', size: 25 * 1024 * 1024 }).valid,
    false
  );
  assert.equal(
    validateUploadedImageFile({ name: 'empty.webp', type: 'image/webp', size: 0 }).valid,
    false
  );
});

test('detectVisualEditIntent distinguishes room visual edits from pure shopping queries', () => {
  assert.equal(detectVisualEditIntent('Keep this layout but make the rug blue'), true);
  assert.equal(detectVisualEditIntent('Swap the coffee table for honed travertine'), true);
  assert.equal(detectVisualEditIntent('Add a tall olive tree near the window'), true);
  assert.equal(detectVisualEditIntent('Where can I buy a similar walnut coffee table?'), false);
  assert.equal(detectVisualEditIntent('What dimensions should my area rug be?'), false);
});

test('isSafeHttpUrl allows http/https and rejects javascript/data URLs', () => {
  assert.equal(isSafeHttpUrl('https://www.dwr.com/living-rugs'), true);
  assert.equal(isSafeHttpUrl('javascript:alert(1)'), false);
  assert.equal(isSafeHttpUrl('not-a-url'), false);
});

test('parseShoppableItemsFromResponse strips fenced block and normalizes safe shopping links', () => {
  const raw = `A cobalt hand-knotted wool rug grounds the cognac leather sofa beautifully.

\`\`\`shoppable
[
  {
    "name": "Indigo Flatweave Wool Rug",
    "retailer": "Nordic Knots",
    "category": "Rugs",
    "price": "$895",
    "dimensions": "8' x 10'",
    "material": "New Zealand Wool",
    "url": "javascript:alert(1)"
  },
  {
    "name": "Sculpted Walnut Coffee Table",
    "retailer": "Article",
    "category": "Tables",
    "price": "$549",
    "dimensions": "48\\" W x 24\\" D",
    "material": "Solid Walnut",
    "url": "https://www.article.com"
  }
]
\`\`\``;

  const result = parseShoppableItemsFromResponse(raw, [
    { title: 'Nordic Knots Indigo Wool Rug', uri: 'https://nordicknots.com/us/product/indigo-rug' },
  ]);

  assert.equal(result.cleanReply, 'A cobalt hand-knotted wool rug grounds the cognac leather sofa beautifully.');
  assert.equal(result.items.length, 2);
  assert.equal(result.items[0].url, 'https://nordicknots.com/us/product/indigo-rug');
  assert.equal(result.items[0].category, 'Rugs');
  assert.equal(result.items[0].isRefinedPick, true);
  assert.equal(result.items[1].url, 'https://www.article.com');
});

test('prompt builders preserve architectural constraints and custom instructions', () => {
  const transform = buildStyleTransformPrompt('Scandinavian Minimal', 'Pale oak and bouclé', 'Include sheer linen curtains');
  assert.match(transform, /Scandinavian Minimal/);
  assert.match(transform, /preserve the exact architectural shell/i);
  assert.match(transform, /Include sheer linen curtains/);

  const refine = buildRefinementPrompt('Mid-Century Modern', 'Keep this layout but make the rug blue');
  assert.match(refine, /Mid-Century Modern/);
  assert.match(refine, /Keep this layout but make the rug blue/);
});
