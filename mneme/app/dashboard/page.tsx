'use client';
import { useEffect, useState } from 'react';

interface Agent {
  id: string;
  name: string;
  apiKey: string;
  createdAt: string;
  _count: { memories: number };
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  async function fetchAgents() {
    setLoading(true);
    const res = await fetch('/api/agents');
    const json = await res.json();
    if (json.success) setAgents(json.data);
    setLoading(false);
  }

  async function createAgent() {
    if (!name.trim()) return;
    setCreating(true);
    await fetch('/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    setName('');
    await fetchAgents();
    setCreating(false);
  }

  useEffect(() => { fetchAgents(); }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold text-zinc-900 mb-1">Agents</h1>
      <p className="text-sm text-zinc-500 mb-6">Each agent has its own isolated memory store.</p>

      <div className="flex gap-2 mb-8">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Agent name"
          className="flex-1 max-w-xs border border-zinc-200 rounded-md px-3 py-2 text-sm outline-none focus:border-zinc-400"
        />
        <button
          onClick={createAgent}
          disabled={creating || !name.trim()}
          className="px-4 py-2 text-sm bg-zinc-900 text-white rounded-md disabled:opacity-40"
        >
          {creating ? 'Creating…' : 'Create agent'}
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-400">Loading…</p>
      ) : agents.length === 0 ? (
        <p className="text-sm text-zinc-400">No agents yet. Create one above.</p>
      ) : (
        <div className="grid gap-3">
          {agents.map((agent) => (
            <div key={agent.id} className="bg-white border border-zinc-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm text-zinc-900">{agent.name}</span>
                <span className="text-xs text-zinc-400">{agent._count.memories} memories</span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mb-1">ID: {agent.id}</p>
              <p className="text-xs text-zinc-400 font-mono truncate">Key: {agent.apiKey}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
