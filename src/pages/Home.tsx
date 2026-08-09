import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ReactLenis } from 'lenis/react';
import OptionWheel from '../components/ui/OptionWheel';
import Hero from '../components/Hero';
import Providers from '../components/Providers';
import Features from '../components/Features';
import DashboardPreview from '../components/DashboardPreview';
import WhyBYOK from '../components/WhyBYOK';
import FAQ from '../components/FAQ';
import FinalCTA from '../components/FinalCTA';
import Footer from '../components/Footer';
import LegalModal from '../components/LegalModal';
import DotField from '../components/ui/DotField';
import ScrollToTop from '../components/ScrollToTop';

const SECTION_IDS = ['top', 'providers', 'features', 'dashboard', 'why-byok', 'faq'];
const SECTION_HASHES = ['#top', '#providers', '#features', '#dashboard', '#why-byok', '#faq'];

export default function Home() {
  const [legalModalType, setLegalModalType] = useState(null);
  const [activeWheelIndex, setActiveWheelIndex] = useState(0);
  const isAutoScrolling = useRef(false);
  const autoScrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lenisRef = useRef<any>(null);
  const wheelContainerRef = useRef<HTMLDivElement>(null);

  // Block ALL wheel events on the fixed wheel container so they never reach Lenis.
  // Must use addEventListener (not React onWheel) because React registers passive
  // listeners which cannot call preventDefault().
  useEffect(() => {
    const container = wheelContainerRef.current;
    if (!container) return;
    const blockWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    container.addEventListener('wheel', blockWheel, { passive: false });
    return () => container.removeEventListener('wheel', blockWheel);
  }, []);

  // Sync wheel highlight from page scroll (only when user scrolls page directly)
  useEffect(() => {
    const handleScroll = () => {
      if (isAutoScrolling.current) return;

      const scrollPosition = window.scrollY + window.innerHeight / 3;
      let currentIndex = 0;
      for (let i = SECTION_IDS.length - 1; i >= 1; i--) {
        const el = document.getElementById(SECTION_IDS[i]);
        if (el && el.offsetTop <= scrollPosition) {
          currentIndex = i;
          break;
        }
      }
      if (window.scrollY === 0) currentIndex = 0;
      setActiveWheelIndex(currentIndex);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    setTimeout(handleScroll, 100);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Debounced navigation: waits for the wheel to settle before scrolling the page
  const navigateToSection = useCallback((index: number) => {
    // Clear any pending navigation
    if (navDebounce.current) clearTimeout(navDebounce.current);

    navDebounce.current = setTimeout(() => {
      // Lock out the scroll→wheel sync so it doesn't fight us
      isAutoScrolling.current = true;
      if (autoScrollTimeout.current) clearTimeout(autoScrollTimeout.current);
      autoScrollTimeout.current = setTimeout(() => {
        isAutoScrolling.current = false;
      }, 1500);

      const lenis = lenisRef.current?.lenis;
      if (lenis) {
        if (index === 0) {
          lenis.scrollTo(0, { duration: 1.2 });
        } else {
          lenis.scrollTo(SECTION_HASHES[index], { duration: 1.2 });
        }
      } else {
        // Fallback if Lenis isn't available
        if (index === 0) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          const el = document.querySelector(SECTION_HASHES[index]);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, 180); // slightly longer than the OptionWheel's 140ms snap debounce
  }, []);

  return (
    <ReactLenis root ref={lenisRef}>
      <div style={{ backgroundColor: '#050408', color: '#ffffff', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      {/* WHOLE PAGE interactive DotField background canvas */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 1
      }}>
        <DotField
          dotRadius={1.35}
          dotSpacing={16}
          cursorRadius={450}
          cursorForce={0.14}
          bulgeOnly={true}
          bulgeStrength={60}
          glowRadius={220}
          gradientFrom="rgba(168, 85, 247, 0.85)"
          gradientTo="rgba(99, 102, 241, 0.75)"
          glowColor="rgba(139, 92, 246, 0.40)"
        />
      </div>

      {/* Content Layer sitting over the continuous whole-page dot canvas */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div
          ref={wheelContainerRef}
          style={{ position: 'fixed', top: 0, left: 0, height: '100vh', width: '300px', zIndex: 50, display: 'flex', alignItems: 'center' }}
        >
          <OptionWheel
            items={['Home', 'Providers', 'Features', 'Dashboard', 'Why BYOK', 'FAQs']}
            defaultSelected={0}
            activeIndex={activeWheelIndex}
            textColor="#a1a1aa"
            activeColor="#ffffff"
            side="left"
            fontSize={1.2}
            spacing={1.8}
            curve={1}
            tilt={6}
            blur={2}
            fade={0.25}
            smoothing={80}
            inset={40}
            loop={false}
            onChange={(index) => {
              navigateToSection(index);
            }}
          />
        </div>

        <main>
          <Hero />
          <Providers />
          <Features />
          <DashboardPreview />
          <WhyBYOK />
          <FAQ />
          <FinalCTA />
        </main>
        <Footer onOpenLegal={(type: any) => setLegalModalType(type)} />
      </div>

      {/* Interactive floating Move to Top arrow button */}
      <ScrollToTop />

      {/* Interactive modal for Privacy Policy, Terms of Service, and Security Report */}
      <LegalModal
        isOpen={!!legalModalType}
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />
    </div>
    </ReactLenis>
  );
}
