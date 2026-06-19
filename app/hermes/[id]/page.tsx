'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getHermesJob, cancelHermesJob, retryHermesJob,
  type HermesJob, type HermesJobLog,
} from '@/lib/api-client';
import {
  ArrowLeft, CheckCircle, XCircle, Clock, Loader2, Ban, RotateCcw,
  RefreshCw, ChevronRight, Terminal,
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  queued:    { label: 'Queued',    color: '#6B7280' },
  running:   { label: 'Running',   color: '#3B82F6' },
  completed: { label: 'Completed', color: '#10B981' },
  failed:    { label: 'Failed',    color: '#EF4444' },
  cancelled: { label: 'Cancelled', color: '#F59E0B' },
  retrying:  { label: 'Retrying',  color: '#8B5CF6' },
};

const LOG_COLORS: Record<string, string> = {
  debug: '#6B7280', info: '#60A5FA', warning: '#FBBF24',
  error: '#F87171', success: '#34D399',
};

function timeAgo(iso: string | null): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return new Date(iso).toLocaleTimeString();
}

export default function HermesJobDetail() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<HermesJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const fetchJob = useCallback(async () => {
    try {
      const data = await getHermesJob(jobId);
      setJob(data);
      setError(null);
    } catch (e: any) {
      setError(e.detail || 'Job not found');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  // Auto-refresh when running
  useEffect(() => {
    if (!job) return;
    const isLive = job.status === 'running' || job.status === 'queued' || job.status === 'retrying';
    if (!isLive) return;
    const t = setInterval(fetchJob, 3000);
    return () => clearInterval(t);
  }, [job, fetchJob]);

  const handleCancel = async () => {
    try {
      await cancelHermesJob(jobId);
      setActionMsg('Job cancelled');
      fetchJob();
    } catch (e: any) { setActionMsg(`Error: ${e.detail}`); }
  };

  const handleRetry = async () => {
    try {
      await retryHermesJob(jobId);
      setActionMsg('Retry scheduled');
      fetchJob();
    } catch (e: any) { setActionMsg(`Error: ${e.detail}`); }
  };

  if (loading) return (
    <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
      <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error || !job) return (
    <div style={{ padding: 40, textAlign: 'center', color: '#EF4444' }}>
      <XCircle size={32} style={{ marginBottom: 12 }} />
      <p>{error || 'Job not found'}</p>
      <Link href="/hermes" style={{ color: '#3B82F6', textDecoration: 'none' }}>← Back to jobs</Link>
    </div>
  );

  const cfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.queued;
  const isRunning = job.status === 'running' || job.status === 'retrying';
  const isFailed = job.status === 'failed';
  const isActive = job.status === 'queued' || isRunning;

  return (
    <div style={{ padding: '32px 24px', maxWidth: 860, margin: '0 auto' }}>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>

      {/* Back nav */}
      <Link href="/hermes" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: 13, marginBottom: 20 }}>
        <ArrowLeft size={14} /> Back to Hermes Jobs
      </Link>

      {/* Header */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 18, color: '#fff' }}>{job.agent}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: cfg.color, background: `${cfg.color}20`, padding: '2px 10px', borderRadius: 20 }}>
                {cfg.label}
              </span>
              {isRunning && <Loader2 size={14} color={cfg.color} style={{ animation: 'spin 1.2s linear infinite' }} />}
            </div>
            <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{job.task}</p>
          </div>

          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button onClick={fetchJob} title="Refresh" style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, padding: '6px 10px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
              <RefreshCw size={14} />
            </button>
            {isActive && (
              <button onClick={handleCancel} style={{ background: '#F59E0B20', border: '1px solid #F59E0B40', borderRadius: 8, padding: '6px 12px', color: '#F59E0B', cursor: 'pointer', fontSize: 13 }}>
                Cancel
              </button>
            )}
            {isFailed && (
              <button onClick={handleRetry} style={{ background: '#8B5CF620', border: '1px solid #8B5CF640', borderRadius: 8, padding: '6px 12px', color: '#8B5CF6', cursor: 'pointer', fontSize: 13 }}>
                Retry
              </button>
            )}
          </div>
        </div>

        {/* Progress */}
        {isRunning && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{job.progress_message || 'Running...'}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{job.progress_percent}%</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 4, height: 5 }}>
              <div style={{ height: '100%', borderRadius: 4, width: `${job.progress_percent}%`, background: '#3B82F6', transition: 'width 0.4s ease' }} />
            </div>
          </div>
        )}

        {/* Meta grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
          {[
            { label: 'Source', value: job.source || '—' },
            { label: 'Task type', value: job.task_type || 'general' },
            { label: 'Attempts', value: `${job.attempt_count}/${job.max_attempts}` },
            { label: 'Created', value: timeAgo(job.created_at) },
            { label: 'Started', value: timeAgo(job.started_at) },
            { label: 'Completed', value: timeAgo(job.completed_at) },
            ...(job.mission_id ? [{ label: 'Mission', value: job.mission_id.slice(0, 16) + '…' }] : []),
            ...(job.parent_job_id ? [{ label: 'Parent job', value: job.parent_job_id.slice(0, 8) + '…' }] : []),
          ].map(({ label, value }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 12px' }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
              <div style={{ fontSize: 13, color: '#fff', marginTop: 2, fontWeight: 500 }}>{value}</div>
            </div>
          ))}
        </div>

        {actionMsg && (
          <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(59,130,246,0.1)', borderRadius: 8, fontSize: 13, color: '#60A5FA' }}>
            {actionMsg}
          </div>
        )}
      </div>

      {/* Error */}
      {job.error && (
        <div style={{ background: '#EF444410', border: '1px solid #EF444440', borderRadius: 10, padding: 16, marginBottom: 20 }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#EF4444', marginBottom: 6 }}>Error</p>
          <pre style={{ margin: 0, fontSize: 12, color: '#FCA5A5', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {job.error}
          </pre>
        </div>
      )}

      {/* Output */}
      {job.result && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 16, marginBottom: 20 }}>
          <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#10B981' }}>Output</p>
          <pre style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 300, overflow: 'auto' }}>
            {typeof job.result === 'string' ? job.result : JSON.stringify(job.result, null, 2)}
          </pre>
        </div>
      )}

      {/* Logs */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Terminal size={14} color="rgba(255,255,255,0.4)" />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
            Logs {job.logs && job.logs.length > 0 ? `(${job.logs.length})` : ''}
          </span>
        </div>
        <div style={{ padding: 12, maxHeight: 420, overflow: 'auto', fontFamily: 'monospace' }}>
          {!job.logs || job.logs.length === 0 ? (
            <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.25)', padding: '8px 0' }}>No logs yet.</p>
          ) : (
            job.logs.map((log, i) => (
              <div key={log.id || i} style={{ display: 'flex', gap: 10, marginBottom: 4, fontSize: 12, lineHeight: 1.5 }}>
                <span style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0, fontSize: 11 }}>
                  {log.created_at ? new Date(log.created_at).toLocaleTimeString() : '—'}
                </span>
                <span style={{ color: LOG_COLORS[log.level] || '#9CA3AF', flexShrink: 0, fontWeight: 600, fontSize: 11, minWidth: 52 }}>
                  [{log.level.toUpperCase()}]
                </span>
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Child jobs */}
      {job.children && job.children.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 10 }}>Sub-jobs ({job.children.length})</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {job.children.map(child => {
              const ccfg = STATUS_CONFIG[child.status] || STATUS_CONFIG.queued;
              return (
                <Link key={child.id} href={`/hermes/${child.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 14px' }}>
                  <span style={{ fontSize: 12, color: ccfg.color, fontWeight: 600 }}>{ccfg.label}</span>
                  <span style={{ fontSize: 13, color: '#fff', flex: 1 }}>{child.agent}</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{child.progress_percent}%</span>
                  <ChevronRight size={14} color="rgba(255,255,255,0.3)" />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
