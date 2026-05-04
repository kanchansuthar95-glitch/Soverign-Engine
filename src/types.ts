export type JobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'pending_approval';

export interface Job {
  id: string;
  type: string;
  status: JobStatus;
  target: string;
  createdAt: string;
  updatedAt: string;
  results?: any;
  logs: string[];
}

export interface SubsystemStatus {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'warning' | 'error';
  health: number; // 0-100
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  subsystem: string;
  action: string;
  details: string;
  userId: string;
}
