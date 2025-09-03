import { StreamingProcessingResult } from "./api";

export const exampleData: StreamingProcessingResult = {
  success: true,
  totalTime: "41.8s",
  videoInfo: {
    url: "https://www.youtube.com/watch?v=P_fHJIYENdI",
    title: "AlphaFold - The Most Useful Thing AI Has Ever Done",
    thumbnail: "https://img.youtube.com/vi/P_fHJIYENdI/maxresdefault.jpg",
    author: "Veritasium",
    duration: "00:24:52",
    upload_date: "Feb 10, 2025",
    view_count: 9438380,
    like_count: 302032,
  },
  transcript: "What if, all of the world's biggest problems from climate change, to curing diseases, to disposal of plastic waste, what if they all had the same solution? A solution so tiny it would be invisible. I'm inclined to believe this is possible, thanks to a recent breakthrough that solved one of the biggest problems of the last century. How to determine the structure of a protein? [truncated for example]",
  analysis: {
    title: "AlphaFold: The Breakthrough That Solved Protein Folding",
    summary: "This video explores AlphaFold, DeepMind's groundbreaking AI system that solved the protein folding problem - one of biology's greatest challenges. The breakthrough determined the 3D structures of 200 million proteins, potentially revolutionizing medicine, drug discovery, and our understanding of life itself.",
    takeaways: [
      "AlphaFold solved the protein folding problem by predicting 3D protein structures from amino acid sequences with unprecedented accuracy.",
      "Protein structure determines function - the 3D shape dictates how proteins interact with other molecules and perform their biological roles.",
      "Traditional experimental methods like X-ray crystallography are slow and expensive, costing tens of thousands per protein structure.",
      "AlphaFold's breakthrough dwarfs previous progress - 200 million structures determined vs 150,000 over 60 years of traditional research."
    ],
    key_facts: [
      "A small team of 15 people at DeepMind determined 200 million protein structures in just a few years, compared to 150,000 over six decades by tens of thousands of researchers.",
      "John Kendrew took 12 years to determine the first protein structure (myoglobin) using whale meat for crystallization, winning the 1962 Nobel Prize.",
      "X-ray crystallography costs tens of thousands of dollars per protein, while sequencing costs only about $100 - creating a huge incentive for computational methods.",
      "Cyrus Levinthal calculated that a 35-amino-acid protein could theoretically fold in more ways than atoms in the universe, making brute-force computation impossible.",
      "The CASP competition was established in 1994 to benchmark computational protein structure prediction methods."
    ],
    chapters: [
      {
        header: "How to Determine Protein Structures",
        summary: "Explains the fundamental challenge of protein structure determination and introduces AlphaFold as a revolutionary solution.",
        key_points: [
          "Proteins are complex 3D structures folded from simple amino acid chains.",
          "Structure determines function - the shape dictates biological activity.",
          "Traditional methods are slow, expensive, and limited in scope."
        ],

      },
      {
        header: "Why Are Proteins So Complicated?",
        summary: "Delves into the complexity of protein folding, including Levinthal's paradox and the astronomical number of possible configurations.",
        key_points: [
          "Proteins fold into specific 3D shapes through complex molecular interactions.",
          "Even short proteins have more possible configurations than atoms in the universe.",
          "Evolution and natural selection guide the folding process."
        ],
      },
      {
        header: "The CASP Competition and DeepMind",
        summary: "Covers the Critical Assessment of Protein Structure Prediction competition and DeepMind's entry with AlphaFold.",
        key_points: [
          "CASP was created in 1994 to benchmark computational protein prediction methods.",
          "DeepMind entered with AlphaFold, initially achieving 70% accuracy.",
          "The competition drove rapid advancement in the field."
        ],
      },
      {
        header: "How Does AlphaFold Work?",
        summary: "Details the technical architecture of AlphaFold, including transformers, attention mechanisms, and the EvoFormer.",
        key_points: [
          "AlphaFold uses transformer architecture similar to ChatGPT.",
          "The EvoFormer has biology and geometry towers that exchange information.",
          "Triangular attention helps predict amino acid relationships."
        ],
      },
      {
        header: "3 Ways to Get Better AI",
        summary: "Explains the three key factors that made AlphaFold successful: massive compute power, large datasets, and superior algorithms.",
        key_points: [
          "DeepMind had access to Google's enormous computing resources (TPUs).",
          "Large, diverse protein datasets were crucial for training.",
          "Better AI algorithms (transformers, attention) provided the breakthrough."
        ],
      },
      {
        header: "What is a Transformer in AI?",
        summary: "Explains the transformer architecture and attention mechanism that powers modern AI systems like AlphaFold.",
        key_points: [
          "Transformers process sequential data using attention mechanisms.",
          "Attention identifies relationships between elements in sequences.",
          "Transformers revolutionized natural language processing and protein prediction."
        ],
      },
      {
        header: "The Structure Module",
        summary: "Describes how AlphaFold's structure module translates 2D predictions into accurate 3D protein structures.",
        key_points: [
          "The structure module converts distance predictions into 3D coordinates.",
          "It uses frames defined by amino acid atoms for positioning.",
          "Multiple refinement cycles improve accuracy."
        ],
      },
      {
        header: "AlphaFold 2 Wins the Nobel Prize",
        summary: "Covers AlphaFold 2's perfect performance in CASP 14 and the Nobel Prize awarded to its creators.",
        key_points: [
          "AlphaFold 2 achieved near-perfect accuracy in CASP 14.",
          "John Jumper and Demis Hassabis won the 2024 Nobel Prize in Chemistry.",
          "The breakthrough has been cited over 30,000 times."
        ],
      },
      {
        header: "Designing New Proteins - RF Diffusion",
        summary: "Introduces RF Diffusion, a generative AI method for designing entirely new proteins from scratch.",
        key_points: [
          "RF Diffusion uses generative AI to create novel protein structures.",
          "It can design proteins for specific functions like antivenom.",
          "David Baker's team pioneered protein design using AI."
        ],
      },
      {
        header: "The Future of AI",
        summary: "Discusses the broader implications of AI breakthroughs in science and potential future applications.",
        key_points: [
          "AI is revolutionizing scientific discovery across multiple fields.",
          "Applications include drug discovery, materials science, and environmental solutions.",
          "Speed improvements of 100,000x enable fundamentally new approaches."
        ],
      }
    ],
    keywords: [
      "AlphaFold",
      "Protein Folding",
      "DeepMind",
      "AI Breakthrough",
      "Nobel Prize"
    ],
  },
  quality: {
    completeness: {
      rate: "Pass",
      reason: "The summary, takeaways, and key facts cover the main points of the video comprehensively."
    },
    structure: {
      rate: "Pass",
      reason: "The output is well-structured with clear sections for summary, takeaways, key facts, and chapters, as requested."
    },
    grammar: {
      rate: "Pass",
      reason: "There are no noticeable typos or grammatical errors, and the wording is appropriate and clear."
    },
    no_garbage: {
      rate: "Pass",
      reason: "The content focuses solely on the video's information, with no promotional or irrelevant text."
    },
    useful_keywords: {
      rate: "Pass",
      reason: "The keywords 'AlphaFold', 'Protein Folding', 'DeepMind' are highly relevant and useful for highlighting key concepts in the analysis."
    },
    correct_language: {
      rate: "Pass",
      reason: "The output is in English, matching the presumed original language of the video and the user's request."
    }
  },
  iterationCount: 1,
  chunksProcessed: 12,
  logs: [
    '[10:00:00] Starting AI analysis with Gemini LLM...',
    '[10:00:02] Detected YouTube URL, scraping to get chapters...',
    '[10:00:08] Found 10 chapters in YouTube video',
    '[10:00:08] Chapter titles: How to determine protein structures, Why are proteins so complicated?, The CASP Competition and Deep Mind...',
    '[10:00:10] Processing 30k characters of transcript',
    '[10:00:12] Including 10 video chapters in Gemini analysis',
    '[10:00:25] Generated analysis (iteration 1)',
    '[10:00:28] Quality check passed with 100% score',
    '[10:00:30] Analysis completed successfully! Generated 10 chapters'
  ],
};
