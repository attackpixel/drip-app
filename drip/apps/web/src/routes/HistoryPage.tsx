import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Clock } from 'lucide-react';
import { useAuthStore, useOutfitStore, getMonthRange, getWeekDays, toISODate } from '@drip/core';
import { OutfitCard } from '@/components/outfit/OutfitCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export function HistoryPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { outfits, loading, fetchByDateRange, rateOutfit, toggleFavorite } = useOutfitStore();

  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());

  useEffect(() => {
    if (!user) return;
    const { start, end } = getMonthRange(year, month);
    fetchByDateRange(user.id, start, end);
  }, [user, year, month, fetchByDateRange]);

  const monthName = new Date(year, month).toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const outfitsByDate = new Map<string, typeof outfits>();
  for (const o of outfits) {
    const date = o.worn_on.split('T')[0];
    if (!outfitsByDate.has(date)) outfitsByDate.set(date, []);
    outfitsByDate.get(date)!.push(o);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Outfit History</h1>
        <Button size="sm" onClick={() => navigate('/outfit/new')}>
          <Plus size={14} />
          Log Outfit
        </Button>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
        <button onClick={prevMonth} className="text-gray-500 hover:text-gray-700">
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-semibold text-gray-700">{monthName}</span>
        <button onClick={nextMonth} className="text-gray-500 hover:text-gray-700">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {getWeekDays().map((d) => (
          <div key={d} className="py-1 text-xs font-medium text-gray-400">{d}</div>
        ))}
        {Array.from({ length: firstDay }, (_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const hasOutfit = outfitsByDate.has(dateStr);
          const isToday = dateStr === toISODate();

          return (
            <div
              key={day}
              className={`relative rounded-lg py-1.5 text-xs ${
                isToday ? 'bg-primary-100 font-bold text-primary-700' : 'text-gray-600'
              } ${hasOutfit ? 'cursor-pointer hover:bg-gray-100' : ''}`}
            >
              {day}
              {hasOutfit && (
                <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary-500" />
              )}
            </div>
          );
        })}
      </div>

      {/* Outfit list */}
      {outfits.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {outfits.map((outfit) => (
            <OutfitCard
              key={outfit.id}
              outfit={outfit}
              onRate={(r) => rateOutfit(outfit.id, r)}
              onToggleFavorite={() => toggleFavorite(outfit.id)}
            />
          ))}
        </div>
      ) : !loading ? (
        <EmptyState
          icon={<Clock size={48} />}
          title="No outfits this month"
          description="Start logging outfits to see them here."
          action={
            <Button size="sm" onClick={() => navigate('/outfit/new')}>
              Log an Outfit
            </Button>
          }
        />
      ) : null}
    </div>
  );
}
