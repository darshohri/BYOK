'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SplineScene } from '@/components/ui/splite';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const defaultMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [animState, setAnimState] = useState<'blank' | 'meet' | 'meet_exit' | 'byok_entry' | 'byok_exit' | 'form'>('blank');
  const [splineReady, setSplineReady] = useState(false);
  const [mountSpline, setMountSpline] = useState(false);

  // Track when the Spline scene finishes loading
  const handleSplineLoad = useCallback(() => {
    setSplineReady(true);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    
    if (animState === 'blank') {
      timer = setTimeout(() => setAnimState('meet'), 300);
    } else if (animState === 'meet') {
      // Meet stays on screen before exiting
      timer = setTimeout(() => setAnimState('meet_exit'), 1200);
    } else if (animState === 'meet_exit') {
      // Meet fades out. Trigger next state slightly before finish to eliminate black screen gaps
      timer = setTimeout(() => setAnimState('byok_entry'), 600);
    } else if (animState === 'byok_entry') {
      // BYOK stays on screen
      timer = setTimeout(() => setAnimState('byok_exit'), 1200);
    } else if (animState === 'byok_exit') {
      // BYOK fades out. Trigger form slightly before finish
      timer = setTimeout(() => setAnimState('form'), 600);
    }

    return () => clearTimeout(timer);
  }, [animState]);

  useEffect(() => {
    // Delay Spline mount so it doesn't compete with the initial entrance
    const timer = setTimeout(() => setMountSpline(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/login' : '/api/signup';
      const body = mode === 'login' 
        ? { email, password }
        : { fullName, email, password };

      const res = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Persist auth state so the landing page can adapt
      localStorage.setItem('byok_has_account', 'true');

      // Success, navigate to workspace
      navigate('/workspace');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Show the 3D scene once both the animation phase AND Spline loading are ready
  const showScene = (animState === 'byok_entry' || animState === 'byok_exit' || animState === 'form') && splineReady;

  return (
    <div className="h-screen w-screen bg-[#050408] overflow-hidden">
      <Card className="w-full h-full bg-black/[0.96] relative overflow-hidden border-none rounded-none shadow-none">
        
        <button 
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 z-50 flex items-center gap-2 text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back to Home</span>
        </button>

        <div className="flex h-full flex-col md:flex-row">
          <div className="flex-1 p-8 md:p-12 relative z-10 border-r border-white/5 overflow-hidden">
            <div className="relative w-full h-full">
              {/* MEET TEXT */}
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none"
                variants={{
                  blank: { opacity: 0, y: 24 },
                  meet: { opacity: 1, y: 0 },
                  meet_exit: { opacity: 0, y: -24 },
                  byok_entry: { opacity: 0, y: -24 },
                  byok_exit: { opacity: 0, y: -24 },
                  form: { opacity: 0, y: -24 }
                }}
                initial="blank"
                animate={animState}
                transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-500">
                  Meet
                </h1>
              </motion.div>

              {/* BYOK TEXT */}
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none"
                variants={{
                  blank: { opacity: 0, y: 24 },
                  meet: { opacity: 0, y: 24 },
                  meet_exit: { opacity: 0, y: 24 },
                  byok_entry: { opacity: 1, y: 0 },
                  byok_exit: { opacity: 0, y: -24 },
                  form: { opacity: 0, y: -24 }
                }}
                initial="blank"
                animate={animState}
                transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <h1 className="text-6xl md:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500">
                  BYOK
                </h1>
              </motion.div>

              {/* FORM */}
              <motion.div
                className="absolute inset-0 flex flex-col justify-center max-w-md mx-auto w-full"
                variants={{
                  blank: { opacity: 0, y: 24 },
                  meet: { opacity: 0, y: 24 },
                  meet_exit: { opacity: 0, y: 24 },
                  byok_entry: { opacity: 0, y: 24 },
                  byok_exit: { opacity: 0, y: 24 },
                  form: { opacity: 1, y: 0 }
                }}
                initial="blank"
                animate={animState}
                transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                style={{ pointerEvents: animState === 'form' ? 'auto' : 'none' }}
              >
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {mode === 'login' ? 'Welcome Back' : 'Create your account'}
                    </h2>
                    <p className="text-neutral-400">
                      {mode === 'login' 
                        ? 'Access your account and continue your journey with us.' 
                        : 'Sign up to start building your own keys.'}
                    </p>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                      {error}
                    </div>
                  )}

                  <form className="space-y-4" onSubmit={handleSubmit}>
                    {mode === 'signup' && (
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-neutral-300">Full Name</label>
                        <input 
                          type="text" 
                          placeholder="John Doe" 
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                        />
                      </div>
                    )}
                    
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-neutral-300">Email Address</label>
                      <input 
                        type="email" 
                        placeholder="john@example.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-neutral-300">Password</label>
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                      />
                    </div>

                    <button 
                      disabled={isLoading}
                      type="submit"
                      className="w-full mt-6 px-4 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 focus:ring-2 focus:ring-purple-500/50 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Sign Up')}
                    </button>
                  </form>

                  <div className="mt-6 text-center text-sm text-neutral-400">
                    {mode === 'login' ? (
                      <p>
                        Don't have an account?{' '}
                        <button type="button" onClick={() => { setMode('signup'); setError(''); }} className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                          Sign up
                        </button>
                      </p>
                    ) : (
                      <p>
                        Already have an account?{' '}
                        <button type="button" onClick={() => { setMode('login'); setError(''); }} className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                          Sign in
                        </button>
                      </p>
                    )}
                  </div>
                </motion.div>
            </div>
          </div>

          {/* Right content (3D Scene) — always mounted, faded in when ready */}
          <div className="flex-1 relative hidden sm:block h-full w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/20 to-[#050408] z-10 pointer-events-none" />
            <motion.div
              className="absolute inset-0 w-full h-full z-0 origin-center"
              initial={{ opacity: 0, scale: 1.25 }}
              animate={{
                opacity: showScene ? 1 : 0,
                scale: animState === 'form' ? 1 : 1.25
              }}
              transition={{
                opacity: { duration: 1.2, ease: "easeInOut" },
                scale: { duration: 3.5, ease: [0.16, 1, 0.3, 1] } // Super smooth cinematic zoom-out
              }}
            >
              {mountSpline && (
                <React.Suspense fallback={null}>
                  <SplineScene 
                    scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                    className="w-full h-full"
                    onLoad={handleSplineLoad}
                  />
                </React.Suspense>
              )}
            </motion.div>
          </div>
        </div>
      </Card>
    </div>
  );
}
