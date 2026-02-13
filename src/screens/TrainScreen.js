import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../theme';
import { useWorkoutHistory } from '../context/WorkoutContext';
import { exercises as exerciseLibrary, workoutTemplates } from '../data/mockData';

function SetRow({ set, onToggle, onUpdateReps, onUpdateWeight, onRemove }) {
  return (
    <View style={[styles.setRow, set.completed && styles.setRowCompleted]}>
      <View style={styles.setNumber}>
        <Text style={[styles.setNumberText, set.completed && styles.completedText]}>
          {set.setNumber}
        </Text>
      </View>
      <View style={styles.setInputContainer}>
        <TextInput
          style={[styles.setInput, set.completed && styles.setInputCompleted]}
          value={String(set.reps)}
          onChangeText={onUpdateReps}
          keyboardType="number-pad"
          selectTextOnFocus
          editable={!set.completed}
        />
      </View>
      <View style={styles.setInputContainer}>
        <TextInput
          style={[styles.setInput, set.completed && styles.setInputCompleted]}
          value={String(set.weight)}
          onChangeText={onUpdateWeight}
          keyboardType="decimal-pad"
          selectTextOnFocus
          editable={!set.completed}
        />
      </View>
      <TouchableOpacity
        style={[styles.checkBox, set.completed && styles.checkBoxCompleted]}
        onPress={onToggle}
      >
        {set.completed && <Ionicons name="checkmark" size={16} color={colors.white} />}
      </TouchableOpacity>
      <TouchableOpacity style={styles.removeSetButton} onPress={onRemove}>
        <Ionicons name="close" size={14} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

function ExerciseCard({
  exercise,
  exerciseIndex,
  onToggleSet,
  onUpdateReps,
  onUpdateWeight,
  onAddSet,
  onRemoveSet,
  onRemoveExercise,
}) {
  return (
    <View style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <View style={styles.muscleTag}>
            <Text style={styles.muscleTagText}>{exercise.muscleGroup}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.removeExerciseButton}
          onPress={() => onRemoveExercise(exerciseIndex)}
        >
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
        </TouchableOpacity>
      </View>

      <View style={styles.setsHeader}>
        <Text style={styles.setsHeaderText}>Serie</Text>
        <Text style={styles.setsHeaderText}>Reps</Text>
        <Text style={styles.setsHeaderText}>Kg</Text>
        <View style={{ width: 32, marginLeft: spacing.sm }} />
        <View style={{ width: 24, marginLeft: 4 }} />
      </View>

      {exercise.sets.map((set, setIndex) => (
        <SetRow
          key={set.id}
          set={set}
          onToggle={() => onToggleSet(exerciseIndex, setIndex)}
          onUpdateReps={(v) => onUpdateReps(exerciseIndex, setIndex, v)}
          onUpdateWeight={(v) => onUpdateWeight(exerciseIndex, setIndex, v)}
          onRemove={() => onRemoveSet(exerciseIndex, setIndex)}
        />
      ))}

      <TouchableOpacity
        style={styles.addSetButton}
        onPress={() => onAddSet(exerciseIndex)}
      >
        <Ionicons name="add" size={18} color={colors.primary} />
        <Text style={styles.addSetText}>Añadir serie</Text>
      </TouchableOpacity>
    </View>
  );
}

function TemplateCard({ template, onSelect }) {
  return (
    <TouchableOpacity
      style={[styles.templateCard, { borderColor: template.color + '40' }]}
      onPress={() => onSelect(template)}
      activeOpacity={0.7}
    >
      <View style={[styles.templateIconContainer, { backgroundColor: template.color + '20' }]}>
        <Ionicons name={template.icon} size={26} color={template.color} />
      </View>
      <View style={styles.templateInfo}>
        <Text style={styles.templateName}>{template.name}</Text>
        <Text style={styles.templateDesc} numberOfLines={2}>{template.description}</Text>
        <Text style={styles.templateMeta}>
          {template.exercises.length} ejercicios · {template.exercises.reduce((a, e) => a + e.sets.length, 0)} series
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

function EmptyState({ onStart, onSelectTemplate }) {
  return (
    <ScrollView
      style={styles.emptyScroll}
      contentContainerStyle={styles.emptyScrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.emptyHero}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="barbell-outline" size={64} color={colors.textMuted} />
        </View>
        <Text style={styles.emptyTitle}>Sin entrenamiento activo</Text>
        <Text style={styles.emptySubtitle}>
          Empieza un entrenamiento en blanco o elige una plantilla
        </Text>
        <TouchableOpacity style={styles.startButton} onPress={onStart}>
          <Ionicons name="add" size={22} color={colors.white} />
          <Text style={styles.startButtonText}>Entrenamiento vacío</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.templatesSection}>
        <Text style={styles.templatesSectionTitle}>Plantillas de entrenamiento</Text>
        <Text style={styles.templatesSectionSubtitle}>
          Selecciona una plantilla para cargar ejercicios y series sugeridas
        </Text>
        {workoutTemplates.map((tpl) => (
          <TemplateCard key={tpl.id} template={tpl} onSelect={onSelectTemplate} />
        ))}
      </View>
    </ScrollView>
  );
}

let setIdCounter = 0;
function nextSetId() {
  setIdCounter += 1;
  return `s_${setIdCounter}_${Date.now()}`;
}

// Build a lookup map once
const exerciseLookup = {};
exerciseLibrary.forEach((ex) => {
  exerciseLookup[ex.id] = ex;
});

export default function TrainScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { addWorkout } = useWorkoutHistory();
  const [workoutActive, setWorkoutActive] = useState(false);
  const [workoutName, setWorkoutName] = useState('');
  const [templateName, setTemplateName] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [editingName, setEditingName] = useState(false);
  const lastPickTimestamp = useRef(null);
  const startTimeRef = useRef(null);

  // Listen for exercises returned from ExercisePickerScreen
  useEffect(() => {
    const picked = route.params?.pickedExercises;
    const timestamp = route.params?.pickTimestamp;
    if (picked && picked.length > 0 && timestamp !== lastPickTimestamp.current) {
      lastPickTimestamp.current = timestamp;
      setExercises((prev) => {
        const newEntries = picked.map((ex) => ({
          ...ex,
          instanceId: `${ex.id}_${Date.now()}_${Math.random()}`,
          sets: [
            { id: nextSetId(), setNumber: 1, reps: 0, weight: 0, completed: false },
          ],
        }));
        return [...prev, ...newEntries];
      });
    }
  }, [route.params?.pickedExercises, route.params?.pickTimestamp]);

  const handleStartWorkout = () => {
    startTimeRef.current = Date.now();
    setWorkoutActive(true);
    setWorkoutName('Nuevo entrenamiento');
    setTemplateName(null);
    setExercises([]);
    setEditingName(false);
  };

  const handleSelectTemplate = (template) => {
    startTimeRef.current = Date.now();
    const name = template.name;

    const loadedExercises = template.exercises
      .map((tplEx) => {
        const libEx = exerciseLookup[tplEx.exerciseId];
        if (!libEx) return null;
        return {
          ...libEx,
          instanceId: `${libEx.id}_${Date.now()}_${Math.random()}`,
          sets: tplEx.sets.map((s, i) => ({
            id: nextSetId(),
            setNumber: i + 1,
            reps: s.reps,
            weight: s.weight,
            completed: false,
          })),
        };
      })
      .filter(Boolean);

    setWorkoutName(name);
    setTemplateName(name);
    setExercises(loadedExercises);
    setWorkoutActive(true);
    setEditingName(false);
  };

  const saveWorkout = async () => {
    const durationMs = Date.now() - (startTimeRef.current || Date.now());
    const duration = Math.max(1, Math.round(durationMs / 60000));
    const totalSetsCount = exercises.reduce((a, e) => a + e.sets.length, 0);
    const totalVolume = exercises.reduce(
      (a, e) => a + e.sets.reduce((sa, s) => sa + s.reps * s.weight, 0),
      0,
    );

    const entry = {
      id: `w_${Date.now()}`,
      name: workoutName || 'Entrenamiento',
      date: new Date().toISOString().split('T')[0],
      duration,
      totalSets: totalSetsCount,
      totalVolume,
      templateName: templateName || null,
      exercises: exercises.map((ex) => ({
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        sets: ex.sets.map((s) => ({
          setNumber: s.setNumber,
          reps: s.reps,
          weight: s.weight,
          completed: s.completed,
        })),
      })),
    };

    try {
      await addWorkout(entry);
      setWorkoutActive(false);
      setExercises([]);
      setWorkoutName('');
      setTemplateName(null);
      startTimeRef.current = null;
    } catch {
      Alert.alert('Error', 'No se pudo guardar el entrenamiento. Inténtalo de nuevo.');
    }
  };

  const handleFinishWorkout = () => {
    if (exercises.length === 0) {
      setWorkoutActive(false);
      return;
    }
    Alert.alert(
      'Finalizar entrenamiento',
      '¿Quieres finalizar este entrenamiento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Finalizar', onPress: saveWorkout },
      ],
    );
  };

  const handleCancelWorkout = () => {
    Alert.alert(
      'Descartar entrenamiento',
      '¿Seguro que quieres descartar este entrenamiento? Se perderán los datos.',
      [
        { text: 'Volver', style: 'cancel' },
        {
          text: 'Descartar',
          style: 'destructive',
          onPress: () => {
            setWorkoutActive(false);
            setExercises([]);
            setWorkoutName('');
            setTemplateName(null);
          },
        },
      ],
    );
  };

  const handleToggleSet = (exerciseIndex, setIndex) => {
    setExercises((prev) => {
      const updated = [...prev];
      const ex = { ...updated[exerciseIndex] };
      const sets = [...ex.sets];
      sets[setIndex] = { ...sets[setIndex], completed: !sets[setIndex].completed };
      ex.sets = sets;
      updated[exerciseIndex] = ex;
      return updated;
    });
  };

  const handleUpdateReps = (exerciseIndex, setIndex, value) => {
    const num = value === '' ? 0 : parseInt(value, 10) || 0;
    setExercises((prev) => {
      const updated = [...prev];
      const ex = { ...updated[exerciseIndex] };
      const sets = [...ex.sets];
      sets[setIndex] = { ...sets[setIndex], reps: num };
      ex.sets = sets;
      updated[exerciseIndex] = ex;
      return updated;
    });
  };

  const handleUpdateWeight = (exerciseIndex, setIndex, value) => {
    const cleaned = value.replace(',', '.');
    const num = cleaned === '' ? 0 : parseFloat(cleaned) || 0;
    setExercises((prev) => {
      const updated = [...prev];
      const ex = { ...updated[exerciseIndex] };
      const sets = [...ex.sets];
      sets[setIndex] = { ...sets[setIndex], weight: num };
      ex.sets = sets;
      updated[exerciseIndex] = ex;
      return updated;
    });
  };

  const handleAddSet = (exerciseIndex) => {
    setExercises((prev) => {
      const updated = [...prev];
      const ex = { ...updated[exerciseIndex] };
      const lastSet = ex.sets[ex.sets.length - 1];
      ex.sets = [
        ...ex.sets,
        {
          id: nextSetId(),
          setNumber: ex.sets.length + 1,
          reps: lastSet ? lastSet.reps : 0,
          weight: lastSet ? lastSet.weight : 0,
          completed: false,
        },
      ];
      updated[exerciseIndex] = ex;
      return updated;
    });
  };

  const handleRemoveSet = (exerciseIndex, setIndex) => {
    setExercises((prev) => {
      const updated = [...prev];
      const ex = { ...updated[exerciseIndex] };
      if (ex.sets.length <= 1) return prev;
      const sets = ex.sets.filter((_, i) => i !== setIndex).map((s, i) => ({
        ...s,
        setNumber: i + 1,
      }));
      ex.sets = sets;
      updated[exerciseIndex] = ex;
      return updated;
    });
  };

  const handleRemoveExercise = (exerciseIndex) => {
    Alert.alert(
      'Eliminar ejercicio',
      `¿Eliminar "${exercises[exerciseIndex].name}" del entrenamiento?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setExercises((prev) => prev.filter((_, i) => i !== exerciseIndex));
          },
        },
      ],
    );
  };

  const totalSets = exercises.reduce((acc, e) => acc + e.sets.length, 0);
  const completedSets = exercises.reduce(
    (acc, e) => acc + e.sets.filter((s) => s.completed).length,
    0,
  );
  const progress = totalSets > 0 ? completedSets / totalSets : 0;

  if (!workoutActive) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <EmptyState onStart={handleStartWorkout} onSelectTemplate={handleSelectTemplate} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancelWorkout} style={styles.cancelButton}>
          <Ionicons name="close" size={22} color={colors.danger} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          {editingName ? (
            <TextInput
              style={styles.workoutNameInput}
              value={workoutName}
              onChangeText={setWorkoutName}
              onBlur={() => setEditingName(false)}
              onSubmitEditing={() => setEditingName(false)}
              autoFocus
              selectTextOnFocus
            />
          ) : (
            <TouchableOpacity onPress={() => setEditingName(true)}>
              <Text style={styles.sessionName} numberOfLines={1}>{workoutName}</Text>
              <Text style={styles.sessionMeta}>
                {templateName ? `Plantilla: ${templateName} · ` : ''}
                {exercises.length} ejercicio{exercises.length !== 1 ? 's' : ''} · {totalSets} serie{totalSets !== 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.finishButton} onPress={handleFinishWorkout}>
          <Text style={styles.finishButtonText}>Finalizar</Text>
        </TouchableOpacity>
      </View>

      {totalSets > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {completedSets}/{totalSets} series completadas
          </Text>
        </View>
      )}

      <ScrollView
        style={styles.exerciseList}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        keyboardShouldPersistTaps="handled"
      >
        {exercises.map((exercise, index) => (
          <ExerciseCard
            key={exercise.instanceId}
            exercise={exercise}
            exerciseIndex={index}
            onToggleSet={handleToggleSet}
            onUpdateReps={handleUpdateReps}
            onUpdateWeight={handleUpdateWeight}
            onAddSet={handleAddSet}
            onRemoveSet={handleRemoveSet}
            onRemoveExercise={handleRemoveExercise}
          />
        ))}

        <TouchableOpacity
          style={styles.addExerciseButton}
          onPress={() => navigation.navigate('ExercisePicker')}
        >
          <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
          <Text style={styles.addExerciseText}>Añadir ejercicio</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Empty state
  emptyScroll: {
    flex: 1,
  },
  emptyScrollContent: {
    paddingBottom: spacing.xxl,
  },
  emptyHero: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  startButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.white,
  },
  // Templates
  templatesSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  templatesSectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  templatesSectionSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  templateIconContainer: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  templateDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  templateMeta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '500',
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  cancelButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.danger + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
  },
  sessionName: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  workoutNameInput: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    paddingVertical: spacing.xs,
  },
  sessionMeta: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  finishButton: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  finishButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.white,
  },
  // Progress
  progressContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  // Exercise list
  exerciseList: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  muscleTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  muscleTagText: {
    fontSize: fontSize.xs,
    color: colors.primaryLight,
    fontWeight: '500',
  },
  removeExerciseButton: {
    padding: spacing.xs,
  },
  setsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  setsHeaderText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  setRowCompleted: {
    opacity: 0.6,
  },
  setNumber: {
    flex: 1,
  },
  setNumberText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  setInputContainer: {
    flex: 1,
  },
  setInput: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    textAlign: 'center',
    marginHorizontal: 2,
  },
  setInputCompleted: {
    color: colors.textMuted,
    backgroundColor: 'transparent',
  },
  completedText: {
    color: colors.textMuted,
  },
  checkBox: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  checkBoxCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  removeSetButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  addSetText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  addExerciseText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '600',
  },
});
