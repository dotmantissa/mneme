import type {
  RememberInput,
  Memory,
  SearchResult,
  ChainNode,
  MnemeClientOptions,
} from './types';

export class MnemeClient {
  private baseUrl: string;
  private agentId: string;
  private apiKey: string;

  constructor(options: MnemeClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.agentId = options.agentId;
    this.apiKey = options.apiKey;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Agent-Key': this.apiKey,
        ...options.headers,
      },
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error ?? 'MNEME API error');
    }
    return json.data as T;
  }

  /**
   * Store a new memory for this agent.
   */
  async remember(input: RememberInput): Promise<Memory> {
    return this.request<Memory>('/api/memories', {
      method: 'POST',
      body: JSON.stringify({ agentId: this.agentId, ...input }),
    });
  }

  /**
   * Semantically search this agent's memories.
   */
  async recall(
    query: string,
    options: { limit?: number } = {}
  ): Promise<SearchResult[]> {
    const params = new URLSearchParams({
      agentId: this.agentId,
      q: query,
      limit: String(options.limit ?? 5),
    });
    const data = await this.request<{ results: SearchResult[] }>(
      `/api/search?${params}`
    );
    return data.results;
  }

  /**
   * Retrieve the full causal chain tree rooted at the ancestor of memoryId.
   */
  async getChain(memoryId: string): Promise<ChainNode> {
    const data = await this.request<{ root: ChainNode }>(
      `/api/memories/${memoryId}/chain`
    );
    return data.root;
  }

  /**
   * List all memories for this agent with optional type filter.
   */
  async listMemories(options: {
    type?: string;
    limit?: number;
    cursor?: string;
  } = {}): Promise<{ memories: Memory[]; nextCursor: string | null }> {
    const params = new URLSearchParams({ agentId: this.agentId });
    if (options.type) params.set('type', options.type);
    if (options.limit) params.set('limit', String(options.limit));
    if (options.cursor) params.set('cursor', options.cursor);
    return this.request(`/api/memories?${params}`);
  }

  /**
   * Verify the cryptographic signature on a memory.
   */
  async verify(memoryId: string): Promise<{
    valid: boolean;
    recoveredAddress: string;
    expectedAddress: string;
  }> {
    return this.request(`/api/memories/${memoryId}/attest`);
  }
}
