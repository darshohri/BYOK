import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const FAQItem = ({ question, answer, isOpen, onClick, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        overflow: 'hidden'
      }}
    >
      <button
        onClick={onClick}
        style={{
          width: '100%',
          padding: '26px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'transparent',
          border: 'none',
          color: '#ffffff',
          textAlign: 'left',
          cursor: 'pointer',
          fontSize: '1.2rem',
          fontWeight: '700',
          letterSpacing: '-0.01em',
          gap: '20px',
          font: 'inherit',
          transition: 'color 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.color = '#a855f7'}
        onMouseOut={(e) => e.currentTarget.style.color = isOpen ? '#a855f7' : '#ffffff'}
      >
        <span style={{ color: isOpen ? '#a855f7' : '#ffffff' }}>{question}</span>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: isOpen ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 255, 0.05)',
          border: '1px solid',
          borderColor: isOpen ? 'rgba(168, 85, 247, 0.5)' : 'rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isOpen ? '#a855f7' : '#94a3b8',
          flexShrink: 0,
          transition: 'all 0.2s'
        }}>
          {isOpen ? <Minus size={16} /> : <Plus size={16} />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: 'auto', marginBottom: '28px' },
              collapsed: { opacity: 0, height: 0, marginBottom: '0px' }
            }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div style={{
              fontSize: '0.98rem',
              color: '#94a3b8',
              lineHeight: 1.7,
              maxWidth: '780px',
              paddingRight: '20px',
              fontWeight: '400'
            }}>
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'What does BYOK stand for?',
      a: 'BYOK stands for "Bring Your Own Key." Instead of subscribing to proprietary platform wrapper services that limit your access and charge high recurring fees, BYOK allows you to enter your own direct developer API keys from Google Gemini, Groq, and OpenRouter directly into a sovereign developer workspace.'
    },
    {
      q: 'How does the BYOK architecture work?',
      a: 'When you execute a prompt in our studio, your requests are routed directly to the official provider REST APIs. By cutting out intermediate servers, you experience raw native inference speed, zero platform queue delays, and complete control.'
    },
    {
      q: 'How are my personal API keys protected?',
      a: 'Your API keys are securely stored and encrypted. They are only used to authenticate your requests directly with the model providers, ensuring you retain full control over your credentials and usage.'
    },
    {
      q: 'Why should I switch from traditional subscription SaaS tools?',
      a: 'Traditional SaaS subscriptions charge repetitive monthly fees ($20–$50+/mo), enforce artificial chat query limits, tax your token throughput with intermediate pricing markup, and store your chat logs on third-party cloud database servers. With BYOK, you pay only for your exact token consumption at official raw provider rates with zero markup and 100% sovereign data ownership.'
    },
    {
      q: 'Which language models and providers are supported?',
      a: 'Our universal protocol supports Google Gemini (3.5 & 3.6 Flash with 1M context), Groq LPU™ Engine (delivering over 300+ tokens/sec on Llama and Qwen models), and the entire OpenRouter Ecosystem (giving you dynamic routing across Nemotron, Lyria, LiquidAI, and 100+ top foundation models).'
    },
    {
      q: 'Is the BYOK developer studio free to use?',
      a: 'Yes, the BYOK interface is completely free. While you create a secure account to sync your chat history and settings across devices, there are no recurring subscription fees and zero markup charges per inference token. You interact purely using your direct provider billing account.'
    }
  ];

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" style={{ padding: '100px 0', background: 'transparent', position: 'relative' }}>
      <div className="container" style={{ maxWidth: '920px' }}>
        <motion.div
          initial={{ opacity: 0, y: 45 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="section-header"
        >
          {/* Note: The icon box above FAQs has been removed completely! */}
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">
            Everything you need to know about Bring Your Own Key architecture, native provider speeds, and sovereign developer encryption.
          </p>
        </motion.div>

        <div style={{ 
          background: '#0a0812',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          padding: '20px 42px 30px 42px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)'
        }}>
          {faqs.map((faq, idx) => (
            <FAQItem
              key={idx}
              index={idx}
              question={faq.q}
              answer={faq.a}
              isOpen={openIndex === idx}
              onClick={() => handleToggle(idx)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
