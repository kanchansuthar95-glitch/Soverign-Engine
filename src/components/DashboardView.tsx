import { motion } from 'motion/react';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Layers,
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useLab } from '../contexts/LabContext';

export function DashboardView() {
  const { systemStatus, auditLogs } = useLab();

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Mission Control</h2>
          <p className="text-muted text-sm font-mono uppercase tracking-widest mt-1">Operational Overview • Signal Strong</p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-[#1F2124] border border-[#2F3237] rounded-lg">
            <span className="text-[10px] uppercase font-mono text-muted block mb-0.5">Uptime</span>
            <span className="text-xs font-mono text-white">04:12:09:44</span>
          </div>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Cpu} label="Compute" value={`${systemStatus.cpu}%`} sub="4 Cores Active" color="text-primary" />
        <StatCard icon={Activity} label="Memory" value={`${systemStatus.memory} GB`} sub="84% Available" color="text-blue-400" />
        <StatCard icon={HardDrive} label="Storage" value="442 GB" sub="Local Flash" color="text-purple-400" />
        <StatCard icon={Layers} label="Subsystems" value="44/44" sub="All Operational" color="text-cyan-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Jobs Queue */}
        <div className="lg:col-span-2 space-y-6">
          <SectionHeader title="Active Job Queue" />
          <div className="bg-[#151619]/50 border border-[#1F2124] rounded-xl overflow-hidden backdrop-blur-sm">
            <div className="grid grid-cols-5 px-6 py-3 border-b border-[#1F2124] bg-[#1F2124]/30 text-[10px] font-mono text-muted uppercase tracking-widest">
              <div className="col-span-2">Task Details</div>
              <div>Agent</div>
              <div>Status</div>
              <div className="text-right">Progress</div>
            </div>
            <div className="divide-y divide-[#1F2124]">
              <JobRow 
                id="AEGIS-721" 
                title="Source Code Sanitization" 
                agent="Alpha-1" 
                status="Running" 
                progress={64} 
              />
              <JobRow 
                id="AEGIS-722" 
                title="Dependency Risk Analysis" 
                agent="Beta-Shadow" 
                status="Queued" 
                progress={0} 
              />
              <JobRow 
                id="AEGIS-719" 
                title="Simulation: Lab Sandbox B" 
                agent="Core-Sys" 
                status="Completed" 
                progress={100} 
              />
            </div>
          </div>
        </div>

        {/* Audit Log / Notifications */}
        <div className="space-y-6">
          <SectionHeader title="Security Audit Log" />
          <div className="bg-[#151619]/50 border border-[#1F2124] rounded-xl p-6 backdrop-blur-sm space-y-4 max-h-[500px] overflow-y-auto no-scrollbar">
            {auditLogs.map((log) => (
              <AuditItem 
                key={log.id}
                time={new Date(log.timestamp).toLocaleTimeString([], { hour12: false })} 
                type={log.type} 
                msg={log.msg} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: any) {
  return (
    <div className="bg-[#151619] border border-[#1F2124] p-6 rounded-xl relative group overflow-hidden">
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-[10px] font-mono text-muted uppercase tracking-[0.2em] mb-1">{label}</p>
          <h3 className="text-2xl font-bold text-white font-mono">{value}</h3>
          <p className="text-[10px] font-mono opacity-50 mt-1">{sub}</p>
        </div>
        <div className={cn("p-2 rounded-lg bg-[#1F2124] group-hover:scale-110 transition-transform", color)}>
          <Icon size={20} />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 h-1 bg-current opacity-20 w-full" />
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

function JobRow({ id, title, agent, status, progress }: any) {
  return (
    <div className="grid grid-cols-5 px-6 py-4 items-center group hover:bg-[#1F2124]/30 transition-colors cursor-pointer">
      <div className="col-span-2 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase">{id}</span>
          <span className="text-sm text-foreground font-medium truncate">{title}</span>
        </div>
      </div>
      <div className="text-xs font-mono text-muted italic">{agent}</div>
      <div>
        <span className={cn(
          "text-[10px] font-mono px-2 py-1 rounded-full uppercase border",
          status === 'Running' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
          status === 'Completed' ? "bg-primary/10 text-primary border-primary/20" :
          "bg-white/5 text-muted border-white/10"
        )}>
          {status}
        </span>
      </div>
      <div className="text-right">
        <div className="inline-flex items-center gap-3">
          <span className="text-xs font-mono text-muted">{progress}%</span>
          <div className="w-16 h-1 bg-[#1F2124] rounded-full overflow-hidden inline-block align-middle">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className={cn("h-full", progress === 100 ? "bg-primary" : "bg-blue-500")} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function AuditItem({ time, type, msg }: any) {
  const Icon = type === 'warning' ? AlertTriangle : type === 'success' ? CheckCircle2 : Clock;
  const color = type === 'warning' ? 'text-red-400' : type === 'success' ? 'text-primary' : 'text-blue-400';

  return (
    <div className="flex gap-4 group">
      <div className="flex flex-col items-center">
        <div className={cn("mt-1", color)}>
          <Icon size={14} />
        </div>
        <div className="w-px h-full bg-[#1F2124] my-1 group-last:hidden" />
      </div>
      <div className="pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono text-muted">{time}</span>
          <div className="h-px w-2 bg-[#1F2124]" />
          <span className={cn("text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-white/5 border border-white/10", color)}>
            {type}
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">{msg}</p>
      </div>
    </div>
  );
}
