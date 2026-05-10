'use client';
import Link from 'next/link';
import Image from 'next/image';
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
      <div className="mb-8 flex items-center gap-2.5">
        <Image src="/logo.svg" alt="MNEME logo" width={28} height={28} />
        <div>
          <span className="text-base font-semibold tracking-tight text-zinc-900">
            MNEME <span className="font-normal text-zinc-400">[agent memory]</span>
          </span>
        </div>
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
