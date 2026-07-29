import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Cpu, ArrowRight, Terminal, Layers } from 'lucide-react';
import { ContainerScroll } from './ui/ContainerScrollAnimation';
import { OpenRouterLogo } from './icons/ProviderLogos';

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
            background: '#0a0812',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            overflow: 'hidden',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Top Window Bar */}
            <div style={{
              background: '#0c0a15',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444', opacity: 0.8 }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b', opacity: 0.8 }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', opacity: 0.8 }} />
                <span style={{ marginLeft: '12px', fontSize: '0.82rem', color: '#64748b', fontWeight: '600', fontFamily: 'monospace' }}>
                  byok-studio-main / default_workspace
                </span>
              </div>
            </div>

            {/* Main Workspace Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '245px 1fr 280px',
              flex: 1,
              background: '#09070e',
              overflow: 'hidden'
            }} className="dashboard-grid">
              
              {/* Left Sidebar */}
              <div style={{
                borderRight: '1px solid rgba(255, 255, 255, 0.06)',
                padding: '24px 16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: '#07050a'
              }} className="dashboard-sidebar">
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px', paddingLeft: '8px' }}>
                    Workspace Navigation
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.15)', color: '#ffffff', fontWeight: '600', fontSize: '0.9rem', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                      <MessageSquare size={17} color="#a855f7" />
                      <span>Chat Playground</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', color: '#94a3b8', fontSize: '0.9rem' }}>
                      <Layers size={17} />
                      <span>Compare Arena</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', color: '#94a3b8', fontSize: '0.9rem' }}>
                      <Terminal size={17} />
                      <span>API Logs</span>
                    </div>
                  </div>
                </div>

                {/* Provider status list */}
                <div style={{ padding: '14px', borderRadius: '14px', background: '#0e0b16', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px', fontWeight: '700' }}>
                    Configured Gateways
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', color: '#e2e8f0', fontWeight: '600' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#a855f7', boxShadow: '0 0 8px #a855f7' }} />
                        Google Gemini
                      </span>
                      <span style={{ fontSize: '0.68rem', padding: '2px 7px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', fontWeight: '700', border: '1px solid rgba(16, 185, 129, 0.25)' }}>Live</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', color: '#e2e8f0', fontWeight: '600' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#f97316', boxShadow: '0 0 8px #f97316' }} />
                        Groq LPU Engine
                      </span>
                      <span style={{ fontSize: '0.68rem', padding: '2px 7px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', fontWeight: '700', border: '1px solid rgba(16, 185, 129, 0.25)' }}>Live</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', color: '#e2e8f0', fontWeight: '600' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 8px #3b82f6' }} />
                        OpenRouter API
                      </span>
                      <span style={{ fontSize: '0.68rem', padding: '2px 7px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', fontWeight: '700', border: '1px solid rgba(16, 185, 129, 0.25)' }}>Live</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Chat Arena */}
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#09070e', justifyContent: 'space-between' }}>
                {/* Chat Body */}
                <div style={{ flex: 1, padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: '22px', overflowY: 'auto' }}>
                  {/* User Prompt Bubble */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
                      color: '#ffffff',
                      padding: '8px 14px',
                      borderRadius: '16px 16px 4px 16px',
                      fontSize: '0.85rem',
                      maxWidth: '80%',
                      boxShadow: '0 4px 15px rgba(124, 58, 237, 0.25)'
                    }}>
                      Compare inference speed and analytical precision across my configured models on complex multi-step reasoning.
                    </div>
                  </div>

                  {/* AI Response Bubble */}
                  <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '14px' }}>
                    <div style={{ flexShrink: 0, marginTop: '8px', filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.8)) drop-shadow(0 0 16px rgba(59, 130, 246, 0.4))' }}>
                      <OpenRouterLogo size={22} />
                    </div>
                    <div style={{
                      background: '#120e1d',
                      border: '1px solid rgba(255, 255, 255, 0.07)',
                      color: '#e2e8f0',
                      padding: '12px 16px',
                      borderRadius: '16px 16px 16px 4px',
                      fontSize: '0.85rem',
                      lineHeight: 1.5,
                      flex: 1
                    }}>
                      <p style={{ marginBottom: '8px', color: '#ffffff', fontWeight: '700', fontSize: '0.9rem' }}>
                        Direct Sovereign Execution:
                      </p>
                      <p style={{ margin: 0, color: '#94a3b8' }}>
                        By utilizing your personal credentials directly, this evaluation bypassed intermediate application queueing entirely. Output tokens streamed with zero platform markup, maximum throughput speeds, and complete local governance over conversation histories.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Prompt Input Area */}
                <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', background: '#0b0912', flexShrink: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#07050a',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '6px 6px 6px 16px'
                  }}>
                    <input
                      type="text"
                      placeholder="Enter prompt to execute across configured providers..."
                      readOnly
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#64748b',
                        fontSize: '0.9rem',
                        width: '100%',
                        outline: 'none',
                        cursor: 'default'
                      }}
                    />
                    <div style={{
                      background: '#8b5cf6',
                      border: 'none',
                      borderRadius: '8px',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      flexShrink: 0
                    }}>
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Real-Time Insights Sidebar */}
              <div style={{
                borderLeft: '1px solid rgba(255, 255, 255, 0.06)',
                padding: '24px 20px',
                background: '#07050a',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
              }} className="dashboard-insights">
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
                    Real-Time Insights
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Metric 1: Provider */}
                    <div style={{ background: '#0e0b16', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Active Gateway</div>
                      <div style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Cpu size={16} color="#a855f7" /> Native BYOK Protocol
                      </div>
                    </div>

                    {/* Metric 2: Latency */}
                    <div style={{ background: '#0e0b16', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Inference Latency</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#10b981' }}>1.2s <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#94a3b8' }}>avg response</span></div>
                    </div>

                    {/* Metric 3: Tokens */}
                    <div style={{ background: '#0e0b16', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Token Expenditure</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#ffffff', marginBottom: '6px' }}>1,432</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8' }}>
                        <span>In: 1,210</span>
                        <span>Out: 222</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 'auto', padding: '14px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.25)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#ffffff', marginBottom: '4px' }}>Zero Inference Markup</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4 }}>
                    100% of token consumption goes directly to your provider API keys without platform surcharge.
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
