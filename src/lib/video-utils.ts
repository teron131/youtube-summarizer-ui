/**
 * Video processing utilities
 */

import { StreamingProgressState } from '@/services/api';

export const PROGRESS_STEPS = [
  { step: 'scraping', name: "Scraping Video", description: "Extracting video info and transcript using Scrape Creators" },
  { step: 'analysis_generation', name: "Analysis Generation", description: "Generating initial AI analysis with Gemini model" },
  { step: 'quality_check', name: "Quality Assessment", description: "Evaluating analysis quality and completeness" },
  { step: 'refinement', name: "Analysis Refinement", description: "Refining analysis based on quality feedback" },
  { step: 'complete', name: "Complete", description: "Analysis completed successfully" },
] as const;

/**
 * Extract video ID from URL query parameters
 */
export function getVideoIdFromParams(): string {
  try {
    const params = new URLSearchParams(window.location.search);
    const videoId = params.get('v');
    
    // Validate video ID format (YouTube video IDs are typically 11 characters)
    if (videoId && /^[\w-]{11}$/.test(videoId)) {
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
  } catch (error) {
    console.error('Error parsing URL parameters:', error);
  }
  
  return '';
}

/**
 * Normalize step names for consistent UI display
 */
export function normalizeStepName(
  step: StreamingProgressState['step']
): StreamingProgressState['step'] {
  return step === 'analyzing' ? 'analysis_generation' : step;
}

/**
 * Find step index in progress steps array
 */
export function findStepIndex(step: StreamingProgressState['step']): number {
  const normalizedStep = normalizeStepName(step);
  return PROGRESS_STEPS.findIndex(s => s.step === normalizedStep);
}

/**
 * Sort progress states in correct order
 */
export function sortProgressStates(states: StreamingProgressState[]): StreamingProgressState[] {
  const order = ['scraping', 'analysis_generation', 'quality_check', 'refinement', 'complete'];
  return [...states].sort((a, b) => order.indexOf(a.step) - order.indexOf(b.step));
}

/**
 * Calculate progress percentage based on current step
 */
export function calculateProgressPercentage(
  currentStep: number,
  finished: boolean
): number {
  if (finished) return 100;
  
  const anchors = 5; // Start, Scrap, Analysis, Quality, Finish
  const stepToAnchor = [0, 1, 2, 3, 2, 4];
  const activeAnchor = stepToAnchor[Math.max(0, Math.min(currentStep, stepToAnchor.length - 1))];
  
  return (activeAnchor / (anchors - 1)) * 100;
}

/**
 * Get stage text for current step
 */
export function getStageText(step: number): string {
  const stages = ['Start', 'Scrap', 'Analysis', 'Quality', 'Finish'];
  return stages[Math.max(0, Math.min(step, stages.length - 1))] || 'Processing';
}

/**
 * Check if a step is completed in progress states
 */
export function isStepCompleted(
  states: StreamingProgressState[],
  step: StreamingProgressState['step']
): boolean {
  return states.some(s => s.step === step && s.status === 'completed');
}

/**
 * Check if a step is processing in progress states
 */
export function isStepProcessing(
  states: StreamingProgressState[],
  step: StreamingProgressState['step']
): boolean {
  return states.some(s => s.step === step && s.status === 'processing');
}

/**
 * Classify log type for styling
 */
export function classifyLogType(log: string): 'error' | 'success' | 'quality' | 'iteration' | 'default' {
  if (log.includes('❌') || log.includes('failed')) return 'error';
  if (log.includes('✅') || log.includes('completed')) return 'success';
  if (log.includes('quality') || log.includes('Quality')) return 'quality';
  if (log.includes('iteration') || log.includes('Iteration')) return 'iteration';
  return 'default';
}

/**
 * Get CSS class for log type
 */
export function getLogClassName(logType: ReturnType<typeof classifyLogType>): string {
  const classes = {
    error: 'text-red-400',
    success: 'text-green-400',
    quality: 'text-blue-400',
    iteration: 'text-purple-400 font-semibold',
    default: 'text-foreground',
  };
  return classes[logType];
}

