import React from 'react';
import { motion } from 'framer-motion';
import { Key, Layers, GitCompare, BarChart3, PieChart, ShieldCheck } from 'lucide-react';

const Features = () => {
  const featureItems = [
    {
      icon: <Key size={26} color="#a855f7" />,
      glowColor: '#a855f7',
      title: 'Bring Your Own Keys',
      desc: 'Use your own provider credentials directly. Enjoy zero platform rate limits or intermediate inference taxes.',
      colSpan: 'span 1'
    },
    {
      icon: <Layers size={26} color="#3b82f6" />,
      glowColor: '#3b82f6',
      title: 'Multi-Provider Workspace',
      desc: 'Query Gemini 1.5 Pro, Llama 3.1 via Groq, and Claude 3.5 Sonnet side-by-side in one unified developer studio.',
      colSpan: 'span 1'
    },
    {
      icon: <GitCompare size={26} color="#10b981" />,
      glowColor: '#10b981',
      title: 'Model Comparison',
      desc: 'Benchmark model output quality, speed, and accuracy in real time with synchronized cross-engine prompts.',
      colSpan: 'span 1'
    },
    {
      icon: <BarChart3 size={26} color="#f97316" />,
      glowColor: '#f97316',
      title: 'Usage Analytics',
      desc: 'Track latency metrics and throughput speeds across all your active API keys from an integrated real-time dashboard.',
      colSpan: 'span 1'
    },
    {
      icon: <PieChart size={26} color="#6366f1" />,
      glowColor: '#6366f1',
      title: 'Transparent Token Tracking',
      desc: 'Monitor precise input/output token expenditures across models without markup fees or platform mystery billing.',
      colSpan: 'span 1'
    },
    {
      icon: <ShieldCheck size={26} color="#ec4899" />,
      glowColor: '#ec4899',
      title: 'Privacy First',
      desc: 'Keys remain entirely under your control with local-first vault encryption and zero external log persistence.',
      colSpan: 'span 1'
    }
  ];

  return (
    <section id="features" style={{ padding: '90px 0 100px 0', background: 'transparent', position: 'relative', overflow: 'hidden' }}>
      {/* Background ambient lighting */}
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '-10%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.07) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '-10%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.07) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div className="container">
        <motion.div 
          initial={{ opacity: 0, y: 50, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="section-header"
        >
          <h2 className="section-title">Engineered for Privacy & Control</h2>
          <p className="section-subtitle">
            A production-ready workspace designed from the ground up for developers and power users who demand transparency and sovereign API governance.
          </p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '26px',
          margin: '0 auto',
          maxWidth: '1180px'
        }}>
          {featureItems.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 70, scale: 0.88, rotateX: 10 }}
              whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ 
                duration: 0.75, 
                delay: i * 0.12, 
                ease: [0.16, 1, 0.3, 1] 
              }}
              whileHover={{ 
                y: -10,
                scale: 1.02,
                borderColor: f.glowColor,
                boxShadow: `0 22px 48px -12px rgba(0,0,0,0.7), 0 0 28px ${f.glowColor}33`
              }}
              style={{
                background: '#0a0810',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                borderRadius: '24px',
                padding: '38px 34px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                transition: 'border-color 0.35s ease, box-shadow 0.35s ease'
              }}
            >
              {/* Animated top shimmer beam */}
              <motion.div 
                initial={{ x: '-100%', opacity: 0 }}
                whileInView={{ x: '100%', opacity: 0.6 }}
                transition={{ duration: 2, delay: i * 0.2 + 0.5, repeat: Infinity, repeatDelay: 5 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '2px',
                  background: `linear-gradient(90deg, transparent, ${f.glowColor}, transparent)`
                }}
              />

              {/* Icon Container with continuous ambient pulse */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '26px' }}>
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.15 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '16px',
                    background: `radial-gradient(circle at center, ${f.glowColor}25 0%, #151122 100%)`,
                    border: `1px solid ${f.glowColor}44`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 0 20px ${f.glowColor}22`,
                    position: 'relative'
                  }}
                >
                  {/* Subtle pulsing background ring */}
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '16px',
                      border: `1px solid ${f.glowColor}`,
                      pointerEvents: 'none'
                    }}
                  />
                  {f.icon}
                </motion.div>
              </div>

              <h3 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#ffffff', marginBottom: '12px', letterSpacing: '-0.02em' }}>
                {f.title}
              </h3>

              <p style={{ fontSize: '0.95rem', color: '#94a3b8', lineHeight: 1.65, margin: 0 }}>
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
