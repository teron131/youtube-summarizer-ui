import { GenerateResponse } from "./api";

export const exampleData: GenerateResponse = {
  status: "success",
  message: "Example data loaded successfully.",
  video_info: {
    title: "Sample Video: The Future of AI",
    author: "AI Insights",
    duration: "600",
    thumbnail: "/placeholder.svg",
    view_count: 1234567,
    like_count: 89012,
    upload_date: "2024-01-01",
    url: "https://www.youtube.com/watch?v=example",
  },
  transcript: `This is a sample transcript. It contains the spoken words from the video, formatted for readability. Each sentence is a new line.
This allows for easy parsing and display in the user interface.
The transcript is a key component of the analysis, providing the raw data for summarization and other insights.`,
  summary: "This is a sample summary of the video content. It provides a concise overview of the main points discussed in the video, helping users quickly understand the key takeaways.",
  analysis: {
    title: "In-Depth Analysis",
    overall_summary: "This sample analysis provides a detailed breakdown of the video's content, including key facts, takeaways, and chapter summaries.",
    chapters: [
      {
        header: "Chapter 1: Introduction to AI",
        summary: "The first chapter introduces the fundamental concepts of Artificial Intelligence, setting the stage for more advanced topics.",
        key_points: ["Definition of AI", "History of AI", "Types of AI"],
      },
      {
        header: "Chapter 2: AI in Practice",
        summary: "This chapter explores real-world applications of AI, showcasing its impact across various industries.",
        key_points: ["AI in healthcare", "AI in finance", "AI in transportation"],
      },
    ],
    key_facts: [
      "AI is a rapidly growing field.",
      "Machine learning is a subset of AI.",
      "Data is crucial for training AI models.",
    ],
    takeaways: [
      "AI has the potential to solve complex problems.",
      "Ethical considerations are important in AI development.",
      "Continuous learning is key to staying current in the field of AI.",
    ],
  },
  metadata: {
    total_processing_time: "10.5s",
  },
  processing_details: {
    tier_1: "Used yt-dlp for transcript",
    tier_2: "Skipped FAL API",
    tier_3: "Skipped Gemini direct URL processing",
  },
  logs: [
    "Initiating process...",
    "Fetching video metadata...",
    "Extracting transcript...",
    "Generating summary...",
    "Performing analysis...",
    "Process complete.",
  ],
};