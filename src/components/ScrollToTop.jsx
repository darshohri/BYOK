import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={scrollToTop}
          aria-label="Scroll to top"
          style={{
            position: 'fixed',
            right: '32px',
            bottom: '32px',
            zIndex: 999,
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(19, 15, 30, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(168, 85, 247, 0.55)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(168, 85, 247, 0.35)',
            transition: 'border-color 0.2s, background-color 0.2s, transform 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.95)';
            e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.25)';
            e.currentTarget.style.transform = 'translateY(-4px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.55)';
            e.currentTarget.style.backgroundColor = 'rgba(19, 15, 30, 0.85)';
            e.currentTarget.style.transform = 'translateY(0px)';
          }}
        >
          <ArrowUp size={24} color="#ffffff" strokeWidth={2.5} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;
