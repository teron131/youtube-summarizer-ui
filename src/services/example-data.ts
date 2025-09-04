import { StreamingProcessingResult } from "./api";

export const exampleData: StreamingProcessingResult = {
  success: true,
  totalTime: "11.6s",
  videoInfo: {
    url: "https://www.youtube.com/watch?v=P_fHJIYENdI",
    title: "AlphaFold - The Most Useful Thing AI Has Ever Done",
    thumbnail: "https://img.youtube.com/vi/P_fHJIYENdI/maxresdefault.jpg",
    author: "Veritasium",
    duration: "00:24:52",
    upload_date: "Feb 10, 2025",
    view_count: 9451441,
    like_count: 302238,
  },
  transcript: "## How to determine protein structures\n\n## Why are proteins so complicated?\n\n## The CASP Competition and Deep Mind\n\n## How does Alphafold work?\n\n## 3 ways to get better AI\n\n## What is a Transformer in AI?\n\n## The Structure Module\n\n## Alphafold 2 wins the Nobel Prize\n\n## Designing New Proteins - RF Diffusion\n\n## The Future of AI",
  analysis: {
  "title": "How to Determine Protein Structures",
  "summary": "Proteins are complex molecules essential for life, composed of amino acid chains that fold into specific 3D structures. Determining these structures is crucial for understanding their function and for drug discovery. Traditional methods like X-ray crystallography and cryo-electron microscopy are time-consuming and expensive. The CASP competition, a biennial event, evaluates the accuracy of computational methods for protein structure prediction. DeepMind's AlphaFold, particularly AlphaFold 2, achieved groundbreaking accuracy in CASP, demonstrating the power of AI in this field. AlphaFold utilizes a transformer-based neural network architecture, similar to those used in large language models, to predict protein structures from amino acid sequences. It processes information about amino acid relationships and distances, iteratively refining its predictions. The success of AlphaFold has opened new avenues for protein design, exemplified by tools like RF Diffusion, which can generate novel protein structures with desired properties. This advancement signifies a paradigm shift in biology, accelerating research in medicine, biotechnology, and materials science.",
  "takeaways": [
    "Protein structure prediction is a fundamental challenge in biology with significant implications for drug discovery and understanding biological processes.",
    "AlphaFold, developed by DeepMind, has revolutionized protein structure prediction by achieving near-experimental accuracy using AI.",
    "The success of AlphaFold highlights the potential of transformer-based neural networks and large datasets in solving complex scientific problems.",
    "AI-driven protein design tools like RF Diffusion enable the creation of novel proteins with tailored functions, opening new possibilities in biotechnology.",
    "The integration of AI into biological research is accelerating scientific discovery and has the potential to transform various industries."
  ],
  "key_facts": [
    "Proteins are made of 20 different amino acids, and their function is determined by their 3D structure.",
    "The CASP competition has been evaluating protein structure prediction methods since 1994.",
    "AlphaFold 2 achieved a median accuracy of 92.4 GDT_TS in CASP14, comparable to experimental methods.",
    "AlphaFold's architecture includes a transformer-based neural network and an 'EvoFormer' module for processing evolutionary information.",
    "RF Diffusion is a generative AI model that can design new protein structures by reversing the diffusion process."
  ],
  "chapters": [
    {
      "header": "The Complexity of Protein Structures",
      "summary": "Proteins are fundamental to life, performing a vast array of functions within organisms. Their functionality is intrinsically linked to their precise three-dimensional structure, which is determined by the sequence of their constituent amino acids. There are 20 different amino acids, and the way they fold into a specific shape is crucial. Understanding these structures is vital for drug discovery, as many drugs work by interacting with specific protein structures. Traditional methods for determining protein structures, such as X-ray crystallography and cryo-electron microscopy, are often time-consuming, expensive, and not always successful, especially for complex proteins.",
      "key_points": [
        "Proteins are essential for biological functions, and their 3D structure dictates their function.",
        "The sequence of 20 amino acids determines a protein's folded structure.",
        "Determining protein structures is critical for drug development.",
        "Traditional methods like X-ray crystallography and cryo-electron microscopy are resource-intensive and have limitations."
      ]
    },
    {
      "header": "The CASP Competition and AlphaFold's Breakthrough",
      "summary": "The Critical Assessment of protein Structure Prediction (CASP) is a biennial competition established in 1994 to evaluate the accuracy of computational methods for predicting protein structures. Participants are given amino acid sequences and must predict their 3D structures, which are then compared against experimentally determined structures. DeepMind's AlphaFold, particularly AlphaFold 2, achieved a significant breakthrough in CASP14, demonstrating unprecedented accuracy in protein structure prediction. Its performance was so remarkable that it was considered to have largely solved the protein folding problem, achieving results comparable to experimental methods.",
      "key_points": [
        "CASP is a biennial competition evaluating computational protein structure prediction methods.",
        "DeepMind's AlphaFold 2 achieved near-experimental accuracy in CASP14.",
        "AlphaFold's success marked a major advancement in solving the protein folding problem."
      ]
    },
    {
      "header": "How AlphaFold Works",
      "summary": "AlphaFold's success stems from its innovative use of a transformer-based neural network architecture, similar to those employed in large language models. It processes the amino acid sequence of a protein and predicts the distances and angles between amino acids, which are then used to construct the 3D structure. The model iteratively refines its predictions, learning from a vast dataset of known protein structures. A key component is the 'EvoFormer' module, which leverages evolutionary information from multiple sequence alignments to infer relationships between amino acids. This allows AlphaFold to capture complex interactions and dependencies within the protein sequence, leading to highly accurate structural predictions.",
      "key_points": [
        "AlphaFold uses a transformer-based neural network architecture.",
        "It predicts amino acid distances and angles to construct 3D protein structures.",
        "The model refines predictions iteratively using large datasets of known structures.",
        "The 'EvoFormer' module utilizes evolutionary information for improved accuracy."
      ]
    },
    {
      "header": "Designing New Proteins with AI",
      "summary": "The advancements in protein structure prediction have paved the way for designing novel proteins with specific functions. RF Diffusion is an example of a generative AI model that can create new protein structures. Unlike AlphaFold, which predicts the structure of an existing sequence, RF Diffusion works by reversing a diffusion process, starting from random noise and iteratively refining it into a stable, functional protein structure. This capability allows researchers to design proteins for various applications, such as new enzymes, therapeutics, or materials, by specifying desired properties or functions. This represents a significant leap from simply predicting structures to actively engineering them.",
      "key_points": [
        "AI enables the design of novel proteins with specific functions.",
        "RF Diffusion is a generative AI model that creates new protein structures.",
        "It works by reversing a diffusion process to generate stable protein folds.",
        "This technology allows for the engineering of proteins for diverse applications like enzymes and therapeutics."
      ]
    },
    {
      "header": "The Future of AI in Biology",
      "summary": "The success of AlphaFold and similar AI models signifies a transformative era for biological research. AI is accelerating the pace of discovery by providing tools that can rapidly analyze complex biological data, predict molecular interactions, and design new biological entities. This integration of AI is not limited to protein folding but extends to drug discovery, materials science, and understanding fundamental biological processes. The ability to accurately predict and design protein structures will lead to faster development of new medicines, more efficient industrial enzymes, and novel biomaterials, fundamentally changing how scientific research is conducted and applied.",
      "key_points": [
        "AI is accelerating biological research and discovery.",
        "AI tools can analyze complex biological data and predict molecular interactions.",
        "The integration of AI extends beyond protein folding to drug discovery and materials science.",
        "Accurate protein prediction and design will lead to advancements in medicine, enzymes, and biomaterials."
      ]
    }
  ],
  "keywords": [
    "AlphaFold",
    "Protein Structure",
    "AI"
  ],
  "target_language": "en"
},
  quality: {
  "completeness": {
    "rate": "Pass",
    "reason": "The analysis covers all aspects of the provided content, including protein structure complexity, CASP competition, AlphaFold's mechanism, AI in protein design, and the future of AI in biology."
  },
  "structure": {
    "rate": "Pass",
    "reason": "The output perfectly adheres to the required schema, including title, summary, chapters with headers and key points, takeaways, key facts, and keywords, all formatted correctly as arrays where specified."
  },
  "grammar": {
    "rate": "Pass",
    "reason": "The analysis is free of typos and grammatical errors. The wording is professional and appropriate for an article-like tone."
  },
  "no_garbage": {
    "rate": "Pass",
    "reason": "No promotional or meaningless content is present in the analysis. The content is focused and informative."
  },
  "meta_language_avoidance": {
    "rate": "Pass",
    "reason": "The analysis successfully avoids meta-language phrases such as 'This chapter introduces' or 'This section covers', maintaining an objective, article-like tone."
  },
  "useful_keywords": {
    "rate": "Pass",
    "reason": "The keywords 'AlphaFold', 'Protein Structure', and 'AI' are highly relevant and effectively highlight the core topics of the analysis."
  },
  "correct_language": {
    "rate": "Pass",
    "reason": "The content is properly translated to English with natural fluency and maintained quality, as requested by the 'target_language': 'en' field."
  }
},
  iterationCount: 1,
  chunksProcessed: 12,
  logs: [
    '[4:05:02 AM] Starting AI analysis with Gemini LLM...',
    '[4:05:02 AM] Detected YouTube URL, scraping to get chapters...',
    '[4:05:02 AM] Found 5 chapters in YouTube video',
    '[4:05:02 AM] Processing 329 characters of transcript',
    '[4:05:02 AM] Including 5 video chapters in Gemini analysis',
    '[4:05:02 AM] Generated analysis (iteration 1)',
    '[4:05:02 AM] Quality check passed with 100% score',
    '[4:05:02 AM] Analysis completed successfully! Generated 5 chapters'
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
