// ─────────────────────────────────────────────
// BYOK — Sidebar Navigation Item
// ─────────────────────────────────────────────

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  path: string;
  /** Whether this item is external (opens in new tab). */
  external?: boolean;
}

export default function NavItem({ icon: Icon, label, path, external }: NavItemProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Active detection: exact match or starts-with for sub-pages
  const isActive =
    location.pathname === path ||
    (path !== '/workspace' && location.pathname.startsWith(path));

  const handleClick = () => {
    if (external) {
      window.open(path, '_blank', 'noopener,noreferrer');
    } else {
      navigate(path);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[15px] font-medium transition-all duration-200 ${
        isActive
          ? 'bg-white/[0.08] text-white border border-white/[0.06]'
          : 'text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200 border border-transparent'
      }`}
      aria-label={label}
    >
      <Icon
        size={18}
        className={`transition-colors ${isActive ? 'text-purple-400' : ''}`}
      />
      <span>{label}</span>
      {external && (
        <span className="ml-auto text-[10px] text-neutral-600">↗</span>
      )}
    </button>
  );
}
