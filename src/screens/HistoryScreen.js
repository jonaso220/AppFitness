import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../theme';
import { useWorkoutHistory } from '../context/WorkoutContext';

function WorkoutCard({ workout, onPress }) {
  return (
    <TouchableOpacity style={styles.workoutCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardLeft}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateDay}>{getDay(workout.date)}</Text>
          <Text style={styles.dateMonth}>{getMonth(workout.date)}</Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.workoutName}>{workout.name}</Text>
        <View style={styles.workoutMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>{workout.duration} min</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="layers-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>{workout.totalSets} series</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="barbell-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>{formatVolume(workout.totalVolume)}</Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

function EmptyHistory() {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="time-outline" size={64} color={colors.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>Sin entrenamientos</Text>
      <Text style={styles.emptySubtitle}>
        Completa tu primer entrenamiento en la sección Entrenar y aparecerá aquí
      </Text>
    </View>
  );
}

export default function HistoryScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { history } = useWorkoutHistory();

  const totalDuration = history.reduce((a, w) => a + w.duration, 0);
  const totalVolume = history.reduce((a, w) => a + w.totalVolume, 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Historial</Text>
        {history.length > 0 && (
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{history.length}</Text>
              <Text style={styles.summaryLabel}>Entrenamientos</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totalDuration} min</Text>
              <Text style={styles.summaryLabel}>Tiempo total</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{formatVolume(totalVolume)}</Text>
              <Text style={styles.summaryLabel}>Volumen total</Text>
            </View>
          </View>
        )}
      </View>

      {history.length === 0 ? (
        <EmptyHistory />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <WorkoutCard
              workout={item}
              onPress={() => navigation.navigate('HistoryDetail', { workout: item })}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

function getDay(dateString) {
  return new Date(dateString + 'T12:00:00').getDate();
}

function getMonth(dateString) {
  return new Date(dateString + 'T12:00:00')
    .toLocaleDateString('es-ES', { month: 'short' })
    .toUpperCase();
}

function formatVolume(vol) {
  if (vol >= 1000) return (vol / 1000).toFixed(1) + 't';
  return vol + ' kg';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
  title: {
    fontSize: fontSize.hero,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.primary,
  },
  summaryLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLeft: {
    marginRight: spacing.md,
  },
  dateContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateDay: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.primary,
    lineHeight: 22,
  },
  dateMonth: {
    fontSize: fontSize.xs,
    color: colors.primaryLight,
    fontWeight: '600',
    lineHeight: 14,
  },
  cardContent: {
    flex: 1,
  },
  workoutName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  workoutMeta: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
