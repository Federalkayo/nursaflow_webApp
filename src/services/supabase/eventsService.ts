import { supabase } from './supabaseClient';

export const EVENT_TYPES = ['Exam', 'Assignment', 'Clinical', 'Other'] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export interface AcademicEvent {
  id: string;
  user_id: string;
  title: string;
  event_type: EventType;
  event_at: string; // ISO timestamp (UTC)
  location: string | null;
  is_done: boolean;
  created_at?: string;
}

export interface NewAcademicEvent {
  title: string;
  event_type: EventType;
  event_at: string; // ISO timestamp
  location?: string;
}

// Unfinished items stay visible for this many days after their date so
// overdue assignments don't silently disappear.
const OVERDUE_WINDOW_DAYS = 7;

export const eventsService = {
  /** Not-done events from the last week onwards, soonest first. */
  async getUpcomingEvents(userId: string): Promise<AcademicEvent[]> {
    const since = new Date(Date.now() - OVERDUE_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('academic_events')
      .select('*')
      .eq('user_id', userId)
      .eq('is_done', false)
      .gte('event_at', since)
      .order('event_at', { ascending: true })
      .limit(50);

    if (error) {
      console.error('[Events Service Error] getUpcomingEvents:', error);
      throw error;
    }
    return (data ?? []) as AcademicEvent[];
  },

  async createEvent(userId: string, input: NewAcademicEvent): Promise<AcademicEvent> {
    const { data, error } = await supabase
      .from('academic_events')
      .insert({
        user_id: userId,
        title: input.title.trim(),
        event_type: input.event_type,
        event_at: input.event_at,
        location: input.location?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      console.error('[Events Service Error] createEvent:', error);
      throw error;
    }
    return data as AcademicEvent;
  },

  async markDone(eventId: string): Promise<void> {
    const { error } = await supabase
      .from('academic_events')
      .update({ is_done: true })
      .eq('id', eventId);

    if (error) {
      console.error('[Events Service Error] markDone:', error);
      throw error;
    }
  },

  async deleteEvent(eventId: string): Promise<void> {
    const { error } = await supabase
      .from('academic_events')
      .delete()
      .eq('id', eventId);

    if (error) {
      console.error('[Events Service Error] deleteEvent:', error);
      throw error;
    }
  },
};
