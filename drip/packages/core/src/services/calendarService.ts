import { supabase } from './supabase';
import type { CalendarEvent } from '../types';
import { inferDressCode } from '../types/calendar';

export const calendarService = {
  async getGoogleAuthUrl(): Promise<string> {
    const { data, error } = await supabase.functions.invoke('google-calendar-auth', {
      body: { action: 'get_auth_url' },
    });
    if (error) throw error;
    return data.url;
  },

  async exchangeCode(code: string): Promise<void> {
    const { error } = await supabase.functions.invoke('google-calendar-auth', {
      body: { action: 'exchange_code', code },
    });
    if (error) throw error;
  },

  async getTodayEvents(userId: string): Promise<CalendarEvent[]> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('google_calendar_token')
      .eq('id', userId)
      .single();

    if (!profile?.google_calendar_token) return [];

    const { data, error } = await supabase.functions.invoke('google-calendar-events', {
      body: { token: profile.google_calendar_token },
    });

    if (error) throw error;

    return (data.events ?? []).map((event: { id: string; summary: string; start: { dateTime?: string; date?: string }; end: { dateTime?: string; date?: string }; location?: string; description?: string }) => ({
      id: event.id,
      summary: event.summary,
      start: event.start.dateTime ?? event.start.date ?? '',
      end: event.end.dateTime ?? event.end.date ?? '',
      location: event.location,
      description: event.description,
      inferred_dress_code: inferDressCode(
        `${event.summary} ${event.description ?? ''} ${event.location ?? ''}`
      ),
    }));
  },

  async disconnect(userId: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ google_calendar_token: null })
      .eq('id', userId);

    if (error) throw error;
  },
};
