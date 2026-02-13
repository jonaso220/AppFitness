import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../theme';

function ExerciseDetail({ exercise, index }) {
  const bestSet = exercise.sets.reduce(
    (best, s) => (s.reps * s.weight > best.reps * best.weight ? s : best),
    exercise.sets[0],
  );

  return (
    <View style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        <View style={styles.exerciseIndex}>
          <Text style={styles.exerciseIndexText}>{index + 1}</Text>
        </View>
        <View style={styles.exerciseHeaderInfo}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          {exercise.muscleGroup && (
            <View style={styles.muscleTag}>
              <Text style={styles.muscleTagText}>{exercise.muscleGroup}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.setsTable}>
        <View style={styles.setsTableHeader}>
          <Text style={[styles.setsTableHeaderText, styles.colSerie]}>Serie</Text>
          <Text style={[styles.setsTableHeaderText, styles.colReps]}>Reps</Text>
          <Text style={[styles.setsTableHeaderText, styles.colWeight]}>Peso</Text>
          <Text style={[styles.setsTableHeaderText, styles.colVolume]}>Volumen</Text>
        </View>
        {exercise.sets.map((set, si) => (
          <View key={si} style={[styles.setsTableRow, si === exercise.sets.length - 1 && styles.lastRow]}>
            <Text style={[styles.setsTableCell, styles.colSerie]}>{set.setNumber}</Text>
            <Text style={[styles.setsTableCell, styles.colReps]}>{set.reps}</Text>
            <Text style={[styles.setsTableCell, styles.colWeight]}>{set.weight} kg</Text>
            <Text style={[styles.setsTableCell, styles.colVolume, styles.volumeText]}>
              {set.reps * set.weight} kg
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.exerciseFooter}>
        <View style={styles.footerItem}>
          <Text style={styles.footerLabel}>Series</Text>
          <Text style={styles.footerValue}>{exercise.sets.length}</Text>
        </View>
        <View style={styles.footerItem}>
          <Text style={styles.footerLabel}>Mejor serie</Text>
          <Text style={styles.footerValueAccent}>{bestSet.weight} kg x {bestSet.reps}</Text>
        </View>
        <View style={styles.footerItem}>
          <Text style={styles.footerLabel}>Volumen</Text>
          <Text style={styles.footerValue}>
            {exercise.sets.reduce((a, s) => a + s.reps * s.weight, 0)} kg
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function HistoryDetailScreen({ route }) {
  const { workout } = route.params;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{workout.name}</Text>
      {workout.templateName && (
        <View style={styles.templateBadge}>
          <Ionicons name="copy-outline" size={13} color={colors.primaryLight} />
          <Text style={styles.templateBadgeText}>Plantilla: {workout.templateName}</Text>
        </View>
      )}
      <Text style={styles.date}>{formatFullDate(workout.date)}</Text>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Ionicons name="time-outline" size={20} color={colors.accent} />
          <Text style={styles.statValue}>{workout.duration} min</Text>
          <Text style={styles.statLabel}>Duración</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="layers-outline" size={20} color={colors.primary} />
          <Text style={styles.statValue}>{workout.totalSets}</Text>
          <Text style={styles.statLabel}>Series</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="barbell-outline" size={20} color={colors.warning} />
          <Text style={styles.statValue}>{formatVolume(workout.totalVolume)}</Text>
          <Text style={styles.statLabel}>Volumen</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>
        Ejercicios ({workout.exercises.length})
      </Text>

      {workout.exercises.map((exercise, index) => (
        <ExerciseDetail key={index} exercise={exercise} index={index} />
      ))}
    </ScrollView>
  );
}

function formatFullDate(dateString) {
  const date = new Date(dateString + 'T12:00:00');
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
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
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
  },
  templateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
  },
  templateBadgeText: {
    fontSize: fontSize.xs,
    color: colors.primaryLight,
    fontWeight: '500',
  },
  date: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textTransform: 'capitalize',
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  // Exercise card
  exerciseCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  exerciseIndex: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseIndexText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  exerciseHeaderInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  muscleTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  muscleTagText: {
    fontSize: fontSize.xs,
    color: colors.primaryLight,
    fontWeight: '500',
  },
  // Sets table
  setsTable: {
    marginBottom: spacing.sm,
  },
  setsTableHeader: {
    flexDirection: 'row',
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.xs,
  },
  setsTableHeaderText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  setsTableRow: {
    flexDirection: 'row',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  setsTableCell: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '500',
  },
  colSerie: {
    width: 50,
  },
  colReps: {
    flex: 1,
  },
  colWeight: {
    flex: 1,
  },
  colVolume: {
    flex: 1,
    textAlign: 'right',
  },
  volumeText: {
    color: colors.textSecondary,
  },
  // Exercise footer
  exerciseFooter: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerItem: {
    flex: 1,
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  footerValue: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
  footerValueAccent: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.accent,
    marginTop: 2,
  },
});
