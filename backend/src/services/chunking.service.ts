const DEFAULT_CHUNK_SIZE = 1200;
const DEFAULT_OVERLAP = 200;

const splitIntoSentences = (text: string): string[] => {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
};

export const chunkText = (
  text: string,
  chunkSize = DEFAULT_CHUNK_SIZE,
  overlap = DEFAULT_OVERLAP
): string[] => {
  const cleanedText = text.replace(/\s+/g, " ").trim();

  if (!cleanedText) {
    return [];
  }

  if (overlap >= chunkSize) {
    throw new Error("Overlap must be smaller than chunk size");
  }

  const sentences = splitIntoSentences(cleanedText);

  const chunks: string[] = [];
  let currentSentences: string[] = [];
  let currentLength = 0;

  for (const sentence of sentences) {
    const sentenceLength =
      sentence.length + (currentSentences.length > 0 ? 1 : 0);

    if (
      currentSentences.length > 0 &&
      currentLength + sentenceLength > chunkSize
    ) {
      chunks.push(currentSentences.join(" "));

      // Keep complete sentences for overlap
      const overlapSentences: string[] = [];
      let overlapLength = 0;

      for (let i = currentSentences.length - 1; i >= 0; i--) {
        const previousSentence = currentSentences[i];
        const additionalLength =
          previousSentence.length +
          (overlapSentences.length > 0 ? 1 : 0);

        if (
          overlapLength + additionalLength > overlap &&
          overlapSentences.length > 0
        ) {
          break;
        }

        overlapSentences.unshift(previousSentence);
        overlapLength += additionalLength;
      }

      currentSentences = overlapSentences;
      currentLength = overlapLength;
    }

    currentSentences.push(sentence);
    currentLength += sentenceLength;
  }

  if (currentSentences.length > 0) {
    chunks.push(currentSentences.join(" "));
  }

  return chunks;
};

