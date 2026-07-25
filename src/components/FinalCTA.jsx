import React from 'react';
import { motion } from 'framer-motion';

const FinalCTA = () => {
  return (
    <section id="cta" style={{ padding: '120px 0 140px 0', background: 'transparent', position: 'relative' }}>
      <div className="container" style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 45, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.25 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: '100%', maxWidth: '940px' }}
        >
          <div style={{ 
            background: '#090712',
            borderRadius: '32px',
            padding: '85px 50px',
            textAlign: 'center',
            boxShadow: '0 30px 90px rgba(0, 0, 0, 0.8), 0 0 55px rgba(168, 85, 247, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.04)'
          }}>
            <h2 style={{
              fontSize: 'clamp(2.8rem, 5.5vw, 4.4rem)',
              fontWeight: '800',
              letterSpacing: '-0.035em',
              marginBottom: '26px',
              color: '#ffffff',
              lineHeight: 1.1,
              position: 'relative',
              zIndex: 20
            }}>
              Build with AI, <span className="text-gradient-purple">Not Limits.</span>
            </h2>

            <p style={{
              fontSize: '1.25rem',
              color: '#94a3b8',
              maxWidth: '660px',
              margin: '0 auto',
              lineHeight: 1.7,
              position: 'relative',
              zIndex: 20,
              fontWeight: '400'
            }}>
              Connect your Gemini, Groq, and OpenRouter API keys in sixty seconds. Experience the future of sovereign, high-speed LLM interaction with zero subscription gatekeepers.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
