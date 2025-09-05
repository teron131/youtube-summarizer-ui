/**
 * Configuration constants for the YouTube Summarizer application
 * ===============================
 *
 * This file contains all configuration options used throughout the application.
 * These values should be kept in sync with the backend configuration.
 */

// ================================
// MODEL CONFIGURATION
// ================================

export const AVAILABLE_MODELS = {
  "google/gemini-2.5-pro": "Gemini 2.5 Pro",
  "google/gemini-2.5-flash": "Gemini 2.5 Flash",
  "openai/gpt-5": "GPT-5",
  "openai/gpt-5-mini": "GPT-5 Mini",
  "anthropic/claude-sonnet-4": "Claude Sonnet 4",
  "x-ai/grok-4": "Grok 4",
  "x-ai/grok-code-fast-1": "Grok Code Fast 1",
} as const;

export const DEFAULT_ANALYSIS_MODEL = "google/gemini-2.5-pro";
export const DEFAULT_QUALITY_MODEL = "google/gemini-2.5-flash";

// ================================
// LANGUAGE CONFIGURATION
// ================================

export const SUPPORTED_LANGUAGES = {
  "auto": "🌐 Auto",
  "en": "🇺🇸 English",
  "zh-TW": "🇭🇰 Chinese",
  "ja": "🇯🇵 Japanese",
  "ko": "🇰🇷 Korean",
  "de": "🇩🇪 German",
} as const;

export const DEFAULT_TARGET_LANGUAGE = null;

// ================================
// QUALITY THRESHOLDS
// ================================

export const MIN_QUALITY_SCORE = 90;
export const MAX_ITERATIONS = 2;

// ================================
// TRANSLATION CONFIGURATION
// ================================

export const ENABLE_TRANSLATION_DEFAULT = false;

// ================================
// UI CONFIGURATION
// ================================

export const UI_CONFIG = {
  // Streaming configuration
  STREAM_CHUNK_THROTTLE_MS: 100,
  MAX_LOG_ENTRIES: 100,

  // Progress configuration
  PROGRESS_UPDATE_INTERVAL: 500,

  // File size limits (in MB)
  MAX_FILE_SIZE_MB: 100,

  // Timeout configurations
  API_TIMEOUT_MS: 300000, // 5 minutes
  SCRAPING_TIMEOUT_MS: 120000, // 2 minutes

  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
} as const;

// ================================
// TYPE DEFINITIONS
// ================================

export type ModelKey = keyof typeof AVAILABLE_MODELS;
export type LanguageKey = keyof typeof SUPPORTED_LANGUAGES;

export type AvailableModel = {
  key: ModelKey;
  label: string;
  provider: string;
  recommended?: boolean;
};

export type SupportedLanguage = {
  key: LanguageKey;
  label: string;
  flag?: string;
};

// ================================
// DERIVED DATA
// ================================

export const AVAILABLE_MODELS_LIST: AvailableModel[] = Object.entries(AVAILABLE_MODELS).map(
  ([key, label]) => ({
    key: key as ModelKey,
    label,
    provider: key.split('/')[0],
    recommended: key === DEFAULT_ANALYSIS_MODEL,
  })
);

export const SUPPORTED_LANGUAGES_LIST: SupportedLanguage[] = Object.entries(SUPPORTED_LANGUAGES).map(
  ([key, label]) => {
    // Extract flag emoji from the beginning of the label
    const flagRegex = /^([\u{1F1E6}-\u{1F1FF}🌐]+)/u;
    const flagMatch = label.match(flagRegex);
    const flag = flagMatch ? flagMatch[1] : "";
    const cleanLabel = label.replace(flag, "").trim();

    return {
      key: key as LanguageKey,
      label: cleanLabel,
      flag,
    };
  }
);

// ================================
// UTILITY FUNCTIONS
// ================================

export function getModelByKey(key: ModelKey): AvailableModel | undefined {
  return AVAILABLE_MODELS_LIST.find(model => model.key === key);
}

export function getLanguageByKey(key: LanguageKey): SupportedLanguage | undefined {
  return SUPPORTED_LANGUAGES_LIST.find(language => language.key === key);
}

export function isValidModel(model: string): model is ModelKey {
  return model in AVAILABLE_MODELS;
}

export function isValidLanguage(language: string): language is LanguageKey {
  return language in SUPPORTED_LANGUAGES;
}

// ================================
// VALIDATION
// ================================

export function validateModelSelection(analysisModel: string, qualityModel: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!isValidModel(analysisModel)) {
    errors.push(`Invalid analysis model: ${analysisModel}`);
  }

  if (!isValidModel(qualityModel)) {
    errors.push(`Invalid quality model: ${qualityModel}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateLanguageSelection(language: string): {
  isValid: boolean;
  error?: string;
} {
  if (!isValidLanguage(language)) {
    return {
      isValid: false,
      error: `Invalid language: ${language}`,
    };
  }

  return { isValid: true };
}

// ================================
// EXPORTS
// ================================

export default {
  AVAILABLE_MODELS,
  DEFAULT_ANALYSIS_MODEL,
  DEFAULT_QUALITY_MODEL,
  SUPPORTED_LANGUAGES,
  DEFAULT_TARGET_LANGUAGE,
  MIN_QUALITY_SCORE,
  MAX_ITERATIONS,
  ENABLE_TRANSLATION_DEFAULT,
  UI_CONFIG,
  AVAILABLE_MODELS_LIST,
  SUPPORTED_LANGUAGES_LIST,
  getModelByKey,
  getLanguageByKey,
  isValidModel,
  isValidLanguage,
  validateModelSelection,
  validateLanguageSelection,
};
