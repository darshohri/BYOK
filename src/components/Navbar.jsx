import React from 'react';
import PillNav from './ui/PillNav';

const Navbar = () => {
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
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <PillNav
            items={[
              { label: 'Sign Up', href: '#signup' },
              { label: 'Log In', href: '#login' }
            ]}
            baseColor="#8b5cf6"
            pillColor="#13101d"
            hoveredPillTextColor="#ffffff"
            pillTextColor="#a1a1aa"
            initialLoadAnimation={true}
            hideMobileMenu={true}
            className="action-pill-nav"
          />
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
