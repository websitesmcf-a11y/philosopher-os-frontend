'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { listTasks, createTask, updateTask, completeTask, deleteTask, type TaskStatus, type Priority } from '@/lib/api-client';
import { Plus, Circle, CheckCircle2, Trash2, CalendarDays, Clock, Pencil } from 'lucide-react';
import { useState } from 'react';
import { usePageTitle } from '@/lib/use-page-title';
import { CreateDialog } from '@/components/create-dialog';

const PRIORITY_COLOR: Record<string, string> = {
  low: '#94a3b8', medium: '#3b82f6', high: '#f59e0b', critical: '#ef4444',
};

const STATUS_ICON: Record<string, string> = {
  pending: '#94a3b8', in_progress: '#3b82f6', completed: '#22c55e', cancelled: '#ef4444',
};

const AGENTS = [
  'plato', 'socrates', 'aristotle', 'athena', 'odysseus',
  'heraclitus', 'pythagoras', 'leonidas', 'solon', 'archimedes',
  'diogenes', 'epicurus', 'zeno', 'plotinus', 'protagoras',
];

// Display a stored datetime in 24-hour format (en-GB locale guarantees 24h).
// The backend stores naive (timezone-less) ISO strings that represent local
// wall-clock time, so we read the components directly instead of letting Date
// apply a UTC offset.
function formatSchedule(iso: string): string {
  const d = parseLocalIso(iso);
  return d.toLocaleString('en-GB', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
    hour12: false,
  });
}

// Parse an ISO-ish string as local time. A value without a timezone suffix
// (e.g. "2026-06-14T19:20:00") is treated as local wall-clock time so the
// 24-hour value the user typed is preserved on round-trip.
function parseLocalIso(iso: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/.exec(iso);
  const hasTz = /[zZ]|[+-]\d{2}:?\d{2}$/.test(iso);
  if (m && !hasTz) {
    return new Date(
      Number(m[1]), Number(m[2]) - 1, Number(m[3]),
      Number(m[4]), Number(m[5]), Number(m[6] ?? '0'),
    );
  }
  return new Date(iso);
}

// Convert a datetime-local input value ("2026-06-14T19:20") into the ISO string
// we send to the backend, preserving the exact 24-hour wall-clock value with no
// timezone conversion.
function toApiDate(localValue: string): string | undefined {
  if (!localValue) return undefined;
  // datetime-local already yields "YYYY-MM-DDTHH:mm"; append seconds for ISO.
  return localValue.length === 16 ? `${localValue}:00` : localValue;
}

