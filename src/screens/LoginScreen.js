import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../theme';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { signInWithGoogle } = useAuth();
  const [signingIn, setSigningIn] = useState(false);

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch {
      setSigningIn(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="barbell" size={64} color={colors.primary} />
        </View>

        <Text style={styles.title}>AppFitness</Text>
        <Text style={styles.subtitle}>
          Tu entrenador personal{'\n'}Registra tus entrenamientos y sigue tu progreso
        </Text>

        <View style={styles.features}>
          {[
            { icon: 'fitness-outline', text: 'Registra entrenamientos' },
            { icon: 'analytics-outline', text: 'Sigue tu progreso' },
            { icon: 'people-outline', text: 'Sincroniza entre dispositivos' },
          ].map((f) => (
            <View key={f.text} style={styles.featureRow}>
              <Ionicons name={f.icon} size={20} color={colors.accent} />
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.googleButton, signingIn && styles.googleButtonDisabled]}
          onPress={handleSignIn}
          activeOpacity={0.8}
          disabled={signingIn}
        >
          {signingIn ? (
            <ActivityIndicator color={colors.text} size="small" />
          ) : (
            <>
              <Ionicons name="logo-google" size={22} color="#FFFFFF" />
              <Text style={styles.googleButtonText}>Continuar con Google</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Tus datos se guardan de forma segura en la nube
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.hero,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  features: {
    alignSelf: 'stretch',
    gap: spacing.md,
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureText: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    alignSelf: 'stretch',
    height: 56,
  },
  googleButtonDisabled: {
    opacity: 0.7,
  },
  googleButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.white,
  },
  disclaimer: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
});
