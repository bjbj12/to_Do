import { Alert, Platform } from 'react-native';

// Alert.alert buttons are a no-op on web, so fall back to window.confirm there.
export function confirmDestructive(title: string, message: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: onConfirm },
  ]);
}

export function showError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Something went wrong.';
  if (Platform.OS === 'web') {
    window.alert(message);
    return;
  }
  Alert.alert('Something went wrong', message);
}
