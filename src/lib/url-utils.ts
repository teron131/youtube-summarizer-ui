/**
 * URL validation and formatting utilities
 */

/**
 * Validate YouTube URL format
 */
export function isValidYouTubeUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  return trimmed.length === 0 || 
         trimmed.includes("youtube.com") || 
         trimmed.includes("youtu.be");
}

/**
 * Clean and normalize YouTube URL
 */
export function cleanVideoUrl(input?: string | null): string | null {
  if (!input) return null;
  try {
    const u = new URL(input);
    const host = u.hostname.replace(/^www\./, "");
    
    if (host.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/watch?v=${v}`;
      return `https://www.${host}${u.pathname}`;
    }
    
    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "");
      return id ? `https://www.youtube.com/watch?v=${id}` : "https://www.youtube.com";
    }
    
    return `https://www.${host}${u.pathname}`;
  } catch (e) {
    return input.replace(/^https?:\/\//, "").replace(/^www\./, "");
  }
}

/**
 * Example YouTube URLs for demonstration
 */
export const EXAMPLE_YOUTUBE_URLS = [
  "https://youtu.be/dQw4w9WgXcQ",
  "https://youtube.com/watch?v=jNQXAC9IVRw", 
  "https://youtube.com/watch?v=9bZkp7q19f0"
] as const;

