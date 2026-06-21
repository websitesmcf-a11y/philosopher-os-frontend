'use client';

import { useQuery } from '@tanstack/react-query';
import { listTasks, listCalendarEvents, type Task } from '@/lib/api-client';
import { useState, useMemo } from 'react';
import { usePageTitle } from '@/lib/use-page-title';
import { Calendar, Plus, Clock, User, ExternalLink, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type Tab = 'local' | 'google';

const PRIORITY_COLOR: Record<string, string> = {
  low: '#94a3b8',
  medium: '#f59e0b',
  high: '#ef4444',
  critical: '#dc2626',
};

const STATUS_PALETTE: Record<string, { bg: string; fg: string; border: string }> = {
  pending:       { bg: 'var(--surface-inset)', fg: 'var(--foreground-secondary)', border: 'var(--border)' },
  in_progress:   { bg: '#EFF6FF', fg: '#1D4ED8', border: 'rgba(29,78,216,0.2)' },
  completed:     { bg: '#F0FDF4', fg: '#166534', border: 'rgba(22,101,52,0.2)' },
  cancelled:     { bg: '#F9FAFB', fg: '#6B7280', border: 'rgba(107,114,128,0.2)' },
};

function StatusBadge({ status }: { status: string }) {
  const palette = STATUS_PALETTE[status] || STATUS_PALETTE.pending;
  const display = status.replace(/_/g, ' ');
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '1px 8px',
      fontSize: 10, fontWeight: 600,
      fontFamily: 'var(--font-mono)',
      textTransform: 'uppercase',
      letterSpacing: '0.02em',
      background: palette.bg,
      color: palette.fg,
      border: `1px solid ${palette.border}`,
      borderRadius: 'var(--radius)',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 4, height: 4, borderRadius: '50%', background: palette.fg, flexShrink: 0 }} />
      {display}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const color = PRIORITY_COLOR[priority] || '#94a3b8';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '1px 8px',
      fontSize: 10, fontWeight: 600,
      fontFamily: 'var(--font-mono)',
      textTransform: 'uppercase',
      letterSpacing: '0.02em',
      background: `${color}15`,
      color: color,
      border: `1px solid ${color}30`,
      borderRadius: 'var(--radius)',
      whiteSpace: 'nowrap',
    }}>
      {priority}
    </span>
  );
}

