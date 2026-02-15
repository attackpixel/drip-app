import { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuthStore, useWeatherStore, type TemperatureUnit } from '@drip/core';

export default function SettingsScreen() {
  const { profile, updateProfile, signOut } = useAuthStore();
  const { location, temperatureUnit, detectLocation, setTemperatureUnit } = useWeatherStore();

  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');

  const handleSave = async () => {
    try {
      await updateProfile({ display_name: displayName });
      Alert.alert('Saved', 'Profile updated.');
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Profile</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Display name"
          />
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Location */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Location</Text>
        {location && <Text style={styles.locationText}>{location.name}</Text>}
        <TouchableOpacity style={styles.detectBtn} onPress={detectLocation}>
          <Text style={styles.detectBtnText}>Auto-detect Location</Text>
        </TouchableOpacity>
      </View>

      {/* Temperature */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Temperature Unit</Text>
        <View style={styles.unitRow}>
          {(['fahrenheit', 'celsius'] as TemperatureUnit[]).map((unit) => (
            <TouchableOpacity
              key={unit}
              style={[styles.unitBtn, temperatureUnit === unit && styles.unitBtnActive]}
              onPress={() => setTemperatureUnit(unit)}
            >
              <Text style={[styles.unitText, temperatureUnit === unit && styles.unitTextActive]}>
                {unit === 'fahrenheit' ? '°F' : '°C'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Sign Out */}
      <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', padding: 16 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  inputRow: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14 },
  saveBtn: { backgroundColor: '#6366f1', borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  locationText: { fontSize: 14, color: '#374151', marginBottom: 8 },
  detectBtn: { backgroundColor: '#f3f4f6', borderRadius: 12, padding: 12, alignItems: 'center' },
  detectBtnText: { fontSize: 14, color: '#4b5563', fontWeight: '500' },
  unitRow: { flexDirection: 'row', gap: 8 },
  unitBtn: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 12, padding: 12, alignItems: 'center' },
  unitBtnActive: { backgroundColor: '#6366f1' },
  unitText: { fontSize: 14, color: '#4b5563', fontWeight: '500' },
  unitTextActive: { color: '#fff' },
  signOutBtn: { backgroundColor: '#ef4444', borderRadius: 16, padding: 14, alignItems: 'center' },
  signOutText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