// Convert a stored value back into a datetime-local input value ("YYYY-MM-DDTHH:mm").
function toInputValue(iso: string | undefined): string {
  if (!iso) return '';
  const m = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/.exec(iso);
  if (m) return m[1];
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function TasksPage() {
  usePageTitle('Tasks');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', statusFilter],
    queryFn: () => listTasks({ ...(statusFilter !== 'all' ? { status: statusFilter } : {}), page: 1 }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['tasks'] });

  const handleApiError = (e: unknown, fallback: string): string => {
    if (e instanceof Error) {
      if (e.message === 'Failed to fetch' || e.message.includes('NetworkError')) {
        return 'Cannot connect to the API server. Make sure the backend is running (http://localhost:8000).';
      }
      return e.message;
    }
    return fallback;
  };

  const createMut = useMutation({
    mutationFn: (values: Record<string, string>) => createTask({
      title: values.title,
      description: values.description || undefined,
      priority: (values.priority || 'medium') as Priority,
      assigned_agent: values.assigned_agent || undefined,
      due_date: toApiDate(values.due_date),
    }),
    onSuccess: () => {
      toast.success('Task created');
      setDialogOpen(false);
      invalidate();
    },
    onError: (e: Error) => toast.error(handleApiError(e, 'Failed to create task')),
  });

  const updateMut = useMutation({
    mutationFn: (values: Record<string, string>) => {
      const { id, ...rest } = values;
      return updateTask(id, {
        title: rest.title,
        description: rest.description || undefined,
        priority: (rest.priority || 'medium') as Priority,
        status: (rest.status || undefined) as TaskStatus | undefined,
        assigned_agent: rest.assigned_agent || undefined,
        due_date: toApiDate(rest.due_date),
      });
    },
    onSuccess: () => {
      toast.success('Task updated');
      setDialogOpen(false);
      setEditingTask(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(handleApiError(e, 'Failed to update task')),
  });

  const completeMut = useMutation({
    mutationFn: (id: string) => completeTask(id),
    onSuccess: () => { toast.success('Task completed'); invalidate(); },
    onError: (e: Error) => toast.error(handleApiError(e, 'Failed to complete task')),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => { toast.success('Task deleted'); invalidate(); },
    onError: (e: Error) => toast.error(handleApiError(e, 'Failed to delete task')),
  });

  const tasks = data?.items ?? [];
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const handleOpenCreate = () => {
    setEditingTask(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (task: any) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTask(null);
  };

  const handleSubmit = async (values: Record<string, string>) => {
    if (editingTask) {
      await updateMut.mutateAsync({ id: editingTask.id, ...values });
    } else {
      await createMut.mutateAsync(values);
    }
  };

  const buildFields = () => {
    if (editingTask) {
      const t = editingTask;
      return [
        { name: 'title', label: 'Title', type: 'text' as const, placeholder: 'What needs to be done?', required: true, defaultValue: t.title || '' },
        { name: 'description', label: 'Description', type: 'textarea' as const, placeholder: 'Optional details', defaultValue: t.description || '' },
        {
          name: 'priority', label: 'Priority', type: 'select' as const, defaultValue: t.priority || 'medium',
          options: [
            { label: 'Low', value: 'low' }, { label: 'Medium', value: 'medium' },
            { label: 'High', value: 'high' }, { label: 'Critical', value: 'critical' },
          ],
        },
        {
          name: 'status', label: 'Status', type: 'select' as const, defaultValue: t.status || 'pending',
          options: [
            { label: 'Pending', value: 'pending' }, { label: 'In Progress', value: 'in_progress' },
            { label: 'Completed', value: 'completed' }, { label: 'Cancelled', value: 'cancelled' },
          ],
        },
        {
          name: 'assigned_agent', label: 'Assign to agent', type: 'select' as const, defaultValue: t.assigned_agent || '',
          options: AGENTS.map(a => ({ label: a.charAt(0).toUpperCase() + a.slice(1), value: a })),
        },
        { name: 'due_date', label: 'Schedule', type: 'datetime-local' as const, defaultValue: toInputValue(t.due_date) },
      ];
    }
    return [
      { name: 'title', label: 'Title', type: 'text' as const, placeholder: 'What needs to be done?', required: true },
      { name: 'description', label: 'Description', type: 'textarea' as const, placeholder: 'Optional details' },
      {
        name: 'priority', label: 'Priority', type: 'select' as const, defaultValue: 'medium',
        options: [
          { label: 'Low', value: 'low' }, { label: 'Medium', value: 'medium' },
          { label: 'High', value: 'high' }, { label: 'Critical', value: 'critical' },
        ],
      },
      {
        name: 'assigned_agent', label: 'Assign to agent', type: 'select' as const,
        options: AGENTS.map(a => ({ label: a.charAt(0).toUpperCase() + a.slice(1), value: a })),
      },
      { name: 'due_date', label: 'Schedule', type: 'datetime-local' as const },
    ];
  };

  return (
    <div className="page-content page-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', margin: 0, fontFamily: 'var(--font-heading)' }}>Tasks</h1>
          <p style={{ fontSize: 14, color: 'var(--foreground-secondary)', marginTop: 4 }}>
            Track and manage tasks
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={16} /> New Task
        </button>
      </div>

      <CreateDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        title={editingTask ? 'Edit Task' : 'New Task'}
        submitting={isSubmitting}
        onSubmit={handleSubmit}
        fields={buildFields()}
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as TaskStatus | 'all')}
          style={{ width: 'auto', paddingRight: 28 }}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="etched-surface" style={{ overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 40 }}></th>
              <th>Title</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Agent</th>
              <th>Schedule</th>
              <th style={{ width: 160 }}></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>Loading...</td></tr>
            )}
            {!isLoading && tasks.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
                No tasks yet — create one with &ldquo;New Task&rdquo;
              </td></tr>
            )}
            {tasks.map(task => (
              <tr key={task.id}>
                <td>
                  <Circle size={18} color={STATUS_ICON[task.status] || '#94a3b8'} fill={task.status === 'completed' ? '#22c55e' : 'transparent'} />
                </td>
                <td style={{ fontWeight: 500, textDecoration: task.status === 'completed' ? 'line-through' : 'none', opacity: task.status === 'completed' ? 0.6 : 1 }}>
                  {task.title}
                </td>
                <td>
                  <span className="badge" style={{
                    background: `${PRIORITY_COLOR[task.priority]}15`,
                    color: PRIORITY_COLOR[task.priority],
                    textTransform: 'capitalize',
                  }}>
                    {task.priority}
                  </span>
                </td>
                <td style={{ textTransform: 'capitalize', fontSize: 13 }}>
                  {task.status.replace('_', ' ')}
                </td>
                <td style={{ color: 'var(--foreground-secondary)', textTransform: 'capitalize' }}>
                  {task.assigned_agent || (task.assignee_id ? task.assignee_id.slice(0, 8) : '—')}
                </td>
                <td style={{ fontSize: 13 }}>
                  {task.due_date ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--foreground-secondary)' }}>
                      <Clock size={13} />
                      {formatSchedule(task.due_date)}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--muted)' }}>—</span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                    <button
                      className="btn btn-ghost" style={{ padding: '4px 8px' }} title="Edit task"
                      onClick={() => handleOpenEdit(task)}
                    >
                      <Pencil size={16} />
                    </button>
                    <a
                      href={`/calendar?task=${task.id}`}
                      className="btn btn-ghost" style={{ padding: '4px 8px' }} title="View in calendar"
                    >
                      <CalendarDays size={16} />
                    </a>
                    {task.status !== 'completed' && task.status !== 'cancelled' && (
                      <button
                        className="btn btn-ghost" style={{ padding: '4px 8px' }} title="Mark complete"
                        disabled={completeMut.isPending}
                        onClick={() => completeMut.mutate(task.id)}
                      >
                        <CheckCircle2 size={16} color="#22c55e" />
                      </button>
                    )}
                    <button
                      className="btn btn-ghost" style={{ padding: '4px 8px' }} title="Delete task"
                      disabled={deleteMut.isPending}
                      onClick={() => { if (confirm(`Delete task "${task.title}"?`)) deleteMut.mutate(task.id); }}
                    >
                      <Trash2 size={16} color="#ef4444" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
