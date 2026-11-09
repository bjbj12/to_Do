import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { DEMO_PASSWORD, DEMO_USERNAME, useAuth } from '@/auth';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // On success the protected-route guard flips and navigates to the todo list.
  const submit = () => {
    if (!signIn(username, password)) setError('Invalid username or password');
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Todo App</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <TextInput
          value={username}
          onChangeText={(v) => {
            setUsername(v);
            setError(null);
          }}
          placeholder="Username"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
          testID="username"
        />
        <TextInput
          value={password}
          onChangeText={(v) => {
            setPassword(v);
            setError(null);
          }}
          placeholder="Password"
          secureTextEntry
          onSubmitEditing={submit}
          style={styles.input}
          testID="password"
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable accessibilityRole="button" onPress={submit} style={styles.button}>
          <Text style={styles.buttonText}>Sign in</Text>
        </Pressable>

        <Text style={styles.hint}>
          Demo: {DEMO_USERNAME} / {DEMO_PASSWORD}
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f1f5f9' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    gap: 12,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  subtitle: { color: '#64748b', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  error: { color: '#dc2626' },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  hint: { color: '#94a3b8', fontSize: 12, textAlign: 'center', marginTop: 4 },
});
