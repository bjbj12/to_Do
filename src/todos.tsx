import { createContext, use, useEffect, useRef, useState, type PropsWithChildren } from 'react';

import { useAuth } from '@/auth';
import { supabase, type TodoRow } from '../utils/supabase';

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

type TodoContextValue = {
  todos: Todo[];
  isLoading: boolean;
  error: string | null;
  refreshTodos: () => Promise<void>;
  getTodo: (id?: string) => Todo | undefined;
  createTodo: (input: TodoInput) => Promise<Todo>;
  updateTodo: (id: string, patch: Partial<TodoInput>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
};

type TodoLoadState = {
  userId: string | null;
  status: 'loading' | 'ready' | 'error';
  todos: Todo[];
  error: string | null;
};

const TodoContext = createContext<TodoContextValue | null>(null);

function mapTodo(row: TodoRow): Todo {
  const status = STATUSES.find((candidate) => candidate === row.status);
  if (!status) throw new Error(`Supabase returned an unsupported todo status: ${row.status}`);

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status,
    createdAt: Date.parse(row.created_at),
    updatedAt: Date.parse(row.updated_at),
  };
}

async function loadTodosForUser(userId: string): Promise<Todo[]> {
  const { data, error } = await supabase
    .from('todos')
    .select('id, user_id, title, description, status, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(mapTodo);
}

export function TodoProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const activeUserId = useRef(userId);
  const [loadState, setLoadState] = useState<TodoLoadState>({
    userId: null,
    status: 'loading',
    todos: [],
    error: null,
  });
  const todos = loadState.userId === userId ? loadState.todos : [];
  const error = loadState.userId === userId ? loadState.error : null;
  const isLoading =
    userId !== null && (loadState.userId !== userId || loadState.status === 'loading');

  const refreshTodos = async () => {
    if (!userId) return;

    setLoadState((current) => ({
      userId,
      status: 'loading',
      todos: current.userId === userId ? current.todos : [],
      error: null,
    }));
    try {
      const loadedTodos = await loadTodosForUser(userId);
      if (activeUserId.current !== userId) return;
      setLoadState({ userId, status: 'ready', todos: loadedTodos, error: null });
    } catch (loadError) {
      if (activeUserId.current !== userId) return;
      const message =
        loadError instanceof Error ? loadError.message : 'Unable to load todos from Supabase.';
      setLoadState((current) => ({
        userId,
        status: 'error',
        todos: current.userId === userId ? current.todos : [],
        error: message,
      }));
      throw loadError;
    }
  };

  useEffect(() => {
    let active = true;
    activeUserId.current = userId;

    if (!userId) {
      return () => {
        active = false;
      };
    }

    loadTodosForUser(userId)
      .then((loadedTodos) => {
        if (!active) return;
        setLoadState({ userId, status: 'ready', todos: loadedTodos, error: null });
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        const message =
          loadError instanceof Error ? loadError.message : 'Unable to load todos from Supabase.';
        setLoadState((current) => ({
          userId,
          status: 'error',
          todos: current.userId === userId ? current.todos : [],
          error: message,
        }));
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const getTodo = (id?: string) => {
    if (!id || !id.trim()) return undefined;
    return todos.find((todo) => todo.id === id);
  };

  const createTodo = async (input: TodoInput) => {
    if (!user) throw new Error('You must be signed in to create a todo.');

    const { data, error: insertError } = await supabase
      .from('todos')
      .insert({ ...input, user_id: user.id })
      .select('id, user_id, title, description, status, created_at, updated_at')
      .single();

    if (insertError) throw insertError;

    const todo = mapTodo(data);
    setLoadState((current) =>
      current.userId === user.id ? { ...current, todos: [todo, ...current.todos] } : current,
    );
    return todo;
  };

  const updateTodo = async (id: string, patch: Partial<TodoInput>) => {
    if (!user) throw new Error('You must be signed in to update a todo.');
    if (!id) throw new Error('A todo ID is required.');

    const { data, error: updateError } = await supabase
      .from('todos')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, user_id, title, description, status, created_at, updated_at')
      .maybeSingle();

    if (updateError) throw updateError;
    if (!data) throw new Error('Todo not found or you do not have permission to update it.');

    const todo = mapTodo(data);
    setLoadState((current) =>
      current.userId === user?.id
        ? { ...current, todos: current.todos.map((item) => (item.id === id ? todo : item)) }
        : current,
    );
  };

  const deleteTodo = async (id: string) => {
    if (!user) throw new Error('You must be signed in to delete a todo.');
    if (!id) throw new Error('A todo ID is required.');

    const { data, error: deleteError } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
      .select('id')
      .maybeSingle();

    if (deleteError) throw deleteError;
    if (!data) throw new Error('Todo not found or you do not have permission to delete it.');

    setLoadState((current) =>
      current.userId === user?.id
        ? { ...current, todos: current.todos.filter((todo) => todo.id !== id) }
        : current,
    );
  };

  return (
    <TodoContext
      value={{
        todos,
        isLoading,
        error,
        refreshTodos,
        getTodo,
        createTodo,
        updateTodo,
        deleteTodo,
      }}
    >
      {children}
    </TodoContext>
  );
}

export function useTodos() {
  const ctx = use(TodoContext);
  if (!ctx) throw new Error('useTodos must be used inside <TodoProvider>');
  return ctx;
}
