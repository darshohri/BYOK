import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { GeminiLogo, GroqLogo, OpenRouterLogo } from './icons/ProviderLogos';
import { GlowCard } from './ui/SpotlightCard';

const Providers = () => {
  const providerCards = [
    {
      id: 'gemini',
      name: 'Google Gemini',
      tag: 'Best for Everyday & Multimodal AI',
      desc: 'Harness Gemini Flash models directly with a 2M token context window. Perfect for extensive codebase analysis, deep reasoning, and multimodal image processing.',
      icon: <GeminiLogo size={28} />,
      badgeColor: '#a855f7',
      glowColor: 'purple',
      status: 'Verified BYOK Protocol',
      metrics: { latency: '~45ms', context: '2M Tokens', models: 'Flash' }
    },
    {
      id: 'groq',
      name: 'Groq LPU™ Engine',
      tag: 'Fastest Real-Time Responses',
      desc: 'Experience lightning-fast inference exceeding 300 tokens/sec. Ideal for real-time applications and zero-latency generation.',
      icon: <GroqLogo size={28} />,
      badgeColor: '#f97316',
      glowColor: 'orange',
      status: 'Ultra-Low Latency',
      metrics: { latency: '~15ms', context: '30K Tokens', models: 'Llama 3.3 / Qwen' }
    },
    {
      id: 'openrouter',
      name: 'OpenRouter Ecosystem',
      tag: 'Access Multiple Cutting-Edge Models',
      desc: 'Unlock over 100+ top-tier foundation models seamlessly. Route dynamically across Nemotron, Lyria, LiquidAI, and more.',
      icon: <OpenRouterLogo size={28} />,
      badgeColor: '#3b82f6',
      glowColor: 'blue',
      status: 'Universal API Gateway',
      metrics: { latency: '~110ms', context: '250K+ Tokens', models: '5+ Providers' }
    }
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 60, scale: 0.92 },
    visible: (custom) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        delay: custom * 0.18,
        ease: [0.16, 1, 0.3, 1]
      }
    })
  };

  return (
    <section id="providers" style={{ padding: '80px 0 90px 0', background: 'transparent', position: 'relative' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="section-header"
        >
          {/* Renamed Heading to "One Prompt, Best Model." */}
          <h2 className="section-title">One Prompt, Best Model.</h2>
          <p className="section-subtitle">
            Connect your personal credentials and experience pure native speed and intelligence without intermediate platform latency or hidden markups.
          </p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))',
          gap: '28px',
          margin: '0 auto',
          maxWidth: '1180px'
        }}>
          {providerCards.map((p, index) => (
            <motion.div
              key={p.id}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              whileHover={{
                y: -8,
                boxShadow: `0 20px 45px rgba(0,0,0,0.5), 0 0 25px ${p.badgeColor}33`
              }}
              style={{
                borderRadius: '16px',
                cursor: 'default',
                height: '100%',
                display: 'block',
              }}
            >
              <GlowCard
                glowColor={p.glowColor}
                style={{ height: '100%' }}
              >
                {/* Inner card layout seamlessly embedded */}
                <div style={{
                  padding: '36px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  boxSizing: 'border-box'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        background: '#13101c',
                        border: '1px solid rgba(255,255,255,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 8px 20px rgba(0,0,0,0.4)`
                      }}>
                        {p.icon}
                      </div>
                    </div>

                    <h3 style={{ fontSize: '1.45rem', fontWeight: '700', color: '#ffffff', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                      {p.name}
                    </h3>

                    <div style={{ fontSize: '0.88rem', color: p.badgeColor, fontWeight: '600', marginBottom: '16px' }}>
                      {p.tag}
                    </div>

                    <p style={{ fontSize: '0.95rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '28px' }}>
                      {p.desc}
                    </p>
                  </div>

                  <div style={{
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    paddingTop: '20px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '10px',
                    textAlign: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Avg Latency</div>
                      <div style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: '700' }}>{p.metrics.latency}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Context</div>
                      <div style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: '700' }}>{p.metrics.context}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Support</div>
                      <div style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: '600' }}>{p.metrics.models}</div>
                    </div>
                  </div>
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Providers;
