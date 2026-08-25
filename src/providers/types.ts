// ─────────────────────────────────────────────
// BYOK — Provider & Model Type System
// ─────────────────────────────────────────────
// Providers and Models are strictly separated.
//   Provider → has many Models → user selects one Model
// Every provider request uses the USER's own API key.
// ─────────────────────────────────────────────

/** Supported provider identifiers — extend this union to add providers. */
export type ProviderId = 'gemini' | 'groq' | 'openrouter';

/** Capabilities a model can expose. Used by the Smart Router for filtering. */
export type ModelCapability =
  | 'text'
  | 'vision'
  | 'files'
  | 'longContext'
  | 'reasoning'
  | 'tools'
  | 'structuredOutput';

/** Input/output modality. */
export type Modality = 'text' | 'image' | 'audio' | 'video';

// ─────────────────────────────────────────────
// Model
// ─────────────────────────────────────────────

export interface ModelInfo {
  /** Provider-specific model ID (e.g. "gemini-2.5-flash", "llama-3.3-70b-versatile"). */
  id: string;
  /** Human-readable display name. */
  name: string;
  /** Which provider owns this model. */
  provider: ProviderId;
  /** Declared capabilities. */
  capabilities: ModelCapability[];
  /** Maximum context window in tokens. */
  contextLength: number;
  /** Supported modalities. */
  modality: Modality[];
  /** Whether this model is free-tier (relevant for OpenRouter). */
  isFree?: boolean;
  /** Optional description / tagline. */
  description?: string;
}

// ─────────────────────────────────────────────
// Chat Messages
// ─────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: MessageRole;
  content: string;
  /** Optional image/file attachments — prepared for future use. */
  attachments?: Attachment[];
}

export interface Attachment {
  type: 'image' | 'file';
  name: string;
  mimeType: string;
  /** Base64-encoded data or a blob URL. */
  data: string;
}

// ─────────────────────────────────────────────
// Provider Request / Response
// ─────────────────────────────────────────────

export interface SendMessageParams {
  /** The model ID to use for this request. */
  model: string;
  /** Conversation history. */
  messages: ChatMessage[];
  /** The user's API key — NEVER stored in chat history. */
  apiKey: string;
  /** AbortController signal for cancellation. */
  signal?: AbortSignal;
  /** Streaming callback — called with each text chunk as it arrives. */
  onChunk?: (chunk: string) => void;
}

export interface AIResponse {
  /** The full response text. */
  content: string;
  /** The model that was actually used. */
  model: string;
  /** The provider that handled the request. */
  provider: ProviderId;
  /** Round-trip latency in milliseconds. */
  latencyMs: number;
  /** Token usage, if the provider returns it. */
  tokenUsage?: TokenUsage;
}

export interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
}

// ─────────────────────────────────────────────
// Provider Interface
// ─────────────────────────────────────────────

/**
 * Every provider must implement this interface.
 * The registry holds one instance per ProviderId.
 */
export interface AIProvider {
  /** Unique identifier matching the ProviderId union. */
  id: ProviderId;
  /** Human-readable provider name. */
  name: string;
  /**
   * Validate that the given API key is functional.
   * Should make a lightweight API call (e.g. list models).
   * Must NEVER store or log the key.
   */
  validateKey(key: string): Promise<boolean>;
  /**
   * Retrieve available models for this provider.
   * For OpenRouter, this fetches the dynamic model catalog.
   */
  listModels(key: string): Promise<ModelInfo[]>;
  /**
   * Send a message and receive a response.
   * Supports streaming via `params.onChunk`.
   */
  sendMessage(params: SendMessageParams): Promise<AIResponse>;
}

// ─────────────────────────────────────────────
// Router Result
// ─────────────────────────────────────────────

export interface RouterResult {
  /** Selected provider. */
  provider: ProviderId;
  /** Selected model ID within that provider. */
  model: string;
  /** Confidence score 0–1. */
  confidence: number;
  /** Human-readable explanation of why this provider/model was chosen. */
  reason: string;
  /** Raw scores per provider (for debugging / UI). */
  scores: Record<ProviderId, number>;
}

// ─────────────────────────────────────────────
// Conversation
// ─────────────────────────────────────────────

export interface ConversationMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  /** Provider that generated this message (assistant messages only). */
  provider?: ProviderId;
  /** Model used (assistant messages only). */
  model?: string;
  /** Routing metadata (assistant messages only, Smart Mode). */
  routing?: {
    mode: 'smart' | ProviderId;
    confidence?: number;
    reason?: string;
    scores?: Record<ProviderId, number>;
    latencyMs?: number;
    tokenUsage?: TokenUsage;
  };
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ConversationMessage[];
}

// ─────────────────────────────────────────────
// Provider Connection State (for stores)
// ─────────────────────────────────────────────

export interface ProviderConnection {
  connected: boolean;
  selectedModel: string | null;
  availableModels: ModelInfo[];
  lastValidated?: number;
}

/** The mode the user has selected in the Composer. */
export type RoutingMode = 'smart' | ProviderId;
