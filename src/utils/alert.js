import { Alert, Platform } from 'react-native';

/**
 * Cross-platform alert that works on web (window.confirm/alert) and native (Alert.alert).
 */
export function webAlert(title, message, buttons) {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons);
    return;
  }

  // Simple message alert (no buttons or single OK button)
  if (!buttons || buttons.length <= 1) {
    window.alert(message ? `${title}\n\n${message}` : title);
    if (buttons && buttons[0] && buttons[0].onPress) {
      buttons[0].onPress();
    }
    return;
  }

  // Two buttons: cancel + action → use window.confirm
  const cancelBtn = buttons.find((b) => b.style === 'cancel');
  const actionBtn = buttons.find((b) => b.style !== 'cancel') || buttons[1];

  const confirmed = window.confirm(message ? `${title}\n\n${message}` : title);
  if (confirmed) {
    if (actionBtn && actionBtn.onPress) actionBtn.onPress();
  } else {
    if (cancelBtn && cancelBtn.onPress) cancelBtn.onPress();
  }
}
