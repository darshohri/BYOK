import React from 'react';
import { motion } from 'framer-motion';

const Footer = ({ onOpenLegal }) => {
  const supportedProviders = [
    'Google Gemini',
    'Groq LPU™ Engine',
    'OpenRouter Gateway',
    'Model Benchmark'
  ];

  const workspacePrivacy = [
    'Key Vault Security',
    'Local-First Encryption',
    'Zero Data Retention',
    'Open Source Audit'
  ];

  return (
    <footer style={{
      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
      padding: '70px 0 44px 0',
      background: '#040306',
      color: '#64748b',
      fontSize: '0.9rem'
    }}>
      <div className="container">
        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '40px',
            marginBottom: '56px'
          }}
        >
          <div style={{ gridColumn: 'span 2', minWidth: '260px' }}>
            {/* Typographic wordmark WITHOUT icon */}
            <div style={{ fontWeight: '900', fontSize: '1.9rem', letterSpacing: '-0.035em', color: '#ffffff', marginBottom: '20px' }}>
              BYOK
            </div>

            <p style={{ maxWidth: '340px', lineHeight: 1.6, color: '#94a3b8', margin: 0 }}>
              A free, privacy-first AI workspace that lets developers connect Gemini, Groq, and OpenRouter using their personal API credentials.
            </p>
            {/* Social icons cleanly removed per instructions */}
          </div>

          <div>
            <div style={{ color: '#ffffff', fontWeight: '700', marginBottom: '20px', fontSize: '0.95rem', cursor: 'default' }}>Supported Providers</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {supportedProviders.map((item, index) => (
                <li key={index} style={{ cursor: 'default' }}>
                  {/* Styled as span with default cursor so pointer hand never appears */}
                  <span style={{ color: '#64748b', cursor: 'default', fontWeight: '500' }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div style={{ color: '#ffffff', fontWeight: '700', marginBottom: '20px', fontSize: '0.95rem', cursor: 'default' }}>Workspace & Privacy</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {workspacePrivacy.map((item, index) => (
                <li key={index} style={{ cursor: 'default' }}>
                  {/* Styled as span with default cursor so pointer hand never appears */}
                  <span style={{ color: '#64748b', cursor: 'default', fontWeight: '500' }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            paddingTop: '32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '0.85rem'
          }}
        >
          <div>
            &copy; {new Date().getFullYear()} BYOK. All rights reserved. Built for sovereign developer speed & privacy.
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <button
              onClick={() => onOpenLegal && onOpenLegal('privacy')}
              style={{ background: 'transparent', border: 'none', color: '#64748b', transition: 'color 0.2s', cursor: 'pointer', padding: 0, font: 'inherit' }}
              onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
              onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onOpenLegal && onOpenLegal('terms')}
              style={{ background: 'transparent', border: 'none', color: '#64748b', transition: 'color 0.2s', cursor: 'pointer', padding: 0, font: 'inherit' }}
              onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
              onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
            >
              Terms of Service
            </button>
            <button
              onClick={() => onOpenLegal && onOpenLegal('security')}
              style={{ background: 'transparent', border: 'none', color: '#64748b', transition: 'color 0.2s', cursor: 'pointer', padding: 0, font: 'inherit' }}
              onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
              onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
            >
              Security Report
            </button>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
