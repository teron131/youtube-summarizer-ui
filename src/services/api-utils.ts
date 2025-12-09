/**
 * API utility functions for YouTube URL handling and formatting
 */

export function isValidYouTubeUrl(url: string): boolean {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase();
    
    // Check for YouTube domains
    const isYouTube = domain === 'youtube.com' || 
                      domain === 'www.youtube.com' || 
                      domain === 'youtu.be' || 
                      domain === 'm.youtube.com';
    
    if (!isYouTube) return false;
    
    // Check for valid video ID
    const videoId = extractVideoId(url);
    return videoId.length === 11;
  } catch {
    return false;
  }
}

export function extractVideoId(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // youtu.be format
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    }
    
    // youtube.com format
    if (urlObj.hostname.includes('youtube.com')) {
      const videoId = urlObj.searchParams.get('v');
      if (videoId) return videoId;
      
      // /embed/ or /v/ format
      const match = urlObj.pathname.match(/\/(embed|v)\/([^/?]+)/);
      if (match) return match[2];
    }
    
    return '';
  } catch {
    return '';
  }
}

export function getThumbnailUrl(
  videoId: string, 
  quality: 'default' | 'hq' | 'mq' | 'sd' | 'maxres' = 'hq'
): string {
  const qualityMap = {
    'default': 'default',
    'mq': 'mqdefault',
    'hq': 'hqdefault',
    'sd': 'sddefault',
    'maxres': 'maxresdefault',
  };
  
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

export function formatProcessingTime(timeStr: string): string {
  if (!timeStr) return '0s';
  
  // Extract number and unit
  const match = timeStr.match(/^([\d.]+)([smh])$/);
  if (!match) return timeStr;
  
  const [, value, unit] = match;
  const num = parseFloat(value);
  
  if (unit === 's' && num < 60) {
    return `${num.toFixed(1)}s`;
  }
  
  if (unit === 's' && num >= 60) {
    const minutes = Math.floor(num / 60);
    const seconds = Math.floor(num % 60);
    return `${minutes}m ${seconds}s`;
  }
  
  if (unit === 'm') {
    return `${Math.floor(num)}m`;
  }
  
  if (unit === 'h') {
    return `${Math.floor(num)}h`;
  }
  
  return timeStr;
}

export function formatViewCount(count: number): string {
  if (count >= 1000000000) {
    return `${(count / 1000000000).toFixed(1)}B`;
  }
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

export function formatDuration(durationStr: string): string {
  if (!durationStr) return '0:00';
  
  // Parse ISO 8601 duration (e.g., PT4M13S)
  const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return durationStr;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function createRequestKey(endpoint: string, options: RequestInit): string {
  return `${endpoint}-${JSON.stringify(options)}`;
}

