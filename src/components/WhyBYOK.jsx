import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import StarBorder from './ui/StarBorder';

const WhyBYOK = () => {
  const oldSaaS = [
    { text: 'Recurring monthly subscription fees ($20-$50+/mo)' },
    { text: 'Locked into a single provider model or limited tier' },
    { text: 'Artificial token rate limits and query throttles' },
    { text: 'Your conversation data logged on third-party platform servers' },
    { text: 'Hidden inference markups and intermediate API routing taxes' }
  ];

  const byokAdvantage = [
    { text: 'No monthly subscription — pay only your exact provider usage' },
    { text: 'Use your own API keys directly with sovereign governance' },
    { text: 'Support for Gemini 1.5 Pro, Groq LPU, and OpenRouter' },
    { text: 'Unified AI workspace to benchmark and compare output quality' },
    { text: 'Transparent usage and latency tracking in real time' },
    { text: 'Privacy-first design with local-first key vault encryption' }
  ];

  return (
    <section id="why-byok" style={{ padding: '100px 0', background: 'transparent', position: 'relative', overflow: 'hidden' }}>
      <div className="container" style={{ maxWidth: '1180px' }}>
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="section-header"
        >
          {/* FREE FOREVER green pill badge removed per instructions */}
          
          <h2 className="section-title" style={{ marginTop: 0 }}>Why Developers Choose BYOK</h2>
          <p className="section-subtitle">
            Break free from repetitive SaaS subscriptions and proprietary garden ecosystems. Bring your own keys and experience pure sovereign intelligence.
          </p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '30px',
          alignItems: 'stretch'
        }}>
          {/* Old Subscriptions Side */}
          <motion.div 
            initial={{ opacity: 0, x: -50, scale: 0.94 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: '#09070e',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '24px',
              padding: '40px',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontWeight: '800', fontSize: '1.2rem' }}>
                ✕
              </div>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#e2e8f0', margin: 0 }}>Standard Subscription SaaS</h3>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Traditional monthly gatekeeper platforms</div>
              </div>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {oldSaaS.map((item, index) => (
                <li key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.5 }}>
                  <span style={{ display: 'inline-flex', padding: '3px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', marginTop: '2px', flexShrink: 0 }}>
                    <X size={14} strokeWidth={3} />
                  </span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* The BYOK Advantage Side */}
          <motion.div 
            initial={{ opacity: 0, x: 50, scale: 0.94 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: 'linear-gradient(135deg, #120e22 0%, #0d0918 100%) padding-box, linear-gradient(90deg, #8b5cf6, #3b82f6, #8b5cf6) border-box',
              border: '2px solid transparent',
              borderRadius: '24px',
              padding: '40px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 35px rgba(139, 92, 246, 0.18)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 0 15px rgba(139, 92, 246, 0.5)' }}>
                <Check size={20} strokeWidth={3} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
                  The BYOK Architecture
                </h3>
                <div style={{ fontSize: '0.85rem', color: '#a855f7', fontWeight: '600' }}>Direct sovereign developer workspace</div>
              </div>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {byokAdvantage.map((item, index) => (
                <li key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', color: '#f8fafc', fontSize: '0.98rem', lineHeight: 1.5, fontWeight: '500' }}>
                  <span style={{ display: 'inline-flex', padding: '3px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', marginTop: '2px', flexShrink: 0 }}>
                    <Check size={14} strokeWidth={3} />
                  </span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhyBYOK;
