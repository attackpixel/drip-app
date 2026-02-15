import { useEffect, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useAuthStore, useWardrobeStore, useOutfitStore, getColorHex } from '@drip/core';

export default function StatsScreen() {
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
  }, [user]);

  const mostWorn = useMemo(
    () => [...items].sort((a, b) => b.times_worn - a.times_worn).slice(0, 5),
    [items]
  );

  const colorCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of items) {
      for (const c of item.colors) counts[c] = (counts[c] ?? 0) + 1;
    }
    return Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 8);
  }, [items]);

  const totalWears = items.reduce((sum, i) => sum + i.times_worn, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{items.length}</Text>
          <Text style={styles.statLabel}>Items</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{outfits.length}</Text>
          <Text style={styles.statLabel}>Outfits</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{totalWears}</Text>
          <Text style={styles.statLabel}>Wears</Text>
        </View>
      </View>

      {/* Most Worn */}
      {mostWorn.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Most Worn</Text>
          {mostWorn.map((item) => (
            <View key={item.id} style={styles.barRow}>
              <Text style={styles.barLabel} numberOfLines={1}>{item.name}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${Math.min(100, (item.times_worn / (mostWorn[0]?.times_worn || 1)) * 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.barValue}>{item.times_worn}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Color Breakdown */}
      {colorCounts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Colors</Text>
          <View style={styles.colorRow}>
            {colorCounts.map(([color, count]) => (
              <View key={color} style={styles.colorItem}>
                <View style={[styles.colorCircle, { backgroundColor: getColorHex(color) }]} />
                <Text style={styles.colorName}>{color}</Text>
                <Text style={styles.colorCount}>{count}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, gap: 16 },
  summaryRow: { flexDirection: 'row', gap: 8 },
  statBox: { flex: 1, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', padding: 16, alignItems: 'center' },
  statNum: { fontSize: 24, fontWeight: '700', color: '#6366f1' },
  statLabel: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  section: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', padding: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 12 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  barLabel: { width: 80, fontSize: 11, color: '#374151' },
  barTrack: { flex: 1, height: 8, backgroundColor: '#f3f4f6', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#6366f1', borderRadius: 4 },
  barValue: { width: 24, fontSize: 11, color: '#6b7280', textAlign: 'right' },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  colorItem: { alignItems: 'center', gap: 4 },
  colorCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: '#e5e7eb' },
  colorName: { fontSize: 10, color: '#6b7280', textTransform: 'capitalize' },
  colorCount: { fontSize: 10, color: '#9ca3af' },
});
