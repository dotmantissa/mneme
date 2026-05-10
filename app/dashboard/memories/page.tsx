'use client';
import { useEffect, useState } from 'react';
import { MemoryBadge } from '@/components/memory/MemoryBadge';
import { ChainTree } from '@/components/memory/ChainTree';

interface Memory {
  id: string;
  agentId: string;
  type: string;
  summary: string;
  content: string;
  storageHash: string | null;
  txHash: string | null;
  createdAt: string;
}

interface Agent {
  id: string;
  name: string;
}

export default function MemoriesPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selected, setSelected] = useState<Memory | null>(null);
  interface ChainResponse {
  root: {
    id: string;
    type: string;
    summary: string;
    storageHash: string | null;
    txHash: string | null;
    children: ChainResponse['root'][];
  };
}

const [chain, setChain] = useState<ChainResponse | null>(null);
  const [loadingChain, setLoadingChain] = useState(false);
  const [loadingMem, setLoadingMem] = useState(false);

  useEffect(() => {
    fetch('/api/agents').then(r => r.json()).then(j => {
      if (j.success) setAgents(j.data);
    });
  }, []);

  useEffect(() => {
    if (!selectedAgent) return;
    setLoadingMem(true);
    fetch(`/api/memories?agentId=${selectedAgent}&limit=50`)
      .then(r => r.json())
      .then(j => { if (j.success) setMemories(j.data.memories); })
      .finally(() => setLoadingMem(false));
  }, [selectedAgent]);

  async function selectMemory(memory: Memory) {
    setSelected(memory);
    setChain(null);
    setLoadingChain(true);
    const res = await fetch(`/api/memories/${memory.id}/chain`);
    const json = await res.json();
    if (json.success) setChain(json.data);
    setLoadingChain(false);
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-zinc-900 mb-1">Memories</h1>
      <p className="text-sm text-zinc-500 mb-6">Browse and inspect agent memories and their causal chains.</p>

      <select
        value={selectedAgent}
        onChange={(e) => setSelectedAgent(e.target.value)}
        className="border border-zinc-200 rounded-md px-3 py-2 text-sm text-zinc-900 bg-white outline-none focus:border-zinc-400"
      >
        <option value="">Select an agent</option>
        {agents.map(a => (
          <option key={a.id} value={a.id}>{a.name}</option>
        ))}
      </select>

      <div className="flex gap-6">
        <div className="w-80 shrink-0">
          {loadingMem && <p className="text-sm text-zinc-400">Loading…</p>}
          {!loadingMem && memories.length === 0 && selectedAgent && (
            <p className="text-sm text-zinc-400">No memories yet.</p>
          )}
          <div className="flex flex-col gap-2">
            {memories.map(m => (
              <button
                key={m.id}
                onClick={() => selectMemory(m)}
                className={`text-left border rounded-md p-3 text-sm transition-colors ${
                  selected?.id === m.id
                    ? 'border-zinc-900 bg-zinc-50'
                    : 'border-zinc-200 bg-white hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <MemoryBadge type={m.type} />
                  {m.txHash && <span className="text-[10px] text-teal-600">✓</span>}
                </div>
                <p className="text-zinc-700 text-xs leading-relaxed line-clamp-2">{m.summary}</p>
                <p className="text-zinc-400 text-[10px] mt-1">{new Date(m.createdAt).toLocaleString()}</p>
              </button>
            ))}
          </div>
        </div>

        {selected && (
          <div className="flex-1 min-w-0">
            <div className="bg-white border border-zinc-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <MemoryBadge type={selected.type} />
                {selected.storageHash && (
                  <span className="text-xs text-zinc-400 font-mono">0G: {selected.storageHash.slice(0, 16)}…</span>
                )}
              </div>
              <p className="text-sm font-medium text-zinc-900 mb-2">{selected.summary}</p>
              <p className="text-sm text-zinc-600 leading-relaxed">{selected.content}</p>
            </div>

            <h2 className="text-sm font-medium text-zinc-700 mb-3">Causal chain</h2>
            {loadingChain && <p className="text-sm text-zinc-400">Building chain…</p>}
            {chain && (
              <ChainTree root={chain.root} requestedId={selected.id} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
