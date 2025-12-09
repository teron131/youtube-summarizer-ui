import { StreamingProcessingResult, StreamingProgressState, VideoInfoResponse } from '@/services/api';
import { exampleData } from '@/services/example-data';

export interface ExampleDataResult {
  progressStates: StreamingProgressState[];
  videoInfo: VideoInfoResponse | null;
  transcript: string | null;
  analysisResult: StreamingProcessingResult;
  logs: string[];
}

/**
 * Load example data with realistic progress states
 */
export function loadExampleData(): ExampleDataResult {
  const exampleProgressStates: StreamingProgressState[] = [
    {
      step: 'scraping',
      stepName: "Scraping Video",
      status: "completed",
      message: `Video scraped: ${exampleData.videoInfo.title}`,
      processingTime: "0.1s"
    },
    {
      step: 'analysis_generation',
      stepName: "Analysis Generation",
      status: "completed",
      message: `📝 Initial analysis generated with ${exampleData.analysis?.chapters?.length || 0} chapters`,
      iterationCount: exampleData.iterationCount
    },
    {
      step: 'quality_check',
      stepName: "Quality Assessment",
      status: "completed",
      message: exampleData.quality?.percentage_score
        ? `🎯 Quality check passed with ${exampleData.quality.percentage_score}% score - Analysis meets requirements`
        : `🎯 Quality check passed - Analysis meets requirements`,
      qualityScore: exampleData.quality?.percentage_score || 100
    },
    {
      step: 'complete',
      stepName: "Analysis Complete",
      status: "completed",
      message: exampleData.quality?.percentage_score
        ? `✅ Analysis completed successfully with ${exampleData.quality.percentage_score}% quality score`
        : `✅ Analysis completed successfully`,
      processingTime: exampleData.totalTime,
      chunkCount: exampleData.chunksProcessed,
      iterationCount: exampleData.iterationCount,
      qualityScore: exampleData.quality?.percentage_score || 100
    }
  ];

  return {
    progressStates: exampleProgressStates,
    videoInfo: exampleData.videoInfo || null,
    transcript: exampleData.transcript || null,
    analysisResult: exampleData,
    logs: exampleData.logs || [],
  };
}

