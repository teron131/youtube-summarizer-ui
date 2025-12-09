/**
 * Provider logo mappings
 */

import AnthropicLogo from "@/assets/logos/anthropic.svg";
import GoogleLogo from "@/assets/logos/google.svg";
import OpenAILogo from "@/assets/logos/openai.svg";
import XaiLogo from "@/assets/logos/xai.svg";

const LOGO_MAP = {
  google: GoogleLogo,
  anthropic: AnthropicLogo,
  openai: OpenAILogo,
  'x-ai': XaiLogo,
} as const;

export type Provider = keyof typeof LOGO_MAP;

/**
 * Get provider logo by name
 */
export function getProviderLogo(provider: string): string | null {
  return LOGO_MAP[provider as Provider] || null;
}

