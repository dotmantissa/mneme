'use client';
import { useState, useEffect } from 'react';
import { MemoryBadge } from '@/components/memory/MemoryBadge';

interface SearchResult {
  id: string;
  type: string;
  summary: string;
  content: string;
  score: number;
  storageHash: string | null;
}

interface Agent { id: string; name: string; }

export default function SearchPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentId, setAgentId] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetch('/api/agents').then(r => r.json()).then(j => {
      if (j.success) setAgents(j.data);
    });
  }, []);

  async function search() {
    if (!query.trim() || !agentId) return;
    setSearching(true);
    const params = new URLSearchParams({ agentId, q: query, limit: '8' });
    const res = await fetch(`/api/search?${params}`);
    const json = await res.json();
    if (json.success) setResults(json.data.results);
    setSearching(false);
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-zinc-900 mb-1">Semantic search</h1>
      <p className="text-sm text-zinc-500 mb-6">Search an agent&apos;s memories using natural language.</p>

      <div className="flex gap-2 mb-6">
        <select
          value={agentId}
          onChange={(e) => setAgentId(e.target.value)}
          className="border border-zinc-200 rounded-md px-3 py-2 text-sm outline-none focus:border-zinc-400"
        >
          <option value="">Select agent</option>
          {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
          placeholder="Search memories…"
          className="flex-1 max-w-sm border border-zinc-200 rounded-md px-3 py-2 text-sm outline-none focus:border-zinc-400"
        />
        <button
          onClick={search}
          disabled={searching || !query.trim() || !agentId}
          className="px-4 py-2 text-sm bg-zinc-900 text-white rounded-md disabled:opacity-40"
        >
          {searching ? 'Searching…' : 'Search'}
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {results.map((r) => (
          <div key={r.id} className="bg-white border border-zinc-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <MemoryBadge type={r.type} />
              <span className="text-xs text-zinc-400 ml-auto">score: {(r.score * 100).toFixed(1)}%</span>
            </div>
            <p className="text-sm font-medium text-zinc-900 mb-1">{r.summary}</p>
            <p className="text-sm text-zinc-500 leading-relaxed line-clamp-3">{r.content}</p>
          </div>
        ))}
        {results.length === 0 && query && !searching && (
          <p className="text-sm text-zinc-400">No results found.</p>
        )}
      </div>
    </div>
  );
}
