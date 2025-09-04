#!/usr/bin/env node

/**
 * Update Example Data Script
 * =========================
 *
 * This script updates the example-data.ts file with data from a specified YouTube URL.
 * It scrapes the video information and generates analysis data for testing purposes.
 *
 * Usage:
 *   node scripts/update-example-data.js "https://www.youtube.com/watch?v=YOUR_VIDEO_ID"
 *
 * Prerequisites:
 *   - Set environment variables: GEMINI_API_KEY, APIFY_API_KEY
 *   - Run from the project root directory
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const EXAMPLE_DATA_PATH = path.join(__dirname, '..', 'src', 'services', 'example-data.ts');
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

/**
 * Validate YouTube URL format
 */
function isValidYouTubeUrl(url) {
  const youtubeRegex = /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]+/;
  return youtubeRegex.test(url);
}

/**
 * Extract video ID from YouTube URL
 */
function extractVideoId(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

/**
 * Fetch video data from backend
 */
async function fetchVideoData(url) {
  try {
    console.log('📡 Scraping video data...');
    const scrapResponse = await fetch(`${BACKEND_URL}/scrap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!scrapResponse.ok) {
      throw new Error(`Scraping failed: ${scrapResponse.status} ${scrapResponse.statusText}`);
    }

    const scrapData = await scrapResponse.json();

    if (scrapData.status !== 'success') {
      throw new Error(`Scraping error: ${scrapData.detail || 'Unknown error'}`);
    }

    console.log('📝 Generating analysis...');
    const analyzeResponse = await fetch(`${BACKEND_URL}/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: scrapData.transcript,
        content_type: 'transcript',
        analysis_model: 'google/gemini-2.5-flash',
        quality_model: 'google/gemini-2.5-flash',
        target_language: 'en',
      }),
    });

    if (!analyzeResponse.ok) {
      throw new Error(`Analysis failed: ${analyzeResponse.status} ${analyzeResponse.statusText}`);
    }

    const analyzeData = await analyzeResponse.json();

    if (analyzeData.status !== 'success') {
      throw new Error(`Analysis error: ${analyzeData.detail || 'Unknown error'}`);
    }

    return {
      videoInfo: {
        url: scrapData.url,
        title: scrapData.title,
        thumbnail: scrapData.thumbnail,
        author: scrapData.author,
        duration: scrapData.duration,
        upload_date: scrapData.upload_date,
        view_count: scrapData.view_count,
        like_count: scrapData.like_count,
      },
      transcript: scrapData.transcript,
      analysis: analyzeData.analysis,
      quality: analyzeData.quality,
      processing_time: analyzeData.processing_time,
      iteration_count: analyzeData.iteration_count,
    };

  } catch (error) {
    console.error('❌ Error fetching video data:', error.message);
    throw error;
  }
}

/**
 * Generate TypeScript code for example data
 */
