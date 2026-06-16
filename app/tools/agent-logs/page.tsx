'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { usePageTitle } from '@/lib/use-page-title';
import { PageHeader } from '@/components/ui/page-header';
import { listTasks, getBeastStatus } from '@/lib/api-client';
import type { Task } from '@/lib/api-client';
import { ScrollText, Terminal, Wifi, WifiOff, Trash2, ArrowDown, Loader2, Zap } from 'lucide-react';

// ── Types ────────────────────────────────────────────

interface TaskEvent {
  type: 'connected' | 'task_started' | 'task_completed' | 'task_failed' | 'heartbeat' | 'beast_mission';
  task_id?: string;
  agent?: string;
  title?: string;
  status?: string;
  result?: string;
  error?: string;
  timestamp?: string;
}

interface LogEntry {
  id: string;
  type: TaskEvent['type'];
  agent?: string;
  title?: string;
  message: string;
  timestamp: Date;
}

// ── Constants ────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://web-production-a93f0.up.railway.app/api/v1';

const STATUS_COLORS: Record<string, string> = {
  connected: '#94a3b8',
  heartbeat: '#64748b',
  task_started: '#eab308',
  task_completed: '#22c55e',
  task_failed: '#ef4444',
  beast_mission: '#C9A24D',
};

const TYPE_LABELS: Record<string, string> = {
  connected: 'CONNECTED',
  heartbeat: 'HEARTBEAT',
  task_started: 'STARTED',
  task_completed: 'COMPLETED',
  task_failed: 'FAILED',
  beast_mission: 'BEAST',
};

const TEXT_COLORS: Record<string, string> = {
  connected: '#94a3b8',
  heartbeat: '#94a3b8',
  task_started: '#fde047',
  task_completed: '#86efac',
  task_failed: '#fca5a5',
  beast_mission: '#fbbf24',
};

// ── Component ────────────────────────────────────────

