'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/dashboard', label: 'Agents' },
  { href: '/dashboard/memories', label: 'Memories' },
  { href: '/dashboard/search', label: 'Search' },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 min-h-screen border-r border-zinc-200 bg-white flex flex-col px-4 py-6 shrink-0">
      <div className="mb-8">
        <span className="text-lg font-semibold tracking-tight text-zinc-900">MNEME</span>
        <p className="text-xs text-zinc-400 mt-0.5">Agent memory layer</p>
      </div>
      <nav className="flex flex-col gap-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-2 rounded-md text-sm transition-colors ${
              pathname === link.href
                ? 'bg-zinc-100 text-zinc-900 font-medium'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
