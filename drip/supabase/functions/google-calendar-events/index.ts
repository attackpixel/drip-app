// Supabase Edge Function: Fetch Google Calendar Events
// Deploy with: supabase functions deploy google-calendar-events

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID') ?? '';
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET') ?? '';

serve(async (req) => {
  const { token: tokenStr } = await req.json();

  if (!tokenStr) {
    return new Response(JSON.stringify({ events: [] }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let tokens = JSON.parse(tokenStr);

  // Refresh access token if needed
  if (tokens.refresh_token) {
    const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: tokens.refresh_token,
        grant_type: 'refresh_token',
      }),
    });
    const refreshed = await refreshRes.json();
    if (refreshed.access_token) {
      tokens = { ...tokens, access_token: refreshed.access_token };
    }
  }

  // Fetch today's events
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

  const calRes = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
    `timeMin=${encodeURIComponent(startOfDay)}&timeMax=${encodeURIComponent(endOfDay)}&singleEvents=true&orderBy=startTime`,
    {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    }
  );

  if (!calRes.ok) {
    return new Response(JSON.stringify({ events: [], error: 'Failed to fetch calendar' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const calData = await calRes.json();

  return new Response(JSON.stringify({ events: calData.items ?? [] }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
