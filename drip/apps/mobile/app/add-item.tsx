import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, Modal, FlatList, StyleSheet, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore, useWardrobeStore, CATEGORY_LABELS } from '@drip/core';
import { ArrowLeft, Camera, Upload, X, Plus, Trash2, Edit2, Save, History, Home, Shirt, BarChart3, Check } from 'lucide-react-native';

const COLORS = [
  { name: 'Black', hex: '#000000' }, { name: 'White', hex: '#FFFFFF' }, { name: 'Gray', hex: '#808080' },
  { name: 'Navy', hex: '#000080' }, { name: 'Blue', hex: '#0000FF' }, { name: 'Red', hex: '#FF0000' },
  { name: 'Pink', hex: '#FFC0CB' }, { name: 'Orange', hex: '#FFA500' }, { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Green', hex: '#008000' }, { name: 'Purple', hex: '#800080' }, { name: 'Brown', hex: '#8B4513' },
  { name: 'Beige', hex: '#F5F5DC' }, { name: 'Cream', hex: '#FFFDD0' }, { name: 'Burgundy', hex: '#800020' },
  { name: 'Teal', hex: '#008080' }, { name: 'Coral', hex: '#FF7F50' }, { name: 'Mint', hex: '#98FF98' },
  { name: 'Charcoal', hex: '#36454F' }, { name: 'Khaki', hex: '#C3B091' }, { name: 'Maroon', hex: '#800000' },
];

const CATEGORIES = ['tops', 'jersey', 'shorts', 'trousers', 'bottoms', 'knitwear', 'jumper', 'outerwear', 'puffer', 'shoes', 'accessories', 'belts'];
const SEASONS = ['spring', 'summer', 'fall', 'winter'];

export default function AddItemScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { items, addItem, updateItem, deleteItem } = useWardrobeStore();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('tops');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [colors, setColors] = useState([]);
  const [warmth, setWarmth] = useState(3);
  const [formality, setFormality] = useState(2);
  const [seasons, setSeasons] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [purchaseLink, setPurchaseLink] = useState('');
  const [customCategories, setCustomCategories] = useState([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const saved = globalThis['drip-custom-categories'];
    if (saved) setCustomCategories(saved);
  }, []);

  const saveCustomCategories = (cats) => {
    setCustomCategories(cats);
    globalThis['drip-custom-categories'] = cats;
  };

  const pickImage = async (useCamera) => {
    const permission = useCamera 
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please grant permission to access your photos.');
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const showImageOptions = () => {
    Alert.alert('Add Photo', 'Choose an option', [
      { text: 'Take Photo', onPress: () => pickImage(true) },
      { text: 'Choose from Library', onPress: () => pickImage(false) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const toggleColor = (color) => {
    if (colors.find(c => c.hex === color.hex)) {
      setColors(colors.filter(c => c.hex !== color.hex));
    } else if (colors.length < 5) {
      setColors([...colors, color]);
    }
  };

  const toggleSeason = (season) => {
    if (seasons.includes(season)) {
      setSeasons(seasons.filter(s => s !== season));
    } else {
      setSeasons([...seasons, season]);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    const item = {
      id: editingId || Date.now(),
      name: name.trim(),
      category,
      brand: brand || null,
      price: price ? parseFloat(price) : null,
      colors,
      warmth,
      formality,
      seasons,
      photo,
      link: purchaseLink || null,
      timesWorn: 0,
      lastWorn: null,
      createdAt: editingId ? items.find(i => i.id === editingId)?.createdAt : new Date().toISOString(),
    };

    if (editingId) {
      await updateItem(item);
    } else {
      await addItem(item);
    }

    resetForm();
    router.back();
  };

  const resetForm = () => {
    setName('');
    setCategory('tops');
    setBrand('');
    setPrice('');
    setColors([]);
    setWarmth(3);
    setFormality(2);
    setSeasons([]);
    setPhoto(null);
    setPurchaseLink('');
    setEditingId(null);
  };

  const addCustomCategory = () => {
    Alert.prompt('Add Category', 'Enter category name', (cat) => {
      if (cat && !customCategories.includes(cat.toLowerCase())) {
        saveCustomCategories([...customCategories, cat.toLowerCase()]);
      }
    });
  };

  const allCategories = [...CATEGORIES, ...customCategories];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.title}>{editingId ? 'Edit Item' : 'Add Item'}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Photo */}
      <TouchableOpacity style={styles.photoArea} onPress={showImageOptions}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.photoPreview} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Camera size={40} color="#9ca3af" />
            <Text style={styles.photoText}>Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      {photo && (
        <TouchableOpacity style={styles.removePhoto} onPress={() => setPhoto(null)}>
          <X size={20} color="#fff" />
        </TouchableOpacity>
      )}

      <TextInput
        style={styles.input}
        placeholder="Name (e.g. Blue Oxford Shirt) *"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Brand (optional)"
        value={brand}
        onChangeText={setBrand}
      />

      <TextInput
        style={styles.input}
        placeholder="Price (£)"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Purchase link (optional)"
        value={purchaseLink}
        onChangeText={setPurchaseLink}
        autoCapitalize="none"
      />

      {/* Category */}
      <View style={styles.section}>
        <Text style={styles.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipRow}>
            {allCategories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, category === cat && styles.chipActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.chip} onPress={addCustomCategory}>
              <Text style={styles.chipText}>+ Custom</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Colors */}
      <View style={styles.section}>
        <Text style={styles.label}>Colors ({colors.length}/5)</Text>
        <View style={styles.colorRow}>
          {colors.map((c) => (
            <TouchableOpacity
              key={c.hex}
              style={[styles.selectedColor, { backgroundColor: c.hex }]}
              onPress={() => toggleColor(c)}
            >
              <X size={14} color={c.hex === '#FFFFFF' ? '#000' : '#fff'} />
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.addColorBtn} onPress={() => setShowColorPicker(true)}>
          <Text style={styles.addColorText}>+ Add Colors</Text>
        </TouchableOpacity>
      </View>

      {/* Warmth */}
      <View style={styles.section}>
        <Text style={styles.label}>Warmth: {warmth}/5</Text>
        <View style={styles.sliderRow}>
          {[1, 2, 3, 4, 5].map((v) => (
            <TouchableOpacity
              key={v}
              style={[styles.sliderDot, warmth >= v && styles.sliderDotActive]}
              onPress={() => setWarmth(v)}
            />
          ))}
        </View>
      </View>

      {/* Formality */}
      <View style={styles.section}>
        <Text style={styles.label}>Formality: {formality}/5</Text>
        <View style={styles.sliderRow}>
          {[1, 2, 3, 4, 5].map((v) => (
            <TouchableOpacity
              key={v}
              style={[styles.sliderDot, formality >= v && styles.sliderDotActive]}
              onPress={() => setFormality(v)}
            />
          ))}
        </View>
      </View>

      {/* Seasons */}
      <View style={styles.section}>
        <Text style={styles.label}>Seasons</Text>
        <View style={styles.chipRow}>
          {SEASONS.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.chip, seasons.includes(s) && styles.chipActive]}
              onPress={() => toggleSeason(s)}
            >
              <Text style={[styles.chipText, seasons.includes(s) && styles.chipTextActive]}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>{editingId ? 'Save Changes' : 'Add to Wardrobe'}</Text>
      </TouchableOpacity>

      {/* Color Picker Modal */}
      <Modal visible={showColorPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Colors</Text>
              <TouchableOpacity onPress={() => setShowColorPicker(false)}>
                <X size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            <View style={styles.colorGrid}>
              {COLORS.map((c) => (
                <TouchableOpacity
                  key={c.hex}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: c.hex },
                    colors.find(col => col.hex === c.hex) && styles.colorSwatchSelected,
                  ]}
                  onPress={() => toggleColor(c)}
                />
              ))}
            </View>
            <TouchableOpacity style={styles.modalDone} onPress={() => setShowColorPicker(false)}>
              <Text style={styles.modalDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  photoArea: { height: 200, borderRadius: 16, overflow: 'hidden', marginBottom: 8 },
  photoPlaceholder: { flex: 1, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#e5e7eb', borderStyle: 'dashed', borderRadius: 16 },
  photoPreview: { width: '100%', height: '100%' },
  photoText: { color: '#9ca3af', marginTop: 8 },
  removePhoto: { position: 'absolute', top: 24, right: 24, backgroundColor: '#ef4444', borderRadius: 16, padding: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, marginBottom: 12 },
  section: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  chipActive: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  chipText: { fontSize: 14, color: '#4b5563' },
  chipTextActive: { color: '#fff' },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  selectedColor: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#d1d5db' },
  addColorBtn: { alignSelf: 'flex-start' },
  addColorText: { color: '#6366f1', fontSize: 14 },
  sliderRow: { flexDirection: 'row', gap: 8 },
  sliderDot: { flex: 1, height: 40, borderRadius: 8, backgroundColor: '#e5e7eb' },
  sliderDotActive: { backgroundColor: '#6366f1' },
  submitBtn: { backgroundColor: '#6366f1', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 16 },
  submitText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '70%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  colorSwatch: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#e5e7eb' },
  colorSwatchSelected: { borderColor: '#111', borderWidth: 3 },
  modalDone: { backgroundColor: '#6366f1', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 16 },
  modalDoneText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
