import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import {
  useAuthStore, useWardrobeStore, useWeatherStore, useOutfitStore,
  generateSuggestion, toISODate, tempDisplay,
  type SuggestionResult,
} from '@drip/core';

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const items = useWardrobeStore((s) => s.items);
  const fetchItems = useWardrobeStore((s) => s.fetchItems);
  const markWorn = useWardrobeStore((s) => s.markWorn);
  const weather = useWeatherStore((s) => s.weather);
  const unit = useWeatherStore((s) => s.temperatureUnit);
  const createOutfit = useOutfitStore((s) => s.createOutfit);

  const [suggestion, setSuggestion] = useState<SuggestionResult | null>(null);

  useEffect(() => {
    if (user) fetchItems(user.id);
  }, [user]);

  const generateNew = useCallback(() => {
    const result = generateSuggestion(items, { weather });
    setSuggestion(result);
  }, [items, weather]);

  useEffect(() => {
    if (items.length > 0 && !suggestion) generateNew();
  }, [items, suggestion, generateNew]);

  const handleWearThis = async () => {
    if (!user || !suggestion) return;
    await createOutfit(
      {
        user_id: user.id,
        name: null,
        worn_on: toISODate(),
        occasion: null,
        weather_temp_f: weather?.temp_f ?? null,
        weather_condition: weather?.condition ?? null,
        source: 'suggestion',
        rating: null,
        is_favorite: false,
        share_image_path: null,
      },
      suggestion.items.map((i) => ({ clothing_item_id: i.item.id, slot: i.slot }))
    );
    for (const i of suggestion.items) await markWorn(i.item.id);
    generateNew();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>
        Hey{profile?.display_name ? `, ${profile.display_name}` : ''}
      </Text>
      <Text style={styles.subtitle}>Here's your outfit for today</Text>

      {weather && (
        <View style={styles.weatherBadge}>
          <Text style={styles.weatherTemp}>{tempDisplay(weather.temp_f, unit)}</Text>
          <Text style={styles.weatherDesc}>{weather.description}</Text>
        </View>
      )}

      {suggestion && suggestion.items.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Outfit</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.itemRow}>
            {suggestion.items.map(({ item, slot }) => (
              <View key={item.id} style={styles.suggestionItem}>
                {item.image_url ? (
                  <Image source={{ uri: item.image_url }} style={styles.itemImage} />
                ) : (
                  <View style={[styles.itemImage, styles.placeholder]} />
                )}
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.slotLabel}>{slot}</Text>
              </View>
            ))}
          </ScrollView>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.shuffleBtn} onPress={generateNew}>
              <Text style={styles.shuffleText}>Shuffle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.wearBtn} onPress={handleWearThis}>
              <Text style={styles.wearText}>Wear This</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {items.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Your wardrobe is empty!</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/wardrobe')}>
            <Text style={styles.addBtnText}>Add Clothes</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, gap: 12 },
  greeting: { fontSize: 22, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6b7280' },
  weatherBadge: { backgroundColor: '#eff6ff', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  weatherTemp: { fontSize: 16, fontWeight: '700', color: '#1e40af' },
  weatherDesc: { fontSize: 13, color: '#3b82f6' },
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden' },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#374151', padding: 12, paddingBottom: 4 },
  itemRow: { paddingHorizontal: 12, paddingBottom: 12 },
  suggestionItem: { alignItems: 'center', marginRight: 12, width: 80 },
  itemImage: { width: 72, height: 72, borderRadius: 12 },
  placeholder: { backgroundColor: '#f3f4f6' },
  itemName: { fontSize: 11, fontWeight: '500', color: '#374151', marginTop: 4 },
  slotLabel: { fontSize: 9, color: '#9ca3af', textTransform: 'uppercase' },
  actions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  shuffleBtn: { flex: 1, padding: 12, alignItems: 'center' },
  shuffleText: { fontSize: 14, color: '#6b7280', fontWeight: '500' },
  wearBtn: { flex: 1, padding: 12, alignItems: 'center', borderLeftWidth: 1, borderLeftColor: '#f3f4f6' },
  wearText: { fontSize: 14, color: '#6366f1', fontWeight: '600' },
  emptyCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  emptyText: { fontSize: 14, color: '#6b7280' },
  addBtn: { backgroundColor: '#6366f1', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10, marginTop: 12 },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
