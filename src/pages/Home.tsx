import React, { useState } from 'react';
import Navbar from '../components/Navbar';
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

export default function Home() {
  const [legalModalType, setLegalModalType] = useState(null);

  return (
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
        opacity: 0.85
      }}>
        <DotField
          dotRadius={1.35}
          dotSpacing={16}
          cursorRadius={450}
          cursorForce={0.14}
          bulgeOnly={true}
          bulgeStrength={60}
          glowRadius={220}
          gradientFrom="rgba(168, 85, 247, 0.40)"
          gradientTo="rgba(99, 102, 241, 0.25)"
          glowColor="rgba(139, 92, 246, 0.18)"
        />
      </div>

      {/* Content Layer sitting over the continuous whole-page dot canvas */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar />
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
  );
}
