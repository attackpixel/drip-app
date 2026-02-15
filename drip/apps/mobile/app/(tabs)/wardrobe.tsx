import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, FlatList, StyleSheet, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useWardrobeStore, getColorHex } from '@drip/core';
import { Plus, Trash2, Edit2, X } from 'lucide-react-native';

const CATEGORIES = ['all', 'tops', 'jersey', 'shorts', 'trousers', 'bottoms', 'knitwear', 'jumper', 'outerwear', 'puffer', 'shoes', 'accessories', 'belts'];

export default function WardrobeScreen() {
  const router = useRouter();
  const { items, fetchItems, deleteItem } = useWardrobeStore();

  const [selectedItem, setSelectedItem] = useState(null);
  const [currentCategory, setCurrentCategory] = useState('all');

  useEffect(() => {
    fetchItems();
  }, []);

  const filtered = currentCategory === 'all' ? items : items.filter(i => i.category === currentCategory);

  const handleDelete = (id) => {
    Alert.alert('Delete Item', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteItem(id) },
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.gridItem} onPress={() => setSelectedItem(item)}>
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.gridImage} />
      ) : item.image_path ? (
        <Image source={{ uri: item.image_path }} style={styles.gridImage} />
      ) : (
        <View style={[styles.gridImage, styles.gridPlaceholder]} />
      )}
      <View style={styles.gridInfo}>
        <Text style={styles.gridName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.gridCategory}>{item.category}</Text>
        <View style={styles.colorDots}>
          {(item.colors || []).slice(0, 4).map((c, idx) => (
            <View key={idx} style={[styles.colorDot, { backgroundColor: getColorHex(c) }]} />
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Wardrobe</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/add-item')}>
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setCurrentCategory(cat)}
            style={[styles.filterChip, currentCategory === cat && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, currentCategory === cat && styles.filterTextActive]}>
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filtered.length > 0 ? (
        <FlatList
          data={filtered}
          numColumns={2}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.gridRow}
          renderItem={renderItem}
        />
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No items yet</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/add-item')}>
            <Text style={styles.emptyBtnText}>Add your first item</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={!!selectedItem} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedItem && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedItem.name}</Text>
                  <TouchableOpacity onPress={() => setSelectedItem(null)}>
                    <X size={24} color="#374151" />
                  </TouchableOpacity>
                </View>
                
                {(selectedItem.image_url || selectedItem.image_path) && (
                  <Image source={{ uri: selectedItem.image_url || selectedItem.image_path }} style={styles.modalImage} />
                )}
                
                <View style={styles.modalDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Category</Text>
                    <Text style={styles.detailValue}>{selectedItem.category}</Text>
                  </View>
                  {selectedItem.brand && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Brand</Text>
                      <Text style={styles.detailValue}>{selectedItem.brand}</Text>
                    </View>
                  )}
                  {selectedItem.purchase_price && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Price</Text>
                      <Text style={styles.detailValue}>£{selectedItem.purchase_price}</Text>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Warmth</Text>
                    <Text style={styles.detailValue}>{selectedItem.warmth_level || 3}/5</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Times Worn</Text>
                    <Text style={styles.detailValue}>{selectedItem.times_worn || 0}</Text>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={styles.deleteBtn}
                    onPress={() => {
                      handleDelete(selectedItem.id);
                      setSelectedItem(null);
                    }}
                  >
                    <Trash2 size={20} color="#fff" />
                    <Text style={styles.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#111827' },
  addButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center' },
  filterRow: { maxHeight: 50, marginBottom: 8 },
  filterContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  filterChip: { backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, borderWidth: 1, borderColor: '#e5e7eb' },
  filterChipActive: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  filterText: { fontSize: 14, fontWeight: '500', color: '#4b5563' },
  filterTextActive: { color: '#fff' },
  grid: { padding: 12 },
  gridRow: { gap: 12 },
  gridItem: { flex: 1, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden', marginBottom: 12 },
  gridImage: { width: '100%', aspectRatio: 1 },
  gridPlaceholder: { backgroundColor: '#f3f4f6' },
  gridInfo: { padding: 12 },
  gridName: { fontSize: 14, fontWeight: '600', color: '#374151' },
  gridCategory: { fontSize: 12, color: '#9ca3af', textTransform: 'capitalize', marginTop: 2 },
  colorDots: { flexDirection: 'row', marginTop: 8, gap: 4 },
  colorDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: '#e5e7eb' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, color: '#9ca3af', marginBottom: 16 },
  emptyBtn: { backgroundColor: '#6366f1', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  emptyBtnText: { color: '#fff', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#111827', flex: 1 },
  modalImage: { width: '100%', height: 250, borderRadius: 16, marginBottom: 16 },
  modalDetails: { marginBottom: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  detailLabel: { color: '#6b7280', fontSize: 15 },
  detailValue: { color: '#111827', fontWeight: '500', fontSize: 15 },
  modalActions: { flexDirection: 'row', gap: 12 },
  deleteBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ef4444', borderRadius: 12, paddingVertical: 14, gap: 8 },
  deleteBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
