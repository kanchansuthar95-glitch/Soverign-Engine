import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  Send, 
  User, 
  Sparkles, 
  ChevronDown, 
  Cpu, 
  ShieldCheck, 
  Search,
  MessageSquare,
  Globe,
  Share2,
  Settings2,
  Plus,
  Trash2,
  CheckCircle2,
  Zap,
  Palette,
  Crown,
  Target,
  Shield
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useLab, ThemeColor, AgentConfig, ROLE_REGISTRY, HierarchyLevel } from '../contexts/LabContext';

interface Message {
  id: string;
  role: string;
  content: string;
  agentName?: string;
  color?: string;
  hierarchy?: HierarchyLevel;
}

export function IntelligenceView() {
  const { theme, setTheme, agents, setAgents } = useLab();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'system', content: 'Aegis Intelligence Core Online. Waiting for operator dispatch.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleRoleSelect = (agentId: string, roleId: string) => {
    const role = ROLE_REGISTRY.find(r => r.id === roleId);
    if (!role) return;

    setAgents(prev => prev.map(a => a.id === agentId ? {
      ...a,
      roleId: role.id,
      name: role.name,
      systemPrompt: role.systemPrompt,
      color: role.defaultColor,
      hierarchy: role.hierarchy
    } : a));
  };

  const getHierarchyIcon = (level?: HierarchyLevel) => {
    if (level === 'Director') return <Crown size={12} className="text-yellow-400" />;
    if (level === 'Specialist') return <Target size={12} className="text-blue-400" />;
    return <Shield size={12} className="text-slate-400" />;
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isAnalyzing) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsAnalyzing(true);

    try {
      const activeAgents = agents.filter(a => a.active);
      const res = await fetch('/api/intelligence/debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: inputValue, agents: activeAgents })
      });
      
      const debate = await res.json();
      
      const newMessages: Message[] = debate.responses.map((r: any, idx: number) => ({
        id: `${debate.id}_${idx}`,
        role: `agent-${r.role}`,
        agentName: r.name,
        content: r.content,
        color: r.color,
        hierarchy: r.hierarchy
      }));

      setMessages(prev => [...prev, ...newMessages]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: 'err', role: 'system', content: 'Debate engine halted: connection error.' }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={cn("flex h-full flex-col lg:flex-row overflow-hidden theme-" + theme, "bg-theme-glow")}>
      {/* Configuration Sidebar */}
      <AnimatePresence mode="wait">
        {showConfig && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 340, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-r border-white/10 bg-black/40 backdrop-blur-3xl shrink-0 overflow-y-auto custom-scrollbar"
          >
            <div className="p-6 space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-white">Agent Fleet Config</h3>
                <Settings2 size={16} className="text-muted" />
              </div>

              {/* Theme Selector */}
              <div className="space-y-4">
                <SectionHeader title="Core Tone" />
                <div className="flex gap-2">
                  <ThemeToggle theme="azure" active={theme === 'azure'} onClick={() => setTheme('azure')} color="bg-blue-500" />
                  <ThemeToggle theme="emerald" active={theme === 'emerald'} onClick={() => setTheme('emerald')} color="bg-emerald-500" />
                  <ThemeToggle theme="crimson" active={theme === 'crimson'} onClick={() => setTheme('crimson')} color="bg-red-500" />
                  <ThemeToggle theme="amber" active={theme === 'amber'} onClick={() => setTheme('amber')} color="bg-amber-500" />
                  <ThemeToggle theme="obsidian" active={theme === 'obsidian'} onClick={() => setTheme('obsidian')} color="bg-indigo-500" />
                </div>
              </div>

              {/* Agent List */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <SectionHeader title="Fleet Entities" />
                  <button onClick={() => setAgents([...agents, { id: Date.now().toString(), name: 'New Agent', roleId: 'vortex', systemPrompt: 'Be technical', color: '#888', active: true, hierarchy: 'Specialist' }])} className="p-1 hover:bg-white/10 rounded-lg text-primary transition-colors">
                    <Plus size={16} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  {agents.map((agent, idx) => (
                    <div key={agent.id} className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4 group hover:bg-white/[0.04] transition-all">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <select 
                            className="bg-transparent border-none text-[10px] font-mono text-primary uppercase font-bold focus:outline-none mb-1 cursor-pointer w-full"
                            value={agent.roleId}
                            onChange={(e) => handleRoleSelect(agent.id, e.target.value)}
                          >
                            {ROLE_REGISTRY.map(r => (
                              <option key={r.id} value={r.id} className="bg-[#0C0D0E]">{r.title}</option>
                            ))}
                          </select>
                          <input 
                            value={agent.name} 
                            onChange={(e) => {
                              const newAgents = [...agents];
                              newAgents[idx].name = e.target.value;
                              setAgents(newAgents);
                            }}
                            className="bg-transparent border-none text-sm font-bold text-white focus:outline-none w-full"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="p-1 px-2 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5 shrink-0">
                             {getHierarchyIcon(agent.hierarchy)}
                             <span className="text-[8px] font-mono font-bold uppercase tracking-tighter text-muted">[{agent.hierarchy}]</span>
                           </div>
                           <input 
                            type="checkbox" 
                            checked={agent.active} 
                            onChange={() => {
                              const newAgents = [...agents];
                              newAgents[idx].active = !newAgents[idx].active;
                              setAgents(newAgents);
                            }}
                            className="accent-primary w-3 h-3 cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="relative">
                        <textarea 
                          value={agent.systemPrompt}
                          onChange={(e) => {
                            const newAgents = [...agents];
                            newAgents[idx].systemPrompt = e.target.value;
                            setAgents(newAgents);
                          }}
                          className="w-full bg-black/40 border border-white/5 rounded-2xl p-3 text-[10px] font-mono text-slate-400 focus:outline-none focus:border-white/20 resize-none h-24 custom-scrollbar"
                          placeholder="Agent System Prompt..."
                        />
                        <div className="absolute right-2 bottom-2">
                          <input 
                            type="color" 
                            value={agent.color} 
                            onChange={(e) => {
                              const newAgents = [...agents];
                              newAgents[idx].color = e.target.value;
                              setAgents(newAgents);
                            }}
                            className="w-4 h-4 rounded-full border-none bg-transparent cursor-pointer overflow-hidden p-0"
                          />
                        </div>
                      </div>
                      <button 
                        onClick={() => setAgents(agents.filter(a => a.id !== agent.id))} 
                        className="w-full py-1.5 text-[9px] font-mono uppercase tracking-widest text-red-500/40 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all border border-transparent hover:border-red-500/10"
                      >
                         Decommission
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Arena */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        {/* Arena Header */}
        <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-black/20 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-4">
             <button onClick={() => setShowConfig(!showConfig)} className={cn("p-2 rounded-xl transition-all", showConfig ? "bg-primary text-black" : "bg-white/5 text-muted hover:text-foreground")}>
              <Settings2 size={18} />
             </button>
             <div className="h-4 w-px bg-white/10" />
             <div className="flex items-center gap-3">
                <Brain size={16} className="text-theme-tone" />
                <h2 className="text-sm font-bold text-white uppercase tracking-tighter">Collaborative Intelligence Lab</h2>
             </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex -space-x-2">
               {agents.filter(a => a.active).map(a => (
                 <div key={a.id} className="w-6 h-6 rounded-full border-2 border-[#090A0B] flex items-center justify-center text-[8px] font-bold text-white" style={{ backgroundColor: a.color }}>
                   {a.name[0]}
                 </div>
               ))}
             </div>
             <div className="h-4 w-px bg-white/10" />
             <button className="text-[10px] font-mono text-muted uppercase tracking-widest hover:text-white transition-colors">Clear History</button>
          </div>
        </div>

        {/* Chat Feed */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-12 space-y-10 no-scrollbar pb-32">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
          {isAnalyzing && <LoadingBubble agents={agents.filter(a => a.active)} />}
        </div>

        {/* Input Dock */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6">
          <div className="glass-dark rounded-[2rem] p-2 pr-4 shadow-2xl overflow-hidden group focus-within:ring-2 focus-within:ring-white/10 transition-all">
            <div className="flex items-center">
              <input 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Submit inquiry for agent consensus..."
                className="flex-1 bg-transparent border-none py-4 px-6 text-sm text-foreground focus:outline-none placeholder:text-muted/40 font-sans"
              />
              <div className="flex items-center gap-2">
                 <button className="p-2.5 bg-white/5 rounded-2xl text-muted hover:text-white hover:bg-white/10 transition-all">
                   <Palette size={18} />
                 </button>
                 <button 
                  onClick={handleSend}
                  disabled={isAnalyzing}
                  className="p-3 bg-white text-black rounded-[1.25rem] hover:bg-white/90 transition-all shadow-xl disabled:opacity-50"
                >
                  <Send size={20} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Intelligence Dashboard (Custom Markup) */}
      <div className="hidden xl:flex w-80 border-l border-white/10 bg-black/40 backdrop-blur-3xl flex-col h-full overflow-hidden">
        <div className="p-6 border-b border-white/10 shrink-0 bg-white/[0.02]">
          <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-muted">Aegis Intelligence Ledger</h3>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8">
          <div className="space-y-4">
            <SectionHeader title="Consensus Metrics" />
            <div className="grid grid-cols-2 gap-3">
              <MetricBox label="Logic Entropy" value="0.24" unit="eb" />
              <MetricBox label="Neural Load" value="42" unit="%" />
              <MetricBox label="Truth Score" value="98.2" unit="%" />
              <MetricBox label="Agent Sync" value="Locked" unit="" />
            </div>
          </div>

          <div className="space-y-4">
             <SectionHeader title="Mission Parameters" />
             <div className="space-y-3">
                <ProgressItem label="Deep Search Depth" value={85} />
                <ProgressItem label="Creative Variance" value={42} />
                <ProgressItem label="Reasoning Steps" value={100} />
             </div>
          </div>

          <div className="space-y-4">
            <SectionHeader title="Active Thread Trace" />
            <div className="space-y-3">
               {agents.filter(a => a.active).slice(0, 4).map(a => (
                 <div key={a.id} className="flex items-center gap-3 p-3 rounded-2xl glass border-white/5 hover:bg-white/[0.05] transition-all cursor-pointer">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: a.color }} />
                    <div className="flex-1">
                       <p className="text-[10px] font-bold text-white leading-none">{a.name}</p>
                       <p className="text-[8px] font-mono text-muted uppercase mt-1">Status: Computing...</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          <div className="mt-auto p-5 rounded-[2rem] bg-theme-tone/10 border border-theme-tone/20 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Zap size={48} className="text-theme-tone" />
             </div>
             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-theme-tone animate-pulse" />
                   <span className="text-[10px] font-mono text-white/90 uppercase tracking-widest font-bold">Lab Connectivity</span>
                </div>
                <p className="text-[10px] text-white/60 font-mono leading-relaxed">
                  Real-time cross-analysis active. Direct interface to NVD, CloudGuard, and Echo-Intel.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricBox({ label, value, unit }: { label: string, value: string, unit: string }) {
  return (
    <div className="p-3 rounded-2xl glass border-white/5 flex flex-col justify-between h-20">
      <p className="text-[8px] font-mono font-bold uppercase tracking-widest text-muted">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold text-white tracking-tighter">{value}</span>
        <span className="text-[8px] font-mono text-muted uppercase">{unit}</span>
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  const isSystem = msg.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <span className="px-3 py-1 rounded-full bg-white/5 text-[9px] font-mono text-muted uppercase tracking-widest border border-white/10">
          {msg.content}
        </span>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-6", isUser ? "flex-row-reverse" : "")}
    >
      <div className="flex flex-col items-center shrink-0">
        <div 
          className={cn("w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg", isUser ? "bg-white/10" : "")}
          style={!isUser ? { backgroundColor: msg.color || 'var(--theme-tone)', boxShadow: `0 0 20px -5px ${msg.color || 'var(--theme-tone)'}` } : {}}
        >
          {isUser ? <User size={20} /> : <Brain size={20} />}
        </div>
        {!isUser && <div className="flex-1 w-px bg-white/10 my-4" />}
      </div>
      
      <div className={cn("flex-1 max-w-3xl space-y-2", isUser ? "text-right" : "text-left")}>
        {!isUser && (
          <div className="flex items-center gap-3 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: msg.color }}>{msg.agentName}</span>
            <div className="w-1 h-1 rounded-full bg-white/10" />
            <span className="text-[9px] font-mono text-muted uppercase tracking-tighter">Process Complete • 1.2s</span>
          </div>
        )}
        <div className={cn(
          "relative p-6 rounded-[1.5rem] text-sm leading-relaxed",
          isUser 
            ? "bg-white text-black font-medium border-transparent rounded-tr-none shadow-xl" 
            : "glass border-white/5 text-slate-200 rounded-tl-none font-sans"
        )}>
           {msg.content}
        </div>
        {!isUser && (
          <div className="flex items-center gap-6 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="flex items-center gap-2 text-[10px] uppercase font-mono text-muted hover:text-white transition-colors">
              <Share2 size={12} /> Promote
            </button>
            <button className="flex items-center gap-2 text-[10px] uppercase font-mono text-muted hover:text-white transition-colors">
               <MessageSquare size={12} /> Trace
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function LoadingBubble({ agents }: { agents: AgentConfig[] }) {
  return (
    <div className="flex gap-6 animate-pulse">
      <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-white/5 rounded" />
          <div className="w-12 h-2 bg-white/5 rounded" />
        </div>
        <div className="w-full h-24 bg-white/5 rounded-3xl" />
      </div>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4">
      <h3 className="text-xs font-mono font-bold uppercase tracking-[0.3em] text-white/50 whitespace-nowrap">{title}</h3>
      <div className="h-px bg-white/5 w-full" />
    </div>
  );
}

function ThemeToggle({ active, onClick, color, theme: t }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-8 h-8 rounded-full border-2 transition-all p-1",
        active ? "border-primary scale-110 shadow-lg" : "border-transparent opacity-50 hover:opacity-100"
      )}
    >
      <div className={cn("w-full h-full rounded-full shadow-inner", color)} />
    </button>
  );
}

function ProgressItem({ label, value }: { label: string, value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-mono text-muted uppercase">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className="h-full bg-theme-tone"
        />
      </div>
    </div>
  );
}

function FindingBox({ title, level }: { title: string, level: string }) {
  return (
    <div className="p-4 rounded-xl glass border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
      <div className="flex justify-between items-start mb-2">
        <span className={cn(
          "text-[8px] font-mono px-1.5 py-0.5 rounded uppercase",
          level === 'High' ? "bg-crimson/20 text-crimson" : "bg-amber/20 text-amber"
        )}>{level} Risk</span>
        <ChevronDown size={12} className="text-muted group-hover:text-white transition-colors" />
      </div>
      <p className="text-xs font-bold text-white leading-tight">{title}</p>
    </div>
  );
}
