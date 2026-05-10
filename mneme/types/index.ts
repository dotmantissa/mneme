export type MemoryType = 'episodic' | 'semantic' | 'procedural' | 'outcome';

export interface Memory {
  id: string;
  agentId: string;
  type: MemoryType;
  content: string;
  summary: string;
  embedding?: number[];
  parentId?: string | null;
  storageHash?: string | null;
  txHash?: string | null;
  signature?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
}

export interface Agent {
  id: string;
  name: string;
  apiKey: string;
  createdAt: Date;
}

export interface MemoryChain {
  memory: Memory;
  children: MemoryChain[];
}

export interface SearchResult {
  memory: Memory;
  score: number;
}
