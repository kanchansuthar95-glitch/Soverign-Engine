import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Lock, 
  ChevronRight, 
  Search, 
  Terminal, 
  AlertTriangle,
  History,
  Activity,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { cn } from '../lib/utils';

export function ScanningView() {
  const [isLocked, setIsLocked] = useState(true);
  const [password, setPassword] = useState('');
  const [sessionActive, setSessionActive] = useState(false);

  const handleUnlock = () => {
    if (password === 'AEGIS-ADMIN') {
      setIsLocked(false);
    }
  };

  if (isLocked) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md bg-[#151619] border border-red-500/20 p-8 rounded-2xl space-y-6 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <Lock size={32} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Scanning Gate: Restricted</h3>
            <p className="text-xs text-muted font-mono mt-2 leading-relaxed">
              Real-world interaction requires explicit authorization. Enter operator password to bridge with external networks.
            </p>
          </div>
          <div className="space-y-4">
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Operator Password"
              className="w-full bg-[#0C0D0E] border border-[#1F2124] rounded-xl px-4 py-3 text-sm text-center font-mono tracking-widest focus:border-red-500/50 focus:outline-none transition-all"
            />
            <button 
              onClick={handleUnlock}
              className="w-full py-3 bg-red-500 text-white font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-red-600 transition-colors shadow-[0_0_20px_-5px_rgba(239,68,68,0.4)]"
            >
              Verify Identity
            </button>
          </div>
          <p className="text-[9px] text-muted font-mono uppercase tracking-[0.2em]">Password: AEGIS-ADMIN (Lab Default)</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert size={16} className="text-red-500" />
            <h2 className="text-2xl font-bold text-white tracking-tight uppercase">Scanning Gate</h2>
          </div>
          <p className="text-muted text-sm font-mono uppercase tracking-widest">Authorized External Interfacing • Active Session Control</p>
        </div>
        <div className="flex gap-4">
          {!sessionActive ? (
            <button 
              onClick={() => setSessionActive(true)}
              className="px-6 py-2 bg-primary text-black font-bold uppercase text-xs rounded-lg shadow-lg hover:brightness-110 flex items-center gap-2"
            >
              <Activity size={14} /> Start Scoped Session
            </button>
          ) : (
            <button 
              onClick={() => setSessionActive(false)}
              className="px-6 py-2 bg-red-500 text-white font-bold uppercase text-xs rounded-lg shadow-lg hover:bg-red-600 flex items-center gap-2"
            >
              <XCircle size={14} /> Terminate Session
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
        <div className="space-y-6">
          <SectionHeader title="Active Scan Policy" />
          <div className="bg-[#151619] border border-[#1F2124] rounded-xl p-6 space-y-6">
            <PolicyItem label="Max Egress Rate" value="100 req/s" />
            <PolicyItem label="Authorized Scope" value="10.0.0.0/24" />
            <PolicyItem label="Protocol Filters" value="HTTP, SSH, SQL" />
            <PolicyItem label="Operator Consent" value="Required" checked />
          </div>

          <SectionHeader title="Registered Targets" />
          <div className="space-y-3">
             <TargetCard name="Staging Environment" ip="10.0.1.44" status="reachable" />
             <TargetCard name="Auth Service API" ip="api.internal.local" status="unreachable" />
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col min-h-0">
           <SectionHeader title="Live Session Intelligence" />
           <div className="mt-6 flex-1 bg-[#090A0B] border border-[#1F2124] rounded-xl p-4 font-mono text-[11px] overflow-y-auto no-scrollbar relative group">
              {!sessionActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#090A0B]/80 backdrop-blur-sm z-10">
                  <Terminal size={32} className="text-muted/20 mb-4" />
                  <p className="text-muted uppercase tracking-widest text-[10px]">Session Idle • Waiting for Operator Approval</p>
                </div>
              )}
              <div className="space-y-1">
                <LogLine time="16:50:01" type="SYS" msg="Gateway initialized. Bypassing state proxy..." />
                <LogLine time="16:50:04" type="NET" msg="Routing established to local cluster sub-network." />
                <LogLine time="16:51:22" type="SEC" msg="Policy violation: unauthorized port detected (445:SMB). Blocked." color="text-red-400" />
                <LogLine time="16:52:10" type="SCAN" msg="NMAP scan initiated on target 10.0.1.44 (Stealth Mode)." />
                <LogLine time="16:52:12" type="INF" msg="Open Port Found: 8080 (HTTP-Alt)" />
                <LogLine time="16:52:15" type="INF" msg="Open Port Found: 22 (SSH)" />
                {sessionActive && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="flex gap-2"
                  >
                    <span className="text-primary font-bold">READY_</span>
                  </motion.div>
                )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4">
      <h3 className="text-xs font-mono font-bold uppercase tracking-[0.3em] text-white/70 whitespace-nowrap">{title}</h3>
      <div className="h-px bg-[#1F2124] w-full" />
    </div>
  );
}

function PolicyItem({ label, value, checked }: any) {
  return (
    <div className="flex justify-between items-center text-[11px] font-mono">
      <span className="text-muted uppercase">{label}</span>
      <span className={cn("font-bold text-foreground", checked ? "text-primary" : "")}>{value || (checked ? 'ENABLED' : 'DISABLED')}</span>
    </div>
  );
}

function TargetCard({ name, ip, status }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-[#151619] border border-[#1F2124] rounded-xl hover:border-white/10 transition-colors">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded bg-white/5", status === "reachable" ? "text-primary" : "text-muted")}>
          <Search size={16} />
        </div>
        <div>
          <p className="text-xs font-bold text-white">{name}</p>
          <p className="text-[10px] font-mono text-muted">{ip}</p>
        </div>
      </div>
      <div className={cn("w-1.5 h-1.5 rounded-full shadow-glow", status === 'reachable' ? "bg-primary" : "bg-red-500")} />
    </div>
  );
}

function LogLine({ time, type, msg, color }: any) {
  return (
    <div className="flex gap-3 leading-relaxed">
      <span className="text-muted/40 shrink-0">[{time}]</span>
      <span className={cn("font-bold uppercase tracking-tighter shrink-0 w-8 text-center", color ? color : "text-blue-500")}>{type}</span>
      <span className={cn("text-slate-400", color)}>{msg}</span>
    </div>
  );
}
