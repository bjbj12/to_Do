import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, use, useEffect, useState, type PropsWithChildren } from 'react';

export const STATUSES = ['todo', 'in_progress', 'done'] as const;
export type TodoStatus = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<TodoStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  done: 'Done',
};

export const STATUS_COLORS: Record<TodoStatus, string> = {
  todo: '#64748b',
  in_progress: '#d97706',
  done: '#16a34a',
};

export type Todo = {
  id: string;
  title: string;
  description: string;
  status: TodoStatus;
  createdAt: number;
  updatedAt: number;
};

export type TodoInput = Pick<Todo, 'title' | 'description' | 'status'>;

const STORAGE_KEY = 'todos';

type TodoContextValue = {
  todos: Todo[];
  isLoading: boolean;
  getTodo: (id: string) => Todo | undefined;
  createTodo: (input: TodoInput) => Todo;
  updateTodo: (id: string, patch: Partial<TodoInput>) => void;
  deleteTodo: (id: string) => void;
};

const TodoContext = createContext<TodoContextValue | null>(null);

export function TodoProvider({ children }: PropsWithChildren) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setTodos(JSON.parse(raw) as Todo[]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    // Skip until hydrated so the initial empty state never overwrites saved data.
    if (isLoading) return;
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos, isLoading]);

  const getTodo = (id: string) => todos.find((t) => t.id === id);

  const createTodo = (input: TodoInput) => {
    const now = Date.now();
    const id = `${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const todo: Todo = { ...input, id, createdAt: now, updatedAt: now };
    setTodos((prev) => [todo, ...prev]);
    return todo;
  };

  const updateTodo = (id: string, patch: Partial<TodoInput>) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: Date.now() } : t)),
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <TodoContext value={{ todos, isLoading, getTodo, createTodo, updateTodo, deleteTodo }}>
      {children}
    </TodoContext>
  );
}

export function useTodos() {
  const ctx = use(TodoContext);
  if (!ctx) throw new Error('useTodos must be used inside <TodoProvider>');
  return ctx;
}
