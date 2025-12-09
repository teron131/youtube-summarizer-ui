/**
 * Form validation utilities
 */

import { isValidYouTubeUrl } from './url-utils';

/**
 * Validate YouTube URL input
 */
export function validateYouTubeUrl(url: string): { 
  isValid: boolean; 
  error?: string 
} {
  const trimmed = url.trim();
  
  // Empty is valid (for example mode)
  if (trimmed.length === 0) {
    return { isValid: true };
  }
  
  // Check YouTube URL format
  if (!isValidYouTubeUrl(trimmed)) {
    return { 
      isValid: false, 
      error: 'Please enter a valid YouTube URL (youtube.com or youtu.be).' 
    };
  }
  
  return { isValid: true };
}

/**
 * Check if form input is valid (for button enabling)
 */
export function isFormValid(url: string): boolean {
  const trimmed = url.trim();
  return trimmed.length === 0 || isValidYouTubeUrl(trimmed);
}

/**
 * Prepare processing options for API
 */
export function prepareProcessingOptions(
  targetLanguage: string,
  analysisModel: string,
  qualityModel: string
): {
  targetLanguage?: string;
  analysisModel?: string;
  qualityModel?: string;
} {
  const options = {
    analysisModel,
    qualityModel,
  } as {
    targetLanguage?: string;
    analysisModel?: string;
    qualityModel?: string;
  };

  // Convert "auto" to undefined for backend (auto-detect)
  if (targetLanguage !== "auto") {
    options.targetLanguage = targetLanguage;
  }

  return options;
}

