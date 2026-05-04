/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Shield, 
  Terminal, 
  Database, 
  Brain, 
  Search, 
  Activity, 
  Lock, 
  Zap, 
  Cpu,
  Monitor,
  Menu,
  X,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

import { DashboardView } from './components/DashboardView';
import { IntakeView } from './components/IntakeView';
import { IntelligenceView } from './components/IntelligenceView';
import { ScanningView } from './components/ScanningView';

// Views (Stubbed for Phase 1)
const SimulationView = () => (
  <div className="p-8 flex items-center justify-center h-full">
    <div className="text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto border border-purple-500/20">
        <Terminal size={32} className="text-purple-400" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Simulation Lab: Phase 5</h3>
        <p className="text-sm text-muted font-mono uppercase tracking-widest mt-2">Locked • Internal Development in Progress</p>
      </div>
    </div>
  </div>
);

const GovernanceView = () => (
  <div className="p-8 flex items-center justify-center h-full">
    <div className="text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mx-auto border border-cyan-500/20">
        <Shield size={32} className="text-cyan-400" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Governance Engine: Phase 7</h3>
        <p className="text-sm text-muted font-mono uppercase tracking-widest mt-2">Policy Enforcer • Standby Mode</p>
      </div>
    </div>
  </div>
);

const SidebarItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link to={to}>
    <motion.div 
      whileHover={{ x: 4 }}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden",
        active ? "bg-primary/10 text-primary border border-primary/20" : "text-muted hover:text-foreground hover:bg-muted/50"
      )}
    >
      {active && (
        <motion.div 
          layoutId="sidebar-active"
          className="absolute left-0 top-0 bottom-0 w-1 bg-primary"
        />
      )}
      <Icon size={18} className={cn("transition-colors", active ? "text-primary" : "text-muted group-hover:text-foreground")} />
      <span className="font-mono text-xs uppercase tracking-widest font-medium">{label}</span>
    </motion.div>
  </Link>
);

import { LabProvider, useLab } from './contexts/LabContext';

export default function App() {
  return (
    <LabProvider>
      <Router>
        <AppContent />
      </Router>
    </LabProvider>
  );
}

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { systemStatus, theme } = useLab();

  return (
    <div className={cn(
      "flex h-screen bg-[#0C0D0E] text-slate-300 font-sans selection:bg-primary/30 selection:text-white overflow-hidden transition-colors duration-700",
      "theme-" + theme
    )}>
        {/* Sidebar */}
        <AnimatePresence mode="wait">
          {sidebarOpen && (
            <motion.aside 
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              className="w-64 border-r border-[#1F2124] flex flex-col z-50 bg-[#0C0D0E]"
            >
              <div className="p-6 flex items-center gap-3 border-b border-[#1F2124]">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_15px_-3px_rgba(34,197,94,0.4)]">
                  <Shield size={18} className="text-black fill-current" />
                </div>
                <div>
                  <h1 className="font-mono text-sm font-bold tracking-tighter text-white uppercase">Aegis OS</h1>
                  <p className="text-[10px] font-mono text-primary/70 tracking-widest uppercase">Research Lab</p>
                </div>
              </div>

              <div className="flex-1 px-3 py-6 space-y-2 overflow-y-auto custom-scrollbar">
                <LocationAwareSidebar />
              </div>

              <div className="p-4 border-t border-[#1F2124] space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] uppercase tracking-widest font-mono text-muted mb-1">
                    <span>CPU Load</span>
                    <span>{systemStatus.cpu}%</span>
                  </div>
                  <div className="h-1 bg-[#1F2124] rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary" 
                      animate={{ width: `${systemStatus.cpu}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 px-2 py-1 rounded bg-red-500/5 border border-red-500/10 transition-colors cursor-pointer hover:bg-red-500/10">
                  <span className="text-[10px] font-mono text-red-500 uppercase tracking-tighter">Emergency Kill Sw.</span>
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 relative h-full">
          {/* Top Navbar */}
          <header className="h-14 border-b border-[#1F2124] flex items-center justify-between px-6 bg-[#0C0D0E]/80 backdrop-blur-md z-40 sticky top-0">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-muted/50 rounded-lg transition-colors text-muted hover:text-foreground"
              >
                {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
              <div className="h-4 w-px bg-[#1F2124]" />
              <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
                <StatusPill icon={Zap} label="System" value="Stable" color="text-primary" />
                <StatusPill icon={Brain} label="Agents" value="3 Ready" color="text-blue-400" />
                <StatusPill icon={Activity} label="Health" value={`${systemStatus.health}%`} color="text-yellow-400" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-[10px] font-mono text-muted uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Live Session
              </div>
              <button className="p-2 hover:bg-muted/50 rounded-lg transition-colors text-muted hover:text-foreground">
                <Lock size={18} />
              </button>
            </div>
          </header>

          {/* Route Container */}
          <main className="flex-1 overflow-y-auto no-scrollbar bg-[#090A0B]">
            <Routes>
              <Route path="/" element={<DashboardView />} />
              <Route path="/intake" element={<IntakeView />} />
              <Route path="/intelligence" element={<IntelligenceView />} />
              <Route path="/scanning" element={<ScanningView />} />
              <Route path="/simulation" element={<SimulationView />} />
              <Route path="/governance" element={<GovernanceView />} />
            </Routes>
          </main>
        </div>
      </div>
    );
}

function LocationAwareSidebar() {
  const location = useLocation();
  return (
    <>
      <SidebarItem to="/" icon={Monitor} label="Mission Control" active={location.pathname === '/'} />
      <SidebarItem to="/intake" icon={Database} label="Source Intake" active={location.pathname === '/intake'} />
      <SidebarItem to="/intelligence" icon={Brain} label="Intelligence Lab" active={location.pathname === '/intelligence'} />
      <SidebarItem to="/scanning" icon={Search} label="Scanning Gate" active={location.pathname === '/scanning'} />
      <SidebarItem to="/simulation" icon={Terminal} label="Simulation Lab" active={location.pathname === '/simulation'} />
      <SidebarItem to="/governance" icon={Shield} label="Governance" active={location.pathname === '/governance'} />
    </>
  );
}

function StatusPill({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={12} className={color} />
      <span className="text-[10px] font-mono text-muted uppercase tracking-wider">{label}:</span>
      <span className={cn("text-[10px] font-mono font-bold uppercase", color)}>{value}</span>
    </div>
  );
}
