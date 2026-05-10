import { getOpenAI } from './client';

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIM = 1536;

export async function generateEmbedding(text: string): Promise<number[]> {
  const input = text.replace(/\n/g, ' ').trim().slice(0, 8000);

  if (!process.env.OPENAI_API_KEY) {
    console.warn('[generateEmbedding] OPENAI_API_KEY is not set, using zero-vector fallback');
    return Array(EMBEDDING_DIM).fill(0);
  }

  try {
    const openai = getOpenAI();
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input,
    });
    return response.data[0].embedding;
  } catch (err) {
    console.warn('[generateEmbedding] embedding request failed, using zero-vector fallback:', err);
    return Array(EMBEDDING_DIM).fill(0);
  }
}
