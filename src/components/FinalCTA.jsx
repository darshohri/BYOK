import React from 'react';
import { motion } from 'framer-motion';
import StarBorder from './ui/StarBorder';

const FinalCTA = () => {
  return (
    <section id="cta" style={{ padding: '120px 0 140px 0', background: 'transparent', position: 'relative' }}>
      <div className="container" style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 45 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: '100%', maxWidth: '940px' }}
        >
          <StarBorder
            as="div"
            color="cyan"
            speed="6s"
            thickness={3}
            className="final-cta-star"
          >
            <div style={{ padding: '85px 50px' }}>
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
          </StarBorder>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