function formatTime(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function formatDateLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateStr = d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  if (d.toDateString() === today.toDateString()) return `Today — ${dateStr}`;
  if (d.toDateString() === tomorrow.toDateString()) return `Tomorrow — ${dateStr}`;
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday — ${dateStr}`;
  return dateStr;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

// ─── Tab Switcher ────────────────────────────────────────

function TabSwitcher({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <div style={{
      display: 'inline-flex',
      background: 'var(--surface-inset)',
      borderRadius: 'var(--radius)',
      padding: 3,
      gap: 2,
    }}>
      {(['local', 'google'] as Tab[]).map(tab => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          style={{
            padding: '6px 18px',
            fontSize: 13,
            fontWeight: active === tab ? 600 : 400,
            fontFamily: 'var(--font-body)',
            border: 'none',
            borderRadius: 'var(--radius)',
            background: active === tab ? 'var(--surface)' : 'transparent',
            color: active === tab ? 'var(--foreground)' : 'var(--foreground-secondary)',
            cursor: 'pointer',
            boxShadow: active === tab ? 'var(--shadow-sm)' : 'none',
            transition: 'all 150ms var(--ease-out)',
          }}
        >
          {tab === 'local' ? '📅 Local Calendar' : '☁️ Google Calendar'}
        </button>
      ))}
    </div>
  );
}

// ─── Local Calendar Tab ──────────────────────────────────

function LocalCalendarTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['local-tasks'],
    queryFn: () => listTasks({ page: 1 }),
  });

  const tasks = data?.items ?? [];

  // Group tasks with due_date by date, sorted ascending
  const grouped = useMemo(() => {
    const withDueDate = tasks
      .filter(t => t.due_date)
      .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());

    const groups: { date: Date; label: string; tasks: Task[] }[] = [];
    const map = new Map<string, Task[]>();

    for (const task of withDueDate) {
      const key = new Date(task.due_date!).toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(task);
    }

    for (const [key, groupTasks] of map) {
      const date = new Date(groupTasks[0].due_date!);
      groups.push({ date, label: formatDateLabel(date.toISOString()), tasks: groupTasks });
    }

    return groups;
  }, [tasks]);

  return (
    <div>
      {/* Local hosting note */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 16px', marginBottom: 20,
        background: 'rgba(26, 43, 76, 0.03)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        fontSize: 13, color: 'var(--foreground-secondary)',
      }}>
        <span style={{ fontSize: 16 }}>🖥️</span>
        <span>Locally hosted — tasks only show when this computer is active</span>
      </div>

      {/* Create Task button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <Link href="/tasks" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          <Plus size={16} /> Create Task
        </Link>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="etched-surface" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ color: 'var(--muted)', fontSize: 14 }}>Loading tasks...</div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && grouped.length === 0 && (
        <div className="etched-surface" style={{ padding: 60, textAlign: 'center' }}>
          <Calendar size={40} color="var(--muted)" style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--foreground)', marginBottom: 6 }}>
            No scheduled tasks
          </div>
          <div style={{ fontSize: 13, color: 'var(--foreground-secondary)', marginBottom: 20 }}>
            Tasks with a due date will appear here
          </div>
          <Link href="/tasks" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            <Plus size={16} /> Create a Task
          </Link>
        </div>
      )}

      {/* Day groups */}
      {!isLoading && grouped.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {grouped.map((group, gi) => {
            const isOverdue = group.date < new Date(new Date().toDateString()) &&
              group.tasks.some(t => t.status !== 'completed' && t.status !== 'cancelled');

            return (
              <div key={gi}>
                {/* Date header */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10,
                }}>
                  <h3 style={{
                    fontSize: 15, fontWeight: 600,
                    fontFamily: 'var(--font-heading)',
                    color: isOverdue ? 'var(--error)' : 'var(--foreground)',
                    margin: 0,
                  }}>
                    {group.label}
                  </h3>
                  <div style={{
                    fontSize: 11, color: 'var(--muted)',
                    fontFamily: 'var(--font-mono)',
                    padding: '1px 8px',
                    background: 'var(--surface-inset)',
                    borderRadius: 'var(--radius)',
                  }}>
                    {group.tasks.length} {group.tasks.length === 1 ? 'task' : 'tasks'}
                  </div>
                  {isOverdue && (
                    <span style={{
                      fontSize: 10, fontWeight: 600, color: 'var(--error)',
                      fontFamily: 'var(--font-mono)',
                      textTransform: 'uppercase',
                    }}>
                      Overdue
                    </span>
                  )}
                </div>

                {/* Task cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {group.tasks.map(task => (
                    <Link
                      key={task.id}
                      href={`/tasks`}
                      style={{ textDecoration: 'none' }}
                    >
                      <div className="etched-surface" style={{
                        padding: '12px 16px',
                        display: 'flex', alignItems: 'center', gap: 14,
                        cursor: 'pointer',
                        transition: 'all 150ms var(--ease-out)',
                        opacity: task.status === 'completed' ? 0.6 : 1,
                        borderLeft: `3px solid ${PRIORITY_COLOR[task.priority] || '#94a3b8'}`,
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-raised)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = ''; }}
                      >
                        {/* Time */}
                        <div style={{
                          minWidth: 56,
                          fontSize: 12,
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--foreground-secondary)',
                          textAlign: 'center',
                          display: 'flex', flexDirection: 'column', alignItems: 'center',
                          gap: 2,
                        }}>
                          <Clock size={13} color="var(--muted)" />
                          {task.due_date ? formatTime(task.due_date) : '—'}
                        </div>

                        {/* Task info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: 14, fontWeight: 500, color: 'var(--foreground)',
                            textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                            marginBottom: 4,
                          }}>
                            {task.title}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <PriorityBadge priority={task.priority} />
                            <StatusBadge status={task.status} />
                            {(task.assigned_agent || task.assignee_id) && (
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                fontSize: 11, color: 'var(--foreground-secondary)',
                              }}>
                                <User size={12} />
                                {task.assigned_agent
                                  ? task.assigned_agent.charAt(0).toUpperCase() + task.assigned_agent.slice(1)
                                  : task.assignee_id!.slice(0, 8)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Arrow indicator */}
                        <ExternalLink size={14} color="var(--muted)" style={{ flexShrink: 0 }} />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Google Calendar Tab ─────────────────────────────────

function GoogleCalendarTab() {
  const [syncing, setSyncing] = useState(false);
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ['google-events'],
    queryFn: () => listCalendarEvents({}),
  });

  const events = data?.items ?? [];
  const isConnected = !error && data !== undefined;

  // Group events by date
  const grouped = useMemo(() => {
    const sorted = [...events].sort(
      (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
    const groups: { date: Date; label: string; events: typeof events }[] = [];
    const map = new Map<string, typeof events>();

    for (const ev of sorted) {
      const key = new Date(ev.start_time).toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }

    for (const [key, groupEvents] of map) {
      const date = new Date(groupEvents[0].start_time);
      groups.push({ date, label: formatDateLabel(date.toISOString()), events: groupEvents });
    }

    return groups;
  }, [events]);

  const handleSync = () => {
    setSyncing(true);
    // Try actual sync via API, fall back to philosopher instructions
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://web-production-a93f0.up.railway.app/api/v1'}/connections/google_calendar/auth-url`)
      .then(r => r.json())
      .then(data => {
        if (data?.auth_url) {
          window.open(data.auth_url, '_blank', 'width=600,height=700');
          toast.success('Google Calendar auth opened in new window');
        } else {
          router.push('/chat?agent=athena&message=How do I connect my Google Calendar?');
        }
      })
      .catch(() => {
        router.push('/chat?agent=athena&message=How do I connect my Google Calendar?');
      })
      .finally(() => setSyncing(false));
  };

  // Not connected state
  if (!isLoading && !isConnected) {
    return (
      <div className="etched-surface" style={{ padding: 60, textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>☁️</div>
        <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--foreground)', marginBottom: 6 }}>
          Google Calendar not connected
        </div>
        <div style={{ fontSize: 13, color: 'var(--foreground-secondary)', marginBottom: 20 }}>
          Connect it in Integrations to sync your events
        </div>
        <Link href="/connections" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          Go to Integrations
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Sync button + status */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 20,
      }}>
        <div style={{ fontSize: 13, color: 'var(--foreground-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
          Connected
        </div>
        <button
          className="btn btn-ghost"
          style={{ padding: '6px 14px', fontSize: 13, gap: 6 }}
          onClick={handleSync}
          disabled={syncing}
        >
          <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Syncing...' : 'Sync with Google'}
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="etched-surface" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ color: 'var(--muted)', fontSize: 14 }}>Loading events...</div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && grouped.length === 0 && (
        <div className="etched-surface" style={{ padding: 60, textAlign: 'center' }}>
          <Calendar size={40} color="var(--muted)" style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--foreground)', marginBottom: 6 }}>
            No upcoming events
          </div>
          <div style={{ fontSize: 13, color: 'var(--foreground-secondary)' }}>
            Events from Google Calendar will appear here after syncing
          </div>
        </div>
      )}

      {/* Event groups */}
      {!isLoading && grouped.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {grouped.map((group, gi) => {
            const isToday = isSameDay(group.date, new Date());

            return (
              <div key={gi}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10,
                }}>
                  <h3 style={{
                    fontSize: 15, fontWeight: 600,
                    fontFamily: 'var(--font-heading)',
                    color: isToday ? 'var(--accent)' : 'var(--foreground)',
                    margin: 0,
                  }}>
                    {group.label}
                  </h3>
                  <div style={{
                    fontSize: 11, color: 'var(--muted)',
                    fontFamily: 'var(--font-mono)',
                    padding: '1px 8px',
                    background: 'var(--surface-inset)',
                    borderRadius: 'var(--radius)',
                  }}>
                    {group.events.length} {group.events.length === 1 ? 'event' : 'events'}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {group.events.map(ev => {
                    const eventType = ev.event_type || 'default';
                    const typeColor =
                      eventType === 'meeting' ? '#735C00' :
                      eventType === 'client' ? '#4A6741' :
                      eventType === 'internal' ? '#7A543B' :
                      eventType === 'call' ? '#3B5E7A' :
                      eventType === 'task' ? '#4A4A7A' : '#735C00';

                    return (
                      <div key={ev.id} className="etched-surface" style={{
                        padding: '12px 16px',
                        display: 'flex', alignItems: 'center', gap: 14,
                        borderLeft: `3px solid ${typeColor}`,
                      }}>
                        {/* Time */}
                        <div style={{
                          minWidth: 56,
                          fontSize: 12,
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--foreground-secondary)',
                          textAlign: 'center',
                          display: 'flex', flexDirection: 'column', alignItems: 'center',
                          gap: 2,
                        }}>
                          <Clock size={13} color="var(--muted)" />
                          {ev.start_time ? formatTime(ev.start_time) : '—'}
                        </div>

                        {/* Event info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: 14, fontWeight: 500, color: 'var(--foreground)',
                            marginBottom: 2,
                          }}>
                            {ev.title}
                          </div>
                          {ev.description && (
                            <div style={{
                              fontSize: 12, color: 'var(--foreground-secondary)',
                              marginBottom: 4,
                              overflow: 'hidden', textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap', maxWidth: 400,
                            }}>
                              {ev.description}
                            </div>
                          )}
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '1px 8px',
                            fontSize: 10, fontWeight: 600,
                            fontFamily: 'var(--font-mono)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.02em',
                            background: `${typeColor}15`,
                            color: typeColor,
                            border: `1px solid ${typeColor}30`,
                            borderRadius: 'var(--radius)',
                            whiteSpace: 'nowrap',
                          }}>
                            {ev.event_type || 'event'}
                          </span>
                        </div>

                        {/* End time if available */}
                        {ev.end_time && (
                          <div style={{
                            fontSize: 11, color: 'var(--muted)',
                            fontFamily: 'var(--font-mono)',
                            textAlign: 'right',
                            flexShrink: 0,
                          }}>
                            until {formatTime(ev.end_time)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────

export default function CalendarPage() {
  usePageTitle('Calendar');
  const [activeTab, setActiveTab] = useState<Tab>('local');

  return (
    <div className="page-content page-bg-sentinel page-enter">
      <PageHeader
        title="Schedule"
        description="Tasks and calendar events at a glance"
        icon={Calendar}
        iconColor="#123C69"
      />

      {/* Tab switcher */}
      <div style={{ marginBottom: 24 }}>
        <TabSwitcher active={activeTab} onChange={setActiveTab} />
      </div>

      {/* Tab content */}
      {activeTab === 'local' ? <LocalCalendarTab /> : <GoogleCalendarTab />}
    </div>
  );
}
