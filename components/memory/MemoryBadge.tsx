const colors: Record<string, string> = {
  episodic: 'bg-purple-50 text-purple-700',
  semantic: 'bg-teal-50 text-teal-700',
  procedural: 'bg-amber-50 text-amber-700',
  outcome: 'bg-blue-50 text-blue-700',
};

export function MemoryBadge({ type }: { type: string }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[type] ?? 'bg-zinc-100 text-zinc-600'}`}>
      {type}
    </span>
  );
}
