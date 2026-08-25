// ─────────────────────────────────────────────
// BYOK — Provider Registry
// ─────────────────────────────────────────────
// Central registry mapping ProviderId → AIProvider implementation.
// The Smart Router and UI query the registry to discover available providers.
// ─────────────────────────────────────────────

import React from 'react';
import type { AIProvider, ProviderId } from './types';
import { geminiProvider } from './gemini';
import { groqProvider } from './groq';
import { openrouterProvider } from './openrouter';

const OpenRouterLogo = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
    <path d="M 2 10 C 8 10, 9 4, 15 4 V 1 L 23 6 L 15 11 V 8 C 11 8, 9 10.5, 8 12 C 9 13.5, 11 16, 15 16 V 13 L 23 18 L 15 23 V 20 C 9 20, 8 14, 2 14 Z" />
  </svg>
);

/**
 * All registered providers, keyed by their ID.
 * To add a new provider in the future:
 * 1. Create a new file implementing AIProvider.
 * 2. Add the ID to the ProviderId union in types.ts.
 * 3. Register it here.
 */
const providers: Record<ProviderId, AIProvider> = {
  gemini: geminiProvider,
  groq: groqProvider,
  openrouter: openrouterProvider,
};

/** Get a specific provider by ID. */
export function getProvider(id: ProviderId): AIProvider {
  const provider = providers[id];
  if (!provider) throw new Error(`Unknown provider: ${id}`);
  return provider;
}

/** Get all registered providers. */
export function getAllProviders(): AIProvider[] {
  return Object.values(providers);
}

/** Get all registered provider IDs. */
export function getAllProviderIds(): ProviderId[] {
  return Object.keys(providers) as ProviderId[];
}

/**
 * Provider display metadata for the UI.
 * Icons, colors, descriptions — kept separate from the provider implementation.
 */
export const PROVIDER_META: Record<
  ProviderId,
  {
    name: string;
    icon: React.ReactNode;
    color: string;
    description: string;
  }
> = {
  gemini: {
    name: 'Gemini',
    icon: <span>✦</span>,
    color: '#4285F4',
    description: 'Google\'s most capable AI models',
  },
  groq: {
    name: 'Groq',
    icon: <span>⚡</span>,
    color: '#F55036',
    description: 'Ultra-fast inference on custom hardware',
  },
  openrouter: {
    name: 'OpenRouter',
    icon: <OpenRouterLogo />,
    color: '#6366F1',
    description: 'Access hundreds of AI models through one API',
  },
};
