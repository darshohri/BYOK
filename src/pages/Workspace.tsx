import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { LayoutDashboard, Users, Settings, Database, Server, Shield, Bell, Search, Terminal, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Workspace() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050408] text-white overflow-hidden relative">
      {/* Background gradients and effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none" />

      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              BYOK Sovereign
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="w-64 bg-white/5 border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-neutral-500"
              />
            </div>
            <button className="text-neutral-400 hover:text-white transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-purple-500 rounded-full border border-[#050408]"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 border border-white/10 overflow-hidden cursor-pointer">
               {/* Avatar placeholder */}
               <div className="w-full h-full flex items-center justify-center text-xs font-medium text-neutral-400">
                  Me
               </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="bg-white/[0.02] border-white/5 p-4 rounded-2xl backdrop-blur-md shadow-2xl">
            <nav className="space-y-1">
              {[
                { icon: LayoutDashboard, label: 'Dashboard', active: true },
                { icon: Server, label: 'Nodes', active: false },
                { icon: Database, label: 'Storage', active: false },
                { icon: Users, label: 'Access', active: false },
                { icon: Settings, label: 'Settings', active: false },
              ].map((item, i) => (
                <button
                  key={i}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                    item.active 
                      ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/10' 
                      : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
                  }`}
                >
                  <item.icon size={18} />
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="mt-2 pt-2 border-t border-white/5">
              <button
                onClick={() => {
                  localStorage.removeItem('byok_has_account');
                  navigate('/');
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-all"
              >
                <LogOut size={18} />
                <span className="font-medium text-sm">Log Out</span>
              </button>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-b from-purple-900/20 to-transparent border-purple-500/20 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Terminal size={20} className="text-purple-400" />
              <h3 className="font-semibold text-purple-100">Quick Deploy</h3>
            </div>
            <p className="text-sm text-purple-200/60 mb-4">
              Initialize a new secure node in your sovereign network.
            </p>
            <button className="w-full py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-lg text-sm font-medium text-purple-100 transition-all">
              Initialize Node
            </button>
          </Card>
        </div>

        {/* Main Dashboard Area */}
        <div className="lg:col-span-9 space-y-6">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mb-2">
              Welcome to The Sovereign Workspace
            </h1>
            <p className="text-neutral-400">
              Your keys, your control. Manage your decentralized infrastructure.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Active Nodes', value: '12', trend: '+2 this week' },
              { label: 'Network Health', value: '99.9%', trend: 'Optimal status' },
              { label: 'Encrypted Vaults', value: '4', trend: '0 compromised' },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.2 }}
              >
                <Card className="bg-white/[0.02] border-white/5 p-6 rounded-2xl backdrop-blur-sm hover:bg-white/[0.04] transition-colors cursor-pointer group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="text-sm font-medium text-neutral-400 mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-xs text-emerald-400/80">{stat.trend}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Activity Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-white/[0.02] border-white/5 p-6 rounded-2xl backdrop-blur-sm">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                Recent Network Activity
              </h2>
              
              <div className="space-y-4">
                {[
                  { title: 'Node Authentication Successful', time: 'Just now', type: 'success' },
                  { title: 'Vault Key Rotation Completed', time: '2h ago', type: 'info' },
                  { title: 'New Device Registered', time: '5h ago', type: 'info' },
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.01] border border-white/[0.03] hover:bg-white/[0.03] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${log.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                      <p className="text-sm font-medium text-neutral-200">{log.title}</p>
                    </div>
                    <span className="text-xs text-neutral-500">{log.time}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
