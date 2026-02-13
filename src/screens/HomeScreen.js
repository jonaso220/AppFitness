import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useWorkoutHistory } from '../context/WorkoutContext';
import { useProgress } from '../context/ProgressContext';
import { exercises as exerciseLibrary } from '../data/mockData';

function StatCard({ icon, label, value, sublabel, color, onPress }) {
  return (
    <TouchableOpacity style={styles.statCard} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {sublabel && <Text style={styles.statSublabel}>{sublabel}</Text>}
    </TouchableOpacity>
  );
}

function SectionCard({ title, icon, children, onPress }) {
  return (
    <TouchableOpacity style={styles.sectionCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name={icon} size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </View>
      {children}
    </TouchableOpacity>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

function getStartOfWeek() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function calculateStreak(history) {
  if (history.length === 0) return 0;

  const uniqueDates = [...new Set(history.map((w) => w.date))].sort().reverse();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const firstDate = new Date(uniqueDates[0] + 'T12:00:00');
  firstDate.setHours(0, 0, 0, 0);

  if (firstDate < yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const curr = new Date(uniqueDates[i] + 'T12:00:00');
    const prev = new Date(uniqueDates[i - 1] + 'T12:00:00');
    const diffDays = Math.round((prev - curr) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { history } = useWorkoutHistory();
  const { entries: progressEntries } = useProgress();
  const goToTab = (tab) => navigation.getParent()?.navigate(tab);

  const stats = useMemo(() => {
    const weekStart = getStartOfWeek();
    const weeklyWorkouts = history.filter((w) => {
      const d = new Date(w.date + 'T12:00:00');
      return d >= weekStart;
    });
    const weeklyVolume = weeklyWorkouts.reduce((a, w) => a + w.totalVolume, 0);
    const streak = calculateStreak(history);
    const lastWorkout = history.length > 0 ? history[0] : null;

    const recentExerciseNames = [];
    for (const w of history) {
      for (const ex of w.exercises) {
        if (!recentExerciseNames.includes(ex.name)) {
          recentExerciseNames.push(ex.name);
        }
        if (recentExerciseNames.length >= 4) break;
      }
      if (recentExerciseNames.length >= 4) break;
    }

    return {
      weeklyCount: weeklyWorkouts.length,
      weeklyVolume,
      streak,
      lastWorkout,
      recentExercises: recentExerciseNames,
      totalWorkouts: history.length,
    };
  }, [history]);

  const hasHistory = history.length > 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.sm }]}
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>
            {getGreeting()}{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}
          </Text>
          <Text style={styles.title}>Tu resumen</Text>
        </View>
        <TouchableOpacity style={styles.avatarPlaceholder} onPress={logout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="flame"
          label="Racha"
          value={stats.streak > 0 ? `${stats.streak} día${stats.streak !== 1 ? 's' : ''}` : '—'}
          color={colors.warning}
          onPress={() => goToTab('HistorialTab')}
        />
        <StatCard
          icon="barbell"
          label="Esta semana"
          value={`${stats.weeklyCount}`}
          sublabel="entrenamientos"
          color={colors.primary}
          onPress={() => goToTab('EntrenarTab')}
        />
        <StatCard
          icon="trending-up"
          label="Volumen"
          value={stats.weeklyVolume > 0 ? formatVolume(stats.weeklyVolume) : '—'}
          sublabel="esta semana"
          color={colors.success}
          onPress={() => goToTab('HistorialTab')}
        />
        <StatCard
          icon="library"
          label="Ejercicios"
          value={`${exerciseLibrary.length}`}
          sublabel="disponibles"
          color={colors.accent}
          onPress={() => goToTab('EjerciciosTab')}
        />
      </View>

      {/* Last workout */}
      {hasHistory ? (
        <SectionCard
          title="Último entrenamiento"
          icon="fitness"
          onPress={() => goToTab('HistorialTab')}
        >
          <View style={styles.lastWorkout}>
            <Text style={styles.lastWorkoutName}>{stats.lastWorkout.name}</Text>
            <View style={styles.lastWorkoutMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.metaText}>{formatDate(stats.lastWorkout.date)}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.metaText}>{stats.lastWorkout.duration} min</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="layers-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.metaText}>{stats.lastWorkout.totalSets} series</Text>
              </View>
            </View>
          </View>
        </SectionCard>
      ) : (
        <SectionCard
          title="Empieza a entrenar"
          icon="fitness"
          onPress={() => goToTab('EntrenarTab')}
        >
          <View style={styles.emptyCard}>
            <Ionicons name="barbell-outline" size={32} color={colors.textMuted} />
            <Text style={styles.emptyCardText}>
              Aún no tienes entrenamientos registrados
            </Text>
            <View style={styles.ctaButton}>
              <Text style={styles.ctaButtonText}>Comenzar</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.white} />
            </View>
          </View>
        </SectionCard>
      )}

      {/* Quick start */}
      <SectionCard
        title="Entrenar ahora"
        icon="play-circle"
        onPress={() => goToTab('EntrenarTab')}
      >
        <View style={styles.continueSection}>
          <Text style={styles.continueText}>
            {hasHistory
              ? 'Inicia un nuevo entrenamiento'
              : 'Crea tu primer entrenamiento'}
          </Text>
          <View style={styles.continueButton}>
            <Text style={styles.continueButtonText}>Iniciar</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.white} />
          </View>
        </View>
      </SectionCard>

      {/* Progress card */}
      <SectionCard
        title="Progreso"
        icon="analytics"
        onPress={() => navigation.navigate('Progress')}
      >
        {progressEntries.length > 0 ? (
          <View>
            <View style={styles.progressMetrics}>
              {progressEntries[0].weight > 0 && (
                <View style={styles.progressMetric}>
                  <Ionicons name="scale-outline" size={14} color={colors.accent} />
                  <Text style={styles.progressMetricValue}>{progressEntries[0].weight} kg</Text>
                </View>
              )}
              {progressEntries[0].waist > 0 && (
                <View style={styles.progressMetric}>
                  <Text style={styles.progressMetricLabel}>Cintura</Text>
                  <Text style={styles.progressMetricValue}>{progressEntries[0].waist} cm</Text>
                </View>
              )}
              {progressEntries[0].chest > 0 && (
                <View style={styles.progressMetric}>
                  <Text style={styles.progressMetricLabel}>Pecho</Text>
                  <Text style={styles.progressMetricValue}>{progressEntries[0].chest} cm</Text>
                </View>
              )}
              {progressEntries[0].hip > 0 && (
                <View style={styles.progressMetric}>
                  <Text style={styles.progressMetricLabel}>Cadera</Text>
                  <Text style={styles.progressMetricValue}>{progressEntries[0].hip} cm</Text>
                </View>
              )}
            </View>
            <Text style={styles.progressDate}>
              {progressEntries.length} registro{progressEntries.length !== 1 ? 's' : ''} guardado{progressEntries.length !== 1 ? 's' : ''}
            </Text>
          </View>
        ) : (
          <View style={styles.progressEmpty}>
            <Text style={styles.progressEmptyText}>
              Registra tu peso y medidas para seguir tu evolución
            </Text>
          </View>
        )}
      </SectionCard>

      {/* Descanso card */}
      <SectionCard
        title="Temporizador de descanso"
        icon="timer"
        onPress={() => goToTab('DescansoTab')}
      >
        <View style={styles.restCardContent}>
          <View style={styles.restPresets}>
            {['0:30', '1:00', '1:30', '2:00'].map((t) => (
              <View key={t} style={styles.restPresetChip}>
                <Text style={styles.restPresetText}>{t}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.restHint}>Toca para abrir el temporizador</Text>
        </View>
      </SectionCard>

      {/* Recent exercises or library summary */}
      {stats.recentExercises.length > 0 ? (
        <SectionCard
          title="Ejercicios recientes"
          icon="list"
          onPress={() => goToTab('EjerciciosTab')}
        >
          <View style={styles.recentExercises}>
            {stats.recentExercises.map((exercise) => (
              <View key={exercise} style={styles.recentExerciseItem}>
                <View style={styles.exerciseDot} />
                <Text style={styles.recentExerciseText}>{exercise}</Text>
              </View>
            ))}
          </View>
        </SectionCard>
      ) : (
        <SectionCard
          title="Biblioteca de ejercicios"
          icon="list"
          onPress={() => goToTab('EjerciciosTab')}
        >
          <View style={styles.libraryPreview}>
            <Text style={styles.libraryText}>
              Explora {exerciseLibrary.length} ejercicios organizados por grupo muscular
            </Text>
            <View style={styles.muscleGroupChips}>
              {['Pecho', 'Espalda', 'Piernas', 'Hombros'].map((g) => (
                <View key={g} style={styles.muscleChip}>
                  <Text style={styles.muscleChipText}>{g}</Text>
                </View>
              ))}
            </View>
          </View>
        </SectionCard>
      )}

      {/* History summary */}
      {hasHistory && (
        <SectionCard
          title="Tu historial"
          icon="time"
          onPress={() => goToTab('HistorialTab')}
        >
          <View style={styles.historySummary}>
            <View style={styles.historyStat}>
              <Text style={styles.historyStatValue}>{stats.totalWorkouts}</Text>
              <Text style={styles.historyStatLabel}>Entrenamientos</Text>
            </View>
            <View style={styles.historyDivider} />
            <View style={styles.historyStat}>
              <Text style={styles.historyStatValue}>
                {history.reduce((a, w) => a + w.duration, 0)} min
              </Text>
              <Text style={styles.historyStatLabel}>Tiempo total</Text>
            </View>
            <View style={styles.historyDivider} />
            <View style={styles.historyStat}>
              <Text style={styles.historyStatValue}>
                {formatVolume(history.reduce((a, w) => a + w.totalVolume, 0))}
              </Text>
              <Text style={styles.historyStatLabel}>Volumen total</Text>
            </View>
          </View>
        </SectionCard>
      )}

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

function formatDate(dateString) {
  const date = new Date(dateString + 'T12:00:00');
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  greeting: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  title: {
    fontSize: fontSize.hero,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xs,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statSublabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  // Section card
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  // Last workout
  lastWorkout: {},
  lastWorkoutName: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  lastWorkoutMeta: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  // Empty state card
  emptyCard: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyCardText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginTop: spacing.xs,
  },
  ctaButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.white,
  },
  // Continue / quick start
  continueSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  continueText: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  continueButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.white,
  },
  // Rest card
  restCardContent: {
    gap: spacing.sm,
  },
  restPresets: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  restPresetChip: {
    backgroundColor: colors.accent + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.accent + '30',
  },
  restPresetText: {
    fontSize: fontSize.sm,
    color: colors.accent,
    fontWeight: '600',
  },
  restHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  // Recent exercises
  recentExercises: {
    gap: spacing.sm,
  },
  recentExerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  exerciseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primaryLight,
  },
  recentExerciseText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  // Library preview
  libraryPreview: {
    gap: spacing.sm,
  },
  libraryText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  muscleGroupChips: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  muscleChip: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  muscleChipText: {
    fontSize: fontSize.xs,
    color: colors.primaryLight,
    fontWeight: '500',
  },
  // Progress card
  progressMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  progressMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  progressMetricLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  progressMetricValue: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  progressDate: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  progressEmpty: {},
  progressEmptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  // History summary
  historySummary: {
    flexDirection: 'row',
  },
  historyStat: {
    flex: 1,
    alignItems: 'center',
  },
  historyStatValue: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.primary,
  },
  historyStatLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  historyDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
});
