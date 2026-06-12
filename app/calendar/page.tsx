'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { listCalendarEvents, createCalendarEvent, type CalendarEvent } from '@/lib/api-client';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { usePageTitle } from '@/lib/use-page-title';
import { CreateDialog } from '@/components/create-dialog';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const TYPE_COLORS: Record<string, string> = {
  meeting: '#735C00', client: '#4A6741', internal: '#7A543B', call: '#3B5E7A', task: '#4A4A7A', default: '#735C00',
};

export default function CalendarPage() {
  usePageTitle('Calendar');
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const monthStart = new Date(currentYear, currentMonth, 1).toISOString().slice(0, 10);
  const monthEnd = new Date(currentYear, currentMonth + 1, 0).toISOString().slice(0, 10);

  const { data, isLoading } = useQuery({
    queryKey: ['calendar-events', currentYear, currentMonth],
    queryFn: () => listCalendarEvents({ start: monthStart, end: monthEnd }),
  });

  const createMut = useMutation({
    mutationFn: (values: Record<string, string>) => {
      const start = new Date(values.start_time);
      const end = values.end_time
        ? new Date(values.end_time)
        : new Date(start.getTime() + 60 * 60 * 1000); // default 1h
      return createCalendarEvent({
        title: values.title,
        description: values.description || undefined,
        event_type: values.event_type || 'meeting',
        start_time: start.toISOString(),
        end_time: end.toISOString(),
      });
    },
    onSuccess: () => {
      toast.success('Event created');
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
    onError: (e: Error) => toast.error(`Failed to create event: ${e.message}`),
  });

  const events: CalendarEvent[] = data?.items ?? [];

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDay = new Date(currentYear, currentMonth, 1).getDay();

  const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();
  const isToday = (d: number | null) => d !== null && isCurrentMonth && d === today.getDate();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInCurrentMonth; d++) calendarDays.push(d);

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.start_time?.startsWith(dateStr));
  };

  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  return (
    <div className="page-content page-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', margin: 0, fontFamily: 'var(--font-heading)' }}>Calendar</h1>
          <p style={{ fontSize: 14, color: 'var(--foreground-secondary)', marginTop: 4 }}>
            Schedule and events
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setDialogOpen(true)}>
          <Plus size={16} /> Add Event
        </button>
      </div>

      <CreateDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="New Event"
        submitting={createMut.isPending}
        onSubmit={async values => { await createMut.mutateAsync(values); }}
        fields={[
          { name: 'title', label: 'Title', type: 'text', placeholder: 'Event title', required: true },
          {
            name: 'event_type', label: 'Type', type: 'select', defaultValue: 'meeting',
            options: [
              { label: 'Meeting', value: 'meeting' }, { label: 'Client', value: 'client' },
              { label: 'Call', value: 'call' }, { label: 'Internal', value: 'internal' },
              { label: 'Task', value: 'task' },
            ],
          },
          { name: 'start_time', label: 'Starts', type: 'datetime-local', required: true },
          { name: 'end_time', label: 'Ends', type: 'datetime-local' },
          { name: 'description', label: 'Description', type: 'textarea' },
        ]}
      />

      <div className="etched-surface" style={{ padding: 24 }}>
        {/* Month nav */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <button className="btn btn-ghost" onClick={prevMonth} style={{ padding: '6px 10px' }}>
            <ChevronLeft size={18} />
          </button>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>
            {MONTHS[currentMonth]} {currentYear}
          </h2>
          <button className="btn btn-ghost" onClick={nextMonth} style={{ padding: '6px 10px' }}>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
          {DAYS.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--muted)', padding: '4px 0' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {calendarDays.map((day, idx) => (
            <div key={idx} style={{
              minHeight: 80, padding: 6,
              background: isToday(day) ? 'var(--accent-subtle)' : 'transparent',
              border: isToday(day) ? '1px solid var(--accent)' : '1px solid transparent',
              position: 'relative',
            }}>
              {day && (
                <>
                  <div style={{
                    fontSize: 13, fontWeight: isToday(day) ? 700 : 400,
                    color: isToday(day) ? 'var(--accent)' : 'var(--foreground-secondary)',
                    marginBottom: 4,
                  }}>
                    {day}
                  </div>
                  {isLoading ? (
                    <div style={{ width: '80%', height: 8, background: 'var(--border)' }} />
                  ) : (
                    getEventsForDay(day).slice(0, 3).map((e, i) => (
                      <div key={e.id || i} style={{
                        fontSize: 10, padding: '2px 4px', marginBottom: 2,
                        background: `${TYPE_COLORS[e.event_type] || TYPE_COLORS.default}15`,
                        color: TYPE_COLORS[e.event_type] || TYPE_COLORS.default,
                        fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {e.title}
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming events */}
      <div className="etched-surface" style={{ padding: 20, marginTop: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px', color: 'var(--foreground-secondary)' }}>
          Upcoming Events
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {isLoading && (
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>Loading events...</p>
          )}
          {!isLoading && sortedEvents.length === 0 && (
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>No upcoming events</p>
          )}
          {sortedEvents.slice(0, 10).map((e, i) => {
            const eventDate = new Date(e.start_time);
            return (
              <div key={e.id || i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0' }}>
                <div style={{
                  width: 4, height: 32,
                  background: TYPE_COLORS[e.event_type] || TYPE_COLORS.default,
                }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{e.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {eventDate.toLocaleDateString()} {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {e.event_type}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