function generateExampleDataCode(data) {
  const { videoInfo, transcript, analysis, quality, processing_time, iteration_count } = data;

  // Truncate transcript for example purposes
  const truncatedTranscript = transcript.length > 500
    ? transcript.substring(0, 500) + '[truncated for example]'
    : transcript;

  // Generate mock logs
  const logs = [
    `'[${new Date().toLocaleTimeString()}] Starting AI analysis with Gemini LLM...'`,
    `'[${new Date().toLocaleTimeString()}] Detected YouTube URL, scraping to get chapters...'`,
    `'[${new Date().toLocaleTimeString()}] Found ${analysis.chapters?.length || 0} chapters in YouTube video'`,
    `'[${new Date().toLocaleTimeString()}] Processing ${transcript.length} characters of transcript'`,
    `'[${new Date().toLocaleTimeString()}] Including ${analysis.chapters?.length || 0} video chapters in Gemini analysis'`,
    `'[${new Date().toLocaleTimeString()}] Generated analysis (iteration 1)'`,
    `'[${new Date().toLocaleTimeString()}] Quality check passed with 100% score'`,
    `'[${new Date().toLocaleTimeString()}] Analysis completed successfully! Generated ${analysis.chapters?.length || 0} chapters'`
  ];

  return `import { StreamingProcessingResult } from "./api";

export const exampleData: StreamingProcessingResult = {
  success: true,
  totalTime: "${processing_time}",
  videoInfo: {
    url: "${videoInfo.url}",
    title: "${videoInfo.title.replace(/"/g, '\\"')}",
    thumbnail: "${videoInfo.thumbnail || ''}",
    author: "${videoInfo.author}",
    duration: "${videoInfo.duration || ''}",
    upload_date: "${videoInfo.upload_date || ''}",
    view_count: ${videoInfo.view_count || 0},
    like_count: ${videoInfo.like_count || 0},
  },
  transcript: "${truncatedTranscript.replace(/"/g, '\\"').replace(/\n/g, '\\n')}",
  analysis: ${JSON.stringify(analysis, null, 2)},
  quality: ${JSON.stringify(quality, null, 2)},
  iterationCount: ${iteration_count},
  chunksProcessed: 12,
  logs: [
    ${logs.join(',\n    ')}
  ],
};

// Export individual constants for easier testing
export const EXAMPLE_VIDEO_URL = exampleData.videoInfo.url;
export const EXAMPLE_TRANSCRIPT = exampleData.transcript;
export const EXAMPLE_ANALYSIS = exampleData.analysis;
export const EXAMPLE_QUALITY = exampleData.quality;
export const EXAMPLE_VIDEO_INFO = exampleData.videoInfo;

// Utility functions for testing
export const getExampleData = () => ({ ...exampleData });

export const createMockAnalysis = () => ({ ...EXAMPLE_ANALYSIS });

export const createMockQuality = () => ({ ...EXAMPLE_QUALITY });
`;
}

/**
 * Update the example-data.ts file
 */
async function updateExampleData(url) {
  try {
    console.log('🚀 Starting example data update...');
    console.log(`📺 Target URL: ${url}`);

    // Validate URL
    if (!isValidYouTubeUrl(url)) {
      throw new Error('Invalid YouTube URL format');
    }

    // Check environment variables
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }

    if (!process.env.APIFY_API_KEY) {
      throw new Error('APIFY_API_KEY environment variable is required');
    }

    // Fetch data
    console.log('🔄 Fetching video data from backend...');
    const data = await fetchVideoData(url);

    // Generate code
    console.log('📝 Generating TypeScript code...');
    const code = generateExampleDataCode(data);

    // Write file
    console.log('💾 Writing to example-data.ts...');
    fs.writeFileSync(EXAMPLE_DATA_PATH, code, 'utf8');

    console.log('✅ Example data updated successfully!');
    console.log(`📊 Video: ${data.videoInfo.title}`);
    console.log(`👤 Author: ${data.videoInfo.author}`);
    console.log(`📈 Processing time: ${data.processing_time}`);
    console.log(`🔢 Chapters: ${data.analysis.chapters?.length || 0}`);

  } catch (error) {
    console.error('❌ Failed to update example data:', error.message);
    process.exit(1);
  }
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length !== 1) {
    console.log('Usage: node scripts/update-example-data.js "https://www.youtube.com/watch?v=VIDEO_ID"');
    console.log('');
    console.log('Example:');
    console.log('  node scripts/update-example-data.js "https://www.youtube.com/watch?v=dQw4w9WgXcQ"');
    console.log('');
    console.log('Prerequisites:');
    console.log('  - Set GEMINI_API_KEY environment variable');
    console.log('  - Set APIFY_API_KEY environment variable');
    console.log('  - Backend server must be running on localhost:8080 (or set BACKEND_URL)');
    process.exit(1);
  }

  const url = args[0];
  updateExampleData(url);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { extractVideoId, isValidYouTubeUrl, updateExampleData };

