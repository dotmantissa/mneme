'use client';
import { MemoryBadge } from './MemoryBadge';

interface ChainNode {
  id: string;
  type: string;
  summary: string;
  storageHash: string | null;
  txHash: string | null;
  children: ChainNode[];
}

function ChainNode({ node, depth, requestedId }: { node: ChainNode; depth: number; requestedId: string }) {
  return (
    <div className={`relative ${depth > 0 ? 'ml-6 mt-2' : ''}`}>
      {depth > 0 && (
        <div className="absolute -left-4 top-3 w-3 h-px bg-zinc-200" />
      )}
      <div className={`border rounded-md p-3 text-sm ${node.id === requestedId ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 bg-white'}`}>
        <div className="flex items-center gap-2 mb-1">
          <MemoryBadge type={node.type} />
          {node.txHash && (
            <span className="text-xs text-teal-600 font-medium">✓ attested</span>
          )}
        </div>
        <p className="text-zinc-700 text-xs leading-relaxed">{node.summary}</p>
        <p className="text-zinc-400 font-mono text-[10px] mt-1">{node.id}</p>
      </div>
      {node.children.map((child) => (
        <ChainNode key={child.id} node={child} depth={depth + 1} requestedId={requestedId} />
      ))}
    </div>
  );
}

export function ChainTree({ root, requestedId }: { root: ChainNode; requestedId: string }) {
  return (
    <div className="relative pl-1 border-l border-zinc-100">
      <ChainNode node={root} depth={0} requestedId={requestedId} />
    </div>
  );
}
