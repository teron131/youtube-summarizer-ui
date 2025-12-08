/**
 * Configuration Hook for YouTube Summarizer
 * ========================================
 *
 * Provides centralized access to application configuration
 * with backend synchronization and local fallback.
 *
 * Key Features:
 * - Meta-language avoidance: Clean, direct configuration without verbose descriptions
 * - Backend synchronization with automatic fallback to local config
 * - Type-safe configuration management
 */

import { ConfigurationResponse, getConfigurationWithFallback } from '@/services/api';
import {
  AVAILABLE_MODELS,
  AVAILABLE_MODELS_LIST,
  AVAILABLE_REFINER_MODELS_LIST,
  AVAILABLE_SUMMARIZER_MODELS_LIST,
  DEFAULT_ANALYSIS_MODEL,
  DEFAULT_QUALITY_MODEL,
  DEFAULT_TARGET_LANGUAGE,
  SUPPORTED_LANGUAGES,
  SUPPORTED_LANGUAGES_LIST,
  isValidLanguage,
  isValidModel,
  type AvailableModel,
  type SupportedLanguage,
} from '@/services/config';
import { useEffect, useState } from 'react';

interface UseConfigReturn {
  // Configuration data
  config: ConfigurationResponse | null;
  models: AvailableModel[];
  summarizerModels: AvailableModel[];
  refinerModels: AvailableModel[];
  languages: SupportedLanguage[];

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Utility functions
  getModelByKey: (key: string) => AvailableModel | undefined;
  getLanguageByKey: (key: string) => SupportedLanguage | undefined;
  isValidModel: (model: string) => boolean;
  isValidLanguage: (language: string) => boolean;

  // Refresh function
  refresh: () => Promise<void>;
}

export function useConfig(): UseConfigReturn {
  const [config, setConfig] = useState<ConfigurationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const configuration = await getConfigurationWithFallback();
      setConfig(configuration);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load configuration');
      // Use local fallback
      setConfig({
        status: 'success',
        message: 'Using local configuration fallback',
        available_models: AVAILABLE_MODELS,
        supported_languages: SUPPORTED_LANGUAGES,
        default_analysis_model: DEFAULT_ANALYSIS_MODEL,
        default_quality_model: DEFAULT_QUALITY_MODEL,
        default_target_language: DEFAULT_TARGET_LANGUAGE,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const getModelByKey = (key: string): AvailableModel | undefined => {
    return AVAILABLE_MODELS_LIST.find(model => model.key === key);
  };

  const getLanguageByKey = (key: string): SupportedLanguage | undefined => {
    return SUPPORTED_LANGUAGES_LIST.find(language => language.key === key);
  };

  const isValidModel = (model: string): boolean => {
    return config?.available_models ? model in config.available_models : model in AVAILABLE_MODELS;
  };

  const isValidLanguage = (language: string): boolean => {
    return config?.supported_languages ? language in config.supported_languages : language in SUPPORTED_LANGUAGES;
  };

  return {
    config,
    models: AVAILABLE_MODELS_LIST,
    summarizerModels: AVAILABLE_SUMMARIZER_MODELS_LIST,
    refinerModels: AVAILABLE_REFINER_MODELS_LIST,
    languages: SUPPORTED_LANGUAGES_LIST,
    isLoading,
    error,
    getModelByKey,
    getLanguageByKey,
    isValidModel,
    isValidLanguage,
    refresh: loadConfig,
  };
}

// ================================
// UTILITY HOOKS
// ================================

/**
 * Hook for model selection
 */
export function useModelSelection() {
  const { models, summarizerModels, refinerModels, getModelByKey, isValidModel } = useConfig();

  return {
    models,
    summarizerModels,
    refinerModels,
    getModelByKey,
    isValidModel,
    defaultModel: DEFAULT_ANALYSIS_MODEL,
    defaultQualityModel: DEFAULT_QUALITY_MODEL,
  };
}

/**
 * Hook for language selection
 */
export function useLanguageSelection() {
  const { languages, getLanguageByKey, isValidLanguage } = useConfig();

  return {
    languages,
    getLanguageByKey,
    isValidLanguage,
    defaultLanguage: DEFAULT_TARGET_LANGUAGE,
  };
}

/**
 * Hook for translation settings
 */
export function useTranslationSettings() {
  const { languages, getLanguageByKey, isValidLanguage } = useConfig();

  return {
    languages,
    getLanguageByKey,
    isValidLanguage,
    defaultLanguage: DEFAULT_TARGET_LANGUAGE,
    supportsTranslation: languages.length > 0,
  };
}

// ================================
// COOKIE-BASED USER PREFERENCES
// ================================

interface UserPreferences {
  analysisModel: string;
  qualityModel: string;
  targetLanguage: string;
}

const COOKIE_NAME = 'youtube-summarizer-prefs';
const COOKIE_EXPIRY_DAYS = 365; // 1 year

/**
 * Cookie utility functions
 */
function setCookie(name: string, value: string, days: number = COOKIE_EXPIRY_DAYS) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }
  return null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
}

/**
 * Hook for managing user preferences with cookie persistence
 */
export function useUserPreferences() {
  // Default preferences
  const defaultPreferences: UserPreferences = {
    analysisModel: DEFAULT_ANALYSIS_MODEL,
    qualityModel: DEFAULT_QUALITY_MODEL,
    targetLanguage: DEFAULT_TARGET_LANGUAGE || 'auto',
  };

  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    // Load preferences from cookies on initialization
    try {
      const cookieData = getCookie(COOKIE_NAME);
      if (cookieData) {
        const parsed = JSON.parse(cookieData);

        // Validate that the stored preferences are still valid
        const validated: UserPreferences = {
          analysisModel: isValidModel(parsed.analysisModel) ? parsed.analysisModel : defaultPreferences.analysisModel,
          qualityModel: isValidModel(parsed.qualityModel) ? parsed.qualityModel : defaultPreferences.qualityModel,
          targetLanguage: isValidLanguage(parsed.targetLanguage) ? parsed.targetLanguage : defaultPreferences.targetLanguage,
        };

        return validated;
      }
    } catch (error) {
      console.warn('Failed to load user preferences from cookie:', error);
    }
    return defaultPreferences;
  });

  // Save preferences to cookies whenever they change
  useEffect(() => {
    try {
      setCookie(COOKIE_NAME, JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save user preferences to cookie:', error);
    }
  }, [preferences]);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
    deleteCookie(COOKIE_NAME);
  };

  return {
    preferences,
    updatePreferences,
    resetPreferences,
  };
}
