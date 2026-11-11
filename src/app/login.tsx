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

import { useAuth } from '@/auth';

export default function LoginScreen() {
  const { signIn, signUp, error: sessionError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      if (isSignUp) {
        const signedIn = await signUp(email, password);
        if (!signedIn) {
          setMessage('Check your email to confirm your account, then sign in.');
        }
      } else {
        await signIn(email, password);
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Unable to authenticate with Supabase.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Todo App</Text>
        <Text style={styles.subtitle}>
          {isSignUp ? 'Create an account to sync your todos' : 'Sign in to sync your todos'}
        </Text>

        <TextInput
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            setError(null);
            setMessage(null);
          }}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          style={styles.input}
          testID="email"
        />
        <TextInput
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            setError(null);
            setMessage(null);
          }}
          placeholder="Password"
          secureTextEntry
          autoCapitalize="none"
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          textContentType={isSignUp ? 'newPassword' : 'password'}
          onSubmitEditing={() => void submit()}
          returnKeyType="done"
          style={styles.input}
          testID="password"
        />

        {error || sessionError ? (
          <Text style={styles.error}>{error ?? sessionError}</Text>
        ) : null}
        {message ? <Text style={styles.message}>{message}</Text> : null}

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: isSubmitting }}
          disabled={isSubmitting}
          onPress={() => void submit()}
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          disabled={isSubmitting}
          onPress={() => {
            setIsSignUp((current) => !current);
            setError(null);
            setMessage(null);
          }}
        >
          <Text style={styles.switchMode}>
            {isSignUp ? 'Already have an account? Sign in' : 'New here? Create an account'}
          </Text>
        </Pressable>
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
  message: { color: '#166534' },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  switchMode: { color: '#2563eb', fontWeight: '600', textAlign: 'center', paddingVertical: 8 },
});
