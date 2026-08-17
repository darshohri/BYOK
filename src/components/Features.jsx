import React from 'react';
import { motion } from 'framer-motion';
import { CoverflowCarousel } from './ui/coverflow-carousel';

/** @type {import('./ui/coverflow-carousel').CoverflowSlide[]} */
const FEATURE_SLIDES = [
  {
    src: '/features/keys.png',
    alt: 'Bring Your Own Keys — use your own provider credentials directly',
    title: 'Bring Your Own Keys',
    subtitle: 'Use your own provider credentials directly. Enjoy zero platform rate limits or intermediate inference taxes.',
    meta: [
      { label: 'Rate Limits', value: 'None' },
      { label: 'Markup', value: '0%' },
      { label: 'Providers', value: '10+' },
    ],
  },
  {
    src: '/features/workspace.png',
    alt: 'Multi-Provider Workspace — query multiple AI models side by side',
    title: 'Multi-Provider Workspace',
    subtitle: 'Query Gemini 1.5 Pro, Llama 3.1 via Groq, and Claude 3.5 Sonnet side-by-side in one unified developer studio.',
    meta: [
      { label: 'Models', value: '50+' },
      { label: 'Providers', value: '10+' },
      { label: 'Latency', value: '<200ms' },
    ],
  },
  {
    src: '/features/compare.png',
    alt: 'Model Comparison — benchmark model output in real time',
    title: 'Model Comparison',
    subtitle: 'Benchmark model output quality, speed, and accuracy in real time with synchronized cross-engine prompts.',
    meta: [
      { label: 'Metrics', value: '8' },
      { label: 'Side-by-Side', value: 'Yes' },
      { label: 'Export', value: 'CSV/JSON' },
    ],
  },
  {
    src: '/features/analytics.png',
    alt: 'Usage Analytics — track latency metrics and throughput',
    title: 'Usage Analytics',
    subtitle: 'Track latency metrics and throughput speeds across all your active API keys from an integrated real-time dashboard.',
    meta: [
      { label: 'Real-Time', value: 'Yes' },
      { label: 'History', value: '90 days' },
      { label: 'Alerts', value: 'Custom' },
    ],
  },
  {
    src: '/features/tokens.png',
    alt: 'Transparent Token Tracking — monitor precise token expenditures',
    title: 'Transparent Token Tracking',
    subtitle: 'Monitor precise input/output token expenditures across models without markup fees or platform mystery billing.',
    meta: [
      { label: 'Granularity', value: 'Per-call' },
      { label: 'Billing', value: 'Transparent' },
      { label: 'Cost Savings', value: 'Up to 40%' },
    ],
  },
  {
    src: '/features/privacy.png',
    alt: 'Privacy First — keys remain entirely under your control',
    title: 'Privacy First',
    subtitle: 'Keys remain entirely under your control with local-first vault encryption and zero external log persistence.',
    meta: [
      { label: 'Encryption', value: 'AES-256' },
      { label: 'Logs', value: 'None' },
      { label: 'Storage', value: 'Local-first' },
    ],
  },
];

const Features = () => {
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
          <h2 className="section-title">Engineered for Privacy &amp; Control</h2>
          <p className="section-subtitle">
            A production-ready workspace designed from the ground up for developers and power users who demand transparency and sovereign API governance.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <CoverflowCarousel
            slides={FEATURE_SLIDES}
            showCaption
            showNavigation
            rotate={44}
            depth={0.6}
            perspective={3}
            falloff={0.56}
            fade={0.35}
            cardWidth="clamp(200px, 28vw, 340px)"
            gap={0.08}
            loop
            label="BYOK Features carousel"
            cardClassName="ring-1 ring-white/10"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
