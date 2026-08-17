import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0',
      background: 'transparent'
    }}>
      {/* Note: All bottom blending gradients and border seams have been excised completely so the dotfield is 100% continuous and seamless! */}

      <div className="container" style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: '900px' }}>
        <motion.div
          initial={{ opacity: 0, y: 35, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(3.4rem, 8vw, 6rem)',
              fontWeight: '800',
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
              marginBottom: '32px',
              color: '#ffffff'
            }}
          >
            One Workspace.<br />
            <span className="text-gradient-purple">Every AI.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(1.15rem, 2.3vw, 1.45rem)',
              color: '#94a3b8',
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: 1.65,
              fontWeight: '400'
            }}
          >
            Connect Gemini, Groq, and OpenRouter in a single intelligent workspace. Compare models, monitor usage, and use your own API keys with complete control.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
