import React, { useCallback, useEffect, useState } from 'react';
import { Calendar, Check, Plus, Trash2, CalendarPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  AcademicEvent,
  EVENT_TYPES,
  EventType,
  eventsService,
} from '../../services/supabase/eventsService';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';

const MAX_VISIBLE = 5;

const TYPE_BADGE: Record<EventType, 'danger' | 'info' | 'brand' | 'neutral'> = {
  Exam: 'danger',
  Assignment: 'info',
  Clinical: 'brand',
  Other: 'neutral',
};

const pad = (n: number) => String(n).padStart(2, '0');

/** Value format required by <input type="datetime-local"> (local time). */
const toLocalInputValue = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

const defaultDateTime = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  return toLocalInputValue(d);
};

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

const formatEventDate = (iso: string): { label: string; overdue: boolean } => {
  const date = new Date(iso);
  const now = new Date();
  const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const dayDiff = Math.round((startOfDay(date) - startOfDay(now)) / 86400000);

  let day: string;
  if (dayDiff === 0) day = 'Today';
  else if (dayDiff === 1) day = 'Tomorrow';
  else if (dayDiff === -1) day = 'Yesterday';
  else if (dayDiff > 1 && dayDiff < 7) day = date.toLocaleDateString([], { weekday: 'short' });
  else {
    day = date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      ...(date.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {}),
    });
  }

  return { label: `${day}, ${time}`, overdue: date.getTime() < now.getTime() };
};

export const UpcomingEventsCard: React.FC = () => {
  const { student } = useAuth();
  const userId = student?.id;

  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [eventType, setEventType] = useState<EventType>('Exam');
  const [eventAt, setEventAt] = useState<string>(defaultDateTime());
  const [location, setLocation] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const loadEvents = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      setEvents(await eventsService.getUpcomingEvents(userId));
    } catch {
      setLoadError("Couldn't load your exams and deadlines. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const openModal = () => {
    setTitle('');
    setEventType('Exam');
    setEventAt(defaultDateTime());
    setLocation('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!userId) return;
    const cleanTitle = title.trim();
    const when = new Date(eventAt);

    if (!cleanTitle) {
      setFormError('Please enter a title.');
      return;
    }
    if (!eventAt || Number.isNaN(when.getTime())) {
      setFormError('Please pick a valid date and time.');
      return;
    }

    setIsSaving(true);
    setFormError(null);
    try {
      const created = await eventsService.createEvent(userId, {
        title: cleanTitle,
        event_type: eventType,
        event_at: when.toISOString(),
        location,
      });
      setEvents((prev) =>
        [...prev, created].sort(
          (a, b) => new Date(a.event_at).getTime() - new Date(b.event_at).getTime()
        )
      );
      setIsModalOpen(false);
    } catch {
      setFormError("Couldn't save this. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDone = async (id: string) => {
    setBusyId(id);
    setActionError(null);
    try {
      await eventsService.markDone(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch {
      setActionError("Couldn't update that item. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    setActionError(null);
    try {
      await eventsService.deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch {
      setActionError("Couldn't delete that item. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const visible = events.slice(0, MAX_VISIBLE);
  const hiddenCount = events.length - visible.length;

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-500" />
          <span>Upcoming Exams & Deadlines</span>
        </h3>
        <div className="flex items-center gap-2">
          {!isLoading && !loadError && <Badge variant="warning">{events.length} Pending</Badge>}
          <Button variant="outline" size="sm" icon={Plus} onClick={openModal}>
            Add
          </Button>
        </div>
      </div>

      {actionError && (
        <p className="text-xs font-medium text-rose-500">{actionError}</p>
      )}

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/60" />
          ))}
        </div>
      ) : loadError ? (
        <div className="text-center py-6 space-y-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">{loadError}</p>
          <Button variant="outline" size="sm" onClick={loadEvents}>
            Retry
          </Button>
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center text-center py-8 px-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
            <CalendarPlus className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Nothing coming up</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Add your exams, assignments and clinical sessions so you never miss one.
            </p>
          </div>
          <Button variant="primary" size="sm" icon={Plus} onClick={openModal}>
            Add your first one
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((ev) => {
            const { label, overdue } = formatEventDate(ev.event_at);
            const busy = busyId === ev.id;
            return (
              <div
                key={ev.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3"
              >
                <div className="min-w-0 space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {ev.title}
                  </h4>
                  <p
                    className={
                      overdue
                        ? 'text-xs font-medium text-rose-500'
                        : 'text-xs text-slate-500 dark:text-slate-400'
                    }
                  >
                    {overdue ? 'Overdue • ' : ''}
                    {label}
                    {ev.location ? ` • ${ev.location}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge variant={TYPE_BADGE[ev.event_type]}>{ev.event_type}</Badge>
                  <button
                    onClick={() => handleDone(ev.id)}
                    disabled={busy}
                    title="Mark as done"
                    aria-label={`Mark ${ev.title} as done`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(ev.id)}
                    disabled={busy}
                    title="Delete"
                    aria-label={`Delete ${ev.title}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {hiddenCount > 0 && (
            <p className="text-center text-xs font-semibold text-slate-400">
              + {hiddenCount} more after these
            </p>
          )}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSaving && setIsModalOpen(false)}
        title="Add Exam or Deadline"
        subtitle="It will show on your dashboard until you mark it done."
      >
        <div className="space-y-4">
          <Input
            label="Title"
            placeholder="e.g. Pharmacology II Midterm"
            value={title}
            maxLength={120}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />

          <Select
            label="Type"
            value={eventType}
            onChange={(e) => setEventType(e.target.value as EventType)}
            options={EVENT_TYPES.map((t) => ({ value: t, label: t }))}
          />

          <Input
            label="Date & time"
            type="datetime-local"
            value={eventAt}
            onChange={(e) => setEventAt(e.target.value)}
          />

          <Input
            label="Location (optional)"
            placeholder="e.g. Hall B, or Online Portal"
            value={location}
            maxLength={120}
            onChange={(e) => setLocation(e.target.value)}
          />

          {formError && <p className="text-xs font-medium text-rose-500">{formError}</p>}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
};
