import { Source } from "../models/Source";
import { generateEmbedding } from "./embedding.service";

const DEFAULT_TOP_K = 5;
const DEFAULT_SIMILARITY_THRESHOLD = 0.50;

export interface RetrievedChunk{
    text: string;
    score: number;
    sourceId: string;
    sourceTitle: string;
    sourceUrl: string;
}

export const cosineSimilarity = (
  vectorA: number[],
  vectorB: number[]
): number => {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Embedding dimensions do not match");
  }

  if (vectorA.length === 0) {
    return 0;
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];

    magnitudeA += vectorA[i] * vectorA[i];
    magnitudeB += vectorB[i] * vectorB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
};

export const generateQuestionEmbedding = async (
  question: string
): Promise<number[]> => {
  const cleanedQuestion = question.trim();

  if (!cleanedQuestion) {
    throw new Error("Question is required");
  }

  return generateEmbedding(cleanedQuestion);
};


export const retrieveRelevantChunks = async (
  sessionId: string,
  userId: string,
  question: string,
  topK = DEFAULT_TOP_K,
  similarityThreshold = DEFAULT_SIMILARITY_THRESHOLD
): Promise<RetrievedChunk[]> => {
  const questionEmbedding = await generateQuestionEmbedding(question);

  const sources = await Source.find({
    sessionId,
    userId,
  }).lean();

  const results: RetrievedChunk[] = [];

  for (const source of sources) {
    let maxScore = 0;
    let matchedChunks = 0;

    for (const chunk of source.chunks) {
      if (!chunk.embedding || chunk.embedding.length === 0) {
        continue;
      }

      const score = cosineSimilarity(
        questionEmbedding,
        chunk.embedding
      );

      maxScore = Math.max(maxScore, score);

      if (score >= similarityThreshold) {
        matchedChunks++;

        results.push({
          text: chunk.text,
          score,
          sourceId: source._id.toString(),
          sourceTitle: source.title,
          sourceUrl: source.url,
        });
      }
    }

    console.log(
      `Source: ${source.title} | Max score: ${maxScore.toFixed(
        4
      )} | Matched chunks: ${matchedChunks}`
    );
  }

  results.sort((a, b) => b.score - a.score);

  return results.slice(0, topK);
};