export type ItemCategory = 'Seating' | 'Rugs' | 'Lighting' | 'Tables' | 'Decor';

export interface ShoppableItem {
  id: string;
  name: string;
  retailer: string;
  category: ItemCategory;
  price: string;
  dimensions: string;
  material: string;
  url: string;
  isRefinedPick?: boolean;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface StyleDefinition {
  id: string;
  name: string;
  eraLabel: string;
  summary: string;
  materials: string[];
  palette: { name: string; hex: string }[];
  promptDirective: string;
  demoImageUrl?: string;
  curatedItems: ShoppableItem[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  appliedVisualEdit?: boolean;
  visualEditNotice?: string;
  shoppableItems?: ShoppableItem[];
  groundingSources?: GroundingSource[];
}

export interface RoomAsset {
  url: string;
  label: string;
  isDemo: boolean;
  mimeType?: string;
  base64?: string;
}
