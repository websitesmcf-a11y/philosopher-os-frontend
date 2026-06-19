'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  listHermesJobs, cancelHermesJob, retryHermesJob, getHermesHealth,
  type HermesJob,
} from '@/lib/api-client';
import {
  Clock, CheckCircle, XCircle, RotateCcw, Ban, Loader2,
  ChevronRight, RefreshCw, Activity, Zap, AlertTriangle,
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.FC<any> }> = {
  queued:    { label: 'Queued',    color: '#6B7280', icon: Clock },
  running:   { label: 'Running',   color: '#3B82F6', icon: Loader2 },
  completed: { label: 'Done',      color: '#10B981', icon: CheckCircle },
  failed:    { label: 'Failed',    color: '#EF4444', icon: XCircle },
  cancelled: { label: 'Cancelled', color: '#F59E0B', icon: Ban },
  retrying:  { label: 'Retrying',  color: '#8B5CF6', icon: RotateCcw },
};

const SOURCE_LABELS: Record<string, string> = {
  api: 'API', beast_mode: 'Beast Mode', campaign: 'Campaign',
  schedule: 'Schedule', chain: 'Chain',
};

function timeAgo(iso: string | null): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 4, height: 4, width: '100%' }}>
      <div style={{
        height: '100%', borderRadius: 4,
        width: `${Math.min(100, pct)}%`,
        background: pct === 100 ? '#10B981' : '#3B82F6',
        transition: 'width 0.4s ease',
      }} />
    </div>
  );
}

function JobCard({ job, onCancel, onRetry }: {
  job: HermesJob;
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
}) {
  const cfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.queued;
  const Icon = cfg.icon;
  const isRunning = job.status === 'running' || job.status === 'retrying';
  const isFailed = job.status === 'failed';
  const isActive = job.status === 'queued' || isRunning;

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 10,
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon
          size={16}
          color={cfg.color}
          style={{ flexShrink: 0, animation: isRunning ? 'spin 1.2s linear infinite' : undefined }}
        />
        <span style={{ fontWeight: 600, fontSize: 14, color: '#fff', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {job.agent}
        </span>
        <span style={{ fontSize: 11, color: cfg.color, fontWeight: 600, background: `${cfg.color}20`, padding: '2px 8px', borderRadius: 20 }}>
          {cfg.label}
        </span>
        {job.source && SOURCE_LABELS[job.source] && (
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginLeft: 4 }}>
            via {SOURCE_LABELS[job.source]}
          </span>
        )}
      </div>

      {/* Task */}
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {job.task}
      </p>

      {/* Progress */}
      {isRunning && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
              {job.progress_message || 'Running...'}
            </span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
              {job.progress_percent}%
            </span>
          </div>
          <ProgressBar pct={job.progress_percent} />
        </div>
      )}

      {/* Error */}
      {isFailed && job.error && (
        <p style={{ fontSize: 11, color: '#EF4444', margin: 0, fontFamily: 'monospace' }}>
          {job.error.slice(0, 120)}
        </p>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', flex: 1 }}>
          {timeAgo(job.created_at)}
          {job.attempt_count > 1 && ` · attempt ${job.attempt_count}/${job.max_attempts}`}
        </span>

        {isActive && (
          <button
            onClick={() => onCancel(job.id)}
            style={{ fontSize: 11, color: '#F59E0B', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}
          >
            Cancel
          </button>
        )}
        {isFailed && (
          <button
            onClick={() => onRetry(job.id)}
            style={{ fontSize: 11, color: '#8B5CF6', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}
          >
            Retry
          </button>
        )}
        <Link href={`/hermes/${job.id}`} style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
          Details <ChevronRight size={11} />
        </Link>
      </div>
    </div>
  );
}

const FILTERS = ['all', 'running', 'queued', 'completed', 'failed', 'cancelled'];

export default function HermesPage() {
  const [jobs, setJobs] = useState<HermesJob[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<any>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchJobs = useCallback(async () => {
    try {
      const params = filter !== 'all' ? { status: filter, limit: 100 } : { limit: 100 };
      const res = await listHermesJobs(params);
      setJobs(res.jobs || []);
    } catch (e) {
      console.error('Failed to fetch Hermes jobs', e);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, [filter]);

  const fetchHealth = useCallback(async () => {
    try {
      const h = await getHermesHealth();
      setHealth(h);
    } catch (_) {}
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchJobs();
    fetchHealth();
  }, [fetchJobs, fetchHealth]);

  // Auto-refresh every 5s when there are running jobs
  useEffect(() => {
    const hasLive = jobs.some(j => j.status === 'running' || j.status === 'queued' || j.status === 'retrying');
    if (!hasLive) return;
    const t = setInterval(fetchJobs, 5000);
    return () => clearInterval(t);
  }, [jobs, fetchJobs]);

  const handleCancel = async (id: string) => {
    try {
      await cancelHermesJob(id);
      fetchJobs();
    } catch (e: any) {
      alert(e.detail || 'Cancel failed');
    }
  };

  const handleRetry = async (id: string) => {
    try {
      await retryHermesJob(id);
      fetchJobs();
    } catch (e: any) {
      alert(e.detail || 'Retry failed');
    }
  };

  const counts = {
    all: jobs.length,
    running: jobs.filter(j => j.status === 'running').length,
    queued: jobs.filter(j => j.status === 'queued').length,
    completed: jobs.filter(j => j.status === 'completed').length,
    failed: jobs.filter(j => j.status === 'failed').length,
    cancelled: jobs.filter(j => j.status === 'cancelled').length,
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Activity size={22} color="#3B82F6" />
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#fff' }}>Hermes Jobs</h1>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            Persistent background job queue · Last updated {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchJobs(); fetchHealth(); }}
          style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 12px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Health bar */}
      {health && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Running', value: health.running_jobs, color: '#3B82F6', icon: Loader2 },
            { label: 'Queued', value: health.queued_jobs, color: '#6B7280', icon: Clock },
            { label: 'Failed', value: health.failed_jobs, color: '#EF4444', icon: XCircle },
            { label: 'Concurrency', value: `${health.max_concurrent - health.semaphore_available}/${health.max_concurrent}`, color: '#8B5CF6', icon: Zap },
            { label: 'DB', value: health.database_connected ? 'Connected' : 'Error', color: health.database_connected ? '#10B981' : '#EF4444', icon: health.database_connected ? CheckCircle : AlertTriangle },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '8px 14px', display: 'flex', align: 'center', gap: 8 }}>
              <stat.icon size={14} color={stat.color} style={{ marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{stat.label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{stat.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '5px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer', border: 'none',
              background: filter === f ? '#3B82F6' : 'rgba(255,255,255,0.06)',
              color: filter === f ? '#fff' : 'rgba(255,255,255,0.55)',
              fontWeight: filter === f ? 600 : 400,
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {counts[f as keyof typeof counts] > 0 && (
              <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>
                {counts[f as keyof typeof counts]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Jobs list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.3)' }}>
          <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: 12 }}>Loading jobs...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.3)' }}>
          <Activity size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p>No jobs found.{filter !== 'all' ? ` Try the "All" filter.` : ' Start a Beast Mode mission or submit an agent task.'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {jobs.map(job => (
            <JobCard key={job.id} job={job} onCancel={handleCancel} onRetry={handleRetry} />
          ))}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
