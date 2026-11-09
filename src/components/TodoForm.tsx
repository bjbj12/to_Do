import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';

import { StatusPicker } from '@/components/status';
import type { TodoInput } from '@/todos';

type Props = {
  initial?: TodoInput;
  submitLabel: string;
  onSubmit: (input: TodoInput) => void;
};

export function TodoForm({ initial, submitLabel, onSubmit }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [status, setStatus] = useState(initial?.status ?? 'todo');

  const canSubmit = title.trim().length > 0;

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Title</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="What needs to be done?"
        style={styles.input}
        autoFocus
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Optional details"
        style={[styles.input, styles.multiline]}
        multiline
      />

      <Text style={styles.label}>Status</Text>
      <StatusPicker value={status} onChange={setStatus} />

      <Pressable
        accessibilityRole="button"
        disabled={!canSubmit}
        onPress={() => onSubmit({ title: title.trim(), description: description.trim(), status })}
        style={[styles.button, !canSubmit && styles.buttonDisabled]}
      >
        <Text style={styles.buttonText}>{submitLabel}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
  label: { fontWeight: '600', marginTop: 8, color: '#334155' },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  button: {
    marginTop: 24,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
