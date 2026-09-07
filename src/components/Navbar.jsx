import React from 'react';
import PillNav from './ui/PillNav';
import { useUserStore } from '@/store/user';

const Navbar = () => {
  const user = useUserStore((state) => state.user);
  const navItems = [
    { label: 'Providers', href: '#providers' },
    { label: 'Features', href: '#features' },
    { label: 'Dashboard', href: '#dashboard' },
    { label: 'Why BYOK', href: '#why-byok' },
    { label: 'FAQs', href: '#faq' }
  ];


  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(16px)',
      backgroundColor: 'rgba(5, 4, 8, 0.75)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '76px'
      }}>
        {/* Clean Typographic Wordmark WITHOUT icon */}
        <a href="/" style={{
          display: 'flex',
          alignItems: 'center',
          fontWeight: '900',
          fontSize: '2.1rem',
          letterSpacing: '-0.04em',
          color: '#ffffff',
          textDecoration: 'none'
        }}>
          BYOK
        </a>

        {/* Center pill navigation */}
        <div style={{ display: 'flex', alignItems: 'center' }} className="nav-center-wrapper">
          <PillNav
            items={navItems}
            baseColor="#8b5cf6"
            pillColor="#13101d"
            hoveredPillTextColor="#ffffff"
            pillTextColor="#a1a1aa"
            className="header-pill-nav"
            initialLoadAnimation={true}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {user ? (
            <a 
              href="/workspace"
              className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-full text-[15px] font-semibold transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)]"
            >
              Workspace
            </a>
          ) : (
            <>
              <a 
                href="/auth?mode=login"
                className="text-neutral-400 hover:text-white text-[15px] font-semibold transition-colors"
              >
                Log In
              </a>
              <a 
                href="/auth?mode=signup"
                className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-full text-[15px] font-semibold transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)]"
              >
                Sign Up
              </a>
            </>
          )}
        </div>
      </div>
      <style>{`
        @media (max-width: 860px) {
          .nav-center-wrapper {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
