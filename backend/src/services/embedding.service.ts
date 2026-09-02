import { GoogleGenAI } from "@google/genai";

const getGeminiClient = (): GoogleGenAI => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  return new GoogleGenAI({
    apiKey,
  });
};

export const generateEmbedding = async (
  text: string
): Promise<number[]> => {
  const ai = getGeminiClient();

  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
  });

  if (!response.embeddings?.[0]?.values) {
    throw new Error("Failed to generate embedding");
  }

  return response.embeddings[0].values;
};