import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '@/auth';
import { StatusBadge, StatusPicker } from '@/components/status';
import { confirmDestructive, showError } from '@/confirm';
import { STATUSES, STATUS_LABELS, useTodos, type TodoStatus } from '@/todos';

export default function TodoListScreen() {
  const { user, signOut, updateDisplayName } = useAuth();
  const { todos, error, refreshTodos, updateTodo, deleteTodo } = useTodos();
  const [filter, setFilter] = useState<TodoStatus | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const visible = filter ? todos.filter((t) => t.status === filter) : todos;
  const metadataName = user?.user_metadata.display_name ?? user?.user_metadata.name;
  const displayName =
    typeof metadataName === 'string' && metadataName.trim()
      ? metadataName
      : (user?.email ?? 'there');

  const saveDisplayName = async () => {
    const name = displayNameInput.trim();
    if (!name || isSavingName) return;

    setIsSavingName(true);
    setNameError(null);
    try {
      await updateDisplayName(name);
      setIsEditingName(false);
    } catch (saveError) {
      setNameError(
        saveError instanceof Error ? saveError.message : 'Unable to update your display name.',
      );
    } finally {
      setIsSavingName(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              onPress={() => void signOut().catch(showError)}
              hitSlop={8}
            >
              <Text style={styles.headerAction}>Log out</Text>
            </Pressable>
          ),
        }}
      />

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>Could not load todos: {error}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => void refreshTodos().catch(showError)}
          >
            <Text style={styles.retry}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.toolbar}>
        <View style={styles.greetingRow}>
          <Text style={styles.greeting}>Hi, {displayName}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setDisplayNameInput(displayName === 'there' ? '' : displayName);
              setNameError(null);
              setIsEditingName(true);
            }}
            hitSlop={8}
          >
            <Text style={styles.editName}>Edit name</Text>
          </Pressable>
        </View>
        {isEditingName ? (
          <View style={styles.nameEditor}>
            <TextInput
              accessibilityLabel="Display name"
              value={displayNameInput}
              onChangeText={(value) => {
                setDisplayNameInput(value);
                setNameError(null);
              }}
              placeholder="Display name"
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={60}
              returnKeyType="done"
              onSubmitEditing={() => void saveDisplayName()}
              style={styles.nameInput}
              editable={!isSavingName}
            />
            {nameError ? <Text style={styles.nameError}>{nameError}</Text> : null}
            <View style={styles.nameActions}>
              <Pressable
                accessibilityRole="button"
                disabled={isSavingName}
                onPress={() => setIsEditingName(false)}
              >
                <Text style={styles.cancelName}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: isSavingName || !displayNameInput.trim() }}
                disabled={isSavingName || !displayNameInput.trim()}
                onPress={() => void saveDisplayName()}
              >
                <Text
                  style={[
                    styles.saveName,
                    (isSavingName || !displayNameInput.trim()) && styles.disabledSaveName,
                  ]}
                >
                  {isSavingName ? 'Saving...' : 'Save name'}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}
        <StatusPicker
          value={filter}
          onChange={(s) => setFilter((current) => (current === s ? null : s))}
        />
      </View>

      <FlatList
        data={visible}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {filter ? 'No todos with this status.' : 'No todos yet. Tap + to add one.'}
          </Text>
        }
        renderItem={({ item }) => {
          const next = STATUSES[(STATUSES.indexOf(item.status) + 1) % STATUSES.length];
          return (
            <Pressable
              style={styles.item}
              onPress={() => router.push({ pathname: '/todo/[id]', params: { id: item.id } })}
            >
              <View style={styles.itemBody}>
                <Text
                  style={[styles.itemTitle, item.status === 'done' && styles.itemDone]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                {item.description ? (
                  <Text style={styles.itemDescription} numberOfLines={1}>
                    {item.description}
                  </Text>
                ) : null}
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Change status to ${STATUS_LABELS[next]}`}
                onPress={() => void updateTodo(item.id, { status: next }).catch(showError)}
                hitSlop={6}
              >
                <StatusBadge status={item.status} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Delete todo"
                onPress={() =>
                  confirmDestructive('Delete todo?', item.title, () => {
                    void deleteTodo(item.id).catch(showError);
                  })
                }
                hitSlop={6}
              >
                <Text style={styles.delete}>✕</Text>
              </Pressable>
            </Pressable>
          );
        }}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add todo"
        onPress={() => router.push('/todo/new')}
        style={styles.fab}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headerAction: { color: '#2563eb', fontWeight: '600', paddingHorizontal: 8 },
  toolbar: { padding: 16, gap: 12 },
  greetingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greeting: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  editName: { color: '#2563eb', fontWeight: '600', paddingVertical: 4 },
  nameEditor: { gap: 8 },
  nameInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
  },
  nameError: { color: '#dc2626' },
  nameActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 20 },
  cancelName: { color: '#475569', fontWeight: '600', paddingVertical: 6 },
  saveName: { color: '#2563eb', fontWeight: '700', paddingVertical: 6 },
  disabledSaveName: { opacity: 0.5 },
  list: { paddingHorizontal: 16, paddingBottom: 96, gap: 8 },
  empty: { textAlign: 'center', color: '#64748b', marginTop: 48 },
  errorBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
    gap: 8,
  },
  errorText: { color: '#991b1b' },
  retry: { color: '#1d4ed8', fontWeight: '700' },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
  },
  itemBody: { flex: 1, gap: 2 },
  itemTitle: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  itemDone: { textDecorationLine: 'line-through', color: '#94a3b8' },
  itemDescription: { color: '#64748b' },
  delete: { color: '#dc2626', fontSize: 16, fontWeight: '700', paddingHorizontal: 4 },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  fabText: { color: '#fff', fontSize: 30, lineHeight: 32 },
});
