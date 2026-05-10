export type MemoryType = 'episodic' | 'semantic' | 'procedural' | 'outcome';

export interface RememberInput {
  type: MemoryType;
  content: string;
  summary: string;
  parentId?: string;
  metadata?: Record<string, unknown>;
}

export interface Memory {
  id: string;
  agentId: string;
  type: MemoryType;
  content: string;
  summary: string;
  parentId: string | null;
  storageHash: string | null;
  txHash: string | null;
  signature: string | null;
  createdAt: string;
}

export interface SearchResult {
  id: string;
  agentId: string;
  type: string;
  content: string;
  summary: string;
  storageHash: string | null;
  score: number;
}

export interface ChainNode {
  id: string;
  type: string;
  summary: string;
  content: string;
  storageHash: string | null;
  txHash: string | null;
  children: ChainNode[];
}

export interface MnemeClientOptions {
  baseUrl: string;
  agentId: string;
  apiKey: string;
}
