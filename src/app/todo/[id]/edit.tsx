import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { TodoForm } from '@/components/TodoForm';
import { useTodos } from '@/todos';

export default function EditTodoScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const { getTodo, updateTodo } = useTodos();
  const todoId = Array.isArray(id) ? id[0] : id;
  const todo = getTodo(todoId);

  if (!todoId || !todo) return <Text style={styles.missing}>Todo not found.</Text>;

  return (
    <TodoForm
      key={todo.id}
      initial={todo}
      submitLabel="Save changes"
      onSubmit={async (input) => {
        await updateTodo(todo.id, input);
        router.back();
      }}
    />
  );
}

const styles = StyleSheet.create({
  missing: { padding: 24, textAlign: 'center', color: '#64748b' },
});
