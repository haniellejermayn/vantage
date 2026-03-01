'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Megaphone, LayoutDashboard, Bell } from 'lucide-react';

const NAV_LINKS = [
  { name: 'Creators', href: '/creators', icon: Users },
  { name: 'Campaigns', href: '/campaigns', icon: Megaphone },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border-theme bg-bg/85 backdrop-blur-md shadow-sm">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* Custom Vantage Peak SVG */}
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7 text-accent transition-transform duration-300 group-hover:scale-110"
            >
              {/* The Outer Mountain Peak */}
              <path d="M12 2L2 22h5l5-10 5 10h5L12 2z" />
              {/* The Inner Base (Creates the negative space 'V') */}
              <path d="M12 15l-3.5 7h7L12 15z" />
            </svg>

            <span className="font-head text-lg font-extrabold tracking-tight text-text-main uppercase">
              Vantage
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => {
              const isActive = pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 font-body text-[0.85rem] font-semibold transition-all ${
                    isActive
                      ? 'text-accent'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  <link.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            <button className="text-text-muted hover:text-accent transition-colors">
              <Bell size={18} strokeWidth={2} />
            </button>
            <div className="h-4 w-px bg-border-theme mx-1"></div>
            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-light border border-border-theme text-accent font-head font-bold text-sm hover:brightness-95 transition-all">
              H
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
