import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Database, 
  Plus, 
  Github, 
  Globe, 
  FileCode, 
  Cloud,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useLab } from '../contexts/LabContext';

export function IntakeView() {
  const { sources, addSource } = useLab();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddDemoSource = async () => {
    setIsAdding(true);
    await addSource({
      name: `Research Artifact #${Math.floor(Math.random() * 1000)}`,
      type: 'file',
      items: Math.floor(Math.random() * 100),
      size: `${(Math.random() * 10).toFixed(1)}MB`
    });
    setIsAdding(false);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Source Intake</h2>
          <p className="text-muted text-sm font-mono uppercase tracking-widest mt-1">Acquisition & Normalization Pipeline</p>
        </div>
        <button 
          onClick={handleAddDemoSource}
          disabled={isAdding}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-black font-bold font-mono text-xs uppercase rounded-lg hover:bg-primary/90 transition-all shadow-[0_0_20px_-5px_rgba(34,197,94,0.5)] disabled:opacity-50"
        >
          <Plus size={16} strokeWidth={3} />
          {isAdding ? 'Ingesting...' : 'Add Source'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Source Entry Controls */}
        <div className="space-y-6">
          <SectionHeader title="Collector Methods" />
          <div className="space-y-3">
            <MethodCard icon={Github} label="Github Import" sub="Auth & Snapshot" />
            <MethodCard icon={Globe} label="URL / API Endpoint" sub="Structural Scan" />
            <MethodCard icon={FileCode} label="Local File / Archive" sub="Upload & Extract" />
            <MethodCard icon={Cloud} label="Cloud Provider" sub="AWS / GCP / Azure" />
          </div>

          <div className="bg-[#151619] border border-[#1F2124] rounded-xl p-6 space-y-4">
            <h4 className="text-[10px] font-mono text-muted uppercase tracking-widest">Normalization Status</h4>
            <div className="space-y-3">
              <StatusMini icon={Database} label="Schema Check" status="success" />
              <StatusMini icon={FileCode} label="Language Dist" status="success" />
              <StatusMini icon={Trash2} label="Deduplication" status="active" />
            </div>
          </div>
        </div>

        {/* Ingested Content */}
        <div className="lg:col-span-2 space-y-6">
          <SectionHeader title="Ingested Artifacts" />
          <div className="space-y-4">
            {sources.map((source) => (
              <SourceCard key={source.id} source={source} />
            ))}
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

function MethodCard({ icon: Icon, label, sub }: any) {
  return (
    <button className="w-full flex items-center justify-between p-4 bg-[#151619] border border-[#1F2124] rounded-xl hover:border-primary/50 hover:bg-muted/10 transition-all group group cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-lg bg-muted/20 text-muted group-hover:text-primary transition-colors">
          <Icon size={20} />
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-[10px] font-mono text-muted uppercase tracking-tighter">{sub}</p>
        </div>
      </div>
      <ChevronRight size={16} className="text-muted group-hover:text-primary" />
    </button>
  );
}

function SourceCard({ source }: { source: any }) {
  const Icon = source.type === 'github' ? Github : source.type === 'file' ? FileCode : Globe;
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#151619] border border-[#1F2124] p-5 rounded-xl group hover:border-[#2F3237] transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-muted/10 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
            <Icon size={24} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">{source.name}</h4>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] font-mono text-muted uppercase tracking-widest">{source.type}</span>
              <div className="w-1 h-1 rounded-full bg-[#1F2124]" />
              <span className="text-[10px] font-mono text-muted uppercase tracking-widest">{source.size}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right mr-4">
            <p className="text-[10px] font-mono text-muted uppercase tracking-widest">Artifacts</p>
            <p className="text-xs font-mono font-bold text-foreground">{source.items.toLocaleString()}</p>
          </div>
          <button className="p-2 hover:bg-muted rounded-lg text-muted hover:text-foreground transition-colors">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>
      
      <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-[#0C0D0E] border border-[#1F2124]">
        <div className="flex items-center gap-2">
          {source.status === 'ready' ? (
            <CheckCircle2 size={12} className="text-primary" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          )}
          <span className={cn(
            "text-[10px] font-mono uppercase tracking-widest",
            source.status === 'ready' ? "text-primary" : "text-blue-500"
          )}>
            Status: {source.status}
          </span>
        </div>
        <div className="h-1 w-24 bg-[#1F2124] rounded-full overflow-hidden">
          <div className={cn("h-full", source.status === 'ready' ? "w-full bg-primary" : "w-1/2 bg-blue-500")} />
        </div>
      </div>
    </motion.div>
  );
}

function StatusMini({ icon: Icon, label, status }: any) {
  return (
    <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest">
      <div className="flex items-center gap-2">
        <Icon size={12} className={status === 'success' ? 'text-primary' : 'text-blue-500'} />
        <span className="text-muted">{label}</span>
      </div>
      <span className={status === 'success' ? 'text-primary' : 'text-blue-500 animate-pulse'}>
        {status === 'success' ? 'OK' : 'PRC'}
      </span>
    </div>
  );
}
