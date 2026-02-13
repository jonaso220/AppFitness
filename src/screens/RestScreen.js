import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Keyboard,
  Platform,
  Vibration,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../theme';

const PRESETS = [
  { label: '0:30', seconds: 30 },
  { label: '1:00', seconds: 60 },
  { label: '1:30', seconds: 90 },
  { label: '2:00', seconds: 120 },
  { label: '3:00', seconds: 180 },
];

export default function RestScreen() {
  const insets = useSafeAreaInsets();
  const [baseTime, setBaseTime] = useState(90);
  const [timeLeft, setTimeLeft] = useState(90);
  const [isRunning, setIsRunning] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customMin, setCustomMin] = useState('');
  const [customSec, setCustomSec] = useState('');
  const intervalRef = useRef(null);
  const secInputRef = useRef(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setHasFinished(true);
            Vibration.vibrate(Platform.OS === 'ios' ? [0, 400, 200, 400] : 500);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  const handleStart = useCallback(() => {
    if (timeLeft === 0) {
      setTimeLeft(baseTime);
      setHasFinished(false);
    }
    setIsRunning(true);
    setHasFinished(false);
  }, [timeLeft, baseTime]);

  const handlePause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(baseTime);
    setHasFinished(false);
  }, [baseTime]);

  const handleSelectPreset = useCallback((seconds) => {
    setBaseTime(seconds);
    setTimeLeft(seconds);
    setIsRunning(false);
    setHasFinished(false);
    setShowCustom(false);
  }, []);

  const handleAdd30 = useCallback(() => {
    setTimeLeft((prev) => prev + 30);
    if (hasFinished) {
      setHasFinished(false);
      setIsRunning(true);
    }
  }, [hasFinished]);

  const handleAdd60 = useCallback(() => {
    setTimeLeft((prev) => prev + 60);
    if (hasFinished) {
      setHasFinished(false);
      setIsRunning(true);
    }
  }, [hasFinished]);

  const handleCustomConfirm = useCallback(() => {
    const mins = parseInt(customMin, 10) || 0;
    const secs = parseInt(customSec, 10) || 0;
    const total = mins * 60 + secs;
    if (total > 0 && total <= 600) {
      setBaseTime(total);
      setTimeLeft(total);
      setIsRunning(false);
      setHasFinished(false);
      setShowCustom(false);
      setCustomMin('');
      setCustomSec('');
      Keyboard.dismiss();
    }
  }, [customMin, customSec]);

  const isPresetSelected = (seconds) => baseTime === seconds && !showCustom;

  const progress = baseTime > 0 ? Math.min(timeLeft / baseTime, 1) : 0;
  const displayMinutes = Math.floor(timeLeft / 60);
  const displaySeconds = timeLeft % 60;

  const ringSize = 250;
  const ringStroke = 6;
  const ringRadius = (ringSize - ringStroke) / 2;

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Descanso</Text>
      <Text style={styles.subtitle}>Temporizador entre series</Text>

      {/* Timer ring */}
      <View style={styles.timerContainer}>
        <View style={[styles.timerRing, { width: ringSize, height: ringSize }]}>
          {/* Background ring */}
          <View
            style={[
              styles.ringBase,
              {
                width: ringSize,
                height: ringSize,
                borderRadius: ringSize / 2,
                borderWidth: ringStroke,
                borderColor: colors.surfaceLight,
              },
            ]}
          />
          {/* Progress ring */}
          <View
            style={[
              styles.ringBase,
              {
                width: ringSize,
                height: ringSize,
                borderRadius: ringSize / 2,
                borderWidth: ringStroke,
                borderColor: hasFinished ? colors.success : colors.primary,
                opacity: hasFinished ? 1 : progress,
              },
            ]}
          />
          {/* Timer text */}
          <View style={styles.timerTextContainer}>
            <Text
              style={[
                styles.timerText,
                hasFinished && styles.timerDone,
                isRunning && styles.timerRunning,
              ]}
            >
              {String(displayMinutes).padStart(2, '0')}:
              {String(displaySeconds).padStart(2, '0')}
            </Text>
            {hasFinished && (
              <Text style={styles.doneText}>Descanso completado</Text>
            )}
            {isRunning && !hasFinished && (
              <Text style={styles.runningLabel}>En curso</Text>
            )}
            {!isRunning && !hasFinished && timeLeft === baseTime && timeLeft > 0 && (
              <Text style={styles.readyLabel}>Listo para empezar</Text>
            )}
            {!isRunning && !hasFinished && timeLeft !== baseTime && timeLeft > 0 && (
              <Text style={styles.pausedLabel}>En pausa</Text>
            )}
          </View>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Ionicons name="refresh" size={22} color={colors.textSecondary} />
        </TouchableOpacity>

        {isRunning ? (
          <TouchableOpacity style={styles.mainButton} onPress={handlePause}>
            <Ionicons name="pause" size={32} color={colors.white} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.mainButton, styles.playButton]}
            onPress={handleStart}
          >
            <Ionicons name="play" size={32} color={colors.white} />
          </TouchableOpacity>
        )}

        <View style={styles.resetButton} />
      </View>

      {/* Add time buttons */}
      <View style={styles.addTimeRow}>
        <TouchableOpacity style={styles.addTimeButton} onPress={handleAdd30}>
          <Ionicons name="add" size={16} color={colors.primary} />
          <Text style={styles.addTimeText}>30s</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addTimeButton} onPress={handleAdd60}>
          <Ionicons name="add" size={16} color={colors.primary} />
          <Text style={styles.addTimeText}>1 min</Text>
        </TouchableOpacity>
      </View>

      {/* Presets */}
      <Text style={styles.sectionLabel}>Preajustes</Text>
      <View style={styles.presets}>
        {PRESETS.map((p) => (
          <TouchableOpacity
            key={p.seconds}
            style={[
              styles.presetButton,
              isPresetSelected(p.seconds) && styles.presetButtonActive,
            ]}
            onPress={() => handleSelectPreset(p.seconds)}
          >
            <Text
              style={[
                styles.presetText,
                isPresetSelected(p.seconds) && styles.presetTextActive,
              ]}
            >
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Custom time */}
      <TouchableOpacity
        style={[styles.customToggle, showCustom && styles.customToggleActive]}
        onPress={() => setShowCustom(!showCustom)}
      >
        <Ionicons
          name="options-outline"
          size={18}
          color={showCustom ? colors.primary : colors.textSecondary}
        />
        <Text style={[styles.customToggleText, showCustom && styles.customToggleTextActive]}>
          Tiempo personalizado
        </Text>
        <Ionicons
          name={showCustom ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={showCustom ? colors.primary : colors.textMuted}
        />
      </TouchableOpacity>

      {showCustom && (
        <View style={styles.customContainer}>
          <View style={styles.customInputRow}>
            <View style={styles.customInputGroup}>
              <TextInput
                style={styles.customInput}
                value={customMin}
                onChangeText={(v) => {
                  const cleaned = v.replace(/[^0-9]/g, '');
                  if (cleaned.length <= 2) setCustomMin(cleaned);
                }}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                maxLength={2}
                returnKeyType="next"
                onSubmitEditing={() => secInputRef.current?.focus()}
              />
              <Text style={styles.customInputLabel}>min</Text>
            </View>
            <Text style={styles.customSeparator}>:</Text>
            <View style={styles.customInputGroup}>
              <TextInput
                ref={secInputRef}
                style={styles.customInput}
                value={customSec}
                onChangeText={(v) => {
                  const cleaned = v.replace(/[^0-9]/g, '');
                  if (cleaned.length <= 2 && (parseInt(cleaned, 10) || 0) < 60) {
                    setCustomSec(cleaned);
                  }
                }}
                keyboardType="number-pad"
                placeholder="00"
                placeholderTextColor={colors.textMuted}
                maxLength={2}
                returnKeyType="done"
                onSubmitEditing={handleCustomConfirm}
              />
              <Text style={styles.customInputLabel}>seg</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.customConfirmButton} onPress={handleCustomConfirm}>
            <Text style={styles.customConfirmText}>Establecer</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  title: {
    fontSize: fontSize.hero,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  // Timer
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  timerRing: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringBase: {
    position: 'absolute',
  },
  timerTextContainer: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 60,
    fontWeight: '200',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  timerRunning: {
    color: colors.text,
  },
  timerDone: {
    color: colors.success,
  },
  doneText: {
    fontSize: fontSize.sm,
    color: colors.success,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  runningLabel: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '500',
    marginTop: spacing.xs,
  },
  readyLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '500',
    marginTop: spacing.xs,
  },
  pausedLabel: {
    fontSize: fontSize.sm,
    color: colors.warning,
    fontWeight: '500',
    marginTop: spacing.xs,
  },
  // Controls
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    marginBottom: spacing.lg,
  },
  mainButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.warning,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: colors.primary,
  },
  resetButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Add time
  addTimeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  addTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '15',
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  addTimeText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '600',
  },
  // Presets
  sectionLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 1,
    alignSelf: 'flex-start',
    paddingLeft: spacing.sm,
  },
  presets: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  presetButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetButtonActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  presetText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  presetTextActive: {
    color: colors.primary,
  },
  // Custom time
  customToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  customToggleActive: {
    borderColor: colors.primary,
  },
  customToggleText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  customToggleTextActive: {
    color: colors.primary,
  },
  customContainer: {
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  customInputGroup: {
    alignItems: 'center',
  },
  customInput: {
    width: 80,
    fontSize: fontSize.xxl,
    fontWeight: '600',
    color: colors.text,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    textAlign: 'center',
  },
  customInputLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
  customSeparator: {
    fontSize: fontSize.xxl,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  customConfirmButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  customConfirmText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.white,
  },
});
