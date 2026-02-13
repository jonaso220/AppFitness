import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../theme';

// Detect if already running as installed PWA
function isStandalone() {
  if (Platform.OS !== 'web') return true;
  return (
    window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
  );
}

// Detect iOS Safari (not standalone = not yet installed)
function isIOSSafari() {
  if (Platform.OS !== 'web') return false;
  const ua = navigator.userAgent || '';
  const isIOS = /iPhone|iPad|iPod/.test(ua);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS/.test(ua);
  return isIOS && isSafari && !isStandalone();
}

// ---------- iOS Install Banner ----------
function InstallBanner() {
  const [visible, setVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(200)).current;

  useEffect(() => {
    if (!isIOSSafari()) return;

    // Don't show if dismissed recently (24h)
    const dismissed = localStorage.getItem('pwa_install_dismissed');
    if (dismissed && Date.now() - Number(dismissed) < 86400000) return;

    // Small delay before showing
    const timer = setTimeout(() => {
      setVisible(true);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 60,
        friction: 12,
      }).start();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    localStorage.setItem('pwa_install_dismissed', String(Date.now()));
    Animated.timing(slideAnim, {
      toValue: 200,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.banner, { transform: [{ translateY: slideAnim }] }]}
    >
      <View style={styles.bannerContent}>
        <View style={styles.bannerIcon}>
          <Ionicons name="download-outline" size={24} color={colors.primary} />
        </View>
        <View style={styles.bannerTextContainer}>
          <Text style={styles.bannerTitle}>Instalar AppFitness</Text>
          <Text style={styles.bannerDesc}>
            Pulsa{' '}
            <Ionicons name="share-outline" size={13} color={colors.primaryLight} />{' '}
            y luego "Añadir a pantalla de inicio"
          </Text>
        </View>
        <TouchableOpacity onPress={dismiss} style={styles.bannerClose}>
          <Ionicons name="close" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
      {/* Arrow pointing down to share button */}
      <View style={styles.bannerArrow} />
    </Animated.View>
  );
}

// ---------- Chrome/Android Install Banner (beforeinstallprompt) ----------
function ChromeInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(200)).current;

  useEffect(() => {
    if (Platform.OS !== 'web' || isStandalone()) return;

    // Don't show if dismissed recently (24h)
    const dismissed = localStorage.getItem('pwa_chrome_install_dismissed');
    if (dismissed && Date.now() - Number(dismissed) < 86400000) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 60,
        friction: 12,
      }).start();
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    dismiss(outcome !== 'accepted');
  };

  const dismiss = (save = true) => {
    if (save) {
      localStorage.setItem('pwa_chrome_install_dismissed', String(Date.now()));
    }
    Animated.timing(slideAnim, {
      toValue: 200,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.banner, { transform: [{ translateY: slideAnim }] }]}
    >
      <View style={styles.bannerContent}>
        <View style={styles.bannerIcon}>
          <Ionicons name="download-outline" size={24} color={colors.primary} />
        </View>
        <View style={styles.bannerTextContainer}>
          <Text style={styles.bannerTitle}>Instalar AppFitness</Text>
          <Text style={styles.bannerDesc}>
            Añade la app a tu pantalla de inicio para acceso rápido
          </Text>
        </View>
        <TouchableOpacity onPress={() => dismiss(true)} style={styles.bannerClose}>
          <Ionicons name="close" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={handleInstall} style={styles.installButton}>
        <Ionicons name="add-circle-outline" size={18} color={colors.white} />
        <Text style={styles.installButtonText}>Instalar</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ---------- Update Banner ----------
function UpdateBanner() {
  const [waitingWorker, setWaitingWorker] = useState(null);
  const [visible, setVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (Platform.OS !== 'web' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('/sw.js').then((registration) => {
      // Check for updates periodically (every 5 min)
      const interval = setInterval(() => {
        registration.update();
      }, 5 * 60 * 1000);

      // A new SW is waiting
      if (registration.waiting) {
        showUpdate(registration.waiting);
      }

      // A new SW was just installed
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (
            newWorker.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            showUpdate(newWorker);
          }
        });
      });

      // When the new SW takes over, reload
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });

      return () => clearInterval(interval);
    });
  }, []);

  const showUpdate = (worker) => {
    setWaitingWorker(worker);
    setVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 60,
      friction: 12,
    }).start();
  };

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  const dismiss = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.updateBanner,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.updateContent}>
        <Ionicons name="refresh-circle" size={24} color={colors.accent} />
        <Text style={styles.updateText}>Nueva versión disponible</Text>
      </View>
      <View style={styles.updateActions}>
        <TouchableOpacity onPress={dismiss} style={styles.updateDismiss}>
          <Text style={styles.updateDismissText}>Luego</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleUpdate} style={styles.updateButton}>
          <Text style={styles.updateButtonText}>Actualizar</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// ---------- Combined Export ----------
export default function PWAPrompts() {
  if (Platform.OS !== 'web') return null;

  return (
    <>
      <UpdateBanner />
      <InstallBanner />
      <ChromeInstallBanner />
    </>
  );
}

const styles = StyleSheet.create({
  // Install banner (bottom)
  banner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + '40',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  bannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  bannerDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  bannerClose: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  bannerArrow: {
    width: 0,
    height: 0,
    alignSelf: 'center',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.surface,
  },
  installButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
    alignSelf: 'center',
    gap: spacing.xs,
  },
  installButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.white,
  },
  // Update banner (top)
  updateBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.accent + '40',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  updateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  updateText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  updateActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  updateDismiss: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  updateDismissText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  updateButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  updateButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.background,
  },
});
