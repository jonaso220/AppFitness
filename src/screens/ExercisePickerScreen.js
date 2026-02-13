import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../theme';
import { exercises as allExercises, muscleGroups } from '../data/mockData';

export default function ExercisePickerScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [selected, setSelected] = useState([]);

  const filtered = useMemo(() => {
    return allExercises.filter((ex) => {
      const matchesSearch = search
        ? ex.name.toLowerCase().includes(search.toLowerCase())
        : true;
      const matchesMuscle = selectedMuscle
        ? ex.muscleGroup === selectedMuscle
        : true;
      return matchesSearch && matchesMuscle;
    });
  }, [search, selectedMuscle]);

  const toggleSelect = (exercise) => {
    setSelected((prev) => {
      const exists = prev.find((e) => e.id === exercise.id);
      if (exists) return prev.filter((e) => e.id !== exercise.id);
      return [...prev, exercise];
    });
  };

  const isSelected = (id) => selected.some((e) => e.id === id);

  const handleConfirm = () => {
    if (selected.length === 0) return;
    navigation.navigate('TrainMain', {
      pickedExercises: selected,
      pickTimestamp: Date.now(),
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Añadir ejercicios</Text>
        <TouchableOpacity
          style={[styles.confirmButton, selected.length === 0 && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
          disabled={selected.length === 0}
        >
          <Text style={[styles.confirmText, selected.length === 0 && styles.confirmTextDisabled]}>
            Añadir{selected.length > 0 ? ` (${selected.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar ejercicio..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.chipsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={muscleGroups}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chip, selectedMuscle === item && styles.chipActive]}
              onPress={() => setSelectedMuscle(selectedMuscle === item ? null : item)}
            >
              <Text style={[styles.chipText, selectedMuscle === item && styles.chipTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.chipsList}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const checked = isSelected(item.id);
          return (
            <TouchableOpacity
              style={[styles.exerciseItem, checked && styles.exerciseItemSelected]}
              onPress={() => toggleSelect(item)}
              activeOpacity={0.7}
            >
              <View style={[styles.selectCircle, checked && styles.selectCircleChecked]}>
                {checked && <Ionicons name="checkmark" size={16} color={colors.white} />}
              </View>
              <View style={styles.exerciseContent}>
                <Text style={styles.exerciseName}>{item.name}</Text>
                <View style={styles.exerciseTags}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{item.muscleGroup}</Text>
                  </View>
                  <View style={[styles.tag, styles.tagEquipment]}>
                    <Text style={[styles.tagText, styles.tagEquipmentText]}>{item.equipment}</Text>
                  </View>
                  {item.level && (
                    <View style={[styles.tag, { backgroundColor: (item.level === 'Principiante' ? '#00B894' : '#FDCB6E') + '20' }]}>
                      <Text style={[styles.tagText, { color: item.level === 'Principiante' ? '#00B894' : '#FDCB6E' }]}>{item.level}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>Sin resultados</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  confirmButtonDisabled: {
    backgroundColor: colors.surfaceLight,
  },
  confirmText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.white,
  },
  confirmTextDisabled: {
    color: colors.textMuted,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    paddingVertical: spacing.md,
  },
  chipsContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  chipsList: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.primary,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exerciseItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  selectCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  selectCircleChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  exerciseTags: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  tagText: {
    fontSize: fontSize.xs,
    color: colors.primaryLight,
    fontWeight: '500',
  },
  tagEquipment: {
    backgroundColor: colors.accent + '15',
  },
  tagEquipmentText: {
    color: colors.accentLight,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
