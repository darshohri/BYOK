'use client';

import React, { useState, useEffect } from 'react';
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
  
  const [animState, setAnimState] = useState<'blank' | 'meet' | 'byok' | 'form'>('blank');

  useEffect(() => {
    // Sequence: blank (1s) -> meet (1.5s) -> byok (1.5s) -> form
    const timer1 = setTimeout(() => {
      setAnimState('meet');
    }, 1000);

    const timer2 = setTimeout(() => {
      setAnimState('byok');
    }, 2500);

    const timer3 = setTimeout(() => {
      setAnimState('form');
    }, 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer3);
    };
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

      // Success, navigate to workspace
      navigate('/workspace');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

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
          {/* Left content (Text animation / Form) */}
          <div className="flex-1 p-8 md:p-12 relative z-10 flex flex-col justify-center border-r border-white/5">
            <AnimatePresence mode="wait">
              {animState === 'meet' && (
                <motion.div
                  key="meet"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center justify-center text-center h-full"
                >
                  <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-500">
                    Meet
                  </h1>
                </motion.div>
              )}

              {animState === 'byok' && (
                <motion.div
                  key="byok"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40, filter: 'blur(10px)' }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center justify-center text-center h-full"
                >
                  <h1 className="text-6xl md:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500">
                    BYOK
                  </h1>
                </motion.div>
              )}

              {animState === 'form' && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex flex-col justify-center h-full max-w-md mx-auto w-full"
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
              )}
            </AnimatePresence>
          </div>

          {/* Right content (3D Scene) */}
          <div className="flex-1 relative hidden sm:block h-full w-full">
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/20 to-[#050408] z-10 pointer-events-none" />
            <div className="absolute inset-0 w-full h-full z-0">
              {(animState === 'byok' || animState === 'form') && (
                <SplineScene 
                  scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                  className="w-full h-full"
                />
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
