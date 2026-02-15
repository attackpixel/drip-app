export interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  location?: string;
  description?: string;
  inferred_dress_code: InferredDressCode;
}

export type InferredDressCode = 'casual' | 'smart-casual' | 'business' | 'formal' | 'athletic' | 'unknown';

const FORMAL_KEYWORDS = ['gala', 'wedding', 'ceremony', 'black tie', 'formal', 'banquet', 'reception'];
const BUSINESS_KEYWORDS = ['meeting', 'interview', 'presentation', 'conference', 'client', 'board', 'review', 'office'];
const SMART_CASUAL_KEYWORDS = ['dinner', 'lunch', 'brunch', 'date', 'happy hour', 'networking', 'party'];
const ATHLETIC_KEYWORDS = ['gym', 'workout', 'yoga', 'run', 'hike', 'cycling', 'swim', 'fitness', 'training', 'sport'];

export function inferDressCode(eventText: string): InferredDressCode {
  const text = eventText.toLowerCase();

  if (FORMAL_KEYWORDS.some((k) => text.includes(k))) return 'formal';
  if (BUSINESS_KEYWORDS.some((k) => text.includes(k))) return 'business';
  if (ATHLETIC_KEYWORDS.some((k) => text.includes(k))) return 'athletic';
  if (SMART_CASUAL_KEYWORDS.some((k) => text.includes(k))) return 'smart-casual';

  return 'unknown';
}

export const DRESS_CODE_FORMALITY: Record<InferredDressCode, number> = {
  athletic: 1,
  casual: 1,
  'smart-casual': 2,
  business: 3,
  formal: 5,
  unknown: 2,
};
