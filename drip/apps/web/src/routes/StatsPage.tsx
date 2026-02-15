import { useEffect, useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { useAuthStore, useWardrobeStore, useOutfitStore, getColorHex, CATEGORY_LABELS } from '@drip/core';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';

const CHART_COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff', '#4f46e5', '#4338ca', '#3730a3'];

export function StatsPage() {
  const user = useAuthStore((s) => s.user);
  const items = useWardrobeStore((s) => s.items);
  const fetchItems = useWardrobeStore((s) => s.fetchItems);
  const outfits = useOutfitStore((s) => s.outfits);
  const fetchOutfits = useOutfitStore((s) => s.fetchOutfits);

  useEffect(() => {
    if (user) {
      fetchItems(user.id);
      fetchOutfits(user.id);
    }
  }, [user, fetchItems, fetchOutfits]);

  // Most worn items (top 10)
  const mostWorn = useMemo(
    () =>
      [...items]
        .sort((a, b) => b.times_worn - a.times_worn)
        .slice(0, 10)
        .map((i) => ({ name: i.name.slice(0, 15), timesWorn: i.times_worn })),
    [items]
  );

  // Color breakdown
  const colorBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of items) {
      for (const color of item.colors) {
        counts[color] = (counts[color] ?? 0) + 1;
      }
    }
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([color, count]) => ({ name: color, value: count, fill: getColorHex(color) }));
  }, [items]);

  // Category distribution
  const categoryDist = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of items) {
      const label = CATEGORY_LABELS[item.category] ?? item.category;
      counts[label] = (counts[label] ?? 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [items]);

  // Cost per wear (top value items)
  const costPerWear = useMemo(
    () =>
      items
        .filter((i) => i.purchase_price && i.purchase_price > 0 && i.times_worn > 0)
        .map((i) => ({
          name: i.name.slice(0, 15),
          cpw: parseFloat((i.purchase_price! / i.times_worn).toFixed(2)),
        }))
        .sort((a, b) => a.cpw - b.cpw)
        .slice(0, 10),
    [items]
  );

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-gray-900">Style Stats</h1>
        <EmptyState
          icon={<BarChart3 size={48} />}
          title="No stats yet"
          description="Add items and log outfits to see your style analytics."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Style Stats</h1>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <p className="text-2xl font-bold text-primary-600">{items.length}</p>
          <p className="text-xs text-gray-500">Items</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-primary-600">{outfits.length}</p>
          <p className="text-xs text-gray-500">Outfits</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-primary-600">
            {items.reduce((sum, i) => sum + i.times_worn, 0)}
          </p>
          <p className="text-xs text-gray-500">Total Wears</p>
        </Card>
      </div>

      {/* Most Worn */}
      {mostWorn.length > 0 && (
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Most Worn Items</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mostWorn} layout="vertical">
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="timesWorn" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Color Breakdown */}
      {colorBreakdown.length > 0 && (
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Color Breakdown</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={colorBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {colorBreakdown.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {colorBreakdown.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1 text-xs text-gray-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.fill }} />
                <span className="capitalize">{entry.name}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Category Distribution */}
      {categoryDist.length > 0 && (
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Category Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={categoryDist}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                paddingAngle={2}
              >
                {categoryDist.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Cost Per Wear */}
      {costPerWear.length > 0 && (
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Best Value (Cost Per Wear)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={costPerWear} layout="vertical">
              <XAxis type="number" tickFormatter={(v) => `$${v}`} />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              <Bar dataKey="cpw" fill="#22c55e" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}
