import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../theme';
import { exercises, muscleGroups, equipment, levels } from '../data/mockData';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const levelColors = {
  Principiante: colors.success,
  Intermedio: colors.warning,
};

function FilterChip({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipText, selected && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function MuscleTag({ label, variant }) {
  const isPrimary = variant === 'primary';
  return (
    <View style={[styles.muscleTag, isPrimary && styles.muscleTagPrimary]}>
      <Text style={[styles.muscleTagText, isPrimary && styles.muscleTagTextPrimary]}>{label}</Text>
    </View>
  );
}

function ExerciseItem({ exercise, expanded, onToggle }) {
  const lvlColor = levelColors[exercise.level] || colors.textMuted;

  return (
    <TouchableOpacity
      style={[styles.exerciseItem, expanded && styles.exerciseItemExpanded]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      {/* Header row */}
      <View style={styles.exerciseHeader}>
        <View style={styles.exerciseIcon}>
          <Ionicons name="barbell-outline" size={22} color={colors.primary} />
        </View>
        <View style={styles.exerciseHeaderContent}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <View style={styles.exerciseTags}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{exercise.muscleGroup}</Text>
            </View>
            <View style={[styles.tag, styles.tagEquipment]}>
              <Text style={[styles.tagText, styles.tagEquipmentText]}>{exercise.equipment}</Text>
            </View>
            <View style={[styles.levelBadge, { backgroundColor: lvlColor + '20' }]}>
              <Text style={[styles.levelText, { color: lvlColor }]}>{exercise.level}</Text>
            </View>
          </View>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textMuted}
        />
      </View>

      {/* Expanded detail */}
      {expanded && (
        <View style={styles.detail}>
          {/* Description */}
          <View style={styles.detailSection}>
            <View style={styles.detailSectionHeader}>
              <Ionicons name="document-text-outline" size={16} color={colors.primary} />
              <Text style={styles.detailSectionTitle}>Ejecución</Text>
            </View>
            <Text style={styles.descriptionText}>{exercise.description}</Text>
          </View>

          {/* Primary muscles */}
          <View style={styles.detailSection}>
            <View style={styles.detailSectionHeader}>
              <Ionicons name="fitness-outline" size={16} color={colors.accent} />
              <Text style={styles.detailSectionTitle}>Músculos principales</Text>
            </View>
            <View style={styles.musclesRow}>
              {exercise.primaryMuscles.map((m) => (
                <MuscleTag key={m} label={m} variant="primary" />
              ))}
            </View>
          </View>

          {/* Secondary muscles */}
          {exercise.secondaryMuscles.length > 0 && (
            <View style={styles.detailSection}>
              <View style={styles.detailSectionHeader}>
                <Ionicons name="fitness" size={16} color={colors.textSecondary} />
                <Text style={styles.detailSectionTitle}>Músculos secundarios</Text>
              </View>
              <View style={styles.musclesRow}>
                {exercise.secondaryMuscles.map((m) => (
                  <MuscleTag key={m} label={m} variant="secondary" />
                ))}
              </View>
            </View>
          )}

          {/* Benefits */}
          <View style={styles.detailSection}>
            <View style={styles.detailSectionHeader}>
              <Ionicons name="star-outline" size={16} color={colors.warning} />
              <Text style={styles.detailSectionTitle}>Beneficios</Text>
            </View>
            {exercise.benefits.map((b) => (
              <View key={b} style={styles.benefitRow}>
                <View style={styles.benefitDot} />
                <Text style={styles.benefitText}>{b}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function ExercisesScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [filterTab, setFilterTab] = useState(0); // 0=muscle, 1=equipment, 2=level
  const [expandedId, setExpandedId] = useState(null);

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesSearch = search
        ? ex.name.toLowerCase().includes(search.toLowerCase()) ||
          ex.primaryMuscles.some((m) => m.toLowerCase().includes(search.toLowerCase())) ||
          ex.description.toLowerCase().includes(search.toLowerCase())
        : true;
      const matchesMuscle = selectedMuscle ? ex.muscleGroup === selectedMuscle : true;
      const matchesEquip = selectedEquipment ? ex.equipment === selectedEquipment : true;
      const matchesLevel = selectedLevel ? ex.level === selectedLevel : true;
      return matchesSearch && matchesMuscle && matchesEquip && matchesLevel;
    });
  }, [search, selectedMuscle, selectedEquipment, selectedLevel]);

  const handleToggleExpand = useCallback((id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const hasActiveFilters = selectedMuscle || selectedEquipment || selectedLevel;

  const clearFilters = () => {
    setSelectedMuscle(null);
    setSelectedEquipment(null);
    setSelectedLevel(null);
  };

  const filterData = filterTab === 0 ? muscleGroups : filterTab === 1 ? equipment : levels;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Ejercicios</Text>
        <Text style={styles.countText}>{exercises.length} ejercicios</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar ejercicio o músculo..."
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

      {/* Filter tabs */}
      <View style={styles.filterToggle}>
        <TouchableOpacity
          style={[styles.filterTab, filterTab === 0 && styles.filterTabActive]}
          onPress={() => setFilterTab(0)}
        >
          <Text style={[styles.filterTabText, filterTab === 0 && styles.filterTabTextActive]}>
            Músculo
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filterTab === 1 && styles.filterTabActive]}
          onPress={() => setFilterTab(1)}
        >
          <Text style={[styles.filterTabText, filterTab === 1 && styles.filterTabTextActive]}>
            Material
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filterTab === 2 && styles.filterTabActive]}
          onPress={() => setFilterTab(2)}
        >
          <Text style={[styles.filterTabText, filterTab === 2 && styles.filterTabTextActive]}>
            Nivel
          </Text>
        </TouchableOpacity>
      </View>

      {/* Chips */}
      <View style={styles.chipsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filterData}
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const isSelected =
              filterTab === 0
                ? selectedMuscle === item
                : filterTab === 1
                  ? selectedEquipment === item
                  : selectedLevel === item;
            return (
              <FilterChip
                label={item}
                selected={isSelected}
                onPress={() => {
                  if (filterTab === 0) {
                    setSelectedMuscle(selectedMuscle === item ? null : item);
                  } else if (filterTab === 1) {
                    setSelectedEquipment(selectedEquipment === item ? null : item);
                  } else {
                    setSelectedLevel(selectedLevel === item ? null : item);
                  }
                }}
              />
            );
          }}
          contentContainerStyle={styles.chipsList}
        />
      </View>

      {/* Active filter indicators + clear */}
      {hasActiveFilters && (
        <View style={styles.activeFiltersRow}>
          <View style={styles.activeFiltersChips}>
            {selectedMuscle && (
              <View style={styles.activeChip}>
                <Text style={styles.activeChipText}>{selectedMuscle}</Text>
                <TouchableOpacity onPress={() => setSelectedMuscle(null)}>
                  <Ionicons name="close" size={12} color={colors.primary} />
                </TouchableOpacity>
              </View>
            )}
            {selectedEquipment && (
              <View style={styles.activeChip}>
                <Text style={styles.activeChipText}>{selectedEquipment}</Text>
                <TouchableOpacity onPress={() => setSelectedEquipment(null)}>
                  <Ionicons name="close" size={12} color={colors.primary} />
                </TouchableOpacity>
              </View>
            )}
            {selectedLevel && (
              <View style={styles.activeChip}>
                <Text style={styles.activeChipText}>{selectedLevel}</Text>
                <TouchableOpacity onPress={() => setSelectedLevel(null)}>
                  <Ionicons name="close" size={12} color={colors.primary} />
                </TouchableOpacity>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={clearFilters} style={styles.clearAll}>
            <Text style={styles.clearAllText}>Limpiar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Results count */}
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Exercise list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ExerciseItem
            exercise={item}
            expanded={expandedId === item.id}
            onToggle={() => handleToggleExpand(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>No se encontraron ejercicios</Text>
            <Text style={styles.emptySubtext}>Prueba ajustando los filtros</Text>
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
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  title: {
    fontSize: fontSize.hero,
    fontWeight: '700',
    color: colors.text,
  },
  countText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
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
  // Filter toggle
  filterToggle: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  filterTabActive: {
    backgroundColor: colors.primary + '25',
  },
  filterTabText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: colors.primary,
  },
  // Chips
  chipsContainer: {
    marginTop: spacing.md,
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
  // Active filters
  activeFiltersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  activeFiltersChips: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  activeChipText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
  },
  clearAll: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  clearAllText: {
    fontSize: fontSize.sm,
    color: colors.danger,
    fontWeight: '500',
  },
  // Results
  resultsInfo: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  resultsText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  // Exercise item
  exerciseItem: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exerciseItemExpanded: {
    borderColor: colors.primary + '50',
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  exerciseHeaderContent: {
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
    flexWrap: 'wrap',
    gap: spacing.xs,
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
  levelBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  levelText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  // Detail
  detail: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailSection: {
    marginBottom: spacing.md,
  },
  detailSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  detailSectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  descriptionText: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 22,
  },
  musclesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  muscleTag: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  muscleTagPrimary: {
    backgroundColor: colors.accent + '20',
  },
  muscleTagText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  muscleTagTextPrimary: {
    color: colors.accentLight,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  benefitDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.warning,
    marginTop: 7,
  },
  benefitText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  // Empty
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
  emptySubtext: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
});
