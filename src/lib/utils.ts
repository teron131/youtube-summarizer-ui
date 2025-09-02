import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ================================
// TIMESTAMP UTILITIES
// ================================

/**
 * Convert timestamp string to seconds
 * Supports formats: "MM:SS", "H:MM:SS", "HH:MM:SS"
 */
export function timestampToSeconds(timestamp: string): number {
  if (!timestamp) return 0;

  const parts = timestamp.split(':').map(Number);
  if (parts.length === 2) {
    // MM:SS format
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    // H:MM:SS or HH:MM:SS format
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

/**
 * Convert seconds to timestamp string (MM:SS or H:MM:SS format)
 */
export function secondsToTimestamp(seconds: number): string {
  if (seconds < 0) return "0:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}

/**
 * Generate YouTube URL with timestamp
 * @param videoUrl - Base YouTube URL
 * @param timestamp - Timestamp string (e.g., "1:23", "01:23", "1:23:45")
 * @returns YouTube URL with timestamp parameter
 */
export function generateYouTubeTimestampUrl(videoUrl: string, timestamp: string): string {
  if (!videoUrl || !timestamp) return videoUrl;

  const seconds = timestampToSeconds(timestamp);
  if (seconds === 0) return videoUrl;

  // Extract video ID from YouTube URL
  const videoIdMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
  if (!videoIdMatch) return videoUrl;

  const videoId = videoIdMatch[1];
  return `https://www.youtube.com/watch?v=${videoId}&t=${seconds}s`;
}

/**
 * Check if a string is a valid timestamp format
 */
export function isValidTimestamp(timestamp: string): boolean {
  if (!timestamp) return false;

  const timestampRegex = /^(\d{1,2}:)?\d{1,2}:\d{2}$/;
  return timestampRegex.test(timestamp);
}