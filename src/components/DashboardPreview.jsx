import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Cpu, ArrowRight, Terminal, Layers } from 'lucide-react';
import { ContainerScroll } from './ui/ContainerScrollAnimation';
import { OpenRouterLogo, GeminiLogo, GroqLogo } from './icons/ProviderLogos';

const DashboardPreview = () => {
  return (
    <section id="dashboard" style={{ padding: '0', background: 'transparent', position: 'relative' }}>
      <div className="container" style={{ maxWidth: '1240px' }}>
        <ContainerScroll
          titleComponent={
            <div className="section-header">
              <h2 className="section-title">The Sovereign Workspace</h2>
              <p className="section-subtitle">
                Experience a clean, developer-first interface where your keys connect directly to world-class LLMs with complete operational clarity.
              </p>
            </div>
          }
        >
          {/* Dashboard Window — this is the "card content" inside the 3D scroll animation */}
          <div style={{
            background: '#050505',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            overflow: 'hidden',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              display: 'flex',
              flex: 1,
              background: '#0a0a0a',
              overflow: 'hidden',
              fontFamily: 'Inter, sans-serif'
            }} className="dashboard-grid">
              
              {/* Left Sidebar */}
              <div style={{
                width: '260px',
                borderRight: '1px solid rgba(255, 255, 255, 0.05)',
                padding: '24px 16px',
                display: 'flex',
                flexDirection: 'column',
                background: '#050505',
                color: '#e5e5e5'
              }} className="dashboard-sidebar">
                
                <div style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '36px', paddingLeft: '8px' }}>
                  BYOK
                </div>

                <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#737373', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px', paddingLeft: '8px' }}>
                  Connected Providers
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '24px' }}>
                  {/* Gemini */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', fontWeight: 600 }}>
                      <GeminiLogo size={14} />
                      Gemini
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#10b981' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>
                      Connected
                    </div>
                  </div>
                  {/* Groq */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', fontWeight: 600 }}>
                      <GroqLogo size={14} />
                      Groq
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#10b981' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>
                      Connected
                    </div>
                  </div>
                  {/* OpenRouter */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', fontWeight: 600 }}>
                      <OpenRouterLogo size={14} />
                      OpenRouter
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#10b981' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>
                      Connected
                    </div>
                  </div>
                </div>

                <button style={{
                  background: '#a855f7',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  marginBottom: '20px'
                }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 400, marginTop: '-2px' }}>+</span> New Chat
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 8px', borderRadius: '8px', background: '#171717', color: '#d4d4d4', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      History
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </div>
                  <div style={{ padding: '4px 8px 12px 34px', fontSize: '0.75rem', color: '#525252' }}>
                    No recent chats
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 8px', color: '#a3a3a3', fontSize: '0.9rem' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                    Analytics
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 8px', color: '#a3a3a3', fontSize: '0.9rem' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
                    Models
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 8px', color: '#a3a3a3', fontSize: '0.9rem' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
                    API Keys
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 8px', color: '#a3a3a3', fontSize: '0.9rem' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                    Settings
                  </div>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 8px 0' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, border: '1px solid #262626' }}>
                    T
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f5f5f5' }}>Test User</span>
                    <span style={{ fontSize: '0.75rem', color: '#737373' }}>text@example.com</span>
                  </div>
                </div>
              </div>

              {/* Center Arena */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0a0a0a', position: 'relative' }}>
                
                {/* Center text area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingBottom: '80px' }}>
                  <div style={{ width: '48px', height: '48px', position: 'relative', marginBottom: '28px' }}>
                    {/* Fake spinner */}
                    <div style={{ position: 'absolute', top: 4, left: '50%', transform: 'translateX(-50%)', width: '5px', height: '5px', borderRadius: '50%', background: '#4c1d95' }}></div>
                    <div style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', width: '5px', height: '5px', borderRadius: '50%', background: '#4c1d95' }}></div>
                    <div style={{ position: 'absolute', top: '50%', left: 4, transform: 'translateY(-50%)', width: '5px', height: '5px', borderRadius: '50%', background: '#4c1d95' }}></div>
                    <div style={{ position: 'absolute', top: '50%', right: 4, transform: 'translateY(-50%)', width: '5px', height: '5px', borderRadius: '50%', background: '#4c1d95' }}></div>
                    <div style={{ position: 'absolute', top: 10, left: 10, width: '5px', height: '5px', borderRadius: '50%', background: '#4c1d95' }}></div>
                    <div style={{ position: 'absolute', top: 10, right: 10, width: '5px', height: '5px', borderRadius: '50%', background: '#4c1d95' }}></div>
                    <div style={{ position: 'absolute', bottom: 10, left: 10, width: '5px', height: '5px', borderRadius: '50%', background: '#4c1d95' }}></div>
                    <div style={{ position: 'absolute', bottom: 10, right: 10, width: '5px', height: '5px', borderRadius: '50%', background: '#4c1d95' }}></div>
                    
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '8px', height: '8px', borderRadius: '50%', background: '#a855f7', boxShadow: '0 0 12px #a855f7' }}></div>
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginBottom: '10px' }}>
                    Ready when you are.
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: '#737373' }}>
                    Use Smart Mode or choose a provider manually.
                  </p>
                </div>

                {/* Input area */}
                <div style={{ padding: '0 40px 30px', position: 'absolute', bottom: 0, left: 0, right: 0, maxWidth: '800px', margin: '0 auto' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#171717',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '16px',
                    padding: '10px 14px',
                    gap: '12px'
                  }}>
                    <span style={{ color: '#525252', fontSize: '1.2rem', paddingLeft: '8px' }}>+</span>
                    <input
                      type="text"
                      placeholder="Ask BYOK anything..."
                      readOnly
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#737373',
                        fontSize: '0.95rem',
                        flex: 1,
                        outline: 'none',
                        cursor: 'default'
                      }}
                    />
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#262626', padding: '6px 12px', borderRadius: '8px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a855f7' }}></span>
                      <span style={{ fontSize: '0.8rem', color: '#d4d4d4', fontWeight: 500 }}>Smart</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>

                    <div style={{
                      background: '#262626',
                      borderRadius: '8px',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#737373'
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '0.65rem', color: '#525252' }}>
                    AI can make mistakes. Verify important info.
                  </div>
                </div>

              </div>
            </div>
          </div>

          <style>{`
            @media (max-width: 992px) {
              .dashboard-grid {
                grid-template-columns: 1fr !important;
              }
              .dashboard-sidebar, .dashboard-insights {
                border-right: none !important;
                border-left: none !important;
                border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
              }
            }
          `}</style>
        </ContainerScroll>
      </div>
    </section>
  );
};

export default DashboardPreview;
