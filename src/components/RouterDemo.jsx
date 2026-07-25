import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Zap, Globe, Sparkles, ArrowRight, CornerDownRight } from 'lucide-react';

const RouterDemo = () => {
  const [activeIdx, setActiveIdx] = useState(0);

  const workflowStates = [
    {
      id: 'gemini',
      name: 'Gemini',
      model: 'Gemini 1.5 Pro',
      tagline: 'Best for everyday AI',
      color: '#3b82f6',
      bgGradient: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.15), transparent 70%)',
      icon: <Cpu size={22} color="#60a5fa" />,
      prompt: 'Summarize Q3 financial report and extract core strategic revenue projections.',
      routingReason: 'Matched for deep contextual understanding & multi-modal precision',
      latency: '240ms',
      tokens: '984 tokens'
    },
    {
      id: 'groq',
      name: 'Groq',
      model: 'Llama 3.1 70B via LPU',
      tagline: 'Fastest responses',
      color: '#f97316',
      bgGradient: 'radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.15), transparent 70%)',
      icon: <Zap size={22} color="#fb923c" />,
      prompt: 'Stream live high-frequency stock analysis feed with sub-second WebSocket updates.',
      routingReason: 'Matched for ultra-low inference latency & instantaneous streaming',
      latency: '38ms',
      tokens: '412 tokens'
    },
    {
      id: 'openrouter',
      name: 'OpenRouter',
      model: 'Claude 3.5 Sonnet / Multi-Model',
      tagline: 'Access multiple models',
      color: '#a855f7',
      bgGradient: 'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.15), transparent 70%)',
      icon: <Globe size={22} color="#c084fc" />,
      prompt: 'Compare architectural differences between GPT-4o and Claude 3.5 Sonnet for server actions.',
      routingReason: 'Matched for model flexibility & federated reasoning capability',
      latency: '310ms',
      tokens: '1,520 tokens'
    }
  ];

  // Loop through states automatically
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % workflowStates.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [workflowStates.length]);

  const current = workflowStates[activeIdx];

  return (
    <section id="router" style={{ padding: '40px 0 100px 0', position: 'relative' }}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Intelligent BYOK Router</h2>
          <p className="section-subtitle">
            Experience real-time prompt orchestration. Requests automatically traverse a secure, encrypted pipeline to the optimal provider using your personal keys.
          </p>
        </div>

        {/* Workflow Showcase Box */}
        <div style={{
          maxWidth: '960px',
          margin: '0 auto',
          background: '#0b0910',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          padding: '40px',
          position: 'relative',
          boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden'
        }}>
          {/* Subtle background gradient reflecting active provider */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: current.bgGradient,
            transition: 'background 0.8s ease',
            pointerEvents: 'none',
            zIndex: 0
          }} />

          <div style={{ position: 'relative', zIndex: 10 }}>
            {/* Step 1: User Prompt */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '32px' }}>
              <span style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#64748b',
                fontWeight: '600',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Sparkles size={13} color="#8b5cf6" />
                Step 1: User Prompt
              </span>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIdx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    width: '100%',
                    maxWidth: '580px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    padding: '18px 24px',
                    fontSize: '1rem',
                    color: '#e2e8f0',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}
                >
                  <span style={{ textAlign: 'left', fontStyle: 'italic', color: '#f8fafc' }}>
                    "{current.prompt}"
                  </span>
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: '#94a3b8',
                    whiteSpace: 'nowrap'
                  }}>
                    LIVE INFERENCE
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Traveling Node Connection Path (Downwards to Router) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '60px', position: 'relative', marginBottom: '16px' }}>
              <div style={{ width: '2px', height: '100%', background: 'rgba(255, 255, 255, 0.1)', position: 'relative' }}>
                <motion.div
                  animate={{ top: ['0%', '85%', '0%'], opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute',
                    left: '-4px',
                    width: '10px',
                    height: '18px',
                    borderRadius: '99px',
                    background: '#8b5cf6',
                    boxShadow: '0 0 16px #a855f7'
                  }}
                />
              </div>
            </div>

            {/* Step 2: BYOK Router Node */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '36px' }}>
              <div style={{
                padding: '14px 32px',
                borderRadius: '99px',
                background: 'linear-gradient(135deg, #1e1b29 0%, #120e1c 100%)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                boxShadow: '0 0 35px rgba(139, 92, 246, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: current.color,
                  boxShadow: `0 0 14px ${current.color}`
                }} />
                <span style={{ fontWeight: '700', fontSize: '1.05rem', color: '#ffffff', letterSpacing: '-0.02em' }}>
                  BYOK Router Core
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  color: '#c4b5fd',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  background: 'rgba(139, 92, 246, 0.15)'
                }}>
                  Zero-Latency Routing
                </span>
              </div>
              
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeIdx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ fontSize: '0.825rem', color: '#94a3b8', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <CornerDownRight size={14} style={{ color: current.color }} />
                  {current.routingReason}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Traveling Node Path to Providers */}
            <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', marginBottom: '24px' }}>
              <div style={{
                width: '66%',
                height: '24px',
                borderTop: '2px solid rgba(255, 255, 255, 0.08)',
                borderLeft: '2px solid rgba(255, 255, 255, 0.08)',
                borderRight: '2px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px 12px 0 0',
                position: 'relative'
              }} />
            </div>

            {/* Step 3: Provider Destination Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '20px'
            }}>
              {workflowStates.map((provider, idx) => {
                const isActive = activeIdx === idx;

                return (
                  <motion.div
                    key={provider.id}
                    onClick={() => setActiveIdx(idx)}
                    style={{
                      cursor: 'pointer',
                      borderRadius: '18px',
                      padding: '24px',
                      background: isActive ? 'rgba(26, 22, 37, 0.9)' : 'rgba(15, 12, 22, 0.4)',
                      border: isActive ? `1px solid ${provider.color}` : '1px solid rgba(255, 255, 255, 0.06)',
                      boxShadow: isActive ? `0 10px 30px -10px ${provider.color}40` : 'none',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    whileHover={{ scale: 1.02 }}
                  >
                    {/* Glowing active bar at top of card */}
                    {isActive && (
                      <motion.div
                        layoutId="activeProviderGlow"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '3px',
                          background: provider.color,
                          boxShadow: `0 0 15px ${provider.color}`
                        }}
                      />
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {provider.icon}
                        </div>
                        <div>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>
                            {provider.name}
                          </h4>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            {provider.model}
                          </span>
                        </div>
                      </div>

                      {isActive && (
                        <span style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: provider.color,
                          boxShadow: `0 0 10px ${provider.color}`,
                          display: 'inline-block'
                        }} />
                      )}
                    </div>

                    {/* Required small label */}
                    <div style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: isActive ? `${provider.color}15` : 'rgba(255, 255, 255, 0.03)',
                      color: isActive ? provider.color : '#94a3b8',
                      fontSize: '0.825rem',
                      fontWeight: '600',
                      marginBottom: '16px',
                      border: isActive ? `1px solid ${provider.color}30` : '1px solid transparent',
                      transition: 'all 0.3s ease'
                    }}>
                      {provider.tagline}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '12px' }}>
                      <span>Latency: <strong style={{ color: isActive ? '#f8fafc' : '#94a3b8' }}>{provider.latency}</strong></span>
                      <span>Avg: <strong style={{ color: isActive ? '#f8fafc' : '#94a3b8' }}>{provider.tokens}</strong></span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            {/* Interactive hint */}
            <div style={{ textAlign: 'center', marginTop: '28px', fontSize: '0.8rem', color: '#64748b' }}>
              <span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '99px' }}>
                Click any provider card above to switch simulated route state
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RouterDemo;