export default function AgentRunLogsPage() {
  usePageTitle('Agent Run Logs');

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'polling' | 'error'>('connecting');

  const scrollRef = useRef<HTMLDivElement>(null);
  const logIdRef = useRef(0);

  // ── Load recent tasks on mount ───────────────────
  useEffect(() => {
    (async () => {
      try {
        const data = await listTasks({ page: 1 });
        const tasks: Task[] = data.items ?? [];
        const entries: LogEntry[] = [];

        for (const t of tasks) {
          if (t.status === 'pending') continue;

          let type: TaskEvent['type'];
          let message: string;

          if (t.status === 'completed') {
            type = 'task_completed';
            message = `${t.assigned_agent || 'Agent'} completed: ${t.title}`;
          } else if (t.status === 'in_progress') {
            type = 'task_started';
            message = `${t.assigned_agent || 'Agent'} started: ${t.title}`;
          } else {
            type = 'task_failed';
            message = `${t.assigned_agent || 'Agent'} cancelled: ${t.title}`;
          }

          entries.push({
            id: String(++logIdRef.current),
            type,
            agent: t.assigned_agent || 'unknown',
            title: t.title,
            message,
            timestamp: new Date(t.completed_at || t.created_at || Date.now()),
          });
        }

        // Also load Beast Mode missions
        try {
          const beastStatus: any = await getBeastStatus();
          const beastMissions = beastStatus?.missions || beastStatus?.items || [];
          if (beastMissions.length > 0) {
            for (const mission of beastMissions) {
              entries.push({
                id: String(++logIdRef.current),
                type: 'beast_mission',
                agent: 'beast-mode',
                title: mission.objective,
                message: `Beast Mode ${mission.level}: ${mission.objective} — ${mission.status}`,
                timestamp: new Date(mission.created_at || Date.now()),
              });
            }
          }
        } catch {
          // Beast Mode API not available — skip
        }

        if (entries.length > 0) {
          setLogs(entries.reverse());
        }
      } catch (err) {
        console.error('Failed to load recent tasks:', err);
      }
    })();
  }, []);

  // ── SSE connection with polling fallback ─────────
  useEffect(() => {
    let es: EventSource | null = null;
    let pollInterval: ReturnType<typeof setInterval> | null = null;
    let eventTimeout: ReturnType<typeof setTimeout> | null = null;
    let receivedEvent = false;

    const addEntry = (type: TaskEvent['type'], agent?: string, title?: string, message?: string) => {
      const id = String(++logIdRef.current);
      setLogs(prev => [...prev, {
        id, type, agent, title,
        message: message || '',
        timestamp: new Date(),
      }]);
    };

    const startPolling = () => {
      if (pollInterval) return;
      setConnectionStatus('polling');
      addEntry('connected', undefined, undefined, 'Polling mode active — checking every 5s');
      pollInterval = setInterval(async () => {
        try {
          await listTasks({ page: 1 });
        } catch {
          /* polling errors are non-critical */
        }
      }, 5000);
    };

    try {
      es = new EventSource(`${API_BASE}/tasks/events`);
    } catch {
      // EventSource not supported at all
      startPolling();
      toast.error('SSE not available — polling mode active');
      addEntry('connected', undefined, undefined, 'SSE not supported by browser — polling mode active');
      return () => { if (pollInterval) clearInterval(pollInterval); };
    }

    es.onopen = () => {
      setConnectionStatus('connected');
      toast.success('Connected to live agent events');
    };

    es.onmessage = (event) => {
      receivedEvent = true;
      try {
        const data: TaskEvent = JSON.parse(event.data);
        processEvent(data);
      } catch {
        // skip malformed JSON data
      }
    };

    // Listen for named SSE events (includes Beast Mode)
    const eventTypes = ['connected', 'task_started', 'task_completed', 'task_failed', 'heartbeat', 'beast_mission'] as const;
    for (const evtType of eventTypes) {
      es.addEventListener(evtType, (e: Event) => {
        receivedEvent = true;
        try {
          const data: TaskEvent = JSON.parse((e as MessageEvent).data);
          processEvent(data);
        } catch {
          // skip malformed
        }
      });
    }

    es.onerror = () => {
      if (es && es.readyState === EventSource.CLOSED) {
        // Permanent failure — fall back to polling
        startPolling();
        toast.error('SSE not available — polling mode active');
        addEntry('connected', undefined, undefined, 'SSE connection lost — switching to polling mode');
      }
      // If readyState is CONNECTING (0), EventSource will auto-reconnect
    };

    // Safety timeout: if no events received within 15 seconds, drop to polling
    eventTimeout = setTimeout(() => {
      if (!receivedEvent && es && es.readyState !== EventSource.CLOSED) {
        es.close();
        startPolling();
        toast.error('SSE not available — polling mode active');
        addEntry('connected', undefined, undefined, 'SSE timed out — switching to polling mode');
      }
    }, 15000);

    // Periodic Beast Mode status poll
    let beastPollInterval: ReturnType<typeof setInterval> | null = null;
    const startBeastPoll = () => {
      beastPollInterval = setInterval(async () => {
        try {
          const beastStatus: any = await getBeastStatus();
          const current = beastStatus?.current_mission || beastStatus?.running;
          if (current) {
            addEntry('beast_mission', 'beast-mode', current.objective,
              `Beast Mode ${current.level || ''}: ${current.objective || ''} — ${current.status || 'running'}`);
          }
        } catch { /* Beast Mode not available */ }
      }, 10000);
    };
    startBeastPoll();

    function processEvent(data: TaskEvent) {
      switch (data.type) {
        case 'connected':
          addEntry('connected', undefined, undefined, 'SSE connection ready');
          break;
        case 'heartbeat':
          addEntry('heartbeat', undefined, undefined, 'Heartbeat — connection alive');
          break;
        case 'task_started':
          addEntry('task_started', data.agent, data.title,
            `${data.agent || 'Agent'} started: ${data.title || 'Unknown task'}`);
          break;
        case 'task_completed':
          addEntry('task_completed', data.agent, data.title,
            `${data.agent || 'Agent'} completed: ${data.title || 'Unknown task'}${data.result ? ` — ${data.result}` : ''}`);
          break;
        case 'task_failed':
          addEntry('task_failed', data.agent, data.title,
            `${data.agent || 'Agent'} failed: ${data.title || 'Unknown task'}${data.error ? ` — ${data.error}` : ''}`);
          break;
        case 'beast_mission':
          addEntry('beast_mission', 'beast-mode', data.title,
            `⚡ Beast Mode: ${data.title || 'Mission'} — ${data.status || 'running'}`);
          break;
      }
    }

    return () => {
      if (es) es.close();
      if (eventTimeout) clearTimeout(eventTimeout);
      if (pollInterval) clearInterval(pollInterval);
      if (beastPollInterval) clearInterval(beastPollInterval);
    };
  }, []);

  // ── Auto-scroll effect ────────────────────────────
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // ── Handlers ──────────────────────────────────────

  const clearLogs = () => {
    setLogs([]);
    logIdRef.current = 0;
    toast.success('Logs cleared');
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // ── Derived connection badge ──────────────────────

  const connectionLabel =
    connectionStatus === 'connected' ? 'Live'
    : connectionStatus === 'connecting' ? 'Connecting...'
    : connectionStatus === 'polling' ? 'Polling'
    : 'Disconnected';

  const connectionColor =
    connectionStatus === 'connected' ? '#22c55e'
    : connectionStatus === 'connecting' ? '#eab308'
    : connectionStatus === 'polling' ? '#f97316'
    : '#ef4444';

  const connectionBg =
    connectionStatus === 'connected' ? 'rgba(34,197,94,0.12)'
    : connectionStatus === 'connecting' ? 'rgba(234,179,8,0.12)'
    : connectionStatus === 'polling' ? 'rgba(249,115,22,0.12)'
    : 'rgba(239,68,68,0.12)';

  // ── Render ────────────────────────────────────────

  return (
    <div className="page-content">
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>

      <PageHeader
        title="Agent Run Logs"
        description="Live stream of philosopher and god agent executions"
        icon={ScrollText}
        iconColor="#123C69"
      />

      {/* ── Controls bar ───────────────────────────── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 16, gap: 8, flexWrap: 'wrap',
      }}>
        {/* Connection status badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 12px', borderRadius: 6,
          background: connectionBg, fontSize: 12, fontWeight: 600,
          color: connectionColor,
        }}>
          {connectionStatus === 'connected' ? (
            <Wifi size={14} />
          ) : connectionStatus === 'connecting' ? (
            <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <WifiOff size={14} />
          )}
          {connectionLabel}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setAutoScroll(prev => !prev)}
            style={{
              padding: '6px 10px', fontSize: 12,
              color: autoScroll ? 'var(--accent)' : 'var(--muted)',
            }}
          >
            <ArrowDown size={14} />
            Auto-scroll {autoScroll ? 'ON' : 'OFF'}
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={clearLogs}
            disabled={logs.length === 0}
            style={{ padding: '6px 10px', fontSize: 12 }}
          >
            <Trash2 size={14} /> Clear
          </button>
        </div>
      </div>

      {/* ── Terminal log view ──────────────────────── */}
      <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
        <div
          ref={scrollRef}
          style={{
            height: 520,
            overflowY: 'auto',
            background: '#0f172a',
            fontFamily: 'var(--font-mono), "JetBrains Mono", "Fira Code", monospace',
            fontSize: 13,
            lineHeight: 1.7,
            padding: '12px 16px',
          }}
        >
          {logs.length === 0 ? (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: '100%', color: '#64748b', fontSize: 13,
              flexDirection: 'column', gap: 10,
            }}>
              <Terminal size={28} opacity={0.35} />
              <span>Waiting for agent events...</span>
              {connectionStatus === 'polling' && (
                <span style={{ fontSize: 12, color: '#f97316' }}>
                  Polling for updates every 5 seconds
                </span>
              )}
              {connectionStatus === 'connecting' && (
                <span style={{ fontSize: 12, color: '#94a3b8' }}>
                  Connecting to SSE stream...
                </span>
              )}
            </div>
          ) : (
            logs.map(entry => (
              <div
                key={entry.id}
                style={{
                  display: 'flex',
                  gap: 10,
                  padding: '2px 0',
                  alignItems: 'flex-start',
                }}
              >
                {/* Timestamp */}
                <span
                  style={{
                    color: '#64748b',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    fontSize: 12,
                    minWidth: 64,
                    userSelect: 'none',
                  }}
                >
                  {formatTime(entry.timestamp)}
                </span>

                {/* Type badge */}
                <span
                  style={{
                    display: 'inline-block',
                    padding: '0 6px',
                    borderRadius: 3,
                    fontSize: 11,
                    fontWeight: 600,
                    lineHeight: '19px',
                    background: `${STATUS_COLORS[entry.type]}20`,
                    color: STATUS_COLORS[entry.type],
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    textAlign: 'center',
                    minWidth: 74,
                    userSelect: 'none',
                  }}
                >
                  {TYPE_LABELS[entry.type]}
                </span>

                {/* Message */}
                <span
                  style={{
                    color: TEXT_COLORS[entry.type] || '#cbd5e1',
                    wordBreak: 'break-word',
                  }}
                >
                  {entry.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Footer info ────────────────────────────── */}
      <div style={{
        marginTop: 8, display: 'flex', justifyContent: 'space-between',
        fontSize: 12, color: 'var(--muted)', padding: '0 4px',
      }}>
        <span>{logs.length} log {logs.length === 1 ? 'entry' : 'entries'}</span>
        {connectionStatus === 'polling' && (
          <span style={{ color: '#f97316' }}>Polling mode — limited to recent tasks</span>
        )}
      </div>

      {/* Re-enable auto-scroll hint */}
      {!autoScroll && logs.length > 5 && (
        <div
          onClick={() => setAutoScroll(true)}
          style={{
            textAlign: 'center', marginTop: 8, fontSize: 12,
            color: 'var(--muted)', cursor: 'pointer',
          }}
        >
          Auto-scroll paused — click to re-enable
        </div>
      )}
    </div>
  );
}
