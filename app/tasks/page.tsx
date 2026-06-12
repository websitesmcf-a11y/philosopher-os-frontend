'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { listTasks, createTask, completeTask, deleteTask, type TaskStatus, type Priority } from '@/lib/api-client';
import { Plus, Circle, CheckCircle2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { usePageTitle } from '@/lib/use-page-title';
import { CreateDialog } from '@/components/create-dialog';

const PRIORITY_COLOR: Record<string, string> = {
  low: '#94a3b8', medium: '#3b82f6', high: '#f59e0b', critical: '#ef4444',
};

const STATUS_ICON: Record<string, string> = {
  pending: '#94a3b8', in_progress: '#3b82f6', completed: '#22c55e', cancelled: '#ef4444',
};

const AGENTS = ['plato', 'socrates', 'aristotle', 'athena', 'odysseus', 'heraclitus', 'pythagoras', 'leonidas', 'solon', 'archimedes'];

export default function TasksPage() {
  usePageTitle('Tasks');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', statusFilter],
    queryFn: () => listTasks({ ...(statusFilter !== 'all' ? { status: statusFilter } : {}), page: 1 }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['tasks'] });

  const createMut = useMutation({
    mutationFn: (values: Record<string, string>) => createTask({
      title: values.title,
      description: values.description || undefined,
      priority: (values.priority || 'medium') as Priority,
      assigned_agent: values.assigned_agent || undefined,
      due_date: values.due_date ? new Date(values.due_date).toISOString() : undefined,
    }),
    onSuccess: () => {
      toast.success('Task created');
      setDialogOpen(false);
      invalidate();
    },
    onError: (e: Error) => toast.error(`Failed to create task: ${e.message}`),
  });

  const completeMut = useMutation({
    mutationFn: (id: string) => completeTask(id),
    onSuccess: () => { toast.success('Task completed'); invalidate(); },
    onError: (e: Error) => toast.error(`Failed to complete task: ${e.message}`),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => { toast.success('Task deleted'); invalidate(); },
    onError: (e: Error) => toast.error(`Failed to delete task: ${e.message}`),
  });

  const tasks = data?.items ?? [];

  return (
    <div className="page-content page-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', margin: 0, fontFamily: 'var(--font-heading)' }}>Tasks</h1>
          <p style={{ fontSize: 14, color: 'var(--foreground-secondary)', marginTop: 4 }}>
            Track and manage tasks
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setDialogOpen(true)}>
          <Plus size={16} /> New Task
        </button>
      </div>

      <CreateDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="New Task"
        submitting={createMut.isPending}
        onSubmit={async values => { await createMut.mutateAsync(values); }}
        fields={[
          { name: 'title', label: 'Title', type: 'text', placeholder: 'What needs to be done?', required: true },
          { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Optional details' },
          {
            name: 'priority', label: 'Priority', type: 'select', defaultValue: 'medium',
            options: [
              { label: 'Low', value: 'low' }, { label: 'Medium', value: 'medium' },
              { label: 'High', value: 'high' }, { label: 'Critical', value: 'critical' },
            ],
          },
          {
            name: 'assigned_agent', label: 'Assign to agent', type: 'select',
            options: AGENTS.map(a => ({ label: a.charAt(0).toUpperCase() + a.slice(1), value: a })),
          },
          { name: 'due_date', label: 'Due date', type: 'date' },
        ]}
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
              <th>Due Date</th>
              <th style={{ width: 90 }}></th>
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
                <td style={{ fontSize: 13, color: 'var(--muted)' }}>
                  {task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
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
