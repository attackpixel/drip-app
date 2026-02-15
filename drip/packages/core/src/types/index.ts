export * from './clothing';
export * from './outfit';
export * from './weather';
export * from './calendar';

export interface UserProfile {
  id: string;
  display_name: string | null;
  location_lat: number | null;
  location_lng: number | null;
  location_name: string | null;
  temperature_unit: import('./weather').TemperatureUnit;
  google_calendar_token: string | null;
  style_preference: string | null;
  created_at: string;
  updated_at: string;
}
