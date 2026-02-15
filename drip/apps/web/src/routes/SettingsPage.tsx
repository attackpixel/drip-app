import { useState } from 'react';
import { LogOut, MapPin, Thermometer, Calendar, User } from 'lucide-react';
import { useAuthStore, useWeatherStore, weatherService, type TemperatureUnit, type LocationInfo } from '@drip/core';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export function SettingsPage() {
  const { profile, updateProfile, signOut } = useAuthStore();
  const { location, temperatureUnit, setLocation, detectLocation, setTemperatureUnit } = useWeatherStore();

  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [saving, setSaving] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [locationResults, setLocationResults] = useState<LocationInfo[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSaveName = async () => {
    setSaving(true);
    try {
      await updateProfile({ display_name: displayName });
    } finally {
      setSaving(false);
    }
  };

  const searchLocation = async () => {
    if (!locationQuery.trim()) return;
    setSearching(true);
    try {
      const results = await weatherService.searchLocation(locationQuery);
      setLocationResults(results);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Settings</h1>

      {/* Profile */}
      <Card>
        <div className="flex items-center gap-3 mb-3">
          <User size={18} className="text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-700">Profile</h3>
        </div>
        <div className="flex gap-2">
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Display name"
            className="flex-1"
          />
          <Button size="sm" onClick={handleSaveName} loading={saving}>
            Save
          </Button>
        </div>
        <p className="mt-1 text-xs text-gray-400">{profile?.id?.slice(0, 8)}...</p>
      </Card>

      {/* Location */}
      <Card>
        <div className="flex items-center gap-3 mb-3">
          <MapPin size={18} className="text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-700">Location</h3>
        </div>
        {location && (
          <p className="mb-2 text-sm text-gray-600">
            Current: <strong>{location.name}</strong>
          </p>
        )}
        <Button size="sm" variant="secondary" onClick={detectLocation} className="mb-2">
          <MapPin size={14} />
          Auto-detect
        </Button>
        <div className="flex gap-2">
          <Input
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            placeholder="Search city..."
            onKeyDown={(e) => e.key === 'Enter' && searchLocation()}
            className="flex-1"
          />
          <Button size="sm" variant="secondary" onClick={searchLocation} loading={searching}>
            Search
          </Button>
        </div>
        {locationResults.length > 0 && (
          <div className="mt-2 space-y-1">
            {locationResults.map((loc, i) => (
              <button
                key={i}
                onClick={() => {
                  setLocation(loc);
                  setLocationResults([]);
                  setLocationQuery('');
                }}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                {loc.name}
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Temperature unit */}
      <Card>
        <div className="flex items-center gap-3 mb-3">
          <Thermometer size={18} className="text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-700">Temperature Unit</h3>
        </div>
        <div className="flex gap-2">
          {(['fahrenheit', 'celsius'] as TemperatureUnit[]).map((unit) => (
            <button
              key={unit}
              onClick={() => setTemperatureUnit(unit)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                temperatureUnit === unit
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {unit === 'fahrenheit' ? '°F Fahrenheit' : '°C Celsius'}
            </button>
          ))}
        </div>
      </Card>

      {/* Sign out */}
      <Button variant="danger" onClick={signOut} className="w-full">
        <LogOut size={16} />
        Sign Out
      </Button>
    </div>
  );
}
