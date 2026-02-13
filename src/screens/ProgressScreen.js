import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Keyboard,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, borderRadius, fontSize } from '../theme';
import { useProgress } from '../context/ProgressContext';
import { webAlert } from '../utils/alert';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_HEIGHT = 160;
const CHART_PADDING = 32;

// ─── Mini line chart (pure RN) ───
function MiniChart({ data, label, unit, color }) {
  if (data.length < 2) return null;

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const chartWidth = SCREEN_WIDTH - spacing.md * 2 - CHART_PADDING * 2;
  const step = chartWidth / (data.length - 1);

  const latest = values[values.length - 1];
  const first = values[0];
  const diff = latest - first;
  const diffStr = diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartLabel}>{label}</Text>
        <View style={styles.chartStats}>
          <Text style={[styles.chartValue, { color }]}>{latest} {unit}</Text>
          {data.length >= 2 && (
            <Text style={[styles.chartDiff, { color: diff <= 0 ? colors.success : colors.warning }]}>
              {diffStr} {unit}
            </Text>
          )}
        </View>
      </View>
      <View style={[styles.chartArea, { height: CHART_HEIGHT }]}>
        {/* Grid lines */}
        {[0, 0.5, 1].map((frac) => (
          <View
            key={frac}
            style={[styles.gridLine, { top: CHART_HEIGHT * (1 - frac) }]}
          />
        ))}
        {/* Data points and connecting lines */}
        {data.map((d, i) => {
          const x = CHART_PADDING + i * step;
          const y = CHART_HEIGHT - ((d.value - min) / range) * (CHART_HEIGHT - 20) - 10;
          return (
            <React.Fragment key={d.date}>
              <View
                style={[styles.dataPoint, { left: x - 4, top: y - 4, backgroundColor: color }]}
              />
              {i < data.length - 1 && (() => {
                const x2 = CHART_PADDING + (i + 1) * step;
                const y2 = CHART_HEIGHT - ((data[i + 1].value - min) / range) * (CHART_HEIGHT - 20) - 10;
                const dx = x2 - x;
                const dy = y2 - y;
                const length = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                return (
                  <View
                    style={[
                      styles.chartLine,
                      {
                        left: x,
                        top: y,
                        width: length,
                        backgroundColor: color + '60',
                        transform: [{ rotate: `${angle}deg` }],
                      },
                    ]}
                  />
                );
              })()}
            </React.Fragment>
          );
        })}
        {/* X labels */}
        {data.map((d, i) => {
          const x = CHART_PADDING + i * step;
          return (
            <Text
              key={`label-${d.date}`}
              style={[styles.chartXLabel, { left: x - 14, top: CHART_HEIGHT - 2 }]}
            >
              {formatShortDate(d.date)}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

// ─── Photo gallery item ───
function PhotoItem({ uri, date, onDelete }) {
  return (
    <View style={styles.photoItem}>
      <Image source={{ uri }} style={styles.photoImage} />
      <View style={styles.photoOverlay}>
        <Text style={styles.photoDate}>{formatShortDate(date)}</Text>
        <TouchableOpacity
          onPress={() => webAlert('Eliminar foto', '¿Seguro?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Eliminar', style: 'destructive', onPress: onDelete },
          ])}
          style={styles.photoDeleteButton}
        >
          <Ionicons name="trash-outline" size={14} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Entry history row ───
function EntryRow({ entry, onDelete }) {
  return (
    <View style={styles.entryRow}>
      <View style={styles.entryDate}>
        <Text style={styles.entryDateText}>{formatFullDate(entry.date)}</Text>
      </View>
      <View style={styles.entryMetrics}>
        {entry.weight > 0 && (
          <View style={styles.entryMetric}>
            <Ionicons name="scale-outline" size={12} color={colors.accent} />
            <Text style={styles.entryMetricText}>{entry.weight} kg</Text>
          </View>
        )}
        {entry.waist > 0 && (
          <View style={styles.entryMetric}>
            <Text style={styles.entryMetricLabel}>Cintura</Text>
            <Text style={styles.entryMetricText}>{entry.waist} cm</Text>
          </View>
        )}
        {entry.chest > 0 && (
          <View style={styles.entryMetric}>
            <Text style={styles.entryMetricLabel}>Pecho</Text>
            <Text style={styles.entryMetricText}>{entry.chest} cm</Text>
          </View>
        )}
        {entry.hip > 0 && (
          <View style={styles.entryMetric}>
            <Text style={styles.entryMetricLabel}>Cadera</Text>
            <Text style={styles.entryMetricText}>{entry.hip} cm</Text>
          </View>
        )}
        {entry.photos && entry.photos.length > 0 && (
          <View style={styles.entryMetric}>
            <Ionicons name="camera-outline" size={12} color={colors.primary} />
            <Text style={styles.entryMetricText}>{entry.photos.length}</Text>
          </View>
        )}
      </View>
      <TouchableOpacity
        onPress={() => webAlert('Eliminar registro', '¿Eliminar este registro de progreso?', [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: () => onDelete(entry.id) },
        ])}
        style={styles.entryDeleteButton}
      >
        <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Main screen ───
export default function ProgressScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { entries, addEntry, deleteEntry } = useProgress();

  const [activeTab, setActiveTab] = useState(0); // 0=add, 1=charts, 2=photos, 3=history
  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [chest, setChest] = useState('');
  const [hip, setHip] = useState('');
  const [pendingPhotos, setPendingPhotos] = useState([]);

  const chartData = useMemo(() => {
    const sorted = [...entries].reverse();
    const weightData = sorted.filter((e) => e.weight > 0).map((e) => ({ date: e.date, value: e.weight }));
    const waistData = sorted.filter((e) => e.waist > 0).map((e) => ({ date: e.date, value: e.waist }));
    const chestData = sorted.filter((e) => e.chest > 0).map((e) => ({ date: e.date, value: e.chest }));
    const hipData = sorted.filter((e) => e.hip > 0).map((e) => ({ date: e.date, value: e.hip }));
    return { weightData, waistData, chestData, hipData };
  }, [entries]);

  const allPhotos = useMemo(() => {
    const photos = [];
    for (const entry of entries) {
      if (entry.photos && entry.photos.length > 0) {
        for (const uri of entry.photos) {
          photos.push({ uri, date: entry.date, entryId: entry.id });
        }
      }
    }
    return photos;
  }, [entries]);

  const handlePickPhoto = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets) {
      setPendingPhotos((prev) => [...prev, ...result.assets.map((a) => a.uri)]);
    }
  }, []);

  const handleTakePhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      webAlert('Permiso necesario', 'Necesitamos acceso a la cámara para tomar fotos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
    });
    if (!result.canceled && result.assets) {
      setPendingPhotos((prev) => [...prev, ...result.assets.map((a) => a.uri)]);
    }
  }, []);

  const handleSave = useCallback(async () => {
    const w = parseFloat(weight) || 0;
    const wa = parseFloat(waist) || 0;
    const ch = parseFloat(chest) || 0;
    const hi = parseFloat(hip) || 0;

    if (w === 0 && wa === 0 && ch === 0 && hi === 0 && pendingPhotos.length === 0) {
      webAlert('Sin datos', 'Introduce al menos un valor o añade una foto.');
      return;
    }

    const entry = {
      id: `p_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      weight: w,
      waist: wa,
      chest: ch,
      hip: hi,
      photos: pendingPhotos,
    };

    try {
      await addEntry(entry);
      setWeight('');
      setWaist('');
      setChest('');
      setHip('');
      setPendingPhotos([]);
      Keyboard.dismiss();
      webAlert('Guardado', 'Tu registro de progreso se ha guardado correctamente.');
    } catch {
      webAlert('Error', 'No se pudo guardar el registro. Inténtalo de nuevo.');
    }
  }, [weight, waist, chest, hip, pendingPhotos, addEntry]);

  const latestEntry = entries.length > 0 ? entries[0] : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Progreso</Text>
        <View style={styles.backButton} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {['Registrar', 'Gráficas', 'Fotos', 'Historial'].map((tab, i) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === i && styles.tabActive]}
            onPress={() => setActiveTab(i)}
          >
            <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ─── TAB 0: Registrar ─── */}
        {activeTab === 0 && (
          <View>
            {/* Latest summary */}
            {latestEntry && (
              <View style={styles.latestSummary}>
                <Text style={styles.latestTitle}>Último registro</Text>
                <Text style={styles.latestDate}>{formatFullDate(latestEntry.date)}</Text>
                <View style={styles.latestMetrics}>
                  {latestEntry.weight > 0 && (
                    <View style={styles.latestMetric}>
                      <Text style={styles.latestMetricValue}>{latestEntry.weight}</Text>
                      <Text style={styles.latestMetricUnit}>kg</Text>
                    </View>
                  )}
                  {latestEntry.waist > 0 && (
                    <View style={styles.latestMetric}>
                      <Text style={styles.latestMetricValue}>{latestEntry.waist}</Text>
                      <Text style={styles.latestMetricUnit}>cm cintura</Text>
                    </View>
                  )}
                  {latestEntry.chest > 0 && (
                    <View style={styles.latestMetric}>
                      <Text style={styles.latestMetricValue}>{latestEntry.chest}</Text>
                      <Text style={styles.latestMetricUnit}>cm pecho</Text>
                    </View>
                  )}
                  {latestEntry.hip > 0 && (
                    <View style={styles.latestMetric}>
                      <Text style={styles.latestMetricValue}>{latestEntry.hip}</Text>
                      <Text style={styles.latestMetricUnit}>cm cadera</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Form */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Nuevo registro</Text>

              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <View style={styles.inputLabelRow}>
                    <Ionicons name="scale-outline" size={14} color={colors.accent} />
                    <Text style={styles.inputLabel}>Peso (kg)</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="decimal-pad"
                    placeholder="0.0"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <View style={styles.inputLabelRow}>
                    <Ionicons name="resize-outline" size={14} color={colors.warning} />
                    <Text style={styles.inputLabel}>Cintura (cm)</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={waist}
                    onChangeText={setWaist}
                    keyboardType="decimal-pad"
                    placeholder="0.0"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <View style={styles.inputLabelRow}>
                    <Ionicons name="body-outline" size={14} color={colors.primary} />
                    <Text style={styles.inputLabel}>Pecho (cm)</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={chest}
                    onChangeText={setChest}
                    keyboardType="decimal-pad"
                    placeholder="0.0"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <View style={styles.inputLabelRow}>
                    <Ionicons name="ellipse-outline" size={14} color={colors.danger} />
                    <Text style={styles.inputLabel}>Cadera (cm)</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={hip}
                    onChangeText={setHip}
                    keyboardType="decimal-pad"
                    placeholder="0.0"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>

              {/* Photo add */}
              <View style={styles.photoSection}>
                <Text style={styles.photoSectionTitle}>Fotos de progreso</Text>
                <View style={styles.photoButtons}>
                  <TouchableOpacity style={styles.photoButton} onPress={handlePickPhoto}>
                    <Ionicons name="images-outline" size={18} color={colors.primary} />
                    <Text style={styles.photoButtonText}>Galería</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
                    <Ionicons name="camera-outline" size={18} color={colors.primary} />
                    <Text style={styles.photoButtonText}>Cámara</Text>
                  </TouchableOpacity>
                </View>
                {pendingPhotos.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pendingPhotos}>
                    {pendingPhotos.map((uri, i) => (
                      <View key={uri} style={styles.pendingPhotoItem}>
                        <Image source={{ uri }} style={styles.pendingPhotoImage} />
                        <TouchableOpacity
                          style={styles.pendingPhotoRemove}
                          onPress={() => setPendingPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                        >
                          <Ionicons name="close-circle" size={20} color={colors.danger} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>

              {/* Save */}
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Ionicons name="checkmark" size={20} color={colors.white} />
                <Text style={styles.saveButtonText}>Guardar registro</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ─── TAB 1: Gráficas ─── */}
        {activeTab === 1 && (
          <View>
            {entries.length < 2 ? (
              <View style={styles.emptyState}>
                <Ionicons name="analytics-outline" size={56} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>Necesitas al menos 2 registros</Text>
                <Text style={styles.emptySubtitle}>Añade registros para ver tu evolución</Text>
              </View>
            ) : (
              <View>
                <MiniChart data={chartData.weightData} label="Peso corporal" unit="kg" color={colors.accent} />
                <MiniChart data={chartData.waistData} label="Cintura" unit="cm" color={colors.warning} />
                <MiniChart data={chartData.chestData} label="Pecho" unit="cm" color={colors.primary} />
                <MiniChart data={chartData.hipData} label="Cadera" unit="cm" color={colors.danger} />
              </View>
            )}
          </View>
        )}

        {/* ─── TAB 2: Fotos ─── */}
        {activeTab === 2 && (
          <View>
            {allPhotos.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="camera-outline" size={56} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>Sin fotos de progreso</Text>
                <Text style={styles.emptySubtitle}>Añade fotos al registrar tu progreso</Text>
              </View>
            ) : (
              <View style={styles.photoGrid}>
                {allPhotos.map((photo, i) => (
                  <PhotoItem
                    key={`${photo.entryId}_${i}`}
                    uri={photo.uri}
                    date={photo.date}
                    onDelete={() => {
                      // Remove photo from the entry
                      const entry = entries.find((e) => e.id === photo.entryId);
                      if (entry) {
                        const updatedPhotos = entry.photos.filter((u) => u !== photo.uri);
                        if (updatedPhotos.length === 0 && entry.weight === 0 && entry.waist === 0 && entry.chest === 0 && entry.hip === 0) {
                          deleteEntry(entry.id);
                        } else {
                          deleteEntry(entry.id);
                          addEntry({ ...entry, photos: updatedPhotos });
                        }
                      }
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* ─── TAB 3: Historial ─── */}
        {activeTab === 3 && (
          <View>
            {entries.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={56} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>Sin registros</Text>
                <Text style={styles.emptySubtitle}>Añade tu primer registro de progreso</Text>
              </View>
            ) : (
              entries.map((entry) => (
                <EntryRow key={entry.id} entry={entry} onDelete={deleteEntry} />
              ))
            )}
          </View>
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

function formatShortDate(dateString) {
  const d = new Date(dateString + 'T12:00:00');
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function formatFullDate(dateString) {
  const d = new Date(dateString + 'T12:00:00');
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  // Tabs
  tabs: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  tabActive: {
    backgroundColor: colors.primary + '25',
  },
  tabText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.primary,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
  },
  // Latest summary
  latestSummary: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  latestTitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  latestDate: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  latestMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  latestMetric: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  latestMetricValue: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  latestMetricUnit: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  // Form
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  inputLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  // Photo section
  photoSection: {
    marginBottom: spacing.md,
  },
  photoSectionTitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary + '15',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  photoButtonText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  pendingPhotos: {
    marginTop: spacing.sm,
  },
  pendingPhotoItem: {
    marginRight: spacing.sm,
    position: 'relative',
  },
  pendingPhotoImage: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.sm,
  },
  pendingPhotoRemove: {
    position: 'absolute',
    top: -6,
    right: -6,
  },
  // Save button
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
  },
  saveButtonText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.white,
  },
  // Charts
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  chartLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  chartStats: {
    alignItems: 'flex-end',
  },
  chartValue: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  chartDiff: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginTop: 2,
  },
  chartArea: {
    position: 'relative',
    overflow: 'visible',
    marginBottom: spacing.md,
  },
  gridLine: {
    position: 'absolute',
    left: CHART_PADDING,
    right: CHART_PADDING,
    height: 1,
    backgroundColor: colors.border,
  },
  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chartLine: {
    position: 'absolute',
    height: 2,
    transformOrigin: 'left center',
  },
  chartXLabel: {
    position: 'absolute',
    fontSize: 9,
    color: colors.textMuted,
    width: 28,
    textAlign: 'center',
  },
  // Photos grid
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  photoItem: {
    width: (SCREEN_WIDTH - spacing.md * 2 - spacing.sm * 2) / 3,
    aspectRatio: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  photoDate: {
    fontSize: 9,
    color: colors.white,
    fontWeight: '500',
  },
  photoDeleteButton: {
    padding: 2,
  },
  // Entry row
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  entryDate: {
    marginRight: spacing.md,
  },
  entryDateText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '600',
    width: 80,
  },
  entryMetrics: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  entryMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  entryMetricLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  entryMetricText: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '500',
  },
  entryDeleteButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing.xxl * 2,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  emptySubtitle: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
