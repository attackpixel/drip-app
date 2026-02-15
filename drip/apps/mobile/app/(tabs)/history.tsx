import { useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthStore, useOutfitStore, formatDate } from '@drip/core';

export default function HistoryScreen() {
  const user = useAuthStore((s) => s.user);
  const { outfits, fetchOutfits, toggleFavorite, rateOutfit } = useOutfitStore();

  useEffect(() => {
    if (user) fetchOutfits(user.id);
  }, [user]);

  return (
    <FlatList
      data={outfits}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item: outfit }) => (
        <View style={styles.card}>
          <View style={styles.thumbRow}>
            {outfit.items.slice(0, 4).map((oi) => (
              <View key={oi.clothing_item_id} style={styles.thumbWrap}>
                {oi.clothing_item?.image_url ? (
                  <Image source={{ uri: oi.clothing_item.image_url }} style={styles.thumb} />
                ) : (
                  <View style={[styles.thumb, styles.thumbPlaceholder]} />
                )}
              </View>
            ))}
          </View>
          <View style={styles.cardMeta}>
            <Text style={styles.date}>{formatDate(outfit.worn_on)}</Text>
            {outfit.occasion && <Text style={styles.occasion}>{outfit.occasion}</Text>}
          </View>
          {outfit.name && <Text style={styles.outfitName}>{outfit.name}</Text>}
          <View style={styles.cardActions}>
            <TouchableOpacity onPress={() => toggleFavorite(outfit.id)}>
              <Text style={outfit.is_favorite ? styles.favActive : styles.fav}>
                {outfit.is_favorite ? 'Favorited' : 'Favorite'}
              </Text>
            </TouchableOpacity>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => rateOutfit(outfit.id, s)}>
                  <Text style={s <= (outfit.rating ?? 0) ? styles.starFilled : styles.star}>
                    *
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No outfits logged yet</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 12, gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden', padding: 12 },
  thumbRow: { flexDirection: 'row', gap: 4 },
  thumbWrap: { flex: 1 },
  thumb: { width: '100%', aspectRatio: 1, borderRadius: 8 },
  thumbPlaceholder: { backgroundColor: '#f3f4f6' },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  date: { fontSize: 12, color: '#6b7280' },
  occasion: { fontSize: 11, color: '#6366f1', fontWeight: '500', textTransform: 'capitalize' },
  outfitName: { fontSize: 14, fontWeight: '600', color: '#1f2937', marginTop: 4 },
  cardActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  fav: { fontSize: 12, color: '#9ca3af' },
  favActive: { fontSize: 12, color: '#ef4444', fontWeight: '600' },
  stars: { flexDirection: 'row', gap: 2 },
  star: { fontSize: 18, color: '#d1d5db' },
  starFilled: { fontSize: 18, color: '#f59e0b' },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#9ca3af' },
});
